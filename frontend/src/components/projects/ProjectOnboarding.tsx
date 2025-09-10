/**
 * Project Onboarding Component
 * Handles the first-time project creation flow for new users
 */

import React, { useState, useEffect } from 'react';
import { ProjectType, ProjectStage, ProjectCreateRequest } from '../../types';
import { useProject } from '../../contexts/ProjectContext';
import { projectService } from '../../services/projectService';

interface ProjectOnboardingProps {
  userId: string;
  onComplete: () => void;
}

const ProjectOnboarding: React.FC<ProjectOnboardingProps> = ({ userId, onComplete }) => {
  const { createProject, error: projectError, isLoading } = useProject();
  
  const [formData, setFormData] = useState<ProjectCreateRequest>({
    name: '',
    type: 'startup',
    stage: 'ideation',
    description: '',
    context: {}
  });
  
  const [availableTypes, setAvailableTypes] = useState<ProjectType[]>([]);
  const [availableStages, setAvailableStages] = useState<ProjectStage[]>([]);
  const [step, setStep] = useState(1);
  const [localError, setLocalError] = useState<string | null>(null);

  // Load available types and stages
  useEffect(() => {
    const loadOptions = async () => {
      try {
        const [types, stages] = await Promise.all([
          projectService.getProjectTypes(),
          projectService.getProjectStages()
        ]);
        setAvailableTypes(types);
        setAvailableStages(stages);
      } catch (error) {
        console.error('Failed to load project options:', error);
        setLocalError('Error al cargar opciones del proyecto');
      }
    };

    loadOptions();
  }, []);

  const handleInputChange = (field: keyof ProjectCreateRequest, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setLocalError(null);
  };

  const handleNext = () => {
    if (step === 1) {
      if (!formData.name.trim()) {
        setLocalError('El nombre del proyecto es requerido');
        return;
      }
    }
    setStep(step + 1);
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleSubmit = async () => {
    try {
      setLocalError(null);
      await createProject(formData);
      onComplete();
    } catch (error) {
      setLocalError('Error al crear el proyecto. Por favor intenta de nuevo.');
    }
  };

  const typeLabels: Record<ProjectType, string> = {
    startup: 'Startup',
    ngo: 'ONG',
    foundation: 'Fundación',
    spinoff: 'Spinoff',
    internal: 'Proyecto Interno',
    other: 'Otro'
  };

  const stageLabels: Record<ProjectStage, string> = {
    ideation: 'Ideación',
    research: 'Investigación',
    validation: 'Validación',
    development: 'Desarrollo',
    testing: 'Pruebas',
    launch: 'Lanzamiento',
    growth: 'Crecimiento',
    mature: 'Maduro'
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-ignia-gradient-1 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-ignia-dark-gray" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h3M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 8h1m4 0h1" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-ignia-dark-gray mb-2">
          Cuéntanos sobre tu proyecto
        </h2>
        <p className="text-gray-600">
          Necesitamos algunos detalles para personalizar tu experiencia con Ignacio
        </p>
      </div>

      <div>
        <label className="block text-sm font-semibold text-ignia-dark-gray mb-2">
          Nombre del proyecto *
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => handleInputChange('name', e.target.value)}
          placeholder="Ej: Mi Startup Revolucionaria"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          maxLength={100}
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-ignia-dark-gray mb-2">
          Tipo de proyecto *
        </label>
        <select
          value={formData.type}
          onChange={(e) => handleInputChange('type', e.target.value as ProjectType)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        >
          {availableTypes.map(type => (
            <option key={type} value={type}>
              {typeLabels[type]}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-semibold text-ignia-dark-gray mb-2">
          Etapa actual *
        </label>
        <select
          value={formData.stage}
          onChange={(e) => handleInputChange('stage', e.target.value as ProjectStage)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        >
          {availableStages.map(stage => (
            <option key={stage} value={stage}>
              {stageLabels[stage]}
            </option>
          ))}
        </select>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-ignia-gradient-2 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-ignia-dark-gray mb-2">
          Describe tu proyecto
        </h2>
        <p className="text-gray-600">
          Ayúdanos a entender mejor tu visión y objetivos
        </p>
      </div>

      <div>
        <label className="block text-sm font-semibold text-ignia-dark-gray mb-2">
          Descripción del proyecto
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          placeholder="Describe brevemente tu proyecto, su propósito, objetivo y cualquier detalle importante..."
          rows={6}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
          maxLength={1000}
        />
        <p className="text-sm text-gray-500 mt-1">
          {formData.description?.length || 0}/1000 caracteres
        </p>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-ignia-gradient-3 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-ignia-dark-gray mb-2">
          ¡Listo para comenzar!
        </h2>
        <p className="text-gray-600">
          Revisa la información de tu proyecto antes de continuar
        </p>
      </div>

      <div className="bg-gray-50 rounded-lg p-6 space-y-4">
        <div>
          <h3 className="font-semibold text-ignia-dark-gray mb-1">Nombre</h3>
          <p className="text-gray-700">{formData.name}</p>
        </div>
        <div>
          <h3 className="font-semibold text-ignia-dark-gray mb-1">Tipo</h3>
          <p className="text-gray-700">{typeLabels[formData.type]}</p>
        </div>
        <div>
          <h3 className="font-semibold text-ignia-dark-gray mb-1">Etapa</h3>
          <p className="text-gray-700">{stageLabels[formData.stage]}</p>
        </div>
        {formData.description && (
          <div>
            <h3 className="font-semibold text-ignia-dark-gray mb-1">Descripción</h3>
            <p className="text-gray-700">{formData.description}</p>
          </div>
        )}
      </div>
    </div>
  );

  const error = localError || projectError;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        {/* Progress indicator */}
        <div className="flex items-center justify-center mb-8">
          {[1, 2, 3].map((stepNumber) => (
            <React.Fragment key={stepNumber}>
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                  stepNumber <= step
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-200 text-gray-400'
                }`}
              >
                {stepNumber}
              </div>
              {stepNumber < 3 && (
                <div
                  className={`w-12 h-1 mx-2 ${
                    stepNumber < step ? 'bg-primary-500' : 'bg-gray-200'
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Step content */}
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}

        {/* Navigation buttons */}
        <div className="flex justify-between mt-8">
          {step > 1 && (
            <button
              onClick={handleBack}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={isLoading}
            >
              Atrás
            </button>
          )}
          
          <div className="ml-auto">
            {step < 3 ? (
              <button
                onClick={handleNext}
                className="px-6 py-3 bg-ignia-gradient-1 text-ignia-dark-gray font-semibold rounded-lg hover:shadow-lg transition-all transform hover:scale-105"
                disabled={isLoading}
              >
                Siguiente
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isLoading}
                className="px-6 py-3 bg-ignia-gradient-1 text-ignia-dark-gray font-semibold rounded-lg hover:shadow-lg transition-all transform hover:scale-105 disabled:opacity-50"
              >
                {isLoading ? 'Creando...' : 'Crear Proyecto'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectOnboarding;