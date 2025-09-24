import HeroSection from '@/components/landingPage/HeroSection';
import AboutActionLab from '@/components/landingPage/AboutActionLab';
import Features from '@/components/landingPage/Features';
import FinalCTA from '@/components/landingPage/FinalCTA';
import { useAuth0 } from '@auth0/auth0-react';

export default function LandingPage() {
  const { isAuthenticated, loginWithRedirect, logout } = useAuth0();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Floating Auth Button */}
      <div className="fixed top-6 right-6 z-50">
        {!isAuthenticated ? (
          <button
            onClick={() => loginWithRedirect()}
            className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors shadow-lg"
          >
            Login
          </button>
        ) : (
          <button
            onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
            className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors shadow-lg"
          >
            Logout
          </button>
        )}
      </div>

      <HeroSection/>
      <AboutActionLab/>
      <Features/>
      <FinalCTA/>
    </div>
  );
}