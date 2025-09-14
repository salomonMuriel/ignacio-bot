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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Create Your First Project
            </h1>
            <p className="text-lg text-gray-600">
              Let's set up your project so Ignacio can provide you with the most relevant guidance and support.
            </p>
          </div>

          {/* Form */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Project Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
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
                <p className="text-xs text-gray-500 mt-1">
                  Give your project a clear, descriptive name
                </p>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  placeholder="Provide a brief overview of your project"
                />
                <p className="text-xs text-gray-500 mt-1">
                  A short description to help Ignacio understand your project's purpose
                </p>
              </div>

              {/* Project Type and Stage */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
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
                    <option value="spinoff">Company Spinoff</option>
                    <option value="internal">Internal Project</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
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

              {/* Target Audience */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Audience
                </label>
                <input
                  type="text"
                  value={formData.target_audience}
                  onChange={(e) => setFormData({ ...formData, target_audience: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Who is your target audience?"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Define the primary users or beneficiaries of your project
                </p>
              </div>

              {/* Problem Statement */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Problem Statement
                </label>
                <textarea
                  value={formData.problem_statement}
                  onChange={(e) => setFormData({ ...formData, problem_statement: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  placeholder="What problem does your project aim to solve?"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Clearly articulate the problem or need your project addresses
                </p>
              </div>

              {/* Solution Approach */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Solution Approach
                </label>
                <textarea
                  value={formData.solution_approach}
                  onChange={(e) => setFormData({ ...formData, solution_approach: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  placeholder="How do you plan to solve this problem?"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Describe your proposed solution or approach
                </p>
              </div>

              {/* Business Model */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business/Value Model
                </label>
                <textarea
                  value={formData.business_model}
                  onChange={(e) => setFormData({ ...formData, business_model: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  placeholder="How will your project generate value or revenue?"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Explain how your project will create and capture value
                </p>
              </div>

              {/* Submit Button */}
              <div className="pt-6">
                <button
                  type="submit"
                  disabled={!formData.project_name.trim() || isSubmitting}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-4 px-6 rounded-lg font-medium text-lg transition-colors"
                >
                  {isSubmitting ? 'Creating Project...' : 'Create Project & Start Chatting'}
                </button>
                <p className="text-xs text-gray-500 text-center mt-2">
                  You can always edit these details later
                </p>
              </div>
            </form>
          </div>

          {/* Help Text */}
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="font-semibold text-blue-900 mb-2">What happens next?</h3>
            <ul className="text-blue-800 space-y-2 text-sm">
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