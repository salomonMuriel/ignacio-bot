'use client';

import { ProjectType } from '@/types';

interface ProjectLogoProps {
  project: { project_name: string; project_type?: ProjectType | null } | null;
  projectName?: string;
  projectType?: ProjectType | null;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  title?: string;
}

const sizeClasses = {
  xs: 'w-4 h-4 text-xs',
  sm: 'w-8 h-8 text-sm',
  md: 'w-12 h-12 text-lg',
  lg: 'w-16 h-16 text-xl',
  xl: 'w-24 h-24 text-3xl',
};

const typeColors = {
  startup: 'from-purple-500 to-pink-500',
  company: 'from-blue-600 to-indigo-600',
  ngo: 'from-green-500 to-emerald-500',
  foundation: 'from-red-500 to-rose-500',
  spinoff: 'from-orange-500 to-amber-500',
  internal: 'from-gray-600 to-slate-600',
  other: 'from-teal-500 to-cyan-500',
};

const defaultGradient = 'from-blue-600 to-green-600';

function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map(word => word.charAt(0).toUpperCase())
    .join('');
}

function getColorGradient(projectType?: ProjectType | null): string {
  if (!projectType || !(projectType in typeColors)) {
    return defaultGradient;
  }
  return typeColors[projectType];
}

export function ProjectLogo({ 
  project,
  projectName, 
  projectType, 
  size = 'md', 
  className = '',
  title
}: ProjectLogoProps) {
  // Support both project object and individual props
  const name = project?.project_name || projectName || '';
  const type = project?.project_type || projectType;
  
  if (!name) return null;
  
  const initials = getInitials(name);
  const gradient = getColorGradient(type);
  const sizeClass = sizeClasses[size];

  return (
    <div 
      className={`${sizeClass} bg-gradient-to-br ${gradient} rounded-lg flex items-center justify-center font-bold text-white shadow-lg ${className}`}
      title={title || name}
    >
      {initials}
    </div>
  );
}

export default ProjectLogo;