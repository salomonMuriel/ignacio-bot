import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useProjects } from '../contexts/ProjectsContext';
import { useConversations } from '../contexts/ConversationsContext';
import { useNavigate } from 'react-router-dom';
import type { Conversation, OptimisticMessage, MessageResponse } from '@/types';
import { OptimisticMessageStatus, MessageType } from '@/types';
import ChatLoadingScreen from '../components/ui/ChatLoadingScreen';
import AuthRequiredScreen from '../components/ui/AuthRequiredScreen';
import ConversationSidebar from '../components/chatPage/ConversationSidebar';
import ChatHeader from '../components/chatPage/ChatHeader';
import MessageList from '../components/chatPage/MessageList';
import MessageInput from '../components/chatPage/MessageInput';

export default function ChatPage() {
  const { user } = useAuth();
  const { projects, activeProject, setActiveProject, isLoading: projectsLoading } = useProjects();
  const {
    conversations,
    activeConversation,
    sendMessage,
    loadConversation,
    setActiveConversation
  } = useConversations();
  const navigate = useNavigate();
  const [messageInput, setMessageInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Helper function to convert MessageResponse to OptimisticMessage
  const messageToOptimistic = (message: MessageResponse, status: OptimisticMessageStatus = OptimisticMessageStatus.SENT): OptimisticMessage => ({
    id: message.id,
    content: message.content || '',
    is_from_user: message.is_from_user,
    message_type: message.message_type,
    created_at: message.created_at,
    status,
    file_path: message.file_path,
    attachments: [],
  });

  // Manual optimistic state management
  const [pendingMessages, setPendingMessages] = useState<OptimisticMessage[]>([]);

  // Combine real messages with pending optimistic messages
  const realMessages = useMemo(() => {
    return activeConversation?.messages?.map(msg => messageToOptimistic(msg)) || [];
  }, [activeConversation?.messages]);

  const optimisticMessages = useMemo(() => {
    // Simply combine real messages with all pending messages
    // Pending messages are cleared on successful send, so no complex filtering needed
    console.log('Combining messages - Real:', realMessages.length, 'Pending:', pendingMessages.length);
    return [...realMessages, ...pendingMessages];
  }, [realMessages, pendingMessages]);

  const addOptimisticMessage = (message: OptimisticMessage) => {
    console.log('Adding optimistic message:', message);
    setPendingMessages(prev => {
      const existingIndex = prev.findIndex(m => m.id === message.id);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = message;
        return updated;
      }
      return [...prev, message];
    });
  };

  // Note: No automatic cleanup needed since we clear pending messages on successful send

  // Clear pending messages when conversation changes
  useEffect(() => {
    setPendingMessages([]);
  }, [activeConversation?.id]);

  // Redirect if user has no projects
  useEffect(() => {
    if (!projectsLoading && projects.length === 0) {
      navigate('/create-project');
    }
  }, [projects, projectsLoading, navigate]);

  // Auto-select first project if none is active
  useEffect(() => {
    if (!activeProject && projects.length > 0) {
      setActiveProject(projects[0]);
    }
  }, [activeProject, projects, setActiveProject]);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'instant' });
  };

  useEffect(() => {
    console.log('Optimistic messages changed:', optimisticMessages.length, optimisticMessages);
    console.log('Real messages:', realMessages.length, 'Pending messages:', pendingMessages.length);
    if (optimisticMessages.length > 0) {
      scrollToBottom();
    }
  }, [optimisticMessages, realMessages.length, pendingMessages.length]);

  // Scroll to bottom when starting to send a message
  useEffect(() => {
    if (isSending) {
      scrollToBottom();
    }
  }, [isSending]);

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !activeProject || isSending) return;

    const messageContent = messageInput.trim();

    // Clear input immediately
    setMessageInput('');

    // Create optimistic message with temporary ID
    const tempId = `temp-${Date.now()}`;
    const optimisticUserMessage: OptimisticMessage = {
      id: tempId,
      content: messageContent,
      is_from_user: true,
      message_type: MessageType.TEXT,
      created_at: new Date().toISOString(),
      status: OptimisticMessageStatus.PENDING,
      attachments: [],
    };

    // Add optimistic message immediately
    console.log('Adding optimistic message:', optimisticUserMessage);
    addOptimisticMessage(optimisticUserMessage);

    setIsSending(true);
    try {
      const response = await sendMessage({
        content: messageContent,
        conversationId: activeConversation?.id
      });

      // Clear all pending messages since the real messages will come from the conversation reload
      console.log('Message sent successfully, clearing all pending messages');
      setPendingMessages([]);

      // The conversation context will reload and show the real messages

    } catch (error) {
      console.error('Failed to send message:', error);

      // Update optimistic message to failed status
      const failedMessage: OptimisticMessage = {
        ...optimisticUserMessage,
        status: OptimisticMessageStatus.FAILED,
        error: error instanceof Error ? error.message : 'Failed to send message',
      };
      addOptimisticMessage(failedMessage);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleRetryMessage = async (failedMessage: OptimisticMessage) => {
    if (isSending) return;

    // Update message to pending status
    const retryingMessage: OptimisticMessage = {
      ...failedMessage,
      status: OptimisticMessageStatus.PENDING,
      error: undefined,
    };
    addOptimisticMessage(retryingMessage);

    setIsSending(true);
    try {
      const response = await sendMessage({
        content: failedMessage.content,
        conversationId: activeConversation?.id
      });

      // Clear all pending messages since the real messages will come from the conversation reload
      console.log('Retry successful, clearing all pending messages');
      setPendingMessages([]);

    } catch (error) {
      console.error('Failed to retry message:', error);

      // Update back to failed status
      const reFailedMessage: OptimisticMessage = {
        ...retryingMessage,
        status: OptimisticMessageStatus.FAILED,
        error: error instanceof Error ? error.message : 'Failed to send message',
      };
      addOptimisticMessage(reFailedMessage);
    } finally {
      setIsSending(false);
    }
  };

  const handleDeleteMessage = (messageToDelete: OptimisticMessage) => {
    // For now, we'll implement a simple deletion by adding a "DELETED" action to optimistic updates
    // This could be improved with a proper deletion mechanism in the useOptimistic reducer
    console.log('Deleting message:', messageToDelete.id);
    // TODO: Implement proper message deletion
  };

  if (projectsLoading) {
    return <ChatLoadingScreen />;
  }

  if (!user) {
    return <AuthRequiredScreen />;
  }

  if (projects.length === 0) {
    return null; // Will redirect to create-project
  }

  // Filter conversations to only show those for the active project
  const projectConversations = conversations.filter(conv =>
    activeProject ? conv.project_id === activeProject.id : true
  );

  const handleConversationClick = (conversation: Conversation) => {
    loadConversation(conversation.id);
  };

  return (
    <div className="h-screen flex" style={{ background: 'var(--ig-bg-gradient)' }}>
      <ConversationSidebar
        conversations={projectConversations}
        activeConversation={activeConversation}
        activeProject={activeProject}
        onConversationClick={handleConversationClick}
        onNewConversation={() => setActiveConversation(null)}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full">
        <ChatHeader activeConversation={activeConversation} />

        <MessageList
          ref={messagesEndRef}
          optimisticMessages={optimisticMessages}
          activeConversation={activeConversation}
          activeProject={activeProject}
          isSending={isSending}
          onRetryMessage={handleRetryMessage}
          onDeleteMessage={handleDeleteMessage}
        />

        <MessageInput
          messageInput={messageInput}
          setMessageInput={setMessageInput}
          isSending={isSending}
          onSendMessage={handleSendMessage}
          onKeyPress={handleKeyPress}
        />
      </div>
    </div>
  );
}