/**
 * SuperTokens Auth Utilities
 * Simple utilities wrapping SuperTokens session management
 */

import Session from "supertokens-auth-react/recipe/session";
import { redirectToAuth, signOut } from "supertokens-auth-react";

/**
 * Check if user has an active session
 */
export const isAuthenticated = async (): Promise<boolean> => {
  return await Session.doesSessionExist();
};

/**
 * Redirect to SuperTokens auth page
 */
export const login = () => {
  redirectToAuth();
};

/**
 * Sign out user
 */
export const logout = async (): Promise<void> => {
  try {
    await signOut();
  } catch (error) {
    console.error('Logout failed:', error);
    // Still redirect to clear local state
    window.location.href = '/';
  }
};

/**
 * Get session information
 */
export const getSessionInfo = async () => {
  try {
    const sessionExists = await Session.doesSessionExist();
    if (!sessionExists) return null;

    return await Session.getAccessTokenPayloadSecurely();
  } catch (error) {
    console.error('Failed to get session info:', error);
    return null;
  }
};

/**
 * Get user roles from session
 */
export const getUserRoles = async (): Promise<string[]> => {
  try {
    const payload = await getSessionInfo();
    return payload?.['st-role']?.v || [];
  } catch (error) {
    console.error('Failed to get user roles:', error);
    return [];
  }
};

/**
 * Get user permissions from session
 */
export const getUserPermissions = async (): Promise<string[]> => {
  try {
    const payload = await getSessionInfo();
    return payload?.['st-perm']?.v || [];
  } catch (error) {
    console.error('Failed to get user permissions:', error);
    return [];
  }
};

/**
 * Check if user has a specific role
 */
export const hasRole = async (role: string): Promise<boolean> => {
  const roles = await getUserRoles();
  return roles.includes(role);
};

/**
 * Check if user is admin
 */
export const isAdmin = async (): Promise<boolean> => {
  return await hasRole('admin');
};

/**
 * Check if user has a specific permission
 */
export const hasPermission = async (permission: string): Promise<boolean> => {
  const permissions = await getUserPermissions();
  return permissions.includes(permission);
};