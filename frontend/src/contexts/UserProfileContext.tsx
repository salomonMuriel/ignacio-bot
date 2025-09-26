/**
 * UserProfileContext - Simple User Profile Management
 * Fetches user profile once and makes it available globally
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useApi } from '@/hooks/useApi';
import { type User } from '@/types';

interface UserProfileContextType {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  isAdmin: boolean;
}

const UserProfileContext = createContext<UserProfileContextType | undefined>(undefined);

export function UserProfileProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading: authLoading } = useAuth0();
  const api = useApi();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated || authLoading) {
      setIsLoading(false);
      return;
    }

    const fetchUser = async () => {
      try {
        const userProfile = await api.getProfile();
        setUser(userProfile);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch user profile:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch profile');
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [isAuthenticated, authLoading]); // eslint-disable-line react-hooks/exhaustive-deps

  const contextValue: UserProfileContextType = {
    user,
    isLoading,
    error,
    isAdmin: user?.is_admin || false,
  };

  return (
    <UserProfileContext.Provider value={contextValue}>
      {children}
    </UserProfileContext.Provider>
  );
}

export function useUserProfile(): UserProfileContextType {
  const context = useContext(UserProfileContext);
  if (context === undefined) {
    throw new Error('useUserProfile must be used within a UserProfileProvider');
  }
  return context;
}