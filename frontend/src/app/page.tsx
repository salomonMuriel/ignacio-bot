import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-green-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">I</span>
            </div>
            <span className="text-xl font-bold text-gray-900">Ignacio</span>
          </div>
          <Link
            href="/chat"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Comenzar Chat
          </Link>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto text-center">
          {/* Hero Content */}
          <div className="mb-12">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Desarrolla tu proyecto con{" "}
              <span className="bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                Ignacio
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Tu asistente inteligente para el desarrollo de proyectos empresariales, fundaciones, ONGs y emprendimientos. 
              Parte del programa <strong>Action Lab</strong>, el laboratorio de innovación que te ayuda a construir el futuro.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Link
                href="/chat"
                className="bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 transition-colors font-medium text-lg shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Comenzar mi Proyecto
              </Link>
              <Link
                href="/projects"
                className="bg-white text-blue-600 border-2 border-blue-600 px-8 py-4 rounded-lg hover:bg-blue-50 transition-colors font-medium text-lg"
              >
                Ver mis Proyectos
              </Link>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="bg-white/80 backdrop-blur rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all hover:scale-105">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <span className="text-2xl">🚀</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Emprendimientos</h3>
              <p className="text-gray-600">
                Desde la ideación hasta el lanzamiento, te acompañamos en cada etapa de tu startup.
              </p>
            </div>
            
            <div className="bg-white/80 backdrop-blur rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all hover:scale-105">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <span className="text-2xl">🏢</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Empresas</h3>
              <p className="text-gray-600">
                Proyectos internos, spinoffs y nuevas líneas de negocio que llevan tu empresa al siguiente nivel.
              </p>
            </div>
            
            <div className="bg-white/80 backdrop-blur rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all hover:scale-105">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <span className="text-2xl">❤️</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">ONGs y Fundaciones</h3>
              <p className="text-gray-600">
                Proyectos de impacto social que transforman comunidades y crean un mundo mejor.
              </p>
            </div>
          </div>

          {/* Action Lab Info */}
          <div className="bg-gradient-to-r from-blue-600 to-green-600 rounded-2xl p-8 text-white">
            <h2 className="text-3xl font-bold mb-4">¿Qué es Action Lab?</h2>
            <p className="text-xl mb-6 opacity-90">
              Un programa educativo innovador que enseña a las personas cómo construir proyectos que impacten el mundo.
              Desde startups hasta fundaciones, te damos las herramientas y el acompañamiento para hacer realidad tus ideas.
            </p>
            <Link
              href="/chat"
              className="inline-block bg-white text-blue-600 px-8 py-3 rounded-lg hover:bg-gray-100 transition-colors font-medium text-lg"
            >
              Comenzar Ahora
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-16">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-6 h-6 bg-gradient-to-br from-blue-600 to-green-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">I</span>
            </div>
            <span className="text-lg font-bold">Ignacio - Action Lab</span>
          </div>
          <p className="text-gray-400">
            Tu asistente inteligente para el desarrollo de proyectos empresariales
          </p>
        </div>
      </footer>
    </div>
  );
}
