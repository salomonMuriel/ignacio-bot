import { forwardRef } from 'react';
import type {
  OptimisticMessage,
  ConversationDetailResponse,
  Project,
} from '@/types';
import ChatMessage from './ChatMessage';
import WelcomeMessage from './WelcomeMessage';
import ignacioAvatar from '../../assets/ignacio_avatar.png';

interface MessageListProps {
  optimisticMessages: OptimisticMessage[];
  activeConversation: ConversationDetailResponse | null;
  activeProject: Project | null;
  isSending: boolean;
  onRetryMessage: (message: OptimisticMessage) => void;
  onDeleteMessage: (message: OptimisticMessage) => void;
}

const MessageList = forwardRef<HTMLDivElement, MessageListProps>(
  (
    {
      optimisticMessages,
      activeConversation,
      activeProject,
      isSending,
      onRetryMessage,
      onDeleteMessage,
    },
    ref
  ) => {
    return (
      <div className="flex-1 overflow-y-auto p-6 space-y-6 min-h-0">
        {!activeConversation && optimisticMessages.length === 0 ? (
          <WelcomeMessage activeProject={activeProject} />
        ) : (
          <>
            {optimisticMessages.map(message => (
              <ChatMessage
                key={message.id}
                message={message}
                onRetry={onRetryMessage}
                onDelete={onDeleteMessage}
              />
            ))}

            {/* Typing Indicator */}
            {isSending && (
              <div
                className="flex justify-start group"
                style={{ animation: 'fadeInUp 0.3s var(--ig-spring)' }}
              >
                <div className="flex items-end space-x-3 max-w-4xl">
                  {/* Ignacio Avatar */}
                  <div
                    className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center mr-3 overflow-hidden"
                    style={{
                      background: 'var(--ig-surface-glass-light)',
                      border: '1px solid var(--ig-border-glass-bright)',
                      backdropFilter: 'var(--ig-blur-sm)',
                      boxShadow: 'var(--ig-shadow-sm)',
                    }}
                  >
                    <img
                      src={ignacioAvatar}
                      alt="Ignacio"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Typing bubble */}
                  <div
                    className="glass-surface px-5 py-4"
                    style={{
                      borderRadius: '1.5rem 1.5rem 1.5rem 0.5rem',
                      boxShadow: 'var(--ig-shadow-md)',
                      background: 'var(--ig-surface-glass-dark)',
                      border: '1px solid var(--ig-border-glass-bright)',
                      backdropFilter: 'var(--ig-blur-lg)',
                    }}
                  >
                    <div className="flex items-center space-x-1">
                      <div className="flex space-x-1">
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{
                            background: 'var(--ig-text-muted)',
                            animation: 'typingDots 1.4s infinite ease-in-out',
                          }}
                        ></div>
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{
                            background: 'var(--ig-text-muted)',
                            animation:
                              'typingDots 1.4s infinite ease-in-out 0.2s',
                          }}
                        ></div>
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{
                            background: 'var(--ig-text-muted)',
                            animation:
                              'typingDots 1.4s infinite ease-in-out 0.4s',
                          }}
                        ></div>
                      </div>
                      <span
                        className="text-xs ml-2"
                        style={{ color: 'var(--ig-text-muted)' }}
                      >
                        Ignacio is typing...
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Invisible element to scroll to */}
        <div ref={ref} />
      </div>
    );
  }
);

MessageList.displayName = 'MessageList';

export default MessageList;
