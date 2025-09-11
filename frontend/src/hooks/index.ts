/**
 * Centralized exports for React 19.1 compatible hooks
 * Provides modern React features with Next.js 15 integration
 */

// Promise-based data fetching with use() API
export {
  usePromise,
  useConditionalPromise,
  createPromiseAPI,
  createCachedPromiseAPI,
  cachedPromise,
  clearPromiseCache,
  clearCachedPromise,
} from './usePromise';

// Optimistic updates with useOptimistic
export {
  useOptimisticMessages,
  useOptimisticConversations,
  useOptimisticProjects,
  optimisticHelpers,
} from './useOptimistic';

// Form state management hooks
export { useFormState } from './useFormState';