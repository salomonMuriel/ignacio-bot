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
}

export interface Conversation {
  id: string;
  title: string | null;
  created_at: string;
  updated_at: string;
  message_count: number;
}

export interface ConversationWithMessages extends Conversation {
  messages: Message[];
}

// API Request types
export interface ConversationCreateRequest {
  title?: string;
}

export interface MessageCreateRequest {
  content: string;
  message_type?: MessageType;
}

// API Response types
export interface ConversationResponse extends Conversation {}

export interface ConversationDetailResponse extends ConversationWithMessages {}

export interface MessageResponse extends Message {}

// Frontend-specific types
export interface ChatState {
  conversations: Conversation[];
  currentConversation: ConversationWithMessages | null;
  isLoading: boolean;
  error: string | null;
}
