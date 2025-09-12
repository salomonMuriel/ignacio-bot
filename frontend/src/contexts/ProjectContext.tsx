"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { Project, ProjectCreate, ProjectUpdate } from '@/types';
import { api } from '@/services/api';
import { useAuth } from './AuthContext';

interface ProjectState {
  projects: Project[];
  activeProject: Project | null;
  isLoading: boolean;
  error: string | null;
}

interface ProjectContextType extends ProjectState {
  setActiveProject: (project: Project | null) => void;
  createProject: (projectData: Omit<ProjectCreate, 'user_id'>) => Promise<Project>;
  updateProject: (projectId: string, projectData: ProjectUpdate) => Promise<Project>;
  deleteProject: (projectId: string) => Promise<void>;
  refreshProjects: () => Promise<void>;
  getProjectById: (projectId: string) => Project | undefined;
}

const ProjectContext = createContext<ProjectContextType | null>(null);

interface ProjectProviderProps {
  children: ReactNode;
}

export function ProjectProvider({ children }: ProjectProviderProps) {
  const { user, isAuthenticated } = useAuth();
  const [state, setState] = useState<ProjectState>({
    projects: [],
    activeProject: null,
    isLoading: false,
    error: null,
  });

  const setActiveProject = useCallback((project: Project | null) => {
    setState(prev => ({ ...prev, activeProject: project }));
    
    // Store active project in localStorage
    if (project) {
      localStorage.setItem('activeProjectId', project.id);
    } else {
      localStorage.removeItem('activeProjectId');
    }
  }, []);

  const createProject = useCallback(async (projectData: Omit<ProjectCreate, 'user_id'>): Promise<Project> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const newProject = await api.projects.create(projectData);
      setState(prev => ({
        ...prev,
        projects: [...prev.projects, newProject],
        isLoading: false,
        error: null,
      }));
      
      // Set as active if it's the first project
      if (state.projects.length === 0) {
        setActiveProject(newProject);
      }
      
      return newProject;
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to create project',
      }));
      throw error;
    }
  }, [state.projects.length, setActiveProject]);

  const updateProject = useCallback(async (projectId: string, projectData: ProjectUpdate): Promise<Project> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const updatedProject = await api.projects.update(projectId, projectData);
      setState(prev => ({
        ...prev,
        projects: prev.projects.map(p => p.id === projectId ? updatedProject : p),
        activeProject: prev.activeProject?.id === projectId ? updatedProject : prev.activeProject,
        isLoading: false,
        error: null,
      }));
      
      return updatedProject;
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to update project',
      }));
      throw error;
    }
  }, []);

  const deleteProject = useCallback(async (projectId: string): Promise<void> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      await api.projects.delete(projectId);
      setState(prev => {
        const filteredProjects = prev.projects.filter(p => p.id !== projectId);
        const newActiveProject = prev.activeProject?.id === projectId ? null : prev.activeProject;
        
        return {
          ...prev,
          projects: filteredProjects,
          activeProject: newActiveProject,
          isLoading: false,
          error: null,
        };
      });
      
      // Clear from localStorage if it was active
      const activeProjectId = localStorage.getItem('activeProjectId');
      if (activeProjectId === projectId) {
        localStorage.removeItem('activeProjectId');
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to delete project',
      }));
      throw error;
    }
  }, []);

  const refreshProjects = useCallback(async (): Promise<void> => {
    if (!user) return;
    
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const projects = await api.projects.list(user.id);
      setState(prev => ({
        ...prev,
        projects,
        isLoading: false,
        error: null,
      }));
      
      // Restore active project from localStorage
      const activeProjectId = localStorage.getItem('activeProjectId');
      if (activeProjectId && projects.length > 0) {
        const savedActiveProject = projects.find(p => p.id === activeProjectId);
        if (savedActiveProject) {
          setState(prev => ({ ...prev, activeProject: savedActiveProject }));
        } else {
          // Clear invalid active project ID
          localStorage.removeItem('activeProjectId');
        }
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch projects',
      }));
    }
  }, [user]);

  const getProjectById = useCallback((projectId: string): Project | undefined => {
    return state.projects.find(p => p.id === projectId);
  }, [state.projects]);

  // Load projects when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      refreshProjects();
    }
  }, [isAuthenticated, user, refreshProjects]);

  const contextValue: ProjectContextType = {
    ...state,
    setActiveProject,
    createProject,
    updateProject,
    deleteProject,
    refreshProjects,
    getProjectById,
  };

  return (
    <ProjectContext.Provider value={contextValue}>
      {children}
    </ProjectContext.Provider>
  );
}

// React 19.1 compatible hook using use() API
export function useProjects() {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProjects must be used within a ProjectProvider');
  }
  return context;
}

// Alias for compatibility
export function useProject() {
  return useProjects();
}

// React 19.1 compatible hook for conditional context reading
export function useOptionalProjects() {
  return useContext(ProjectContext);
}

// Promise-based project state for React 19.1 use() API
export function createProjectsPromise() {
  return new Promise<ProjectContextType>((resolve, reject) => {
    setTimeout(() => {
      const context = useOptionalProjects();
      if (context) {
        resolve(context);
      } else {
        reject(new Error('Projects context not available'));
      }
    }, 0);
  });
}