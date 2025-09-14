/**
 * AuthContext - User Authentication State Management
 * Handles user authentication state, login/logout, and user data
 * Phase 2: Uses mocked authentication with test user
 */

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import type { User } from '@/types';
import { api } from '@/services/api';

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

  // Initialize authentication state
  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      dispatch({ type: 'AUTH_LOADING' });
      
      // For Phase 2: Automatically authenticate with mock user
      // In Phase 4: This will check for stored tokens and validate them
      const user = await api.auth.getCurrentUser();
      dispatch({ type: 'AUTH_SUCCESS', payload: user });
    } catch (error) {
      console.error('Auth initialization failed:', error);
      dispatch({ 
        type: 'AUTH_ERROR', 
        payload: error instanceof Error ? error.message : 'Authentication failed' 
      });
    }
  };

  const login = async (whatsappNumber: string) => {
    try {
      dispatch({ type: 'AUTH_LOADING' });
      
      // Phase 2: Mock login
      // Phase 4: This will send OTP to WhatsApp number
      await api.auth.login(whatsappNumber);
      
      // For Phase 2, immediately get mock user after "login"
      const user = await api.auth.getCurrentUser();
      dispatch({ type: 'AUTH_SUCCESS', payload: user });
      
    } catch (error) {
      dispatch({ 
        type: 'AUTH_ERROR', 
        payload: error instanceof Error ? error.message : 'Login failed' 
      });
      throw error;
    }
  };

  const verifyOTP = async (whatsappNumber: string, otp: string) => {
    try {
      dispatch({ type: 'AUTH_LOADING' });
      
      // Phase 2: Mock OTP verification
      // Phase 4: This will verify OTP and return JWT token
      const { user } = await api.auth.verifyOTP(whatsappNumber, otp);
      
      // Store token in localStorage (Phase 4)
      // localStorage.setItem('auth_token', token);
      
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
      
      // Clear stored token (Phase 4)
      // localStorage.removeItem('auth_token');
      
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
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