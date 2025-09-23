import HeroSection from '@/components/landingPage/HeroSection';
import AboutActionLab from '@/components/landingPage/AboutActionLab';
import Features from '@/components/landingPage/Features';
import FinalCTA from '@/components/landingPage/FinalCTA';
import { useAuth } from '@/contexts/AuthContext';

export default function LandingPage() {
  const { user, login } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Floating Login Button */}
      {!user && (
        <button
          onClick={login}
          className="fixed top-6 right-6 z-50 px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors shadow-lg"
        >
          Login
        </button>
      )}

      <HeroSection/>
      <AboutActionLab/>
      <Features/>
      <FinalCTA/>
    </div>
  );
}