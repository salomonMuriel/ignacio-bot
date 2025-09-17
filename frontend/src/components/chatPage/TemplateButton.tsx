import React from 'react';

interface TemplateButtonProps {
  messageInput: string;
  onSaveTemplate: () => void;
  onLoadTemplate: () => void;
  buttonRef: React.RefObject<HTMLButtonElement>;
}

export default function TemplateButton({
  messageInput,
  onSaveTemplate,
  onLoadTemplate,
  buttonRef
}: TemplateButtonProps) {
  const handleClick = () => {
    if (messageInput.trim()) {
      onSaveTemplate();
    } else {
      onLoadTemplate();
    }
    // Reset hover styles when modal opens
    if (buttonRef.current) {
      buttonRef.current.style.background = 'var(--ig-surface-glass-light)';
      buttonRef.current.style.borderColor = 'var(--ig-border-glass)';
      buttonRef.current.style.color = 'var(--ig-text-muted)';
      buttonRef.current.style.transform = 'translateY(0)';
    }
  };

  return (
    <button
      ref={buttonRef}
      onClick={handleClick}
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
      <div className="relative w-5 h-5">
        {/* Floppy disk icon for save */}
        <svg
          className={`absolute inset-0 w-5 h-5 transition-all duration-300 group-hover:scale-110 ${
            messageInput.trim() ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
          }`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
          <polyline points="17,21 17,13 7,13 7,21" />
          <polyline points="7,3 7,8 15,8" />
        </svg>

        {/* Speech bubble with 3 dots icon for load templates */}
        <svg
          className={`absolute inset-0 w-5 h-5 transition-all duration-300 group-hover:scale-110 ${
            !messageInput.trim() ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
          }`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
          <circle cx="9" cy="12" r="1" fill="currentColor" />
          <circle cx="15" cy="12" r="1" fill="currentColor" />
          <circle cx="12" cy="12" r="1" fill="currentColor" />
        </svg>
      </div>
    </button>
  );
}