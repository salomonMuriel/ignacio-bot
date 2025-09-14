import { Project, ProjectType } from '@/types';

interface ProjectLogoProps {
  project: Project;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function ProjectLogo({ project, size = 'md', className = '' }: ProjectLogoProps) {
  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-12 h-12 text-lg',
    lg: 'w-16 h-16 text-xl'
  };

  const getProjectTypeIcon = (type?: ProjectType) => {
    switch (type) {
      case 'startup':
        return '🚀';
      case 'ngo':
        return '🤝';
      case 'foundation':
        return '🏛️';
      case 'spinoff':
        return '🌿';
      case 'internal':
        return '🏢';
      case 'company':
        return '🏭';
      default:
        return '💼';
    }
  };

  const getProjectTypeColor = (type?: ProjectType) => {
    switch (type) {
      case 'startup':
        return 'bg-blue-500';
      case 'ngo':
        return 'bg-green-500';
      case 'foundation':
        return 'bg-purple-500';
      case 'spinoff':
        return 'bg-orange-500';
      case 'internal':
        return 'bg-gray-500';
      case 'company':
        return 'bg-indigo-500';
      default:
        return 'bg-slate-500';
    }
  };

  return (
    <div className={`${sizeClasses[size]} ${className} flex items-center justify-center rounded-lg ${getProjectTypeColor(project.project_type)} text-white font-bold`}>
      <span>{getProjectTypeIcon(project.project_type)}</span>
    </div>
  );
}

export default ProjectLogo;