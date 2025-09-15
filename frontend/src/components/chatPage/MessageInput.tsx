import React, { useState } from 'react';
import PromptTemplateSelector from './PromptTemplateSelector';
import type { PromptTemplate } from '@/types';

interface MessageInputProps {
  messageInput: string;
  setMessageInput: (value: string) => void;
  isSending: boolean;
  onSendMessage: () => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
}

export default function MessageInput({
  messageInput,
  setMessageInput,
  isSending,
  onSendMessage,
  onKeyPress
}: MessageInputProps) {
  const [isTemplateSelectorOpen, setIsTemplateSelectorOpen] = useState(false);

  const handleTemplateSelect = (template: PromptTemplate) => {
    setMessageInput(template.content);
  };

  return (
    <>
      <PromptTemplateSelector
        isOpen={isTemplateSelectorOpen}
        onClose={() => setIsTemplateSelectorOpen(false)}
        onTemplateSelect={handleTemplateSelect}
      />
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
            <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
          </svg>
        </button>

        {/* Prompt Template Button */}
        <button
          onClick={() => setIsTemplateSelectorOpen(true)}
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
            <path d="M9,10V12H7V10H9M13,10V12H11V10H13M17,10V12H15V10H17M19,3A2,2 0 0,1 21,5V19A2,2 0 0,1 19,21H5A2,2 0 0,1 3,19V5A2,2 0 0,1 5,3H19M19,19V7H5V19H19M19,5H5V7H19V5Z" />
          </svg>
        </button>

        {/* Message Input Field */}
        <div className="flex-1 relative">
          <textarea
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            onKeyDown={onKeyPress}
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
          onClick={onSendMessage}
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
                <path d="M2,21L23,12L2,3V10L17,12L2,14V21Z" />
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
    </>
  );
}