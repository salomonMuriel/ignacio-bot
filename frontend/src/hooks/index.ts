/**
 * Custom Hooks Index - React 19.1 Patterns
 * Exports all custom hooks for React 19.1 patterns and utilities
 */

// React 19.1 Pattern Hooks
export { useActionState, useFormAction, useProjectAction, useMessageAction } from './useActionState';
export {
  useOptimistic,
  useOptimisticMessages,
  useOptimisticConversations,
  useOptimisticProjects,
  useOptimisticAction,
} from './useOptimistic';
export {
  use,
  useAsyncState,
  useAsync,
  useApiData,
  useMutation,
  useDebouncedAsync,
} from './useAsync';

// Context Hooks (re-exported for convenience)
export { useAuth0 } from '@auth0/auth0-react';
export { useProjects } from '@/contexts/ProjectsContext';
export { useConversations } from '@/contexts/ConversationsContext';
export { useGlobal } from '@/contexts/GlobalContext';