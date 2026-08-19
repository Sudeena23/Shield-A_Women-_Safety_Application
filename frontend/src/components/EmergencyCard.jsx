import React, { useState, useEffect } from 'react';
import {
  PhoneCall,
  Shield,
  HeartPulse,
  ShieldAlert,
  ShieldCheck,
  Copy,
  Check,
  Clock,
  Flame,
  Siren,
  Heart,
  LifeBuoy,
  UserCheck,
  Activity,
  AlertTriangle,
  X,
} from 'lucide-react';

const iconMap = {
  Shield,
  HeartPulse,
  ShieldAlert,
  PhoneCall,
  ShieldCheck,
  Flame,
  Siren,
  Heart,
  LifeBuoy,
  UserCheck,
  Activity,
  AlertTriangle,
};

export const EmergencyCard = ({ emergency }) => {
  const [copied, setCopied] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const Icon = iconMap[emergency.iconName] || PhoneCall;

  useEffect(() => {
    let timer;
    if (countdown !== null && countdown > 0) {
      timer = setTimeout(() => {
        setCountdown((prev) => (prev !== null ? prev - 1 : null));
      }, 1000);
    } else if (countdown === 0) {
      window.location.href = `tel:${emergency.number}`;
      setCountdown(null);
    }
    return () => clearTimeout(timer);
  }, [countdown, emergency.number]);

  const handleCopy = () => {
    navigator.clipboard.writeText(emergency.number);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleStartCall = () => {
    setCountdown(3);
  };

  const handleCancelCall = () => {
    setCountdown(null);
  };

  const handleImmediateCall = () => {
    window.location.href = `tel:${emergency.number}`;
    setCountdown(null);
  };

  return (
    <div className="bg-white rounded-3xl p-6 border border-[#eee0ce] hover:border-[#cb9d75] shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between group">
      <div>
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="p-3 bg-[#f7f0e6] text-[#814a27] rounded-2xl border border-[#eee0ce] group-hover:bg-[#9e6133] group-hover:text-white transition-colors">
            <Icon className="w-6 h-6" />
          </div>
          <div className="flex items-center gap-1.5 flex-wrap justify-end">
            {emergency.is24x7 && (
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/80 flex items-center gap-1">
                <Clock className="w-3 h-3 text-emerald-600" /> 24/7 Hotline
              </span>
            )}
            <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#f7f0e6] text-[#814a27] border border-[#eee0ce]">
              {emergency.category}
            </span>
          </div>
        </div>

        <h3 className="text-base font-black text-[#2d180c] group-hover:text-[#9e6133] transition-colors mb-1.5 tracking-tight">
          {emergency.title}
        </h3>
        <p className="text-xs text-[#814a27]/80 line-clamp-2 mb-4 leading-relaxed font-medium">
          {emergency.description}
        </p>

        {/* Big Emergency Number Display */}
        <div className="bg-[#fdfbf7] border border-[#eee0ce] rounded-2xl p-3.5 flex items-center justify-between mb-5">
          <div className="text-2xl font-black text-[#2d180c] tracking-tight font-mono">
            {emergency.number}
          </div>
          <button
            onClick={handleCopy}
            className="px-2.5 py-1.5 rounded-xl text-[#814a27] hover:text-[#2d180c] hover:bg-[#f7f0e6] border border-transparent hover:border-[#eee0ce] transition-all flex items-center gap-1.5 text-xs font-bold cursor-pointer"
            title="Copy phone number"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                <span className="text-emerald-700 text-[11px] font-extrabold">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-[#814a27]/70" />
                <span className="text-[11px]">Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Call Action Button with Countdown Timer */}
      {countdown !== null ? (
        <div className="w-full bg-[#2d180c] text-white p-3.5 rounded-2xl shadow-lg border border-[#683c22] space-y-2.5 animate-pulse">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold flex items-center gap-1.5 text-amber-300">
              <Clock className="w-3.5 h-3.5 animate-spin text-amber-400" />
              Calling in <span className="text-sm font-black text-white px-1.5 py-0.5 bg-amber-500/20 rounded-md border border-amber-400/30">{countdown}s</span>...
            </span>
            <button
              onClick={handleCancelCall}
              className="text-[#eee0ce]/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors flex items-center gap-1 text-[11px] font-bold cursor-pointer"
            >
              <X className="w-3.5 h-3.5 text-red-400" /> Cancel
            </button>
          </div>

          <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-amber-400 h-full transition-all duration-1000 ease-linear"
              style={{ width: `${(countdown / 3) * 100}%` }}
            />
          </div>

          <div className="flex items-center justify-between gap-2 pt-0.5">
            <button
              onClick={handleCancelCall}
              className="flex-1 bg-white/10 hover:bg-white/20 text-white font-bold py-1.5 px-3 rounded-xl text-xs transition-colors cursor-pointer text-center"
            >
              Cancel
            </button>
            <button
              onClick={handleImmediateCall}
              className="flex-1 bg-[#9e6133] hover:bg-[#814a27] text-white font-extrabold py-1.5 px-3 rounded-xl text-xs transition-colors cursor-pointer text-center flex items-center justify-center gap-1"
            >
              <PhoneCall className="w-3 h-3 fill-white" /> Call Now
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={handleStartCall}
          className="w-full bg-[#9e6133] hover:bg-[#814a27] text-white font-black py-3 px-4 rounded-2xl shadow-md shadow-[#9e6133]/20 flex items-center justify-center gap-2 text-sm transition-all active:scale-98 cursor-pointer text-center"
        >
          <PhoneCall className="w-4 h-4 fill-white" />
          <span>Call Now ({emergency.number})</span>
        </button>
      )}
    </div>
  );
};


