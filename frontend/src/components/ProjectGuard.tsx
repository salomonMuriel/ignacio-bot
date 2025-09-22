import { type ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useProjects } from '../contexts/ProjectsContext';
import LoadingScreen from './ui/LoadingScreen';

interface ProjectGuardProps {
  children: ReactNode;
  requiresProject?: boolean;
}

export default function ProjectGuard({
  children,
  requiresProject = true,
}: ProjectGuardProps) {
  const { projects, isLoading } = useProjects();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (requiresProject && projects.length === 0) {
    return <Navigate to="/create-project" replace />;
  }

  return <>{children}</>;
}
