import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import LoadingScreen from '@/components/ui/LoadingScreen';

export default function UserPage() {
  const { user, isLoading, logout } = useAuth();
  const navigate = useNavigate();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--ig-bg-gradient)' }}>
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--ig-text-primary)' }}>
            User Not Found
          </h2>
          <p style={{ color: 'var(--ig-text-secondary)' }}>
            Please log in to view your profile.
          </p>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--ig-bg-gradient)' }}>
      {/* Navigation Header */}
      <header className="p-6" style={{
        background: 'var(--ig-surface-glass)',
        borderBottom: '1px solid var(--ig-border-primary)',
        backdropFilter: 'blur(10px)'
      }}>
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/projects')}
              className="font-medium transition-colors"
              style={{ color: 'var(--ig-text-accent)' }}
              onMouseEnter={(e) => (e.target as HTMLButtonElement).style.color = 'var(--ig-accent-primary)'}
              onMouseLeave={(e) => (e.target as HTMLButtonElement).style.color = 'var(--ig-text-accent)'}
            >
              ← Back to Projects
            </button>
            <h1 className="text-2xl font-semibold" style={{ color: 'var(--ig-text-primary)' }}>
              User Profile
            </h1>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 rounded-lg font-medium transition-all duration-200"
            style={{
              background: 'var(--ig-surface-secondary)',
              color: 'var(--ig-text-primary)',
              border: '1px solid var(--ig-border-primary)'
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLButtonElement).style.background = 'var(--ig-surface-glass)';
              (e.target as HTMLButtonElement).style.color = 'var(--ig-text-accent)';
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLButtonElement).style.background = 'var(--ig-surface-secondary)';
              (e.target as HTMLButtonElement).style.color = 'var(--ig-text-primary)';
            }}
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto p-6">
        <div className="rounded-lg p-8" style={{
          background: 'var(--ig-surface-glass)',
          border: '1px solid var(--ig-border-glass)',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
        }}>
          {/* User Avatar and Basic Info */}
          <div className="flex items-start space-x-6 mb-8">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <div className="w-24 h-24 rounded-lg overflow-hidden" style={{
                background: 'var(--ig-surface-secondary)',
                border: '1px solid var(--ig-border-primary)'
              }}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none" className="w-full h-full">
                  <rect fill="#f1f4dc" width="100" height="100" x="0" y="0" />
                  <g transform="translate(5, -4) rotate(-19 50 70)">
                    <path d="M95 53.33C95 29.4 74.85 10 50 10S5 29.4 5 53.33V140h90V53.33Z" fill="#f88c49"/>
                    <g transform="translate(29 33)">
                      <g transform="translate(6, 9) rotate(3 21 21)">
                        <g transform="translate(0 2)">
                          <path d="M8 8.36S8 4 12 4s4 4.36 4 4.36v2.91s0 .73-.67.73c-.66 0-.66-2.9-3.33-2.9S9.33 12 8.67 12C8 12 8 11.27 8 11.27v-2.9ZM26 8.36S26 4 30 4s4 4.36 4 4.36v2.91s0 .73-.67.73c-.66 0-.66-2.9-3.33-2.9S27.33 12 26.67 12c-.67 0-.67-.73-.67-.73v-2.9Z" fill="#ffffff"/>
                        </g>
                        <g transform="translate(6 26)">
                          <path d="M15.5 10c-5.07 0-9.3-5.23-8.37-5.88.93-.65 3.45 2.15 8.37 2.15 4.92 0 7.44-2.88 8.37-2.15.93.73-3.3 5.88-8.37 5.88Z" fill="#ffffff"/>
                        </g>
                      </g>
                    </g>
                  </g>
                </svg>
              </div>
            </div>

            {/* User Details */}
            <div className="flex-1">
              <h2 className="text-3xl font-bold mb-2" style={{ color: 'var(--ig-text-primary)' }}>
                {user.name || 'User'}
              </h2>
              <p className="text-lg mb-2" style={{ color: 'var(--ig-text-secondary)' }}>
                {user.phone_number}
              </p>
              <div className="flex items-center space-x-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  user.is_admin
                    ? 'text-purple-300 bg-purple-900/30 border border-purple-500/30'
                    : 'text-blue-300 bg-blue-900/30 border border-blue-500/30'
                }`}>
                  {user.is_admin ? 'Administrator' : 'User'}
                </span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  user.is_active
                    ? 'text-green-300 bg-green-900/30 border border-green-500/30'
                    : 'text-red-300 bg-red-900/30 border border-red-500/30'
                }`}>
                  {user.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>

          {/* User Information Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Account Details */}
            <div className="rounded-lg p-6" style={{
              background: 'var(--ig-surface-secondary)',
              border: '1px solid var(--ig-border-primary)'
            }}>
              <h3 className="text-xl font-semibold mb-4" style={{ color: 'var(--ig-text-primary)' }}>
                Account Details
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--ig-text-secondary)' }}>
                    User ID
                  </label>
                  <p className="font-mono text-sm px-2 py-1 rounded" style={{
                    color: 'var(--ig-text-primary)',
                    background: 'var(--ig-surface-glass)',
                    border: '1px solid var(--ig-border-glass)'
                  }}>
                    {user.id}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--ig-text-secondary)' }}>
                    Phone Number
                  </label>
                  <p style={{ color: 'var(--ig-text-primary)' }}>
                    {user.phone_number}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--ig-text-secondary)' }}>
                    Name
                  </label>
                  <p style={{ color: 'var(--ig-text-primary)' }}>
                    {user.name || 'Not provided'}
                  </p>
                </div>
              </div>
            </div>

            {/* Account Activity */}
            <div className="rounded-lg p-6" style={{
              background: 'var(--ig-surface-secondary)',
              border: '1px solid var(--ig-border-primary)'
            }}>
              <h3 className="text-xl font-semibold mb-4" style={{ color: 'var(--ig-text-primary)' }}>
                Account Activity
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--ig-text-secondary)' }}>
                    Account Created
                  </label>
                  <p style={{ color: 'var(--ig-text-primary)' }}>
                    {formatDate(user.created_at)}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--ig-text-secondary)' }}>
                    Last Updated
                  </label>
                  <p style={{ color: 'var(--ig-text-primary)' }}>
                    {formatDate(user.updated_at)}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--ig-text-secondary)' }}>
                    Account Status
                  </label>
                  <p style={{ color: 'var(--ig-text-primary)' }}>
                    {user.is_active ? 'Active and enabled' : 'Inactive'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Admin Features */}
          {user.is_admin && (
            <div className="mt-8 rounded-lg p-6" style={{
              background: 'var(--ig-surface-glass)',
              border: '1px solid var(--ig-border-accent)',
              backdropFilter: 'blur(10px)'
            }}>
              <h3 className="text-xl font-semibold mb-4" style={{ color: 'var(--ig-text-accent)' }}>
                Administrator Features
              </h3>
              <p className="mb-4" style={{ color: 'var(--ig-text-secondary)' }}>
                As an administrator, you have access to advanced features and can manage other users.
              </p>
              <div className="space-y-4">
                <div className="space-y-2">
                  <p className="text-sm" style={{ color: 'var(--ig-text-secondary)' }}>
                    • Manage prompt templates for user interactions
                  </p>
                  <p className="text-sm" style={{ color: 'var(--ig-text-secondary)' }}>
                    • View all user conversations and analytics
                  </p>
                  <p className="text-sm" style={{ color: 'var(--ig-text-secondary)' }}>
                    • Create, edit, and delete user accounts
                  </p>
                  <p className="text-sm" style={{ color: 'var(--ig-text-secondary)' }}>
                    • Manage system settings and configurations
                  </p>
                </div>
                
                <button
                  onClick={() => navigate('/admin')}
                  className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-300"
                  style={{
                    background: 'var(--ig-accent-gradient)',
                    color: 'var(--ig-dark-primary)',
                    boxShadow: 'var(--ig-shadow-md)'
                  }}
                  onMouseEnter={(e) => {
                    const target = e.target as HTMLButtonElement;
                    target.style.background = 'var(--ig-accent-gradient-hover)';
                    target.style.transform = 'translateY(-1px)';
                    target.style.boxShadow = 'var(--ig-shadow-lg)';
                  }}
                  onMouseLeave={(e) => {
                    const target = e.target as HTMLButtonElement;
                    target.style.background = 'var(--ig-accent-gradient)';
                    target.style.transform = 'translateY(0)';
                    target.style.boxShadow = 'var(--ig-shadow-md)';
                  }}
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12,1L3,5V11C3,16.55 6.84,21.74 12,23C17.16,21.74 21,16.55 21,11V5L12,1M12,7C13.4,7 14.8,8.6 14.8,10V11.5C15.4,11.5 16,12.4 16,13V16C16,17.4 15.4,18 14.8,18H9.2C8.6,18 8,17.4 8,16V13C8,12.4 8.6,11.5 9.2,11.5V10C9.2,8.6 10.6,7 12,7M12,8.2C11.2,8.2 10.5,8.7 10.5,10V11.5H13.5V10C13.5,8.7 12.8,8.2 12,8.2Z" />
                  </svg>
                  <span>Open Admin Dashboard</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}