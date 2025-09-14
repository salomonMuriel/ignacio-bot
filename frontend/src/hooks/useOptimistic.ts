/**
 * React 19.1 useOptimistic Implementation
 * Provides optimistic updates for better user experience during async operations
 */

import { useState, useCallback, useTransition } from 'react';
import type { Message, Conversation, Project } from '@/types';

// Generic optimistic update hook
export function useOptimistic<T, P>(
  state: T,
  updateFn: (currentState: T, optimisticValue: P) => T
): [T, (optimisticValue: P) => void] {
  const [optimisticState, setOptimisticState] = useState<T>(state);
  const [isPending, startTransition] = useTransition();

  const addOptimistic = useCallback(
    (optimisticValue: P) => {
      startTransition(() => {
        const newState = updateFn(state, optimisticValue);
        setOptimisticState(newState);
      });
    },
    [state, updateFn]
  );

  // Return the optimistic state when pending, otherwise the actual state
  return [isPending ? optimisticState : state, addOptimistic];
}

// Optimistic messages hook for chat interface
export function useOptimisticMessages(messages: Message[]) {
  const [optimisticMessages, addOptimisticMessage] = useOptimistic(
    messages,
    (currentMessages, newMessage: Partial<Message>) => [
      ...currentMessages,
      {
        id: `temp-${Date.now()}`,
        content: newMessage.content || '',
        message_type: newMessage.message_type || 'TEXT',
        is_from_user: newMessage.is_from_user ?? true,
        created_at: new Date().toISOString(),
        file_path: newMessage.file_path || null,
        agent_used: null,
        execution_time_ms: null,
        ...newMessage,
      } as Message,
    ]
  );

  const sendOptimisticMessage = useCallback(
    (content: string, messageType: Message['message_type'] = 'TEXT') => {
      addOptimisticMessage({
        content,
        message_type: messageType,
        is_from_user: true,
      });
    },
    [addOptimisticMessage]
  );

  return {
    messages: optimisticMessages,
    sendOptimisticMessage,
  };
}

// Optimistic conversations hook
export function useOptimisticConversations(conversations: Conversation[]) {
  const [optimisticConversations, addOptimisticConversation] = useOptimistic(
    conversations,
    (currentConversations, newConversation: Partial<Conversation>) => [
      {
        id: `temp-${Date.now()}`,
        title: newConversation.title || 'New Conversation',
        project_id: newConversation.project_id || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        message_count: 0,
        language_preference: 'es',
        project_context: {},
        ...newConversation,
      } as Conversation,
      ...currentConversations,
    ]
  );

  const createOptimisticConversation = useCallback(
    (title?: string, projectId?: string) => {
      addOptimisticConversation({
        title: title || 'New Conversation',
        project_id: projectId,
      });
    },
    [addOptimisticConversation]
  );

  return {
    conversations: optimisticConversations,
    createOptimisticConversation,
  };
}

// Optimistic projects hook
export function useOptimisticProjects(projects: Project[]) {
  const [optimisticProjects, addOptimisticProject] = useOptimistic(
    projects,
    (currentProjects, action: { type: 'add' | 'update' | 'delete'; project: Partial<Project> }) => {
      switch (action.type) {
        case 'add':
          return [
            ...currentProjects,
            {
              id: `temp-${Date.now()}`,
              user_id: action.project.user_id || '',
              project_name: action.project.project_name || 'New Project',
              project_type: action.project.project_type || null,
              description: action.project.description || null,
              current_stage: action.project.current_stage || null,
              target_audience: action.project.target_audience || null,
              problem_statement: action.project.problem_statement || null,
              solution_approach: action.project.solution_approach || null,
              business_model: action.project.business_model || null,
              context_data: action.project.context_data || {},
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              ...action.project,
            } as Project,
          ];
        
        case 'update':
          return currentProjects.map(project =>
            project.id === action.project.id
              ? { ...project, ...action.project, updated_at: new Date().toISOString() }
              : project
          );
        
        case 'delete':
          return currentProjects.filter(project => project.id !== action.project.id);
        
        default:
          return currentProjects;
      }
    }
  );

  const addOptimisticProject = useCallback(
    (project: Partial<Project>) => {
      addOptimisticProject({ type: 'add', project });
    },
    [addOptimisticProject]
  );

  const updateOptimisticProject = useCallback(
    (projectId: string, updates: Partial<Project>) => {
      addOptimisticProject({ type: 'update', project: { id: projectId, ...updates } });
    },
    [addOptimisticProject]
  );

  const deleteOptimisticProject = useCallback(
    (projectId: string) => {
      addOptimisticProject({ type: 'delete', project: { id: projectId } });
    },
    [addOptimisticProject]
  );

  return {
    projects: optimisticProjects,
    addOptimisticProject,
    updateOptimisticProject,
    deleteOptimisticProject,
  };
}

// Generic loading state with optimistic updates
export function useOptimisticAction<T, P>(
  initialData: T,
  action: (data: P) => Promise<T>,
  optimisticUpdateFn: (currentData: T, payload: P) => T
) {
  const [data, setData] = useState<T>(initialData);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [optimisticData, addOptimistic] = useOptimistic(data, optimisticUpdateFn);

  const execute = useCallback(
    async (payload: P) => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Apply optimistic update immediately
        addOptimistic(payload);
        
        // Execute actual action
        const result = await action(payload);
        setData(result);
        
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        // Revert optimistic update on error
        setData(data);
      } finally {
        setIsLoading(false);
      }
    },
    [action, addOptimistic, data]
  );

  return {
    data: optimisticData,
    isLoading,
    error,
    execute,
  };
}