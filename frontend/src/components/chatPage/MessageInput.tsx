import React, { useState, useRef, useEffect } from 'react';
import PromptTemplateSelector from './PromptTemplateSelector';
import SaveTemplateModal from './SaveTemplateModal';
import FileAttachmentModal from './FileAttachmentModal';
import type { PromptTemplate, UserFile, UserFileWithConversations } from '@/types';

interface MessageInputProps {
  messageInput: string;
  setMessageInput: (value: string) => void;
  isSending: boolean;
  onSendMessage: () => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
  selectedFile?: File | UserFileWithConversations | null;
  onFileSelect: (file: File | UserFileWithConversations | null) => void;
}

export default function MessageInput({
  messageInput,
  setMessageInput,
  isSending,
  onSendMessage,
  onKeyPress,
  selectedFile,
  onFileSelect
}: MessageInputProps) {
  const [isTemplateSelectorOpen, setIsTemplateSelectorOpen] = useState(false);
  const [isSaveTemplateModalOpen, setIsSaveTemplateModalOpen] = useState(false);
  const [isFileModalOpen, setIsFileModalOpen] = useState(false);
  const [templateRefreshTrigger, setTemplateRefreshTrigger] = useState(0);
  const [fileError, setFileError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleTemplateSelect = (template: PromptTemplate) => {
    setMessageInput(template.content);
  };

  const handleSaveTemplate = () => {
    if (messageInput.trim()) {
      setIsSaveTemplateModalOpen(true);
    }
  };

  const handleTemplateSaved = () => {
    setIsSaveTemplateModalOpen(false);
    setTemplateRefreshTrigger(prev => prev + 1); // Trigger template list refresh
    // Could add a success notification here
  };

  const handleTemplateCreated = () => {
    setTemplateRefreshTrigger(prev => prev + 1); // Trigger template list refresh
  };

  const handleFileModalSelect = (file: File | UserFileWithConversations) => {
    console.log('[MessageInput] File selected from modal:', file);
    setFileError(null);
    onFileSelect(file);
    setIsFileModalOpen(false);
  };

  const handleRemoveFile = () => {
    console.log('[MessageInput] File removed by user');
    onFileSelect(null);
    setFileError(null);
  };

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
      
      const scrollHeight = textarea.scrollHeight - padding;
      const lines = Math.floor(scrollHeight / lineHeight);
      const actualLines = Math.min(Math.max(lines, minLines), maxLines);

      const newHeight = actualLines * lineHeight + padding;
      textarea.style.height = `${newHeight}px`;
      
      // Add scrolling if content exceeds max lines
      textarea.style.overflowY = lines > maxLines ? 'auto' : 'hidden';
    }
  }, [messageInput]);

  return (
    <>
      <PromptTemplateSelector
        isOpen={isTemplateSelectorOpen}
        onClose={() => setIsTemplateSelectorOpen(false)}
        onTemplateSelect={handleTemplateSelect}
        refreshTrigger={templateRefreshTrigger}
      />
      <SaveTemplateModal
        isOpen={isSaveTemplateModalOpen}
        onClose={() => setIsSaveTemplateModalOpen(false)}
        onSaved={handleTemplateSaved}
        initialContent={messageInput.trim()}
        onTemplateCreated={handleTemplateCreated}
      />
      <FileAttachmentModal
        isOpen={isFileModalOpen}
        onClose={() => setIsFileModalOpen(false)}
        onFileSelect={handleFileModalSelect}
      />
    <div className="p-6 flex-shrink-0 glass-surface" style={{
      borderTop: '1px solid var(--ig-border-primary)',
      boxShadow: '0 -4px 20px rgba(21, 25, 45, 0.2)'
    }}>
      <div className="flex items-end gap-3">
        {/* Left side - Extras */}
        <div className="flex gap-2" style={{ alignItems: 'flex-end' }}>
          {/* File Attachment Button */}
          <button
            onClick={() => setIsFileModalOpen(true)}
            disabled={isSending}
            className="p-3 rounded-xl transition-all duration-300 flex-shrink-0 group"
            style={{
              background: 'var(--ig-surface-glass-light)',
              border: '1px solid var(--ig-border-glass)',
              color: 'var(--ig-text-muted)',
              cursor: isSending ? 'not-allowed' : 'pointer'
            }}
            onMouseEnter={(e) => {
              if (!isSending) {
                const target = e.target as HTMLButtonElement;
                target.style.background = 'var(--ig-surface-glass-dark)';
                target.style.borderColor = 'var(--ig-border-accent)';
                target.style.color = 'var(--ig-text-accent)';
                target.style.transform = 'translateY(-1px)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isSending) {
                const target = e.target as HTMLButtonElement;
                target.style.background = 'var(--ig-surface-glass-light)';
                target.style.borderColor = 'var(--ig-border-glass)';
                target.style.color = 'var(--ig-text-muted)';
                target.style.transform = 'translateY(0)';
              }
            }}
          >
            <svg className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" fill="currentColor" viewBox="0 0 24 24">
              <path d="M16.5,6V17.5A4,4 0 0,1 12.5,21.5A4,4 0 0,1 8.5,17.5V5A2.5,2.5 0 0,1 11,2.5A2.5,2.5 0 0,1 13.5,5V15.5A1,1 0 0,1 12.5,16.5A1,1 0 0,1 11.5,15.5V6H10V15.5A2.5,2.5 0 0,0 12.5,18A2.5,2.5 0 0,0 15,15.5V5A4,4 0 0,0 11,1A4,4 0 0,0 7,5V17.5A5.5,5.5 0 0,0 12.5,23A5.5,5.5 0 0,0 18,17.5V6H16.5Z" />
            </svg>
          </button>

        </div>

        {/* Center - Message Input Field */}
        <div className="flex-1">
          {/* File Preview */}
          {selectedFile && (
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
                  onClick={handleRemoveFile}
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
          )}

          <textarea
            ref={textareaRef}
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            onKeyDown={onKeyPress}
            placeholder="Type your message to Ignacio..."
            className="w-full p-4 rounded-xl resize-none transition-all duration-300"
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

        </div>

        {/* Right side - Actions */}
        <div className="flex gap-2" style={{ alignItems: 'flex-end' }}>
          {/* Unified Template Button */}
          <button
            onClick={messageInput.trim() ? handleSaveTemplate : () => setIsTemplateSelectorOpen(true)}
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

          {/* Send Button */}
          <button
            onClick={onSendMessage}
            disabled={(!messageInput.trim() && !selectedFile) || isSending}
            className="p-3 rounded-xl transition-all duration-300 flex-shrink-0 group"
            style={{
              background: (!messageInput.trim() && !selectedFile) || isSending
                ? 'var(--ig-surface-glass-light)'
                : 'var(--ig-accent-gradient)',
              color: (!messageInput.trim() && !selectedFile) || isSending
                ? 'var(--ig-text-muted)'
                : 'var(--ig-dark-primary)',
              cursor: (!messageInput.trim() && !selectedFile) || isSending ? 'not-allowed' : 'pointer',
              border: '1px solid transparent',
              boxShadow: (!messageInput.trim() && !selectedFile) || isSending ? 'none' : 'var(--ig-shadow-md)'
            }}
            onMouseEnter={(e) => {
              if ((messageInput.trim() || selectedFile) && !isSending) {
                const target = e.target as HTMLButtonElement;
                target.style.background = 'var(--ig-accent-gradient-hover)';
                target.style.transform = 'translateY(-1px)';
                target.style.boxShadow = 'var(--ig-shadow-lg), var(--ig-shadow-glow)';
              }
            }}
            onMouseLeave={(e) => {
              if ((messageInput.trim() || selectedFile) && !isSending) {
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
        </div>
      </div>

      {/* Error Display */}
      {fileError && (
        <div className="mt-3 p-3 rounded-lg" style={{
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
        }}>
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 flex-shrink-0" style={{ color: '#ef4444' }} fill="currentColor" viewBox="0 0 24 24">
              <path d="M12,2L13.09,8.26L22,9L13.09,9.74L12,16L10.91,9.74L2,9L10.91,8.26L12,2Z" />
            </svg>
            <span className="text-sm" style={{ color: '#ef4444' }}>
              {fileError}
            </span>
          </div>
        </div>
      )}

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