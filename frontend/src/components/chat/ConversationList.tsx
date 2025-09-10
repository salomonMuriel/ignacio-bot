/**
 * ConversationList Component
 * Displays a list of conversations in the sidebar with options to create, select, and delete conversations
 */

import React from 'react';
import { Conversation } from '../../types';

interface ConversationListProps {
  conversations: Conversation[];
  currentConversationId: string | null;
  onConversationSelect: (conversationId: string) => void;
  onNewConversation: () => void;
  onDeleteConversation: (conversationId: string) => void;
  isLoading?: boolean;
  disabled?: boolean;
}

export const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  currentConversationId,
  onConversationSelect,
  onNewConversation,
  onDeleteConversation,
  isLoading = false,
  disabled = false,
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 168) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const truncateTitle = (title: string | null, maxLength: number = 30) => {
    if (!title) return 'Nueva Conversación';
    return title.length > maxLength ? `${title.substring(0, maxLength)}...` : title;
  };

  return (
    <div className="flex flex-col h-full sidebar-gradient">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-secondary-300/30">
        <h2 className="text-lg font-bold text-white">Conversaciones</h2>
        <button
          onClick={onNewConversation}
          disabled={isLoading || disabled}
          className="inline-flex items-center p-2 text-sm font-medium text-ignia-dark-gray bg-primary-500 border border-transparent rounded-md shadow-sm hover:bg-primary-600 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 transition-all transform hover:scale-105"
        >
          <svg
            className="w-4 h-4 mr-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          Nuevo
        </button>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {disabled ? (
          <div className="p-8 text-center text-white/60">
            <svg
              className="w-12 h-12 mx-auto mb-4 text-white/40"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h3M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 8h1m4 0h1"
              />
            </svg>
            <p>Selecciona un proyecto activo</p>
            <p className="text-sm">para ver sus conversaciones</p>
          </div>
        ) : isLoading ? (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
          </div>
        ) : conversations.length === 0 ? (
          <div className="p-8 text-center text-white/80">
            <svg
              className="w-12 h-12 mx-auto mb-4 text-white/50"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            <p>Aún no hay conversaciones</p>
            <p className="text-sm">Haz clic en "Nuevo" para empezar a chatear</p>
          </div>
        ) : (
          <div className="p-2">
            {conversations.map((conversation) => (
              <div
                key={conversation.id}
                className={`group flex items-center justify-between p-3 mb-1 rounded-lg cursor-pointer transition-all ${
                  currentConversationId === conversation.id
                    ? 'bg-white/20 border border-primary-300/30 shadow-sm'
                    : 'hover:bg-white/10 hover:shadow-sm'
                }`}
                onClick={() => onConversationSelect(conversation.id)}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-sm font-semibold text-white truncate">
                      {truncateTitle(conversation.title)}
                    </h3>
                    <span className="text-xs text-white/60 ml-2">
                      {formatDate(conversation.updated_at)}
                    </span>
                  </div>
                  <div className="flex items-center text-xs text-white/70">
                    <span>{conversation.message_count} mensajes</span>
                  </div>
                </div>

                {/* Delete Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteConversation(conversation.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 ml-2 p-1 text-white/60 hover:text-red-400 transition-all"
                  title="Eliminar conversación"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ConversationList;
