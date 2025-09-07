/**
 * MessageInput Component
 * Handles message input and sending functionality
 * Provides a text area with send button and proper form handling
 * Now includes file upload capability
 */

import React, { useState, useRef, useEffect } from 'react';
import { MessageType, UserFile } from '../../types';
import { FileService } from '../../services/fileService';
import FilePreview from '../files/FilePreview';

interface MessageInputProps {
  onSendMessage: (content: string, messageType?: MessageType, fileId?: string) => Promise<void>;
  disabled?: boolean;
  placeholder?: string;
  conversationId?: string;
  userId: string; // Required for file uploads
}

export const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  disabled = false,
  placeholder = "Escribe tu mensaje a Ignacio...",
  conversationId,
  userId,
}) => {
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attachedFile, setAttachedFile] = useState<UserFile | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-resize textarea based on content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if ((!message.trim() && !attachedFile) || isSubmitting || disabled) {
      return;
    }

    const messageToSend = message.trim();
    const fileToSend = attachedFile;

    // Clear form
    setMessage('');
    setAttachedFile(null);
    setUploadError(null);
    setIsSubmitting(true);

    try {
      if (fileToSend) {
        // Determine message type based on file
        const fileCategory = FileService.getFileCategory(fileToSend.file_type);
        let messageType: MessageType;
        switch (fileCategory) {
          case 'image':
            messageType = MessageType.IMAGE;
            break;
          case 'audio':
            messageType = MessageType.AUDIO;
            break;
          case 'document':
            messageType = MessageType.DOCUMENT;
            break;
          default:
            messageType = MessageType.DOCUMENT;
        }

        await onSendMessage(
          messageToSend || `Archivo: ${fileToSend.file_name}`,
          messageType,
          fileToSend.id
        );
      } else {
        await onSendMessage(messageToSend, MessageType.TEXT);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      // Restore message and file on error
      setMessage(messageToSend);
      setAttachedFile(fileToSend);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];

    // Validate file
    const validation = FileService.validateFile(file);
    if (!validation.isValid) {
      setUploadError(validation.error || 'Invalid file');
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      let uploadedFile: UserFile;

      if (conversationId) {
        uploadedFile = await FileService.uploadFileToConversation(conversationId, userId, file);
      } else {
        uploadedFile = await FileService.uploadFile(userId, file);
      }

      setAttachedFile(uploadedFile);
    } catch (error: any) {
      setUploadError(error.message);
    } finally {
      setIsUploading(false);
      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveFile = () => {
    setAttachedFile(null);
    setUploadError(null);
  };

  const openFileDialog = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const isDisabled = disabled || isSubmitting || isUploading;

  return (
    <div className="border-t border-gray-200 bg-white p-4">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileSelect}
        accept=".mp3,.wav,.m4a,.ogg,.flac,.pdf,.txt,.doc,.docx,.jpg,.jpeg,.png,.gif,.webp"
        className="hidden"
      />

      {/* File attachment display */}
      {attachedFile && (
        <div className="mb-3">
          <FilePreview
            file={attachedFile}
            userId={userId}
            compact={true}
            showActions={false}
            className="relative"
          />
          <button
            onClick={handleRemoveFile}
            className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-500"
            title="Remove file"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Upload error display */}
      {uploadError && (
        <div className="mb-3 bg-red-50 border border-red-200 rounded-md p-3">
          <p className="text-sm text-red-600">{uploadError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex items-end space-x-3">
        {/* File Upload Button */}
        <button
          type="button"
          onClick={openFileDialog}
          disabled={isDisabled}
          className="inline-flex items-center p-3 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          title="Attach file"
        >
          {isUploading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
          ) : (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
          )}
        </button>

        {/* Message Input */}
        <div className="flex-1">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={attachedFile ? "Add a message (optional)" : placeholder}
            disabled={isDisabled}
            rows={1}
            className="w-full resize-none border-0 bg-gray-50 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ maxHeight: '120px' }}
          />
        </div>

        {/* Send Button */}
        <button
          type="submit"
          disabled={isDisabled || (!message.trim() && !attachedFile)}
          className="inline-flex items-center px-4 py-3 bg-primary-500 text-ignia-dark-gray font-semibold rounded-lg hover:bg-primary-600 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105"
        >
          {isSubmitting ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          ) : (
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
          )}
          <span className="ml-2">Enviar</span>
        </button>
      </form>

      {/* Helper Text */}
      <div className="mt-2 text-xs text-gray-500">
        Presiona Enter para enviar, Shift+Enter para nueva línea • Archivos soportados: Audio, Documentos (PDF, TXT, DOC, DOCX), Imágenes
      </div>
    </div>
  );
};

export default MessageInput;
