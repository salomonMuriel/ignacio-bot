import type { Project, ProjectStage, ProjectType } from '@/types';
import { useState } from 'react';

interface ProjectFormModalProps {
  project: Project | null;
  onClose: () => void;
  onSave: (project: any) => void;
}

export default function ProjectFormModal({
  project,
  onClose,
  onSave,
}: ProjectFormModalProps) {
  const [formData, setFormData] = useState({
    project_name: project?.project_name || '',
    description: project?.description || '',
    project_type: project?.project_type || ('startup' as ProjectType),
    current_stage: project?.current_stage || ('ideation' as ProjectStage),
    target_audience: project?.target_audience || '',
    problem_statement: project?.problem_statement || '',
    solution_approach: project?.solution_approach || '',
    business_model: project?.business_model || '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.project_name.trim()) return;

    setIsSubmitting(true);
    try {
      await onSave(formData);
    } catch (error) {
      console.error('Failed to save project:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      style={{
        background: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(5px)',
      }}
    >
      <div
        className="rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        style={{
          background: 'var(--ig-surface-primary)',
          border: '1px solid var(--ig-border-primary)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8)',
        }}
      >
        <div className="p-6">
          <h2
            className="text-xl font-semibold mb-6"
            style={{ color: 'var(--ig-text-primary)' }}
          >
            {project ? 'Edit Project' : 'Create New Project'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                className="block text-sm font-medium mb-1"
                style={{ color: 'var(--ig-text-accent)' }}
              >
                Project Name *
              </label>
              <input
                type="text"
                required
                value={formData.project_name}
                onChange={e =>
                  setFormData({ ...formData, project_name: e.target.value })
                }
                className="w-full p-3 rounded-lg transition-all duration-200"
                style={{
                  background: 'var(--ig-surface-glass)',
                  border: '1px solid var(--ig-border-primary)',
                  color: 'var(--ig-text-primary)',
                }}
                placeholder="Enter your project name"
              />
            </div>

            <div>
              <label
                className="block text-sm font-medium mb-1"
                style={{ color: 'var(--ig-text-accent)' }}
              >
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={e =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full p-3 rounded-lg transition-all duration-200"
                style={{
                  background: 'var(--ig-surface-glass)',
                  border: '1px solid var(--ig-border-primary)',
                  color: 'var(--ig-text-primary)',
                }}
                rows={3}
                placeholder="Describe your project"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  className="block text-sm font-medium mb-1"
                  style={{ color: 'var(--ig-text-accent)' }}
                >
                  Project Type
                </label>
                <select
                  value={formData.project_type}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      project_type: e.target.value as ProjectType,
                    })
                  }
                  className="w-full p-3 rounded-lg transition-all duration-200"
                  style={{
                    background: 'var(--ig-surface-glass)',
                    border: '1px solid var(--ig-border-primary)',
                    color: 'var(--ig-text-primary)',
                  }}
                >
                  <option value="startup">Startup</option>
                  <option value="ngo">NGO</option>
                  <option value="foundation">Foundation</option>
                  <option value="spinoff">Spinoff</option>
                  <option value="internal">Internal Project</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label
                  className="block text-sm font-medium mb-1"
                  style={{ color: 'var(--ig-text-accent)' }}
                >
                  Current Stage
                </label>
                <select
                  value={formData.current_stage}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      current_stage: e.target.value as ProjectStage,
                    })
                  }
                  className="w-full p-3 rounded-lg transition-all duration-200"
                  style={{
                    background: 'var(--ig-surface-glass)',
                    border: '1px solid var(--ig-border-primary)',
                    color: 'var(--ig-text-primary)',
                  }}
                >
                  <option value="ideation">Ideation</option>
                  <option value="research">Research</option>
                  <option value="validation">Validation</option>
                  <option value="development">Development</option>
                  <option value="testing">Testing</option>
                  <option value="launch">Launch</option>
                  <option value="growth">Growth</option>
                  <option value="mature">Mature</option>
                </select>
              </div>
            </div>

            <div>
              <label
                className="block text-sm font-medium mb-1"
                style={{ color: 'var(--ig-text-accent)' }}
              >
                Target Audience
              </label>
              <input
                type="text"
                value={formData.target_audience}
                onChange={e =>
                  setFormData({ ...formData, target_audience: e.target.value })
                }
                className="w-full p-3 rounded-lg transition-all duration-200"
                style={{
                  background: 'var(--ig-surface-glass)',
                  border: '1px solid var(--ig-border-primary)',
                  color: 'var(--ig-text-primary)',
                }}
                placeholder="Who is your target audience?"
              />
            </div>

            <div>
              <label
                className="block text-sm font-medium mb-1"
                style={{ color: 'var(--ig-text-accent)' }}
              >
                Problem Statement
              </label>
              <textarea
                value={formData.problem_statement}
                onChange={e =>
                  setFormData({
                    ...formData,
                    problem_statement: e.target.value,
                  })
                }
                className="w-full p-3 rounded-lg transition-all duration-200"
                style={{
                  background: 'var(--ig-surface-glass)',
                  border: '1px solid var(--ig-border-primary)',
                  color: 'var(--ig-text-primary)',
                }}
                rows={2}
                placeholder="What problem does your project solve?"
              />
            </div>

            <div>
              <label
                className="block text-sm font-medium mb-1"
                style={{ color: 'var(--ig-text-accent)' }}
              >
                Solution Approach
              </label>
              <textarea
                value={formData.solution_approach}
                onChange={e =>
                  setFormData({
                    ...formData,
                    solution_approach: e.target.value,
                  })
                }
                className="w-full p-3 rounded-lg transition-all duration-200"
                style={{
                  background: 'var(--ig-surface-glass)',
                  border: '1px solid var(--ig-border-primary)',
                  color: 'var(--ig-text-primary)',
                }}
                rows={2}
                placeholder="How do you plan to solve this problem?"
              />
            </div>

            <div>
              <label
                className="block text-sm font-medium mb-1"
                style={{ color: 'var(--ig-text-accent)' }}
              >
                Business Model
              </label>
              <textarea
                value={formData.business_model}
                onChange={e =>
                  setFormData({ ...formData, business_model: e.target.value })
                }
                className="w-full p-3 rounded-lg transition-all duration-200"
                style={{
                  background: 'var(--ig-surface-glass)',
                  border: '1px solid var(--ig-border-primary)',
                  color: 'var(--ig-text-primary)',
                }}
                rows={2}
                placeholder="How will your project generate value/revenue?"
              />
            </div>

            <div className="flex space-x-4 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-200"
                style={{
                  background: 'var(--ig-surface-secondary)',
                  color: 'var(--ig-text-primary)',
                  border: '1px solid var(--ig-border-primary)',
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!formData.project_name.trim() || isSubmitting}
                className="flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-200"
                style={{
                  background:
                    !formData.project_name.trim() || isSubmitting
                      ? 'rgba(89, 47, 126, 0.5)'
                      : 'var(--ig-accent-gradient)',
                  color:
                    !formData.project_name.trim() || isSubmitting
                      ? 'var(--ig-text-muted)'
                      : 'var(--ig-dark-primary)',
                  cursor:
                    !formData.project_name.trim() || isSubmitting
                      ? 'not-allowed'
                      : 'pointer',
                }}
              >
                {isSubmitting
                  ? 'Saving...'
                  : project
                    ? 'Update Project'
                    : 'Create Project'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
