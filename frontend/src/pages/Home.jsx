import React from 'react';
import { HeroSection } from '../components/landing/HeroSection';
import { FeaturesSection } from '../components/landing/FeaturesSection';
import { NewsletterSection } from '../components/landing/NewsletterSection';

/**
 * Home Page Component
 */
export const Home = ({ onTriggerSOS, onOpenFakeCall }) => {
  return (
    <div className="space-y-4 pb-16">
      {/* 2. Hero Section */}
      <HeroSection onTriggerSOS={onTriggerSOS} onOpenFakeCall={onOpenFakeCall} />

      {/* 3. Features Section */}
      <FeaturesSection />

      {/* 4. Newsletter & Safety Updates Section */}
      <NewsletterSection />
    </div>
  );
};

