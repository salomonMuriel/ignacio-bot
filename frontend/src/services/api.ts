/**
 * API Service Layer for Ignacio Bot Frontend
 * Handles all HTTP requests to the FastAPI backend
 */

import type {
  User,
  Project,
  ProjectCreate,
  ProjectUpdate,
  Conversation,
  Message,
  AgentMessageResponse,
  ConversationDetailResponse,
  PromptTemplate,
  PromptTemplateCreate,
  PromptTemplateUpdate,
  TemplateType,
  UserFile,
  UserFileWithConversations,
  ProfileUpdate,
  ProfileCompletionStatusResponse,
  ProfileUpdateResponse
} from '@/types';

// API Base Configuration
const API_BASE_URL = 'http://localhost:8000';

// API Routes Configuration
const apiRoutes = {
  projects: {
    list: '/project/by_user/me',
    create: '/project/',
    details: (projectId: string) => `/project/${projectId}`,
    update: (projectId: string) => `/project/${projectId}`,
    delete: (projectId: string) => `/project/${projectId}`,
    context: (projectId: string) => `/project/${projectId}/context`,
    conversations: (projectId: string) => `/project/conversations/${projectId}`,
    types: '/project/types',
    stages: '/project/stages',
  },
  chat: {
    conversations: '/chat/conversations',
    messages: '/chat/messages',
    conversation: (conversationId: string) => `/chat/conversations/${conversationId}`,
    updateConversation: (conversationId: string) => `/chat/conversations/${conversationId}`,
    associateProject: (conversationId: string) => `/chat/conversations/${conversationId}/project`,
    conversationMessages: (conversationId: string) => `/chat/conversations/${conversationId}/messages`,
    summary: (conversationId: string) => `/chat/conversations/${conversationId}/summary`,
    interactions: (conversationId: string) => `/chat/conversations/${conversationId}/interactions`,
  },
  promptTemplates: {
    list: '/api/prompt-templates',
    details: (templateId: string) => `/api/prompt-templates/${templateId}`,
    create: '/api/prompt-templates',
    update: (templateId: string) => `/api/prompt-templates/${templateId}`,
    delete: (templateId: string) => `/api/prompt-templates/${templateId}`,
    tags: '/api/prompt-templates/tags/all',
  },
  files: {
    userFiles: () => `/files/user/me`,
    details: (fileId: string) => `/files/${fileId}`,
    url: (fileId: string) => `/files/${fileId}/url`,
    conversation: (conversationId: string) => `/files/conversation/${conversationId}`,
    delete: (fileId: string) => `/files/${fileId}`,
    download: (fileId: string) => `/files/${fileId}/download`,
    userFilesWithConversations: () => `/files/user/me/with-conversations`,
    fileConversations: (fileId: string) => `/files/${fileId}/conversations`,
    reuseFile: (fileId: string) => `/files/${fileId}/reuse`,
  },
  users: {
    updateProfile: () => `/users/profile`,
    getProfile: () => `/users/profile`,
    getProfileCompletion: () => `/users/profile/completion-status`
  }
};

// HTTP Client Configuration
class ApiClient {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    token: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.headers as Record<string, string>,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const config: RequestInit = {
      headers,
      ...options,
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.detail || `HTTP ${response.status}: ${response.statusText}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  async get<T>(endpoint: string, token: string): Promise<T> {
    return this.request<T>(endpoint, token, { method: 'GET' });
  }

  async post<T>(endpoint: string, data: unknown, token: string): Promise<T> {
    return this.request<T>(endpoint, token, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put<T>(endpoint: string, data: unknown, token: string): Promise<T> {
    return this.request<T>(endpoint, token, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete<T>(endpoint: string, token: string): Promise<T> {
    return this.request<T>(endpoint, token, { method: 'DELETE' });
  }

  async postFormData<T>(endpoint: string, formData: FormData, token: string): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;

    const headers: Record<string, string> = {};

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.detail || `HTTP ${response.status}: ${response.statusText}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error(`API form request failed: ${endpoint}`, error);
      throw error;
    }
  }
}

// Create API client instance
const apiClient = new ApiClient(API_BASE_URL);

// Project API Service
export const getProjects = (token: string): Promise<Project[]> => {
  return apiClient.get<Project[]>(apiRoutes.projects.list, token);
};

export const createProject = (projectData: ProjectCreate, token: string): Promise<Project> => {
  return apiClient.post<Project>(apiRoutes.projects.create, projectData, token);
};

export const getProject = (projectId: string, token: string): Promise<Project> => {
  return apiClient.get<Project>(apiRoutes.projects.details(projectId), token);
};

export const updateProject = (projectId: string, updates: ProjectUpdate, token: string): Promise<Project> => {
  return apiClient.put<Project>(apiRoutes.projects.update(projectId), updates, token);
};

export const deleteProject = (projectId: string, token: string): Promise<{ message: string }> => {
  return apiClient.delete<{ message: string }>(apiRoutes.projects.delete(projectId), token);
};

export const getProjectContext = (projectId: string, token: string): Promise<{
  project_id: string;
  project_name: string;
  project_type: string | null;
  description: string | null;
  current_stage: string | null;
  target_audience: string | null;
  problem_statement: string | null;
  solution_approach: string | null;
  business_model: string | null;
  context_data: Record<string, unknown>;
}> => {
  return apiClient.get(apiRoutes.projects.context(projectId), token);
};

export const updateProjectContext = (
  projectId: string,
  contextData: Record<string, unknown>,
  token: string
): Promise<{ message: string }> => {
  return apiClient.put(apiRoutes.projects.context(projectId), contextData, token);
};

export const getProjectConversations = (projectId: string, token: string): Promise<Conversation[]> => {
  return apiClient.get<Conversation[]>(apiRoutes.projects.conversations(projectId), token);
};

export const getProjectTypes = (token: string): Promise<Array<{ value: string; label: string }>> => {
  return apiClient.get<Array<{ value: string; label: string }>>(apiRoutes.projects.types, token);
};

export const getProjectStages = (token: string): Promise<Array<{ value: string; label: string }>> => {
  return apiClient.get<Array<{ value: string; label: string }>>(apiRoutes.projects.stages, token);
};

// Chat API Service
export const getConversations = (token: string): Promise<Conversation[]> => {
  return apiClient.get<Conversation[]>(apiRoutes.chat.conversations, token);
};

export const getConversation = (conversationId: string, token: string): Promise<ConversationDetailResponse> => {
  return apiClient.get<ConversationDetailResponse>(apiRoutes.chat.conversation(conversationId), token);
};

export const updateConversation = (
  conversationId: string,
  updates: { title?: string; project_id?: string },
  token: string
): Promise<Conversation> => {
  return apiClient.put<Conversation>(apiRoutes.chat.updateConversation(conversationId), updates, token);
};

export const deleteConversation = (conversationId: string, token: string): Promise<{ message: string }> => {
  return apiClient.delete<{ message: string }>(apiRoutes.chat.conversation(conversationId), token);
};

export const getMessages = (
  conversationId: string,
  token: string,
  limit: number = 50,
  offset: number = 0
): Promise<Message[]> => {
  const params = new URLSearchParams({
    limit: limit.toString(),
    offset: offset.toString(),
  });
  return apiClient.get<Message[]>(`${apiRoutes.chat.conversationMessages(conversationId)}?${params}`, token);
};

export const sendMessage = (params: {
  content: string;
  conversationId?: string;
  projectId?: string;
  file?: File;
  existingFileId?: string;
}, token: string): Promise<AgentMessageResponse> => {
  console.log('[API] Preparing sendMessage request:', {
    hasContent: !!params.content,
    hasConversationId: !!params.conversationId,
    hasProjectId: !!params.projectId,
    hasFile: !!params.file,
    hasExistingFileId: !!params.existingFileId,
    fileInfo: params.file ? {
      name: params.file.name,
      size: params.file.size,
      type: params.file.type
    } : null
  });

  const formData = new FormData();
  formData.append('content', params.content);

  if (params.conversationId) {
    formData.append('conversation_id', params.conversationId);
  }

  if (params.projectId) {
    formData.append('project_id', params.projectId);
  }

  if (params.file) {
    formData.append('file', params.file);
    console.log('[API] File attached to FormData:', {
      name: params.file.name,
      size: params.file.size
    });
  }

  if (params.existingFileId) {
    formData.append('existing_file_id', params.existingFileId);
    console.log('[API] Existing file ID attached to FormData:', params.existingFileId);
  }

  console.log('[API] Sending request to /messages endpoint');
  try {
    const response = apiClient.postFormData<AgentMessageResponse>(apiRoutes.chat.messages, formData, token);
    console.log('[API] Request successful');
    return response;
  } catch (error) {
    console.error('[API] Request failed:', error);
    throw error;
  }
};

export const associateConversationWithProject = (
  conversationId: string,
  projectId: string,
  token: string
): Promise<{ message: string }> => {
  return apiClient.put<{ message: string }>(
    apiRoutes.chat.associateProject(conversationId),
    { project_id: projectId },
    token
  );
};

export const getConversationSummary = (conversationId: string, token: string): Promise<{
  conversation_id: string;
  total_messages: number;
  agent_interactions: number;
  tools_used: string[];
  key_topics: string[];
  project_context: Record<string, unknown>;
  last_activity: string;
}> => {
  return apiClient.get(apiRoutes.chat.summary(conversationId), token);
};

export const getConversationInteractions = (conversationId: string, token: string): Promise<Array<{
  id: string;
  agent_name: string;
  input_text: string;
  output_text: string;
  tools_used: string[];
  execution_time_ms: number;
  created_at: string;
}>> => {
  return apiClient.get(apiRoutes.chat.interactions(conversationId), token);
};

// Prompt Templates API Service
export const getPromptTemplates = (
  token: string,
  activeOnly: boolean = true,
  tags?: string[],
  templateType?: TemplateType
): Promise<PromptTemplate[]> => {
  const params = new URLSearchParams();
  params.append('active_only', activeOnly.toString());

  if (tags && tags.length > 0) {
    tags.forEach(tag => params.append('tags', tag));
  }

  if (templateType) {
    params.append('template_type', templateType);
  }

  return apiClient.get<PromptTemplate[]>(`${apiRoutes.promptTemplates.list}?${params}`, token);
};

export const getTemplatesForUser = (token: string, activeOnly: boolean = true): Promise<{
  adminTemplates: PromptTemplate[];
  userTemplates: PromptTemplate[];
}> => {
  const adminParams = new URLSearchParams({
    active_only: activeOnly.toString(),
    template_type: 'admin'
  });
  const userParams = new URLSearchParams({
    active_only: activeOnly.toString(),
    template_type: 'user'
  });

  return Promise.all([
    apiClient.get<PromptTemplate[]>(`${apiRoutes.promptTemplates.list}?${adminParams}`, token),
    apiClient.get<PromptTemplate[]>(`${apiRoutes.promptTemplates.list}?${userParams}`, token)
  ]).then(([adminTemplates, userTemplates]) => ({ adminTemplates, userTemplates }));
};

export const getPromptTemplate = (templateId: string, token: string): Promise<PromptTemplate> => {
  return apiClient.get<PromptTemplate>(apiRoutes.promptTemplates.details(templateId), token);
};

export const createPromptTemplate = (templateData: PromptTemplateCreate, token: string): Promise<PromptTemplate> => {
  return apiClient.post<PromptTemplate>(apiRoutes.promptTemplates.create, templateData, token);
};

export const updatePromptTemplate = (
  templateId: string,
  templateData: PromptTemplateUpdate,
  userId: string,
  token: string
): Promise<PromptTemplate> => {
  const params = new URLSearchParams({ user_id: userId });
  return apiClient.put<PromptTemplate>(
    `${apiRoutes.promptTemplates.update(templateId)}?${params}`,
    templateData,
    token
  );
};

export const deletePromptTemplate = (templateId: string, userId: string, token: string): Promise<{ message: string }> => {
  const params = new URLSearchParams({ user_id: userId });
  return apiClient.delete<{ message: string }>(
    `${apiRoutes.promptTemplates.delete(templateId)}?${params}`,
    token
  );
};

export const getAllTags = (token: string): Promise<string[]> => {
  return apiClient.get<string[]>(apiRoutes.promptTemplates.tags, token);
};

// File API Service
export const getUserFiles = (token: string): Promise<UserFile[]> => {
  return apiClient.get<UserFile[]>(apiRoutes.files.userFiles(), token);
};

export const getFileMetadata = (fileId: string, userId: string, token: string): Promise<UserFile> => {
  return apiClient.get<UserFile>(`${apiRoutes.files.details(fileId)}?user_id=${userId}`, token);
};

export const getFileUrl = (fileId: string, userId: string, token: string, expiresIn: number = 3600): Promise<{ url: string; expires_in: number }> => {
  return apiClient.get<{ url: string; expires_in: number }>(`${apiRoutes.files.url(fileId)}?user_id=${userId}&expires_in=${expiresIn}`, token);
};

export const getConversationFiles = (conversationId: string, token: string): Promise<UserFile[]> => {
  return apiClient.get<UserFile[]>(apiRoutes.files.conversation(conversationId), token);
};

export const deleteFile = (fileId: string, userId: string, token: string): Promise<{ message: string }> => {
  return apiClient.delete<{ message: string }>(`${apiRoutes.files.delete(fileId)}?user_id=${userId}`, token);
};

export const downloadFile = async (fileId: string, userId: string, token: string): Promise<Blob> => {
  const headers: Record<string, string> = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = `${API_BASE_URL}${apiRoutes.files.download(fileId)}?user_id=${userId}`;
  const response = await fetch(url, { headers });

  if (!response.ok) {
    throw new Error(`Failed to download file: ${response.statusText}`);
  }

  return response.blob();
};

export const getUserFilesWithConversations = (token: string): Promise<UserFileWithConversations[]> => {
  return apiClient.get<UserFileWithConversations[]>(apiRoutes.files.userFilesWithConversations(), token);
};

export const getFileConversations = (fileId: string, userId: string, token: string): Promise<Array<{
  conversation_id: string;
  conversation_title: string;
  used_at: string;
}>> => {
  return apiClient.get(`${apiRoutes.files.fileConversations(fileId)}?user_id=${userId}`, token);
};

export const reuseFile = (fileId: string, conversationId: string, userId: string, token: string): Promise<{
  message: string;
  file_id: string;
  conversation_id: string;
}> => {
  return apiClient.post(`${apiRoutes.files.reuseFile(fileId)}?conversation_id=${conversationId}&user_id=${userId}`, {}, token);
};

export const getProfile = (token: string): Promise<User> => {
  return apiClient.get(`${apiRoutes.users.getProfile()}`, token);
};


export const updateProfile = (updatePayload: ProfileUpdate, token: string): Promise<ProfileUpdateResponse> => {
  return apiClient.put(`${apiRoutes.users.updateProfile()}`, updatePayload, token);
};

export const getProfileCompletion = (
  token: string
): Promise<ProfileCompletionStatusResponse> => {
  // Assuming a route like: apiRoutes.profile.completionStatus() -> '/profile/completion-status'
  return apiClient.get<ProfileCompletionStatusResponse>(
    apiRoutes.users.getProfileCompletion(), 
    token
  );
};

// Auth utility function to convert Auth0 user to User type
export const createUserFromAuth0 = (auth0User: any): User => {
  return {
    id: auth0User.sub,
    phone_number: auth0User.phone_number || '',
    name: auth0User.name || auth0User.nickname || 'Unknown User',
    is_active: true,
    is_admin: auth0User['https://app.ignacio.com/roles']?.includes('admin') || false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
};