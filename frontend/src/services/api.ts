/**
 * API Service Layer for Ignacio Bot Frontend
 * Handles all HTTP requests to the FastAPI backend
 * Uses mocked authentication with test user for Phase 2
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
} from '@/types';

// Mock user ID from backend (Phase 2 - no authentication yet)
const MOCK_USER_ID = 'a456f25a-6269-4de3-87df-48b0a3389d01';

// API Base Configuration
const API_BASE_URL = 'http://localhost:8000';
const CHAT_BASE_URL = `${API_BASE_URL}/chat`;
const PROJECT_BASE_URL = `${API_BASE_URL}/project`;

// HTTP Client Configuration
class ApiClient {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
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

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put<T>(endpoint: string, data: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  async postFormData<T>(endpoint: string, formData: FormData): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        method: 'POST',
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

// Create API client instances
const chatClient = new ApiClient(CHAT_BASE_URL);
const projectClient = new ApiClient(PROJECT_BASE_URL);

// Project API Service
export const projectApi = {
  // Get all projects for current user
  async getProjects(): Promise<Project[]> {
    return projectClient.get<Project[]>(`/by_user/${MOCK_USER_ID}`);
  },

  // Create new project
  async createProject(projectData: Omit<ProjectCreate, 'user_id'>): Promise<Project> {
    const data: ProjectCreate = {
      ...projectData,
      user_id: MOCK_USER_ID,
    };
    return projectClient.post<Project>('/', data);
  },

  // Get project by ID
  async getProject(projectId: string): Promise<Project> {
    return projectClient.get<Project>(`/${projectId}`);
  },

  // Update project
  async updateProject(projectId: string, updates: ProjectUpdate): Promise<Project> {
    return projectClient.put<Project>(`/${projectId}`, updates);
  },

  // Delete project
  async deleteProject(projectId: string): Promise<{ message: string }> {
    return projectClient.delete<{ message: string }>(`/${projectId}`);
  },

  // Get project context
  async getProjectContext(projectId: string): Promise<{
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
  }> {
    return projectClient.get(`/${projectId}/context`);
  },

  // Update project context
  async updateProjectContext(
    projectId: string, 
    contextData: Record<string, unknown>
  ): Promise<{ message: string }> {
    return projectClient.put(`/${projectId}/context`, contextData);
  },

  // Get project conversations
  async getProjectConversations(projectId: string): Promise<Conversation[]> {
    return projectClient.get<Conversation[]>(`/conversations/${projectId}`);
  },

  // Get available project types
  async getProjectTypes(): Promise<Array<{ value: string; label: string }>> {
    return projectClient.get<Array<{ value: string; label: string }>>('/types');
  },

  // Get available project stages
  async getProjectStages(): Promise<Array<{ value: string; label: string }>> {
    return projectClient.get<Array<{ value: string; label: string }>>('/stages');
  },
};

// Chat API Service
export const chatApi = {
  // Get all conversations for current user
  async getConversations(): Promise<Conversation[]> {
    return chatClient.get<Conversation[]>('/conversations');
  },

  // Get conversation with messages
  async getConversation(conversationId: string): Promise<ConversationDetailResponse> {
    return chatClient.get<ConversationDetailResponse>(`/conversations/${conversationId}`);
  },

  // Update conversation (title, project association)
  async updateConversation(
    conversationId: string, 
    updates: { title?: string; project_id?: string }
  ): Promise<Conversation> {
    return chatClient.put<Conversation>(`/conversations/${conversationId}`, updates);
  },

  // Delete conversation
  async deleteConversation(conversationId: string): Promise<{ message: string }> {
    return chatClient.delete<{ message: string }>(`/conversations/${conversationId}`);
  },

  // Get messages for a conversation
  async getMessages(
    conversationId: string, 
    limit: number = 50, 
    offset: number = 0
  ): Promise<Message[]> {
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
    });
    return chatClient.get<Message[]>(`/conversations/${conversationId}/messages?${params}`);
  },

  // Send message (unified endpoint - handles both new and existing conversations)
  async sendMessage(params: {
    content: string;
    conversationId?: string;
    projectId?: string;
    file?: File;
  }): Promise<AgentMessageResponse> {
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
    }

    return chatClient.postFormData<AgentMessageResponse>('/messages', formData);
  },

  // Associate conversation with project
  async associateConversationWithProject(
    conversationId: string, 
    projectId: string
  ): Promise<{ message: string }> {
    return chatClient.put<{ message: string }>(
      `/conversations/${conversationId}/project`, 
      { project_id: projectId }
    );
  },

  // Get conversation summary
  async getConversationSummary(conversationId: string): Promise<{
    conversation_id: string;
    total_messages: number;
    agent_interactions: number;
    tools_used: string[];
    key_topics: string[];
    project_context: Record<string, unknown>;
    last_activity: string;
  }> {
    return chatClient.get(`/conversations/${conversationId}/summary`);
  },

  // Get conversation interactions
  async getConversationInteractions(conversationId: string): Promise<Array<{
    id: string;
    agent_name: string;
    input_text: string;
    output_text: string;
    tools_used: string[];
    execution_time_ms: number;
    created_at: string;
  }>> {
    return chatClient.get(`/conversations/${conversationId}/interactions`);
  },
};

// Prompt Templates API Client
const promptTemplateClient = new ApiClient();

const promptTemplateApi = {
  // Get all prompt templates with optional filtering
  async getPromptTemplates(
    activeOnly: boolean = true, 
    tags?: string[], 
    templateType?: TemplateType, 
    userId?: string
  ): Promise<PromptTemplate[]> {
    const params = new URLSearchParams();
    params.append('active_only', activeOnly.toString());
    
    if (tags && tags.length > 0) {
      tags.forEach(tag => params.append('tags', tag));
    }
    
    if (templateType) {
      params.append('template_type', templateType);
    }
    
    if (userId) {
      params.append('user_id', userId);
    }
    
    return promptTemplateClient.get<PromptTemplate[]>(`/api/prompt-templates?${params}`);
  },

  // Get templates available to a specific user (admin + user's own templates)
  async getTemplatesForUser(userId: string, activeOnly: boolean = true): Promise<{
    adminTemplates: PromptTemplate[];
    userTemplates: PromptTemplate[];
  }> {
    const [adminTemplates, userTemplates] = await Promise.all([
      // Get admin templates (visible to all users)
      promptTemplateClient.get<PromptTemplate[]>(`/api/prompt-templates?active_only=${activeOnly}&template_type=admin`),
      // Get user's own templates
      promptTemplateClient.get<PromptTemplate[]>(`/api/prompt-templates?active_only=${activeOnly}&template_type=user&user_id=${userId}`)
    ]);
    
    return { adminTemplates, userTemplates };
  },

  // Get a specific prompt template
  async getPromptTemplate(templateId: string): Promise<PromptTemplate> {
    return promptTemplateClient.get<PromptTemplate>(`/api/prompt-templates/${templateId}`);
  },

  // Create a new prompt template (type determined by user's admin status)
  async createPromptTemplate(templateData: PromptTemplateCreate): Promise<PromptTemplate> {
    return promptTemplateClient.post<PromptTemplate>('/api/prompt-templates', templateData);
  },

  // Update a prompt template (with ownership validation)
  async updatePromptTemplate(
    templateId: string, 
    templateData: PromptTemplateUpdate, 
    userId: string
  ): Promise<PromptTemplate> {
    const params = new URLSearchParams({ user_id: userId });
    return promptTemplateClient.put<PromptTemplate>(
      `/api/prompt-templates/${templateId}?${params}`, 
      templateData
    );
  },

  // Delete a prompt template (with ownership validation)
  async deletePromptTemplate(templateId: string, userId: string): Promise<{ message: string }> {
    const params = new URLSearchParams({ user_id: userId });
    return promptTemplateClient.delete<{ message: string }>(
      `/api/prompt-templates/${templateId}?${params}`
    );
  },

  // Get all unique tags
  async getAllTags(): Promise<string[]> {
    return promptTemplateClient.get<string[]>('/api/prompt-templates/tags/all');
  },
};

// Combined API service export
export const api = {
  projects: projectApi,
  chat: chatApi,
  promptTemplates: promptTemplateApi,
  
  // Mock authentication service for Phase 2
  auth: {
    // Mock current user
    async getCurrentUser(): Promise<User> {
      return {
        id: MOCK_USER_ID,
        phone_number: '+1234567890',
        name: 'Salomon',
        is_active: true,
        is_admin: false, // Regular user for testing
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    },

    // Mock login (will be implemented in Phase 4)
    async login(whatsappNumber: string): Promise<{ message: string }> {
      console.log('Mock login for:', whatsappNumber);
      return { message: 'Mock login successful' };
    },

    // Mock OTP verification (will be implemented in Phase 4)
    async verifyOTP(whatsappNumber: string, otp: string): Promise<{ token: string; user: User }> {
      console.log('Mock OTP verification for:', whatsappNumber, otp);
      const user = await this.getCurrentUser();
      return { token: 'mock-jwt-token', user };
    },

    // Mock logout
    async logout(): Promise<void> {
      console.log('Mock logout');
    },
  },
};

export default api;