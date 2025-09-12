'use client';

/**
 * ConversationContext - Simplified version for current backend
 * Manages conversations and messages with React 19.1 compatibility
 */

import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { 
  Conversation, 
  ConversationWithMessages, 
  MessageWithAttachments,
  ConversationUpdate,
  ChatMessage,
  MessageType,
} from '@/types';
import { api } from '@/services/api';
import { useAuth } from './AuthContext';

interface ConversationState {
  conversations: Conversation[];
  currentConversation: Conversation | null;
  isLoading: boolean;
  error: string | null;
}

interface ConversationContextType extends ConversationState {
  setCurrentConversation: (conversation: Conversation | null) => void;
  createConversation: (projectId?: string, initialMessage?: string) => Promise<Conversation>;
  updateConversation: (conversationId: string, data: ConversationUpdate) => Promise<void>;
  sendMessage: (conversationId: string, content: string, files?: File[]) => Promise<any>;
  refreshConversations: () => Promise<void>;
}

const ConversationContext = createContext<ConversationContextType | null>(null);

interface ConversationProviderProps {
  children: ReactNode;
}

export function ConversationProvider({ children }: ConversationProviderProps) {
  const { currentUser } = useAuth();
  
  const [state, setState] = useState<ConversationState>({
    conversations: [],
    currentConversation: null,
    isLoading: false,
    error: null,
  });

  const setCurrentConversation = useCallback((conversation: Conversation | null) => {
    setState(prev => ({ 
      ...prev, 
      currentConversation: conversation,
    }));
    
    if (conversation) {
      localStorage.setItem('activeConversationId', conversation.id);
    } else {
      localStorage.removeItem('activeConversationId');
    }
  }, []);

  const createConversation = useCallback(async (projectId?: string, initialMessage?: string): Promise<Conversation> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      if (initialMessage) {
        // Start conversation with initial message using the unified endpoint
        const result = await api.messages.sendNew(initialMessage, projectId);
        
        // The backend returns the conversation_id, we need to fetch the conversation
        const conversation = await api.conversations.get(result.conversation_id);
        
        setState(prev => ({
          ...prev,
          conversations: [conversation, ...prev.conversations],
          currentConversation: conversation,
          isLoading: false,
          error: null,
        }));
        
        return conversation;
      } else {
        // Create empty conversation
        const newConversation = await api.conversations.create({
          title: "Nueva conversación",
          project_id: projectId,
        });
        
        setState(prev => ({
          ...prev,
          conversations: [newConversation, ...prev.conversations],
          currentConversation: newConversation,
          isLoading: false,
          error: null,
        }));
        
        return newConversation;
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to create conversation',
      }));
      throw error;
    }
  }, []);

  const updateConversation = useCallback(async (conversationId: string, data: ConversationUpdate): Promise<void> => {
    try {
      await api.conversations.update(conversationId, data);
      
      setState(prev => ({
        ...prev,
        conversations: prev.conversations.map(c => 
          c.id === conversationId ? { ...c, ...data } : c
        ),
        currentConversation: prev.currentConversation?.id === conversationId 
          ? { ...prev.currentConversation, ...data }
          : prev.currentConversation,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to update conversation',
      }));
      throw error;
    }
  }, []);

  const sendMessage = useCallback(async (conversationId: string, content: string, files?: File[]): Promise<any> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const result = await api.messages.send(conversationId, content, files);
      
      setState(prev => ({ ...prev, isLoading: false, error: null }));
      
      return result;
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to send message',
      }));
      throw error;
    }
  }, []);

  const refreshConversations = useCallback(async (): Promise<void> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const conversations = await api.conversations.list();
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
          setCurrentConversation(savedActiveConversation);
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
  }, [setCurrentConversation]);

  // Load conversations on mount
  useEffect(() => {
    refreshConversations();
  }, [refreshConversations]);

  const contextValue: ConversationContextType = {
    ...state,
    setCurrentConversation,
    createConversation,
    updateConversation,
    sendMessage,
    refreshConversations,
  };

  return (
    <ConversationContext.Provider value={contextValue}>
      {children}
    </ConversationContext.Provider>
  );
}

// React 19.1 compatible hook
export function useConversation() {
  const context = useContext(ConversationContext);
  if (!context) {
    throw new Error('useConversation must be used within a ConversationProvider');
  }
  return context;
}