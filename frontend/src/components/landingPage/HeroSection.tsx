import { useNavigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { useProjects } from '../../contexts/ProjectsContext';
import ignacioVideo from '../../assets/ignacio_video_optimized.mp4';


export default function HeroSection() {

    const { user, loginWithRedirect } = useAuth0();
    const navigate = useNavigate();


    const handleStartChatting = () => {
        if (!user) {
            loginWithRedirect()
        }
        
        navigate('/chat');
      };

    return (
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
    )
}