import React, { useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useNavigate } from 'react-router-dom';
import LoadingScreen from '@/components/ui/LoadingScreen';
import { useApi } from '@/hooks/useApi';
import type { User } from '@/types';

export default function UserPage() {
  const { user: auth_user, isLoading, logout } = useAuth0();
  const [user, setUser] = useState<User | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const api = useApi();
  const navigate = useNavigate();

  useEffect(() => {

    const getUser = async () => {
      try {
        const user_response = await api.getProfile();
        // Update state with the result from the API
        setUser(user_response);
        setIsLoadingUser(false);
      } catch (error) {
        console.error("Failed to fetch profile:", error);
        setIsLoadingUser(false);
        // Handle error case, e.g., assume incomplete
      }
    };
    
    getUser();
  
  }, []);


  if (isLoading || isLoadingUser) {
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
    logout({ logoutParams: { returnTo: window.location.origin } });
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--ig-bg-gradient)' }}>
      {/* Navigation Header - Simplified like ChatPage */}
      <header className="border-b" style={{
        background: 'var(--ig-surface-glass)',
        borderColor: 'var(--ig-border-glass)',
        backdropFilter: 'blur(10px)'
      }}>
        <div className="max-w-4xl mx-auto px-4 md:px-6 py-3 md:py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2 md:space-x-4 min-w-0 flex-1">
            <button
              onClick={() => navigate('/chat')}
              className="flex items-center space-x-2 text-sm font-medium transition-colors hover:opacity-80"
              style={{ color: 'var(--ig-text-accent)' }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span>Back to Chat</span>
            </button>
            <div className="h-4 w-px" style={{ background: 'var(--ig-border-primary)' }}></div>
            <h1 className="text-lg font-semibold" style={{ color: 'var(--ig-text-primary)' }}>
              Profile
            </h1>
          </div>
          <div className="flex items-center space-x-2 md:space-x-3">
            <button
              onClick={() => navigate('/projects')}
              className="px-2 md:px-3 py-1.5 text-xs md:text-sm rounded-lg font-medium transition-all duration-200 hover:opacity-80"
              style={{
                background: 'var(--ig-surface-secondary)',
                color: 'var(--ig-text-secondary)',
                border: '1px solid var(--ig-border-primary)'
              }}
            >
              <span className="hidden sm:inline">Projects</span>
              <span className="sm:hidden">P</span>
            </button>
            <button
              onClick={handleLogout}
              className="px-2 md:px-3 py-1.5 text-xs md:text-sm rounded-lg font-medium transition-all duration-200 hover:opacity-80"
              style={{
                background: 'var(--ig-surface-secondary)',
                color: 'var(--ig-text-secondary)',
                border: '1px solid var(--ig-border-primary)'
              }}
            >
              <span className="hidden sm:inline">Sign Out</span>
              <span className="sm:hidden">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-4 md:py-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl md:text-3xl font-bold mb-2 md:mb-4" style={{ color: 'var(--ig-text-primary)' }}>
              Your Profile
            </h1>
            <p className="text-base md:text-lg" style={{ color: 'var(--ig-text-secondary)' }}>
              Manage your account settings and information
            </p>
          </div>

          {/* Profile Card */}
          <div className="rounded-lg p-4 md:p-8 mb-4 md:mb-6" style={{
            background: 'var(--ig-surface-glass)',
            border: '1px solid var(--ig-border-glass)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
          }}>
            {/* User Avatar and Basic Info */}
            <div className="text-center mb-8">
              {/* Avatar */}
              <div className="flex justify-center mb-4">
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden" style={{
                  background: 'var(--ig-surface-secondary)',
                  border: '2px solid var(--ig-border-accent)'
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
              <h2 className="text-xl md:text-2xl font-bold mb-2" style={{ color: 'var(--ig-text-primary)' }}>
                {user?.name || auth_user?.name || 'User'}
              </h2>
              <p className="text-lg mb-4" style={{ color: 'var(--ig-text-secondary)' }}>
                {user?.phone_number || 'Not provided'}
              </p>

              {/* Status Badges */}
              <div className="flex flex-col sm:flex-row justify-center items-center gap-2 sm:gap-3 mb-4 md:mb-6">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  user?.is_admin
                    ? 'text-purple-300 bg-purple-900/30 border border-purple-500/30'
                    : 'text-blue-300 bg-blue-900/30 border border-blue-500/30'
                }`}>
                  {user?.is_admin ? 'Administrator' : 'Fellow'}
                </span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  user?.is_active
                    ? 'text-green-300 bg-green-900/30 border border-green-500/30'
                    : 'text-yellow-300 bg-yellow-900/30 border border-yellow-500/30'
                }`}>
                  {user?.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>

            {/* User Information */}
            <div className="space-y-6">
              {/* Basic Information */}
              <div>
                <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--ig-text-accent)' }}>
                  Account Information
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: 'var(--ig-text-secondary)' }}>
                      Full Name
                    </label>
                    <div className="p-3 rounded-lg" style={{
                      background: 'var(--ig-surface-primary)',
                      border: '1px solid var(--ig-border-primary)',
                      color: 'var(--ig-text-primary)'
                    }}>
                      {user?.name || 'Not provided'}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: 'var(--ig-text-secondary)' }}>
                      Phone Number
                    </label>
                    <div className="p-3 rounded-lg" style={{
                      background: 'var(--ig-surface-primary)',
                      border: '1px solid var(--ig-border-primary)',
                      color: 'var(--ig-text-primary)'
                    }}>
                      {user?.phone_number || 'Not provided'}
                    </div>
                    <p className="text-xs mt-1" style={{ color: 'var(--ig-text-muted)' }}>
                      Required for WhatsApp integration
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: 'var(--ig-text-secondary)' }}>
                      Email Address
                    </label>
                    <div className="p-3 rounded-lg" style={{
                      background: 'var(--ig-surface-secondary)',
                      border: '1px solid var(--ig-border-secondary)',
                      color: 'var(--ig-text-secondary)'
                    }}>
                      {auth_user?.email || 'Not provided'}
                    </div>
                    <p className="text-xs mt-1" style={{ color: 'var(--ig-text-muted)' }}>
                      Managed through your authentication provider
                    </p>
                  </div>
                </div>
              </div>

              {/* Account Activity */}
              <div>
                <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--ig-text-accent)' }}>
                  Account Activity
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 text-center">
                  <div className="p-3 md:p-4 rounded-lg" style={{
                    background: 'var(--ig-surface-secondary)',
                    border: '1px solid var(--ig-border-primary)'
                  }}>
                    <p className="text-sm" style={{ color: 'var(--ig-text-secondary)' }}>Created</p>
                    <p className="font-medium" style={{ color: 'var(--ig-text-primary)' }}>
                      {user?.created_at ? formatDate(user.created_at) : 'Not available'}
                    </p>
                  </div>
                  <div className="p-3 md:p-4 rounded-lg" style={{
                    background: 'var(--ig-surface-secondary)',
                    border: '1px solid var(--ig-border-primary)'
                  }}>
                    <p className="text-sm" style={{ color: 'var(--ig-text-secondary)' }}>Last Updated</p>
                    <p className="font-medium" style={{ color: 'var(--ig-text-primary)' }}>
                      {user?.updated_at ? formatDate(user.updated_at) : 'Not available'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Admin Features */}
          {user?.is_admin && (
            <div className="rounded-lg p-4 md:p-6" style={{
              background: 'var(--ig-surface-glass)',
              border: '1px solid var(--ig-border-accent)',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
            }}>
              <h3 className="text-xl font-semibold mb-4" style={{ color: 'var(--ig-text-accent)' }}>
                Administrator Access
              </h3>
              <p className="mb-6" style={{ color: 'var(--ig-text-secondary)' }}>
                As an administrator, you have access to advanced management features.
              </p>
              <div className="text-center">
                <button
                  onClick={() => navigate('/admin')}
                  className="inline-flex items-center space-x-2 px-4 md:px-6 py-2 md:py-3 rounded-lg font-medium text-base md:text-lg transition-all duration-200 w-full sm:w-auto justify-center"
                  style={{
                    background: 'var(--ig-accent-gradient)',
                    color: 'var(--ig-dark-primary)',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    (e.target as HTMLButtonElement).style.background = 'var(--ig-accent-gradient-hover)';
                  }}
                  onMouseLeave={(e) => {
                    (e.target as HTMLButtonElement).style.background = 'var(--ig-accent-gradient)';
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