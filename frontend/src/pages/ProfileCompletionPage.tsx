import { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApi } from '../hooks/useApi';

interface ProfileData {
  name: string;
  phone_number: string;
  email?: string;
}

export default function ProfileCompletionPage() {
  const { user, isLoading } = useAuth0();
  const api = useApi();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<ProfileData>({
    name: '',
    phone_number: '',
    email: ''
  });

  useEffect(() => {
    if (!isLoading && user) {
      // Pre-fill name from Auth0 if available
      setFormData({
        name: '',
        phone_number: '',
        email: user.email
      });
    }
  }, [user, isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone_number.trim()) return;

    setIsSubmitting(true);
    try {
      // Update user profile via API
      api.updateProfile(formData)

      // Navigate to intended destination or dashboard
      const redirectTo = '/chat';
      navigate(redirectTo, {replace: true});
      window.location.reload()
    } catch (error) {
      console.error('Failed to update profile:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatPhoneNumber = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');

    // Format as (XXX) XXX-XXXX
    if (digits.length >= 10) {
      return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
    } else if (digits.length >= 6) {
      return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
    } else if (digits.length >= 3) {
      return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    }
    return digits;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setFormData({ ...formData, phone_number: formatted });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--ig-bg-gradient)' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2" style={{ borderColor: 'var(--ig-accent-primary)' }}></div>
          <p className="mt-4" style={{ color: 'var(--ig-text-secondary)' }}>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--ig-bg-gradient)' }}>
      <div className="container mx-auto px-4 py-8 sm:py-16">
        <div className="max-w-sm sm:max-w-md md:max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold mb-4" style={{ color: 'var(--ig-text-primary)' }}>
              Complete Your Profile
            </h1>
            <p className="text-base sm:text-lg" style={{ color: 'var(--ig-text-secondary)' }}>
              We need a few more details to personalize your experience with Ignacio.
            </p>
          </div>

          {/* Form */}
          <div className="rounded-lg p-4 sm:p-6 md:p-8" style={{
            background: 'var(--ig-surface-glass)',
            border: '1px solid var(--ig-border-glass)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
          }}>
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--ig-text-accent)' }}>
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-4 sm:p-3 rounded-lg transition-all duration-200 text-base"
                  style={{
                    background: 'var(--ig-surface-primary)',
                    border: '1px solid var(--ig-border-primary)',
                    color: 'var(--ig-text-primary)'
                  }}
                  placeholder="Enter your full name"
                  autoCapitalize="words"
                  autoComplete="name"
                  inputMode="text"
                  onFocus={(e) => (e.target as HTMLInputElement).style.borderColor = 'var(--ig-border-accent)'}
                  onBlur={(e) => (e.target as HTMLInputElement).style.borderColor = 'var(--ig-border-primary)'}
                />
                <p className="text-xs mt-1" style={{ color: 'var(--ig-text-muted)' }}>
                  This helps Ignacio address you personally in conversations
                </p>
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--ig-text-accent)' }}>
                  Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  value={formData.phone_number}
                  onChange={handlePhoneChange}
                  className="w-full p-4 sm:p-3 rounded-lg transition-all duration-200 text-base"
                  style={{
                    background: 'var(--ig-surface-primary)',
                    border: '1px solid var(--ig-border-primary)',
                    color: 'var(--ig-text-primary)'
                  }}
                  placeholder="(555) 123-4567"
                  autoComplete="tel"
                  inputMode="tel"
                  maxLength={14}
                  onFocus={(e) => (e.target as HTMLInputElement).style.borderColor = 'var(--ig-border-accent)'}
                  onBlur={(e) => (e.target as HTMLInputElement).style.borderColor = 'var(--ig-border-primary)'}
                />
                <p className="text-xs mt-1" style={{ color: 'var(--ig-text-muted)' }}>
                  Required for WhatsApp integration and account security
                </p>
              </div>

              {/* Email Display */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--ig-text-accent)' }}>
                  Email Address
                </label>
                <div className="w-full p-3 rounded-lg" style={{
                  background: 'var(--ig-surface-secondary)',
                  border: '1px solid var(--ig-border-secondary)',
                  color: 'var(--ig-text-secondary)'
                }}>
                  {user?.email || 'Not provided'}
                </div>
                <p className="text-xs mt-1" style={{ color: 'var(--ig-text-muted)' }}>
                  Email is already configured through your login
                </p>
              </div>

              {/* Submit Button */}
              <div className="pt-4 sm:pt-6">
                <button
                  type="submit"
                  disabled={!formData.name.trim() || !formData.phone_number.trim() || isSubmitting}
                  className="w-full py-5 sm:py-4 px-6 rounded-lg font-medium text-base sm:text-lg transition-all duration-200"
                  style={{
                    background: (!formData.name.trim() || !formData.phone_number.trim() || isSubmitting)
                      ? 'rgba(89, 47, 126, 0.5)'
                      : 'var(--ig-accent-gradient)',
                    color: (!formData.name.trim() || !formData.phone_number.trim() || isSubmitting)
                      ? 'var(--ig-text-muted)'
                      : 'var(--ig-dark-primary)',
                    cursor: (!formData.name.trim() || !formData.phone_number.trim() || isSubmitting)
                      ? 'not-allowed' : 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    if (formData.name.trim() && formData.phone_number.trim() && !isSubmitting) {
                      (e.target as HTMLButtonElement).style.background = 'var(--ig-accent-gradient-hover)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (formData.name.trim() && formData.phone_number.trim() && !isSubmitting) {
                      (e.target as HTMLButtonElement).style.background = 'var(--ig-accent-gradient)';
                    }
                  }}
                >
                  {isSubmitting ? 'Completing Profile...' : 'Complete Profile & Continue'}
                </button>
                <p className="text-xs text-center mt-2" style={{ color: 'var(--ig-text-muted)' }}>
                  You can update these details later in your settings
                </p>
              </div>
            </form>
          </div>

          {/* Privacy Notice */}
          <div className="mt-6 sm:mt-8 rounded-lg p-4 sm:p-6" style={{
            background: 'var(--ig-surface-glass)',
            border: '1px solid var(--ig-border-glass)',
            backdropFilter: 'blur(10px)'
          }}>
            <h3 className="font-semibold mb-2" style={{ color: 'var(--ig-text-accent)' }}>Privacy & Security</h3>
            <ul className="space-y-2 text-sm" style={{ color: 'var(--ig-text-secondary)' }}>
              <li>• Your information is encrypted and stored securely</li>
              <li>• We only use your phone number for WhatsApp integration and account verification</li>
              <li>• Your data is never shared with third parties without your consent</li>
              <li>• You can update or delete your information at any time</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}