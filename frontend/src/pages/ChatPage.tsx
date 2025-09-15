import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useProjects } from '../contexts/ProjectsContext';
import { useConversations } from '../contexts/ConversationsContext';
import { useNavigate } from 'react-router-dom';
import type { Conversation } from '@/types';

export default function ChatPage() {
  const { user } = useAuth();
  const { projects, activeProject, setActiveProject, isLoading: projectsLoading } = useProjects();
  const { 
    conversations, 
    activeConversation, 
    sendMessage,
    loadConversation,
    setActiveConversation,
    isLoading: conversationsLoading 
  } = useConversations();
  const navigate = useNavigate();
  const [messageInput, setMessageInput] = useState('');
  const [isSending, setIsSending] = useState(false);

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

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !activeProject || isSending) return;

    setIsSending(true);
    try {
      await sendMessage({content: messageInput, conversationId: activeConversation?.id});
      setMessageInput('');
    } catch (error) {
      console.error('Failed to send message:', error);
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

  if (projectsLoading || conversationsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--ig-bg-gradient)' }}>
        <div className="text-lg" style={{ color: 'var(--ig-text-primary)' }}>Loading chat...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--ig-bg-gradient)' }}>
        <div className="text-lg" style={{ color: 'var(--ig-text-primary)' }}>Please log in to access chat.</div>
      </div>
    );
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
      {/* Sidebar - Conversations */}
      <div className="w-80 flex flex-col h-full" style={{
        background: 'var(--ig-surface-secondary)',
        borderRight: '1px solid var(--ig-border-primary)',
        backdropFilter: 'blur(10px)'
      }}>
        <div className="p-4 flex-shrink-0" style={{ borderBottom: '1px solid var(--ig-border-primary)' }}>
          <h2 className="text-lg font-semibold" style={{ color: 'var(--ig-text-primary)' }}>Conversations</h2>
          {activeProject && (
            <div className="mt-2">
              <p className="text-sm" style={{ color: 'var(--ig-text-muted)' }}>Project:</p>
              <p className="font-medium truncate" style={{ color: 'var(--ig-text-accent)' }}>{activeProject.project_name}</p>
            </div>
          )}
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {projectConversations.length === 0 ? (
            <div className="p-4 text-center" style={{ color: 'var(--ig-text-muted)' }}>
              <p>No conversations yet.</p>
              <p className="text-sm mt-1">Start chatting with Ignacio!</p>
            </div>
          ) : (
            projectConversations.map((conversation) => (
              <div
                key={conversation.id}
                onClick={() => handleConversationClick(conversation)}
                className={`p-4 cursor-pointer transition-all duration-200 ${
                  activeConversation?.id === conversation.id
                    ? ''
                    : ''
                }`}
                style={{
                  borderBottom: '1px solid var(--ig-border-primary)',
                  ...(activeConversation?.id === conversation.id
                    ? {
                        background: 'var(--ig-surface-glass)',
                        borderLeft: '4px solid var(--ig-border-accent)',
                        backdropFilter: 'blur(10px)'
                      }
                    : {
                        ':hover': {
                          background: 'rgba(89, 47, 126, 0.3)'
                        }
                      }
                  )
                }}
              >
                <p className="font-medium truncate" style={{ color: 'var(--ig-text-primary)' }}>
                  {conversation.title || 'New Conversation'}
                </p>
                <p className="text-sm mt-1" style={{ color: 'var(--ig-text-muted)' }}>
                  {conversation.created_at && new Date(conversation.created_at).toLocaleDateString()}
                </p>
                {activeConversation?.id === conversation.id && (
                  <div className="mt-1">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium" style={{
                      background: 'var(--ig-accent-gradient)',
                      color: 'var(--ig-dark-primary)'
                    }}>
                      Active
                    </span>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        <div className="p-4 flex-shrink-0" style={{ borderTop: '1px solid var(--ig-border-primary)' }}>
          <button
            onClick={() => {
              // Clear active conversation to start fresh
              // New conversation will be created automatically when user sends first message
              setActiveConversation(null);
            }}
            className="w-full py-2 px-4 rounded-lg transition-all duration-200 font-medium"
            style={{
              background: 'var(--ig-accent-gradient)',
              color: 'var(--ig-dark-primary)'
            }}
            onMouseEnter={(e) => (e.target as HTMLButtonElement).style.background = 'var(--ig-accent-gradient-hover)'}
            onMouseLeave={(e) => (e.target as HTMLButtonElement).style.background = 'var(--ig-accent-gradient)'}
          >
            New Conversation
          </button>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full">
        {/* Chat Header */}
        <div className="p-4 flex-shrink-0" style={{
          background: 'var(--ig-surface-primary)',
          borderBottom: '1px solid var(--ig-border-primary)',
          backdropFilter: 'blur(10px)'
        }}>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold" style={{ color: 'var(--ig-text-primary)' }}>Chat with Ignacio</h1>
              {activeConversation && (
                <p className="text-sm" style={{ color: 'var(--ig-text-muted)' }}>
                  {activeConversation.title || 'New Conversation'}
                </p>
              )}
            </div>
            <button
              onClick={() => navigate('/projects')}
              className="px-3 py-1 rounded border transition-all duration-200"
              style={{
                color: 'var(--ig-text-accent)',
                borderColor: 'var(--ig-border-accent)'
              }}
              onMouseEnter={(e) => {
                const target = e.target as HTMLButtonElement;
                target.style.background = 'var(--ig-surface-glass)';
                target.style.borderColor = 'var(--ig-accent-yellow)';
              }}
              onMouseLeave={(e) => {
                const target = e.target as HTMLButtonElement;
                target.style.background = 'transparent';
                target.style.borderColor = 'var(--ig-border-accent)';
              }}
            >
              Manage Projects
            </button>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
          {!activeConversation ? (
            <div className="text-center mt-8" style={{ color: 'var(--ig-text-muted)' }}>
              <p>Starting new conversation...</p>
            </div>
          ) : activeConversation.messages.length === 0 ? (
            <div className="text-center mt-8" style={{ color: 'var(--ig-text-muted)' }}>
              <div className="rounded-lg p-8 max-w-2xl mx-auto" style={{
                background: 'var(--ig-surface-glass)',
                border: '1px solid var(--ig-border-glass)',
                backdropFilter: 'blur(10px)'
              }}>
                <h3 className="text-lg font-medium mb-4" style={{ color: 'var(--ig-text-primary)' }}>
                  Welcome to your chat with Ignacio!
                </h3>
                <p className="mb-4" style={{ color: 'var(--ig-text-secondary)' }}>
                  I'm here to help you develop your project: <strong style={{ color: 'var(--ig-text-accent)' }}>{activeProject?.project_name}</strong>
                </p>
                <p className="mb-6" style={{ color: 'var(--ig-text-secondary)' }}>
                  Ask me anything about marketing, technical implementation, business strategy,
                  or any other aspect of your project. I can also help you with:
                </p>
                <ul className="text-left space-y-2 mb-6" style={{ color: 'var(--ig-text-secondary)' }}>
                  <li>• Market research and validation</li>
                  <li>• Technical architecture and implementation</li>
                  <li>• Business model development</li>
                  <li>• Financial planning and analysis</li>
                  <li>• Project management and roadmapping</li>
                </ul>
                <p className="text-sm" style={{ color: 'var(--ig-text-muted)' }}>
                  Type your message below to get started!
                </p>
              </div>
            </div>
          ) : (
            activeConversation.messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.is_from_user ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className="max-w-3xl rounded-lg p-4"
                  style={{
                    ...(message.is_from_user
                      ? {
                          background: 'var(--ig-accent-gradient)',
                          color: 'var(--ig-dark-primary)'
                        }
                      : {
                          background: 'var(--ig-surface-glass)',
                          border: '1px solid var(--ig-border-glass)',
                          color: 'var(--ig-text-primary)',
                          backdropFilter: 'blur(10px)'
                        }
                    )
                  }}
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>
                  <p
                    className="text-xs mt-2"
                    style={{
                      color: message.is_from_user
                        ? 'rgba(21, 25, 45, 0.7)'
                        : 'var(--ig-text-muted)'
                    }}
                  >
                    {message.created_at && new Date(message.created_at).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Message Input */}
        <div className="p-4 flex-shrink-0" style={{
          background: 'var(--ig-surface-primary)',
          borderTop: '1px solid var(--ig-border-primary)',
          backdropFilter: 'blur(10px)'
        }}>
          <div className="flex space-x-4">
            <div className="flex-1">
              <textarea
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Type your message to Ignacio..."
                className="w-full p-3 rounded-lg resize-none transition-all duration-200"
                style={{
                  background: 'var(--ig-surface-glass)',
                  border: '1px solid var(--ig-border-primary)',
                  color: 'var(--ig-text-primary)',
                  backdropFilter: 'blur(10px)',
                }}
                rows={3}
                disabled={isSending}
                onFocus={(e) => (e.target as HTMLTextAreaElement).style.borderColor = 'var(--ig-border-accent)'}
                onBlur={(e) => (e.target as HTMLTextAreaElement).style.borderColor = 'var(--ig-border-primary)'}
              />
            </div>
            <button
              onClick={handleSendMessage}
              disabled={!messageInput.trim() || isSending}
              className="px-6 py-3 rounded-lg font-medium transition-all duration-200 self-end"
              style={{
                background: !messageInput.trim() || isSending
                  ? 'rgba(89, 47, 126, 0.5)'
                  : 'var(--ig-accent-gradient)',
                color: !messageInput.trim() || isSending
                  ? 'var(--ig-text-muted)'
                  : 'var(--ig-dark-primary)',
                cursor: !messageInput.trim() || isSending ? 'not-allowed' : 'pointer'
              }}
              onMouseEnter={(e) => {
                if (!(!messageInput.trim() || isSending)) {
                  (e.target as HTMLButtonElement).style.background = 'var(--ig-accent-gradient-hover)';
                }
              }}
              onMouseLeave={(e) => {
                if (!(!messageInput.trim() || isSending)) {
                  (e.target as HTMLButtonElement).style.background = 'var(--ig-accent-gradient)';
                }
              }}
            >
              {isSending ? 'Sending...' : 'Send'}
            </button>
          </div>
          <p className="text-xs mt-2" style={{ color: 'var(--ig-text-muted)' }}>
            Press Enter to send, Shift+Enter for new line
          </p>
        </div>
      </div>
    </div>
  );
}