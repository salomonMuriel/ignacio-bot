import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useProjects } from '../contexts/ProjectsContext';
import { useNavigate } from 'react-router-dom';
import { type Project, ProjectType, ProjectStage } from '../types';

export default function ProjectsPage() {
  const { user } = useAuth();
  const { 
    projects, 
    activeProject, 
    setActiveProject, 
    createProject, 
    updateProject, 
    deleteProject,
    isLoading 
  } = useProjects();
  const navigate = useNavigate();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--ig-bg-gradient)' }}>
        <div className="text-lg" style={{ color: 'var(--ig-text-primary)' }}>Please log in to manage projects.</div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--ig-bg-gradient)' }}>
        <div className="text-lg" style={{ color: 'var(--ig-text-primary)' }}>Loading projects...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--ig-bg-gradient)' }}>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold" style={{ color: 'var(--ig-text-primary)' }}>My Projects</h1>
              <p className="mt-2" style={{ color: 'var(--ig-text-secondary)' }}>
                Manage your projects and continue your conversations with Ignacio
              </p>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => navigate('/chat')}
                disabled={!activeProject}
                className="px-4 py-2 rounded-lg font-medium transition-all duration-200"
                style={{
                  background: !activeProject
                    ? 'rgba(89, 47, 126, 0.5)'
                    : 'var(--ig-surface-secondary)',
                  color: !activeProject
                    ? 'var(--ig-text-muted)'
                    : 'var(--ig-text-primary)',
                  border: '1px solid var(--ig-border-primary)',
                  cursor: !activeProject ? 'not-allowed' : 'pointer'
                }}
                onMouseEnter={(e) => {
                  if (activeProject) {
                    (e.target as HTMLButtonElement).style.background = 'var(--ig-surface-glass)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeProject) {
                    (e.target as HTMLButtonElement).style.background = 'var(--ig-surface-secondary)';
                  }
                }}
              >
                Go to Chat
              </button>
              <button
                onClick={() => setShowCreateForm(true)}
                className="px-4 py-2 rounded-lg font-medium transition-all duration-200"
                style={{
                  background: 'var(--ig-accent-gradient)',
                  color: 'var(--ig-dark-primary)'
                }}
                onMouseEnter={(e) => (e.target as HTMLButtonElement).style.background = 'var(--ig-accent-gradient-hover)'}
                onMouseLeave={(e) => (e.target as HTMLButtonElement).style.background = 'var(--ig-accent-gradient)'}
              >
                New Project
              </button>
            </div>
          </div>
        </div>

        {/* Active Project Banner */}
        {activeProject && (
          <div className="rounded-lg p-4 mb-8" style={{
            background: 'var(--ig-surface-glass)',
            border: '1px solid var(--ig-border-accent)',
            backdropFilter: 'blur(10px)'
          }}>
            <h2 className="font-semibold mb-2" style={{ color: 'var(--ig-text-accent)' }}>Active Project</h2>
            <p style={{ color: 'var(--ig-text-primary)' }}>{activeProject.project_name}</p>
            {activeProject.description && (
              <p className="text-sm mt-1" style={{ color: 'var(--ig-text-secondary)' }}>{activeProject.description}</p>
            )}
          </div>
        )}

        {/* Projects Grid */}
        {projects.length === 0 ? (
          <div className="text-center py-16">
            <div className="rounded-lg p-8 max-w-md mx-auto" style={{
              background: 'var(--ig-surface-glass)',
              border: '1px solid var(--ig-border-glass)',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
            }}>
              <h3 className="text-lg font-medium mb-4" style={{ color: 'var(--ig-text-primary)' }}>No Projects Yet</h3>
              <p className="mb-6" style={{ color: 'var(--ig-text-secondary)' }}>
                Create your first project to start working with Ignacio on your ideas.
              </p>
              <button
                onClick={() => setShowCreateForm(true)}
                className="px-6 py-3 rounded-lg font-medium transition-all duration-200"
                style={{
                  background: 'var(--ig-accent-gradient)',
                  color: 'var(--ig-dark-primary)'
                }}
              >
                Create Your First Project
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                isActive={activeProject?.id === project.id}
                onSetActive={() => setActiveProject(project)}
                onEdit={() => setEditingProject(project)}
                onDelete={() => deleteProject(project.id)}
              />
            ))}
          </div>
        )}

        {/* Create/Edit Project Modal */}
        {(showCreateForm || editingProject) && (
          <ProjectFormModal
            project={editingProject}
            onClose={() => {
              setShowCreateForm(false);
              setEditingProject(null);
            }}
            onSave={async (projectData) => {
              if (editingProject) {
                await updateProject(editingProject.id, projectData);
              } else {
                const newProject = await createProject(projectData);
                if (projects.length === 0) {
                  // If this is the first project, set it as active and redirect to chat
                  setActiveProject(newProject);
                  navigate('/chat');
                }
              }
              setShowCreateForm(false);
              setEditingProject(null);
            }}
          />
        )}
      </div>
    </div>
  );
}

interface ProjectCardProps {
  project: Project;
  isActive: boolean;
  onSetActive: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

function ProjectCard({ project, isActive, onSetActive, onEdit, onDelete }: ProjectCardProps) {
  return (
    <div className="rounded-lg transition-all duration-200" style={{
      background: 'var(--ig-surface-glass)',
      border: isActive ? '2px solid var(--ig-border-accent)' : '1px solid var(--ig-border-glass)',
      backdropFilter: 'blur(10px)',
      boxShadow: isActive
        ? '0 25px 50px -12px rgba(219, 105, 52, 0.3)'
        : '0 25px 50px -12px rgba(0, 0, 0, 0.3)'
    }}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold truncate" style={{ color: 'var(--ig-text-primary)' }}>
            {project.project_name}
          </h3>
          {isActive && (
            <span className="text-xs font-medium px-2.5 py-0.5 rounded-full" style={{
              background: 'var(--ig-accent-gradient)',
              color: 'var(--ig-dark-primary)'
            }}>
              Active
            </span>
          )}
        </div>
        
        {project.description && (
          <p className="text-sm mb-4 line-clamp-3" style={{ color: 'var(--ig-text-secondary)' }}>{project.description}</p>
        )}
        
        <div className="space-y-2 mb-4">
          {project.project_type && (
            <div className="flex items-center text-sm">
              <span style={{ color: 'var(--ig-text-muted)' }}>Type:</span>
              <span className="ml-2 capitalize" style={{ color: 'var(--ig-text-primary)' }}>{project.project_type}</span>
            </div>
          )}
          {project.current_stage && (
            <div className="flex items-center text-sm">
              <span style={{ color: 'var(--ig-text-muted)' }}>Stage:</span>
              <span className="ml-2 capitalize" style={{ color: 'var(--ig-text-primary)' }}>{project.current_stage}</span>
            </div>
          )}
        </div>
        
        <div className="flex space-x-2">
          {!isActive && (
            <button
              onClick={onSetActive}
              className="flex-1 py-2 px-3 rounded text-sm font-medium transition-all duration-200"
              style={{
                background: 'var(--ig-accent-gradient)',
                color: 'var(--ig-dark-primary)'
              }}
            >
              Set Active
            </button>
          )}
          <button
            onClick={onEdit}
            className="py-2 px-3 rounded text-sm font-medium transition-all duration-200"
            style={{
              background: 'var(--ig-surface-secondary)',
              color: 'var(--ig-text-primary)',
              border: '1px solid var(--ig-border-primary)'
            }}
          >
            Edit
          </button>
          <button
            onClick={onDelete}
            className="py-2 px-3 rounded text-sm font-medium transition-all duration-200"
            style={{
              background: 'rgba(239, 68, 68, 0.1)',
              color: '#ef4444',
              border: '1px solid rgba(239, 68, 68, 0.3)'
            }}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

interface ProjectFormModalProps {
  project: Project | null;
  onClose: () => void;
  onSave: (project: any) => void;
}

function ProjectFormModal({ project, onClose, onSave }: ProjectFormModalProps) {
  const [formData, setFormData] = useState({
    project_name: project?.project_name || '',
    description: project?.description || '',
    project_type: project?.project_type || 'startup' as ProjectType,
    current_stage: project?.current_stage || 'ideation' as ProjectStage,
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
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{
      background: 'rgba(0, 0, 0, 0.7)',
      backdropFilter: 'blur(5px)'
    }}>
      <div className="rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto" style={{
        background: 'var(--ig-surface-primary)',
        border: '1px solid var(--ig-border-primary)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8)'
      }}>
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-6" style={{ color: 'var(--ig-text-primary)' }}>
            {project ? 'Edit Project' : 'Create New Project'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--ig-text-accent)' }}>
                Project Name *
              </label>
              <input
                type="text"
                required
                value={formData.project_name}
                onChange={(e) => setFormData({ ...formData, project_name: e.target.value })}
                className="w-full p-3 rounded-lg transition-all duration-200"
                style={{
                  background: 'var(--ig-surface-glass)',
                  border: '1px solid var(--ig-border-primary)',
                  color: 'var(--ig-text-primary)'
                }}
                placeholder="Enter your project name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--ig-text-accent)' }}>
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full p-3 rounded-lg transition-all duration-200"
                style={{
                  background: 'var(--ig-surface-glass)',
                  border: '1px solid var(--ig-border-primary)',
                  color: 'var(--ig-text-primary)'
                }}
                rows={3}
                placeholder="Describe your project"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--ig-text-accent)' }}>
                  Project Type
                </label>
                <select
                  value={formData.project_type}
                  onChange={(e) => setFormData({ ...formData, project_type: e.target.value as ProjectType })}
                  className="w-full p-3 rounded-lg transition-all duration-200"
                  style={{
                    background: 'var(--ig-surface-glass)',
                    border: '1px solid var(--ig-border-primary)',
                    color: 'var(--ig-text-primary)'
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
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--ig-text-accent)' }}>
                  Current Stage
                </label>
                <select
                  value={formData.current_stage}
                  onChange={(e) => setFormData({ ...formData, current_stage: e.target.value as ProjectStage })}
                  className="w-full p-3 rounded-lg transition-all duration-200"
                  style={{
                    background: 'var(--ig-surface-glass)',
                    border: '1px solid var(--ig-border-primary)',
                    color: 'var(--ig-text-primary)'
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
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--ig-text-accent)' }}>
                Target Audience
              </label>
              <input
                type="text"
                value={formData.target_audience}
                onChange={(e) => setFormData({ ...formData, target_audience: e.target.value })}
                className="w-full p-3 rounded-lg transition-all duration-200"
                style={{
                  background: 'var(--ig-surface-glass)',
                  border: '1px solid var(--ig-border-primary)',
                  color: 'var(--ig-text-primary)'
                }}
                placeholder="Who is your target audience?"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--ig-text-accent)' }}>
                Problem Statement
              </label>
              <textarea
                value={formData.problem_statement}
                onChange={(e) => setFormData({ ...formData, problem_statement: e.target.value })}
                className="w-full p-3 rounded-lg transition-all duration-200"
                style={{
                  background: 'var(--ig-surface-glass)',
                  border: '1px solid var(--ig-border-primary)',
                  color: 'var(--ig-text-primary)'
                }}
                rows={2}
                placeholder="What problem does your project solve?"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--ig-text-accent)' }}>
                Solution Approach
              </label>
              <textarea
                value={formData.solution_approach}
                onChange={(e) => setFormData({ ...formData, solution_approach: e.target.value })}
                className="w-full p-3 rounded-lg transition-all duration-200"
                style={{
                  background: 'var(--ig-surface-glass)',
                  border: '1px solid var(--ig-border-primary)',
                  color: 'var(--ig-text-primary)'
                }}
                rows={2}
                placeholder="How do you plan to solve this problem?"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--ig-text-accent)' }}>
                Business Model
              </label>
              <textarea
                value={formData.business_model}
                onChange={(e) => setFormData({ ...formData, business_model: e.target.value })}
                className="w-full p-3 rounded-lg transition-all duration-200"
                style={{
                  background: 'var(--ig-surface-glass)',
                  border: '1px solid var(--ig-border-primary)',
                  color: 'var(--ig-text-primary)'
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
                  border: '1px solid var(--ig-border-primary)'
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!formData.project_name.trim() || isSubmitting}
                className="flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-200"
                style={{
                  background: !formData.project_name.trim() || isSubmitting
                    ? 'rgba(89, 47, 126, 0.5)'
                    : 'var(--ig-accent-gradient)',
                  color: !formData.project_name.trim() || isSubmitting
                    ? 'var(--ig-text-muted)'
                    : 'var(--ig-dark-primary)',
                  cursor: !formData.project_name.trim() || isSubmitting ? 'not-allowed' : 'pointer'
                }}
              >
                {isSubmitting ? 'Saving...' : (project ? 'Update Project' : 'Create Project')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}