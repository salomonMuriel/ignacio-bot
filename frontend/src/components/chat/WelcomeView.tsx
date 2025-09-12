'use client';

/**
 * WelcomeView - Initial view when no conversation is selected
 * Shows welcome message and quick actions
 */

import { useProject } from '@/contexts/ProjectContext';
import { useConversation } from '@/contexts/ConversationContext';
import { ProjectLogo } from '@/components/ui/ProjectLogo';
import { 
  ChatBubbleLeftIcon,
  RocketLaunchIcon,
  LightBulbIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';

export function WelcomeView() {
  const { projects, activeProject } = useProject();
  const { createConversation } = useConversation();

  const handleStartConversation = async (prompt?: string) => {
    try {
      await createConversation(activeProject?.id, prompt);
    } catch (error) {
      console.error('Failed to start conversation:', error);
    }
  };

  const quickStartPrompts = [
    {
      icon: RocketLaunchIcon,
      title: "Desarrollar mi idea",
      description: "Te ayudo a estructurar y desarrollar tu idea de proyecto",
      prompt: "Hola Ignacio, quiero desarrollar mi idea de proyecto. ¿Por dónde empiezo?"
    },
    {
      icon: LightBulbIcon,
      title: "Validar mi propuesta",
      description: "Analicemos juntos la viabilidad de tu propuesta",
      prompt: "Necesito validar mi propuesta de negocio. ¿Qué aspectos debería considerar?"
    },
    {
      icon: DocumentTextIcon,
      title: "Plan de negocio",
      description: "Crearemos un plan de negocio sólido paso a paso",
      prompt: "Quiero crear un plan de negocio para mi proyecto. ¿Cómo lo estructuramos?"
    }
  ];

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="max-w-2xl mx-auto text-center">
        {/* Welcome Header */}
        <div className="mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-2xl">I</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            ¡Hola! Soy Ignacio
          </h1>
          <p className="text-xl text-gray-600 mb-2">
            Tu asistente inteligente para el desarrollo de proyectos
          </p>
          <p className="text-gray-500">
            Parte del programa <strong className="text-blue-600">Action Lab</strong>
          </p>
        </div>

        {/* Active Project Display */}
        {activeProject ? (
          <div className="mb-8 p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-center space-x-3 mb-2">
              <ProjectLogo project={activeProject} size="sm" />
              <div className="text-left">
                <h3 className="font-semibold text-gray-900">
                  {activeProject.project_name}
                </h3>
                <p className="text-sm text-gray-600 capitalize">
                  {activeProject.project_type?.replace('_', ' ')} • {activeProject.current_stage?.replace('_', ' ')}
                </p>
              </div>
            </div>
            <p className="text-sm text-gray-600">
              Contexto del proyecto activo disponible para nuestras conversaciones
            </p>
          </div>
        ) : projects.length > 0 ? (
          <div className="mb-8 p-4 bg-yellow-50 rounded-xl border border-yellow-200">
            <p className="text-sm text-yellow-800">
              💡 <strong>Tip:</strong> Selecciona un proyecto en la barra lateral para obtener respuestas más específicas y contextuales.
            </p>
          </div>
        ) : (
          <div className="mb-8 p-4 bg-blue-50 rounded-xl border border-blue-200">
            <p className="text-sm text-blue-800">
              🚀 <strong>¡Comencemos!</strong> Crea tu primer proyecto para obtener ayuda personalizada con tu emprendimiento, empresa o fundación.
            </p>
          </div>
        )}

        {/* Quick Start Options */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            ¿En qué puedo ayudarte hoy?
          </h2>
          
          <div className="grid gap-4 md:grid-cols-3">
            {quickStartPrompts.map((prompt, index) => (
              <button
                key={index}
                onClick={() => handleStartConversation(prompt.prompt)}
                className="p-6 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all text-left group"
              >
                <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mb-4 group-hover:bg-blue-200 transition-colors">
                  <prompt.icon className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  {prompt.title}
                </h3>
                <p className="text-sm text-gray-600">
                  {prompt.description}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* General Start Conversation */}
        <div className="space-y-4">
          <p className="text-gray-600">O simplemente...</p>
          <button
            onClick={() => handleStartConversation()}
            className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <ChatBubbleLeftIcon className="w-5 h-5" />
            <span>Iniciar Nueva Conversación</span>
          </button>
        </div>

        {/* Help Text */}
        <div className="mt-12 text-sm text-gray-500">
          <p>
            💬 Puedo ayudarte con estrategia, validación, planes de negocio, marketing, finanzas y mucho más.
          </p>
          <p className="mt-1">
            📁 Puedes compartir documentos, imágenes y archivos para un análisis más detallado.
          </p>
        </div>
      </div>
    </div>
  );
}