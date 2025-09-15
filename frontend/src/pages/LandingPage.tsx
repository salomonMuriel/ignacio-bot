import HeroSection from '@/components/landingPage/HeroSection';
import AboutActionLab from '@/components/landingPage/AboutActionLab';
import Features from '@/components/landingPage/Features';
import FinalCTA from '@/components/landingPage/FinalCTA';

export default function LandingPage() {

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <HeroSection/>
      <AboutActionLab/>
      <Features/>
      <FinalCTA/>
    </div>
  );
}