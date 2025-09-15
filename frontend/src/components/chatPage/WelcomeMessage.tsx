import type { Project } from '@/types';
import ignacioAvatar from '../../assets/ignacio_avatar.png';

interface WelcomeMessageProps {
  activeProject: Project | null;
}

export default function WelcomeMessage({ activeProject }: WelcomeMessageProps) {
  return (
    <div className="text-center mt-8" style={{
      color: 'var(--ig-text-muted)',
      animation: 'fadeInScale 0.4s var(--ig-spring)'
    }}>
      <div
        className="glass-surface rounded-2xl p-8 max-w-2xl mx-auto"
        style={{
          boxShadow: 'var(--ig-shadow-lg)'
        }}
      >
        {/* Ignacio Avatar */}
        <div className="w-16 h-16 mx-auto mb-6 rounded-full glass-surface-light flex items-center justify-center overflow-hidden" style={{
          boxShadow: 'var(--ig-shadow-md), var(--ig-shadow-glow-accent)'
        }}>
          <img src={ignacioAvatar} alt="Ignacio" className="w-full h-full object-cover" />
        </div>

        <h3 className="text-xl font-semibold mb-4" style={{ color: 'var(--ig-text-primary)' }}>
          Welcome to your chat with Ignacio!
        </h3>
        <p className="mb-4" style={{ color: 'var(--ig-text-secondary)' }}>
          I'm here to help you develop your project: <strong style={{ color: 'var(--ig-text-accent)' }}>{activeProject?.project_name}</strong>
        </p>
        <p className="mb-6" style={{ color: 'var(--ig-text-secondary)' }}>
          Ask me anything about marketing, technical implementation, business strategy,
          or any other aspect of your project. I can also help you with:
        </p>
        <ul className="text-left space-y-3 mb-6" style={{ color: 'var(--ig-text-secondary)' }}>
          <li className="flex items-center space-x-3">
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--ig-accent-gradient)' }}></span>
            <span>Market research and validation</span>
          </li>
          <li className="flex items-center space-x-3">
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--ig-accent-gradient)' }}></span>
            <span>Technical architecture and implementation</span>
          </li>
          <li className="flex items-center space-x-3">
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--ig-accent-gradient)' }}></span>
            <span>Business model development</span>
          </li>
          <li className="flex items-center space-x-3">
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--ig-accent-gradient)' }}></span>
            <span>Financial planning and analysis</span>
          </li>
          <li className="flex items-center space-x-3">
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--ig-accent-gradient)' }}></span>
            <span>Project management and roadmapping</span>
          </li>
        </ul>
        <p className="text-sm" style={{ color: 'var(--ig-text-muted)' }}>
          Type your message below to get started!
        </p>
      </div>
    </div>
  );
}