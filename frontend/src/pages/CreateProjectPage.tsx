import { useState } from 'react';
import { useProjects } from '../contexts/ProjectsContext';
import { useNavigate } from 'react-router-dom';
import { ProjectType, ProjectStage } from '../types';

export default function CreateProjectPage() {
  const { createProject, setActiveProject } = useProjects();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    project_name: '',
    description: '',
    project_type: 'startup' as ProjectType,
    current_stage: 'ideation' as ProjectStage,
    target_audience: '',
    problem_statement: '',
    solution_approach: '',
    business_model: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.project_name.trim()) return;

    setIsSubmitting(true);
    try {
      const newProject = await createProject(formData);
      // Set as active project and redirect to chat
      setActiveProject(newProject);
      navigate('/chat');
    } catch (error) {
      console.error('Failed to create project:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--ig-bg-gradient)' }}>
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-4" style={{ color: 'var(--ig-text-primary)' }}>
              Create Your First Project
            </h1>
            <p className="text-lg" style={{ color: 'var(--ig-text-secondary)' }}>
              Let's set up your project so Ignacio can provide you with the most relevant guidance and support.
            </p>
          </div>

          {/* Form */}
          <div className="rounded-lg p-8" style={{
            background: 'var(--ig-surface-glass)',
            border: '1px solid var(--ig-border-glass)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
          }}>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Project Name */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--ig-text-accent)' }}>
                  Project Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.project_name}
                  onChange={(e) => setFormData({ ...formData, project_name: e.target.value })}
                  className="w-full p-3 rounded-lg transition-all duration-200"
                  style={{
                    background: 'var(--ig-surface-primary)',
                    border: '1px solid var(--ig-border-primary)',
                    color: 'var(--ig-text-primary)'
                  }}
                  placeholder="Enter your project name"
                  onFocus={(e) => (e.target as HTMLInputElement).style.borderColor = 'var(--ig-border-accent)'}
                  onBlur={(e) => (e.target as HTMLInputElement).style.borderColor = 'var(--ig-border-primary)'}
                />
                <p className="text-xs mt-1" style={{ color: 'var(--ig-text-muted)' }}>
                  Give your project a clear, descriptive name
                </p>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--ig-text-accent)' }}>
                  Project Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-3 rounded-lg transition-all duration-200"
                  style={{
                    background: 'var(--ig-surface-primary)',
                    border: '1px solid var(--ig-border-primary)',
                    color: 'var(--ig-text-primary)'
                  }}
                  rows={3}
                  placeholder="Provide a brief overview of your project"
                  onFocus={(e) => (e.target as HTMLTextAreaElement).style.borderColor = 'var(--ig-border-accent)'}
                  onBlur={(e) => (e.target as HTMLTextAreaElement).style.borderColor = 'var(--ig-border-primary)'}
                />
                <p className="text-xs mt-1" style={{ color: 'var(--ig-text-muted)' }}>
                  A short description to help Ignacio understand your project's purpose
                </p>
              </div>

              {/* Project Type and Stage */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--ig-text-accent)' }}>
                    Project Type
                  </label>
                  <select
                    value={formData.project_type}
                    onChange={(e) => setFormData({ ...formData, project_type: e.target.value as ProjectType })}
                    className="w-full p-3 rounded-lg transition-all duration-200"
                    style={{
                      background: 'var(--ig-surface-primary)',
                      border: '1px solid var(--ig-border-primary)',
                      color: 'var(--ig-text-primary)'
                    }}
                    onFocus={(e) => e.target.style.borderColor = 'var(--ig-border-accent)'}
                    onBlur={(e) => e.target.style.borderColor = 'var(--ig-border-primary)'}
                  >
                    <option value="startup">Startup</option>
                    <option value="ngo">NGO</option>
                    <option value="foundation">Foundation</option>
                    <option value="spinoff">Company Spinoff</option>
                    <option value="internal">Internal Project</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--ig-text-accent)' }}>
                    Current Stage
                  </label>
                  <select
                    value={formData.current_stage}
                    onChange={(e) => setFormData({ ...formData, current_stage: e.target.value as ProjectStage })}
                    className="w-full p-3 rounded-lg transition-all duration-200"
                    style={{
                      background: 'var(--ig-surface-primary)',
                      border: '1px solid var(--ig-border-primary)',
                      color: 'var(--ig-text-primary)'
                    }}
                    onFocus={(e) => e.target.style.borderColor = 'var(--ig-border-accent)'}
                    onBlur={(e) => e.target.style.borderColor = 'var(--ig-border-primary)'}
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

              {/* Target Audience */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--ig-text-accent)' }}>
                  Target Audience
                </label>
                <input
                  type="text"
                  value={formData.target_audience}
                  onChange={(e) => setFormData({ ...formData, target_audience: e.target.value })}
                  className="w-full p-3 rounded-lg transition-all duration-200"
                  style={{
                    background: 'var(--ig-surface-primary)',
                    border: '1px solid var(--ig-border-primary)',
                    color: 'var(--ig-text-primary)'
                  }}
                  placeholder="Who is your target audience?"
                  onFocus={(e) => (e.target as HTMLInputElement).style.borderColor = 'var(--ig-border-accent)'}
                  onBlur={(e) => (e.target as HTMLInputElement).style.borderColor = 'var(--ig-border-primary)'}
                />
                <p className="text-xs mt-1" style={{ color: 'var(--ig-text-muted)' }}>
                  Define the primary users or beneficiaries of your project
                </p>
              </div>

              {/* Problem Statement */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--ig-text-accent)' }}>
                  Problem Statement
                </label>
                <textarea
                  value={formData.problem_statement}
                  onChange={(e) => setFormData({ ...formData, problem_statement: e.target.value })}
                  className="w-full p-3 rounded-lg transition-all duration-200"
                  style={{
                    background: 'var(--ig-surface-primary)',
                    border: '1px solid var(--ig-border-primary)',
                    color: 'var(--ig-text-primary)'
                  }}
                  rows={3}
                  placeholder="What problem does your project aim to solve?"
                  onFocus={(e) => (e.target as HTMLTextAreaElement).style.borderColor = 'var(--ig-border-accent)'}
                  onBlur={(e) => (e.target as HTMLTextAreaElement).style.borderColor = 'var(--ig-border-primary)'}
                />
                <p className="text-xs mt-1" style={{ color: 'var(--ig-text-muted)' }}>
                  Clearly articulate the problem or need your project addresses
                </p>
              </div>

              {/* Solution Approach */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--ig-text-accent)' }}>
                  Solution Approach
                </label>
                <textarea
                  value={formData.solution_approach}
                  onChange={(e) => setFormData({ ...formData, solution_approach: e.target.value })}
                  className="w-full p-3 rounded-lg transition-all duration-200"
                  style={{
                    background: 'var(--ig-surface-primary)',
                    border: '1px solid var(--ig-border-primary)',
                    color: 'var(--ig-text-primary)'
                  }}
                  rows={3}
                  placeholder="How do you plan to solve this problem?"
                  onFocus={(e) => (e.target as HTMLTextAreaElement).style.borderColor = 'var(--ig-border-accent)'}
                  onBlur={(e) => (e.target as HTMLTextAreaElement).style.borderColor = 'var(--ig-border-primary)'}
                />
                <p className="text-xs mt-1" style={{ color: 'var(--ig-text-muted)' }}>
                  Describe your proposed solution or approach
                </p>
              </div>

              {/* Business Model */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--ig-text-accent)' }}>
                  Business/Value Model
                </label>
                <textarea
                  value={formData.business_model}
                  onChange={(e) => setFormData({ ...formData, business_model: e.target.value })}
                  className="w-full p-3 rounded-lg transition-all duration-200"
                  style={{
                    background: 'var(--ig-surface-primary)',
                    border: '1px solid var(--ig-border-primary)',
                    color: 'var(--ig-text-primary)'
                  }}
                  rows={3}
                  placeholder="How will your project generate value or revenue?"
                  onFocus={(e) => (e.target as HTMLTextAreaElement).style.borderColor = 'var(--ig-border-accent)'}
                  onBlur={(e) => (e.target as HTMLTextAreaElement).style.borderColor = 'var(--ig-border-primary)'}
                />
                <p className="text-xs mt-1" style={{ color: 'var(--ig-text-muted)' }}>
                  Explain how your project will create and capture value
                </p>
              </div>

              {/* Submit Button */}
              <div className="pt-6">
                <button
                  type="submit"
                  disabled={!formData.project_name.trim() || isSubmitting}
                  className="w-full py-4 px-6 rounded-lg font-medium text-lg transition-all duration-200"
                  style={{
                    background: !formData.project_name.trim() || isSubmitting
                      ? 'rgba(89, 47, 126, 0.5)'
                      : 'var(--ig-accent-gradient)',
                    color: !formData.project_name.trim() || isSubmitting
                      ? 'var(--ig-text-muted)'
                      : 'var(--ig-dark-primary)',
                    cursor: !formData.project_name.trim() || isSubmitting ? 'not-allowed' : 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    if (!(!formData.project_name.trim() || isSubmitting)) {
                      (e.target as HTMLButtonElement).style.background = 'var(--ig-accent-gradient-hover)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!(!formData.project_name.trim() || isSubmitting)) {
                      (e.target as HTMLButtonElement).style.background = 'var(--ig-accent-gradient)';
                    }
                  }}
                >
                  {isSubmitting ? 'Creating Project...' : 'Create Project & Start Chatting'}
                </button>
                <p className="text-xs text-center mt-2" style={{ color: 'var(--ig-text-muted)' }}>
                  You can always edit these details later
                </p>
              </div>
            </form>
          </div>

          {/* Help Text */}
          <div className="mt-8 rounded-lg p-6" style={{
            background: 'var(--ig-surface-glass)',
            border: '1px solid var(--ig-border-glass)',
            backdropFilter: 'blur(10px)'
          }}>
            <h3 className="font-semibold mb-2" style={{ color: 'var(--ig-text-accent)' }}>What happens next?</h3>
            <ul className="space-y-2 text-sm" style={{ color: 'var(--ig-text-secondary)' }}>
              <li>• Your project will be created and set as your active project</li>
              <li>• You'll be taken to the chat interface to start talking with Ignacio</li>
              <li>• Ignacio will use this project context to provide relevant advice</li>
              <li>• You can create additional projects and switch between them anytime</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}