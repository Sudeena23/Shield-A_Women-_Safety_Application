import React from 'react';
import { TESTIMONIALS } from '../../utils/constants';
import { Quote, Star } from 'lucide-react';

/**
 * TestimonialsSection Component
 * Displays user stories and feedback cards with avatar, quote, and role.
 */
export const TestimonialsSection = () => {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
        <span className="text-xs font-black text-[#814a27] uppercase tracking-widest bg-[#f7f0e6] px-3.5 py-1 rounded-full border border-[#eee0ce]">
          Real Stories & Impact
        </span>
        <h2 className="text-3xl sm:text-4xl font-black text-[#2d180c] tracking-tight">
          Trusted by Thousands of Women Daily
        </h2>
        <p className="text-[#814a27]/80 text-sm sm:text-base">
          Read how Shield provides confidence and instant support during everyday travel and emergencies.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
        {TESTIMONIALS.map((t) => (
          <div
            key={t.id}
            className="bg-white rounded-2xl p-6 border border-[#eee0ce] shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex gap-1 text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <Quote className="w-6 h-6 text-[#cb9d75]" />
              </div>

              <p className="text-xs sm:text-sm text-[#2d180c] leading-relaxed italic font-serif">
                "{t.quote}"
              </p>
            </div>

            <div className="flex items-center gap-3 pt-6 border-t border-[#eee0ce] mt-6">
              <img
                src={t.avatar}
                alt={t.name}
                className="w-10 h-10 rounded-full object-cover border-2 border-[#cb9d75]"
              />
              <div>
                <h3 className="text-sm font-extrabold text-[#2d180c]">{t.name}</h3>
                <p className="text-[11px] font-medium text-[#814a27]/80">{t.role}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
