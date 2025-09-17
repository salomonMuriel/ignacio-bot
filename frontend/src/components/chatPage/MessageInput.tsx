import React, { useState, useRef } from 'react';
import PromptTemplateSelector from './PromptTemplateSelector';
import SaveTemplateModal from './SaveTemplateModal';
import FileAttachmentModal from './FileAttachmentModal';
import FilePreview from './FilePreview';
import FileAttachmentButton from './FileAttachmentButton';
import TemplateButton from './TemplateButton';
import SendButton from './SendButton';
import MessageInputField from './MessageInputField';
import InputHints from './InputHints';
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
  const fileButtonRef = useRef<HTMLButtonElement>(null);
  const templateButtonRef = useRef<HTMLButtonElement>(null);

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
          <FileAttachmentButton
            onFileModalOpen={() => setIsFileModalOpen(true)}
            isSending={isSending}
            buttonRef={fileButtonRef}
          />
        </div>

        {/* Center - Message Input Field */}
        <div className="flex-1">
          <FilePreview
            selectedFile={selectedFile}
            onRemoveFile={handleRemoveFile}
          />
          <MessageInputField
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            onKeyDown={onKeyPress}
            isSending={isSending}
            textareaRef={textareaRef}
          />
        </div>

        {/* Right side - Actions */}
        <div className="flex gap-2 mb-2" style={{ alignItems: 'flex-end' }}>
          <TemplateButton
            messageInput={messageInput}
            onSaveTemplate={handleSaveTemplate}
            onLoadTemplate={() => setIsTemplateSelectorOpen(true)}
            buttonRef={templateButtonRef}
          />
          <SendButton
            messageInput={messageInput}
            selectedFile={selectedFile}
            isSending={isSending}
            onSendMessage={onSendMessage}
          />
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

      <InputHints />
    </div>
    </>
  );
}