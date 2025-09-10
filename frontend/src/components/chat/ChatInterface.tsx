/**
 * ChatInterface Component
 * Main chat layout that combines ConversationList, MessageDisplay, and MessageInput
 * Handles the overall chat state and communication between components
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Message, MessageType, ChatState, AgentMessageResponse } from '../../types';
import { chatService } from '../../services/chatService';
import { useProject } from '../../contexts/ProjectContext';
import ConversationList from './ConversationList';
import MessageDisplay from './MessageDisplay';
import MessageInput from './MessageInput';
import ProjectManager from '../projects/ProjectManager';

export const ChatInterface: React.FC = () => {
  // Temporary user ID for Phase 2 (before authentication)  
  // Must match the TEMP_USER_ID in backend/app/routers/chat.py
  const TEMP_USER_ID = 'a456f25a-6269-4de3-87df-48b0a3389d01';

  const { activeProject, projects } = useProject();
  const [chatState, setChatState] = useState<ChatState>({
    conversations: [],
    currentConversation: null,
    isLoading: false,
    error: null,
  });

  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [showProjectManager, setShowProjectManager] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatState.currentConversation?.messages]);

  const loadProjectConversations = useCallback(async () => {
    if (!activeProject) return;

    setChatState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Get all conversations and filter by active project
      const allConversations = await chatService.getConversations();
      const projectConversations = allConversations.filter(
        conv => conv.project_id === activeProject.id
      );
      
      setChatState(prev => ({
        ...prev,
        conversations: projectConversations,
        isLoading: false,
        // Clear current conversation if it doesn't belong to active project
        currentConversation: prev.currentConversation?.project_id === activeProject.id 
          ? prev.currentConversation 
          : null
      }));
    } catch (error) {
      console.error('Failed to load project conversations:', error);
      setChatState(prev => ({
        ...prev,
        error: 'Error al cargar las conversaciones del proyecto',
        isLoading: false
      }));
    }
  }, [activeProject]);

  // Load conversations when active project changes
  useEffect(() => {
    if (activeProject) {
      loadProjectConversations();
    } else {
      setChatState(prev => ({ 
        ...prev, 
        conversations: [], 
        currentConversation: null 
      }));
    }
  }, [activeProject, loadProjectConversations]);

  const createNewConversation = async () => {
    if (!activeProject) {
      setChatState(prev => ({
        ...prev,
        error: 'Debes tener un proyecto activo para crear conversaciones'
      }));
      return;
    }

    try {
      const newConversation = await chatService.createConversation({
        title: 'Nueva Conversación',
        project_id: activeProject.id
      });

      // Add to conversations list and select it
      setChatState(prev => ({
        ...prev,
        conversations: [newConversation, ...prev.conversations],
      }));

      // Load the new conversation details
      await selectConversation(newConversation.id);
    } catch (error) {
      console.error('Failed to create conversation:', error);
      setChatState(prev => ({
        ...prev,
        error: 'Error al crear la conversación'
      }));
    }
  };

  const selectConversation = async (conversationId: string) => {
    setChatState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const conversationDetails = await chatService.getConversationDetails(conversationId);
      setChatState(prev => ({
        ...prev,
        currentConversation: conversationDetails,
        isLoading: false
      }));
    } catch (error) {
      console.error('Failed to load conversation details:', error);
      setChatState(prev => ({
        ...prev,
        error: 'Error al cargar la conversación',
        isLoading: false
      }));
    }
  };

  const deleteConversation = async (conversationId: string) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar esta conversación?')) {
      return;
    }

    try {
      await chatService.deleteConversation(conversationId);

      // Remove from conversations list
      setChatState(prev => ({
        ...prev,
        conversations: prev.conversations.filter(c => c.id !== conversationId),
        currentConversation: prev.currentConversation?.id === conversationId
          ? null
          : prev.currentConversation
      }));
    } catch (error) {
      console.error('Failed to delete conversation:', error);
      setChatState(prev => ({
        ...prev,
        error: 'Error al eliminar la conversación'
      }));
    }
  };

  const sendMessage = async (content: string, messageType: MessageType = MessageType.TEXT, fileId?: string) => {
    if (!chatState.currentConversation) {
      // Start a new conversation with initial message (Agent SDK)
      await startNewConversationWithMessage(content, messageType);
      return;
    }

    setIsSendingMessage(true);

    // Optimistically add user message to UI
    const tempUserMessage: Message = {
      id: `temp-${Date.now()}`,
      content,
      message_type: messageType,
      is_from_user: true,
      created_at: new Date().toISOString(),
    };

    setChatState(prev => ({
      ...prev,
      currentConversation: prev.currentConversation ? {
        ...prev.currentConversation,
        messages: [...prev.currentConversation.messages, tempUserMessage]
      } : null
    }));

    try {
      // Send message to backend and get AI response (Agent SDK)
      const agentResponse = await chatService.sendMessage(chatState.currentConversation.id, {
        content,
        message_type: messageType,
      });

      // Remove temp message and add real user message + AI response
      setChatState(prev => ({
        ...prev,
        currentConversation: prev.currentConversation ? {
          ...prev.currentConversation,
          messages: [
            ...prev.currentConversation.messages.filter(m => !m.id.startsWith('temp-')),
            {
              ...tempUserMessage,
              id: `user-${Date.now()}`, // Real user message ID will be set by backend
            },
            agentResponse.message
          ]
        } : null
      }));

      // Update message count in conversations list
      setChatState(prev => ({
        ...prev,
        conversations: prev.conversations.map(conv =>
          conv.id === chatState.currentConversation?.id
            ? { ...conv, message_count: conv.message_count + 2 } // User + AI message
            : conv
        )
      }));

    } catch (error) {
      console.error('Failed to send message:', error);

      // Remove optimistic message on error
      setChatState(prev => ({
        ...prev,
        currentConversation: prev.currentConversation ? {
          ...prev.currentConversation,
          messages: prev.currentConversation.messages.filter(m => !m.id.startsWith('temp-'))
        } : null,
        error: 'Error al enviar el mensaje'
      }));
    } finally {
      setIsSendingMessage(false);
    }
  };

  const startNewConversationWithMessage = async (content: string, messageType: MessageType = MessageType.TEXT) => {
    if (!activeProject) {
      setChatState(prev => ({
        ...prev,
        error: 'Debes tener un proyecto activo para enviar mensajes'
      }));
      return;
    }

    setIsSendingMessage(true);

    try {
      // Start conversation with initial message (Agent SDK)
      const agentResponse = await chatService.startConversation({
        initial_message: content,
        title: content.length > 50 ? content.substring(0, 50) + '...' : content,
        project_id: activeProject.id,
      });

      // Create user message
      const userMessage: Message = {
        id: `user-${Date.now()}`,
        content,
        message_type: messageType,
        is_from_user: true,
        created_at: new Date().toISOString(),
      };

      // Create AI response message
      const aiMessage: Message = agentResponse.message;

      // Create conversation object from response
      const conversationId = agentResponse.conversation_id || `new-${Date.now()}`;
      const newConversation = {
        id: conversationId,
        title: content.length > 50 ? content.substring(0, 50) + '...' : content,
        project_id: activeProject.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        message_count: 2,
        messages: [userMessage, aiMessage],
      };

      // Add to conversations list and set as current
      setChatState(prev => ({
        ...prev,
        conversations: [newConversation, ...prev.conversations],
        currentConversation: newConversation,
      }));

      // Reload conversations to get accurate data
      loadProjectConversations();

    } catch (error) {
      console.error('Failed to start conversation:', error);
      setChatState(prev => ({
        ...prev,
        error: 'Error al iniciar la conversación'
      }));
    } finally {
      setIsSendingMessage(false);
    }
  };

  const { conversations, currentConversation, isLoading, error } = chatState;

  return (
    <div className="flex h-screen bg-stone-50">
      {/* Sidebar */}
      <div className="w-80 flex-shrink-0 flex flex-col">
        {/* Project Header */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
              Proyecto Activo
            </h2>
            <button
              onClick={() => setShowProjectManager(true)}
              className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Gestionar proyectos"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
            </button>
          </div>
          
          {activeProject ? (
            <div className="bg-gradient-to-r from-primary-50 to-secondary-50 rounded-lg p-3 border border-primary-200">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-ignia-dark-gray truncate">
                    {activeProject.name}
                  </h3>
                  <p className="text-sm text-gray-600 capitalize">
                    {activeProject.type} • {activeProject.stage}
                  </p>
                </div>
                <button
                  onClick={() => setShowProjectManager(true)}
                  className="ml-2 p-2 text-primary-600 hover:text-primary-700 hover:bg-primary-100 rounded-lg transition-colors flex-shrink-0"
                  title="Cambiar proyecto"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-3 border border-gray-200 text-center">
              <p className="text-sm text-gray-600 mb-2">Sin proyecto activo</p>
              <button
                onClick={() => setShowProjectManager(true)}
                className="text-sm text-primary-600 hover:text-primary-700 font-semibold"
              >
                Seleccionar proyecto
              </button>
            </div>
          )}
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-hidden">
          <ConversationList
            conversations={conversations}
            currentConversationId={currentConversation?.id || null}
            onConversationSelect={selectConversation}
            onNewConversation={createNewConversation}
            onDeleteConversation={deleteConversation}
            isLoading={isLoading && !currentConversation}
            disabled={!activeProject}
          />
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 text-sm">
            {error}
            <button
              onClick={() => setChatState(prev => ({ ...prev, error: null }))}
              className="ml-2 text-red-800 underline"
            >
              Cerrar
            </button>
          </div>
        )}

        {!currentConversation ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center max-w-md">
              <svg
                className="w-16 h-16 mx-auto mb-4 text-gray-300"
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
              <h3 className="text-lg font-bold text-ignia-dark-gray mb-2">
                {activeProject ? `¡Hola! Trabajemos en ${activeProject.name}` : 'Bienvenido a Ignacio'}
              </h3>
              
              {activeProject ? (
                <>
                  <p className="text-gray-600 mb-4">
                    Selecciona una conversación existente o inicia una nueva para continuar desarrollando tu proyecto.
                  </p>
                  <button
                    onClick={createNewConversation}
                    className="inline-flex items-center px-4 py-2 bg-ignia-gradient-1 text-ignia-dark-gray font-semibold rounded-lg hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all transform hover:scale-105"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Nueva Conversación
                  </button>
                </>
              ) : (
                <>
                  <p className="text-gray-600 mb-4">
                    Necesitas seleccionar un proyecto activo para comenzar a chatear con Ignacio.
                  </p>
                  <button
                    onClick={() => setShowProjectManager(true)}
                    className="inline-flex items-center px-4 py-2 bg-ignia-gradient-1 text-ignia-dark-gray font-semibold rounded-lg hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all transform hover:scale-105"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h3M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 8h1m4 0h1" />
                    </svg>
                    Seleccionar Proyecto
                  </button>
                </>
              )}
            </div>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div className="bg-white border-b border-primary-200 px-6 py-4 shadow-sm">
              <h1 className="text-lg font-bold text-ignia-dark-gray">
                {currentConversation.title || 'Conversación'}
              </h1>
              <p className="text-sm text-gray-600">
                {currentConversation.messages.length} mensajes
              </p>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto bg-white px-6 py-4">
              {isLoading && !currentConversation.messages.length ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
                </div>
              ) : currentConversation.messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center text-gray-600">
                    <p>Aún no hay mensajes. ¡Inicia la conversación!</p>
                  </div>
                </div>
              ) : (
                <>
                  {currentConversation.messages.map((message) => (
                    <MessageDisplay key={message.id} message={message} />
                  ))}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Message Input */}
            <MessageInput
              onSendMessage={sendMessage}
              disabled={isSendingMessage}
              conversationId={currentConversation.id}
              userId={TEMP_USER_ID}
            />
          </>
        )}
      </div>

      {/* Project Manager Modal */}
      <ProjectManager
        isOpen={showProjectManager}
        onClose={() => setShowProjectManager(false)}
      />
    </div>
  );
};

export default ChatInterface;
