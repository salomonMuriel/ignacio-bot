import type { Project } from "@/types";

interface ProjectCardProps {
  project: Project;
  isActive: boolean;
  onSetActive: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export default function ProjectCard({ project, isActive, onSetActive, onEdit, onDelete }: ProjectCardProps) {
  return (
    <div className="rounded-lg transition-all duration-200" style={{
      background: 'var(--ig-surface-glass)',
      border: isActive ? '2px solid var(--ig-border-accent)' : '1px solid var(--ig-border-glass)',
      backdropFilter: 'blur(10px)',
      boxShadow: isActive
        ? '0 25px 50px -12px rgba(219, 105, 52, 0.3)'
        : '0 25px 50px -12px rgba(0, 0, 0, 0.3)'
    }}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold truncate" style={{ color: 'var(--ig-text-primary)' }}>
            {project.project_name}
          </h3>
          {isActive && (
            <span className="text-xs font-medium px-2.5 py-0.5 rounded-full" style={{
              background: 'var(--ig-accent-gradient)',
              color: 'var(--ig-dark-primary)'
            }}>
              Active
            </span>
          )}
        </div>
        
        {project.description && (
          <p className="text-sm mb-4 line-clamp-3" style={{ color: 'var(--ig-text-secondary)' }}>{project.description}</p>
        )}
        
        <div className="space-y-2 mb-4">
          {project.project_type && (
            <div className="flex items-center text-sm">
              <span style={{ color: 'var(--ig-text-muted)' }}>Type:</span>
              <span className="ml-2 capitalize" style={{ color: 'var(--ig-text-primary)' }}>{project.project_type}</span>
            </div>
          )}
          {project.current_stage && (
            <div className="flex items-center text-sm">
              <span style={{ color: 'var(--ig-text-muted)' }}>Stage:</span>
              <span className="ml-2 capitalize" style={{ color: 'var(--ig-text-primary)' }}>{project.current_stage}</span>
            </div>
          )}
        </div>
        
        <div className="flex space-x-2">
          {!isActive && (
            <button
              onClick={onSetActive}
              className="flex-1 py-2 px-3 rounded text-sm font-medium transition-all duration-200"
              style={{
                background: 'var(--ig-accent-gradient)',
                color: 'var(--ig-dark-primary)'
              }}
            >
              Set Active
            </button>
          )}
          <button
            onClick={onEdit}
            className="py-2 px-3 rounded text-sm font-medium transition-all duration-200"
            style={{
              background: 'var(--ig-surface-secondary)',
              color: 'var(--ig-text-primary)',
              border: '1px solid var(--ig-border-primary)'
            }}
          >
            Edit
          </button>
          <button
            onClick={onDelete}
            className="py-2 px-3 rounded text-sm font-medium transition-all duration-200"
            style={{
              background: 'rgba(239, 68, 68, 0.1)',
              color: '#ef4444',
              border: '1px solid rgba(239, 68, 68, 0.3)'
            }}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}