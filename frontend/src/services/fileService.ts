/**
 * File service for handling file uploads, downloads, and management
 * Interfaces with the backend file API endpoints
 */

import { apiClient } from './api';
import { UserFile, FileUploadRequest, FileValidation } from '../types';

// File validation configuration matching backend
export const FILE_VALIDATION: FileValidation = {
  maxSize: 10 * 1024 * 1024, // 10MB in bytes
  allowedTypes: [
    // Audio
    'audio/mpeg',
    'audio/wav',
    'audio/mp4',
    'audio/ogg',
    'audio/flac',
    // Documents
    'application/pdf',
    'text/plain',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    // Images
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp'
  ],
  allowedExtensions: [
    // Audio
    '.mp3', '.wav', '.m4a', '.ogg', '.flac',
    // Documents
    '.pdf', '.txt', '.doc', '.docx',
    // Images
    '.jpg', '.jpeg', '.png', '.gif', '.webp'
  ]
};

export class FileService {
  /**
   * Validate a file before upload
   */
  static validateFile(file: File): { isValid: boolean; error?: string } {
    // Check file size
    if (file.size > FILE_VALIDATION.maxSize) {
      return {
        isValid: false,
        error: `File size (${Math.round(file.size / 1024 / 1024)}MB) exceeds maximum allowed size of 10MB`
      };
    }

    // Check file type
    if (!FILE_VALIDATION.allowedTypes.includes(file.type)) {
      return {
        isValid: false,
        error: `File type '${file.type}' is not allowed. Allowed types: Audio, Documents (PDF, TXT, DOC, DOCX), Images`
      };
    }

    // Check file extension
    const extension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!FILE_VALIDATION.allowedExtensions.includes(extension)) {
      return {
        isValid: false,
        error: `File extension '${extension}' is not allowed`
      };
    }

    return { isValid: true };
  }

  /**
   * Upload a file to the server
   */
  static async uploadFile(userId: string, file: File): Promise<UserFile> {
    // Validate file first
    const validation = this.validateFile(file);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }

    // Create form data
    const formData = new FormData();
    formData.append('user_id', userId);
    formData.append('file', file);

    try {
      const response = await apiClient.post<UserFile>('/files/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Failed to upload file');
    }
  }

  /**
   * Upload a file to a specific conversation
   */
  static async uploadFileToConversation(
    conversationId: string,
    userId: string,
    file: File
  ): Promise<UserFile> {
    // Validate file first
    const validation = this.validateFile(file);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }

    // Create form data
    const formData = new FormData();
    formData.append('user_id', userId);
    formData.append('file', file);

    try {
      const response = await apiClient.post<UserFile>(
        `/files/conversations/${conversationId}/files`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Failed to upload file to conversation');
    }
  }

  /**
   * Get file metadata
   */
  static async getFileMetadata(fileId: string, userId: string): Promise<UserFile> {
    try {
      const response = await apiClient.get<UserFile>(`/files/${fileId}`, {
        params: { user_id: userId }
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Failed to get file metadata');
    }
  }

  /**
   * Get download URL for a file
   */
  static async getFileUrl(fileId: string, userId: string, expiresIn: number = 3600): Promise<string> {
    try {
      const response = await apiClient.get<{ url: string; expires_in: number }>(`/files/${fileId}/url`, {
        params: { user_id: userId, expires_in: expiresIn }
      });
      return response.data.url;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Failed to get file URL');
    }
  }

  /**
   * Download a file
   */
  static async downloadFile(fileId: string, userId: string): Promise<Blob> {
    try {
      const response = await apiClient.get(`/files/${fileId}/download`, {
        params: { user_id: userId },
        responseType: 'blob'
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Failed to download file');
    }
  }

  /**
   * Get all files for a user
   */
  static async getUserFiles(userId: string): Promise<UserFile[]> {
    try {
      const response = await apiClient.get<UserFile[]>(`/files/user/${userId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Failed to get user files');
    }
  }

  /**
   * Delete a file
   */
  static async deleteFile(fileId: string, userId: string): Promise<void> {
    try {
      await apiClient.delete(`/files/${fileId}`, {
        params: { user_id: userId }
      });
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Failed to delete file');
    }
  }

  /**
   * Format file size for display
   */
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Get file type category for display
   */
  static getFileCategory(mimeType: string): 'audio' | 'document' | 'image' | 'unknown' {
    if (mimeType.startsWith('audio/')) return 'audio';
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType === 'application/pdf' ||
        mimeType === 'text/plain' ||
        mimeType === 'application/msword' ||
        mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      return 'document';
    }
    return 'unknown';
  }
}

export default FileService;