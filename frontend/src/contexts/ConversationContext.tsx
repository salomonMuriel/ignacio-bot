"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { 
  Conversation, 
  ConversationWithMessages, 
  MessageWithAttachments,
  ConversationCreate,
  ConversationUpdate,
  ChatMessage,
  MessageType,
} from '@/types';
import { api } from '@/services/api';
import { useAuth } from './AuthContext';
import { useProjects } from './ProjectContext';

interface ConversationState {
  conversations: Conversation[];
  activeConversation: ConversationWithMessages | null;
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  isTyping: boolean;
}

interface ConversationContextType extends ConversationState {
  setActiveConversation: (conversation: Conversation | null) => Promise<void>;
  createConversation: (data: Partial<ConversationCreate>) => Promise<Conversation>;
  updateConversation: (conversationId: string, data: ConversationUpdate) => Promise<Conversation>;
  deleteConversation: (conversationId: string) => Promise<void>;
  sendMessage: (content: string, files?: File[]) => Promise<void>;
  refreshConversations: () => Promise<void>;
  refreshMessages: () => Promise<void>;
  getConversationById: (conversationId: string) => Conversation | undefined;
  startNewConversation: (projectId?: string, title?: string) => Promise<Conversation>;
}

const ConversationContext = createContext<ConversationContextType | null>(null);

interface ConversationProviderProps {
  children: ReactNode;
}

export function ConversationProvider({ children }: ConversationProviderProps) {
  const { user, isAuthenticated } = useAuth();
  const { activeProject } = useProjects();
  
  const [state, setState] = useState<ConversationState>({
    conversations: [],
    activeConversation: null,
    messages: [],
    isLoading: false,
    error: null,
    isTyping: false,
  });

  const setActiveConversation = useCallback(async (conversation: Conversation | null): Promise<void> => {
    if (!conversation) {
      setState(prev => ({ 
        ...prev, 
        activeConversation: null, 
        messages: [],
      }));
      localStorage.removeItem('activeConversationId');
      return;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const conversationWithMessages = await api.conversations.get(conversation.id);
      
      // Convert backend messages to ChatMessage format
      const chatMessages: ChatMessage[] = conversationWithMessages.messages.map(msg => ({
        id: msg.id,
        content: msg.content,
        is_from_user: msg.is_from_user,
        message_type: msg.message_type,
        created_at: msg.created_at,
        attachments: (msg as MessageWithAttachments).attachment_files || [],
      }));

      setState(prev => ({
        ...prev,
        activeConversation: conversationWithMessages,
        messages: chatMessages,
        isLoading: false,
        error: null,
      }));

      localStorage.setItem('activeConversationId', conversation.id);
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load conversation',
      }));
    }
  }, []);

  const createConversation = useCallback(async (data: Partial<ConversationCreate>): Promise<Conversation> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const newConversation = await api.conversations.create({
        title: data.title,
        project_id: data.project_id || activeProject?.id,
        language_preference: 'es',
        ...data,
      });
      
      setState(prev => ({
        ...prev,
        conversations: [newConversation, ...prev.conversations],
        isLoading: false,
        error: null,
      }));
      
      return newConversation;
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to create conversation',
      }));
      throw error;
    }
  }, [activeProject]);

  const startNewConversation = useCallback(async (projectId?: string, title?: string): Promise<Conversation> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const newConversation = await api.conversations.start(
        projectId || activeProject?.id,
        title
      );
      
      setState(prev => ({
        ...prev,
        conversations: [newConversation, ...prev.conversations],
        isLoading: false,
        error: null,
      }));
      
      return newConversation;
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to start conversation',
      }));
      throw error;
    }
  }, [activeProject]);

  const updateConversation = useCallback(async (conversationId: string, data: ConversationUpdate): Promise<Conversation> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const updatedConversation = await api.conversations.update(conversationId, data);
      
      setState(prev => ({
        ...prev,
        conversations: prev.conversations.map(c => 
          c.id === conversationId ? updatedConversation : c
        ),
        activeConversation: prev.activeConversation?.id === conversationId 
          ? { ...prev.activeConversation, ...updatedConversation }
          : prev.activeConversation,
        isLoading: false,
        error: null,
      }));
      
      return updatedConversation;
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to update conversation',
      }));
      throw error;
    }
  }, []);

  const deleteConversation = useCallback(async (conversationId: string): Promise<void> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      await api.conversations.delete(conversationId);
      
      setState(prev => {
        const filteredConversations = prev.conversations.filter(c => c.id !== conversationId);
        const shouldClearActive = prev.activeConversation?.id === conversationId;
        
        return {
          ...prev,
          conversations: filteredConversations,
          activeConversation: shouldClearActive ? null : prev.activeConversation,
          messages: shouldClearActive ? [] : prev.messages,
          isLoading: false,
          error: null,
        };
      });
      
      // Clear from localStorage if it was active
      const activeConversationId = localStorage.getItem('activeConversationId');
      if (activeConversationId === conversationId) {
        localStorage.removeItem('activeConversationId');
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to delete conversation',
      }));
      throw error;
    }
  }, []);

  const sendMessage = useCallback(async (content: string, files?: File[]): Promise<void> => {
    if (!state.activeConversation) {
      throw new Error('No active conversation');
    }

    // Add optimistic message
    const optimisticMessage: ChatMessage = {
      id: `temp-${Date.now()}`,
      content,
      is_from_user: true,
      message_type: MessageType.TEXT,
      created_at: new Date().toISOString(),
      loading: true,
    };

    setState(prev => ({
      ...prev,
      messages: [...prev.messages, optimisticMessage],
      isTyping: true,
      error: null,
    }));

    try {
      const result = await api.messages.send(state.activeConversation.id, content, files);
      
      // Remove optimistic message and add actual messages
      setState(prev => {
        const messagesWithoutOptimistic = prev.messages.filter(m => m.id !== optimisticMessage.id);
        
        // Add user message
        const userMessage: ChatMessage = {
          id: `user-${Date.now()}`,
          content,
          is_from_user: true,
          message_type: MessageType.TEXT,
          created_at: new Date().toISOString(),
        };
        
        // Add AI response
        const aiMessage: ChatMessage = {
          id: `ai-${Date.now()}`,
          content: result.response_text,
          is_from_user: false,
          message_type: MessageType.TEXT,
          created_at: new Date().toISOString(),
        };
        
        return {
          ...prev,
          messages: [...messagesWithoutOptimistic, userMessage, aiMessage],
          isTyping: false,
          error: null,
        };
      });
    } catch (error) {
      // Remove optimistic message on error
      setState(prev => ({
        ...prev,
        messages: prev.messages.filter(m => m.id !== optimisticMessage.id),
        isTyping: false,
        error: error instanceof Error ? error.message : 'Failed to send message',
      }));
      throw error;
    }
  }, [state.activeConversation]);

  const refreshConversations = useCallback(async (): Promise<void> => {
    if (!user) return;
    
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const conversations = await api.conversations.list(user.id);
      setState(prev => ({
        ...prev,
        conversations,
        isLoading: false,
        error: null,
      }));
      
      // Restore active conversation from localStorage
      const activeConversationId = localStorage.getItem('activeConversationId');
      if (activeConversationId && conversations.length > 0) {
        const savedActiveConversation = conversations.find(c => c.id === activeConversationId);
        if (savedActiveConversation) {
          setActiveConversation(savedActiveConversation);
        } else {
          localStorage.removeItem('activeConversationId');
        }
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch conversations',
      }));
    }
  }, [user, setActiveConversation]);

  const refreshMessages = useCallback(async (): Promise<void> => {
    if (!state.activeConversation) return;
    
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const messages = await api.messages.list(state.activeConversation.id);
      const chatMessages: ChatMessage[] = messages.map(msg => ({
        id: msg.id,
        content: msg.content,
        is_from_user: msg.is_from_user,
        message_type: msg.message_type,
        created_at: msg.created_at,
        attachments: (msg as MessageWithAttachments).attachment_files || [],
      }));
      
      setState(prev => ({
        ...prev,
        messages: chatMessages,
        isLoading: false,
        error: null,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to refresh messages',
      }));
    }
  }, [state.activeConversation]);

  const getConversationById = useCallback((conversationId: string): Conversation | undefined => {
    return state.conversations.find(c => c.id === conversationId);
  }, [state.conversations]);

  // Load conversations when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      refreshConversations();
    }
  }, [isAuthenticated, user, refreshConversations]);

  const contextValue: ConversationContextType = {
    ...state,
    setActiveConversation,
    createConversation,
    updateConversation,
    deleteConversation,
    sendMessage,
    refreshConversations,
    refreshMessages,
    getConversationById,
    startNewConversation,
  };

  return (
    <ConversationContext.Provider value={contextValue}>
      {children}
    </ConversationContext.Provider>
  );
}

// React 19.1 compatible hook using use() API
export function useConversations() {
  const context = useContext(ConversationContext);
  if (!context) {
    throw new Error('useConversations must be used within a ConversationProvider');
  }
  return context;
}

// React 19.1 compatible hook for conditional context reading
export function useOptionalConversations() {
  return useContext(ConversationContext);
}

// Promise-based conversation state for React 19.1 use() API
export function createConversationsPromise() {
  return new Promise<ConversationContextType>((resolve, reject) => {
    setTimeout(() => {
      const context = useOptionalConversations();
      if (context) {
        resolve(context);
      } else {
        reject(new Error('Conversations context not available'));
      }
    }, 0);
  });
}