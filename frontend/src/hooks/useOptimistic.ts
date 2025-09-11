/**
 * React 19.1 useOptimistic hooks for instant UI updates
 * Provides optimistic updates for better user experience
 */

import { useState, useCallback } from 'react';
import { 
  ChatMessage, 
  Conversation, 
  Project, 
  MessageType,
  ConversationResult 
} from '@/types';

// Optimistic message updates for chat (React 19.1 compatible structure)
export function useOptimisticMessages(
  messages: ChatMessage[]
) {
  const [optimisticMessages, setOptimisticMessages] = useState<ChatMessage[]>(messages);
  
  const addOptimisticMessage = useCallback((action: { type: 'add' | 'update' | 'remove', message: ChatMessage }) => {
    setOptimisticMessages(currentMessages => {
      switch (action.type) {
        case 'add':
          return [...currentMessages, action.message];
        case 'update':
          return currentMessages.map(msg => 
            msg.id === action.message.id ? { ...msg, ...action.message } : msg
          );
        case 'remove':
          return currentMessages.filter(msg => msg.id !== action.message.id);
        default:
          return currentMessages;
      }
    });
  }, []);

  return [optimisticMessages, addOptimisticMessage] as const;
}

// Optimistic conversation updates
export function useOptimisticConversations(
  conversations: Conversation[]
) {
  const [optimisticConversations, setOptimisticConversations] = useState<Conversation[]>(conversations);
  
  const addOptimisticConversation = useCallback((action: { type: 'add' | 'update' | 'remove', conversation: Conversation }) => {
    setOptimisticConversations(currentConversations => {
      switch (action.type) {
        case 'add':
          return [action.conversation, ...currentConversations];
        case 'update':
          return currentConversations.map(conv => 
            conv.id === action.conversation.id ? { ...conv, ...action.conversation } : conv
          );
        case 'remove':
          return currentConversations.filter(conv => conv.id !== action.conversation.id);
        default:
          return currentConversations;
      }
    });
  }, []);

  return [optimisticConversations, addOptimisticConversation] as const;
}

// Optimistic project updates
export function useOptimisticProjects(
  projects: Project[]
) {
  const [optimisticProjects, setOptimisticProjects] = useState<Project[]>(projects);
  
  const addOptimisticProject = useCallback((action: { type: 'add' | 'update' | 'remove', project: Project }) => {
    setOptimisticProjects(currentProjects => {
      switch (action.type) {
        case 'add':
          return [...currentProjects, action.project];
        case 'update':
          return currentProjects.map(proj => 
            proj.id === action.project.id ? { ...proj, ...action.project } : proj
          );
        case 'remove':
          return currentProjects.filter(proj => proj.id !== action.project.id);
        default:
          return currentProjects;
      }
    });
  }, []);

  return [optimisticProjects, addOptimisticProject] as const;
}

// Helper functions for creating optimistic updates
export const optimisticHelpers = {
  // Create optimistic message while sending
  createOptimisticMessage: (content: string, messageType: MessageType = MessageType.TEXT): ChatMessage => ({
    id: `optimistic-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    content,
    is_from_user: true,
    message_type: messageType,
    created_at: new Date().toISOString(),
    loading: true,
  }),

  // Create AI response placeholder
  createAIResponsePlaceholder: (): ChatMessage => ({
    id: `ai-placeholder-${Date.now()}`,
    content: '',
    is_from_user: false,
    message_type: MessageType.TEXT,
    created_at: new Date().toISOString(),
    loading: true,
  }),

  // Create optimistic conversation
  createOptimisticConversation: (title: string, projectId?: string): Conversation => ({
    id: `optimistic-conv-${Date.now()}`,
    user_id: '', // Will be set by backend
    title,
    project_id: projectId || null,
    openai_session_id: null,
    agent_state: {},
    project_context: {},
    language_preference: 'es',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }),

  // Create optimistic project
  createOptimisticProject: (name: string): Project => ({
    id: `optimistic-proj-${Date.now()}`,
    user_id: '', // Will be set by backend
    project_name: name,
    project_type: null,
    description: null,
    current_stage: null,
    target_audience: null,
    problem_statement: null,
    solution_approach: null,
    business_model: null,
    context_data: {},
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }),

  // Convert optimistic message to real message from API response
  updateOptimisticMessage: (optimisticMessage: ChatMessage, _result: ConversationResult): ChatMessage => ({
    ...optimisticMessage,
    id: `message-${Date.now()}`, // Backend would provide real ID
    loading: false,
  }),

  // Remove loading state from message
  finalizeMessage: (message: ChatMessage): ChatMessage => ({
    ...message,
    loading: false,
  }),
};