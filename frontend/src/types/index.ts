// TypeScript types matching backend Pydantic models

export enum MessageType {
  TEXT = "text",
  IMAGE = "image",
  AUDIO = "audio",
  VIDEO = "video",
  DOCUMENT = "document",
}

export enum ProjectType {
  STARTUP = "startup",
  COMPANY = "company",
  NGO = "ngo",
  FOUNDATION = "foundation",
  SPINOFF = "spinoff",
  INTERNAL = "internal",
  OTHER = "other",
}

export enum ProjectStage {
  IDEATION = "ideation",
  RESEARCH = "research",
  VALIDATION = "validation",
  DEVELOPMENT = "development",
  TESTING = "testing",
  LAUNCH = "launch",
  GROWTH = "growth",
  MATURE = "mature",
}

export enum SyncStatus {
  PENDING = "pending",
  SYNCING = "syncing",
  SYNCED = "synced",
  FAILED = "failed",
  EXPIRED = "expired",
  REMOVED = "removed",
}

export enum TemplateType {
  ADMIN = "admin",
  USER = "user",
}

// User types
export interface User {
  id: string;
  phone_number: string;
  name?: string;
  is_admin: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserCreate {
  phone_number: string;
  name?: string;
  is_admin?: boolean;
  is_active?: boolean;
}

export interface UserUpdate {
  name?: string;
  is_admin?: boolean;
  is_active?: boolean;
}

// Project types
export interface Project {
  id: string;
  user_id: string;
  project_name: string;
  project_type?: ProjectType;
  description?: string;
  current_stage?: ProjectStage;
  target_audience?: string;
  problem_statement?: string;
  solution_approach?: string;
  business_model?: string;
  context_data: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface ProjectCreate {
  project_name: string;
  project_type?: ProjectType;
  description?: string;
  current_stage?: ProjectStage;
  target_audience?: string;
  problem_statement?: string;
  solution_approach?: string;
  business_model?: string;
  context_data?: Record<string, any>;
}

export interface ProjectUpdate {
  project_name?: string;
  project_type?: ProjectType;
  description?: string;
  current_stage?: ProjectStage;
  target_audience?: string;
  problem_statement?: string;
  solution_approach?: string;
  business_model?: string;
  context_data?: Record<string, any>;
}

// Conversation types
export interface Conversation {
  id: string;
  user_id: string;
  title?: string;
  project_id?: string;
  openai_session_id?: string;
  agent_state: Record<string, any>;
  project_context: Record<string, any>;
  language_preference: string;
  created_at: string;
  updated_at: string;
}

export interface ConversationCreate {
  title?: string;
  project_id?: string;
}

export interface ConversationUpdate {
  title?: string;
  project_id?: string;
}

export interface ConversationResponse {
  id: string;
  title?: string;
  project_id?: string;
  created_at: string;
  updated_at: string;
  message_count: number;
  language_preference: string;
  project_context: Record<string, any>;
}

export interface ConversationDetailResponse extends ConversationResponse {
  messages: MessageResponse[];
}

// Message types
export interface Message {
  id: string;
  conversation_id: string;
  user_id: string;
  content?: string;
  message_type: MessageType;
  file_path?: string;
  is_from_user: boolean;
  whatsapp_message_id?: string;
  attachments: string[];
  created_at: string;
}

// Optimistic message status for UI
export enum OptimisticMessageStatus {
  PENDING = "pending",
  SENT = "sent",
  FAILED = "failed",
}

// Optimistic message for immediate UI feedback
export interface OptimisticMessage {
  id: string; // temporary ID for optimistic updates
  content: string;
  is_from_user: boolean;
  message_type: MessageType;
  created_at: string;
  status: OptimisticMessageStatus;
  error?: string;
  file_path?: string;
  attachments?: string[];
}

export interface MessageCreate {
  content: string;
  message_type?: MessageType;
}

export interface MessageResponse {
  id: string;
  content?: string;
  message_type: MessageType;
  is_from_user: boolean;
  created_at: string;
  file_path?: string;
  agent_used?: string;
  execution_time_ms?: number;
}

export interface AgentMessageResponse {
  message: MessageResponse;
  agent_used: string;
  tools_called: string[];
  confidence_score: number;
  execution_time_ms: number;
  conversation_id?: string;
}

// File types
export interface UserFile {
  id: string;
  user_id: string;
  file_name: string;
  file_path: string;
  file_type: string;
  file_size: number;
  conversation_id?: string;
  openai_file_id?: string;
  openai_vector_store_id?: string;
  openai_uploaded_at?: string;
  openai_sync_status: SyncStatus;
  content_preview?: string;
  metadata: Record<string, any>;
  vector_store_id?: string;
  created_at: string;
}

// Extended UserFile with conversation data for file reuse
export interface UserFileWithConversations extends UserFile {
  conversations?: Array<{
    conversation_id: string;
    conversation_title: string;
    used_at: string;
  }>;
  usage_count?: number;
}

// File selection type for modal
export interface FileSelection {
  type: 'new' | 'existing';
  file?: File;
  userFile?: UserFileWithConversations;
}

// API response types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  success: boolean;
}

export interface ApiError {
  detail: string;
}

// Form types for React Hook Form
export interface ProjectFormData {
  project_name: string;
  project_type: ProjectType;
  description: string;
  current_stage: ProjectStage;
  target_audience?: string;
  problem_statement?: string;
  solution_approach?: string;
  business_model?: string;
}

export interface MessageFormData {
  content: string;
  file?: File;
}

// Context types
export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (phoneNumber: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

export interface ProjectsContextType {
  projects: Project[];
  activeProject: Project | null;
  isLoading: boolean;
  error: string | null;
  fetchProjects: () => Promise<void>;
  createProject: (data: ProjectCreate) => Promise<Project>;
  updateProject: (id: string, data: ProjectUpdate) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  setActiveProject: (project: Project | null) => void;
}

export interface ConversationsContextType {
  conversations: ConversationResponse[];
  activeConversation: ConversationDetailResponse | null;
  isLoading: boolean;
  error: string | null;
  fetchConversations: () => Promise<void>;
  fetchConversation: (id: string) => Promise<void>;
  createConversation: (data: ConversationCreate) => Promise<ConversationResponse>;
  updateConversation: (id: string, data: ConversationUpdate) => Promise<void>;
  deleteConversation: (id: string) => Promise<void>;
  sendMessage: (content: string, file?: File) => Promise<void>;
  setActiveConversation: (conversation: ConversationDetailResponse | null) => void;
}

export interface GlobalContextType {
  theme: 'light' | 'dark';
  notifications: Notification[];
  isOnline: boolean;
  setTheme: (theme: 'light' | 'dark') => void;
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
}

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message?: string;
  duration?: number;
}

// Prompt Template types
export interface PromptTemplate {
  id: string;
  title: string;
  content: string;
  tags: string[];
  created_by: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  template_type: TemplateType;
}

export interface PromptTemplateCreate {
  title: string;
  content: string;
  tags: string[];
  created_by: string;
  is_active?: boolean;
  template_type?: TemplateType;
}

export interface PromptTemplateUpdate {
  title?: string;
  content?: string;
  tags?: string[];
  is_active?: boolean;
  template_type?: TemplateType;
}