import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface LoginModalProps {
  onClose: () => void;
}

type LoginStep = 'phone' | 'otp';

interface Country {
  code: string;
  name: string;
  flag: string;
  dialCode: string;
}

const countries: Country[] = [
  { code: 'CO', name: 'Colombia', flag: '🇨🇴', dialCode: '+57' },
  { code: 'US', name: 'United States', flag: '🇺🇸', dialCode: '+1' },
  { code: 'MX', name: 'Mexico', flag: '🇲🇽', dialCode: '+52' },
  { code: 'AR', name: 'Argentina', flag: '🇦🇷', dialCode: '+54' },
  { code: 'BR', name: 'Brazil', flag: '🇧🇷', dialCode: '+55' },
  { code: 'PE', name: 'Peru', flag: '🇵🇪', dialCode: '+51' },
  { code: 'CL', name: 'Chile', flag: '🇨🇱', dialCode: '+56' },
  { code: 'EC', name: 'Ecuador', flag: '🇪🇨', dialCode: '+593' },
  { code: 'VE', name: 'Venezuela', flag: '🇻🇪', dialCode: '+58' },
  { code: 'UY', name: 'Uruguay', flag: '🇺🇾', dialCode: '+598' },
  { code: 'PY', name: 'Paraguay', flag: '🇵🇾', dialCode: '+595' },
  { code: 'BO', name: 'Bolivia', flag: '🇧🇴', dialCode: '+591' },
  { code: 'CR', name: 'Costa Rica', flag: '🇨🇷', dialCode: '+506' },
  { code: 'PA', name: 'Panama', flag: '🇵🇦', dialCode: '+507' },
  { code: 'GT', name: 'Guatemala', flag: '🇬🇹', dialCode: '+502' },
  { code: 'HN', name: 'Honduras', flag: '🇭🇳', dialCode: '+504' },
  { code: 'SV', name: 'El Salvador', flag: '🇸🇻', dialCode: '+503' },
  { code: 'NI', name: 'Nicaragua', flag: '🇳🇮', dialCode: '+505' },
  { code: 'ES', name: 'Spain', flag: '🇪🇸', dialCode: '+34' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧', dialCode: '+44' },
  { code: 'FR', name: 'France', flag: '🇫🇷', dialCode: '+33' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪', dialCode: '+49' },
  { code: 'IT', name: 'Italy', flag: '🇮🇹', dialCode: '+39' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦', dialCode: '+1' },
];

export default function LoginModal({ onClose }: LoginModalProps) {
  const [step, setStep] = useState<LoginStep>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<Country>(countries[0]); // Colombia as default
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { login } = useAuth();

  // Countdown timer for resend button
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowCountryDropdown(false);
      }
    };

    if (showCountryDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showCountryDropdown]);

  const handleSendOTP = async () => {
    if (!phoneNumber.trim()) return;

    setIsLoading(true);
    // Mock API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);

    setStep('otp');
    setCountdown(30); // 30 second countdown for resend
  };

  const handleResendOTP = async () => {
    setIsLoading(true);
    // Mock API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    setIsLoading(false);

    setCountdown(30);
  };

  const handleVerifyOTP = async () => {
    if (!otp.trim()) return;

    setIsLoading(true);
    // Mock API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Mock successful login - accept any OTP
    login({
      id: '1',
      phone_number: `${selectedCountry.dialCode} ${phoneNumber}`,
      is_admin: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });

    setIsLoading(false);
    onClose();
  };

  const formatPhoneNumber = (value: string, countryCode: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');

    // Different formatting based on country
    switch (countryCode) {
      case 'CO': // Colombia: 300 123 4567
        if (digits.length <= 3) {
          return digits;
        } else if (digits.length <= 6) {
          return `${digits.slice(0, 3)} ${digits.slice(3)}`;
        } else {
          return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 10)}`;
        }
      case 'US':
      case 'CA': // US/Canada: (555) 123-4567
        if (digits.length <= 3) {
          return digits;
        } else if (digits.length <= 6) {
          return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
        } else {
          return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
        }
      case 'ES': // Spain: 612 34 56 78
        if (digits.length <= 3) {
          return digits;
        } else if (digits.length <= 5) {
          return `${digits.slice(0, 3)} ${digits.slice(3)}`;
        } else if (digits.length <= 7) {
          return `${digits.slice(0, 3)} ${digits.slice(3, 5)} ${digits.slice(5)}`;
        } else {
          return `${digits.slice(0, 3)} ${digits.slice(3, 5)} ${digits.slice(5, 7)} ${digits.slice(7, 9)}`;
        }
      default: // Generic formatting: XXX XXX XXXX
        if (digits.length <= 3) {
          return digits;
        } else if (digits.length <= 6) {
          return `${digits.slice(0, 3)} ${digits.slice(3)}`;
        } else {
          return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 10)}`;
        }
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value, selectedCountry.code);
    setPhoneNumber(formatted);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-800 rounded-2xl border border-slate-700 shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <h2 className="text-2xl font-bold text-white">
            {step === 'phone' ? 'Login to Ignacio' : 'Verify Your Number'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 'phone' ? (
            <div className="space-y-6">
              <div>
                <p className="text-gray-300 mb-4">
                  Enter your WhatsApp number to receive a verification code.
                </p>

                <div className="space-y-2">
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-300">
                    Phone Number
                  </label>
                  <div className="flex">
                    {/* Country Selector */}
                    <div className="relative" ref={dropdownRef}>
                      <button
                        type="button"
                        onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                        className="inline-flex items-center justify-center px-4 py-3 rounded-l-lg border border-r-0 border-slate-600 bg-slate-700 text-gray-300 text-sm hover:bg-slate-600 focus:ring-2 focus:ring-purple-500 focus:border-transparent h-[50px] min-w-[120px]"
                      >
                        <span className="text-lg mr-2">{selectedCountry.flag}</span>
                        <span className="font-medium mr-2 text-white">{selectedCountry.dialCode}</span>
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>

                      {/* Country Dropdown */}
                      {showCountryDropdown && (
                        <div className="absolute top-full left-0 mt-1 w-80 bg-slate-700 border border-slate-600 rounded-lg shadow-xl z-10 max-h-60 overflow-y-auto">
                          {countries.map((country) => (
                            <button
                              key={country.code}
                              type="button"
                              onClick={() => {
                                setSelectedCountry(country);
                                setShowCountryDropdown(false);
                                setPhoneNumber(''); // Reset phone number when country changes
                              }}
                              className="w-full px-4 py-3 text-left hover:bg-slate-600 flex items-center text-gray-300 hover:text-white transition-colors first:rounded-t-lg last:rounded-b-lg"
                            >
                              <span className="text-xl mr-3 flex-shrink-0">{country.flag}</span>
                              <span className="text-sm font-medium text-white min-w-[50px] mr-3">{country.dialCode}</span>
                              <span className="text-sm flex-1 text-left">{country.name}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <input
                      id="phone"
                      type="tel"
                      value={phoneNumber}
                      onChange={handlePhoneChange}
                      placeholder="300 123 4567"
                      className="flex-1 min-w-0 block w-full px-4 py-3 rounded-none rounded-r-lg border border-slate-600 bg-slate-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent h-[50px]"
                      maxLength={15}
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={handleSendOTP}
                disabled={!phoneNumber.trim() || isLoading}
                className="w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
              >
                {isLoading ? 'Sending...' : 'Send Verification Code'}
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <p className="text-gray-300 mb-4">
                  We sent a verification code to <span className="font-medium text-white">{selectedCountry.dialCode} {phoneNumber}</span>
                </p>

                <div className="space-y-2">
                  <label htmlFor="otp" className="block text-sm font-medium text-gray-300">
                    Verification Code
                  </label>
                  <input
                    id="otp"
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="123456"
                    className="block w-full px-3 py-3 border border-slate-600 bg-slate-700 text-white placeholder-gray-400 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-center text-xl tracking-widest"
                    maxLength={6}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleVerifyOTP}
                  disabled={otp.length !== 6 || isLoading}
                  className="w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
                >
                  {isLoading ? 'Verifying...' : 'Verify Code'}
                </button>

                <div className="flex items-center justify-between text-sm">
                  <button
                    onClick={() => setStep('phone')}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    ← Change number
                  </button>

                  <button
                    onClick={handleResendOTP}
                    disabled={countdown > 0 || isLoading}
                    className="text-purple-400 hover:text-purple-300 disabled:text-gray-600 disabled:cursor-not-allowed transition-colors"
                  >
                    {countdown > 0 ? `Resend in ${countdown}s` : 'Resend code'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-750 rounded-b-2xl border-t border-slate-700">
          <p className="text-xs text-gray-400 text-center">
            By continuing, you agree to receive messages from Ignacio on WhatsApp.
          </p>
        </div>
      </div>
    </div>
  );
}