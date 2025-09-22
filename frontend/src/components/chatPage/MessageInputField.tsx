import React, { useEffect } from 'react';

interface MessageInputFieldProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  isSending: boolean;
  textareaRef: React.RefObject<HTMLTextAreaElement>;
}

export default function MessageInputField({
  value,
  onChange,
  onKeyDown,
  isSending,
  textareaRef,
}: MessageInputFieldProps) {
  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      // Reset height to auto to get the correct scrollHeight
      textarea.style.height = 'auto';

      // Calculate the height based on scrollHeight
      const lineHeight = 24; // 1.5rem * 16px
      const minLines = 1;
      const maxLines = 12;
      const padding = 32; // 16px top + 16px bottom

      // scrollHeight includes content + padding, so calculate lines from total height
      const lines = Math.ceil((textarea.scrollHeight - padding) / lineHeight);
      const actualLines = Math.min(Math.max(lines, minLines), maxLines);

      const newHeight = actualLines * lineHeight + padding;
      textarea.style.height = `${newHeight}px`;

      // Add scrolling if content exceeds max lines
      textarea.style.overflowY = lines > maxLines ? 'auto' : 'hidden';
    }
  }, [value]);

  return (
    <textarea
      ref={textareaRef}
      value={value}
      onChange={onChange}
      onKeyDown={onKeyDown}
      placeholder="Type your message to Ignacio..."
      className="w-full p-4 rounded-xl resize-none focus:outline-none"
      style={{
        background: 'var(--ig-surface-glass-dark)',
        border: '1px solid var(--ig-border-glass)',
        color: 'var(--ig-text-primary)',
        backdropFilter: 'var(--ig-blur-lg)',
        boxShadow: 'var(--ig-shadow-sm)',
        fontSize: '14px',
        lineHeight: '1.5',
      }}
      disabled={isSending}
      onFocus={e => {
        const target = e.target as HTMLTextAreaElement;
        target.style.transition =
          'border-color 0.2s ease, box-shadow 0.2s ease';
        target.style.borderColor = 'white';
        target.style.boxShadow = 'var(--ig-shadow-md), var(--ig-shadow-glow)';
      }}
      onBlur={e => {
        const target = e.target as HTMLTextAreaElement;
        target.style.transition =
          'border-color 0.2s ease, box-shadow 0.2s ease';
        target.style.borderColor = 'var(--ig-border-glass)';
        target.style.boxShadow = 'var(--ig-shadow-sm)';
      }}
    />
  );
}
