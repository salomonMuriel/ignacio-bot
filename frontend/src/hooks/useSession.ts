/**
 * SuperTokens Session Hook
 * Simple hook for session management using SuperTokens native methods
 */

import { useState, useEffect } from 'react';
import Session from "supertokens-auth-react/recipe/session";
import type { User } from '@/types';

interface UseSessionReturn {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  roles: string[];
  permissions: string[];
  isAdmin: boolean;
  refreshUser: () => Promise<void>;
}

// Helper function to extract user data from SuperTokens session
const extractUserFromSession = async (): Promise<User | null> => {
  try {
    const sessionExists = await Session.doesSessionExist();
    if (!sessionExists) return null;

    const userId = await Session.getUserId();
    const payload = await Session.getAccessTokenPayloadSecurely();

    // Debug: Log session data to see what's available
    console.log('🔍 SuperTokens Session Data:');
    console.log('userId:', userId);
    console.log('payload:', payload);
    console.log('payload keys:', Object.keys(payload));

    // Extract roles from SuperTokens payload
    const roles = payload['st-role']?.v || [];
    const permissions = payload['st-perm']?.v || [];
    const isAdmin = roles.includes('admin');

    console.log('👤 Extracted roles:', roles);
    console.log('🔑 Extracted permissions:', permissions);
    console.log('🛡️ Is admin:', isAdmin);

    // Map SuperTokens session data to our User interface
    const user: User = {
      id: userId, // Use the userId from SuperTokens
      phone_number: '', // Not available in session payload - would need backend call if needed
      name: '', // Not available in session payload - would need backend call if needed
      is_admin: isAdmin, // Extract from roles
      is_active: true, // Sessions are active by definition
      created_at: new Date(payload.iat * 1000).toISOString(), // Convert from Unix timestamp
      updated_at: new Date().toISOString(),
    };

    console.log('📦 Mapped User object:', user);

    return user;
  } catch (error) {
    console.error('Failed to extract user from session:', error);
    return null;
  }
};

export const useSession = (): UseSessionReturn => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [roles, setRoles] = useState<string[]>([]);
  const [permissions, setPermissions] = useState<string[]>([]);

  const checkSession = async () => {
    try {
      setIsLoading(true);
      const sessionExists = await Session.doesSessionExist();
      setIsAuthenticated(sessionExists);

      if (sessionExists) {
        const userData = await extractUserFromSession();
        setUser(userData);

        // Also extract roles and permissions for easy access
        const payload = await Session.getAccessTokenPayloadSecurely();
        const userRoles = payload?.['st-role']?.v || [];
        const userPermissions = payload?.['st-perm']?.v || [];

        setRoles(userRoles);
        setPermissions(userPermissions);
      } else {
        setUser(null);
        setRoles([]);
        setPermissions([]);
      }
    } catch (error) {
      console.error('Session check failed:', error);
      setIsAuthenticated(false);
      setUser(null);
      setRoles([]);
      setPermissions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshUser = async () => {
    await checkSession();
  };

  useEffect(() => {
    checkSession();
  }, []);

  return {
    user,
    isAuthenticated,
    isLoading,
    roles,
    permissions,
    isAdmin: roles.includes('admin'),
    refreshUser,
  };
};