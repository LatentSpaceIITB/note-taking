import { LandingNav } from '@/components/landing/LandingNav';
import { Hero } from '@/components/landing/Hero';
import { BentoGrid } from '@/components/landing/BentoGrid';
import { UseCases } from '@/components/landing/UseCases';
import { ScrollTransform } from '@/components/landing/ScrollTransform';
import { Team } from '@/components/landing/Team';
import { Footer } from '@/components/landing/Footer';

export default function Home() {
  // Show landing page for all users (auth-aware nav handles showing Dashboard button)
  return (
    <div className="min-h-screen bg-cream-50">
      <LandingNav />
      <Hero />
      <BentoGrid />
      <UseCases />
      <ScrollTransform />
      <Team />
      <Footer />
    </div>
  );
}
