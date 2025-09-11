"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/types';
import { api } from '@/services/api';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

interface AuthContextType extends AuthState {
  login: () => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
    error: null,
  });

  const login = async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      // For now, we use the test user - in production this would handle OTP login
      const user = await api.user.getCurrentUser();
      setState({
        user,
        isLoading: false,
        isAuthenticated: true,
        error: null,
      });
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Login failed',
      }));
    }
  };

  const logout = () => {
    setState({
      user: null,
      isLoading: false,
      isAuthenticated: false,
      error: null,
    });
  };

  const refreshUser = async () => {
    if (!state.isAuthenticated) return;
    
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const user = await api.user.getCurrentUser();
      setState(prev => ({
        ...prev,
        user,
        isLoading: false,
        error: null,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to refresh user',
      }));
    }
  };

  // Auto-login on mount using test user
  useEffect(() => {
    login();
  }, []);

  const contextValue: AuthContextType = {
    ...state,
    login,
    logout,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

// React 19.1 compatible hook using use() API
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// React 19.1 compatible hook for conditional context reading
export function useOptionalAuth() {
  return useContext(AuthContext);
}

// Promise-based auth state for React 19.1 use() API
export function createAuthPromise() {
  return new Promise<AuthContextType>((resolve, reject) => {
    // This would be used with use() API in components that need to suspend
    setTimeout(() => {
      const context = useOptionalAuth();
      if (context) {
        resolve(context);
      } else {
        reject(new Error('Auth context not available'));
      }
    }, 0);
  });
}