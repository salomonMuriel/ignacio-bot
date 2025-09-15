import { useEffect, useState, useRef } from 'react';
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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

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
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (activeConversation?.messages) {
      scrollToBottom();
    }
  }, [activeConversation?.messages]);

  // Scroll to bottom when starting to send a message
  useEffect(() => {
    if (isSending) {
      scrollToBottom();
    }
  }, [isSending]);

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
        <div className="glass-surface rounded-2xl p-8 text-center" style={{ boxShadow: 'var(--ig-shadow-xl)' }}>
          <div className="w-16 h-16 mx-auto mb-6 rounded-full glass-surface-light flex items-center justify-center" style={{
            boxShadow: 'var(--ig-shadow-md), var(--ig-shadow-glow-accent)',
            animation: 'pulseGlow 2s infinite'
          }}>
            <span className="text-2xl font-bold" style={{ color: 'var(--ig-text-accent)' }}>I</span>
          </div>
          <div className="flex items-center justify-center space-x-3">
            <div className="w-2 h-2 rounded-full" style={{
              background: 'var(--ig-text-accent)',
              animation: 'typingDots 1.4s infinite ease-in-out'
            }}></div>
            <div className="w-2 h-2 rounded-full" style={{
              background: 'var(--ig-text-accent)',
              animation: 'typingDots 1.4s infinite ease-in-out 0.2s'
            }}></div>
            <div className="w-2 h-2 rounded-full" style={{
              background: 'var(--ig-text-accent)',
              animation: 'typingDots 1.4s infinite ease-in-out 0.4s'
            }}></div>
          </div>
          <p className="text-lg font-medium mt-4" style={{ color: 'var(--ig-text-primary)' }}>Loading chat...</p>
          <p className="text-sm mt-2" style={{ color: 'var(--ig-text-muted)' }}>Preparing your conversation with Ignacio</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--ig-bg-gradient)' }}>
        <div className="glass-surface rounded-2xl p-8 text-center" style={{ boxShadow: 'var(--ig-shadow-xl)' }}>
          <div className="w-16 h-16 mx-auto mb-6 rounded-full glass-surface-light flex items-center justify-center" style={{
            boxShadow: 'var(--ig-shadow-md)',
            border: '2px solid var(--ig-border-accent)'
          }}>
            <svg className="w-8 h-8" style={{ color: 'var(--ig-text-accent)' }} fill="currentColor" viewBox="0 0 24 24">
              <path d="M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z"/>
            </svg>
          </div>
          <p className="text-lg font-medium mb-2" style={{ color: 'var(--ig-text-primary)' }}>Authentication Required</p>
          <p className="text-sm" style={{ color: 'var(--ig-text-muted)' }}>Please log in to access chat with Ignacio</p>
        </div>
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
      <div className="w-80 flex flex-col h-full glass-surface" style={{
        borderRight: '1px solid var(--ig-border-primary)',
        boxShadow: 'var(--ig-shadow-lg)'
      }}>
        {/* Sidebar Header */}
        <div className="p-6 flex-shrink-0" style={{ borderBottom: '1px solid var(--ig-border-primary)' }}>
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-8 h-8 rounded-lg glass-surface-light flex items-center justify-center" style={{
              boxShadow: 'var(--ig-shadow-sm)'
            }}>
              <svg className="w-4 h-4" style={{ color: 'var(--ig-text-accent)' }} fill="currentColor" viewBox="0 0 24 24">
                <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4l4 4 4-4h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
              </svg>
            </div>
            <h2 className="text-lg font-semibold" style={{ color: 'var(--ig-text-primary)' }}>Conversations</h2>
          </div>

          {activeProject && (
            <div className="glass-surface-light rounded-xl p-4" style={{
              boxShadow: 'var(--ig-shadow-sm)'
            }}>
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-2 h-2 rounded-full" style={{ background: 'var(--ig-accent-gradient)' }}></div>
                <p className="text-xs font-medium" style={{ color: 'var(--ig-text-muted)' }}>ACTIVE PROJECT</p>
              </div>
              <p className="font-medium truncate text-sm" style={{ color: 'var(--ig-text-accent)' }}>{activeProject.project_name}</p>
            </div>
          )}
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {projectConversations.length === 0 ? (
            <div className="p-6 text-center" style={{
              color: 'var(--ig-text-muted)',
              animation: 'fadeInUp 0.3s var(--ig-spring)'
            }}>
              <div className="glass-surface-light rounded-xl p-6" style={{
                boxShadow: 'var(--ig-shadow-sm)'
              }}>
                <div className="w-12 h-12 mx-auto mb-4 rounded-full glass-surface flex items-center justify-center" style={{
                  boxShadow: 'var(--ig-shadow-sm)'
                }}>
                  <svg className="w-6 h-6" style={{ color: 'var(--ig-text-muted)' }} fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4l4 4 4-4h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 9h12v2H6V9zm8 5H6v-2h8v2zm4-6H6V6h12v2z"/>
                  </svg>
                </div>
                <p className="font-medium mb-1">No conversations yet</p>
                <p className="text-sm">Start chatting with Ignacio!</p>
              </div>
            </div>
          ) : (
            <div className="p-3 space-y-2">
              {projectConversations.map((conversation) => {
                const isActive = activeConversation?.id === conversation.id;
                return (
                  <div
                    key={conversation.id}
                    onClick={() => handleConversationClick(conversation)}
                    className={`group relative p-4 cursor-pointer transition-all duration-300 rounded-xl ${
                      isActive ? 'ring-1' : ''
                    }`}
                    style={{
                      ...(isActive
                        ? {
                            background: 'var(--ig-surface-glass-dark)',
                            border: '1px solid var(--ig-border-glass-bright)',
                            backdropFilter: 'var(--ig-blur-lg)',
                            boxShadow: 'var(--ig-shadow-md), var(--ig-shadow-glow)',
                            ringColor: 'var(--ig-border-accent)'
                          }
                        : {
                            background: 'transparent',
                            border: '1px solid transparent'
                          }
                      ),
                      animation: 'fadeInUp 0.3s var(--ig-spring)'
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        const target = e.currentTarget as HTMLDivElement;
                        target.style.background = 'var(--ig-surface-glass-light)';
                        target.style.borderColor = 'var(--ig-border-glass)';
                        target.style.transform = 'translateX(4px)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        const target = e.currentTarget as HTMLDivElement;
                        target.style.background = 'transparent';
                        target.style.borderColor = 'transparent';
                        target.style.transform = 'translateX(0)';
                      }
                    }}
                  >
                    {/* Active indicator */}
                    {isActive && (
                      <div className="absolute left-0 top-1/2 w-1 h-8 rounded-r-full transform -translate-y-1/2" style={{
                        background: 'var(--ig-accent-gradient)',
                        boxShadow: 'var(--ig-shadow-glow)'
                      }}></div>
                    )}

                    <div className="flex items-start space-x-3">
                      {/* Conversation Avatar */}
                      <div className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center transition-all duration-200" style={{
                        background: isActive ? 'var(--ig-accent-gradient)' : 'var(--ig-surface-glass-light)',
                        border: `1px solid ${isActive ? 'transparent' : 'var(--ig-border-glass)'}`,
                        boxShadow: isActive ? 'var(--ig-shadow-sm)' : 'none'
                      }}>
                        <svg className="w-5 h-5" style={{
                          color: isActive ? 'var(--ig-dark-primary)' : 'var(--ig-text-muted)'
                        }} fill="currentColor" viewBox="0 0 24 24">
                          <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4l4 4 4-4h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
                        </svg>
                      </div>

                      {/* Conversation Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-medium truncate text-sm" style={{
                            color: isActive ? 'var(--ig-text-primary)' : 'var(--ig-text-secondary)'
                          }}>
                            {conversation.title || 'New Conversation'}
                          </p>
                          {isActive && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ml-2" style={{
                              background: 'var(--ig-accent-gradient)',
                              color: 'var(--ig-dark-primary)',
                              boxShadow: 'var(--ig-shadow-sm)'
                            }}>
                              Active
                            </span>
                          )}
                        </div>

                        {/* Last message preview - only show for active conversation since basic conversations don't have messages loaded */}
                        {isActive && activeConversation?.messages && activeConversation.messages.length > 0 && (
                          <p className="text-xs mt-1 truncate" style={{
                            color: 'var(--ig-text-muted)'
                          }}>
                            {activeConversation.messages[activeConversation.messages.length - 1].content?.substring(0, 50)}
                            {(activeConversation.messages[activeConversation.messages.length - 1].content?.length || 0) > 50 ? '...' : ''}
                          </p>
                        )}

                        <div className="flex items-center justify-between mt-2">
                          <p className="text-xs" style={{ color: 'var(--ig-text-muted)' }}>
                            {conversation.created_at && new Date(conversation.created_at).toLocaleDateString([], {
                              month: 'short',
                              day: 'numeric'
                            })}
                          </p>

                          {/* Message count - only show for active conversation */}
                          {isActive && activeConversation?.messages && activeConversation.messages.length > 0 && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs" style={{
                              background: 'rgba(255, 255, 255, 0.1)',
                              color: 'var(--ig-text-muted)'
                            }}>
                              {activeConversation.messages.length}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* New Conversation Button */}
        <div className="p-4 flex-shrink-0" style={{ borderTop: '1px solid var(--ig-border-primary)' }}>
          <button
            onClick={() => {
              // Clear active conversation to start fresh
              // New conversation will be created automatically when user sends first message
              setActiveConversation(null);
            }}
            className="w-full py-3 px-4 rounded-xl transition-all duration-300 font-medium flex items-center justify-center space-x-2 group"
            style={{
              background: 'var(--ig-accent-gradient)',
              color: 'var(--ig-dark-primary)',
              boxShadow: 'var(--ig-shadow-md)'
            }}
            onMouseEnter={(e) => {
              const target = e.target as HTMLButtonElement;
              target.style.background = 'var(--ig-accent-gradient-hover)';
              target.style.transform = 'translateY(-1px)';
              target.style.boxShadow = 'var(--ig-shadow-lg), var(--ig-shadow-glow)';
            }}
            onMouseLeave={(e) => {
              const target = e.target as HTMLButtonElement;
              target.style.background = 'var(--ig-accent-gradient)';
              target.style.transform = 'translateY(0)';
              target.style.boxShadow = 'var(--ig-shadow-md)';
            }}
          >
            <svg className="w-4 h-4 transition-transform duration-300 group-hover:rotate-180" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
            </svg>
            <span>New Conversation</span>
          </button>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full">
        {/* Chat Header */}
        <div className="p-6 flex-shrink-0 glass-surface" style={{
          borderBottom: '1px solid var(--ig-border-primary)',
          boxShadow: 'var(--ig-shadow-sm)'
        }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Ignacio Status Indicator */}
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-12 h-12 rounded-xl glass-surface-light flex items-center justify-center" style={{
                    boxShadow: 'var(--ig-shadow-md), var(--ig-shadow-glow-accent)'
                  }}>
                    <span className="text-lg font-bold" style={{ color: 'var(--ig-text-accent)' }}>I</span>
                  </div>
                  {/* Online status */}
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2" style={{
                    background: '#10b981',
                    borderColor: 'var(--ig-surface-primary)'
                  }}></div>
                </div>

                <div>
                  <h1 className="text-xl font-semibold" style={{ color: 'var(--ig-text-primary)' }}>Chat with Ignacio</h1>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#10b981' }}></div>
                    <p className="text-sm" style={{ color: 'var(--ig-text-muted)' }}>
                      {activeConversation ? (activeConversation.title || 'Active Conversation') : 'Ready to help'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => navigate('/projects')}
              className="px-4 py-2 rounded-xl border transition-all duration-300 flex items-center space-x-2 group"
              style={{
                color: 'var(--ig-text-accent)',
                borderColor: 'var(--ig-border-accent)',
                background: 'transparent'
              }}
              onMouseEnter={(e) => {
                const target = e.target as HTMLButtonElement;
                target.style.background = 'var(--ig-surface-glass-light)';
                target.style.borderColor = 'var(--ig-accent-yellow)';
                target.style.transform = 'translateY(-1px)';
                target.style.boxShadow = 'var(--ig-shadow-sm)';
              }}
              onMouseLeave={(e) => {
                const target = e.target as HTMLButtonElement;
                target.style.background = 'transparent';
                target.style.borderColor = 'var(--ig-border-accent)';
                target.style.transform = 'translateY(0)';
                target.style.boxShadow = 'none';
              }}
            >
              <svg className="w-4 h-4 transition-transform duration-300 group-hover:rotate-12" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
              <span>Manage Projects</span>
            </button>
          </div>
        </div>

        {/* Messages Area */}
        <div
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto p-6 space-y-6 min-h-0"
        >
          {!activeConversation ? (
            <div className="text-center mt-8" style={{
              color: 'var(--ig-text-muted)',
              animation: 'fadeInUp 0.3s var(--ig-spring)'
            }}>
              <div className="inline-flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-current animate-pulse"></div>
                <p>Starting new conversation...</p>
              </div>
            </div>
          ) : activeConversation.messages.length === 0 ? (
            <div className="text-center mt-8" style={{
              color: 'var(--ig-text-muted)',
              animation: 'fadeInScale 0.4s var(--ig-spring)'
            }}>
              <div
                className="glass-surface rounded-2xl p-8 max-w-2xl mx-auto"
                style={{
                  boxShadow: 'var(--ig-shadow-lg)'
                }}
              >
                {/* Ignacio Avatar */}
                <div className="w-16 h-16 mx-auto mb-6 rounded-full glass-surface-light flex items-center justify-center" style={{
                  boxShadow: 'var(--ig-shadow-md), var(--ig-shadow-glow-accent)'
                }}>
                  <span className="text-2xl font-bold" style={{ color: 'var(--ig-text-accent)' }}>I</span>
                </div>

                <h3 className="text-xl font-semibold mb-4" style={{ color: 'var(--ig-text-primary)' }}>
                  Welcome to your chat with Ignacio!
                </h3>
                <p className="mb-4" style={{ color: 'var(--ig-text-secondary)' }}>
                  I'm here to help you develop your project: <strong style={{ color: 'var(--ig-text-accent)' }}>{activeProject?.project_name}</strong>
                </p>
                <p className="mb-6" style={{ color: 'var(--ig-text-secondary)' }}>
                  Ask me anything about marketing, technical implementation, business strategy,
                  or any other aspect of your project. I can also help you with:
                </p>
                <ul className="text-left space-y-3 mb-6" style={{ color: 'var(--ig-text-secondary)' }}>
                  <li className="flex items-center space-x-3">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--ig-accent-gradient)' }}></span>
                    <span>Market research and validation</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--ig-accent-gradient)' }}></span>
                    <span>Technical architecture and implementation</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--ig-accent-gradient)' }}></span>
                    <span>Business model development</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--ig-accent-gradient)' }}></span>
                    <span>Financial planning and analysis</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--ig-accent-gradient)' }}></span>
                    <span>Project management and roadmapping</span>
                  </li>
                </ul>
                <p className="text-sm" style={{ color: 'var(--ig-text-muted)' }}>
                  Type your message below to get started!
                </p>
              </div>
            </div>
          ) : (
            <>
              {activeConversation.messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.is_from_user ? 'justify-end' : 'justify-start'} group`}
                  style={{ animation: 'fadeInUp 0.3s var(--ig-spring)' }}
                >
                  <div className={`flex ${message.is_from_user ? 'flex-row-reverse' : 'flex-row'} items-end space-x-3 max-w-4xl`}>
                    {/* Avatar */}
                    <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center transition-all duration-200 ${message.is_from_user ? 'ml-3' : 'mr-3'}`} style={{
                      background: message.is_from_user ? 'var(--ig-accent-gradient)' : 'var(--ig-surface-glass-light)',
                      border: `1px solid ${message.is_from_user ? 'transparent' : 'var(--ig-border-glass-bright)'}`,
                      backdropFilter: 'var(--ig-blur-sm)',
                      boxShadow: 'var(--ig-shadow-sm)'
                    }}>
                      <span className="font-semibold text-sm" style={{
                        color: message.is_from_user ? 'var(--ig-dark-primary)' : 'var(--ig-text-accent)'
                      }}>
                        {message.is_from_user ? 'U' : 'I'}
                      </span>
                    </div>

                    {/* Message Bubble */}
                    <div
                      className="relative transition-all duration-200 group-hover:translate-y-[-1px]"
                      style={{
                        maxWidth: 'calc(100% - 4rem)',
                        ...(message.is_from_user
                          ? {
                              background: 'var(--ig-accent-gradient)',
                              color: 'var(--ig-dark-primary)',
                              borderRadius: '1.5rem 1.5rem 0.5rem 1.5rem',
                              boxShadow: 'var(--ig-shadow-md)',
                              border: '1px solid rgba(255, 255, 255, 0.1)'
                            }
                          : {
                              background: 'var(--ig-surface-glass-dark)',
                              border: '1px solid var(--ig-border-glass-bright)',
                              color: 'var(--ig-text-primary)',
                              backdropFilter: 'var(--ig-blur-lg)',
                              borderRadius: '1.5rem 1.5rem 1.5rem 0.5rem',
                              boxShadow: 'var(--ig-shadow-md)'
                            }
                        )
                      }}
                    >
                      <div className="px-5 py-4">
                        <p className="whitespace-pre-wrap leading-relaxed text-sm">{message.content}</p>

                        {/* Message metadata */}
                        <div className={`flex items-center mt-2 space-x-2 ${message.is_from_user ? 'justify-end' : 'justify-start'}`}>
                          <p
                            className="text-xs opacity-70"
                            style={{
                              color: message.is_from_user
                                ? 'rgba(21, 25, 45, 0.8)'
                                : 'var(--ig-text-muted)'
                            }}
                          >
                            {message.created_at && new Date(message.created_at).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>

                          {/* Message status for user messages */}
                          {message.is_from_user && (
                            <div className="flex items-center space-x-1">
                              <div className="w-3 h-3 rounded-full opacity-70" style={{
                                background: 'rgba(21, 25, 45, 0.6)'
                              }}>
                                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                                </svg>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Typing Indicator */}
              {isSending && (
                <div className="flex justify-start group" style={{ animation: 'fadeInUp 0.3s var(--ig-spring)' }}>
                  <div className="flex items-end space-x-3 max-w-4xl">
                    {/* Ignacio Avatar */}
                    <div className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center mr-3" style={{
                      background: 'var(--ig-surface-glass-light)',
                      border: '1px solid var(--ig-border-glass-bright)',
                      backdropFilter: 'var(--ig-blur-sm)',
                      boxShadow: 'var(--ig-shadow-sm)'
                    }}>
                      <span className="font-semibold text-sm" style={{ color: 'var(--ig-text-accent)' }}>I</span>
                    </div>

                    {/* Typing bubble */}
                    <div className="glass-surface px-5 py-4" style={{
                      borderRadius: '1.5rem 1.5rem 1.5rem 0.5rem',
                      boxShadow: 'var(--ig-shadow-md)',
                      background: 'var(--ig-surface-glass-dark)',
                      border: '1px solid var(--ig-border-glass-bright)',
                      backdropFilter: 'var(--ig-blur-lg)'
                    }}>
                      <div className="flex items-center space-x-1">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 rounded-full" style={{
                            background: 'var(--ig-text-muted)',
                            animation: 'typingDots 1.4s infinite ease-in-out'
                          }}></div>
                          <div className="w-2 h-2 rounded-full" style={{
                            background: 'var(--ig-text-muted)',
                            animation: 'typingDots 1.4s infinite ease-in-out 0.2s'
                          }}></div>
                          <div className="w-2 h-2 rounded-full" style={{
                            background: 'var(--ig-text-muted)',
                            animation: 'typingDots 1.4s infinite ease-in-out 0.4s'
                          }}></div>
                        </div>
                        <span className="text-xs ml-2" style={{ color: 'var(--ig-text-muted)' }}>Ignacio is typing...</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Invisible element to scroll to */}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="p-6 flex-shrink-0 glass-surface" style={{
          borderTop: '1px solid var(--ig-border-primary)',
          boxShadow: '0 -4px 20px rgba(21, 25, 45, 0.2)'
        }}>
          <div className="flex space-x-4 items-end">
            {/* File Upload Button */}
            <button
              className="p-3 rounded-xl transition-all duration-300 flex-shrink-0 group"
              style={{
                background: 'var(--ig-surface-glass-light)',
                border: '1px solid var(--ig-border-glass)',
                color: 'var(--ig-text-muted)'
              }}
              onMouseEnter={(e) => {
                const target = e.target as HTMLButtonElement;
                target.style.background = 'var(--ig-surface-glass-dark)';
                target.style.borderColor = 'var(--ig-border-accent)';
                target.style.color = 'var(--ig-text-accent)';
                target.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                const target = e.target as HTMLButtonElement;
                target.style.background = 'var(--ig-surface-glass-light)';
                target.style.borderColor = 'var(--ig-border-glass)';
                target.style.color = 'var(--ig-text-muted)';
                target.style.transform = 'translateY(0)';
              }}
            >
              <svg className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" fill="currentColor" viewBox="0 0 24 24">
                <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
              </svg>
            </button>

            {/* Message Input Field */}
            <div className="flex-1 relative">
              <textarea
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Type your message to Ignacio..."
                className="w-full p-4 rounded-xl resize-none transition-all duration-300 pr-12"
                style={{
                  background: 'var(--ig-surface-glass-dark)',
                  border: '1px solid var(--ig-border-glass)',
                  color: 'var(--ig-text-primary)',
                  backdropFilter: 'var(--ig-blur-lg)',
                  boxShadow: 'var(--ig-shadow-sm)',
                  fontSize: '14px',
                  lineHeight: '1.5'
                }}
                rows={messageInput.split('\n').length > 1 ? Math.min(messageInput.split('\n').length, 4) : 1}
                disabled={isSending}
                onFocus={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.borderColor = 'var(--ig-border-accent)';
                  target.style.boxShadow = 'var(--ig-shadow-md), var(--ig-shadow-glow)';
                }}
                onBlur={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.borderColor = 'var(--ig-border-glass)';
                  target.style.boxShadow = 'var(--ig-shadow-sm)';
                }}
              />

              {/* Character count indicator */}
              {messageInput.length > 0 && (
                <div className="absolute bottom-2 right-12 text-xs" style={{
                  color: messageInput.length > 1000 ? '#ef4444' : 'var(--ig-text-muted)'
                }}>
                  {messageInput.length}/2000
                </div>
              )}
            </div>

            {/* Send Button */}
            <button
              onClick={handleSendMessage}
              disabled={!messageInput.trim() || isSending}
              className="p-3 rounded-xl font-medium transition-all duration-300 flex items-center space-x-2 flex-shrink-0 group"
              style={{
                background: !messageInput.trim() || isSending
                  ? 'var(--ig-surface-glass-light)'
                  : 'var(--ig-accent-gradient)',
                color: !messageInput.trim() || isSending
                  ? 'var(--ig-text-muted)'
                  : 'var(--ig-dark-primary)',
                cursor: !messageInput.trim() || isSending ? 'not-allowed' : 'pointer',
                border: '1px solid transparent',
                boxShadow: !messageInput.trim() || isSending ? 'none' : 'var(--ig-shadow-md)',
                minWidth: '100px'
              }}
              onMouseEnter={(e) => {
                if (messageInput.trim() && !isSending) {
                  const target = e.target as HTMLButtonElement;
                  target.style.background = 'var(--ig-accent-gradient-hover)';
                  target.style.transform = 'translateY(-1px)';
                  target.style.boxShadow = 'var(--ig-shadow-lg), var(--ig-shadow-glow)';
                }
              }}
              onMouseLeave={(e) => {
                if (messageInput.trim() && !isSending) {
                  const target = e.target as HTMLButtonElement;
                  target.style.background = 'var(--ig-accent-gradient)';
                  target.style.transform = 'translateY(0)';
                  target.style.boxShadow = 'var(--ig-shadow-md)';
                }
              }}
            >
              {isSending ? (
                <>
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                  <span>Sending</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M2,21L23,12L2,3V10L17,12L2,14V21Z"/>
                  </svg>
                  <span>Send</span>
                </>
              )}
            </button>
          </div>

          {/* Helpful hints */}
          <div className="flex items-center justify-between mt-3">
            <p className="text-xs" style={{ color: 'var(--ig-text-muted)' }}>
              Press <kbd className="px-1.5 py-0.5 rounded text-xs font-mono" style={{
                background: 'var(--ig-surface-glass-light)',
                border: '1px solid var(--ig-border-glass)'
              }}>Enter</kbd> to send, <kbd className="px-1.5 py-0.5 rounded text-xs font-mono" style={{
                background: 'var(--ig-surface-glass-light)',
                border: '1px solid var(--ig-border-glass)'
              }}>Shift+Enter</kbd> for new line
            </p>

            {/* AI Status */}
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#10b981' }}></div>
              <span className="text-xs" style={{ color: 'var(--ig-text-muted)' }}>
                Ignacio is ready
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}