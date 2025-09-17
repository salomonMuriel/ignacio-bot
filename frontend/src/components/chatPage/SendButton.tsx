import React from 'react';
import type { UserFileWithConversations } from '@/types';

interface SendButtonProps {
  messageInput: string;
  selectedFile: File | UserFileWithConversations | null;
  isSending: boolean;
  onSendMessage: () => void;
}

export default function SendButton({
  messageInput,
  selectedFile,
  isSending,
  onSendMessage
}: SendButtonProps) {
  const isDisabled = (!messageInput.trim() && !selectedFile) || isSending;

  return (
    <button
      onClick={onSendMessage}
      disabled={isDisabled}
      className="p-3 rounded-xl transition-all duration-300 flex-shrink-0 group"
      style={{
        background: isDisabled
          ? 'var(--ig-surface-glass-light)'
          : 'var(--ig-accent-gradient)',
        color: isDisabled
          ? 'var(--ig-text-muted)'
          : 'var(--ig-dark-primary)',
        cursor: isDisabled ? 'not-allowed' : 'pointer',
        border: '1px solid transparent',
        boxShadow: isDisabled ? 'none' : 'var(--ig-shadow-md)'
      }}
      onMouseEnter={(e) => {
        if (!isDisabled) {
          const target = e.target as HTMLButtonElement;
          target.style.background = 'var(--ig-accent-gradient-hover)';
          target.style.transform = 'translateY(-1px)';
          target.style.boxShadow = 'var(--ig-shadow-lg), var(--ig-shadow-glow)';
        }
      }}
      onMouseLeave={(e) => {
        if (!isDisabled) {
          const target = e.target as HTMLButtonElement;
          target.style.background = 'var(--ig-accent-gradient)';
          target.style.transform = 'translateY(0)';
          target.style.boxShadow = 'var(--ig-shadow-md)';
        }
      }}
    >
      {isSending ? (
        <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
      ) : (
        <svg className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-0.5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M2,21L23,12L2,3V10L17,12L2,14V21Z" />
        </svg>
      )}
    </button>
  );
}