import React from 'react';
import { HOW_IT_WORKS } from '../../data/mockData';
import { Shield, UserPlus, Radio, Lock, CheckCircle2 } from 'lucide-react';

const stepIcons = [UserPlus, Radio, Shield, Lock];

/**
 * HowItWorksSection Component
 * Displays 4 horizontal numbered steps with icons, titles, and step descriptions.
 */
export const HowItWorksSection = () => {
  return (
    <section id="how-it-works" className="bg-[#2d180c] text-white py-16 sm:py-20 border-y border-[#4a2b18] relative overflow-hidden rounded-3xl mx-4 sm:mx-6 lg:mx-8 my-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-black text-[#cb9d75] uppercase tracking-widest bg-[#4a2b18] px-3.5 py-1 rounded-full border border-[#683c22]">
            Simple 4-Step Protocol
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            How Shield Safeguards Your Journey
          </h2>
          <p className="text-[#eee0ce]/80 text-sm sm:text-base">
            From onboarding trusted guardians to broadcasting emergency distress signals, here is how the app works:
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {HOW_IT_WORKS.map((step, idx) => {
            const Icon = stepIcons[idx] || Shield;
            return (
              <div
                key={step.step}
                className="relative bg-[#3d2517] rounded-2xl p-6 border border-[#683c22] flex flex-col justify-between hover:border-[#cb9d75]/50 transition-all group hover:-translate-y-1 shadow-xl"
              >
                <div className="flex items-center justify-between mb-6">
                  <span className="text-3xl font-black text-[#cb9d75] font-mono tracking-tighter">
                    {step.step}
                  </span>
                  <div className="p-3 rounded-xl bg-[#2d180c] text-[#cb9d75] border border-[#683c22] group-hover:bg-[#9e6133] group-hover:text-white transition-colors duration-300">
                    <Icon className="w-5 h-5" />
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-extrabold text-white mb-2">{step.title}</h3>
                  <p className="text-xs sm:text-sm text-[#eee0ce]/70 leading-relaxed">{step.description}</p>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
