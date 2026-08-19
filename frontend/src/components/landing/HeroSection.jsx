import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, ArrowRight, Sparkles, CheckCircle2, Lock, HeartPulse, PhoneCall } from 'lucide-react';

/**
 * HeroSection Component
 * Renders the top landing hero with pill badge, bold headline, primary action buttons,
 * overlapping user avatars with '10,000+ Protected' counter, and a featured safety illustration.
 */
export const HeroSection = ({ onTriggerSOS, onOpenFakeCall }) => {
  const avatars = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=100&q=80',
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80',
  ];

  return (
    <section className="relative pt-8 sm:pt-16 pb-12 overflow-hidden bg-gradient-to-b from-[#f7f0e6]/60 via-[#fdfbf7] to-[#fbf8f3] border-b border-[#eee0ce]">
      {/* Background Ambient Glows */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#cb9d75]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-10 w-80 h-80 bg-[#b87b48]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Headlines & Actions */}
          <div className="lg:col-span-7 text-center lg:text-left space-y-6">
            
            {/* Pill-shaped badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#f7f0e6] text-[#814a27] font-extrabold text-xs tracking-wide border border-[#eee0ce] shadow-xs">
              <Shield className="w-4 h-4 fill-[#9e6133] text-[#9e6133]" />
              <span>Women-First Safety Platform</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#2d180c] tracking-tight leading-[1.15]">
              Shield Nepal – Your Personal Safety & <span className="text-[#9e6133] italic font-serif">Confidence</span>
            </h1>

            {/* Subtext */}
            <p className="text-base sm:text-lg text-[#814a27]/80 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-medium">
              A 24/7 emergency response & safety companion engineered for women. Instantly send 1-press SOS broadcasts, share live GPS tracking, and access Nepal Police (100) & Women Commission (1145) helplines.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <Link
                to="/auth"
                className="w-full sm:w-auto bg-[#9e6133] hover:bg-[#814a27] text-white font-extrabold px-8 py-4 rounded-2xl shadow-xl shadow-[#9e6133]/25 active:translate-y-0.5 active:shadow-md transition-all flex items-center justify-center gap-2 text-base cursor-pointer btn-primary"
              >
                <span>Get Started Free</span>
                <ArrowRight className="w-5 h-5 text-white" />
              </Link>

              <button
                onClick={() => {
                  const el = document.getElementById('app-features');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="w-full sm:w-auto bg-white hover:bg-[#f7f0e6] text-[#2d180c] font-bold px-7 py-4 rounded-2xl border-2 border-[#eee0ce] shadow-xs active:translate-y-0.5 transition-all flex items-center justify-center gap-2 text-base cursor-pointer btn-outline"
              >
                <Sparkles className="w-5 h-5 text-[#9e6133]" />
                <span>Explore Features</span>
              </button>
            </div>

            {/* Overlapping User Avatars Row */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3">
              <div className="flex -space-x-3 overflow-hidden p-1">
                {avatars.map((url, i) => (
                  <img
                    key={i}
                    src={url}
                    alt="User Avatar"
                    className="inline-block h-10 w-10 rounded-full ring-2 ring-white object-cover shadow-xs"
                  />
                ))}
              </div>
              <div className="text-xs text-[#814a27] font-bold text-center sm:text-left">
                <span className="text-[#2d180c] font-extrabold text-sm block">10,000+ Protected</span>
                <span>Active women relying on Shield daily across Nepal</span>
              </div>
            </div>

            {/* Quick Guarantees */}
            <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-[#814a27]/80 font-semibold">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-700" /> 100% Free Forever
              </span>
              <span className="flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-emerald-700" /> Encrypted GPS Signals
              </span>
              <span className="flex items-center gap-1.5">
                <HeartPulse className="w-4 h-4 text-[#9e6133]" /> Direct 100 & 1145 Dispatch
              </span>
            </div>

          </div>

          {/* Right Column: Hero Soft Illustration Card */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center">
            <div className="relative rounded-3xl p-3 bg-white border border-[#eee0ce] shadow-2xl shadow-[#9e6133]/10 max-w-md w-full group">
              <div className="relative h-72 sm:h-80 w-full overflow-hidden rounded-2xl bg-[#f7f0e6]">
                <img
                  src="/src/assets/images/ghibli_women_safety_1785589514321.jpg"
                  alt="Women Safety Illustration"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#2d180c]/85 via-[#2d180c]/25 to-transparent" />
                
                {/* Active Status Badge */}
                <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-black text-[#814a27] shadow-md flex items-center gap-2 border border-[#eee0ce]">
                  <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                  <span>24/7 Active Protection Network</span>
                </div>

                <div className="absolute bottom-4 left-4 right-4 text-white space-y-0.5">
                  <p className="text-[11px] font-black text-[#cb9d75] uppercase tracking-widest">Shield Nepal System</p>
                  <h3 className="text-lg font-black leading-tight">Empowering Women Safety Everywhere</h3>
                </div>
              </div>

              {/* Card Bottom Command Action */}
              <div className="p-4 bg-white flex items-center justify-between gap-3 border-t border-[#eee0ce]">
                <div className="text-left">
                  <p className="text-xs font-extrabold text-[#2d180c]">Emergency SOS Command</p>
                  <p className="text-[11px] text-[#814a27]/70 font-medium">Broadcasts GPS to guardians & police</p>
                </div>
                <button
                  onClick={onTriggerSOS}
                  className="bg-[#9e6133] hover:bg-[#814a27] active:scale-95 text-white font-black px-4 py-2.5 rounded-xl text-xs tracking-wider uppercase shadow-md shadow-[#9e6133]/30 shrink-0 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                  <span>PRESS SOS</span>
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
