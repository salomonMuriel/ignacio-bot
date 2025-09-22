import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useProjects } from '../contexts/ProjectsContext';
import { useNavigate } from 'react-router-dom';
import { type Project } from '../types';
import ProjectCard from '@/components/projectsPage/ProjectCard';
import ProjectFormModal from '@/components/projectsPage/ProjectForm';
import LoadingScreen from '@/components/ui/LoadingScreen';

export default function ProjectsPage() {
  const { user } = useAuth();
  const {
    projects,
    activeProject,
    setActiveProject,
    createProject,
    updateProject,
    deleteProject,
    isLoading,
  } = useProjects();
  const navigate = useNavigate();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  if (!user) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: 'var(--ig-bg-gradient)' }}
      >
        <div className="text-lg" style={{ color: 'var(--ig-text-primary)' }}>
          Please log in to manage projects.
        </div>
      </div>
    );
  }

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div
      className="min-h-screen"
      style={{ background: 'var(--ig-bg-gradient)' }}
    >
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1
                className="text-3xl font-bold"
                style={{ color: 'var(--ig-text-primary)' }}
              >
                My Projects
              </h1>
              <p className="mt-2" style={{ color: 'var(--ig-text-secondary)' }}>
                Manage your projects and continue your conversations with
                Ignacio
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
                  cursor: !activeProject ? 'not-allowed' : 'pointer',
                }}
                onMouseEnter={e => {
                  if (activeProject) {
                    (e.target as HTMLButtonElement).style.background =
                      'var(--ig-surface-glass)';
                  }
                }}
                onMouseLeave={e => {
                  if (activeProject) {
                    (e.target as HTMLButtonElement).style.background =
                      'var(--ig-surface-secondary)';
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
                  color: 'var(--ig-dark-primary)',
                }}
                onMouseEnter={e =>
                  ((e.target as HTMLButtonElement).style.background =
                    'var(--ig-accent-gradient-hover)')
                }
                onMouseLeave={e =>
                  ((e.target as HTMLButtonElement).style.background =
                    'var(--ig-accent-gradient)')
                }
              >
                New Project
              </button>
            </div>
          </div>
        </div>

        {/* Active Project Banner */}
        {activeProject && (
          <div
            className="rounded-lg p-4 mb-8"
            style={{
              background: 'var(--ig-surface-glass)',
              border: '1px solid var(--ig-border-accent)',
              backdropFilter: 'blur(10px)',
            }}
          >
            <h2
              className="font-semibold mb-2"
              style={{ color: 'var(--ig-text-accent)' }}
            >
              Active Project
            </h2>
            <p style={{ color: 'var(--ig-text-primary)' }}>
              {activeProject.project_name}
            </p>
            {activeProject.description && (
              <p
                className="text-sm mt-1"
                style={{ color: 'var(--ig-text-secondary)' }}
              >
                {activeProject.description}
              </p>
            )}
          </div>
        )}

        {/* Projects Grid */}
        {projects.length === 0 ? (
          <div className="text-center py-16">
            <div
              className="rounded-lg p-8 max-w-md mx-auto"
              style={{
                background: 'var(--ig-surface-glass)',
                border: '1px solid var(--ig-border-glass)',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
              }}
            >
              <h3
                className="text-lg font-medium mb-4"
                style={{ color: 'var(--ig-text-primary)' }}
              >
                No Projects Yet
              </h3>
              <p className="mb-6" style={{ color: 'var(--ig-text-secondary)' }}>
                Create your first project to start working with Ignacio on your
                ideas.
              </p>
              <button
                onClick={() => setShowCreateForm(true)}
                className="px-6 py-3 rounded-lg font-medium transition-all duration-200"
                style={{
                  background: 'var(--ig-accent-gradient)',
                  color: 'var(--ig-dark-primary)',
                }}
              >
                Create Your First Project
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map(project => (
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
            onSave={async projectData => {
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
