import React from 'react';
import type { UserFileWithConversations } from '@/types';

interface FilePreviewProps {
  selectedFile: File | UserFileWithConversations | null;
  onRemoveFile: () => void;
}

export default function FilePreview({ selectedFile, onRemoveFile }: FilePreviewProps) {
  if (!selectedFile) return null;

  return (
    <div className="mb-3 p-3 rounded-lg border" style={{
      background: 'var(--ig-surface-glass-light)',
      border: '1px solid var(--ig-border-glass)',
    }}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded" style={{
            background: 'var(--ig-surface-glass-dark)',
          }}>
            {(selectedFile instanceof File ? selectedFile.type : selectedFile.file_type).startsWith('image/') ? (
              <svg className="w-4 h-4" style={{ color: 'var(--ig-text-accent)' }} fill="currentColor" viewBox="0 0 24 24">
                <path d="M8.5,13.5L11,16.5L14.5,12L19,18H5M21,19V5C21,3.89 20.1,3 19,3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19Z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" style={{ color: 'var(--ig-text-accent)' }} fill="currentColor" viewBox="0 0 24 24">
                <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
              </svg>
            )}
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium" style={{ color: 'var(--ig-text-primary)' }}>
              {selectedFile instanceof File ? selectedFile.name : selectedFile.file_name}
            </span>
            <span className="text-xs" style={{ color: 'var(--ig-text-muted)' }}>
              {((selectedFile instanceof File ? selectedFile.size : selectedFile.file_size) / 1024 / 1024).toFixed(1)} MB
              {selectedFile instanceof File ? '' : ' • Previous file'}
              {!(selectedFile instanceof File) && 'usage_count' in selectedFile && selectedFile.usage_count && selectedFile.usage_count > 0 && (
                ` • Used ${selectedFile.usage_count} time${selectedFile.usage_count > 1 ? 's' : ''}`
              )}
            </span>
          </div>
        </div>
        <button
          onClick={onRemoveFile}
          className="p-1 rounded-full transition-colors duration-200"
          style={{
            color: 'var(--ig-text-muted)',
          }}
          onMouseEnter={(e) => {
            const target = e.target as HTMLButtonElement;
            target.style.background = 'var(--ig-surface-glass-dark)';
            target.style.color = 'var(--ig-text-primary)';
          }}
          onMouseLeave={(e) => {
            const target = e.target as HTMLButtonElement;
            target.style.background = 'transparent';
            target.style.color = 'var(--ig-text-muted)';
          }}
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
          </svg>
        </button>
      </div>
    </div>
  );
}