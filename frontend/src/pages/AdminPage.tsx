import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import AuthRequiredScreen from '../components/ui/AuthRequiredScreen';
import PromptTemplateManager from '../components/admin/PromptTemplateManager';

type AdminTab = 'prompt-templates' | 'user-management' | 'statistics';

export default function AdminPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>('prompt-templates');

  if (!user) {
    return <AuthRequiredScreen />;
  }

  if (!user.is_admin) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-4"
        style={{ background: 'var(--ig-bg-gradient)' }}
      >
        <div
          className="text-center p-8 rounded-xl glass-surface"
          style={{
            border: '1px solid var(--ig-border-glass)',
            backdropFilter: 'var(--ig-blur-lg)',
            maxWidth: '400px',
          }}
        >
          <div
            className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
            style={{
              background: 'var(--ig-surface-glass-light)',
              border: '2px solid var(--ig-border-accent)',
            }}
          >
            <svg
              className="w-8 h-8"
              fill="currentColor"
              style={{ color: 'var(--ig-text-accent)' }}
              viewBox="0 0 24 24"
            >
              <path d="M12,1L3,5V11C3,16.55 6.84,21.74 12,23C17.16,21.74 21,16.55 21,11V5L12,1M12,7C13.4,7 14.8,8.6 14.8,10V11.5C15.4,11.5 16,12.4 16,13V16C16,17.4 15.4,18 14.8,18H9.2C8.6,18 8,17.4 8,16V13C8,12.4 8.6,11.5 9.2,11.5V10C9.2,8.6 10.6,7 12,7M12,8.2C11.2,8.2 10.5,8.7 10.5,10V11.5H13.5V10C13.5,8.7 12.8,8.2 12,8.2Z" />
            </svg>
          </div>
          <h2
            className="text-xl font-semibold mb-2"
            style={{ color: 'var(--ig-text-primary)' }}
          >
            Access Denied
          </h2>
          <p style={{ color: 'var(--ig-text-muted)' }}>
            You need administrator privileges to access this page.
          </p>
        </div>
      </div>
    );
  }

  const tabs = [
    {
      id: 'prompt-templates' as AdminTab,
      label: 'Prompt Templates',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
        </svg>
      ),
      available: true,
    },
    {
      id: 'user-management' as AdminTab,
      label: 'User Management',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12,5.5A3.5,3.5 0 0,1 15.5,9A3.5,3.5 0 0,1 12,12.5A3.5,3.5 0 0,1 8.5,9A3.5,3.5 0 0,1 12,5.5M5,8C5.56,8 6.08,8.15 6.53,8.42C6.38,9.85 6.8,11.27 7.66,12.38C7.16,13.34 6.16,14 5,14A3,3 0 0,1 2,11A3,3 0 0,1 5,8M19,8A3,3 0 0,1 22,11A3,3 0 0,1 19,14C17.84,14 16.84,13.34 16.34,12.38C17.2,11.27 17.62,9.85 17.47,8.42C17.92,8.15 18.44,8 19,8M5.5,18.25C5.5,16.18 8.41,14.5 12,14.5C15.59,14.5 18.5,16.18 18.5,18.25V20H5.5V18.25M0,20V18.5C0,17.11 1.89,15.94 4.45,15.6C3.86,16.28 3.5,17.22 3.5,18.25V20H0M24,20H20.5V18.25C20.5,17.22 20.14,16.28 19.55,15.6C22.11,15.94 24,17.11 24,18.5V20Z" />
        </svg>
      ),
      available: false,
    },
    {
      id: 'statistics' as AdminTab,
      label: 'Usage Statistics',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M22,21H2V3H4V19H6V17H10V19H12V16H16V19H18V17H22V21M16,8H18V15H16V8M12,2H14V15H12V2M8,9H10V15H8V9M4,11H6V15H4V11Z" />
        </svg>
      ),
      available: false,
    },
  ];

  return (
    <div
      className="min-h-screen"
      style={{ background: 'var(--ig-bg-gradient)' }}
    >
      {/* Header */}
      <div
        className="border-b glass-surface"
        style={{
          borderColor: 'var(--ig-border-primary)',
          backdropFilter: 'var(--ig-blur-lg)',
          position: 'sticky',
          top: 0,
          zIndex: 10,
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{
                  background: 'var(--ig-accent-gradient)',
                  boxShadow: 'var(--ig-shadow-md)',
                }}
              >
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  style={{ color: 'var(--ig-dark-primary)' }}
                  viewBox="0 0 24 24"
                >
                  <path d="M12,1L3,5V11C3,16.55 6.84,21.74 12,23C17.16,21.74 21,16.55 21,11V5L12,1M12,7C13.4,7 14.8,8.6 14.8,10V11.5C15.4,11.5 16,12.4 16,13V16C16,17.4 15.4,18 14.8,18H9.2C8.6,18 8,17.4 8,16V13C8,12.4 8.6,11.5 9.2,11.5V10C9.2,8.6 10.6,7 12,7M12,8.2C11.2,8.2 10.5,8.7 10.5,10V11.5H13.5V10C13.5,8.7 12.8,8.2 12,8.2Z" />
                </svg>
              </div>
              <div>
                <h1
                  className="text-xl font-semibold"
                  style={{ color: 'var(--ig-text-primary)' }}
                >
                  Admin Dashboard
                </h1>
                <p
                  className="text-sm"
                  style={{ color: 'var(--ig-text-muted)' }}
                >
                  Manage Ignacio Bot settings and content
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span
                className="text-sm"
                style={{ color: 'var(--ig-text-muted)' }}
              >
                {user.name || user.phone_number}
              </span>
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{
                  background: 'var(--ig-surface-glass-light)',
                  border: '1px solid var(--ig-border-glass)',
                }}
              >
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  style={{ color: 'var(--ig-text-accent)' }}
                  viewBox="0 0 24 24"
                >
                  <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M7.07,18.28C7.5,17.38 10.12,16.5 12,16.5C13.88,16.5 16.5,17.38 16.93,18.28C15.57,19.36 13.86,20 12,20C10.14,20 8.43,19.36 7.07,18.28M18.36,16.83C16.93,15.09 13.46,14.5 12,14.5C10.54,14.5 7.07,15.09 5.64,16.83C4.62,15.5 4,13.82 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,13.82 19.38,15.5 18.36,16.83M12,6C10.06,6 8.5,7.56 8.5,9.5C8.5,11.44 10.06,13 12,13C13.94,13 15.5,11.44 15.5,9.5C15.5,7.56 13.94,6 12,6M12,11A1.5,1.5 0 0,1 10.5,9.5A1.5,1.5 0 0,1 12,8A1.5,1.5 0 0,1 13.5,9.5A1.5,1.5 0 0,1 12,11Z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="mb-8">
          <div
            className="flex space-x-1 p-1 rounded-xl"
            style={{
              background: 'var(--ig-surface-glass-light)',
              border: '1px solid var(--ig-border-glass)',
              backdropFilter: 'var(--ig-blur-sm)',
            }}
          >
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => tab.available && setActiveTab(tab.id)}
                disabled={!tab.available}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-300 flex-1 justify-center"
                style={{
                  background:
                    activeTab === tab.id
                      ? 'var(--ig-accent-gradient)'
                      : 'transparent',
                  color:
                    activeTab === tab.id
                      ? 'var(--ig-dark-primary)'
                      : tab.available
                        ? 'var(--ig-text-primary)'
                        : 'var(--ig-text-muted)',
                  cursor: tab.available ? 'pointer' : 'not-allowed',
                  opacity: tab.available ? 1 : 0.5,
                  boxShadow:
                    activeTab === tab.id ? 'var(--ig-shadow-md)' : 'none',
                }}
              >
                {tab.icon}
                <span>{tab.label}</span>
                {!tab.available && (
                  <span
                    className="text-xs px-2 py-0.5 rounded-full"
                    style={{
                      background: 'var(--ig-surface-glass-dark)',
                      color: 'var(--ig-text-muted)',
                    }}
                  >
                    Soon
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'prompt-templates' && <PromptTemplateManager />}

          {activeTab === 'user-management' && (
            <div className="text-center py-16">
              <div
                className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
                style={{
                  background: 'var(--ig-surface-glass-light)',
                  border: '2px solid var(--ig-border-glass)',
                }}
              >
                <svg
                  className="w-8 h-8"
                  fill="currentColor"
                  style={{ color: 'var(--ig-text-muted)' }}
                  viewBox="0 0 24 24"
                >
                  <path d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z" />
                </svg>
              </div>
              <h3
                className="text-lg font-semibold mb-2"
                style={{ color: 'var(--ig-text-primary)' }}
              >
                User Management
              </h3>
              <p style={{ color: 'var(--ig-text-muted)' }}>
                User management features will be available soon.
              </p>
            </div>
          )}

          {activeTab === 'statistics' && (
            <div className="text-center py-16">
              <div
                className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
                style={{
                  background: 'var(--ig-surface-glass-light)',
                  border: '2px solid var(--ig-border-glass)',
                }}
              >
                <svg
                  className="w-8 h-8"
                  fill="currentColor"
                  style={{ color: 'var(--ig-text-muted)' }}
                  viewBox="0 0 24 24"
                >
                  <path d="M22,21H2V3H4V19H6V17H10V19H12V16H16V19H18V17H22V21M16,8H18V15H16V8M12,2H14V15H12V2M8,9H10V15H8V9M4,11H6V15H4V11Z" />
                </svg>
              </div>
              <h3
                className="text-lg font-semibold mb-2"
                style={{ color: 'var(--ig-text-primary)' }}
              >
                Usage Statistics
              </h3>
              <p style={{ color: 'var(--ig-text-muted)' }}>
                Statistics and analytics features will be available soon.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
