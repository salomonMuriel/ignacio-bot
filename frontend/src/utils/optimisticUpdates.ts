/**
 * Optimistic Updates Integration Utilities
 * Provides comprehensive optimistic update patterns for better UX
 */

import type { Message, Conversation, Project, AgentMessageResponse } from '@/types';

// Optimistic update types
export type OptimisticUpdate<T> = {
  tempId: string;
  data: T;
  type: 'add' | 'update' | 'delete';
  timestamp: number;
};

// Optimistic update manager
export class OptimisticUpdateManager<T extends { id: string }> {
  private updates: Map<string, OptimisticUpdate<T>> = new Map();
  private rollbackCallbacks: Map<string, () => void> = new Map();

  addOptimistic(tempId: string, data: T, type: OptimisticUpdate<T>['type'] = 'add'): void {
    const update: OptimisticUpdate<T> = {
      tempId,
      data,
      type,
      timestamp: Date.now(),
    };
    this.updates.set(tempId, update);
  }

  removeOptimistic(tempId: string): void {
    this.updates.delete(tempId);
    this.rollbackCallbacks.delete(tempId);
  }

  getOptimisticData(originalData: T[]): T[] {
    let result = [...originalData];

    for (const update of this.updates.values()) {
      switch (update.type) {
        case 'add':
          result.push(update.data);
          break;
        case 'update':
          result = result.map(item =>
            item.id === update.data.id ? { ...item, ...update.data } : item
          );
          break;
        case 'delete':
          result = result.filter(item => item.id !== update.data.id);
          break;
      }
    }

    return result;
  }

  clearAll(): void {
    this.updates.clear();
    this.rollbackCallbacks.clear();
  }

  hasOptimisticUpdates(): boolean {
    return this.updates.size > 0;
  }
}

// Message optimistic updates
export class MessageOptimisticUpdates {
  private manager = new OptimisticUpdateManager<Message>();

  addOptimisticMessage(content: string, conversationId?: string): string {
    const tempId = `temp-msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const optimisticMessage: Message = {
      id: tempId,
      content,
      message_type: 'TEXT',
      is_from_user: true,
      created_at: new Date().toISOString(),
      file_path: null,
      agent_used: null,
      execution_time_ms: null,
    };

    this.manager.addOptimistic(tempId, optimisticMessage, 'add');
    return tempId;
  }

  async sendMessageWithOptimistic(
    content: string,
    sendMessageFn: (params: {
      content: string;
      conversationId?: string;
      projectId?: string;
      file?: File;
    }) => Promise<AgentMessageResponse>,
    conversationId?: string,
    projectId?: string,
    file?: File
  ): Promise<AgentMessageResponse> {
    // Add optimistic user message
    const tempId = this.addOptimisticMessage(content, conversationId);

    try {
      // Send actual message
      const response = await sendMessageFn({
        content,
        conversationId,
        projectId,
        file,
      });

      // Remove optimistic update after success
      this.manager.removeOptimistic(tempId);

      return response;
    } catch (error) {
      // Remove optimistic update on error
      this.manager.removeOptimistic(tempId);
      throw error;
    }
  }

  getOptimisticMessages(originalMessages: Message[]): Message[] {
    return this.manager.getOptimisticData(originalMessages);
  }

  clearOptimisticMessages(): void {
    this.manager.clearAll();
  }
}

// Conversation optimistic updates
export class ConversationOptimisticUpdates {
  private manager = new OptimisticUpdateManager<Conversation>();

  addOptimisticConversation(title?: string, projectId?: string): string {
    const tempId = `temp-conv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const optimisticConversation: Conversation = {
      id: tempId,
      title: title || 'New Conversation',
      project_id: projectId || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      message_count: 0,
      language_preference: 'es',
      project_context: {},
    };

    this.manager.addOptimistic(tempId, optimisticConversation, 'add');
    return tempId;
  }

  updateOptimisticConversation(conversationId: string, updates: Partial<Conversation>): void {
    const optimisticUpdate = {
      id: conversationId,
      ...updates,
      updated_at: new Date().toISOString(),
    } as Conversation;

    this.manager.addOptimistic(`update-${conversationId}`, optimisticUpdate, 'update');
  }

  async updateConversationWithOptimistic(
    conversationId: string,
    updates: { title?: string; project_id?: string },
    updateConversationFn: (id: string, updates: { title?: string; project_id?: string }) => Promise<Conversation>
  ): Promise<Conversation> {
    // Add optimistic update
    this.updateOptimisticConversation(conversationId, updates);

    try {
      // Send actual update
      const response = await updateConversationFn(conversationId, updates);

      // Remove optimistic update after success
      this.manager.removeOptimistic(`update-${conversationId}`);

      return response;
    } catch (error) {
      // Remove optimistic update on error
      this.manager.removeOptimistic(`update-${conversationId}`);
      throw error;
    }
  }

  getOptimisticConversations(originalConversations: Conversation[]): Conversation[] {
    return this.manager.getOptimisticData(originalConversations);
  }

  clearOptimisticConversations(): void {
    this.manager.clearAll();
  }
}

// Project optimistic updates
export class ProjectOptimisticUpdates {
  private manager = new OptimisticUpdateManager<Project>();

  addOptimisticProject(projectData: Omit<Project, 'id' | 'user_id' | 'created_at' | 'updated_at'>): string {
    const tempId = `temp-proj-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const optimisticProject: Project = {
      id: tempId,
      user_id: 'mock-user-id', // This will be replaced by actual user ID
      project_name: projectData.project_name,
      project_type: projectData.project_type || null,
      description: projectData.description || null,
      current_stage: projectData.current_stage || null,
      target_audience: projectData.target_audience || null,
      problem_statement: projectData.problem_statement || null,
      solution_approach: projectData.solution_approach || null,
      business_model: projectData.business_model || null,
      context_data: projectData.context_data || {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    this.manager.addOptimistic(tempId, optimisticProject, 'add');
    return tempId;
  }

  async createProjectWithOptimistic(
    projectData: Omit<Project, 'id' | 'user_id' | 'created_at' | 'updated_at'>,
    createProjectFn: (data: any) => Promise<Project>
  ): Promise<Project> {
    // Add optimistic project
    const tempId = this.addOptimisticProject(projectData);

    try {
      // Create actual project
      const response = await createProjectFn(projectData);

      // Remove optimistic update after success
      this.manager.removeOptimistic(tempId);

      return response;
    } catch (error) {
      // Remove optimistic update on error
      this.manager.removeOptimistic(tempId);
      throw error;
    }
  }

  updateOptimisticProject(projectId: string, updates: Partial<Project>): void {
    const optimisticUpdate = {
      id: projectId,
      ...updates,
      updated_at: new Date().toISOString(),
    } as Project;

    this.manager.addOptimistic(`update-${projectId}`, optimisticUpdate, 'update');
  }

  async updateProjectWithOptimistic(
    projectId: string,
    updates: Partial<Project>,
    updateProjectFn: (id: string, updates: Partial<Project>) => Promise<Project>
  ): Promise<Project> {
    // Add optimistic update
    this.updateOptimisticProject(projectId, updates);

    try {
      // Send actual update
      const response = await updateProjectFn(projectId, updates);

      // Remove optimistic update after success
      this.manager.removeOptimistic(`update-${projectId}`);

      return response;
    } catch (error) {
      // Remove optimistic update on error
      this.manager.removeOptimistic(`update-${projectId}`);
      throw error;
    }
  }

  getOptimisticProjects(originalProjects: Project[]): Project[] {
    return this.manager.getOptimisticData(originalProjects);
  }

  clearOptimisticProjects(): void {
    this.manager.clearAll();
  }
}

// Global optimistic updates manager
export class OptimisticUpdatesService {
  public messages = new MessageOptimisticUpdates();
  public conversations = new ConversationOptimisticUpdates();
  public projects = new ProjectOptimisticUpdates();

  clearAll(): void {
    this.messages.clearOptimisticMessages();
    this.conversations.clearOptimisticConversations();
    this.projects.clearOptimisticProjects();
  }

  hasAnyOptimisticUpdates(): boolean {
    return (
      this.messages.manager.hasOptimisticUpdates() ||
      this.conversations.manager.hasOptimisticUpdates() ||
      this.projects.manager.hasOptimisticUpdates()
    );
  }
}

// Export singleton instance
export const optimisticUpdates = new OptimisticUpdatesService();

// React hook for optimistic updates
export function useOptimisticUpdates() {
  return optimisticUpdates;
}