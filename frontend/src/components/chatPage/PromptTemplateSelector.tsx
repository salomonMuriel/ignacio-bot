import React, { useState, useEffect, useRef } from 'react';
import { api } from '../../services/api';
import type { PromptTemplate } from '@/types';

interface PromptTemplateSelectorProps {
  onTemplateSelect: (template: PromptTemplate) => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function PromptTemplateSelector({ 
  onTemplateSelect, 
  isOpen, 
  onClose 
}: PromptTemplateSelectorProps) {
  const [templates, setTemplates] = useState<PromptTemplate[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<PromptTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const modalRef = useRef<HTMLDivElement>(null);

  // Load templates when component mounts or opens
  useEffect(() => {
    if (isOpen && templates.length === 0) {
      loadTemplates();
    }
  }, [isOpen]);

  // Filter templates based on search and tags
  useEffect(() => {
    let filtered = templates;

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(template => 
        template.title.toLowerCase().includes(query) ||
        template.content.toLowerCase().includes(query) ||
        template.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Filter by selected tags
    if (selectedTags.length > 0) {
      filtered = filtered.filter(template =>
        selectedTags.some(selectedTag => template.tags.includes(selectedTag))
      );
    }

    setFilteredTemplates(filtered);
  }, [templates, searchQuery, selectedTags]);

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

  const loadTemplates = async () => {
    try {
      setIsLoading(true);
      const [templatesData, tagsData] = await Promise.all([
        api.promptTemplates.getPromptTemplates(true), // Only active templates
        api.promptTemplates.getAllTags()
      ]);
      setTemplates(templatesData);
      setAvailableTags(tagsData);
    } catch (err) {
      console.error('Failed to load prompt templates:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTemplateSelect = (template: PromptTemplate) => {
    onTemplateSelect(template);
    onClose();
    // Reset state
    setSearchQuery('');
    setSelectedTags([]);
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0, 0, 0, 0.5)' }}>
      <div
        ref={modalRef}
        className="w-full max-w-4xl h-full max-h-[90vh] rounded-xl glass-surface border flex flex-col"
        style={{
          borderColor: 'var(--ig-border-glass)',
          backdropFilter: 'var(--ig-blur-lg)'
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: 'var(--ig-border-glass)' }}>
          <div>
            <h3 className="text-xl font-semibold" style={{ color: 'var(--ig-text-primary)' }}>
              Choose a Prompt Template
            </h3>
            <p className="text-sm" style={{ color: 'var(--ig-text-muted)' }}>
              Select a pre-made prompt to help get your conversation started
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

        {/* Search and Filters */}
        <div className="p-6 border-b" style={{ borderColor: 'var(--ig-border-glass)' }}>
          {/* Search */}
          <div className="mb-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search templates..."
              className="w-full p-3 rounded-lg transition-all duration-300"
              style={{
                background: 'var(--ig-surface-glass-dark)',
                border: '1px solid var(--ig-border-glass)',
                color: 'var(--ig-text-primary)'
              }}
            />
          </div>

          {/* Tag filters */}
          {availableTags.length > 0 && (
            <div>
              <div className="text-sm font-medium mb-2" style={{ color: 'var(--ig-text-primary)' }}>
                Filter by tags:
              </div>
              <div className="flex flex-wrap gap-2">
                {availableTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className="px-3 py-1 text-sm rounded-full transition-all duration-300"
                    style={{
                      background: selectedTags.includes(tag)
                        ? 'var(--ig-accent-gradient)'
                        : 'var(--ig-surface-glass-light)',
                      color: selectedTags.includes(tag)
                        ? 'var(--ig-dark-primary)'
                        : 'var(--ig-text-primary)',
                      border: '1px solid var(--ig-border-glass)'
                    }}
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Templates List */}
        <div className="flex-1 overflow-auto p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-8 h-8 border-4 border-current border-t-transparent rounded-full animate-spin" style={{ color: 'var(--ig-text-accent)' }}></div>
            </div>
          ) : filteredTemplates.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{
                background: 'var(--ig-surface-glass-light)',
                border: '2px solid var(--ig-border-glass)'
              }}>
                <svg className="w-8 h-8" fill="currentColor" style={{ color: 'var(--ig-text-muted)' }} viewBox="0 0 24 24">
                  <path d="M15.5,14H20.5L22,15.5V20.5L20.5,22H15.5L14,20.5V15.5L15.5,14M16,16V20H20V16H16M11,2V8H17V16H15.5L14,14.5V10H13V8.5L14.5,7H16V4H13V2H11M7,2V4H4V16H2V2H7M9,6V8H7V6H9M9,10V12H7V10H9M9,14V16H7V14H9Z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--ig-text-primary)' }}>
                {searchQuery || selectedTags.length > 0 ? 'No templates found' : 'No templates available'}
              </h3>
              <p style={{ color: 'var(--ig-text-muted)' }}>
                {searchQuery || selectedTags.length > 0 
                  ? 'Try adjusting your search or filter criteria.'
                  : 'There are no prompt templates available at the moment.'}
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredTemplates.map((template) => (
                <div
                  key={template.id}
                  onClick={() => handleTemplateSelect(template)}
                  className="p-4 rounded-lg glass-surface border cursor-pointer transition-all duration-300 hover:scale-[1.02]"
                  style={{
                    borderColor: 'var(--ig-border-glass)',
                    backdropFilter: 'var(--ig-blur-sm)'
                  }}
                  onMouseEnter={(e) => {
                    const target = e.currentTarget as HTMLDivElement;
                    target.style.borderColor = 'var(--ig-border-accent)';
                    target.style.boxShadow = 'var(--ig-shadow-md), var(--ig-shadow-glow)';
                  }}
                  onMouseLeave={(e) => {
                    const target = e.currentTarget as HTMLDivElement;
                    target.style.borderColor = 'var(--ig-border-glass)';
                    target.style.boxShadow = 'none';
                  }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold" style={{ color: 'var(--ig-text-primary)' }}>
                      {template.title}
                    </h4>
                    <div className="flex items-center space-x-2 ml-4">
                      <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" style={{ color: 'var(--ig-text-accent)' }} viewBox="0 0 24 24">
                        <path d="M4,11V13H16L10.5,18.5L11.92,19.92L19.84,12L11.92,4.08L10.5,5.5L16,11H4Z" />
                      </svg>
                    </div>
                  </div>
                  
                  <p className="text-sm mb-3" style={{ color: 'var(--ig-text-muted)' }}>
                    {template.content.length > 150 
                      ? `${template.content.substring(0, 150)}...` 
                      : template.content}
                  </p>
                  
                  {template.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {template.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 text-xs rounded-full"
                          style={{
                            background: selectedTags.includes(tag)
                              ? 'var(--ig-accent-gradient)'
                              : 'var(--ig-surface-glass-light)',
                            color: selectedTags.includes(tag)
                              ? 'var(--ig-dark-primary)'
                              : 'var(--ig-text-accent)',
                            border: '1px solid var(--ig-border-glass)'
                          }}
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t" style={{ borderColor: 'var(--ig-border-glass)' }}>
          <div className="flex items-center justify-between">
            <div className="text-sm" style={{ color: 'var(--ig-text-muted)' }}>
              {filteredTemplates.length} template{filteredTemplates.length !== 1 ? 's' : ''} available
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg font-medium transition-all duration-300"
              style={{
                background: 'var(--ig-surface-glass-light)',
                border: '1px solid var(--ig-border-glass)',
                color: 'var(--ig-text-primary)'
              }}
              onMouseEnter={(e) => {
                const target = e.target as HTMLButtonElement;
                target.style.background = 'var(--ig-surface-glass-dark)';
                target.style.borderColor = 'var(--ig-border-accent)';
              }}
              onMouseLeave={(e) => {
                const target = e.target as HTMLButtonElement;
                target.style.background = 'var(--ig-surface-glass-light)';
                target.style.borderColor = 'var(--ig-border-glass)';
              }}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}