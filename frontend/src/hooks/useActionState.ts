/**
 * React 19.1 useActionState Implementation
 * Enhanced form handling with pending states, optimistic updates, and error handling
 */

import { useState, useCallback, useTransition } from 'react';
import type { ActionState, FormState } from '@/types/utils';

// Action function type
type ActionFunction<T, P> = (prevState: T, formData: P) => Promise<T> | T;

// useActionState hook implementation
export function useActionState<T, P = FormData>(
  action: ActionFunction<T, P>,
  initialState: T,
  permalink?: string
): [T, (payload: P) => void, boolean] {
  const [state, setState] = useState<T>(initialState);
  const [isPending, startTransition] = useTransition();

  const executeAction = useCallback(
    async (payload: P) => {
      startTransition(async () => {
        try {
          const newState = await action(state, payload);
          setState(newState);
        } catch (error) {
          console.error('Action failed:', error);
          // Keep the current state on error
        }
      });
    },
    [action, state]
  );

  return [state, executeAction, isPending];
}

// Enhanced form action hook with error handling
export function useFormAction<T extends Record<string, any>>(
  action: (formData: FormData) => Promise<ActionState<T>>,
  initialState?: Partial<T>
): {
  state: ActionState<T>;
  executeAction: (formData: FormData) => void;
  isPending: boolean;
  reset: () => void;
} {
  const initialActionState: ActionState<T> = {
    data: initialState as T,
    error: null,
    success: false,
    pending: false,
  };

  const [state, setState] = useState<ActionState<T>>(initialActionState);
  const [isPending, startTransition] = useTransition();

  const executeAction = useCallback(
    (formData: FormData) => {
      startTransition(async () => {
        setState(prev => ({ ...prev, pending: true, error: null }));

        try {
          const result = await action(formData);
          setState(result);
        } catch (error) {
          setState(prev => ({
            ...prev,
            pending: false,
            error: error instanceof Error ? error.message : 'An error occurred',
            success: false,
          }));
        }
      });
    },
    [action]
  );

  const reset = useCallback(() => {
    setState(initialActionState);
  }, [initialActionState]);

  return {
    state: { ...state, pending: isPending },
    executeAction,
    isPending,
    reset,
  };
}

// Project creation action hook
export function useProjectAction() {
  return useFormAction(async (formData: FormData) => {
    // This would be implemented with actual API calls
    const projectData = {
      project_name: formData.get('project_name') as string,
      description: formData.get('description') as string,
      project_type: formData.get('project_type') as string,
    };

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    return {
      data: projectData,
      error: null,
      success: true,
      pending: false,
    };
  });
}

// Message sending action hook
export function useMessageAction() {
  return useFormAction(async (formData: FormData) => {
    const messageData = {
      content: formData.get('content') as string,
      conversation_id: formData.get('conversation_id') as string,
    };

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));

    return {
      data: messageData,
      error: null,
      success: true,
      pending: false,
    };
  });
}
