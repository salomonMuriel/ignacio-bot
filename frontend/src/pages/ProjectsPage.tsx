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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Please log in to manage projects.</div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading projects...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Projects</h1>
              <p className="text-gray-600 mt-2">
                Manage your projects and continue your conversations with Ignacio
              </p>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => navigate('/chat')}
                disabled={!activeProject}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Go to Chat
              </button>
              <button
                onClick={() => setShowCreateForm(true)}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                New Project
              </button>
            </div>
          </div>
        </div>

        {/* Active Project Banner */}
        {activeProject && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
            <h2 className="font-semibold text-blue-900 mb-2">Active Project</h2>
            <p className="text-blue-800">{activeProject.project_name}</p>
            {activeProject.description && (
              <p className="text-blue-700 text-sm mt-1">{activeProject.description}</p>
            )}
          </div>
        )}

        {/* Projects Grid */}
        {projects.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-white rounded-lg shadow-sm p-8 max-w-md mx-auto">
              <h3 className="text-lg font-medium text-gray-800 mb-4">No Projects Yet</h3>
              <p className="text-gray-600 mb-6">
                Create your first project to start working with Ignacio on your ideas.
              </p>
              <button
                onClick={() => setShowCreateForm(true)}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
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
    <div className={`bg-white rounded-lg shadow-sm border-2 transition-all ${
      isActive ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200 hover:border-gray-300'
    }`}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 truncate">
            {project.project_name}
          </h3>
          {isActive && (
            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
              Active
            </span>
          )}
        </div>
        
        {project.description && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-3">{project.description}</p>
        )}
        
        <div className="space-y-2 mb-4">
          {project.project_type && (
            <div className="flex items-center text-sm">
              <span className="text-gray-500">Type:</span>
              <span className="ml-2 text-gray-800 capitalize">{project.project_type}</span>
            </div>
          )}
          {project.current_stage && (
            <div className="flex items-center text-sm">
              <span className="text-gray-500">Stage:</span>
              <span className="ml-2 text-gray-800 capitalize">{project.current_stage}</span>
            </div>
          )}
        </div>
        
        <div className="flex space-x-2">
          {!isActive && (
            <button
              onClick={onSetActive}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded text-sm font-medium transition-colors"
            >
              Set Active
            </button>
          )}
          <button
            onClick={onEdit}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-3 rounded text-sm font-medium transition-colors"
          >
            Edit
          </button>
          <button
            onClick={onDelete}
            className="bg-red-100 hover:bg-red-200 text-red-700 py-2 px-3 rounded text-sm font-medium transition-colors"
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            {project ? 'Edit Project' : 'Create New Project'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Project Name *
              </label>
              <input
                type="text"
                required
                value={formData.project_name}
                onChange={(e) => setFormData({ ...formData, project_name: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your project name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={3}
                placeholder="Describe your project"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Project Type
                </label>
                <select
                  value={formData.project_type}
                  onChange={(e) => setFormData({ ...formData, project_type: e.target.value as ProjectType })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Stage
                </label>
                <select
                  value={formData.current_stage}
                  onChange={(e) => setFormData({ ...formData, current_stage: e.target.value as ProjectStage })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Target Audience
              </label>
              <input
                type="text"
                value={formData.target_audience}
                onChange={(e) => setFormData({ ...formData, target_audience: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Who is your target audience?"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Problem Statement
              </label>
              <textarea
                value={formData.problem_statement}
                onChange={(e) => setFormData({ ...formData, problem_statement: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={2}
                placeholder="What problem does your project solve?"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Solution Approach
              </label>
              <textarea
                value={formData.solution_approach}
                onChange={(e) => setFormData({ ...formData, solution_approach: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={2}
                placeholder="How do you plan to solve this problem?"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Business Model
              </label>
              <textarea
                value={formData.business_model}
                onChange={(e) => setFormData({ ...formData, business_model: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={2}
                placeholder="How will your project generate value/revenue?"
              />
            </div>

            <div className="flex space-x-4 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-4 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!formData.project_name.trim() || isSubmitting}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-3 px-4 rounded-lg font-medium transition-colors"
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