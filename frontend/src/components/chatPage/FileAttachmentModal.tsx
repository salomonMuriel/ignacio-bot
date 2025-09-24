import React, { useState, useRef, useEffect } from 'react';
import { api } from '../../services/api';
import { useAuth0 } from '@auth0/auth0-react';
import { useConversations } from '../../contexts/ConversationsContext';
import type { UserFileWithConversations } from '@/types';

interface FileAttachmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFileSelect: (file: File | UserFileWithConversations) => void;
}

interface FileSelectionState {
  newFile: File | null;
  selectedExistingFile: UserFileWithConversations | null;
}

export default function FileAttachmentModal({
  isOpen,
  onClose,
  onFileSelect
}: FileAttachmentModalProps) {
  const { user } = useAuth0();
  const { conversations } = useConversations();
  const [activeTab, setActiveTab] = useState<'upload' | 'existing'>('upload');
  const [fileSelection, setFileSelection] = useState<FileSelectionState>({
    newFile: null,
    selectedExistingFile: null
  });
  const [userFiles, setUserFiles] = useState<UserFileWithConversations[]>([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [fileTypeFilter, setFileTypeFilter] = useState<'all' | 'images' | 'pdfs'>('all');
  const [conversationFilter, setConversationFilter] = useState<'all' | string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'size'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showFilters, setShowFilters] = useState(false);

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
      setConversationFilter('all');
      setSortBy('date');
      setSortOrder('desc');
      setShowFilters(false);
      setActiveTab('upload'); // Always start with upload tab
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
      const files = await api.files.getUserFilesWithConversations();
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

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--ig-border-glass)';
    (e.currentTarget as HTMLDivElement).style.background = 'var(--ig-surface-glass-light)';

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
  };

  const handleExistingFileSelect = (file: UserFileWithConversations) => {
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

  const getActiveFilterCount = (): number => {
    let count = 0;
    if (fileTypeFilter !== 'all') count++;
    if (conversationFilter !== 'all') count++;
    if (sortBy !== 'date' || sortOrder !== 'desc') count++;
    return count;
  };

  const clearAllFilters = () => {
    setFileTypeFilter('all');
    setConversationFilter('all');
    setSortBy('date');
    setSortOrder('desc');
    setShowFilters(false);
  };

  const filteredAndSortedFiles = userFiles
    .filter(file => {
      // Search filter
      const matchesSearch = file.file_name.toLowerCase().includes(searchQuery.toLowerCase());

      // Type filter
      let matchesType = true;
      if (fileTypeFilter === 'images') {
        matchesType = file.file_type.startsWith('image/');
      } else if (fileTypeFilter === 'pdfs') {
        matchesType = file.file_type === 'application/pdf';
      }

      // Conversation filter
      let matchesConversation = true;
      if (conversationFilter !== 'all') {
        matchesConversation = file.conversations?.some(conv => conv.conversation_id === conversationFilter) || false;
      }

      return matchesSearch && matchesType && matchesConversation;
    })
    .sort((a, b) => {
      let aVal: any, bVal: any;

      switch (sortBy) {
        case 'name':
          aVal = a.file_name.toLowerCase();
          bVal = b.file_name.toLowerCase();
          break;
        case 'size':
          aVal = a.file_size;
          bVal = b.file_size;
          break;
        case 'date':
        default:
          aVal = new Date(a.created_at).getTime();
          bVal = new Date(b.created_at).getTime();
          break;
      }

      if (sortOrder === 'asc') {
        return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      } else {
        return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
      }
    });

  // Get recent files (last 10 uploaded)
  const recentFiles = userFiles
    .filter(file => {
      // Type filter for recent files too
      if (fileTypeFilter === 'images') {
        return file.file_type.startsWith('image/');
      } else if (fileTypeFilter === 'pdfs') {
        return file.file_type === 'application/pdf';
      }
      return true;
    })
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 10);

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
        <div className="flex items-center justify-between p-3 border-b" style={{
          borderColor: 'var(--ig-border-glass)'
        }}>
          <h2 className="text-base font-medium" style={{ color: 'var(--ig-text-primary)' }}>
            Attach File
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg transition-colors duration-200"
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
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
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
                onDrop={handleDrop}
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
              <div className="flex gap-2 items-center">
                {/* Search Box - Now takes most of the space */}
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Search files..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg text-sm transition-all duration-200"
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

                {/* Filters Button with Count Indicator */}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`relative p-2 rounded-lg transition-all duration-200 ${showFilters ? 'ring-2' : ''}`}
                  style={{
                    background: showFilters ? 'var(--ig-surface-glass-dark)' : 'var(--ig-surface-glass-light)',
                    border: '1px solid var(--ig-border-glass)',
                    color: 'var(--ig-text-primary)',
                    outline: showFilters ? '2px solid var(--ig-accent-primary)' : '2px solid transparent'
                  }}
                  title="Toggle filters"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6,13H18V11H6M3,6V8H21V6M10,18H14V16H10V18Z" />
                  </svg>
                  {getActiveFilterCount() > 0 && (
                    <div
                      className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-xs font-medium flex items-center justify-center"
                      style={{
                        background: 'var(--ig-accent-primary)',
                        color: 'white'
                      }}
                    >
                      {getActiveFilterCount()}
                    </div>
                  )}
                </button>

                {/* Clear Filters Button - Only show when filters are active */}
                {getActiveFilterCount() > 0 && (
                  <button
                    onClick={clearAllFilters}
                    className="p-2 rounded-lg transition-all duration-200"
                    style={{
                      background: 'var(--ig-surface-glass-light)',
                      border: '1px solid var(--ig-border-glass)',
                      color: 'var(--ig-text-muted)'
                    }}
                    title="Clear all filters"
                    onMouseEnter={(e) => {
                      const target = e.target as HTMLButtonElement;
                      target.style.background = 'var(--ig-surface-glass-dark)';
                      target.style.color = 'var(--ig-text-primary)';
                    }}
                    onMouseLeave={(e) => {
                      const target = e.target as HTMLButtonElement;
                      target.style.background = 'var(--ig-surface-glass-light)';
                      target.style.color = 'var(--ig-text-muted)';
                    }}
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
                    </svg>
                  </button>
                )}
              </div>

              {/* Collapsible Filters Panel */}
              {showFilters && (
                <div className="p-4 rounded-lg border space-y-3" style={{
                  background: 'var(--ig-surface-glass-light)',
                  border: '1px solid var(--ig-border-glass)'
                }}>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <select
                      value={fileTypeFilter}
                      onChange={(e) => setFileTypeFilter(e.target.value as any)}
                      className="px-3 py-2 rounded-lg text-sm transition-all duration-200"
                      style={{
                        background: 'var(--ig-surface-glass-dark)',
                        border: '1px solid var(--ig-border-glass)',
                        color: 'var(--ig-text-primary)'
                      }}
                    >
                      <option value="all">All File Types</option>
                      <option value="images">Images</option>
                      <option value="pdfs">PDFs</option>
                    </select>
                    <select
                      value={conversationFilter}
                      onChange={(e) => setConversationFilter(e.target.value)}
                      className="px-3 py-2 rounded-lg text-sm transition-all duration-200"
                      style={{
                        background: 'var(--ig-surface-glass-dark)',
                        border: '1px solid var(--ig-border-glass)',
                        color: 'var(--ig-text-primary)'
                      }}
                    >
                      <option value="all">All Conversations</option>
                      {conversations.map(conv => (
                        <option key={conv.id} value={conv.id}>
                          {conv.title || `Conversation ${conv.id.slice(0, 8)}`}
                        </option>
                      ))}
                    </select>
                    <select
                      value={`${sortBy}-${sortOrder}`}
                      onChange={(e) => {
                        const [sort, order] = e.target.value.split('-');
                        setSortBy(sort as any);
                        setSortOrder(order as any);
                      }}
                      className="px-3 py-2 rounded-lg text-sm transition-all duration-200"
                      style={{
                        background: 'var(--ig-surface-glass-dark)',
                        border: '1px solid var(--ig-border-glass)',
                        color: 'var(--ig-text-primary)'
                      }}
                    >
                      <option value="date-desc">Newest First</option>
                      <option value="date-asc">Oldest First</option>
                      <option value="name-asc">Name A-Z</option>
                      <option value="name-desc">Name Z-A</option>
                      <option value="size-desc">Largest First</option>
                      <option value="size-asc">Smallest First</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Recent Files Section */}
              {!searchQuery && recentFiles.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium mb-2" style={{ color: 'var(--ig-text-primary)' }}>
                    Recent Files
                  </h3>
                  <div className="grid grid-cols-1 gap-1 mb-4">
                    {recentFiles.slice(0, 4).map((file) => (
                      <div
                        key={file.id}
                        onClick={() => handleExistingFileSelect(file)}
                        className={`p-1.5 rounded-lg border cursor-pointer transition-all duration-200 ${
                          fileSelection.selectedExistingFile?.id === file.id ? 'ring-1' : ''
                        }`}
                        style={{
                          background: fileSelection.selectedExistingFile?.id === file.id
                            ? 'var(--ig-surface-glass-dark)'
                            : 'var(--ig-surface-glass-light)',
                          border: `1px solid ${fileSelection.selectedExistingFile?.id === file.id
                            ? 'var(--ig-accent-primary)'
                            : 'var(--ig-border-glass)'}`,
                          outline: fileSelection.selectedExistingFile?.id === file.id
                            ? '1px solid var(--ig-accent-primary)'
                            : '1px solid transparent'
                        }}
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="p-1 rounded" style={{ background: 'var(--ig-surface-glass-dark)' }}>
                            {file.file_type.startsWith('image/') ? (
                              <svg className="w-3.5 h-3.5" style={{ color: 'var(--ig-text-accent)' }} fill="currentColor" viewBox="0 0 24 24">
                                <path d="M8.5,13.5L11,16.5L14.5,12L19,18H5M21,19V5C21,3.89 20.1,3 19,3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19Z" />
                              </svg>
                            ) : (
                              <svg className="w-3.5 h-3.5" style={{ color: 'var(--ig-text-accent)' }} fill="currentColor" viewBox="0 0 24 24">
                                <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                              </svg>
                            )}
                          </div>
                          <div className="flex-1 min-w-0 flex items-center justify-between">
                            <p className="text-sm font-medium truncate pr-2" style={{ color: 'var(--ig-text-primary)' }}>
                              {file.file_name}
                            </p>
                            <div className="flex items-center gap-2 text-xs whitespace-nowrap" style={{ color: 'var(--ig-text-muted)' }}>
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
                </div>
              )}

              {/* All Files List */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium" style={{ color: 'var(--ig-text-primary)' }}>
                    {searchQuery ? `Search Results (${filteredAndSortedFiles.length})` : `All Files (${filteredAndSortedFiles.length})`}
                  </h3>
                </div>

                {isLoadingFiles ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="w-6 h-6 border-2 border-current border-t-transparent rounded-full animate-spin"
                         style={{ color: 'var(--ig-accent-primary)' }}></div>
                  </div>
                ) : filteredAndSortedFiles.length > 0 ? (
                  <div className="space-y-1 max-h-80 overflow-y-auto">
                    {filteredAndSortedFiles.map((file) => (
                      <div
                        key={file.id}
                        onClick={() => handleExistingFileSelect(file)}
                        className={`p-2 rounded-lg border cursor-pointer transition-all duration-200 ${
                          fileSelection.selectedExistingFile?.id === file.id ? 'ring-2' : ''
                        }`}
                        style={{
                          background: fileSelection.selectedExistingFile?.id === file.id
                            ? 'var(--ig-surface-glass-dark)'
                            : 'var(--ig-surface-glass-light)',
                          border: `1px solid ${fileSelection.selectedExistingFile?.id === file.id
                            ? 'var(--ig-accent-primary)'
                            : 'var(--ig-border-glass)'}`,
                          outline: fileSelection.selectedExistingFile?.id === file.id
                            ? '1px solid var(--ig-accent-primary)'
                            : '1px solid transparent'
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
                        <div className="flex items-center gap-2.5">
                          <div className="p-1 rounded" style={{ background: 'var(--ig-surface-glass-dark)' }}>
                            {file.file_type.startsWith('image/') ? (
                              <svg className="w-3.5 h-3.5" style={{ color: 'var(--ig-text-accent)' }} fill="currentColor" viewBox="0 0 24 24">
                                <path d="M8.5,13.5L11,16.5L14.5,12L19,18H5M21,19V5C21,3.89 20.1,3 19,3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19Z" />
                              </svg>
                            ) : (
                              <svg className="w-3.5 h-3.5" style={{ color: 'var(--ig-text-accent)' }} fill="currentColor" viewBox="0 0 24 24">
                                <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                              </svg>
                            )}
                          </div>
                          <div className="flex-1 min-w-0 flex items-center justify-between gap-4">
                            <div className="min-w-0 flex-shrink">
                              <p className="text-sm font-medium truncate" style={{ color: 'var(--ig-text-primary)' }}>
                                {file.file_name}
                              </p>
                            </div>
                            <div className="flex items-center gap-3 flex-shrink-0">
                              {/* Metadata */}
                              <div className="flex items-center gap-2 text-xs whitespace-nowrap" style={{ color: 'var(--ig-text-muted)' }}>
                                <span>{formatFileSize(file.file_size)}</span>
                                <span>•</span>
                                <span>{formatDate(file.created_at)}</span>
                                {file.usage_count && file.usage_count > 0 && (
                                  <>
                                    <span>•</span>
                                    <span title={`Used in ${file.usage_count} conversation${file.usage_count > 1 ? 's' : ''}`}>
                                      {file.usage_count} use{file.usage_count > 1 ? 's' : ''}
                                    </span>
                                  </>
                                )}
                              </div>
                              {/* Conversation Tags */}
                              {file.conversations && file.conversations.length > 0 && (
                                <div className="flex items-center gap-1">
                                  {file.conversations.slice(0, 1).map((conv, index) => (
                                    <span
                                      key={conv.conversation_id}
                                      className="inline-block px-1.5 py-0.5 rounded text-xs"
                                      style={{
                                        background: 'var(--ig-surface-glass-dark)',
                                        color: 'var(--ig-text-muted)',
                                        border: '1px solid var(--ig-border-glass)'
                                      }}
                                      title={`Used in: ${conv.conversation_title}`}
                                    >
                                      {conv.conversation_title.length > 10
                                        ? `${conv.conversation_title.slice(0, 10)}...`
                                        : conv.conversation_title}
                                    </span>
                                  ))}
                                  {file.conversations.length > 1 && (
                                    <span
                                      className="inline-block px-1.5 py-0.5 rounded text-xs"
                                      style={{
                                        background: 'var(--ig-surface-glass-dark)',
                                        color: 'var(--ig-text-muted)',
                                        border: '1px solid var(--ig-border-glass)'
                                      }}
                                      title={`+${file.conversations.length - 1} more conversations`}
                                    >
                                      +{file.conversations.length - 1}
                                    </span>
                                  )}
                                </div>
                              )}
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