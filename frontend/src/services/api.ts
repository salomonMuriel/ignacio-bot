/**
 * API client for FastAPI backend
 * Type-safe client with React 19.1 use() API support for promise handling
 */

import {
  User,
  UserUpdate,
  Conversation,
  ConversationCreate,
  ConversationUpdate,
  ConversationWithMessages,
  MessageWithAttachments,
  UserFile,
  Project,
  ProjectCreate,
  ProjectUpdate,
  ProjectType,
  ProjectStage,
  ConversationResult,
  TEST_USER_ID,
} from '@/types';

// Base configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Custom error class for API errors
export class APIError extends Error {
  constructor(
    public status: number,
    message: string,
    public response?: unknown
  ) {
    super(message);
    this.name = 'APIError';
  }
}

// Base fetch wrapper with error handling
async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config: RequestInit = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorData = await response.text();
      let errorMessage = `HTTP ${response.status}`;
      
      try {
        const parsed = JSON.parse(errorData);
        errorMessage = parsed.detail || parsed.message || errorMessage;
      } catch {
        errorMessage = errorData || errorMessage;
      }
      
      throw new APIError(response.status, errorMessage, errorData);
    }

    // Handle empty responses
    if (response.status === 204) {
      return {} as T;
    }

    const data = await response.json();
    return data;
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }
    throw new APIError(0, `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Utility function for FormData requests (file uploads)
async function apiFormFetch<T>(
  endpoint: string,
  formData: FormData,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config: RequestInit = {
    method: 'POST',
    ...options,
    body: formData,
    // Don't set Content-Type header for FormData - let browser set it with boundary
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorData = await response.text();
      let errorMessage = `HTTP ${response.status}`;
      
      try {
        const parsed = JSON.parse(errorData);
        errorMessage = parsed.detail || parsed.message || errorMessage;
      } catch {
        errorMessage = errorData || errorMessage;
      }
      
      throw new APIError(response.status, errorMessage, errorData);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }
    throw new APIError(0, `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Health endpoints
export const healthAPI = {
  check: (): Promise<{ status: string; timestamp: string; environment: string; version: string }> =>
    apiFetch('/health/'),
    
  database: (): Promise<{ status: string; database: string; timestamp: string }> =>
    apiFetch('/health/database'),
};

// User endpoints  
export const userAPI = {
  // For now, we'll use the test user ID
  getCurrentUser: (): Promise<User> =>
    apiFetch(`/users/${TEST_USER_ID}`),
    
  updateUser: (userData: UserUpdate): Promise<User> =>
    apiFetch(`/users/${TEST_USER_ID}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    }),
};

// Conversation endpoints
export const conversationAPI = {
  list: (userId: string = TEST_USER_ID): Promise<Conversation[]> =>
    apiFetch(`/api/chat/conversations?user_id=${userId}`),

  get: (conversationId: string): Promise<ConversationWithMessages> =>
    apiFetch(`/api/chat/conversations/${conversationId}`),

  create: (data: Omit<ConversationCreate, 'user_id'>): Promise<Conversation> =>
    apiFetch('/api/chat/conversations', {
      method: 'POST',
      body: JSON.stringify({
        ...data,
        user_id: TEST_USER_ID,
      }),
    }),

  update: (conversationId: string, data: ConversationUpdate): Promise<Conversation> =>
    apiFetch(`/api/chat/conversations/${conversationId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (conversationId: string): Promise<void> =>
    apiFetch(`/api/chat/conversations/${conversationId}`, {
      method: 'DELETE',
    }),

  // Start a new conversation with optional project
  start: (projectId?: string, title?: string): Promise<Conversation> =>
    apiFetch('/api/chat/conversations/start', {
      method: 'POST',
      body: JSON.stringify({
        user_id: TEST_USER_ID,
        project_id: projectId,
        title: title,
      }),
    }),

  // Update conversation project association
  setProject: (conversationId: string, projectId: string | null): Promise<Conversation> =>
    apiFetch(`/api/chat/conversations/${conversationId}/project`, {
      method: 'PUT',
      body: JSON.stringify({ project_id: projectId }),
    }),
};

// Message endpoints
export const messageAPI = {
  // Send a message using the unified endpoint
  send: (conversationId: string, content: string, files?: File[]): Promise<ConversationResult> => {
    const formData = new FormData();
    formData.append('conversation_id', conversationId);
    formData.append('user_id', TEST_USER_ID);
    formData.append('message', content);
    
    // Add files if provided
    if (files && files.length > 0) {
      files.forEach((file) => {
        formData.append(`files`, file);
      });
    }

    return apiFormFetch('/api/chat/messages', formData);
  },

  // Get messages for a conversation
  list: (conversationId: string): Promise<MessageWithAttachments[]> =>
    apiFetch(`/api/chat/conversations/${conversationId}/messages`),
};

// Project endpoints
export const projectAPI = {
  list: (userId: string = TEST_USER_ID): Promise<Project[]> =>
    apiFetch(`/project/?user_id=${userId}`),

  get: (projectId: string): Promise<Project> =>
    apiFetch(`/project/${projectId}`),

  create: (data: Omit<ProjectCreate, 'user_id'>): Promise<Project> =>
    apiFetch('/project/', {
      method: 'POST',
      body: JSON.stringify({
        ...data,
        user_id: TEST_USER_ID,
      }),
    }),

  update: (projectId: string, data: ProjectUpdate): Promise<Project> =>
    apiFetch(`/project/${projectId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (projectId: string): Promise<void> =>
    apiFetch(`/project/${projectId}`, {
      method: 'DELETE',
    }),

  // Get project types
  getTypes: (): Promise<{ types: ProjectType[] }> =>
    apiFetch('/project/types'),

  // Get project stages  
  getStages: (): Promise<{ stages: ProjectStage[] }> =>
    apiFetch('/project/stages'),

  // Get conversations for a project
  getConversations: (projectId: string): Promise<Conversation[]> =>
    apiFetch(`/project/${projectId}/conversations`),

  // Get/update project context
  getContext: (projectId: string): Promise<{ context_data: Record<string, unknown> }> =>
    apiFetch(`/project/${projectId}/context`),

  updateContext: (projectId: string, contextData: Record<string, unknown>): Promise<{ context_data: Record<string, unknown> }> =>
    apiFetch(`/project/${projectId}/context`, {
      method: 'PUT',
      body: JSON.stringify({ context_data: contextData }),
    }),
};

// File endpoints
export const fileAPI = {
  // Upload file to user's storage
  upload: (file: File, userId: string = TEST_USER_ID): Promise<UserFile> => {
    const formData = new FormData();
    formData.append('user_id', userId);
    formData.append('file', file);

    return apiFormFetch('/files/upload', formData);
  },

  // Upload file to conversation
  uploadToConversation: (conversationId: string, file: File, userId: string = TEST_USER_ID): Promise<UserFile> => {
    const formData = new FormData();
    formData.append('user_id', userId);
    formData.append('file', file);

    return apiFormFetch(`/files/conversations/${conversationId}/files`, formData);
  },

  // Get file metadata
  get: (fileId: string, userId: string = TEST_USER_ID): Promise<UserFile> =>
    apiFetch(`/files/${fileId}?user_id=${userId}`),

  // Get download URL
  getDownloadUrl: (fileId: string, userId: string = TEST_USER_ID, expiresIn: number = 3600): Promise<{ url: string; expires_in: number }> =>
    apiFetch(`/files/${fileId}/url?user_id=${userId}&expires_in=${expiresIn}`),

  // Get user files
  getUserFiles: (userId: string = TEST_USER_ID): Promise<UserFile[]> =>
    apiFetch(`/files/user/${userId}`),

  // Get conversation files
  getConversationFiles: (conversationId: string): Promise<UserFile[]> =>
    apiFetch(`/files/conversation/${conversationId}`),

  // Delete file
  delete: (fileId: string, userId: string = TEST_USER_ID): Promise<{ message: string }> =>
    apiFetch(`/files/${fileId}?user_id=${userId}`, {
      method: 'DELETE',
    }),
};

// Combined API object
export const api = {
  health: healthAPI,
  user: userAPI,
  conversations: conversationAPI,
  messages: messageAPI,
  projects: projectAPI,
  files: fileAPI,
};

// React 19.1 compatible wrappers using use() API
export const createPromiseWrapper = <T>(promise: Promise<T>) => {
  return {
    read: () => promise,
    promise,
  };
};

// SWR-compatible fetchers
export const swrFetchers = {
  conversations: (url: string) => {
    const userId = url.split('user_id=')[1] || TEST_USER_ID;
    return conversationAPI.list(userId);
  },
  
  conversation: (url: string) => {
    const conversationId = url.split('/conversations/')[1]?.split('?')[0];
    if (!conversationId) throw new Error('Invalid conversation URL');
    return conversationAPI.get(conversationId);
  },
  
  projects: (url: string) => {
    const userId = url.split('user_id=')[1] || TEST_USER_ID;
    return projectAPI.list(userId);
  },
  
  project: (url: string) => {
    const projectId = url.split('/project/')[1]?.split('?')[0];
    if (!projectId) throw new Error('Invalid project URL');
    return projectAPI.get(projectId);
  },
  
  messages: (url: string) => {
    const conversationId = url.split('/conversations/')[1]?.split('/messages')[0];
    if (!conversationId) throw new Error('Invalid messages URL');
    return messageAPI.list(conversationId);
  },
  
  files: (url: string) => {
    if (url.includes('/user/')) {
      const userId = url.split('/user/')[1] || TEST_USER_ID;
      return fileAPI.getUserFiles(userId);
    } else if (url.includes('/conversation/')) {
      const conversationId = url.split('/conversation/')[1];
      if (!conversationId) throw new Error('Invalid files URL');
      return fileAPI.getConversationFiles(conversationId);
    }
    throw new Error('Invalid files URL');
  },
};

export default api;