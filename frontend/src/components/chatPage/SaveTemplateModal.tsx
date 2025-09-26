import React, { useState, useRef, useEffect } from 'react';
import { useApi } from '@/hooks/useApi';
import { useAuth0 } from '@auth0/auth0-react';
import { useUserProfile } from '@/contexts/UserProfileContext';
import type { PromptTemplateCreate, TemplateType } from '@/types';
import LoadingScreen from '../ui/LoadingScreen';

interface SaveTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  initialContent: string;
  onTemplateCreated?: () => void; // Callback to refresh template list
}

export default function SaveTemplateModal({
  isOpen,
  onClose,
  onSaved,
  initialContent,
  onTemplateCreated
}: SaveTemplateModalProps) {
  const { isAuthenticated, isLoading: authLoading } = useAuth0();
  const { user, isAdmin, isLoading: profileLoading } = useUserProfile();
  const api = useApi();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState(initialContent);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [templateType, setTemplateType] = useState<TemplateType>('user' as TemplateType);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);

  if (authLoading || profileLoading) {
    return <LoadingScreen />;
  }

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setTitle('');
      setContent(initialContent);
      setTags([]);
      setTagInput('');
      setTemplateType('user' as TemplateType);
      setError(null);
      // Focus title input when modal opens
      setTimeout(() => {
        titleInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen, initialContent]);

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
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
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag();
    } else if (e.key === 'Backspace' && tagInput === '' && tags.length > 0) {
      // Remove last tag when backspacing with empty input
      setTags(prev => prev.slice(0, -1));
    }
  };

  const addTag = () => {
    const trimmedTag = tagInput.trim().toLowerCase();
    if (trimmedTag && !tags.includes(trimmedTag) && tags.length < 10) {
      setTags(prev => [...prev, trimmedTag]);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(prev => prev.filter(tag => tag !== tagToRemove));
  };

  const handleSave = async () => {
    if (!isAuthenticated || !user) {
      setError('You must be logged in to save templates');
      return;
    }

    if (!title.trim()) {
      setError('Please enter a title for your template');
      return;
    }

    if (!content.trim()) {
      setError('Template content cannot be empty');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const templateData: PromptTemplateCreate = {
        title: title.trim(),
        content: content.trim(),
        tags: tags,
        is_active: true,
        template_type: templateType
      };

      await api.createPromptTemplate(templateData);
      onTemplateCreated?.(); // Refresh template list
      onSaved();
    } catch (err) {
      console.error('Failed to save template:', err);
      setError(err instanceof Error ? err.message : 'Failed to save template. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0, 0, 0, 0.5)' }}>
      <div
        ref={modalRef}
        className="w-full max-w-2xl rounded-xl glass-surface border"
        style={{
          borderColor: 'var(--ig-border-glass)',
          backdropFilter: 'var(--ig-blur-lg)',
          maxHeight: '90vh',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: 'var(--ig-border-glass)' }}>
          <div>
            <h3 className="text-xl font-semibold" style={{ color: 'var(--ig-text-primary)' }}>
              Save as Template
            </h3>
            <p className="text-sm" style={{ color: 'var(--ig-text-muted)' }}>
              Save your message as a reusable prompt template
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg transition-all duration-300"
            style={{
              background: 'var(--ig-surface-glass-light)',
              border: '1px solid var(--ig-border-glass)',
              color: 'var(--ig-text-muted)'
            }}
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
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6 space-y-4">
          {/* Error message */}
          {error && (
            <div className="p-3 rounded-lg" style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#ef4444'
            }}>
              {error}
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--ig-text-primary)' }}>
              Template Title*
            </label>
            <input
              ref={titleInputRef}
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter a descriptive title for your template"
              className="w-full p-3 rounded-lg transition-all duration-300"
              style={{
                background: 'var(--ig-surface-glass-dark)',
                border: '1px solid var(--ig-border-glass)',
                color: 'var(--ig-text-primary)'
              }}
              maxLength={100}
              onFocus={(e) => {
                const target = e.target as HTMLInputElement;
                target.style.borderColor = 'var(--ig-border-accent)';
                target.style.boxShadow = 'var(--ig-shadow-md), var(--ig-shadow-glow)';
              }}
              onBlur={(e) => {
                const target = e.target as HTMLInputElement;
                target.style.borderColor = 'var(--ig-border-glass)';
                target.style.boxShadow = 'none';
              }}
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--ig-text-primary)' }}>
              Tags
            </label>
            <div className="space-y-2">
              {/* Tag display */}
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full"
                      style={{
                        background: 'var(--ig-accent-gradient)',
                        color: 'var(--ig-dark-primary)'
                      }}
                    >
                      #{tag}
                      <button
                        onClick={() => removeTag(tag)}
                        className="ml-1 hover:opacity-70 transition-opacity"
                      >
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
                        </svg>
                      </button>
                    </span>
                  ))}
                </div>
              )}
              
              {/* Tag input */}
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagInputKeyDown}
                placeholder={tags.length === 0 ? "Type tags and press Enter (e.g., marketing, strategy)" : "Add another tag..."}
                className="w-full p-3 rounded-lg transition-all duration-300"
                style={{
                  background: 'var(--ig-surface-glass-dark)',
                  border: '1px solid var(--ig-border-glass)',
                  color: 'var(--ig-text-primary)'
                }}
                maxLength={20}
                disabled={tags.length >= 10}
                onFocus={(e) => {
                  const target = e.target as HTMLInputElement;
                  target.style.borderColor = 'var(--ig-border-accent)';
                  target.style.boxShadow = 'var(--ig-shadow-md), var(--ig-shadow-glow)';
                }}
                onBlur={(e) => {
                  const target = e.target as HTMLInputElement;
                  target.style.borderColor = 'var(--ig-border-glass)';
                  target.style.boxShadow = 'none';
                  addTag();
                }}
              />
              <p className="text-xs" style={{ color: 'var(--ig-text-muted)' }}>
                Press Enter or comma to add tags • Maximum 10 tags • {tags.length}/10
              </p>
            </div>
          </div>

          {/* Template type selector (admin only) */}
          {isAdmin && (
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--ig-text-primary)' }}>
                Template Type
              </label>
              <div className="space-y-2">
                <div className="flex items-center space-x-3">
                  <input
                    type="radio"
                    id="save_template_type_user"
                    name="save_template_type"
                    value="user"
                    checked={templateType === 'user'}
                    onChange={(e) => setTemplateType(e.target.value as TemplateType)}
                    className="w-4 h-4"
                  />
                  <label htmlFor="save_template_type_user" className="text-sm" style={{ color: 'var(--ig-text-primary)' }}>
                    <span className="font-medium">Personal Template</span>
                    <div className="text-xs" style={{ color: 'var(--ig-text-muted)' }}>
                      Only visible to you
                    </div>
                  </label>
                </div>
                <div className="flex items-center space-x-3">
                  <input
                    type="radio"
                    id="save_template_type_admin"
                    name="save_template_type"
                    value="admin"
                    checked={templateType === 'admin'}
                    onChange={(e) => setTemplateType(e.target.value as TemplateType)}
                    className="w-4 h-4"
                  />
                  <label htmlFor="save_template_type_admin" className="text-sm" style={{ color: 'var(--ig-text-primary)' }}>
                    <span className="font-medium">Curated Template</span>
                    <div className="text-xs" style={{ color: 'var(--ig-text-muted)' }}>
                      Visible to all system users
                    </div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Content preview */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--ig-text-primary)' }}>
              Template Content*
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={Math.min(Math.max(content.split('\n').length, 4), 8)}
              className="w-full p-3 rounded-lg resize-none transition-all duration-300"
              style={{
                background: 'var(--ig-surface-glass-dark)',
                border: '1px solid var(--ig-border-glass)',
                color: 'var(--ig-text-primary)'
              }}
              placeholder="Your template content will appear here..."
              onFocus={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.borderColor = 'var(--ig-border-accent)';
                target.style.boxShadow = 'var(--ig-shadow-md), var(--ig-shadow-glow)';
              }}
              onBlur={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.borderColor = 'var(--ig-border-glass)';
                target.style.boxShadow = 'none';
              }}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t" style={{ borderColor: 'var(--ig-border-glass)' }}>
          <div className="flex items-center justify-between">
            <div className="text-sm" style={{ color: 'var(--ig-text-muted)' }}>
              This template will be saved to your personal collection
            </div>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                disabled={isLoading}
                className="px-4 py-2 rounded-lg font-medium transition-all duration-300"
                style={{
                  background: 'var(--ig-surface-glass-light)',
                  border: '1px solid var(--ig-border-glass)',
                  color: 'var(--ig-text-primary)'
                }}
                onMouseEnter={(e) => {
                  if (!isLoading) {
                    const target = e.target as HTMLButtonElement;
                    target.style.background = 'var(--ig-surface-glass-dark)';
                    target.style.borderColor = 'var(--ig-border-accent)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isLoading) {
                    const target = e.target as HTMLButtonElement;
                    target.style.background = 'var(--ig-surface-glass-light)';
                    target.style.borderColor = 'var(--ig-border-glass)';
                  }
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!title.trim() || !content.trim() || isLoading}
                className="px-6 py-2 rounded-lg font-medium transition-all duration-300 flex items-center gap-2"
                style={{
                  background: !title.trim() || !content.trim() || isLoading
                    ? 'var(--ig-surface-glass-light)'
                    : 'var(--ig-accent-gradient)',
                  color: !title.trim() || !content.trim() || isLoading
                    ? 'var(--ig-text-muted)'
                    : 'var(--ig-dark-primary)',
                  cursor: !title.trim() || !content.trim() || isLoading ? 'not-allowed' : 'pointer',
                  border: '1px solid transparent',
                  boxShadow: !title.trim() || !content.trim() || isLoading ? 'none' : 'var(--ig-shadow-md)'
                }}
                onMouseEnter={(e) => {
                  if (title.trim() && content.trim() && !isLoading) {
                    const target = e.target as HTMLButtonElement;
                    target.style.background = 'var(--ig-accent-gradient-hover)';
                    target.style.transform = 'translateY(-1px)';
                    target.style.boxShadow = 'var(--ig-shadow-lg), var(--ig-shadow-glow)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (title.trim() && content.trim() && !isLoading) {
                    const target = e.target as HTMLButtonElement;
                    target.style.background = 'var(--ig-accent-gradient)';
                    target.style.transform = 'translateY(0)';
                    target.style.boxShadow = 'var(--ig-shadow-md)';
                  }
                }}
              >
                {isLoading && (
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                )}
                {isLoading ? 'Saving...' : 'Save Template'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}