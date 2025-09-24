import { useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useProjects } from '../contexts/ProjectsContext';
import { useNavigate } from 'react-router-dom';
import { type Project } from '../types';
import ProjectCard from '@/components/projectsPage/ProjectCard';
import ProjectFormModal from '@/components/projectsPage/ProjectForm';
import LoadingScreen from '@/components/ui/LoadingScreen';

export default function ProjectsPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth0();
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

  if (authLoading) {
    return (
      <LoadingScreen/>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--ig-bg-gradient)' }}>
        <div className="text-lg" style={{ color: 'var(--ig-text-primary)' }}>Please log in to manage projects.</div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <LoadingScreen/>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--ig-bg-gradient)' }}>
      {/* Navigation Header */}
      <header className="border-b" style={{
        background: 'var(--ig-surface-glass)',
        borderColor: 'var(--ig-border-glass)',
        backdropFilter: 'blur(10px)'
      }}>
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/chat')}
              className="flex items-center space-x-2 text-sm font-medium transition-colors hover:opacity-80"
              style={{ color: 'var(--ig-text-accent)' }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span>Back to Chat</span>
            </button>
            <div className="h-4 w-px" style={{ background: 'var(--ig-border-primary)' }}></div>
            <h1 className="text-lg font-semibold" style={{ color: 'var(--ig-text-primary)' }}>
              My Projects
            </h1>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate('/user')}
              className="px-3 py-1.5 text-sm rounded-lg font-medium transition-all duration-200 hover:opacity-80"
              style={{
                background: 'var(--ig-surface-secondary)',
                color: 'var(--ig-text-secondary)',
                border: '1px solid var(--ig-border-primary)'
              }}
            >
              Profile
            </button>
            <button
              onClick={() => navigate('/chat')}
              disabled={!activeProject}
              className="px-3 py-1.5 text-sm rounded-lg font-medium transition-all duration-200"
              style={{
                background: !activeProject
                  ? 'rgba(89, 47, 126, 0.5)'
                  : 'var(--ig-surface-secondary)',
                color: !activeProject
                  ? 'var(--ig-text-muted)'
                  : 'var(--ig-text-secondary)',
                border: '1px solid var(--ig-border-primary)',
                cursor: !activeProject ? 'not-allowed' : 'pointer'
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
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4" style={{ color: 'var(--ig-text-primary)' }}>
              Your Projects
            </h2>
            <p className="text-lg" style={{ color: 'var(--ig-text-secondary)' }}>
              Manage your projects and continue your conversations with Ignacio
            </p>
          </div>

          {/* Active Project Banner */}
          {activeProject && (
            <div className="rounded-lg p-6 mb-8" style={{
              background: 'var(--ig-surface-glass)',
              border: '1px solid var(--ig-border-accent)',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
            }}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--ig-text-accent)' }}>
                    Active Project
                  </h3>
                  <p className="text-lg font-medium" style={{ color: 'var(--ig-text-primary)' }}>
                    {activeProject.project_name}
                  </p>
                  {activeProject.description && (
                    <p className="text-sm mt-2" style={{ color: 'var(--ig-text-secondary)' }}>
                      {activeProject.description}
                    </p>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full" style={{ background: 'var(--ig-accent-primary)' }}></div>
                  <span className="text-sm font-medium" style={{ color: 'var(--ig-text-accent)' }}>Active</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Projects Grid - Uses wider container for better card layout */}
        <div className="max-w-5xl mx-auto px-4">
          {projects.length === 0 ? (
            <div className="text-center py-16">
              <div className="rounded-lg p-10 max-w-lg mx-auto" style={{
                background: 'var(--ig-surface-glass)',
                border: '1px solid var(--ig-border-glass)',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
              }}>
                {/* Icon */}
                <div className="flex justify-center mb-6">
                  <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{
                    background: 'var(--ig-surface-secondary)',
                    border: '2px solid var(--ig-border-accent)'
                  }}>
                    <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--ig-text-accent)' }}>
                      <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
                    </svg>
                  </div>
                </div>

                <h3 className="text-2xl font-bold mb-4" style={{ color: 'var(--ig-text-primary)' }}>
                  No Projects Yet
                </h3>
                <p className="text-lg mb-8 leading-relaxed" style={{ color: 'var(--ig-text-secondary)' }}>
                  Create your first project to start working with Ignacio on your ideas and bring them to life.
                </p>
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="inline-flex items-center space-x-2 px-8 py-4 rounded-lg font-medium text-lg transition-all duration-200"
                  style={{
                    background: 'var(--ig-accent-gradient)',
                    color: 'var(--ig-dark-primary)'
                  }}
                  onMouseEnter={(e) => (e.target as HTMLButtonElement).style.background = 'var(--ig-accent-gradient-hover)'}
                  onMouseLeave={(e) => (e.target as HTMLButtonElement).style.background = 'var(--ig-accent-gradient)'}
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                  </svg>
                  <span>Create Your First Project</span>
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
      </main>
    </div>
  );
}



