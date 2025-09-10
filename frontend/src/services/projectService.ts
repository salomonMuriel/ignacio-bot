/**
 * Project Service for Ignacio Bot
 * Handles all project-related API calls to the backend
 */

import { apiClient } from './api';
import {
  Project,
  ProjectCreateRequest,
  ProjectUpdateRequest,
  ProjectTemplate,
  ProjectType,
  ProjectStage,
  Conversation,
} from '../types';

export class ProjectService {
  private readonly basePath = '/project';

  /**
   * Get all projects for a user
   */
  async getUserProjects(userId: string): Promise<Project[]> {
    try {
      const response = await apiClient.get<Project[]>(
        `${this.basePath}/projects/${userId}`
      );
      return response.data;
    } catch (error) {
      console.error('Failed to get user projects:', error);
      throw error;
    }
  }

  /**
   * Create a new project
   */
  async createProject(data: ProjectCreateRequest): Promise<Project> {
    try {
      const response = await apiClient.post<Project>(
        `${this.basePath}/projects`,
        data
      );
      return response.data;
    } catch (error) {
      console.error('Failed to create project:', error);
      throw error;
    }
  }

  /**
   * Get a specific project by ID
   */
  async getProject(projectId: string): Promise<Project> {
    try {
      const response = await apiClient.get<Project>(
        `${this.basePath}/projects/${projectId}`
      );
      return response.data;
    } catch (error) {
      console.error(`Failed to get project ${projectId}:`, error);
      throw error;
    }
  }

  /**
   * Update a project
   */
  async updateProject(projectId: string, data: ProjectUpdateRequest): Promise<Project> {
    try {
      const response = await apiClient.put<Project>(
        `${this.basePath}/projects/${projectId}`,
        data
      );
      return response.data;
    } catch (error) {
      console.error(`Failed to update project ${projectId}:`, error);
      throw error;
    }
  }

  /**
   * Delete a project
   */
  async deleteProject(projectId: string): Promise<void> {
    try {
      await apiClient.delete(`${this.basePath}/projects/${projectId}`);
    } catch (error) {
      console.error(`Failed to delete project ${projectId}:`, error);
      throw error;
    }
  }

  /**
   * Get conversations for a project
   */
  async getProjectConversations(projectId: string): Promise<Conversation[]> {
    try {
      const response = await apiClient.get<Conversation[]>(
        `${this.basePath}/projects/${projectId}/conversations`
      );
      return response.data;
    } catch (error) {
      console.error(`Failed to get project conversations ${projectId}:`, error);
      throw error;
    }
  }

  /**
   * Get project context
   */
  async getProjectContext(projectId: string): Promise<any> {
    try {
      const response = await apiClient.get(
        `${this.basePath}/projects/${projectId}/context`
      );
      return response.data;
    } catch (error) {
      console.error(`Failed to get project context ${projectId}:`, error);
      throw error;
    }
  }

  /**
   * Update project context
   */
  async updateProjectContext(projectId: string, context: any): Promise<any> {
    try {
      const response = await apiClient.put(
        `${this.basePath}/projects/${projectId}/context`,
        context
      );
      return response.data;
    } catch (error) {
      console.error(`Failed to update project context ${projectId}:`, error);
      throw error;
    }
  }

  /**
   * Get available project types
   */
  async getProjectTypes(): Promise<ProjectType[]> {
    try {
      const response = await apiClient.get<ProjectType[]>(
        `${this.basePath}/types`
      );
      return response.data;
    } catch (error) {
      console.error('Failed to get project types:', error);
      throw error;
    }
  }

  /**
   * Get available project stages
   */
  async getProjectStages(): Promise<ProjectStage[]> {
    try {
      const response = await apiClient.get<ProjectStage[]>(
        `${this.basePath}/stages`
      );
      return response.data;
    } catch (error) {
      console.error('Failed to get project stages:', error);
      throw error;
    }
  }

  /**
   * Get project template
   */
  async getProjectTemplate(): Promise<ProjectTemplate> {
    try {
      const response = await apiClient.get<ProjectTemplate>(
        `${this.basePath}/template`
      );
      return response.data;
    } catch (error) {
      console.error('Failed to get project template:', error);
      throw error;
    }
  }

  /**
   * Associate conversation with project
   */
  async associateConversationWithProject(
    conversationId: string,
    projectId: string
  ): Promise<void> {
    try {
      await apiClient.put(
        `/api/chat/conversations/${conversationId}/project`,
        { project_id: projectId }
      );
    } catch (error) {
      console.error(`Failed to associate conversation ${conversationId} with project ${projectId}:`, error);
      throw error;
    }
  }
}

// Export singleton instance
export const projectService = new ProjectService();