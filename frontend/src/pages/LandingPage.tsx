import { useAuth } from '../contexts/AuthContext';
import { useProjects } from '../contexts/ProjectsContext';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

export default function LandingPage() {
  const { user } = useAuth();
  const { projects, isLoading } = useProjects();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && !isLoading) {
      if (projects.length === 0) {
        // User has no projects, redirect to project creation
        navigate('/create-project');
      } else {
        // User has projects, redirect to chat
        navigate('/chat');
      }
    }
  }, [user, projects, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          {/* Hero Section */}
          <div className="mb-16">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Meet Ignacio
            </h1>
            <p className="text-xl text-gray-700 mb-8 leading-relaxed">
              Your AI-powered project development assistant from Action Lab. 
              Get expert guidance, strategic insights, and personalized support 
              to turn your ideas into successful ventures.
            </p>
            <div className="bg-white rounded-lg shadow-lg p-8 mb-12">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                Welcome to Action Lab
              </h2>
              <p className="text-gray-600 mb-6">
                An innovative education program that teaches people how to build projects. 
                Whether you're creating a new company, NGO, foundation, or developing 
                a game-changing project within your organization, Ignacio is here to help.
              </p>
            </div>
          </div>

          {/* Features Section */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-blue-500 text-3xl mb-4">🎯</div>
              <h3 className="text-lg font-semibold mb-2">Expert Guidance</h3>
              <p className="text-gray-600">
                Get specialized advice from marketing, technical, and business experts 
                tailored to your project's needs.
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-green-500 text-3xl mb-4">📊</div>
              <h3 className="text-lg font-semibold mb-2">Project Management</h3>
              <p className="text-gray-600">
                Organize multiple projects, track progress, and maintain context 
                across all your ventures.
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-purple-500 text-3xl mb-4">💬</div>
              <h3 className="text-lg font-semibold mb-2">Multi-Channel Access</h3>
              <p className="text-gray-600">
                Chat with Ignacio through WhatsApp or our web interface - 
                your conversation history syncs across platforms.
              </p>
            </div>
          </div>

          {/* Get Started Section */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-gray-600 mb-6">
              {user ? (
                projects.length === 0 ? (
                  "Let's create your first project to begin your journey with Ignacio."
                ) : (
                  "Continue working on your projects with Ignacio's assistance."
                )
              ) : (
                "Please log in to start building your project with Ignacio's help."
              )}
            </p>
            {user ? (
              <button
                onClick={() => navigate(projects.length === 0 ? '/create-project' : '/chat')}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-8 rounded-lg transition-colors"
              >
                {projects.length === 0 ? 'Create Your First Project' : 'Continue to Chat'}
              </button>
            ) : (
              <button
                className="bg-gray-400 text-white font-medium py-3 px-8 rounded-lg cursor-not-allowed"
                disabled
              >
                Login Required
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}