export default function Features() {
  return (
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
              Get personalized AI assistance tailored to your project's unique
              needs
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
              <div className="relative bg-slate-800/50 border border-slate-700/50 rounded-2xl p-8 backdrop-blur-sm hover:border-purple-500/50 transition-all duration-300">
                <div className="text-5xl mb-6">🎯</div>
                <h3 className="text-2xl font-bold text-white mb-4">
                  Expert Guidance
                </h3>
                <p className="text-gray-300 leading-relaxed">
                  Get specialized advice from marketing, technical, and business
                  experts tailored to your project's specific challenges and
                  opportunities.
                </p>
              </div>
            </div>

            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-cyan-600/20 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
              <div className="relative bg-slate-800/50 border border-slate-700/50 rounded-2xl p-8 backdrop-blur-sm hover:border-blue-500/50 transition-all duration-300">
                <div className="text-5xl mb-6">📊</div>
                <h3 className="text-2xl font-bold text-white mb-4">
                  Project Management
                </h3>
                <p className="text-gray-300 leading-relaxed">
                  Organize multiple projects, track progress, and maintain
                  context across all your ventures with intelligent project
                  categorization.
                </p>
              </div>
            </div>

            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-green-600/20 to-emerald-600/20 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
              <div className="relative bg-slate-800/50 border border-slate-700/50 rounded-2xl p-8 backdrop-blur-sm hover:border-green-500/50 transition-all duration-300">
                <div className="text-5xl mb-6">💬</div>
                <h3 className="text-2xl font-bold text-white mb-4">
                  Multi-Channel Access
                </h3>
                <p className="text-gray-300 leading-relaxed">
                  Chat with Ignacio through WhatsApp or our web interface. Your
                  conversation history and project context sync seamlessly
                  across platforms.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
