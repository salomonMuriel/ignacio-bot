/**
 * Project Manager Component
 * Handles project switching, editing, and management
 */

import React, { useState } from 'react';
import { Project, ProjectType, ProjectStage, ProjectUpdateRequest } from '../../types';
import { useProject } from '../../contexts/ProjectContext';

interface ProjectManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

const ProjectManager: React.FC<ProjectManagerProps> = ({ isOpen, onClose }) => {
  const {
    projects,
    activeProject,
    setActiveProject,
    updateProject,
    deleteProject,
    isLoading,
    error,
    clearError,
  } = useProject();

  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [editForm, setEditForm] = useState<ProjectUpdateRequest>({});

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

  const handleSwitchProject = (project: Project) => {
    setActiveProject(project);
    onClose();
  };

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    setEditForm({
      name: project.name,
      type: project.type,
      stage: project.stage,
      description: project.description || undefined,
    });
  };

  const handleSaveEdit = async () => {
    if (!editingProject) return;

    try {
      await updateProject(editingProject.id, editForm);
      setEditingProject(null);
      setEditForm({});
    } catch (error) {
      // Error is handled by context
    }
  };

  const handleCancelEdit = () => {
    setEditingProject(null);
    setEditForm({});
    clearError();
  };

  const handleDeleteProject = async (project: Project) => {
    if (!window.confirm(`¿Estás seguro de que quieres eliminar el proyecto "${project.name}"?`)) {
      return;
    }

    try {
      await deleteProject(project.id);
    } catch (error) {
      // Error is handled by context
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-ignia-gradient-1 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-ignia-dark-gray">
            Gestión de Proyectos
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6 text-ignia-dark-gray" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-50 border-b border-red-200 text-red-700 px-6 py-3">
            <div className="flex justify-between items-center">
              <span>{error}</span>
              <button
                onClick={clearError}
                className="text-red-800 hover:text-red-900"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {projects.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h3M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 8h1m4 0h1" />
              </svg>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay proyectos</h3>
              <p className="text-gray-600">Crea tu primer proyecto para comenzar.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {projects.map((project) => (
                <div
                  key={project.id}
                  className={`border rounded-xl p-6 transition-all ${
                    activeProject?.id === project.id
                      ? 'border-primary-500 bg-primary-50 shadow-lg'
                      : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
                  }`}
                >
                  {editingProject?.id === project.id ? (
                    /* Edit Form */
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-ignia-dark-gray mb-2">
                          Nombre del proyecto
                        </label>
                        <input
                          type="text"
                          value={editForm.name || ''}
                          onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-ignia-dark-gray mb-2">
                            Tipo
                          </label>
                          <select
                            value={editForm.type || project.type}
                            onChange={(e) => setEditForm(prev => ({ ...prev, type: e.target.value as ProjectType }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          >
                            {Object.entries(typeLabels).map(([value, label]) => (
                              <option key={value} value={value}>{label}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-ignia-dark-gray mb-2">
                            Etapa
                          </label>
                          <select
                            value={editForm.stage || project.stage}
                            onChange={(e) => setEditForm(prev => ({ ...prev, stage: e.target.value as ProjectStage }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          >
                            {Object.entries(stageLabels).map(([value, label]) => (
                              <option key={value} value={value}>{label}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-ignia-dark-gray mb-2">
                          Descripción
                        </label>
                        <textarea
                          value={editForm.description || ''}
                          onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
                        />
                      </div>

                      <div className="flex justify-end space-x-3">
                        <button
                          onClick={handleCancelEdit}
                          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                          disabled={isLoading}
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={handleSaveEdit}
                          className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50"
                          disabled={isLoading}
                        >
                          {isLoading ? 'Guardando...' : 'Guardar'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Project Display */
                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-bold text-ignia-dark-gray">
                              {project.name}
                            </h3>
                            {activeProject?.id === project.id && (
                              <span className="px-2 py-1 bg-primary-500 text-white text-xs font-semibold rounded-full">
                                Activo
                              </span>
                            )}
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                            <span className="inline-flex items-center">
                              <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                              {typeLabels[project.type]}
                            </span>
                            <span className="inline-flex items-center">
                              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                              {stageLabels[project.stage]}
                            </span>
                          </div>
                          {project.description && (
                            <p className="text-gray-700 text-sm">
                              {project.description}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center space-x-2 ml-4">
                          {activeProject?.id !== project.id && (
                            <button
                              onClick={() => handleSwitchProject(project)}
                              className="px-3 py-1 bg-ignia-gradient-1 text-ignia-dark-gray text-sm font-semibold rounded-lg hover:shadow-lg transition-all"
                            >
                              Activar
                            </button>
                          )}
                          <button
                            onClick={() => handleEditProject(project)}
                            className="p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDeleteProject(project)}
                            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>

                      <div className="text-xs text-gray-500">
                        Creado: {formatDate(project.created_at)}
                        {project.updated_at !== project.created_at && (
                          <> • Actualizado: {formatDate(project.updated_at)}</>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectManager;