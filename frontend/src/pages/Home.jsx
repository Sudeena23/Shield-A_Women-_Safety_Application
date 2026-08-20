import React from 'react';
import { HeroSection } from '../components/landing/HeroSection';
import { StatsSection } from '../components/landing/StatsSection';
import { FeaturesSection } from '../components/landing/FeaturesSection';
import { HowItWorksSection } from '../components/landing/HowItWorksSection';
import { TrustSection } from '../components/landing/TrustSection';
import { TestimonialsSection } from '../components/landing/TestimonialsSection';
import { FAQSection } from '../components/landing/FAQSection';
import { NewsletterSection } from '../components/landing/NewsletterSection';

/**
 * Home Page Component
 */
export const Home = ({ onTriggerSOS, onOpenFakeCall }) => {
  return (
    <div className="space-y-4 pb-16">
      {/* 1. Hero Section */}
      <HeroSection onTriggerSOS={onTriggerSOS} onOpenFakeCall={onOpenFakeCall} />

      {/* 2. Stats Section */}
      <StatsSection />

      {/* 3. Features Section */}
      <FeaturesSection />

      {/* 4. How It Works Section */}
      <HowItWorksSection />

      {/* 5. Trust & Verified Hotlines Section */}
      <TrustSection />

      {/* 6. Testimonials Section */}
      <TestimonialsSection />

      {/* 7. Frequently Asked Questions */}
      <FAQSection />

      {/* 8. Newsletter & Safety Updates */}
      <NewsletterSection />
    </div>
  );
};

