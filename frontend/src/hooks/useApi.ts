import { useAuth0 } from '@auth0/auth0-react';
import { useCallback } from 'react';
import type {
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
  User,
  ProfileUpdateResponse,
  ProfileUpdate,
  ProfileCompletionStatusResponse
} from '@/types';
import * as apiService from '@/services/api';

export const useApi = () => {
  const { getAccessTokenSilently, user } = useAuth0();

  // Helper to get user ID
  const getUserId = useCallback((): string => {
    if (!user?.sub) {
      throw new Error('User not authenticated');
    }
    return user.sub;
  }, [user]);

  // --- Projects ---
  const getProjects = useCallback(async (): Promise<Project[]> => {
    const token = await getAccessTokenSilently();
    return apiService.getProjects(token);
  }, [getAccessTokenSilently]);

  const createProject = useCallback(async (projectData: ProjectCreate): Promise<Project> => {
    const token = await getAccessTokenSilently();
    const data = { ...projectData};
    return apiService.createProject(data, token);
  }, [getAccessTokenSilently, getUserId]);

  const getProject = useCallback(async (projectId: string): Promise<Project> => {
    const token = await getAccessTokenSilently();
    return apiService.getProject(projectId, token);
  }, [getAccessTokenSilently]);

  const updateProject = useCallback(async (projectId: string, updates: ProjectUpdate): Promise<Project> => {
    const token = await getAccessTokenSilently();
    return apiService.updateProject(projectId, updates, token);
  }, [getAccessTokenSilently]);

  const deleteProject = useCallback(async (projectId: string): Promise<{ message: string }> => {
    const token = await getAccessTokenSilently();
    return apiService.deleteProject(projectId, token);
  }, [getAccessTokenSilently]);

  const getProjectContext = useCallback(async (projectId: string) => {
    const token = await getAccessTokenSilently();
    return apiService.getProjectContext(projectId, token);
  }, [getAccessTokenSilently]);

  const updateProjectContext = useCallback(async (projectId: string, contextData: Record<string, unknown>) => {
    const token = await getAccessTokenSilently();
    return apiService.updateProjectContext(projectId, contextData, token);
  }, [getAccessTokenSilently]);

  const getProjectConversations = useCallback(async (projectId: string): Promise<Conversation[]> => {
    const token = await getAccessTokenSilently();
    return apiService.getProjectConversations(projectId, token);
  }, [getAccessTokenSilently]);

  const getProjectTypes = useCallback(async () => {
    const token = await getAccessTokenSilently();
    return apiService.getProjectTypes(token);
  }, [getAccessTokenSilently]);

  const getProjectStages = useCallback(async () => {
    const token = await getAccessTokenSilently();
    return apiService.getProjectStages(token);
  }, [getAccessTokenSilently]);

  // --- Conversations ---
  const getConversations = useCallback(async (): Promise<Conversation[]> => {
    const token = await getAccessTokenSilently();
    return apiService.getConversations(token);
  }, [getAccessTokenSilently]);

  const getConversation = useCallback(async (conversationId: string): Promise<ConversationDetailResponse> => {
    const token = await getAccessTokenSilently();
    return apiService.getConversation(conversationId, token);
  }, [getAccessTokenSilently]);

  const updateConversation = useCallback(async (
    conversationId: string,
    updates: { title?: string; project_id?: string }
  ): Promise<Conversation> => {
    const token = await getAccessTokenSilently();
    return apiService.updateConversation(conversationId, updates, token);
  }, [getAccessTokenSilently]);

  const deleteConversation = useCallback(async (conversationId: string): Promise<{ message: string }> => {
    const token = await getAccessTokenSilently();
    return apiService.deleteConversation(conversationId, token);
  }, [getAccessTokenSilently]);

  const getMessages = useCallback(async (
    conversationId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<Message[]> => {
    const token = await getAccessTokenSilently();
    return apiService.getMessages(conversationId, token, limit, offset);
  }, [getAccessTokenSilently]);

  const sendMessage = useCallback(async (params: {
    content: string;
    conversationId?: string;
    projectId?: string;
    file?: File;
    existingFileId?: string;
  }): Promise<AgentMessageResponse> => {
    const token = await getAccessTokenSilently();
    return apiService.sendMessage(params, token);
  }, [getAccessTokenSilently]);

  const associateConversationWithProject = useCallback(async (
    conversationId: string,
    projectId: string
  ): Promise<{ message: string }> => {
    const token = await getAccessTokenSilently();
    return apiService.associateConversationWithProject(conversationId, projectId, token);
  }, [getAccessTokenSilently]);

  const getConversationSummary = useCallback(async (conversationId: string) => {
    const token = await getAccessTokenSilently();
    return apiService.getConversationSummary(conversationId, token);
  }, [getAccessTokenSilently]);

  const getConversationInteractions = useCallback(async (conversationId: string) => {
    const token = await getAccessTokenSilently();
    return apiService.getConversationInteractions(conversationId, token);
  }, [getAccessTokenSilently]);

  // --- Prompt Templates ---
  const getPromptTemplates = useCallback(async (
    activeOnly: boolean = true,
    tags?: string[],
    templateType?: TemplateType
  ): Promise<PromptTemplate[]> => {
    const token = await getAccessTokenSilently();
    return apiService.getPromptTemplates(token, activeOnly, tags, templateType);
  }, [getAccessTokenSilently]);

  const getTemplatesForUser = useCallback(async (activeOnly: boolean = true) => {
    const token = await getAccessTokenSilently();
    return apiService.getTemplatesForUser(token, activeOnly);
  }, [getAccessTokenSilently]);

  const getPromptTemplate = useCallback(async (templateId: string): Promise<PromptTemplate> => {
    const token = await getAccessTokenSilently();
    return apiService.getPromptTemplate(templateId, token);
  }, [getAccessTokenSilently]);

  const createPromptTemplate = useCallback(async (templateData: PromptTemplateCreate): Promise<PromptTemplate> => {
    const token = await getAccessTokenSilently();
    return apiService.createPromptTemplate(templateData, token);
  }, [getAccessTokenSilently]);

  const updatePromptTemplate = useCallback(async (
    templateId: string,
    templateData: PromptTemplateUpdate
  ): Promise<PromptTemplate> => {
    const token = await getAccessTokenSilently();
    const userId = getUserId();
    return apiService.updatePromptTemplate(templateId, templateData, userId, token);
  }, [getAccessTokenSilently, getUserId]);

  const deletePromptTemplate = useCallback(async (templateId: string): Promise<{ message: string }> => {
    const token = await getAccessTokenSilently();
    const userId = getUserId();
    return apiService.deletePromptTemplate(templateId, userId, token);
  }, [getAccessTokenSilently, getUserId]);

  const getAllTags = useCallback(async (): Promise<string[]> => {
    const token = await getAccessTokenSilently();
    return apiService.getAllTags(token);
  }, [getAccessTokenSilently]);

  // --- Files ---
  const getUserFiles = useCallback(async (): Promise<UserFile[]> => {
    const token = await getAccessTokenSilently();
    return apiService.getUserFiles(token);
  }, [getAccessTokenSilently, getUserId]);

  const getFileMetadata = useCallback(async (fileId: string): Promise<UserFile> => {
    const token = await getAccessTokenSilently();
    const userId = getUserId();
    return apiService.getFileMetadata(fileId, userId, token);
  }, [getAccessTokenSilently, getUserId]);

  const getFileUrl = useCallback(async (fileId: string, expiresIn: number = 3600) => {
    const token = await getAccessTokenSilently();
    const userId = getUserId();
    return apiService.getFileUrl(fileId, userId, token, expiresIn);
  }, [getAccessTokenSilently, getUserId]);

  const getConversationFiles = useCallback(async (conversationId: string): Promise<UserFile[]> => {
    const token = await getAccessTokenSilently();
    return apiService.getConversationFiles(conversationId, token);
  }, [getAccessTokenSilently]);

  const deleteFile = useCallback(async (fileId: string): Promise<{ message: string }> => {
    const token = await getAccessTokenSilently();
    const userId = getUserId();
    return apiService.deleteFile(fileId, userId, token);
  }, [getAccessTokenSilently, getUserId]);

  const downloadFile = useCallback(async (fileId: string): Promise<Blob> => {
    const token = await getAccessTokenSilently();
    const userId = getUserId();
    return apiService.downloadFile(fileId, userId, token);
  }, [getAccessTokenSilently, getUserId]);

  const getUserFilesWithConversations = useCallback(async (): Promise<UserFileWithConversations[]> => {
    const token = await getAccessTokenSilently();
    return apiService.getUserFilesWithConversations(token);
  }, [getAccessTokenSilently, getUserId]);

  const getFileConversations = useCallback(async (fileId: string) => {
    const token = await getAccessTokenSilently();
    const userId = getUserId();
    return apiService.getFileConversations(fileId, userId, token);
  }, [getAccessTokenSilently, getUserId]);

  const reuseFile = useCallback(async (fileId: string, conversationId: string) => {
    const token = await getAccessTokenSilently();
    const userId = getUserId();
    return apiService.reuseFile(fileId, conversationId, userId, token);
  }, [getAccessTokenSilently, getUserId]);

  const getProfile = useCallback(async (): Promise<User> => {
    const token = await getAccessTokenSilently();
    return apiService.getProfile(token);
  }, [getAccessTokenSilently]);

  const updateProfile = useCallback(async (updatePayload: ProfileUpdate): Promise<ProfileUpdateResponse> => {
    const token = await getAccessTokenSilently();
    return apiService.updateProfile(updatePayload, token);
  }, [getAccessTokenSilently]);

  const getProfileCompletion = useCallback(async (): Promise<ProfileCompletionStatusResponse> => {
    const token = await getAccessTokenSilently();
    return apiService.getProfileCompletion(token);
  }, [getAccessTokenSilently]);

  // --- Auth ---
  const getCurrentUser = useCallback((): User => {
    if (!user) {
      throw new Error('No authenticated user found');
    }
    return apiService.createUserFromAuth0(user);
  }, [user]);

  // Return all API functions
  return {
    // Projects
    getProjects,
    createProject,
    getProject,
    updateProject,
    deleteProject,
    getProjectContext,
    updateProjectContext,
    getProjectConversations,
    getProjectTypes,
    getProjectStages,

    // Conversations
    getConversations,
    getConversation,
    updateConversation,
    deleteConversation,
    getMessages,
    sendMessage,
    associateConversationWithProject,
    getConversationSummary,
    getConversationInteractions,

    // Prompt Templates
    getPromptTemplates,
    getTemplatesForUser,
    getPromptTemplate,
    createPromptTemplate,
    updatePromptTemplate,
    deletePromptTemplate,
    getAllTags,

    // Files
    getUserFiles,
    getFileMetadata,
    getFileUrl,
    getConversationFiles,
    deleteFile,
    downloadFile,
    getUserFilesWithConversations,
    getFileConversations,
    reuseFile,

    // Auth
    getCurrentUser,

    // Profiles
    getProfile,
    updateProfile,
    getProfileCompletion
  };
};