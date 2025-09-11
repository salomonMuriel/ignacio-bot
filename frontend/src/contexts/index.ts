/**
 * Context exports for centralized state management
 * Uses React 19.1 features with Next.js 15
 */

// Auth Context
export {
  AuthProvider,
  useAuth,
  useOptionalAuth,
  createAuthPromise,
} from './AuthContext';

// Project Context  
export {
  ProjectProvider,
  useProjects,
  useOptionalProjects,
  createProjectsPromise,
} from './ProjectContext';

// Conversation Context
export {
  ConversationProvider,
  useConversations,
  useOptionalConversations,
  createConversationsPromise,
} from './ConversationContext';

// Combined Providers Component
export { GlobalProviders } from './GlobalProviders';