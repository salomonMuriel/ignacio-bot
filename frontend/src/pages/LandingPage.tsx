import React from 'react';
import HeroSection from '@/components/landingPage/HeroSection';
import AboutActionLab from '@/components/landingPage/AboutActionLab';
import Features from '@/components/landingPage/Features';
import FinalCTA from '@/components/landingPage/FinalCTA';
import { login } from '@/utils/auth';
import { useSession } from '@/hooks/useSession';

export default function LandingPage() {
  const { isAuthenticated } = useSession();

  const handleLoginClick = () => {
    login();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Floating Login Button */}
      {!isAuthenticated && (
        <button
          onClick={handleLoginClick}
          className="fixed top-6 right-6 z-40 px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors shadow-lg"
        >
          Login
        </button>
      )}

      <HeroSection onLoginClick={handleLoginClick}/>
      <AboutActionLab/>
      <Features/>
      <FinalCTA onLoginClick={handleLoginClick}/>
    </div>
  );
}