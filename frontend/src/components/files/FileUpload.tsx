/**
 * Drag-and-drop file upload component
 * Handles file validation, upload progress, and error states
 */

import React, { useState, useRef, DragEvent, ChangeEvent } from 'react';
import { FileService, FILE_VALIDATION } from '../../services/fileService';
import { UserFile } from '../../types';

interface FileUploadProps {
  onFileUploaded: (file: UserFile) => void;
  onError: (error: string) => void;
  userId: string;
  conversationId?: string;
  className?: string;
  disabled?: boolean;
}

interface UploadProgress {
  fileName: string;
  progress: number;
  error?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onFileUploaded,
  onError,
  userId,
  conversationId,
  className = '',
  disabled = false,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState<UploadProgress | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList) => {
    if (files.length === 0) return;

    // For now, handle one file at a time
    const file = files[0];

    // Validate file
    const validation = FileService.validateFile(file);
    if (!validation.isValid) {
      onError(validation.error || 'Invalid file');
      return;
    }

    // Start upload
    setUploading({
      fileName: file.name,
      progress: 0,
    });

    try {
      let uploadedFile: UserFile;

      if (conversationId) {
        uploadedFile = await FileService.uploadFileToConversation(conversationId, userId, file);
      } else {
        uploadedFile = await FileService.uploadFile(userId, file);
      }

      setUploading({
        fileName: file.name,
        progress: 100,
      });

      // Small delay to show completion
      setTimeout(() => {
        setUploading(null);
        onFileUploaded(uploadedFile);
      }, 500);

    } catch (error: any) {
      setUploading({
        fileName: file.name,
        progress: 0,
        error: error.message,
      });

      setTimeout(() => {
        setUploading(null);
        onError(error.message);
      }, 2000);
    }
  };

  const handleDrag = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragIn = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setDragActive(true);
    }
  };

  const handleDragOut = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  const openFileDialog = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const getAcceptedTypes = () => {
    return FILE_VALIDATION.allowedExtensions.join(',');
  };

  const formatFileSize = (bytes: number) => {
    return FileService.formatFileSize(bytes);
  };

  if (disabled) {
    return (
      <div className={`bg-gray-100 border-2 border-gray-200 rounded-lg p-8 text-center ${className}`}>
        <div className="text-gray-400">
          <svg className="mx-auto h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3 3-3M12 12l0 9" />
          </svg>
          <p className="text-sm">File upload disabled</p>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileSelect}
        accept={getAcceptedTypes()}
        className="hidden"
      />

      <div
        className={`
          border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 cursor-pointer
          ${dragActive
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
          }
          ${uploading ? 'pointer-events-none' : ''}
        `}
        onDragEnter={handleDragIn}
        onDragLeave={handleDragOut}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={openFileDialog}
      >
        {uploading ? (
          <div className="space-y-4">
            <div className="mx-auto h-12 w-12 text-blue-500">
              <svg className="animate-spin" fill="none" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">{uploading.fileName}</p>
              {uploading.error ? (
                <p className="text-sm text-red-600">{uploading.error}</p>
              ) : (
                <p className="text-sm text-blue-600">
                  {uploading.progress === 100 ? 'Upload complete!' : 'Uploading...'}
                </p>
              )}
              {!uploading.error && (
                <div className="mt-2 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploading.progress}%` }}
                  />
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className={`mx-auto h-12 w-12 ${dragActive ? 'text-blue-500' : 'text-gray-400'}`}>
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3 3-3M12 12l0 9"
                />
              </svg>
            </div>
            <div>
              <p className={`text-sm font-medium ${dragActive ? 'text-blue-600' : 'text-gray-900'}`}>
                Drop files here or click to browse
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Audio, Documents (PDF, TXT, DOC, DOCX), Images • Max {formatFileSize(FILE_VALIDATION.maxSize)}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUpload;