/**
 * TypeScript types based on backend Pydantic models
 * Matches the database schema and API contracts
 */

// Enums
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

// Base interfaces
export interface User {
  id: string;
  phone_number: string;
  name: string | null;
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

export interface Conversation {
  id: string;
  user_id: string;
  title: string | null;
  project_id: string | null;
  openai_session_id: string | null;
  agent_state: Record<string, unknown>;
  project_context: Record<string, unknown>;
  language_preference: string;
  created_at: string;
  updated_at: string;
}

export interface ConversationCreate {
  user_id: string;
  title?: string;
  project_id?: string;
  openai_session_id?: string;
  agent_state?: Record<string, unknown>;
  project_context?: Record<string, unknown>;
  language_preference?: string;
}

export interface ConversationUpdate {
  title?: string;
  project_id?: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  user_id: string;
  content: string | null;
  message_type: MessageType;
  file_path: string | null;
  is_from_user: boolean;
  whatsapp_message_id: string | null;
  attachments: string[]; // Array of file IDs
  created_at: string;
}

export interface MessageCreate {
  conversation_id: string;
  user_id: string;
  content?: string;
  message_type?: MessageType;
  file_path?: string;
  is_from_user: boolean;
  whatsapp_message_id?: string;
  attachments?: string[];
}

export interface UserFile {
  id: string;
  user_id: string;
  file_name: string;
  file_path: string;
  file_type: string;
  file_size: number;
  conversation_id: string | null;
  openai_file_id: string | null;
  openai_vector_store_id: string | null;
  openai_uploaded_at: string | null;
  openai_sync_status: SyncStatus;
  content_preview: string | null;
  metadata: Record<string, unknown>;
  vector_store_id: string | null;
  created_at: string;
}

export interface UserFileCreate {
  user_id: string;
  file_name: string;
  file_path: string;
  file_type: string;
  file_size: number;
  conversation_id?: string;
  openai_file_id?: string;
  openai_vector_store_id?: string;
  openai_uploaded_at?: string;
  openai_sync_status?: SyncStatus;
  content_preview?: string;
  metadata?: Record<string, unknown>;
  vector_store_id?: string;
}

export interface Project {
  id: string;
  user_id: string;
  project_name: string;
  project_type: ProjectType | null;
  description: string | null;
  current_stage: ProjectStage | null;
  target_audience: string | null;
  problem_statement: string | null;
  solution_approach: string | null;
  business_model: string | null;
  context_data: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface ProjectCreate {
  user_id: string;
  project_name: string;
  project_type?: ProjectType;
  description?: string;
  current_stage?: ProjectStage;
  target_audience?: string;
  problem_statement?: string;
  solution_approach?: string;
  business_model?: string;
  context_data?: Record<string, unknown>;
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
  context_data?: Record<string, unknown>;
}

export interface UserSession {
  id: string;
  user_id: string;
  session_token: string;
  expires_at: string;
  created_at: string;
}

export interface UserSessionCreate {
  user_id: string;
  session_token: string;
  expires_at: string;
}

export interface OTPCode {
  id: string;
  phone_number: string;
  code: string;
  expires_at: string;
  is_used: boolean;
  created_at: string;
}

export interface OTPCodeCreate {
  phone_number: string;
  code: string;
  expires_at: string;
  is_used?: boolean;
}

export interface AgentInteraction {
  id: string;
  conversation_id: string;
  agent_name: string;
  input_text: string | null;
  output_text: string | null;
  tools_used: string[];
  execution_time_ms: number | null;
  created_at: string;
}

export interface AgentInteractionCreate {
  conversation_id: string;
  agent_name: string;
  input_text?: string;
  output_text?: string;
  tools_used?: string[];
  execution_time_ms?: number;
}

// Extended types for API responses
export interface ConversationWithMessages extends Conversation {
  messages: Message[];
}

export interface ConversationWithInteractions extends Conversation {
  interactions: AgentInteraction[];
}

export interface UserWithConversations extends User {
  conversations: Conversation[];
}

export interface UserWithProjects extends User {
  projects: Project[];
}

export interface MessageWithFiles extends Message {
  files: UserFile[];
}

export interface MessageWithAttachments extends Message {
  attachment_files: UserFile[];
}

export interface UserProjectWithFiles extends Project {
  files: UserFile[];
}

// Agent SDK specific types
export interface ConversationResult {
  conversation_id: string;
  response_text: string;
  agent_used: string;
  tools_called: string[];
  confidence_score: number;
  suggested_actions: string[];
  requires_followup: boolean;
  execution_time_ms: number;
}

export interface FileIntegrationResult {
  success: boolean;
  openai_file_id: string | null;
  vector_store_updated: boolean;
  content_preview: string | null;
  error_message: string | null;
}

export interface ConversationSummary {
  conversation_id: string;
  total_messages: number;
  agent_interactions: number;
  tools_used: string[];
  key_topics: string[];
  project_context: Record<string, unknown>;
  last_activity: string;
}

// Frontend-specific types
export interface APIResponse<T> {
  data: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  has_more: boolean;
}

export interface LoadingState {
  loading: boolean;
  error: string | null;
}

export interface FormState<T> {
  data: T;
  loading: boolean;
  error: string | null;
  touched: Record<keyof T, boolean>;
}

// UI specific types
export interface ProjectOption {
  value: string;
  label: string;
  type: ProjectType;
  stage: ProjectStage;
}

export interface ConversationListItem {
  id: string;
  title: string;
  last_message: string | null;
  last_activity: string;
  project_name: string | null;
  message_count: number;
}

export interface ChatMessage {
  id: string;
  content: string | null;
  is_from_user: boolean;
  message_type: MessageType;
  created_at: string;
  attachments?: UserFile[];
  loading?: boolean; // For optimistic updates
}

// Constants for the test user
export const TEST_USER_ID = "a456f25a-6269-4de3-87df-48b0a3389d01";