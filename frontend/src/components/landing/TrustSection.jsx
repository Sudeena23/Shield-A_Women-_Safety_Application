import React from 'react';
import { ShieldCheck, Lock, EyeOff, Server, FileCheck } from 'lucide-react';

/**
 * TrustSection Component
 * Explains Shield's strict privacy, data encryption, and zero-monetization commitment.
 */
export const TrustSection = () => {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-[#f7f0e6] border-2 border-[#eee0ce] rounded-3xl p-8 sm:p-12 shadow-sm flex flex-col md:flex-row items-center justify-between gap-8">
        
        <div className="space-y-4 max-w-2xl text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#eee0ce] text-[#814a27] font-extrabold text-xs uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-[#9e6133]" />
            <span>Uncompromising Trust & Privacy</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-[#2d180c] tracking-tight">
            Your Location & Personal Data Are Strictly Encrypted
          </h2>

          <p className="text-sm sm:text-base text-[#814a27]/90 leading-relaxed font-medium">
            Shield never sells, profiles, or continuously tracks your background location. GPS tracking is activated strictly when you trigger an emergency SOS broadcast or explicitly start a live location sharing session with designated guardians.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="flex items-center gap-2.5 text-xs font-bold text-[#2d180c]">
              <div className="p-1.5 bg-[#eee0ce] rounded-lg text-[#9e6133]">
                <Lock className="w-4 h-4" />
              </div>
              <span>End-to-End Encrypted Signals</span>
            </div>

            <div className="flex items-center gap-2.5 text-xs font-bold text-[#2d180c]">
              <div className="p-1.5 bg-[#eee0ce] rounded-lg text-[#9e6133]">
                <EyeOff className="w-4 h-4" />
              </div>
              <span>No Continuous Background Tracking</span>
            </div>

            <div className="flex items-center gap-2.5 text-xs font-bold text-[#2d180c]">
              <div className="p-1.5 bg-[#eee0ce] rounded-lg text-[#9e6133]">
                <Server className="w-4 h-4" />
              </div>
              <span>No Commercial Ad Brokers</span>
            </div>

            <div className="flex items-center gap-2.5 text-xs font-bold text-[#2d180c]">
              <div className="p-1.5 bg-[#eee0ce] rounded-lg text-[#9e6133]">
                <FileCheck className="w-4 h-4" />
              </div>
              <span>Aligned with Nepal Privacy Laws</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-[#eee0ce] shadow-md text-center max-w-xs w-full shrink-0 space-y-3">
          <div className="w-16 h-16 rounded-full bg-[#f7f0e6] text-[#9e6133] flex items-center justify-center mx-auto border border-[#eee0ce]">
            <ShieldCheck className="w-9 h-9" />
          </div>
          <h3 className="font-extrabold text-[#2d180c] text-base">Privacy First Guarantee</h3>
          <p className="text-xs text-[#814a27]/80">
            Built for safety, not surveillance. You maintain complete sovereignty over your telemetry and guardians list.
          </p>
        </div>

      </div>
    </section>
  );
};
