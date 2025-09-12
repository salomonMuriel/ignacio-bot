'use client';

/**
 * ConversationHeader - Header for conversation view
 * Shows conversation title, project context, and actions
 */

import { useState, useRef, useEffect } from 'react';
import { Conversation, ConversationWithMessages, Project } from '@/types';
import { ProjectLogo } from '@/components/ui/ProjectLogo';
import { 
  ArrowLeftIcon,
  EllipsisVerticalIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

interface ConversationHeaderProps {
  conversation: Conversation;
  conversationData?: ConversationWithMessages;
  project?: Project | null;
  onTitleUpdate: (newTitle: string) => void;
  onBackToSidebar?: () => void;
  isLoading?: boolean;
}

export function ConversationHeader({ 
  conversation, 
  conversationData,
  project,
  onTitleUpdate,
  onBackToSidebar,
  isLoading = false
}: ConversationHeaderProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState(conversation.title || 'Nueva conversación');
  const [showActions, setShowActions] = useState(false);
  const titleInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTitleValue(conversation.title || 'Nueva conversación');
  }, [conversation.title]);

  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, [isEditingTitle]);

  const handleTitleEdit = () => {
    setIsEditingTitle(true);
    setShowActions(false);
  };

  const handleTitleSave = () => {
    if (titleValue.trim() && titleValue.trim() !== conversation.title) {
      onTitleUpdate(titleValue.trim());
    }
    setIsEditingTitle(false);
  };

  const handleTitleCancel = () => {
    setTitleValue(conversation.title || 'Nueva conversación');
    setIsEditingTitle(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleTitleSave();
    } else if (e.key === 'Escape') {
      handleTitleCancel();
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="border-b border-gray-200 bg-white">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left side: Back button + Title */}
          <div className="flex items-center space-x-4 flex-1 min-w-0">
            {onBackToSidebar && (
              <button
                onClick={onBackToSidebar}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors md:hidden"
              >
                <ArrowLeftIcon className="w-5 h-5 text-gray-600" />
              </button>
            )}

            <div className="flex-1 min-w-0">
              {isEditingTitle ? (
                <div className="flex items-center space-x-2">
                  <input
                    ref={titleInputRef}
                    type="text"
                    value={titleValue}
                    onChange={(e) => setTitleValue(e.target.value)}
                    onKeyDown={handleKeyPress}
                    onBlur={handleTitleSave}
                    className="flex-1 text-xl font-semibold text-gray-900 bg-transparent border-b-2 border-blue-500 focus:outline-none"
                    placeholder="Título de la conversación"
                  />
                  <button
                    onClick={handleTitleSave}
                    className="p-1 text-green-600 hover:bg-green-50 rounded"
                  >
                    <CheckIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleTitleCancel}
                    className="p-1 text-red-600 hover:bg-red-50 rounded"
                  >
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div>
                  <div className="flex items-center space-x-2">
                    <h1 className="text-xl font-semibold text-gray-900 truncate">
                      {conversation.title || 'Nueva conversación'}
                    </h1>
                    {isLoading && (
                      <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    )}
                  </div>
                  
                  {/* Metadata */}
                  <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                    <span>
                      Creada: {formatDate(conversation.created_at)}
                    </span>
                    {conversationData && (
                      <span>
                        {conversationData.messages.length} mensaje{conversationData.messages.length !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right side: Project info + Actions */}
          <div className="flex items-center space-x-4">
            {/* Project Context */}
            {project && (
              <div className="flex items-center space-x-2 px-3 py-1.5 bg-blue-50 rounded-lg">
                <ProjectLogo project={project} size="xs" />
                <div className="text-sm">
                  <div className="font-medium text-blue-900">{project.project_name}</div>
                  <div className="text-blue-600 capitalize text-xs">
                    {project.project_type?.replace('_', ' ')}
                  </div>
                </div>
              </div>
            )}

            {/* Actions Menu */}
            <div className="relative">
              <button
                onClick={() => setShowActions(!showActions)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <EllipsisVerticalIcon className="w-5 h-5 text-gray-600" />
              </button>

              {showActions && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                  <div className="py-1">
                    <button
                      onClick={handleTitleEdit}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                    >
                      <PencilIcon className="w-4 h-4" />
                      <span>Editar título</span>
                    </button>
                    
                    {/* Add more actions here in the future */}
                    <div className="border-t border-gray-100 my-1"></div>
                    
                    <div className="px-4 py-2 text-xs text-gray-500">
                      ID: {conversation.id.slice(-8)}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Close actions menu when clicking outside */}
      {showActions && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setShowActions(false)}
        ></div>
      )}
    </div>
  );
}