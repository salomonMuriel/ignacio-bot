import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useProjects } from '../contexts/ProjectsContext';

interface ProjectGuardProps {
  children: ReactNode;
  requiresProject?: boolean;
}

export default function ProjectGuard({ children, requiresProject = true }: ProjectGuardProps) {
  const { projects, isLoading } = useProjects();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading projects...</div>
      </div>
    );
  }

  if (requiresProject && projects.length === 0) {
    return <Navigate to="/create-project" replace />;
  }

  return <>{children}</>;
}