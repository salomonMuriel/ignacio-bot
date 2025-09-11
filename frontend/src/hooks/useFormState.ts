/**
 * React 19.1 useActionState and useFormStatus hooks for form handling
 * Provides client-side form state management with loading states
 */

import { useCallback, useState } from 'react';

// Generic form state type
export interface FormState<T> {
  data: T | null;
  error: string | null;
  success: boolean;
  loading: boolean;
}

// Initial form state factory
export function createInitialFormState<T>(): FormState<T> {
  return {
    data: null,
    error: null,
    success: false,
    loading: false,
  };
}

// Generic form action type
export type FormAction<T, P = FormData> = (
  prevState: FormState<T>,
  payload: P
) => Promise<FormState<T>>;

// Form state hook using React useState (React 19.1 compatible structure)
export function useFormState<T, P = FormData>(
  action: FormAction<T, P>,
  initialState?: FormState<T>
) {
  const initial = initialState || createInitialFormState<T>();
  const [state, setState] = useState<FormState<T>>(initial);
  
  const executeAction = useCallback(async (payload: P) => {
    setState(formHelpers.loading<T>());
    try {
      const result = await action(state, payload);
      setState(result);
      return result;
    } catch (error) {
      const errorState = formHelpers.error<T>(
        error instanceof Error ? error.message : 'Action failed'
      );
      setState(errorState);
      return errorState;
    }
  }, [action, state]);

  return [state, executeAction] as const;
}

// Form loading state hook (simplified version)
export function useFormLoadingState() {
  const [isLoading, setIsLoading] = useState(false);
  
  return {
    pending: isLoading,
    setLoading: setIsLoading,
  };
}

// Helper functions for form actions
export const formHelpers = {
  // Create success state
  success: <T>(data: T): FormState<T> => ({
    data,
    error: null,
    success: true,
    loading: false,
  }),

  // Create error state
  error: <T>(error: string): FormState<T> => ({
    data: null,
    error,
    success: false,
    loading: false,
  }),

  // Create loading state
  loading: <T>(): FormState<T> => ({
    data: null,
    error: null,
    success: false,
    loading: true,
  }),

  // Reset form state
  reset: <T>(): FormState<T> => createInitialFormState<T>(),
};

// Common form actions for the application
export const createFormActions = {
  // Project creation form action
  createProject: (api: typeof import('@/services/api').api): FormAction<unknown> => {
    return async (prevState, formData) => {
      try {
        const projectName = formData.get('project_name') as string;
        const projectType = formData.get('project_type') as string;
        const description = formData.get('description') as string;

        if (!projectName) {
          return formHelpers.error('Project name is required');
        }

        const project = await api.projects.create({
          project_name: projectName,
          project_type: projectType as import('@/types').ProjectType || undefined,
          description: description || undefined,
        });

        return formHelpers.success(project);
      } catch (error) {
        return formHelpers.error(
          error instanceof Error ? error.message : 'Failed to create project'
        );
      }
    };
  },

  // Message sending form action
  sendMessage: (api: typeof import('@/services/api').api, conversationId: string): FormAction<unknown> => {
    return async (prevState, formData) => {
      try {
        const content = formData.get('message') as string;
        const files = formData.getAll('files') as File[];

        if (!content?.trim()) {
          return formHelpers.error('Message content is required');
        }

        const result = await api.messages.send(
          conversationId, 
          content.trim(), 
          files.length > 0 ? files : undefined
        );

        return formHelpers.success(result);
      } catch (error) {
        return formHelpers.error(
          error instanceof Error ? error.message : 'Failed to send message'
        );
      }
    };
  },

  // Conversation creation form action
  createConversation: (api: typeof import('@/services/api').api): FormAction<unknown> => {
    return async (prevState, formData) => {
      try {
        const title = formData.get('title') as string;
        const projectId = formData.get('project_id') as string;

        const conversation = await api.conversations.start(
          projectId || undefined,
          title || undefined
        );

        return formHelpers.success(conversation);
      } catch (error) {
        return formHelpers.error(
          error instanceof Error ? error.message : 'Failed to create conversation'
        );
      }
    };
  },

  // File upload form action
  uploadFile: (api: typeof import('@/services/api').api, conversationId?: string): FormAction<unknown> => {
    return async (prevState, formData) => {
      try {
        const file = formData.get('file') as File;

        if (!file) {
          return formHelpers.error('File is required');
        }

        const uploadedFile = conversationId
          ? await api.files.uploadToConversation(conversationId, file)
          : await api.files.upload(file);

        return formHelpers.success(uploadedFile);
      } catch (error) {
        return formHelpers.error(
          error instanceof Error ? error.message : 'Failed to upload file'
        );
      }
    };
  },
};

// Custom hook for form validation
export function useFormValidation<T>(
  data: T,
  validationRules: Record<keyof T, (value: unknown) => string | null>
) {
  const validate = useCallback(() => {
    const errors: Partial<Record<keyof T, string>> = {};
    let isValid = true;

    for (const [field, rule] of Object.entries(validationRules)) {
      const error = (rule as (value: unknown) => string | null)((data as Record<string, unknown>)[field as string]);
      if (error) {
        errors[field as keyof T] = error;
        isValid = false;
      }
    }

    return { errors, isValid };
  }, [data, validationRules]);

  return validate;
}