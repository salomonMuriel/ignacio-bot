import { useAuth } from '../contexts/AuthContext';
import { useProjects } from '../contexts/ProjectsContext';
import { useNavigate } from 'react-router-dom';
import ignacioVideo from '../assets/ignacio_video_optimized.mp4';

export default function LandingPage() {
  const { user } = useAuth();
  const { projects } = useProjects();
  const navigate = useNavigate();

  const handleStartChatting = () => {
    if (!user) {
      // For now, simulate login - in Phase 4 this will be actual OTP login
      return;
    }
    
    if (projects.length === 0) {
      navigate('/create-project');
    } else {
      navigate('/chat');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-purple-900/20 to-transparent" />
        
        <div className="relative container mx-auto px-4 py-20 lg:py-32">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
              {/* Left Column - Text Content */}
              <div className="text-center lg:text-left space-y-8">
                <div className="space-y-6">
                  <div className="inline-flex items-center px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-full text-purple-300 text-sm font-medium">
                    🚀 From Action Lab
                  </div>
                  
                  <h1 className="text-5xl lg:text-7xl font-bold text-ignacio-text-primary leading-tight  text-white">
                    Meet{' '}
                    <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 
          -  bg-clip-text text-transparent">
                      Ignacio
                    </span>
                  </h1>
                  
                  <p className="text-xl lg:text-2xl text-ignacio-text-secondary leading-relaxed max-w-2xl  text-white">
                    Your AI-powered project development assistant. Get expert guidance, 
                    strategic insights, and personalized support to turn your ideas into 
                    successful ventures.
                  </p>
                </div>

                {/* CTA Section */}
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                    <button
                      onClick={handleStartChatting}
                      className="group relative px-8 py-4 bg-ignacio-purple-pink hover:bg-ignacio-purple-pink-hover text-ignacio-text-primary font-semibold rounded-xl shadow-lg hover:shadow-purple-500/25 transition-all duration-300 transform hover:scale-105"
                    >
                      <span className="relative z-10 flex items-center justify-center gap-2  text-white">
                        💬 Start Chatting with Ignacio
                        <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </span>
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl opacity-30 group-hover:opacity-50 transition-opacity" />
                    </button>
                    
                    {!user && (
                      <button className="px-8 py-4 border-2 border-gray-600 text-gray-300 hover:text-white hover:border-gray-500 font-semibold rounded-xl transition-all duration-300">
                        Learn More
                      </button>
                    )}
                  </div>
                  
                  {!user && (
                    <p className="text-sm text-gray-400">
                      ⚡ Login required to start chatting
                    </p>
                  )}
                </div>
              </div>

              {/* Right Column - Video */}
              <div className="relative flex justify-center">
                <div className="relative w-2/3 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-3xl p-2 backdrop-blur-sm border border-white/10">
                  <video
                    className="h-auto rounded-2xl shadow-2xl"
                    autoPlay
                    muted
                    loop
                    playsInline
                  >
                    <source src={ignacioVideo} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                  
                  <div className="absolute -inset-4 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-3xl blur-xl opacity-50" />
                </div>
                
                {/* Floating elements */}
                <div className="absolute -top-4 -right-4 w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full opacity-20 animate-pulse" />
                <div className="absolute -bottom-8 -left-8 w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full opacity-20 animate-pulse delay-1000" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* About Action Lab Section */}
      <div className="relative py-20 lg:py-32 bg-slate-800/50 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-300 text-sm font-medium">
              🎓 Action Lab Education Program
            </div>
            
            <h2 className="text-4xl lg:text-5xl font-bold text-white">
              Where Innovation Meets{' '}
              <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                Education
              </span>
            </h2>
            
            <p className="text-xl text-gray-300 leading-relaxed">
              Action Lab is an innovative education program that teaches people how to build projects. 
              Whether you're creating a new company, NGO, foundation, or developing a game-changing 
              project within your organization, we provide the tools and guidance you need.
            </p>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="relative py-20 lg:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
                Why Choose{' '}
                <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Ignacio?
                </span>
              </h2>
              <p className="text-xl text-gray-300">
                Get personalized AI assistance tailored to your project's unique needs
              </p>
            </div>
            
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
                <div className="relative bg-slate-800/50 border border-slate-700/50 rounded-2xl p-8 backdrop-blur-sm hover:border-purple-500/50 transition-all duration-300">
                  <div className="text-5xl mb-6">🎯</div>
                  <h3 className="text-2xl font-bold text-white mb-4">Expert Guidance</h3>
                  <p className="text-gray-300 leading-relaxed">
                    Get specialized advice from marketing, technical, and business experts 
                    tailored to your project's specific challenges and opportunities.
                  </p>
                </div>
              </div>
              
              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-cyan-600/20 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
                <div className="relative bg-slate-800/50 border border-slate-700/50 rounded-2xl p-8 backdrop-blur-sm hover:border-blue-500/50 transition-all duration-300">
                  <div className="text-5xl mb-6">📊</div>
                  <h3 className="text-2xl font-bold text-white mb-4">Project Management</h3>
                  <p className="text-gray-300 leading-relaxed">
                    Organize multiple projects, track progress, and maintain context 
                    across all your ventures with intelligent project categorization.
                  </p>
                </div>
              </div>
              
              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-r from-green-600/20 to-emerald-600/20 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
                <div className="relative bg-slate-800/50 border border-slate-700/50 rounded-2xl p-8 backdrop-blur-sm hover:border-green-500/50 transition-all duration-300">
                  <div className="text-5xl mb-6">💬</div>
                  <h3 className="text-2xl font-bold text-white mb-4">Multi-Channel Access</h3>
                  <p className="text-gray-300 leading-relaxed">
                    Chat with Ignacio through WhatsApp or our web interface. 
                    Your conversation history and project context sync seamlessly across platforms.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Final CTA Section */}
      <div className="relative py-20 lg:py-32 bg-gradient-to-r from-purple-900/50 to-pink-900/50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <h2 className="text-4xl lg:text-5xl font-bold text-white">
              Ready to Build Something{' '}
              <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                Amazing?
              </span>
            </h2>
            
            <p className="text-xl text-gray-300 leading-relaxed">
              {user ? (
                projects.length === 0 ? (
                  "Let's create your first project and begin your journey with Ignacio's expert guidance."
                ) : (
                  "Continue working on your projects with Ignacio's AI-powered assistance."
                )
              ) : (
                "Join Action Lab and start building your project with Ignacio's personalized AI guidance."
              )}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {user ? (
                <button
                  onClick={() => navigate(projects.length === 0 ? '/create-project' : '/chat')}
                  className="group relative px-10 py-5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-lg rounded-2xl shadow-lg hover:shadow-purple-500/25 transition-all duration-300 transform hover:scale-105"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {projects.length === 0 ? '🚀 Create Your First Project' : '💬 Continue to Chat'}
                    <svg className="w-6 h-6 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur opacity-30 group-hover:opacity-50 transition-opacity" />
                </button>
              ) : (
                <>
                  <button className="px-10 py-5 bg-gradient-to-r from-gray-600 to-gray-700 text-gray-300 font-bold text-lg rounded-2xl cursor-not-allowed opacity-60">
                    🔐 Login Required
                  </button>
                  <button className="px-10 py-5 border-2 border-gray-600 text-gray-300 hover:text-white hover:border-gray-500 font-bold text-lg rounded-2xl transition-all duration-300">
                    📖 Learn More About Action Lab
                  </button>
                </>
              )}
            </div>
            
            {!user && (
              <p className="text-sm text-gray-400">
                ⚡ Contact an administrator to get access to Ignacio
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}