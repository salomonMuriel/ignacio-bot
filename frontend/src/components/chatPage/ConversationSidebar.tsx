import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { Conversation, ConversationDetailResponse, Project } from '@/types';

interface ConversationSidebarProps {
  conversations: Conversation[];
  activeConversation: ConversationDetailResponse | null;
  activeProject: Project | null;
  onConversationClick: (conversation: Conversation) => void;
  onNewConversation: () => void;
}

export default function ConversationSidebar({
  conversations,
  activeConversation,
  activeProject,
  onConversationClick,
  onNewConversation
}: ConversationSidebarProps) {
  const navigate = useNavigate();

  return (
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
              <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4l4 4 4-4h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold" style={{ color: 'var(--ig-text-primary)' }}>Conversations</h2>
        </div>

        {activeProject && (
          <div className="glass-surface-light rounded-xl p-4 relative" style={{
            boxShadow: 'var(--ig-shadow-sm)'
          }}>
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-2 h-2 rounded-full" style={{ background: 'var(--ig-accent-gradient)' }}></div>
              <p className="text-xs font-medium" style={{ color: 'var(--ig-text-muted)' }}>ACTIVE PROJECT</p>
            </div>
            <p className="font-medium truncate text-sm" style={{ color: 'var(--ig-text-accent)' }}>{activeProject.project_name}</p>
            <button
              onClick={() => navigate('/projects')}
              className="px-2 py-1 rounded-xl border transition-all cursor-pointer duration-300 flex items-center group absolute top-1 right-1"
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
              <svg className="w-6 h-6 transition-transform duration-300 group-hover:rotate-12" fill="currentColor" viewBox="0 0 24 24">
                <path d="M0 0h24v24H0z" fill="none" /><path d="M6.99 11L3 15l3.99 4v-3H14v-2H6.99v-3zM21 9l-3.99-4v3H10v2h7.01v3L21 9z" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
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
                  <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4l4 4 4-4h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 9h12v2H6V9zm8 5H6v-2h8v2zm4-6H6V6h12v2z" />
                </svg>
              </div>
              <p className="font-medium mb-1">No conversations yet</p>
              <p className="text-sm">Start chatting with Ignacio!</p>
            </div>
          </div>
        ) : (
          <div className="p-3 space-y-2">
            {conversations.map((conversation) => {
              const isActive = activeConversation?.id === conversation.id;
              return (
                <div
                  key={conversation.id}
                  onClick={() => onConversationClick(conversation)}
                  className={`group relative p-2 cursor-pointer transition-all duration-300 rounded-xl ${isActive ? 'ring-1' : ''}`}
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
          onClick={onNewConversation}
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
            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
          </svg>
          <span>New Conversation</span>
        </button>
      </div>
    </div>
  );
}