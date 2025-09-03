/**
 * Chat Service for Ignacio Bot
 * Handles all chat-related API calls to the backend
 */

import { apiClient } from './api';
import {
  Conversation,
  ConversationWithMessages,
  ConversationCreateRequest,
  ConversationResponse,
  ConversationDetailResponse,
  Message,
  MessageCreateRequest,
  MessageResponse,
} from '../types';

export class ChatService {
  private readonly basePath = '/api/chat';

  /**
   * Get all conversations for the current user
   */
  async getConversations(): Promise<Conversation[]> {
    try {
      const response = await apiClient.get<ConversationResponse[]>(
        `${this.basePath}/conversations`
      );
      return response.data;
    } catch (error) {
      console.error('Failed to get conversations:', error);
      throw error;
    }
  }

  /**
   * Create a new conversation
   */
  async createConversation(data: ConversationCreateRequest): Promise<Conversation> {
    try {
      const response = await apiClient.post<ConversationResponse>(
        `${this.basePath}/conversations`,
        data
      );
      return response.data;
    } catch (error) {
      console.error('Failed to create conversation:', error);
      throw error;
    }
  }

  /**
   * Get a specific conversation with all its messages
   */
  async getConversationDetails(conversationId: string): Promise<ConversationWithMessages> {
    try {
      const response = await apiClient.get<ConversationDetailResponse>(
        `${this.basePath}/conversations/${conversationId}`
      );
      return response.data;
    } catch (error) {
      console.error(`Failed to get conversation ${conversationId}:`, error);
      throw error;
    }
  }

  /**
   * Update a conversation (mainly title)
   */
  async updateConversation(
    conversationId: string,
    data: ConversationCreateRequest
  ): Promise<Conversation> {
    try {
      const response = await apiClient.put<ConversationResponse>(
        `${this.basePath}/conversations/${conversationId}`,
        data
      );
      return response.data;
    } catch (error) {
      console.error(`Failed to update conversation ${conversationId}:`, error);
      throw error;
    }
  }

  /**
   * Delete a conversation
   */
  async deleteConversation(conversationId: string): Promise<void> {
    try {
      await apiClient.delete(`${this.basePath}/conversations/${conversationId}`);
    } catch (error) {
      console.error(`Failed to delete conversation ${conversationId}:`, error);
      throw error;
    }
  }

  /**
   * Get messages for a conversation with pagination
   */
  async getMessages(
    conversationId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<Message[]> {
    try {
      const response = await apiClient.get<MessageResponse[]>(
        `${this.basePath}/conversations/${conversationId}/messages`,
        {
          params: { limit, offset },
        }
      );
      return response.data;
    } catch (error) {
      console.error(`Failed to get messages for conversation ${conversationId}:`, error);
      throw error;
    }
  }

  /**
   * Send a message in a conversation and get AI response
   */
  async sendMessage(
    conversationId: string,
    data: MessageCreateRequest
  ): Promise<Message> {
    try {
      const response = await apiClient.post<MessageResponse>(
        `${this.basePath}/conversations/${conversationId}/messages`,
        data
      );
      return response.data;
    } catch (error) {
      console.error(`Failed to send message to conversation ${conversationId}:`, error);
      throw error;
    }
  }
}

// Export singleton instance
export const chatService = new ChatService();
