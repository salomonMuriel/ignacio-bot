import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';
import type { PromptTemplate, PromptTemplateCreate, PromptTemplateUpdate } from '@/types';

export default function PromptTemplateManager() {
  const { user } = useAuth();
  const [templates, setTemplates] = useState<PromptTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<PromptTemplate | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableTags, setAvailableTags] = useState<string[]>([]);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    tags: [] as string[],
    is_active: true
  });

  // Load templates
  const loadTemplates = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [templatesData, tagsData] = await Promise.all([
        api.promptTemplates.getPromptTemplates(false), // Get both active and inactive
        api.promptTemplates.getAllTags()
      ]);
      setTemplates(templatesData);
      setAvailableTags(tagsData);
    } catch (err) {
      console.error('Failed to load prompt templates:', err);
      setError(err instanceof Error ? err.message : 'Failed to load templates');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTemplates();
  }, []);

  // Reset form
  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      tags: [],
      is_active: true
    });
    setEditingTemplate(null);
  };

  // Open modal for new template
  const handleCreateNew = () => {
    resetForm();
    setIsModalOpen(true);
  };

  // Open modal for editing
  const handleEdit = (template: PromptTemplate) => {
    setFormData({
      title: template.title,
      content: template.content,
      tags: [...template.tags],
      is_active: template.is_active
    });
    setEditingTemplate(template);
    setIsModalOpen(true);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    setIsSubmitting(true);
    try {
      if (editingTemplate) {
        // Update existing template
        const updateData: PromptTemplateUpdate = {
          title: formData.title,
          content: formData.content,
          tags: formData.tags,
          is_active: formData.is_active
        };
        await api.promptTemplates.updatePromptTemplate(editingTemplate.id, updateData, user.id);
      } else {
        // Create new template
        const createData: PromptTemplateCreate = {
          title: formData.title,
          content: formData.content,
          tags: formData.tags,
          created_by: user.id,
          is_active: formData.is_active
        };
        await api.promptTemplates.createPromptTemplate(createData);
      }

      setIsModalOpen(false);
      resetForm();
      await loadTemplates(); // Reload templates
    } catch (err) {
      console.error('Failed to save template:', err);
      setError(err instanceof Error ? err.message : 'Failed to save template');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle delete
  const handleDelete = async (template: PromptTemplate) => {
    if (!user?.id) return;
    
    if (!confirm(`Are you sure you want to delete "${template.title}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await api.promptTemplates.deletePromptTemplate(template.id, user.id);
      await loadTemplates(); // Reload templates
    } catch (err) {
      console.error('Failed to delete template:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete template');
    }
  };

  // Handle tag input
  const handleTagInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const input = e.currentTarget;
      const tag = input.value.trim().toLowerCase();
      if (tag && !formData.tags.includes(tag)) {
        setFormData(prev => ({
          ...prev,
          tags: [...prev.tags, tag]
        }));
      }
      input.value = '';
    }
  };

  // Remove tag
  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-8 h-8 border-4 border-current border-t-transparent rounded-full animate-spin" style={{ color: 'var(--ig-text-accent)' }}></div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-semibold" style={{ color: 'var(--ig-text-primary)' }}>
            Prompt Templates
          </h2>
          <p style={{ color: 'var(--ig-text-muted)' }}>
            Manage pre-made prompts that users can select in chat
          </p>
        </div>
        <button
          onClick={handleCreateNew}
          className="flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-300"
          style={{
            background: 'var(--ig-accent-gradient)',
            color: 'var(--ig-dark-primary)',
            boxShadow: 'var(--ig-shadow-md)'
          }}
          onMouseEnter={(e) => {
            const target = e.target as HTMLButtonElement;
            target.style.background = 'var(--ig-accent-gradient-hover)';
            target.style.transform = 'translateY(-1px)';
            target.style.boxShadow = 'var(--ig-shadow-lg)';
          }}
          onMouseLeave={(e) => {
            const target = e.target as HTMLButtonElement;
            target.style.background = 'var(--ig-accent-gradient)';
            target.style.transform = 'translateY(0)';
            target.style.boxShadow = 'var(--ig-shadow-md)';
          }}
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z" />
          </svg>
          <span>New Template</span>
        </button>
      </div>

      {/* Error display */}
      {error && (
        <div className="mb-6 p-4 rounded-lg" style={{
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          color: '#ef4444'
        }}>
          {error}
        </div>
      )}

      {/* Templates list */}
      <div className="space-y-4">
        {templates.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{
              background: 'var(--ig-surface-glass-light)',
              border: '2px solid var(--ig-border-glass)'
            }}>
              <svg className="w-8 h-8" fill="currentColor" style={{ color: 'var(--ig-text-muted)' }} viewBox="0 0 24 24">
                <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--ig-text-primary)' }}>
              No Templates Yet
            </h3>
            <p style={{ color: 'var(--ig-text-muted)' }}>
              Create your first prompt template to help users get started with common questions.
            </p>
          </div>
        ) : (
          templates.map((template) => (
            <div
              key={template.id}
              className="p-6 rounded-xl glass-surface border transition-all duration-300"
              style={{
                borderColor: 'var(--ig-border-glass)',
                backdropFilter: 'var(--ig-blur-lg)'
              }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold" style={{ color: 'var(--ig-text-primary)' }}>
                      {template.title}
                    </h3>
                    <div className="flex items-center space-x-2">
                      <span
                        className="px-2 py-1 text-xs rounded-full"
                        style={{
                          background: template.is_active
                            ? 'rgba(16, 185, 129, 0.2)'
                            : 'rgba(107, 114, 128, 0.2)',
                          color: template.is_active ? '#10b981' : '#6b7280'
                        }}
                      >
                        {template.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                  
                  <p className="mb-3" style={{ color: 'var(--ig-text-muted)' }}>
                    {template.content.length > 200 
                      ? `${template.content.substring(0, 200)}...` 
                      : template.content}
                  </p>
                  
                  {template.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {template.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 text-xs rounded-full"
                          style={{
                            background: 'var(--ig-surface-glass-light)',
                            color: 'var(--ig-text-accent)',
                            border: '1px solid var(--ig-border-glass)'
                          }}
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                  
                  <div className="text-sm" style={{ color: 'var(--ig-text-muted)' }}>
                    Created {new Date(template.created_at).toLocaleDateString()}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => handleEdit(template)}
                    className="p-2 rounded-lg transition-all duration-300"
                    style={{
                      background: 'var(--ig-surface-glass-light)',
                      border: '1px solid var(--ig-border-glass)',
                      color: 'var(--ig-text-primary)'
                    }}
                    onMouseEnter={(e) => {
                      const target = e.target as HTMLButtonElement;
                      target.style.background = 'var(--ig-surface-glass-dark)';
                      target.style.borderColor = 'var(--ig-border-accent)';
                      target.style.color = 'var(--ig-text-accent)';
                    }}
                    onMouseLeave={(e) => {
                      const target = e.target as HTMLButtonElement;
                      target.style.background = 'var(--ig-surface-glass-light)';
                      target.style.borderColor = 'var(--ig-border-glass)';
                      target.style.color = 'var(--ig-text-primary)';
                    }}
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDelete(template)}
                    className="p-2 rounded-lg transition-all duration-300"
                    style={{
                      background: 'var(--ig-surface-glass-light)',
                      border: '1px solid var(--ig-border-glass)',
                      color: 'var(--ig-text-primary)'
                    }}
                    onMouseEnter={(e) => {
                      const target = e.target as HTMLButtonElement;
                      target.style.background = 'rgba(239, 68, 68, 0.1)';
                      target.style.borderColor = '#ef4444';
                      target.style.color = '#ef4444';
                    }}
                    onMouseLeave={(e) => {
                      const target = e.target as HTMLButtonElement;
                      target.style.background = 'var(--ig-surface-glass-light)';
                      target.style.borderColor = 'var(--ig-border-glass)';
                      target.style.color = 'var(--ig-text-primary)';
                    }}
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0, 0, 0, 0.5)' }}>
          <div
            className="w-full max-w-2xl rounded-xl glass-surface border"
            style={{
              borderColor: 'var(--ig-border-glass)',
              backdropFilter: 'var(--ig-blur-lg)',
              maxHeight: '90vh',
              overflow: 'auto'
            }}
          >
            <form onSubmit={handleSubmit} className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold" style={{ color: 'var(--ig-text-primary)' }}>
                  {editingTemplate ? 'Edit Template' : 'Create New Template'}
                </h3>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 rounded-lg transition-all duration-300"
                  style={{
                    background: 'var(--ig-surface-glass-light)',
                    border: '1px solid var(--ig-border-glass)',
                    color: 'var(--ig-text-muted)'
                  }}
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--ig-text-primary)' }}>
                    Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    required
                    className="w-full p-3 rounded-lg transition-all duration-300"
                    style={{
                      background: 'var(--ig-surface-glass-dark)',
                      border: '1px solid var(--ig-border-glass)',
                      color: 'var(--ig-text-primary)'
                    }}
                    placeholder="e.g., Business Model Canvas Help"
                  />
                </div>

                {/* Content */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--ig-text-primary)' }}>
                    Content *
                  </label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                    required
                    rows={6}
                    className="w-full p-3 rounded-lg transition-all duration-300 resize-none"
                    style={{
                      background: 'var(--ig-surface-glass-dark)',
                      border: '1px solid var(--ig-border-glass)',
                      color: 'var(--ig-text-primary)'
                    }}
                    placeholder="Enter the prompt template content that users will see..."
                  />
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--ig-text-primary)' }}>
                    Tags
                  </label>
                  <input
                    type="text"
                    onKeyDown={handleTagInput}
                    className="w-full p-3 rounded-lg transition-all duration-300"
                    style={{
                      background: 'var(--ig-surface-glass-dark)',
                      border: '1px solid var(--ig-border-glass)',
                      color: 'var(--ig-text-primary)'
                    }}
                    placeholder="Type tags and press Enter (e.g., business, strategy, planning)"
                  />
                  {formData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.tags.map((tag) => (
                        <span
                          key={tag}
                          className="flex items-center space-x-1 px-2 py-1 text-sm rounded-full"
                          style={{
                            background: 'var(--ig-surface-glass-light)',
                            color: 'var(--ig-text-accent)',
                            border: '1px solid var(--ig-border-glass)'
                          }}
                        >
                          <span>#{tag}</span>
                          <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="text-xs hover:text-red-400"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Active toggle */}
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                    className="w-4 h-4 rounded"
                  />
                  <label htmlFor="is_active" className="text-sm" style={{ color: 'var(--ig-text-primary)' }}>
                    Active (visible to users)
                  </label>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg font-medium transition-all duration-300"
                  style={{
                    background: 'var(--ig-surface-glass-light)',
                    border: '1px solid var(--ig-border-glass)',
                    color: 'var(--ig-text-primary)'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !formData.title.trim() || !formData.content.trim()}
                  className="px-4 py-2 rounded-lg font-medium transition-all duration-300 flex items-center space-x-2"
                  style={{
                    background: (!formData.title.trim() || !formData.content.trim() || isSubmitting)
                      ? 'var(--ig-surface-glass-light)'
                      : 'var(--ig-accent-gradient)',
                    color: (!formData.title.trim() || !formData.content.trim() || isSubmitting)
                      ? 'var(--ig-text-muted)'
                      : 'var(--ig-dark-primary)',
                    cursor: (!formData.title.trim() || !formData.content.trim() || isSubmitting) 
                      ? 'not-allowed' : 'pointer'
                  }}
                >
                  {isSubmitting && (
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                  )}
                  <span>{editingTemplate ? 'Update' : 'Create'} Template</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}