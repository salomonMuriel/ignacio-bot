/**
 * ConversationsContext - Chat Conversations State Management
 * Handles conversation management, message sending, and real-time chat state
 * Integrates with project context for project-aware conversations
 */

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import type {
  Conversation,
  ConversationDetailResponse,
  Message,
  AgentMessageResponse,
  MessageType,
} from '@/types';
import { api } from '@/services/api';
import { useAuth } from './AuthContext';
import { useProjects } from './ProjectsContext';

// Conversations State Interface
interface ConversationsState {
  conversations: Conversation[];
  activeConversation: ConversationDetailResponse | null;
  isLoading: boolean;
  isSending: boolean;
  error: string | null;
  lastMessageSent: AgentMessageResponse | null;
}

// Conversation Actions
type ConversationAction =
  | { type: 'CONVERSATIONS_LOADING' }
  | { type: 'CONVERSATIONS_SUCCESS'; payload: Conversation[] }
  | { type: 'CONVERSATIONS_ERROR'; payload: string }
  | { type: 'ACTIVE_CONVERSATION_LOADING' }
  | { type: 'ACTIVE_CONVERSATION_SUCCESS'; payload: ConversationDetailResponse }
  | { type: 'ACTIVE_CONVERSATION_ERROR'; payload: string }
  | { type: 'MESSAGE_SENDING' }
  | { type: 'MESSAGE_SENT'; payload: AgentMessageResponse }
  | { type: 'MESSAGE_SEND_ERROR'; payload: string }
  | { type: 'CONVERSATION_CREATED'; payload: Conversation }
  | { type: 'CONVERSATION_UPDATED'; payload: Conversation }
  | { type: 'CONVERSATION_DELETED'; payload: string }
  | {
      type: 'SET_ACTIVE_CONVERSATION';
      payload: ConversationDetailResponse | null;
    }
  | { type: 'ADD_MESSAGE_TO_ACTIVE'; payload: Message }
  | { type: 'CLEAR_ERROR' };

// Conversations Context Interface
interface ConversationsContextType extends ConversationsState {
  // Actions
  loadConversations: () => Promise<void>;
  loadConversation: (conversationId: string) => Promise<void>;
  sendMessage: (params: {
    content: string;
    conversationId?: string;
    projectId?: string;
    file?: File;
    existingFileId?: string;
    messageType?: MessageType;
  }) => Promise<AgentMessageResponse>;
  updateConversation: (
    conversationId: string,
    updates: { title?: string; project_id?: string }
  ) => Promise<void>;
  deleteConversation: (conversationId: string) => Promise<void>;
  setActiveConversation: (
    conversation: ConversationDetailResponse | null
  ) => void;
  clearError: () => void;

  // Utility methods
  getConversationById: (conversationId: string) => Conversation | undefined;
  getConversationSummary: (conversationId: string) => Promise<unknown>;
  associateConversationWithProject: (
    conversationId: string,
    projectId: string
  ) => Promise<void>;
}

// Initial state
const initialState: ConversationsState = {
  conversations: [],
  activeConversation: null,
  isLoading: true,
  isSending: false,
  error: null,
  lastMessageSent: null,
};

// Conversations reducer
function conversationsReducer(
  state: ConversationsState,
  action: ConversationAction
): ConversationsState {
  switch (action.type) {
    case 'CONVERSATIONS_LOADING':
      return {
        ...state,
        isLoading: true,
        error: null,
      };

    case 'CONVERSATIONS_SUCCESS':
      return {
        ...state,
        conversations: action.payload,
        isLoading: false,
        error: null,
      };

    case 'CONVERSATIONS_ERROR':
      return {
        ...state,
        isLoading: false,
        error: action.payload,
      };

    case 'ACTIVE_CONVERSATION_LOADING':
      return {
        ...state,
        isLoading: true,
        error: null,
      };

    case 'ACTIVE_CONVERSATION_SUCCESS':
      return {
        ...state,
        activeConversation: action.payload,
        isLoading: false,
        error: null,
      };

    case 'ACTIVE_CONVERSATION_ERROR':
      return {
        ...state,
        activeConversation: null,
        isLoading: false,
        error: action.payload,
      };

    case 'MESSAGE_SENDING':
      return {
        ...state,
        isSending: true,
        error: null,
      };

    case 'MESSAGE_SENT':
      return {
        ...state,
        isSending: false,
        lastMessageSent: action.payload,
        error: null,
      };

    case 'MESSAGE_SEND_ERROR':
      return {
        ...state,
        isSending: false,
        error: action.payload,
      };

    case 'CONVERSATION_CREATED':
      return {
        ...state,
        conversations: [action.payload, ...state.conversations],
        error: null,
      };

    case 'CONVERSATION_UPDATED': {
      const updatedConversations = state.conversations.map(conv =>
        conv.id === action.payload.id ? action.payload : conv
      );
      return {
        ...state,
        conversations: updatedConversations,
        // Update active conversation if it was the one updated
        activeConversation:
          state.activeConversation?.id === action.payload.id
            ? { ...state.activeConversation, ...action.payload }
            : state.activeConversation,
        error: null,
      };
    }

    case 'CONVERSATION_DELETED':
      return {
        ...state,
        conversations: state.conversations.filter(
          conv => conv.id !== action.payload
        ),
        // Clear active conversation if it was deleted
        activeConversation:
          state.activeConversation?.id === action.payload
            ? null
            : state.activeConversation,
        error: null,
      };

    case 'SET_ACTIVE_CONVERSATION':
      return {
        ...state,
        activeConversation: action.payload,
        error: null,
      };

    case 'ADD_MESSAGE_TO_ACTIVE': {
      if (!state.activeConversation) return state;

      return {
        ...state,
        activeConversation: {
          ...state.activeConversation,
          messages: [...state.activeConversation.messages, action.payload],
          message_count: state.activeConversation.message_count + 1,
        },
      };
    }

    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };

    default:
      return state;
  }
}

// Create context
const ConversationsContext = createContext<
  ConversationsContextType | undefined
>(undefined);

// ConversationsProvider component
interface ConversationsProviderProps {
  children: React.ReactNode;
}

export function ConversationsProvider({
  children,
}: ConversationsProviderProps) {
  const [state, dispatch] = useReducer(conversationsReducer, initialState);
  const { isAuthenticated, user } = useAuth();
  const { activeProject } = useProjects();

  // Load conversations when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      loadConversations();
    }
  }, [isAuthenticated, user]);

  const loadConversations = async () => {
    try {
      dispatch({ type: 'CONVERSATIONS_LOADING' });

      const conversations = await api.chat.getConversations();
      dispatch({ type: 'CONVERSATIONS_SUCCESS', payload: conversations });
    } catch (error) {
      console.error('Failed to load conversations:', error);
      dispatch({
        type: 'CONVERSATIONS_ERROR',
        payload:
          error instanceof Error
            ? error.message
            : 'Failed to load conversations',
      });
    }
  };

  const loadConversation = async (conversationId: string) => {
    try {
      dispatch({ type: 'ACTIVE_CONVERSATION_LOADING' });

      const conversation = await api.chat.getConversation(conversationId);
      dispatch({ type: 'ACTIVE_CONVERSATION_SUCCESS', payload: conversation });
    } catch (error) {
      console.error('Failed to load conversation:', error);
      dispatch({
        type: 'ACTIVE_CONVERSATION_ERROR',
        payload:
          error instanceof Error
            ? error.message
            : 'Failed to load conversation',
      });
    }
  };

  const sendMessage = async (params: {
    content: string;
    conversationId?: string;
    projectId?: string;
    file?: File;
    existingFileId?: string;
    messageType?: MessageType;
  }): Promise<AgentMessageResponse> => {
    try {
      dispatch({ type: 'MESSAGE_SENDING' });

      // Use active project if no project specified
      const projectId = params.projectId || activeProject?.id;

      const response = await api.chat.sendMessage({
        content: params.content,
        conversationId: params.conversationId,
        projectId,
        file: params.file,
        existingFileId: params.existingFileId,
      });

      dispatch({ type: 'MESSAGE_SENT', payload: response });

      // If this created a new conversation, reload conversations list and set as active
      if (!params.conversationId && response.conversation_id) {
        await loadConversations();
        // Load the new conversation and set it as active
        await loadConversation(response.conversation_id);
      }

      // If there's an active conversation, reload it to get the latest messages
      else if (
        state.activeConversation &&
        params.conversationId === state.activeConversation.id
      ) {
        await loadConversation(state.activeConversation.id);
      }

      return response;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to send message';
      dispatch({ type: 'MESSAGE_SEND_ERROR', payload: errorMessage });
      throw error;
    }
  };

  const updateConversation = async (
    conversationId: string,
    updates: { title?: string; project_id?: string }
  ): Promise<void> => {
    try {
      const updatedConversation = await api.chat.updateConversation(
        conversationId,
        updates
      );
      dispatch({ type: 'CONVERSATION_UPDATED', payload: updatedConversation });
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to update conversation';
      dispatch({ type: 'CONVERSATIONS_ERROR', payload: errorMessage });
      throw error;
    }
  };

  const deleteConversation = async (conversationId: string): Promise<void> => {
    try {
      await api.chat.deleteConversation(conversationId);
      dispatch({ type: 'CONVERSATION_DELETED', payload: conversationId });
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to delete conversation';
      dispatch({ type: 'CONVERSATIONS_ERROR', payload: errorMessage });
      throw error;
    }
  };

  const setActiveConversation = (
    conversation: ConversationDetailResponse | null
  ) => {
    dispatch({ type: 'SET_ACTIVE_CONVERSATION', payload: conversation });
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  // Utility methods
  const getConversationById = (
    conversationId: string
  ): Conversation | undefined => {
    return state.conversations.find(conv => conv.id === conversationId);
  };

  const getConversationSummary = async (conversationId: string) => {
    try {
      return await api.chat.getConversationSummary(conversationId);
    } catch (error) {
      console.error('Failed to get conversation summary:', error);
      throw error;
    }
  };

  const associateConversationWithProject = async (
    conversationId: string,
    projectId: string
  ) => {
    try {
      await api.chat.associateConversationWithProject(
        conversationId,
        projectId
      );
      // Reload conversation to reflect the association
      if (state.activeConversation?.id === conversationId) {
        loadConversation(conversationId);
      }
      // Reload conversations list to reflect the change
      loadConversations();
    } catch (error) {
      console.error('Failed to associate conversation with project:', error);
      throw error;
    }
  };

  const contextValue: ConversationsContextType = {
    ...state,
    loadConversations,
    loadConversation,
    sendMessage,
    updateConversation,
    deleteConversation,
    setActiveConversation,
    clearError,
    getConversationById,
    getConversationSummary,
    associateConversationWithProject,
  };

  return (
    <ConversationsContext.Provider value={contextValue}>
      {children}
    </ConversationsContext.Provider>
  );
}

// Custom hook to use conversations context
export function useConversations(): ConversationsContextType {
  const context = useContext(ConversationsContext);
  if (context === undefined) {
    throw new Error(
      'useConversations must be used within a ConversationsProvider'
    );
  }
  return context;
}

export default ConversationsContext;
