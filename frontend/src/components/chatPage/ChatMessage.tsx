import type { OptimisticMessage } from '@/types';
import { OptimisticMessageStatus } from '@/types';
import ignacioAvatar from '../../assets/ignacio_avatar.png';
import MarkdownRenderer from '../ui/MarkdownRenderer';

interface ChatMessageProps {
  message: OptimisticMessage;
  onRetry: (message: OptimisticMessage) => void;
  onDelete: (message: OptimisticMessage) => void;
}

export default function ChatMessage({
  message,
  onRetry,
  onDelete,
}: ChatMessageProps) {
  return (
    <div
      className={`flex ${message.is_from_user ? 'justify-end' : 'justify-start'} group`}
      style={{ animation: 'fadeInUp 0.3s var(--ig-spring)' }}
    >
      <div
        className={`flex ${message.is_from_user ? 'flex-row-reverse' : 'flex-row'} items-end space-x-3 max-w-4xl`}
      >
        {/* Avatar */}
        <div
          className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center transition-all duration-200 ${message.is_from_user ? 'ml-3' : 'mr-3'} ${!message.is_from_user ? 'overflow-hidden' : ''}`}
          style={{
            background: message.is_from_user
              ? 'rgba(219, 105, 52, 0.6)'
              : 'var(--ig-surface-glass-light)',
            border: `1px solid ${message.is_from_user ? 'transparent' : 'var(--ig-border-glass-bright)'}`,
            backdropFilter: 'var(--ig-blur-sm)',
            boxShadow: 'var(--ig-shadow-sm)',
          }}
        >
          {message.is_from_user ? (
            <span
              className="font-semibold text-sm"
              style={{ color: '#ffffff' }}
            >
              U
            </span>
          ) : (
            <img
              src={ignacioAvatar}
              alt="Ignacio"
              className="w-full h-full object-cover"
            />
          )}
        </div>

        {/* Message Bubble */}
        <div
          className="relative transition-all duration-200 group-hover:translate-y-[-1px]"
          style={{
            maxWidth: 'calc(100% - 4rem)',
            ...(message.is_from_user
              ? {
                  background: 'rgba(219, 105, 52, 0.6)',
                  color: '#ffffff',
                  borderRadius: '1.5rem 1.5rem 0.5rem 1.5rem',
                  boxShadow: 'var(--ig-shadow-md)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }
              : {
                  background: 'var(--ig-surface-glass-dark)',
                  border: '1px solid var(--ig-border-glass-bright)',
                  color: 'var(--ig-text-primary)',
                  backdropFilter: 'var(--ig-blur-lg)',
                  borderRadius: '1.5rem 1.5rem 1.5rem 0.5rem',
                  boxShadow: 'var(--ig-shadow-md)',
                }),
          }}
        >
          <div className="px-5 py-4">
            <div className="text-sm">
              <MarkdownRenderer isUserMessage={message.is_from_user}>
                {message.content}
              </MarkdownRenderer>
            </div>

            {/* Error message and retry/delete buttons for failed messages */}
            {'status' in message &&
              message.status === OptimisticMessageStatus.FAILED && (
                <div
                  className="mt-3 p-3 rounded-lg"
                  style={{
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                  }}
                >
                  <div className="flex items-center space-x-2 mb-2">
                    <svg
                      className="w-4 h-4"
                      style={{ color: '#ef4444' }}
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                    </svg>
                    <p
                      className="text-sm font-medium"
                      style={{ color: '#ef4444' }}
                    >
                      Failed to send
                    </p>
                  </div>
                  {message.error && (
                    <p className="text-xs mb-3" style={{ color: '#dc2626' }}>
                      {message.error}
                    </p>
                  )}
                  <div className="flex space-x-2">
                    <button
                      onClick={() => onRetry(message)}
                      className="px-3 py-1 rounded-md text-xs font-medium transition-all duration-200"
                      style={{
                        background: '#ef4444',
                        color: 'white',
                        border: 'none',
                      }}
                      onMouseEnter={e => {
                        const target = e.target as HTMLButtonElement;
                        target.style.background = '#dc2626';
                      }}
                      onMouseLeave={e => {
                        const target = e.target as HTMLButtonElement;
                        target.style.background = '#ef4444';
                      }}
                    >
                      Retry
                    </button>
                    <button
                      onClick={() => onDelete(message)}
                      className="px-3 py-1 rounded-md text-xs font-medium transition-all duration-200"
                      style={{
                        background: 'transparent',
                        color: '#6b7280',
                        border: '1px solid #6b7280',
                      }}
                      onMouseEnter={e => {
                        const target = e.target as HTMLButtonElement;
                        target.style.background = '#f3f4f6';
                      }}
                      onMouseLeave={e => {
                        const target = e.target as HTMLButtonElement;
                        target.style.background = 'transparent';
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}

            {/* Message metadata */}
            <div
              className={`flex items-center mt-2 space-x-2 ${message.is_from_user ? 'justify-end' : 'justify-start'}`}
            >
              <p
                className="text-xs opacity-70"
                style={{
                  color: message.is_from_user
                    ? 'rgba(255, 255, 255, 0.8)'
                    : 'var(--ig-text-muted)',
                }}
              >
                {message.created_at &&
                  new Date(message.created_at).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
              </p>

              {/* Message status for user messages */}
              {message.is_from_user && (
                <div className="flex items-center space-x-1">
                  {'status' in message ? (
                    // Optimistic message with status
                    message.status === OptimisticMessageStatus.PENDING ? (
                      <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin opacity-70"></div>
                    ) : message.status === OptimisticMessageStatus.FAILED ? (
                      <div className="flex items-center space-x-1">
                        <div
                          className="w-3 h-3 rounded-full opacity-70"
                          style={{ background: '#ef4444' }}
                        >
                          <svg
                            className="w-3 h-3"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                          >
                            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                          </svg>
                        </div>
                      </div>
                    ) : (
                      <div
                        className="w-3 h-3 rounded-full opacity-70"
                        style={{ background: 'rgba(255, 255, 255, 0.8)' }}
                      >
                        <svg
                          className="w-3 h-3"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                        </svg>
                      </div>
                    )
                  ) : (
                    // Regular message - assume sent
                    <div
                      className="w-3 h-3 rounded-full opacity-70"
                      style={{ background: 'rgba(255, 255, 255, 0.8)' }}
                    >
                      <svg
                        className="w-3 h-3"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                      </svg>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
