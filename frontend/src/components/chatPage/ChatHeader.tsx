import type { ConversationDetailResponse } from '@/types';
import ignacioAvatar from '../../assets/ignacio_avatar.png';

interface ChatHeaderProps {
  activeConversation: ConversationDetailResponse | null;
}

export default function ChatHeader({ activeConversation }: ChatHeaderProps) {
  return (
    <div className="p-6 flex-shrink-0 glass-surface" style={{
      borderBottom: '1px solid var(--ig-border-primary)',
      boxShadow: 'var(--ig-shadow-sm)'
    }}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* Ignacio Status Indicator */}
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-12 h-12 rounded-xl glass-surface-light flex items-center justify-center overflow-hidden" style={{
                boxShadow: 'var(--ig-shadow-md), var(--ig-shadow-glow-accent)'
              }}>
                <img src={ignacioAvatar} alt="Ignacio" className="w-full h-full object-cover" />
              </div>
              {/* Online status */}
              <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2" style={{
                background: '#10b981',
                borderColor: 'var(--ig-surface-primary)'
              }}></div>
            </div>

            <div>
              <h1 className="text-xl font-semibold" style={{ color: 'var(--ig-text-primary)' }}>Chat with Ignacio</h1>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#10b981' }}></div>
                <p className="text-sm" style={{ color: 'var(--ig-text-muted)' }}>
                  {activeConversation ? (activeConversation.title || 'Active Conversation') : 'Ready to help'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}