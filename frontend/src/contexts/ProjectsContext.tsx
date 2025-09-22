/**
 * ProjectsContext - Multi-Project State Management
 * Handles project creation, selection, CRUD operations, and active project state
 * Implements project-first workflow where users must have at least one project
 */

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import type { Project, ProjectCreate, ProjectUpdate } from '@/types';
import { api } from '@/services/api';
import { useAuth } from './AuthContext';

// Projects State Interface
interface ProjectsState {
  projects: Project[];
  activeProject: Project | null;
  isLoading: boolean;
  error: string | null;
  hasProjects: boolean;
}

// Project Actions
type ProjectAction =
  | { type: 'PROJECTS_LOADING' }
  | { type: 'PROJECTS_SUCCESS'; payload: Project[] }
  | { type: 'PROJECTS_ERROR'; payload: string }
  | { type: 'PROJECT_CREATED'; payload: Project }
  | { type: 'PROJECT_UPDATED'; payload: Project }
  | { type: 'PROJECT_DELETED'; payload: string }
  | { type: 'SET_ACTIVE_PROJECT'; payload: Project | null }
  | { type: 'CLEAR_ERROR' };

// Projects Context Interface
interface ProjectsContextType extends ProjectsState {
  // Actions
  loadProjects: () => Promise<void>;
  createProject: (
    projectData: Omit<ProjectCreate, 'user_id'>
  ) => Promise<Project>;
  updateProject: (
    projectId: string,
    updates: ProjectUpdate
  ) => Promise<Project>;
  deleteProject: (projectId: string) => Promise<void>;
  setActiveProject: (project: Project | null) => void;
  getProjectById: (projectId: string) => Project | undefined;
  clearError: () => void;

  // Utility methods
  getProjectContext: (projectId: string) => Promise<unknown>;
  updateProjectContext: (
    projectId: string,
    context: Record<string, unknown>
  ) => Promise<void>;
  getProjectConversations: (projectId: string) => Promise<unknown[]>;
}

// Initial state
const initialState: ProjectsState = {
  projects: [],
  activeProject: null,
  isLoading: true,
  error: null,
  hasProjects: false,
};

// Projects reducer
function projectsReducer(
  state: ProjectsState,
  action: ProjectAction
): ProjectsState {
  switch (action.type) {
    case 'PROJECTS_LOADING':
      return {
        ...state,
        isLoading: true,
        error: null,
      };

    case 'PROJECTS_SUCCESS':
      return {
        ...state,
        projects: action.payload,
        hasProjects: action.payload.length > 0,
        isLoading: false,
        error: null,
        // Set active project to first one if none is set and projects exist
        activeProject:
          state.activeProject ||
          (action.payload.length > 0 ? action.payload[0] : null),
      };

    case 'PROJECTS_ERROR':
      return {
        ...state,
        isLoading: false,
        error: action.payload,
      };

    case 'PROJECT_CREATED': {
      const newProjects = [...state.projects, action.payload];
      return {
        ...state,
        projects: newProjects,
        hasProjects: true,
        // Set new project as active if it's the first one
        activeProject:
          state.projects.length === 0 ? action.payload : state.activeProject,
        error: null,
      };
    }

    case 'PROJECT_UPDATED': {
      const updatedProjects = state.projects.map(project =>
        project.id === action.payload.id ? action.payload : project
      );
      return {
        ...state,
        projects: updatedProjects,
        // Update active project if it was the one updated
        activeProject:
          state.activeProject?.id === action.payload.id
            ? action.payload
            : state.activeProject,
        error: null,
      };
    }

    case 'PROJECT_DELETED': {
      const filteredProjects = state.projects.filter(
        project => project.id !== action.payload
      );
      return {
        ...state,
        projects: filteredProjects,
        hasProjects: filteredProjects.length > 0,
        // Clear active project if it was deleted, or set to first available
        activeProject:
          state.activeProject?.id === action.payload
            ? filteredProjects.length > 0
              ? filteredProjects[0]
              : null
            : state.activeProject,
        error: null,
      };
    }

    case 'SET_ACTIVE_PROJECT':
      return {
        ...state,
        activeProject: action.payload,
        error: null,
      };

    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };

    default:
      return state;
  }
}

// Create context
const ProjectsContext = createContext<ProjectsContextType | undefined>(
  undefined
);

// Local storage key for active project persistence
const ACTIVE_PROJECT_KEY = 'ignacio_active_project_id';

// ProjectsProvider component
interface ProjectsProviderProps {
  children: React.ReactNode;
}

export function ProjectsProvider({ children }: ProjectsProviderProps) {
  const [state, dispatch] = useReducer(projectsReducer, initialState);
  const { isAuthenticated, user } = useAuth();

  // Load projects when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      loadProjects();
    }
  }, [isAuthenticated, user]);

  // Persist active project to localStorage
  useEffect(() => {
    if (state.activeProject) {
      localStorage.setItem(ACTIVE_PROJECT_KEY, state.activeProject.id);
    } else {
      localStorage.removeItem(ACTIVE_PROJECT_KEY);
    }
  }, [state.activeProject]);

  const loadProjects = async () => {
    try {
      dispatch({ type: 'PROJECTS_LOADING' });

      const projects = await api.projects.getProjects();
      dispatch({ type: 'PROJECTS_SUCCESS', payload: projects });

      // Try to restore active project from localStorage
      const savedProjectId = localStorage.getItem(ACTIVE_PROJECT_KEY);
      if (savedProjectId && projects.length > 0) {
        const savedProject = projects.find(p => p.id === savedProjectId);
        if (savedProject) {
          dispatch({ type: 'SET_ACTIVE_PROJECT', payload: savedProject });
        }
      }
    } catch (error) {
      console.error('Failed to load projects:', error);
      dispatch({
        type: 'PROJECTS_ERROR',
        payload:
          error instanceof Error ? error.message : 'Failed to load projects',
      });
    }
  };

  const createProject = async (
    projectData: Omit<ProjectCreate, 'user_id'>
  ): Promise<Project> => {
    try {
      const newProject = await api.projects.createProject(projectData);
      dispatch({ type: 'PROJECT_CREATED', payload: newProject });
      return newProject;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to create project';
      dispatch({ type: 'PROJECTS_ERROR', payload: errorMessage });
      throw error;
    }
  };

  const updateProject = async (
    projectId: string,
    updates: ProjectUpdate
  ): Promise<Project> => {
    try {
      const updatedProject = await api.projects.updateProject(
        projectId,
        updates
      );
      dispatch({ type: 'PROJECT_UPDATED', payload: updatedProject });
      return updatedProject;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to update project';
      dispatch({ type: 'PROJECTS_ERROR', payload: errorMessage });
      throw error;
    }
  };

  const deleteProject = async (projectId: string): Promise<void> => {
    try {
      await api.projects.deleteProject(projectId);
      dispatch({ type: 'PROJECT_DELETED', payload: projectId });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to delete project';
      dispatch({ type: 'PROJECTS_ERROR', payload: errorMessage });
      throw error;
    }
  };

  const setActiveProject = (project: Project | null) => {
    dispatch({ type: 'SET_ACTIVE_PROJECT', payload: project });
  };

  const getProjectById = (projectId: string): Project | undefined => {
    return state.projects.find(project => project.id === projectId);
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  // Utility methods
  const getProjectContext = async (projectId: string) => {
    try {
      return await api.projects.getProjectContext(projectId);
    } catch (error) {
      console.error('Failed to get project context:', error);
      throw error;
    }
  };

  const updateProjectContext = async (
    projectId: string,
    context: Record<string, unknown>
  ) => {
    try {
      await api.projects.updateProjectContext(projectId, context);
    } catch (error) {
      console.error('Failed to update project context:', error);
      throw error;
    }
  };

  const getProjectConversations = async (projectId: string) => {
    try {
      return await api.projects.getProjectConversations(projectId);
    } catch (error) {
      console.error('Failed to get project conversations:', error);
      throw error;
    }
  };

  const contextValue: ProjectsContextType = {
    ...state,
    loadProjects,
    createProject,
    updateProject,
    deleteProject,
    setActiveProject,
    getProjectById,
    clearError,
    getProjectContext,
    updateProjectContext,
    getProjectConversations,
  };

  return (
    <ProjectsContext.Provider value={contextValue}>
      {children}
    </ProjectsContext.Provider>
  );
}

// Custom hook to use projects context
export function useProjects(): ProjectsContextType {
  const context = useContext(ProjectsContext);
  if (context === undefined) {
    throw new Error('useProjects must be used within a ProjectsProvider');
  }
  return context;
}

export default ProjectsContext;
