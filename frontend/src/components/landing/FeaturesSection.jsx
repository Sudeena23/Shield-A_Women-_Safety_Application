import React from 'react';
import { FeatureCard } from '../FeatureCard';
import { APP_FEATURES } from '../../data/mockData';

/**
 * FeaturesSection Component
 * Renders centered title & subtext, followed by a 3-column grid of feature cards.
 * FeatureCard implements smooth hover scale and fill transition to primary caramel brown.
 */
export const FeaturesSection = () => {
  return (
    <section id="app-features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 scroll-mt-20">
      <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
        <span className="text-xs font-black text-[#814a27] uppercase tracking-widest bg-[#f7f0e6] px-3.5 py-1 rounded-full border border-[#eee0ce]">
          Comprehensive Safety Suite
        </span>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#2d180c] tracking-tight">
          Designed for Instant Protection & Complete Peace of Mind
        </h2>
        <p className="text-[#814a27]/80 text-sm sm:text-base leading-relaxed">
          Every tool on Shield is crafted to give women rapid, reliable, and discreet protection in uncomfortable or emergency situations.
        </p>
      </div>

      {/* 3-Column Grid of Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
        {APP_FEATURES.map((feat) => (
          <FeatureCard key={feat.id} {...feat} />
        ))}
      </div>
    </section>
  );
};
