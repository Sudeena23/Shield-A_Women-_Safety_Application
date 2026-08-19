import React, { useState } from 'react';
import { Mail, CheckCircle2, ArrowRight, BellRing } from 'lucide-react';

/**
 * NewsletterSection Component
 * Provides a newsletter / safety bulletin subscription box with feedback message.
 */
export const NewsletterSection = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-gradient-to-r from-[#814a27] via-[#9e6133] to-[#b87b48] text-white rounded-3xl p-8 sm:p-12 shadow-xl shadow-[#9e6133]/20 text-center relative overflow-hidden">
        <div className="max-w-2xl mx-auto space-y-4 relative z-10">
          
          <div className="p-3 bg-white/10 rounded-2xl w-fit mx-auto backdrop-blur-md">
            <BellRing className="w-8 h-8 text-white" />
          </div>

          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Stay Updated with Safety Bulletins & Emergency Guides
          </h2>

          <p className="text-sm sm:text-base text-white/90 leading-relaxed font-medium">
            Subscribe to receive local safety advisory updates, self-defense workshop notifications, and emergency system announcements directly in your inbox.
          </p>

          {subscribed ? (
            <div className="bg-white/20 border border-white/30 backdrop-blur-md text-white p-4 rounded-2xl font-bold flex items-center justify-center gap-2 text-sm animate-in fade-in">
              <CheckCircle2 className="w-5 h-5 text-emerald-300" />
              <span>Thank you for subscribing! You will receive safety bulletins in your inbox.</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto pt-2">
              <div className="relative flex-1">
                <Mail className="w-5 h-5 text-[#814a27] absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="w-full bg-white text-[#2d180c] placeholder:text-[#814a27]/50 pl-11 pr-4 py-3.5 rounded-2xl font-medium focus:outline-none focus:ring-2 focus:ring-white text-sm shadow-inner"
                />
              </div>

              <button
                type="submit"
                className="bg-[#2d180c] hover:bg-[#4a2b18] active:translate-y-0.5 text-white font-extrabold px-6 py-3.5 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 text-sm cursor-pointer shrink-0"
              >
                <span>Subscribe</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          <p className="text-[11px] text-white/70 font-medium pt-1">
            We respect your privacy. Zero spam, unsubscribe anytime with 1-click.
          </p>
        </div>
      </div>
    </section>
  );
};
