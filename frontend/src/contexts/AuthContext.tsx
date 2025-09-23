/**
 * AuthContext - User Authentication State Management
 * Handles user authentication state, login/logout, and user data
 * Updated to use SuperTokens for real authentication
 */

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import Session, { SessionContainer } from "supertokens-auth-react/recipe/session";
import { redirectToAuth, signOut } from "supertokens-auth-react";
import type { User } from '@/types';
import { api } from '@/services/api';
import LoadingScreen from '@/components/ui/LoadingScreen';

// Auth State Interface
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Auth Actions
type AuthAction =
  | { type: 'AUTH_LOADING' }
  | { type: 'AUTH_SUCCESS'; payload: User }
  | { type: 'AUTH_ERROR'; payload: string }
  | { type: 'AUTH_LOGOUT' }
  | { type: 'AUTH_CLEAR_ERROR' };

// Auth Context Interface
interface AuthContextType extends AuthState {
  // Actions
  login: () => void; // Redirects to SuperTokens auth flow
  logout: () => Promise<void>;
  clearError: () => void;
  refreshUser: () => Promise<void>;
  // SuperTokens session info
  session: SessionContainer | null;
}

// Initial state
const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true, // Start with loading to check existing session
  error: null,
};

// Auth reducer
function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'AUTH_LOADING':
      return {
        ...state,
        isLoading: true,
        error: null,
      };

    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };

    case 'AUTH_ERROR':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };

    case 'AUTH_LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };

    case 'AUTH_CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };

    default:
      return state;
  }
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// AuthProvider component
interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const [session, setSession] = React.useState<SessionContainer | null>(null);

  // Initialize authentication state
  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      dispatch({ type: 'AUTH_LOADING' });

      // Check if user has active SuperTokens session
      const sessionExists = await Session.doesSessionExist();

      if (sessionExists) {
        // Get session info and user data
        const sessionInfo = await Session.getAccessTokenPayloadSecurely();
        const currentSession = await Session.getSessionContext();
        setSession(currentSession);

        // Get user data from our backend using the session
        const user = await api.auth.getCurrentUser();
        dispatch({ type: 'AUTH_SUCCESS', payload: user });
      } else {
        // No active session
        dispatch({
          type: 'AUTH_ERROR',
          payload: 'No active session'
        });
      }
    } catch (error) {
      console.error('Auth initialization failed:', error);
      dispatch({
        type: 'AUTH_ERROR',
        payload: error instanceof Error ? error.message : 'Authentication failed'
      });
    }
  };

  const login = () => {
    // Redirect to SuperTokens auth flow
    redirectToAuth();
  };

  const logout = async () => {
    try {
      // Use SuperTokens signOut function
      await signOut();

      // Clear local state
      setSession(null);
      dispatch({ type: 'AUTH_LOGOUT' });

    } catch (error) {
      console.error('Logout failed:', error);
      // Still logout locally even if API call fails
      setSession(null);
      dispatch({ type: 'AUTH_LOGOUT' });
    }
  };

  const clearError = () => {
    dispatch({ type: 'AUTH_CLEAR_ERROR' });
  };

  const refreshUser = async () => {
    try {
      dispatch({ type: 'AUTH_LOADING' });

      // Check if session still exists
      const sessionExists = await Session.doesSessionExist();

      if (sessionExists) {
        const user = await api.auth.getCurrentUser();
        dispatch({ type: 'AUTH_SUCCESS', payload: user });
      } else {
        // Session expired, logout
        setSession(null);
        dispatch({ type: 'AUTH_LOGOUT' });
      }
    } catch (error) {
      dispatch({
        type: 'AUTH_ERROR',
        payload: error instanceof Error ? error.message : 'Failed to refresh user data'
      });
    }
  };

  const contextValue: AuthContextType = {
    ...state,
    login,
    logout,
    clearError,
    refreshUser,
    session,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use auth context
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Auth guard component for protected routes
interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function AuthGuard({ children, fallback }: AuthGuardProps) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <LoadingScreen/>
    );
  }

  if (!isAuthenticated) {
    return fallback || (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Authentication Required
          </h2>
          <p className="text-gray-600">
            Please log in to access this page.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

export default AuthContext;