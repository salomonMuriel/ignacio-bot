/**
 * File manager component
 * Shows all user files with search, filter, and management capabilities
 */

import React, { useState, useEffect } from 'react';
import { UserFile } from '../../types';
import { FileService } from '../../services/fileService';
import FilePreview from './FilePreview';
import FileUpload from './FileUpload';

interface FileManagerProps {
  userId: string;
  className?: string;
  showUpload?: boolean;
  onFileSelect?: (file: UserFile) => void;
}

export const FileManager: React.FC<FileManagerProps> = ({
  userId,
  className = '',
  showUpload = true,
  onFileSelect,
}) => {
  const [files, setFiles] = useState<UserFile[]>([]);
  const [filteredFiles, setFilteredFiles] = useState<UserFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'audio' | 'document' | 'image'>('all');

  useEffect(() => {
    loadFiles();
  }, [userId]);

  useEffect(() => {
    filterFiles();
  }, [files, searchTerm, filterType]);

  const loadFiles = async () => {
    try {
      setLoading(true);
      setError(null);
      const userFiles = await FileService.getUserFiles(userId);
      setFiles(userFiles);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const filterFiles = () => {
    let filtered = files;

    // Filter by search term
    if (searchTerm.trim()) {
      filtered = filtered.filter(file =>
        file.file_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter(file =>
        FileService.getFileCategory(file.file_type) === filterType
      );
    }

    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    setFilteredFiles(filtered);
  };

  const handleFileUploaded = (file: UserFile) => {
    setFiles(prev => [file, ...prev]);
    setError(null);
  };

  const handleFileDeleted = async (fileId: string) => {
    try {
      await FileService.deleteFile(fileId, userId);
      setFiles(prev => prev.filter(file => file.id !== fileId));
      setError(null);
    } catch (error: any) {
      setError(error.message);
    }
  };

  const handleError = (error: string) => {
    setError(error);
  };

  const getFileTypeCount = (type: 'all' | 'audio' | 'document' | 'image') => {
    if (type === 'all') return files.length;
    return files.filter(file => FileService.getFileCategory(file.file_type) === type).length;
  };

  const getTotalFileSize = () => {
    const total = files.reduce((sum, file) => sum + file.file_size, 0);
    return FileService.formatFileSize(total);
  };

  if (loading) {
    return (
      <div className={`p-6 ${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with stats */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">File Manager</h2>
          <p className="text-sm text-gray-500">
            {files.length} files • {getTotalFileSize()} total
          </p>
        </div>
        <button
          onClick={loadFiles}
          className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
        >
          <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      {/* Upload area */}
      {showUpload && (
        <FileUpload
          userId={userId}
          onFileUploaded={handleFileUploaded}
          onError={handleError}
          className="mb-6"
        />
      )}

      {/* Error message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <div className="ml-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="ml-auto pl-3"
            >
              <svg className="h-5 w-5 text-red-400 hover:text-red-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Search and filters */}
      <div className="space-y-4">
        {/* Search */}
        <div className="relative">
          <svg className="absolute left-3 top-3 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search files..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-3 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>

        {/* Type filters */}
        <div className="flex space-x-2">
          {(['all', 'document', 'image', 'audio'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                filterType === type
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              {type === 'all' ? 'All' : type.charAt(0).toUpperCase() + type.slice(1)}
              <span className="ml-1 text-xs text-gray-400">
                ({getFileTypeCount(type)})
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Files grid */}
      {filteredFiles.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredFiles.map((file) => (
            <div
              key={file.id}
              onClick={onFileSelect ? () => onFileSelect(file) : undefined}
              className={onFileSelect ? 'cursor-pointer' : ''}
            >
              <FilePreview
                file={file}
                userId={userId}
                onDelete={handleFileDeleted}
                className={onFileSelect ? 'hover:bg-gray-50' : ''}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No files found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || filterType !== 'all'
              ? 'Try adjusting your search or filter criteria.'
              : showUpload
                ? 'Upload your first file to get started.'
                : 'No files have been uploaded yet.'
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default FileManager;