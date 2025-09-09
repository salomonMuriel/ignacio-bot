/**
 * ChatInterface Component
 * Main chat layout that combines ConversationList, MessageDisplay, and MessageInput
 * Handles the overall chat state and communication between components
 */

import React, { useState, useEffect, useRef } from 'react';
import { Message, MessageType, ChatState, AgentMessageResponse } from '../../types';
import { chatService } from '../../services/chatService';
import ConversationList from './ConversationList';
import MessageDisplay from './MessageDisplay';
import MessageInput from './MessageInput';

export const ChatInterface: React.FC = () => {
  // Temporary user ID for Phase 2 (before authentication)
  const TEMP_USER_ID = '00000000-0000-0000-0000-000000000000';

  const [chatState, setChatState] = useState<ChatState>({
    conversations: [],
    currentConversation: null,
    isLoading: false,
    error: null,
  });

  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatState.currentConversation?.messages]);

  // Load conversations on component mount
  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    setChatState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const conversations = await chatService.getConversations();
      setChatState(prev => ({
        ...prev,
        conversations,
        isLoading: false
      }));
    } catch (error) {
      console.error('Failed to load conversations:', error);
      setChatState(prev => ({
        ...prev,
        error: 'Error al cargar las conversaciones',
        isLoading: false
      }));
    }
  };

  const createNewConversation = async () => {
    try {
      const newConversation = await chatService.createConversation({
        title: 'Nueva Conversación'
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
    setIsSendingMessage(true);

    try {
      // Start conversation with initial message (Agent SDK)
      const agentResponse = await chatService.startConversation({
        initial_message: content,
        title: content.length > 50 ? content.substring(0, 50) + '...' : content,
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
      loadConversations();

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
      <div className="w-80 flex-shrink-0">
        <ConversationList
          conversations={conversations}
          currentConversationId={currentConversation?.id || null}
          onConversationSelect={selectConversation}
          onNewConversation={createNewConversation}
          onDeleteConversation={deleteConversation}
          isLoading={isLoading && !currentConversation}
        />
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
            <div className="text-center">
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
              <h3 className="text-lg font-bold text-ignia-dark-gray mb-2">Bienvenido a Ignacio</h3>
              <p className="text-gray-600 mb-4">Selecciona una conversación o inicia una nueva para comenzar a chatear</p>
              <button
                onClick={createNewConversation}
                className="inline-flex items-center px-4 py-2 bg-ignia-gradient-1 text-ignia-dark-gray font-semibold rounded-lg hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all transform hover:scale-105"
              >
                Iniciar Nueva Conversación
              </button>
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
    </div>
  );
};

export default ChatInterface;
