export default function AuthRequiredScreen() {
  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: 'var(--ig-bg-gradient)' }}
    >
      <div
        className="glass-surface rounded-2xl p-8 text-center"
        style={{ boxShadow: 'var(--ig-shadow-xl)' }}
      >
        <div
          className="w-16 h-16 mx-auto mb-6 rounded-full glass-surface-light flex items-center justify-center"
          style={{
            boxShadow: 'var(--ig-shadow-md)',
            border: '2px solid var(--ig-border-accent)',
          }}
        >
          <svg
            className="w-8 h-8"
            style={{ color: 'var(--ig-text-accent)' }}
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z" />
          </svg>
        </div>
        <p
          className="text-lg font-medium mb-2"
          style={{ color: 'var(--ig-text-primary)' }}
        >
          Authentication Required
        </p>
        <p className="text-sm" style={{ color: 'var(--ig-text-muted)' }}>
          Please log in to access chat with Ignacio
        </p>
      </div>
    </div>
  );
}
