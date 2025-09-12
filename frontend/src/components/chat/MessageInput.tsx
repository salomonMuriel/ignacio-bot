'use client';

/**
 * MessageInput - Message input form with file upload
 * Uses React 19.1 compatible patterns with useActionState support
 */

import { useState, useRef } from 'react';
import { useFormState } from '@/hooks/useFormState';
import { 
  PaperAirplaneIcon, 
  PaperClipIcon,
  XMarkIcon,
  DocumentIcon,
  PhotoIcon 
} from '@heroicons/react/24/outline';

interface MessageInputProps {
  onSendMessage: (content: string, files?: File[]) => Promise<void>;
  disabled?: boolean;
  placeholder?: string;
}

interface MessageFormData {
  content: string;
  files: File[];
}

const initialFormData: MessageFormData = {
  content: '',
  files: []
};

export function MessageInput({ 
  onSendMessage, 
  disabled = false, 
  placeholder = "Escribe tu mensaje..." 
}: MessageInputProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const {
    data: formData,
    loading,
    error,
    updateField,
    setData,
    setLoading,
    setError
  } = useFormState<MessageFormData>(initialFormData);

  // Auto-resize textarea
  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    }
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateField('content', e.target.value);
    adjustTextareaHeight();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    
    // Validate file types and sizes
    const validFiles: File[] = [];
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];

    for (const file of selectedFiles) {
      if (!allowedTypes.includes(file.type)) {
        setError(`Tipo de archivo no soportado: ${file.type}`);
        continue;
      }
      if (file.size > maxSize) {
        setError(`Archivo demasiado grande: ${file.name} (máximo 10MB)`);
        continue;
      }
      validFiles.push(file);
    }

    if (validFiles.length > 0) {
      updateField('files', [...formData.files, ...validFiles]);
      setError(null);
    }
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveFile = (index: number) => {
    const newFiles = formData.files.filter((_, i) => i !== index);
    updateField('files', newFiles);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.content.trim() && formData.files.length === 0) {
      return;
    }

    if (disabled || loading) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await onSendMessage(
        formData.content.trim(),
        formData.files.length > 0 ? formData.files : undefined
      );
      
      // Reset form
      setData(initialFormData);
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al enviar mensaje');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  const canSend = (formData.content.trim() || formData.files.length > 0) && !disabled && !loading;

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {/* Error display */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* File attachments preview */}
      {formData.files.length > 0 && (
        <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-lg">
          {formData.files.map((file, index) => (
            <div
              key={index}
              className="flex items-center space-x-2 bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm"
            >
              {file.type.startsWith('image/') ? (
                <PhotoIcon className="w-4 h-4 text-green-600" />
              ) : (
                <DocumentIcon className="w-4 h-4 text-blue-600" />
              )}
              <span className="truncate max-w-32">{file.name}</span>
              <button
                type="button"
                onClick={() => handleRemoveFile(index)}
                className="p-0.5 hover:bg-gray-100 rounded"
              >
                <XMarkIcon className="w-3 h-3 text-gray-500" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Input area */}
      <div className="flex items-end space-x-3">
        {/* File attachment button */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || loading}
          className="p-3 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0"
          title="Adjuntar archivo"
        >
          <PaperClipIcon className="w-5 h-5 text-gray-600" />
        </button>

        {/* Text input */}
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={formData.content}
            onChange={handleContentChange}
            onKeyDown={handleKeyPress}
            placeholder={placeholder}
            disabled={disabled || loading}
            rows={1}
            className="w-full resize-none border border-gray-300 rounded-2xl px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed min-h-[48px] max-h-[120px]"
          />
        </div>

        {/* Send button */}
        <button
          type="submit"
          disabled={!canSend}
          className={`p-3 rounded-full transition-colors flex-shrink-0 ${
            canSend
              ? 'bg-blue-600 hover:bg-blue-700 text-white'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
          title="Enviar mensaje"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <PaperAirplaneIcon className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,application/pdf,.doc,.docx,.txt"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Help text */}
      <div className="text-xs text-gray-500 px-1">
        Presiona Enter para enviar, Shift+Enter para nueva línea. 
        Archivos soportados: imágenes, PDF, documentos (máx. 10MB)
      </div>
    </form>
  );
}