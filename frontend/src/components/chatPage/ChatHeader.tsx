import type { ConversationDetailResponse } from '@/types';
import { useAuth0 } from '@auth0/auth0-react';
import { useNavigate } from 'react-router-dom';
import ignacioAvatar from '../../assets/ignacio_avatar.png';

interface ChatHeaderProps {
  activeConversation: ConversationDetailResponse | null;
  onToggleSidebar?: () => void;
  showSidebarToggle?: boolean;
}

export default function ChatHeader({
  activeConversation,
  onToggleSidebar,
  showSidebarToggle = false
}: ChatHeaderProps) {
  const { user, isAuthenticated } = useAuth0();
  const navigate = useNavigate();
  return (
    <div className="px-4 py-3 md:p-6 flex-shrink-0 glass-surface" style={{
      borderBottom: '1px solid var(--ig-border-primary)',
      boxShadow: 'var(--ig-shadow-sm)'
    }}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 md:space-x-4 flex-1 min-w-0">
          {/* Mobile Hamburger Menu */}
          {showSidebarToggle && (
            <button
              onClick={onToggleSidebar}
              className="md:hidden w-8 h-8 flex items-center justify-center rounded-lg transition-all duration-200"
              style={{
                color: 'var(--ig-text-primary)',
                background: 'var(--ig-surface-secondary)',
                border: '1px solid var(--ig-border-primary)'
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLButtonElement).style.background = 'var(--ig-surface-glass)';
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLButtonElement).style.background = 'var(--ig-surface-secondary)';
              }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          )}

          {/* Ignacio Avatar and Info */}
          <div className="flex items-center space-x-2 md:space-x-3 flex-1 min-w-0">
            <div className="relative flex-shrink-0">
              <div className="w-9 h-9 md:w-12 md:h-12 rounded-xl glass-surface-light flex items-center justify-center overflow-hidden" style={{
                boxShadow: 'var(--ig-shadow-md), var(--ig-shadow-glow-accent)'
              }}>
                <img src={ignacioAvatar} alt="Ignacio" className="w-full h-full object-cover" />
              </div>
              {/* Online status */}
              <div className="absolute -bottom-0.5 -right-0.5 md:-bottom-1 md:-right-1 w-3 h-3 md:w-4 md:h-4 rounded-full border-2" style={{
                background: '#10b981',
                borderColor: 'var(--ig-surface-primary)'
              }}></div>
            </div>

            <div className="flex-1 min-w-0">
              <h1 className="text-base md:text-xl font-semibold truncate" style={{ color: 'var(--ig-text-primary)' }}>
                {activeConversation?.title || 'Chat with Ignacio'}
              </h1>
              <div className="flex items-center space-x-1 md:space-x-2">
                <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full animate-pulse" style={{ background: '#10b981' }}></div>
                <p className="text-xs md:text-sm truncate" style={{ color: 'var(--ig-text-muted)' }}>
                  {activeConversation ? 'Active conversation' : 'Ready to help'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center space-x-2">
          {/* Projects Button - Desktop only */}
          <button
            onClick={() => navigate('/projects')}
            className="hidden md:flex px-3 py-1.5 items-center justify-center rounded-lg transition-all duration-200 text-sm"
            style={{
              color: 'var(--ig-text-secondary)',
              background: 'var(--ig-surface-secondary)',
              border: '1px solid var(--ig-border-primary)'
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLButtonElement).style.background = 'var(--ig-surface-glass)';
              (e.target as HTMLButtonElement).style.borderColor = 'var(--ig-border-accent)';
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLButtonElement).style.background = 'var(--ig-surface-secondary)';
              (e.target as HTMLButtonElement).style.borderColor = 'var(--ig-border-primary)';
            }}
          >
            Projects
          </button>

          {/* User Avatar */}
          {isAuthenticated && user && (
            <button
              onClick={() => navigate('/user')}
              className="w-8 h-8 md:w-10 md:h-10 rounded-lg flex items-center justify-center overflow-hidden transition-all duration-200 flex-shrink-0"
              style={{
                background: 'var(--ig-surface-secondary)',
                border: '1px solid var(--ig-border-primary)'
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLButtonElement).style.background = 'var(--ig-surface-glass)';
                (e.target as HTMLButtonElement).style.borderColor = 'var(--ig-border-accent)';
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLButtonElement).style.background = 'var(--ig-surface-secondary)';
                (e.target as HTMLButtonElement).style.borderColor = 'var(--ig-border-primary)';
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none" className="w-full h-full">
                <rect fill="#f1f4dc" width="100" height="100" x="0" y="0" />
                <g transform="translate(5, -4) rotate(-19 50 70)">
                  <path d="M95 53.33C95 29.4 74.85 10 50 10S5 29.4 5 53.33V140h90V53.33Z" fill="#f88c49"/>
                  <g transform="translate(29 33)">
                    <g transform="translate(6, 9) rotate(3 21 21)">
                      <g transform="translate(0 2)">
                        <path d="M8 8.36S8 4 12 4s4 4.36 4 4.36v2.91s0 .73-.67.73c-.66 0-.66-2.9-3.33-2.9S9.33 12 8.67 12C8 12 8 11.27 8 11.27v-2.9ZM26 8.36S26 4 30 4s4 4.36 4 4.36v2.91s0 .73-.67.73c-.66 0-.66-2.9-3.33-2.9S27.33 12 26.67 12c-.67 0-.67-.73-.67-.73v-2.9Z" fill="#ffffff"/>
                      </g>
                      <g transform="translate(6 26)">
                        <path d="M15.5 10c-5.07 0-9.3-5.23-8.37-5.88.93-.65 3.45 2.15 8.37 2.15 4.92 0 7.44-2.88 8.37-2.15.93.73-3.3 5.88-8.37 5.88Z" fill="#ffffff"/>
                      </g>
                    </g>
                  </g>
                </g>
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}