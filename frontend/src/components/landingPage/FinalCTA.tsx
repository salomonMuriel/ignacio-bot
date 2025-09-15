import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useProjects } from '../../contexts/ProjectsContext';

export default function FinalCTA() {
    const { user } = useAuth();
    const { projects } = useProjects();
    const navigate = useNavigate();

    return (
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
    )
}