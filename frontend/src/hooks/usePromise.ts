/**
 * React 19.1 compatible hooks using the use() API for promise handling
 * Provides suspense-compatible promise consumption
 */

import { use } from 'react';
import { api } from '@/services/api';
import { TEST_USER_ID } from '@/types';

// Generic promise wrapper for use() API
export function usePromise<T>(promise: Promise<T>): T {
  return use(promise);
}

// Conditional promise hook for React 19.1
export function useConditionalPromise<T>(
  promise: Promise<T> | null,
  fallback: T
): T {
  if (!promise) return fallback;
  return use(promise);
}

// Promise factory functions for React 19.1 use() API
export const createPromiseAPI = {
  // User data
  user: (_userId: string = TEST_USER_ID) => 
    api.user.getCurrentUser(),

  // Projects data
  projects: (userId: string = TEST_USER_ID) => 
    api.projects.list(userId),

  project: (projectId: string) => 
    api.projects.get(projectId),

  // Conversations data
  conversations: (userId: string = TEST_USER_ID) => 
    api.conversations.list(userId),

  conversation: (conversationId: string) => 
    api.conversations.get(conversationId),

  // Messages data
  messages: (conversationId: string) => 
    api.messages.list(conversationId),

  // Files data
  userFiles: (userId: string = TEST_USER_ID) => 
    api.files.getUserFiles(userId),

  conversationFiles: (conversationId: string) => 
    api.files.getConversationFiles(conversationId),

  // Health check
  health: () => 
    api.health.check(),
};

// Promise cache for performance optimization
const promiseCache = new Map<string, Promise<unknown>>();

export function cachedPromise<T>(key: string, promiseFactory: () => Promise<T>): Promise<T> {
  if (promiseCache.has(key)) {
    return promiseCache.get(key) as Promise<T>;
  }
  
  const promise = promiseFactory();
  promiseCache.set(key, promise);
  
  // Clear from cache after 5 minutes to prevent stale data
  setTimeout(() => {
    promiseCache.delete(key);
  }, 5 * 60 * 1000);
  
  return promise;
}

// Cached promise factory functions for better performance
export const createCachedPromiseAPI = {
  user: (userId: string = TEST_USER_ID) => 
    cachedPromise(`user-${userId}`, () => api.user.getCurrentUser()),

  projects: (userId: string = TEST_USER_ID) => 
    cachedPromise(`projects-${userId}`, () => api.projects.list(userId)),

  project: (projectId: string) => 
    cachedPromise(`project-${projectId}`, () => api.projects.get(projectId)),

  conversations: (userId: string = TEST_USER_ID) => 
    cachedPromise(`conversations-${userId}`, () => api.conversations.list(userId)),

  conversation: (conversationId: string) => 
    cachedPromise(`conversation-${conversationId}`, () => api.conversations.get(conversationId)),
};

// Clear all cached promises
export function clearPromiseCache() {
  promiseCache.clear();
}

// Clear specific cached promise
export function clearCachedPromise(key: string) {
  promiseCache.delete(key);
}