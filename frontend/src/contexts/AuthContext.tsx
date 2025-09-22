/**
 * AuthContext - User Authentication State Management
 * Handles user authentication state, login/logout, and user data
 * Phase 2: Uses mocked authentication with test user
 */

import React, { createContext, useContext, useReducer, useEffect } from 'react';
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
  login: (whatsappNumber: string) => Promise<void>;
  verifyOTP: (whatsappNumber: string, otp: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  refreshUser: () => Promise<void>;
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

  // Initialize authentication state and set up auth listeners
  useEffect(() => {
    initializeAuth();

    // Listen for auth state changes
    const { data: { subscription } } = api.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.id);

      if (event === 'SIGNED_IN' && session) {
        try {
          const user = await api.auth.getCurrentUser();
          dispatch({ type: 'AUTH_SUCCESS', payload: user });
        } catch (error) {
          console.error('Failed to get user after sign in:', error);
          dispatch({ type: 'AUTH_LOGOUT' });
        }
      } else if (event === 'SIGNED_OUT') {
        dispatch({ type: 'AUTH_LOGOUT' });
      }
    });

    // Cleanup subscription on unmount
    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const initializeAuth = async () => {
    try {
      dispatch({ type: 'AUTH_LOADING' });

      // Check if user has active Supabase session
      const session = await api.auth.getSession();
      if (session) {
        // Get user details from backend
        const user = await api.auth.getCurrentUser();
        dispatch({ type: 'AUTH_SUCCESS', payload: user });
      } else {
        // No active session
        dispatch({ type: 'AUTH_LOGOUT' });
      }
    } catch (error) {
      console.error('Auth initialization failed:', error);
      dispatch({ type: 'AUTH_LOGOUT' });
    }
  };

  const login = async (whatsappNumber: string) => {
    try {
      dispatch({ type: 'AUTH_LOADING' });

      // Send OTP to WhatsApp number via Supabase
      await api.auth.login(whatsappNumber);

      // Don't dispatch success here - wait for OTP verification
      dispatch({ type: 'AUTH_CLEAR_ERROR' });

    } catch (error) {
      dispatch({
        type: 'AUTH_ERROR',
        payload: error instanceof Error ? error.message : 'Failed to send OTP'
      });
      throw error;
    }
  };

  const verifyOTP = async (whatsappNumber: string, otp: string) => {
    try {
      dispatch({ type: 'AUTH_LOADING' });

      // Verify OTP with Supabase and get user
      const { user } = await api.auth.verifyOTP(whatsappNumber, otp);

      dispatch({ type: 'AUTH_SUCCESS', payload: user });

    } catch (error) {
      dispatch({
        type: 'AUTH_ERROR',
        payload: error instanceof Error ? error.message : 'OTP verification failed'
      });
      throw error;
    }
  };

  const logout = async () => {
    try {
      await api.auth.logout();
      dispatch({ type: 'AUTH_LOGOUT' });

    } catch (error) {
      console.error('Logout failed:', error);
      // Still logout locally even if API call fails
      dispatch({ type: 'AUTH_LOGOUT' });
    }
  };

  const clearError = () => {
    dispatch({ type: 'AUTH_CLEAR_ERROR' });
  };

  const refreshUser = async () => {
    try {
      dispatch({ type: 'AUTH_LOADING' });
      const user = await api.auth.getCurrentUser();
      dispatch({ type: 'AUTH_SUCCESS', payload: user });
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
    verifyOTP,
    logout,
    clearError,
    refreshUser,
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