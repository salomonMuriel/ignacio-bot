/**
 * Project Context for managing project state across the application
 * Handles active project, project list, and project operations
 */

import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { Project, ProjectState, ProjectCreateRequest, ProjectUpdateRequest } from '../types';
import { projectService } from '../services/projectService';

interface ProjectContextType extends ProjectState {
  // Project operations
  loadUserProjects: (userId: string) => Promise<void>;
  createProject: (data: ProjectCreateRequest) => Promise<void>;
  updateProject: (projectId: string, data: ProjectUpdateRequest) => Promise<void>;
  deleteProject: (projectId: string) => Promise<void>;
  setActiveProject: (project: Project | null) => void;
  
  // Project context operations
  updateProjectContext: (projectId: string, context: any) => Promise<void>;
  
  // Utility functions
  getProjectById: (projectId: string) => Project | null;
  clearError: () => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const useProject = (): ProjectContextType => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
};

interface ProjectProviderProps {
  children: ReactNode;
}

export const ProjectProvider: React.FC<ProjectProviderProps> = ({ children }) => {
  const [state, setState] = useState<ProjectState>({
    projects: [],
    activeProject: null,
    isLoading: false,
    error: null,
  });

  // Load user projects
  const loadUserProjects = useCallback(async (userId: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const projects = await projectService.getUserProjects(userId);
      setState(prev => ({ 
        ...prev, 
        projects, 
        isLoading: false
      }));
    } catch (error) {
      console.error('Failed to load user projects:', error);
      setState(prev => ({
        ...prev,
        error: 'Failed to load projects',
        isLoading: false
      }));
    }
  }, []);

  // Create new project
  const createProject = async (data: ProjectCreateRequest) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const newProject = await projectService.createProject(data);
      setState(prev => ({
        ...prev,
        projects: [newProject, ...prev.projects],
        activeProject: newProject, // Set new project as active
        isLoading: false
      }));
    } catch (error) {
      console.error('Failed to create project:', error);
      setState(prev => ({
        ...prev,
        error: 'Failed to create project',
        isLoading: false
      }));
      throw error; // Re-throw for form handling
    }
  };

  // Update project
  const updateProject = async (projectId: string, data: ProjectUpdateRequest) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const updatedProject = await projectService.updateProject(projectId, data);
      setState(prev => ({
        ...prev,
        projects: prev.projects.map(p => p.id === projectId ? updatedProject : p),
        activeProject: prev.activeProject?.id === projectId ? updatedProject : prev.activeProject,
        isLoading: false
      }));
    } catch (error) {
      console.error('Failed to update project:', error);
      setState(prev => ({
        ...prev,
        error: 'Failed to update project',
        isLoading: false
      }));
      throw error;
    }
  };

  // Delete project
  const deleteProject = async (projectId: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      await projectService.deleteProject(projectId);
      setState(prev => {
        const remainingProjects = prev.projects.filter(p => p.id !== projectId);
        return {
          ...prev,
          projects: remainingProjects,
          activeProject: prev.activeProject?.id === projectId 
            ? (remainingProjects.length > 0 ? remainingProjects[0] : null)
            : prev.activeProject,
          isLoading: false
        };
      });
    } catch (error) {
      console.error('Failed to delete project:', error);
      setState(prev => ({
        ...prev,
        error: 'Failed to delete project',
        isLoading: false
      }));
      throw error;
    }
  };

  // Set active project
  const setActiveProject = (project: Project | null) => {
    setState(prev => ({ ...prev, activeProject: project }));
  };

  // Update project context
  const updateProjectContext = async (projectId: string, context: any) => {
    try {
      await projectService.updateProjectContext(projectId, context);
      // Optionally reload the project to get updated context
      const updatedProject = await projectService.getProject(projectId);
      setState(prev => ({
        ...prev,
        projects: prev.projects.map(p => p.id === projectId ? updatedProject : p),
        activeProject: prev.activeProject?.id === projectId ? updatedProject : prev.activeProject,
      }));
    } catch (error) {
      console.error('Failed to update project context:', error);
      setState(prev => ({
        ...prev,
        error: 'Failed to update project context'
      }));
      throw error;
    }
  };

  // Utility functions
  const getProjectById = (projectId: string): Project | null => {
    return state.projects.find(p => p.id === projectId) || null;
  };

  const clearError = () => {
    setState(prev => ({ ...prev, error: null }));
  };

  // Store active project in localStorage for persistence
  useEffect(() => {
    if (state.activeProject) {
      localStorage.setItem('activeProjectId', state.activeProject.id);
    } else {
      localStorage.removeItem('activeProjectId');
    }
  }, [state.activeProject]);

  // Restore active project from localStorage on mount
  useEffect(() => {
    if (state.projects.length > 0 && !state.activeProject) {
      const storedProjectId = localStorage.getItem('activeProjectId');
      if (storedProjectId) {
        const storedProject = state.projects.find(p => p.id === storedProjectId);
        if (storedProject) {
          setActiveProject(storedProject);
          return;
        }
      }
      // If no stored project or stored project not found, set first project as active
      setActiveProject(state.projects[0]);
    }
  }, [state.projects]);

  const contextValue: ProjectContextType = {
    ...state,
    loadUserProjects,
    createProject,
    updateProject,
    deleteProject,
    setActiveProject,
    updateProjectContext,
    getProjectById,
    clearError,
  };

  return (
    <ProjectContext.Provider value={contextValue}>
      {children}
    </ProjectContext.Provider>
  );
};

export default ProjectContext;