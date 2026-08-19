import React from 'react';
import { STATS } from '../../utils/constants';

/**
 * StatsSection Component
 * Displays key platform impact numbers and statistics in a clean grid card layout.
 */
export const StatsSection = () => {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="bg-white border border-[#eee0ce] rounded-3xl p-8 sm:p-10 shadow-lg shadow-[#9e6133]/5">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 divide-y md:divide-y-0 md:divide-x divide-[#eee0ce]">
          {STATS.map((stat, idx) => (
            <div
              key={idx}
              className={`text-center space-y-1 ${idx > 0 ? 'pt-4 md:pt-0' : ''}`}
            >
              <div className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#9e6133] font-serif tracking-tight">
                {stat.value}
              </div>
              <div className="text-xs sm:text-sm font-bold text-[#2d180c] uppercase tracking-wider">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
