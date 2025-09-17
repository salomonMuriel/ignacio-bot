import React from 'react';

export default function InputHints() {
  return (
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
  );
}