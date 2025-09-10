export interface User {
  id: string;
  phone_number: string;
  is_admin: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AuthContextType {
  user: User | null;
  login: (phoneNumber: string, otp: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

// Chat-related types matching backend API models

export enum MessageType {
  TEXT = 'text',
  IMAGE = 'image',
  AUDIO = 'audio',
  VIDEO = 'video',
  DOCUMENT = 'document',
}

export interface Message {
  id: string;
  content: string | null;
  message_type: MessageType;
  is_from_user: boolean;
  created_at: string;
  file_path?: string | null;
  agent_used?: string | null;
  execution_time_ms?: number | null;
}

export interface Conversation {
  id: string;
  title: string | null;
  project_id: string | null;
  created_at: string;
  updated_at: string;
  message_count: number;
  language_preference?: string;
  project_context?: any;
}

export interface ConversationWithMessages extends Conversation {
  messages: Message[];
}

// API Request types
export interface ConversationCreateRequest {
  title?: string;
  project_id?: string;
}

export interface ConversationStartRequest {
  initial_message: string;
  title?: string;
  project_id?: string;
}

export interface MessageCreateRequest {
  content: string;
  message_type?: MessageType;
}

// API Response types
export interface ConversationResponse extends Conversation {}

export interface ConversationDetailResponse extends ConversationWithMessages {}

export interface MessageResponse extends Message {}

// Agent SDK Response types
export interface AgentMessageResponse {
  message: MessageResponse;
  agent_used: string;
  tools_called: string[];
  confidence_score: number;
  execution_time_ms: number;
  conversation_id?: string | null;
}

// Project-related types
export type ProjectType = 'startup' | 'ngo' | 'foundation' | 'spinoff' | 'internal' | 'other';
export type ProjectStage = 'ideation' | 'research' | 'validation' | 'development' | 'testing' | 'launch' | 'growth' | 'mature';

export interface Project {
  id: string;
  user_id: string;
  name: string;
  type: ProjectType;
  stage: ProjectStage;
  description: string | null;
  context: any;
  created_at: string;
  updated_at: string;
}

export interface ProjectCreateRequest {
  name: string;
  type: ProjectType;
  stage: ProjectStage;
  description?: string;
  context?: any;
}

export interface ProjectUpdateRequest {
  name?: string;
  type?: ProjectType;
  stage?: ProjectStage;
  description?: string;
  context?: any;
}

export interface ProjectTemplate {
  name: string;
  type: ProjectType;
  stage: ProjectStage;
  description: string;
  context: any;
}

// File-related types
export interface UserFile {
  id: string;
  user_id: string;
  file_name: string;
  file_path: string;
  file_type: string;
  file_size: number;
  created_at: string;
}

export interface FileUploadRequest {
  user_id: string;
  file: File;
}

export interface FileValidation {
  maxSize: number; // 10MB in bytes
  allowedTypes: string[];
  allowedExtensions: string[];
}

// Frontend-specific types
export interface ChatState {
  conversations: Conversation[];
  currentConversation: ConversationWithMessages | null;
  isLoading: boolean;
  error: string | null;
}

export interface ProjectState {
  projects: Project[];
  activeProject: Project | null;
  isLoading: boolean;
  error: string | null;
}

export interface AppState {
  user: User | null;
  projects: Project[];
  activeProject: Project | null;
  conversations: Conversation[];
  currentConversation: ConversationWithMessages | null;
  isLoading: boolean;
  error: string | null;
}

export interface FileUploadState {
  isUploading: boolean;
  progress: number;
  error: string | null;
  uploadedFiles: UserFile[];
}
