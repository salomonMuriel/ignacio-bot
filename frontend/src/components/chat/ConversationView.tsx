'use client';

/**
 * ConversationView - Main conversation interface
 * Displays messages and handles message input with optimistic updates
 */

import { useState, useEffect, useRef } from 'react';
import useSWR from 'swr';
import { Conversation } from '@/types';
import { useConversation } from '@/contexts/ConversationContext';
import { useProject } from '@/contexts/ProjectContext';
import { api, swrFetchers } from '@/services/api';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { ConversationHeader } from './ConversationHeader';

interface ConversationViewProps {
  conversation: Conversation;
  onBackToSidebar?: () => void;
}

export function ConversationView({ conversation, onBackToSidebar }: ConversationViewProps) {
  const { sendMessage, isLoading: conversationLoading } = useConversation();
  const { projects, activeProject } = useProject();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch conversation details with messages
  const { 
    data: conversationData, 
    error, 
    mutate: mutateConversation,
    isLoading 
  } = useSWR(
    conversation ? `/api/chat/conversations/${conversation.id}` : null,
    swrFetchers.conversation,
    {
      refreshInterval: 5000, // Refresh every 5 seconds for real-time updates
      revalidateOnFocus: true,
    }
  );

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversationData?.messages]);

  const handleSendMessage = async (content: string, files?: File[]) => {
    if (!conversation) return;

    try {
      // Send message with optimistic update
      await sendMessage(conversation.id, content, files);
      
      // Refresh conversation data to get the AI response
      mutateConversation();
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleTitleUpdate = async (newTitle: string) => {
    if (!conversation) return;

    try {
      await api.conversations.update(conversation.id, { title: newTitle });
      mutateConversation();
    } catch (error) {
      console.error('Failed to update conversation title:', error);
    }
  };

  // Find the project associated with this conversation
  const conversationProject = conversation.project_id 
    ? projects.find(p => p.id === conversation.project_id)
    : null;

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Error al cargar la conversación
          </h3>
          <p className="text-gray-600 mb-4">
            No se pudo cargar la conversación. Por favor, intenta de nuevo.
          </p>
          <button
            onClick={() => mutateConversation()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Conversation Header */}
      <ConversationHeader
        conversation={conversation}
        conversationData={conversationData}
        project={conversationProject}
        onTitleUpdate={handleTitleUpdate}
        onBackToSidebar={onBackToSidebar}
        isLoading={isLoading}
      />

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Cargando mensajes...</p>
            </div>
          </div>
        ) : conversationData?.messages ? (
          <>
            <MessageList 
              messages={conversationData.messages}
              isLoading={conversationLoading}
            />
            <div ref={messagesEndRef} />
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <p>No hay mensajes en esta conversación</p>
              <p className="text-sm mt-1">Envía un mensaje para comenzar</p>
            </div>
          </div>
        )}
      </div>

      {/* Message Input */}
      <div className="border-t border-gray-200 p-6 bg-gray-50">
        <MessageInput
          onSendMessage={handleSendMessage}
          disabled={conversationLoading || isLoading}
          placeholder={
            conversationProject 
              ? `Pregúntale a Ignacio sobre ${conversationProject.project_name}...`
              : "Escribe tu mensaje a Ignacio..."
          }
        />
        
        {/* Context Indicator */}
        {conversationProject && (
          <div className="mt-3 flex items-center space-x-2 text-sm text-gray-600">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span>Contexto: {conversationProject.project_name}</span>
            {activeProject?.id !== conversationProject.id && (
              <span className="text-yellow-600">
                (Proyecto diferente al activo)
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}