import React from 'react';

interface FileAttachmentButtonProps {
  onFileModalOpen: () => void;
  isSending: boolean;
  buttonRef: React.RefObject<HTMLButtonElement>;
}

export default function FileAttachmentButton({
  onFileModalOpen,
  isSending,
  buttonRef,
}: FileAttachmentButtonProps) {
  return (
    <button
      ref={buttonRef}
      onClick={() => {
        onFileModalOpen();
        // Reset hover styles when modal opens
        if (buttonRef.current) {
          buttonRef.current.style.background = 'var(--ig-surface-glass-light)';
          buttonRef.current.style.borderColor = 'var(--ig-border-glass)';
          buttonRef.current.style.color = 'var(--ig-text-muted)';
          buttonRef.current.style.transform = 'translateY(0)';
        }
      }}
      disabled={isSending}
      className="p-3 mb-2 rounded-xl transition-all duration-300 flex-shrink-0 group"
      style={{
        background: 'var(--ig-surface-glass-light)',
        border: '1px solid var(--ig-border-glass)',
        color: 'var(--ig-text-muted)',
        cursor: isSending ? 'not-allowed' : 'pointer',
      }}
      onMouseEnter={e => {
        if (!isSending) {
          const target = e.target as HTMLButtonElement;
          target.style.background = 'var(--ig-surface-glass-dark)';
          target.style.borderColor = 'var(--ig-border-accent)';
          target.style.color = 'var(--ig-text-accent)';
          target.style.transform = 'translateY(-1px)';
        }
      }}
      onMouseLeave={e => {
        if (!isSending) {
          const target = e.target as HTMLButtonElement;
          target.style.background = 'var(--ig-surface-glass-light)';
          target.style.borderColor = 'var(--ig-border-glass)';
          target.style.color = 'var(--ig-text-muted)';
          target.style.transform = 'translateY(0)';
        }
      }}
    >
      <svg
        className="w-5 h-5 transition-transform duration-300 group-hover:scale-110"
        fill="currentColor"
        viewBox="0 0 24 24"
      >
        <path d="M16.5,6V17.5A4,4 0 0,1 12.5,21.5A4,4 0 0,1 8.5,17.5V5A2.5,2.5 0 0,1 11,2.5A2.5,2.5 0 0,1 13.5,5V15.5A1,1 0 0,1 12.5,16.5A1,1 0 0,1 11.5,15.5V6H10V15.5A2.5,2.5 0 0,0 12.5,18A2.5,2.5 0 0,0 15,15.5V5A4,4 0 0,0 11,1A4,4 0 0,0 7,5V17.5A5.5,5.5 0 0,0 12.5,23A5.5,5.5 0 0,0 18,17.5V6H16.5Z" />
      </svg>
    </button>
  );
}
