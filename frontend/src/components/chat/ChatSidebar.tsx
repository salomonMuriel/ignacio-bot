'use client';

/**
 * ChatSidebar - Sidebar with project switcher and conversation list
 * Handles conversation management and project context switching
 */

import { useState, useEffect } from 'react';
import useSWR from 'swr';
import { useConversation } from '@/contexts/ConversationContext';
import { useProject } from '@/contexts/ProjectContext';
import { useAuth } from '@/contexts/AuthContext';
import { api, swrFetchers } from '@/services/api';
import { ProjectLogo } from '@/components/ui/ProjectLogo';
import { Conversation } from '@/types';
import { 
  ChevronLeftIcon, 
  ChevronRightIcon,
  PlusIcon,
  ChatBubbleLeftIcon,
  Cog6ToothIcon,
  FolderIcon,
} from '@heroicons/react/24/outline';

interface ChatSidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  isMobile?: boolean;
}

export function ChatSidebar({ collapsed, onToggleCollapse, isMobile = false }: ChatSidebarProps) {
  const { currentUser } = useAuth();
  const { projects, activeProject, setActiveProject } = useProject();
  const { 
    conversations, 
    currentConversation, 
    setCurrentConversation, 
    createConversation,
    isLoading: conversationLoading 
  } = useConversation();

  const [showProjectDropdown, setShowProjectDropdown] = useState(false);

  // Fetch conversations using SWR
  const { data: conversationsData, error, mutate } = useSWR(
    '/api/chat/conversations',
    swrFetchers.conversations,
    {
      refreshInterval: 30000, // Refresh every 30 seconds
      revalidateOnFocus: true,
    }
  );

  const handleNewConversation = async () => {
    try {
      await createConversation(activeProject?.id);
      mutate(); // Refresh conversation list
    } catch (error) {
      console.error('Failed to create conversation:', error);
    }
  };

  const handleSelectConversation = (conversation: Conversation) => {
    setCurrentConversation(conversation);
  };

  const handleProjectSwitch = (projectId: string | null) => {
    const project = projectId ? projects.find(p => p.id === projectId) : null;
    setActiveProject(project || null);
    setShowProjectDropdown(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Ahora';
    if (diffMins < 60) return `${diffMins}min`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return date.toLocaleDateString('es-CO', { month: 'short', day: 'numeric' });
  };

  if (collapsed) {
    return (
      <div className="h-full flex flex-col items-center py-4 space-y-4">
        {/* Toggle Button */}
        <button
          onClick={onToggleCollapse}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ChevronRightIcon className="w-5 h-5 text-gray-600" />
        </button>

        {/* New Chat Button */}
        <button
          onClick={handleNewConversation}
          className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          title="Nueva conversación"
        >
          <PlusIcon className="w-5 h-5" />
        </button>

        {/* Active Project Indicator */}
        {activeProject && (
          <div className="p-2">
            <ProjectLogo 
              project={activeProject} 
              size="sm"
              title={activeProject.project_name}
            />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-green-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">I</span>
          </div>
          <span className="font-semibold text-gray-900">Ignacio</span>
        </div>
        
        <button
          onClick={onToggleCollapse}
          className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ChevronLeftIcon className="w-4 h-4 text-gray-600" />
        </button>
      </div>

      {/* Project Selector */}
      <div className="p-4 border-b border-gray-200 relative">
        <div className="mb-2">
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            Proyecto Activo
          </label>
        </div>
        
        <button
          onClick={() => setShowProjectDropdown(!showProjectDropdown)}
          className="w-full flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
        >
          {activeProject ? (
            <>
              <ProjectLogo project={activeProject} size="sm" />
              <div className="flex-1 text-left">
                <div className="font-medium text-gray-900 truncate">
                  {activeProject.project_name}
                </div>
                <div className="text-xs text-gray-500 capitalize">
                  {activeProject.project_type?.replace('_', ' ')}
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                <FolderIcon className="w-4 h-4 text-gray-400" />
              </div>
              <div className="flex-1 text-left">
                <div className="font-medium text-gray-900">Sin proyecto</div>
                <div className="text-xs text-gray-500">Selecciona un proyecto</div>
              </div>
            </>
          )}
        </button>

        {/* Project Dropdown */}
        {showProjectDropdown && (
          <div className="absolute top-full left-4 right-4 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
            <div className="p-2">
              {projects.length > 0 ? (
                <>
                  <button
                    onClick={() => handleProjectSwitch(null)}
                    className="w-full flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                      <FolderIcon className="w-4 h-4 text-gray-400" />
                    </div>
                    <span className="text-gray-700">Sin proyecto</span>
                  </button>
                  
                  <div className="border-t border-gray-100 my-2"></div>
                  
                  {projects.map((project) => (
                    <button
                      key={project.id}
                      onClick={() => handleProjectSwitch(project.id)}
                      className={`w-full flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors ${
                        activeProject?.id === project.id ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                      }`}
                    >
                      <ProjectLogo project={project} size="sm" />
                      <div className="flex-1 text-left">
                        <div className="font-medium truncate">{project.project_name}</div>
                        <div className="text-xs opacity-75 capitalize">
                          {project.project_type?.replace('_', ' ')}
                        </div>
                      </div>
                    </button>
                  ))}
                </>
              ) : (
                <div className="p-4 text-center text-gray-500 text-sm">
                  No hay proyectos disponibles
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* New Conversation Button */}
      <div className="p-4 border-b border-gray-200">
        <button
          onClick={handleNewConversation}
          disabled={conversationLoading}
          className="w-full flex items-center justify-center space-x-2 p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <PlusIcon className="w-4 h-4" />
          <span className="font-medium">Nueva Conversación</span>
        </button>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Conversaciones
            </h3>
            <span className="text-xs text-gray-400">
              {conversationsData?.length || 0}
            </span>
          </div>

          {error && (
            <div className="p-4 text-sm text-red-600 bg-red-50 rounded-lg mb-4">
              Error al cargar conversaciones
            </div>
          )}

          {conversationLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-12 bg-gray-100 rounded-lg"></div>
                </div>
              ))}
            </div>
          ) : conversationsData && conversationsData.length > 0 ? (
            <div className="space-y-1">
              {conversationsData.map((conversation) => (
                <button
                  key={conversation.id}
                  onClick={() => handleSelectConversation(conversation)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    currentConversation?.id === conversation.id
                      ? 'bg-blue-50 border border-blue-200'
                      : 'hover:bg-gray-50 border border-transparent'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`flex-shrink-0 w-2 h-2 rounded-full mt-2 ${
                      currentConversation?.id === conversation.id
                        ? 'bg-blue-500'
                        : 'bg-gray-300'
                    }`}></div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-medium text-gray-900 truncate text-sm">
                          {conversation.title || 'Nueva conversación'}
                        </h4>
                        <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                          {formatDate(conversation.updated_at)}
                        </span>
                      </div>
                      
                      {/* Project indicator if conversation has project */}
                      {conversation.project_id && (
                        <div className="flex items-center space-x-1 mb-1">
                          <div className="w-3 h-3 bg-blue-100 rounded flex items-center justify-center">
                            <FolderIcon className="w-2 h-2 text-blue-600" />
                          </div>
                          <span className="text-xs text-blue-600 truncate">
                            {projects.find(p => p.id === conversation.project_id)?.project_name || 'Proyecto'}
                          </span>
                        </div>
                      )}
                      
                      <p className="text-xs text-gray-500 truncate">
                        {/* This would show last message - for now show placeholder */}
                        Toca para continuar la conversación...
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <ChatBubbleLeftIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-sm">No hay conversaciones</p>
              <p className="text-xs mt-1">Inicia una nueva conversación arriba</p>
            </div>
          )}
        </div>
      </div>

      {/* User Info/Settings */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium text-gray-600">
              {currentUser?.name?.charAt(0) || 'U'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-gray-900 truncate text-sm">
              {currentUser?.name || 'Usuario'}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {currentUser?.phone_number || 'Sin número'}
            </p>
          </div>
          <button className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
            <Cog6ToothIcon className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>
    </div>
  );
}