import React from 'react';
import { useNavigate } from 'react-router-dom';

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="relative z-10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-ignia-gradient-1 rounded-xl flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-ignia-dark-gray" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <span className="text-xl font-extrabold bg-ignia-gradient-1 bg-clip-text text-transparent">
              Ignacio
            </span>
          </div>
          <button
            onClick={() => navigate('/login')}
            className="text-ignia-dark-gray hover:text-secondary-700 font-medium transition-colors"
          >
            Iniciar Sesión
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-gray-100 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-gray-100 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" style={{animationDelay: '2s'}}></div>
          <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-gray-100 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" style={{animationDelay: '4s'}}></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-6 py-8 sm:py-16">
          <div className="text-center">
            {/* Animated Avatar */}
            <div className="mb-8 inline-flex items-center justify-center">
              <div className="relative">
                <div className="w-60 h-60 rounded-3xl overflow-hidden shadow-lg transform hover:scale-105 transition-transform duration-300 bg-ignia-gradient-1 p-1">
                  <video
                    className="w-full h-full object-cover rounded-2xl"
                    autoPlay
                    loop
                    muted
                    playsInline
                  >
                    <source src="/assets/ignacio_video_optimized.mp4" type="video/mp4" />
                  </video>
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-accent-500 rounded-full border-2 border-white animate-pulse"></div>
              </div>
            </div>

            {/* Hero Text */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-ignia-dark-gray mb-6 leading-tight">
              Conoce a{' '}
              <span className="bg-ignia-gradient-1 bg-clip-text text-transparent">
                Ignacio
              </span>
            </h1>

            <h2 className="text-xl sm:text-2xl lg:text-3xl text-secondary-600 mb-8 font-bold italic">
              Tu Asistente de IA para el Desarrollo de Proyectos
            </h2>

            <p className="text-lg sm:text-xl text-gray-700 mb-12 max-w-3xl mx-auto leading-relaxed">
              Empoderamos a los participantes del Action Lab con orientación inteligente en marketing, decisiones técnicas,
              gestión de proyectos y planificación estratégica. Construyamos algo increíble juntos.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <button
                onClick={() => navigate('/chat')}
                className="group relative px-8 py-4 bg-ignia-gradient-1 text-ignia-dark-gray text-lg font-bold rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center space-x-3"
              >
                <svg className="w-6 h-6 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <span>Empezar a Chatear</span>
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>

              <button className="px-8 py-4 bg-white text-secondary-700 text-lg font-semibold rounded-2xl border-2 border-secondary-200 hover:border-secondary-300 hover:shadow-lg transform hover:scale-105 transition-all duration-300 flex items-center space-x-3">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h8m-8 0v0m8 0v0" />
                </svg>
                <span>Ver Demo</span>
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 max-w-md mx-auto text-center">
              <div>
                <div className="text-3xl font-extrabold bg-ignia-gradient-1 bg-clip-text text-transparent mb-1">24/7</div>
                <div className="text-sm text-gray-600">Disponible</div>
              </div>
              <div>
                <div className="text-3xl font-extrabold bg-ignia-gradient-2 bg-clip-text text-transparent mb-1">IA</div>
                <div className="text-sm text-gray-600">Inteligente</div>
              </div>
              <div>
                <div className="text-3xl font-extrabold bg-ignia-gradient-3 bg-clip-text text-transparent mb-1">∞</div>
                <div className="text-sm text-gray-600">Experticia</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-extrabold text-ignia-dark-gray mb-4">
              Cómo Ignacio Transforma tu Proyecto
            </h3>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto">
              Desde la ideación hasta la ejecución, obtén asesoramiento experto adaptado a las necesidades únicas de tu proyecto
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Pensamiento de Diseño Feature */}
            <div className="group relative p-8 bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100">
              <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative">
                <div className="w-16 h-16 bg-ignia-gradient-1 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
                  <svg className="w-8 h-8 text-ignia-dark-gray" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h4 className="text-2xl font-bold text-ignia-dark-gray mb-4">Pensamiento de Diseño</h4>
                <p className="text-gray-700 leading-relaxed">
                  Desarrolla una mentalidad centrada en el usuario. Aprende a identificar necesidades reales, generar soluciones creativas y prototipar ideas que resuelvan problemas de manera efectiva.
                </p>
                <div className="mt-6 flex items-center text-primary-600 font-semibold">
                  <span>Conoce más</span>
                  <svg className="w-4 h-4 ml-2 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Tecnología Feature */}
            <div className="group relative p-8 bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative">
                <div className="w-16 h-16 bg-ignia-gradient-3 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                </div>
                <h4 className="text-2xl font-bold text-ignia-dark-gray mb-4">Tecnología</h4>
                <p className="text-gray-700 leading-relaxed">
                  Domina las herramientas digitales que potencian tu proyecto. Desde selección tecnológica hasta implementación estratégica, construye soluciones escalables y robustas.
                </p>
                <div className="mt-6 flex items-center text-secondary-600 font-semibold">
                  <span>Conoce más</span>
                  <svg className="w-4 h-4 ml-2 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Negocios Ágiles Feature */}
            <div className="group relative p-8 bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative">
                <div className="w-16 h-16 bg-ignia-gradient-2 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h4 className="text-2xl font-bold text-ignia-dark-gray mb-4">Negocios Ágiles</h4>
                <p className="text-gray-700 leading-relaxed">
                  Construye organizaciones adaptables y resilientes. Aprende metodologías ágiles, gestión lean, iteración rápida y cómo pivotar estratégicamente en mercados dinámicos.
                </p>
                <div className="mt-6 flex items-center text-accent-600 font-semibold">
                  <span>Conoce más</span>
                  <svg className="w-4 h-4 ml-2 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-ignia-gradient-4">
        <div className="max-w-4xl mx-auto text-center px-6">
          <h3 className="text-4xl sm:text-5xl font-extrabold text-white mb-6">
            ¿Listo para Acelerar tu Proyecto?
          </h3>
          <p className="text-xl text-primary-100 mb-10">
            Únete a la comunidad de Action Lab y comienza a construir con Ignacio hoy
          </p>
          <button
            onClick={() => navigate('/chat')}
            className="inline-flex items-center px-10 py-5 bg-primary-500 text-ignia-dark-gray text-xl font-bold rounded-2xl hover:bg-primary-600 transform hover:scale-105 transition-all duration-300 shadow-2xl space-x-3"
          >
            <span>Comienza tu Jornada</span>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-12 bg-ignia-dark-gray text-gray-300">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-ignia-gradient-1 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-ignia-dark-gray" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <span className="text-lg font-extrabold bg-ignia-gradient-1 bg-clip-text text-transparent">Ignacio</span>
          </div>
          <p className="text-gray-400 mb-6">
            Empoderando la próxima generación de emprendedores a través de asistencia inteligente
          </p>
          <div className="text-sm text-gray-500">
            © 2024 Ignia • Action Lab. Impulsado por IA, construido con ❤️
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
