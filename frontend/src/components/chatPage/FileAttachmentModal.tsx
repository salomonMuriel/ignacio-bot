import React, { useState, useRef, useEffect } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import type { UserFile } from '@/types';

interface FileAttachmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFileSelect: (file: File | UserFile) => void;
}

interface FileSelectionState {
  newFile: File | null;
  selectedExistingFile: UserFile | null;
}

export default function FileAttachmentModal({
  isOpen,
  onClose,
  onFileSelect
}: FileAttachmentModalProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'upload' | 'existing'>('upload');
  const [fileSelection, setFileSelection] = useState<FileSelectionState>({
    newFile: null,
    selectedExistingFile: null
  });
  const [userFiles, setUserFiles] = useState<UserFile[]>([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [fileTypeFilter, setFileTypeFilter] = useState<'all' | 'images' | 'pdfs'>('all');

  const modalRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load user files when modal opens
  useEffect(() => {
    if (isOpen && user && activeTab === 'existing') {
      loadUserFiles();
    }
  }, [isOpen, user, activeTab]);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setFileSelection({ newFile: null, selectedExistingFile: null });
      setError(null);
      setSearchQuery('');
      setFileTypeFilter('all');
    }
  }, [isOpen]);

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  const loadUserFiles = async () => {
    if (!user) return;

    setIsLoadingFiles(true);
    try {
      const files = await api.files.getUserFiles(user.id);
      setUserFiles(files);
    } catch (err) {
      setError('Failed to load your files');
      console.error('Error loading user files:', err);
    } finally {
      setIsLoadingFiles(false);
    }
  };

  const validateFile = (file: File): string | null => {
    // Check file size (20MB limit)
    const maxSize = 20 * 1024 * 1024; // 20MB
    if (file.size > maxSize) {
      return 'File size must be less than 20MB';
    }

    // Check file type (only images and PDFs)
    const allowedTypes = ['image/', 'application/pdf'];
    const isValidType = allowedTypes.some(type => file.type.startsWith(type));

    if (!isValidType) {
      return 'Only image files (PNG, JPG, etc.) and PDF files are supported';
    }

    return null;
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setError(null);

    if (file) {
      const errorMsg = validateFile(file);
      if (errorMsg) {
        setError(errorMsg);
        return;
      }

      setFileSelection({ newFile: file, selectedExistingFile: null });
    }

    // Reset the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleExistingFileSelect = (file: UserFile) => {
    setFileSelection({ newFile: null, selectedExistingFile: file });
  };

  const handleConfirmSelection = () => {
    if (fileSelection.newFile) {
      onFileSelect(fileSelection.newFile);
    } else if (fileSelection.selectedExistingFile) {
      onFileSelect(fileSelection.selectedExistingFile);
    }
    onClose();
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const filteredFiles = userFiles.filter(file => {
    // Search filter
    const matchesSearch = file.file_name.toLowerCase().includes(searchQuery.toLowerCase());

    // Type filter
    let matchesType = true;
    if (fileTypeFilter === 'images') {
      matchesType = file.file_type.startsWith('image/');
    } else if (fileTypeFilter === 'pdfs') {
      matchesType = file.file_type === 'application/pdf';
    }

    return matchesSearch && matchesType;
  });

  const selectedFile = fileSelection.newFile || fileSelection.selectedExistingFile;
  const canConfirm = selectedFile !== null;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{
      background: 'rgba(15, 20, 35, 0.8)',
      backdropFilter: 'blur(8px)'
    }}>
      <div
        ref={modalRef}
        className="w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-2xl"
        style={{
          background: 'var(--ig-surface-glass-dark)',
          border: '1px solid var(--ig-border-glass)',
          boxShadow: 'var(--ig-shadow-xl)'
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b" style={{
          borderColor: 'var(--ig-border-glass)'
        }}>
          <h2 className="text-xl font-semibold" style={{ color: 'var(--ig-text-primary)' }}>
            Attach File
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg transition-colors duration-200"
            style={{
              color: 'var(--ig-text-muted)',
              background: 'transparent'
            }}
            onMouseEnter={(e) => {
              const target = e.target as HTMLButtonElement;
              target.style.background = 'var(--ig-surface-glass-light)';
              target.style.color = 'var(--ig-text-primary)';
            }}
            onMouseLeave={(e) => {
              const target = e.target as HTMLButtonElement;
              target.style.background = 'transparent';
              target.style.color = 'var(--ig-text-muted)';
            }}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
            </svg>
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b" style={{ borderColor: 'var(--ig-border-glass)' }}>
          <button
            onClick={() => setActiveTab('upload')}
            className={`flex-1 px-6 py-3 text-sm font-medium transition-colors duration-200 ${
              activeTab === 'upload' ? 'border-b-2' : ''
            }`}
            style={{
              color: activeTab === 'upload' ? 'var(--ig-text-accent)' : 'var(--ig-text-muted)',
              borderBottomColor: activeTab === 'upload' ? 'var(--ig-accent-primary)' : 'transparent',
              background: activeTab === 'upload' ? 'var(--ig-surface-glass-light)' : 'transparent'
            }}
          >
            Upload New
          </button>
          <button
            onClick={() => setActiveTab('existing')}
            className={`flex-1 px-6 py-3 text-sm font-medium transition-colors duration-200 ${
              activeTab === 'existing' ? 'border-b-2' : ''
            }`}
            style={{
              color: activeTab === 'existing' ? 'var(--ig-text-accent)' : 'var(--ig-text-muted)',
              borderBottomColor: activeTab === 'existing' ? 'var(--ig-accent-primary)' : 'transparent',
              background: activeTab === 'existing' ? 'var(--ig-surface-glass-light)' : 'transparent'
            }}
          >
            Previous Files
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 max-h-96 overflow-y-auto">
          {activeTab === 'upload' ? (
            // Upload New Tab
            <div className="space-y-4">
              {/* Drag & Drop Zone */}
              <div
                className="border-2 border-dashed rounded-xl p-8 text-center transition-colors duration-200 cursor-pointer"
                style={{
                  borderColor: 'var(--ig-border-glass)',
                  background: 'var(--ig-surface-glass-light)'
                }}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.currentTarget.style.borderColor = 'var(--ig-accent-primary)';
                  e.currentTarget.style.background = 'var(--ig-surface-glass-dark)';
                }}
                onDragLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--ig-border-glass)';
                  e.currentTarget.style.background = 'var(--ig-surface-glass-light)';
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.currentTarget.style.borderColor = 'var(--ig-border-glass)';
                  e.currentTarget.style.background = 'var(--ig-surface-glass-light)';

                  const files = Array.from(e.dataTransfer.files);
                  if (files.length > 0) {
                    const file = files[0];
                    const errorMsg = validateFile(file);
                    if (errorMsg) {
                      setError(errorMsg);
                      return;
                    }
                    setFileSelection({ newFile: file, selectedExistingFile: null });
                    setError(null);
                  }
                }}
              >
                <div className="flex flex-col items-center space-y-2">
                  <svg className="w-12 h-12 mx-auto" style={{ color: 'var(--ig-text-muted)' }} fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                  </svg>
                  <p className="text-lg font-medium" style={{ color: 'var(--ig-text-primary)' }}>
                    Drop files here or click to browse
                  </p>
                  <p className="text-sm" style={{ color: 'var(--ig-text-muted)' }}>
                    Support for images and PDF files (max 20MB)
                  </p>
                </div>
              </div>

              {/* Hidden File Input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,.pdf"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
              />

              {/* Selected New File Preview */}
              {fileSelection.newFile && (
                <div className="p-4 rounded-lg border" style={{
                  background: 'var(--ig-surface-glass-light)',
                  border: '1px solid var(--ig-border-glass)'
                }}>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded" style={{ background: 'var(--ig-surface-glass-dark)' }}>
                      {fileSelection.newFile.type.startsWith('image/') ? (
                        <svg className="w-5 h-5" style={{ color: 'var(--ig-text-accent)' }} fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8.5,13.5L11,16.5L14.5,12L19,18H5M21,19V5C21,3.89 20.1,3 19,3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19Z" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" style={{ color: 'var(--ig-text-accent)' }} fill="currentColor" viewBox="0 0 24 24">
                          <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium" style={{ color: 'var(--ig-text-primary)' }}>
                        {fileSelection.newFile.name}
                      </p>
                      <p className="text-sm" style={{ color: 'var(--ig-text-muted)' }}>
                        {formatFileSize(fileSelection.newFile.size)}
                      </p>
                    </div>
                    <button
                      onClick={() => setFileSelection({ newFile: null, selectedExistingFile: null })}
                      className="p-1 rounded-full transition-colors duration-200"
                      style={{ color: 'var(--ig-text-muted)' }}
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
            </div>
          ) : (
            // Previous Files Tab
            <div className="space-y-4">
              {/* Search and Filter Controls */}
              <div className="flex gap-3">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Search files..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg text-sm transition-all duration-200"
                    style={{
                      background: 'var(--ig-surface-glass-light)',
                      border: '1px solid var(--ig-border-glass)',
                      color: 'var(--ig-text-primary)'
                    }}
                    onFocus={(e) => {
                      const target = e.target as HTMLInputElement;
                      target.style.borderColor = 'var(--ig-border-accent)';
                    }}
                    onBlur={(e) => {
                      const target = e.target as HTMLInputElement;
                      target.style.borderColor = 'var(--ig-border-glass)';
                    }}
                  />
                </div>
                <select
                  value={fileTypeFilter}
                  onChange={(e) => setFileTypeFilter(e.target.value as any)}
                  className="px-3 py-2 rounded-lg text-sm transition-all duration-200"
                  style={{
                    background: 'var(--ig-surface-glass-light)',
                    border: '1px solid var(--ig-border-glass)',
                    color: 'var(--ig-text-primary)'
                  }}
                >
                  <option value="all">All Files</option>
                  <option value="images">Images</option>
                  <option value="pdfs">PDFs</option>
                </select>
              </div>

              {/* Files List */}
              {isLoadingFiles ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-6 h-6 border-2 border-current border-t-transparent rounded-full animate-spin"
                       style={{ color: 'var(--ig-accent-primary)' }}></div>
                </div>
              ) : filteredFiles.length > 0 ? (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {filteredFiles.map((file) => (
                    <div
                      key={file.id}
                      onClick={() => handleExistingFileSelect(file)}
                      className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                        fileSelection.selectedExistingFile?.id === file.id ? 'ring-2' : ''
                      }`}
                      style={{
                        background: fileSelection.selectedExistingFile?.id === file.id
                          ? 'var(--ig-surface-glass-dark)'
                          : 'var(--ig-surface-glass-light)',
                        border: `1px solid ${fileSelection.selectedExistingFile?.id === file.id
                          ? 'var(--ig-accent-primary)'
                          : 'var(--ig-border-glass)'}`,
                        ringColor: fileSelection.selectedExistingFile?.id === file.id
                          ? 'var(--ig-accent-primary)'
                          : 'transparent'
                      }}
                      onMouseEnter={(e) => {
                        if (fileSelection.selectedExistingFile?.id !== file.id) {
                          const target = e.currentTarget;
                          target.style.background = 'var(--ig-surface-glass-dark)';
                          target.style.borderColor = 'var(--ig-border-accent)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (fileSelection.selectedExistingFile?.id !== file.id) {
                          const target = e.currentTarget;
                          target.style.background = 'var(--ig-surface-glass-light)';
                          target.style.borderColor = 'var(--ig-border-glass)';
                        }
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded" style={{ background: 'var(--ig-surface-glass-dark)' }}>
                          {file.file_type.startsWith('image/') ? (
                            <svg className="w-4 h-4" style={{ color: 'var(--ig-text-accent)' }} fill="currentColor" viewBox="0 0 24 24">
                              <path d="M8.5,13.5L11,16.5L14.5,12L19,18H5M21,19V5C21,3.89 20.1,3 19,3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19Z" />
                            </svg>
                          ) : (
                            <svg className="w-4 h-4" style={{ color: 'var(--ig-text-accent)' }} fill="currentColor" viewBox="0 0 24 24">
                              <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                            </svg>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate" style={{ color: 'var(--ig-text-primary)' }}>
                            {file.file_name}
                          </p>
                          <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--ig-text-muted)' }}>
                            <span>{formatFileSize(file.file_size)}</span>
                            <span>•</span>
                            <span>{formatDate(file.created_at)}</span>
                          </div>
                        </div>
                        {fileSelection.selectedExistingFile?.id === file.id && (
                          <div className="p-1 rounded-full" style={{ background: 'var(--ig-accent-primary)' }}>
                            <svg className="w-3 h-3" style={{ color: 'white' }} fill="currentColor" viewBox="0 0 24 24">
                              <path d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z" />
                            </svg>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <svg className="w-12 h-12 mx-auto mb-3" style={{ color: 'var(--ig-text-muted)' }} fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                  </svg>
                  <p className="text-sm" style={{ color: 'var(--ig-text-muted)' }}>
                    {searchQuery || fileTypeFilter !== 'all' ? 'No files match your search' : 'No files uploaded yet'}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="mt-4 p-3 rounded-lg" style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
            }}>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 flex-shrink-0" style={{ color: '#ef4444' }} fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12,2L13.09,8.26L22,9L13.09,9.74L12,16L10.91,9.74L2,9L10.91,8.26L12,2Z" />
                </svg>
                <span className="text-sm" style={{ color: '#ef4444' }}>
                  {error}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t" style={{
          borderColor: 'var(--ig-border-glass)'
        }}>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
            style={{
              background: 'var(--ig-surface-glass-light)',
              border: '1px solid var(--ig-border-glass)',
              color: 'var(--ig-text-muted)'
            }}
            onMouseEnter={(e) => {
              const target = e.target as HTMLButtonElement;
              target.style.background = 'var(--ig-surface-glass-dark)';
              target.style.borderColor = 'var(--ig-border-accent)';
              target.style.color = 'var(--ig-text-primary)';
            }}
            onMouseLeave={(e) => {
              const target = e.target as HTMLButtonElement;
              target.style.background = 'var(--ig-surface-glass-light)';
              target.style.borderColor = 'var(--ig-border-glass)';
              target.style.color = 'var(--ig-text-muted)';
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleConfirmSelection}
            disabled={!canConfirm}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
            style={{
              background: canConfirm ? 'var(--ig-accent-gradient)' : 'var(--ig-surface-glass-light)',
              color: canConfirm ? 'var(--ig-dark-primary)' : 'var(--ig-text-muted)',
              cursor: canConfirm ? 'pointer' : 'not-allowed',
              border: '1px solid transparent',
              boxShadow: canConfirm ? 'var(--ig-shadow-md)' : 'none'
            }}
            onMouseEnter={(e) => {
              if (canConfirm) {
                const target = e.target as HTMLButtonElement;
                target.style.background = 'var(--ig-accent-gradient-hover)';
                target.style.transform = 'translateY(-1px)';
                target.style.boxShadow = 'var(--ig-shadow-lg), var(--ig-shadow-glow)';
              }
            }}
            onMouseLeave={(e) => {
              if (canConfirm) {
                const target = e.target as HTMLButtonElement;
                target.style.background = 'var(--ig-accent-gradient)';
                target.style.transform = 'translateY(0)';
                target.style.boxShadow = 'var(--ig-shadow-md)';
              }
            }}
          >
            Select File
          </button>
        </div>
      </div>
    </div>
  );
}