import ignacioAvatar from '../../assets/ignacio_avatar.png';

export default function ChatLoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--ig-bg-gradient)' }}>
      <div className="glass-surface rounded-2xl p-8 text-center" style={{ boxShadow: 'var(--ig-shadow-xl)' }}>
        <div className="w-16 h-16 mx-auto mb-6 rounded-full glass-surface-light flex items-center justify-center overflow-hidden" style={{
          boxShadow: 'var(--ig-shadow-md), var(--ig-shadow-glow-accent)',
          animation: 'pulseGlow 2s infinite'
        }}>
          <img src={ignacioAvatar} alt="Ignacio" className="w-full h-full object-cover" />
        </div>
        <div className="flex items-center justify-center space-x-3">
          <div className="w-2 h-2 rounded-full" style={{
            background: 'var(--ig-text-accent)',
            animation: 'typingDots 1.4s infinite ease-in-out'
          }}></div>
          <div className="w-2 h-2 rounded-full" style={{
            background: 'var(--ig-text-accent)',
            animation: 'typingDots 1.4s infinite ease-in-out 0.2s'
          }}></div>
          <div className="w-2 h-2 rounded-full" style={{
            background: 'var(--ig-text-accent)',
            animation: 'typingDots 1.4s infinite ease-in-out 0.4s'
          }}></div>
        </div>
        <p className="text-lg font-medium mt-4" style={{ color: 'var(--ig-text-primary)' }}>Loading chat...</p>
        <p className="text-sm mt-2" style={{ color: 'var(--ig-text-muted)' }}>Preparing your conversation with Ignacio</p>
      </div>
    </div>
  );
}