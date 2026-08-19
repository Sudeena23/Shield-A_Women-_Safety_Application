import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldAlert, Home, ArrowLeft } from 'lucide-react';

export const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16 animate-in fade-in duration-200">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-[#eee0ce] shadow-2xl text-center space-y-6 relative overflow-hidden">
        
        {/* Background Accent */}
        <div className="absolute -top-12 -right-12 w-36 h-36 bg-[#f7f0e6] rounded-full blur-2xl opacity-60 pointer-events-none" />

        {/* 404 Badge & Icon */}
        <div className="w-20 h-20 rounded-3xl bg-[#f7f0e6] border border-[#eee0ce] text-[#9e6133] mx-auto flex items-center justify-center shadow-inner relative">
          <ShieldAlert className="w-10 h-10 stroke-[2.5]" />
          <span className="absolute -bottom-2 font-mono font-black text-xs bg-[#9e6133] text-white px-2 py-0.5 rounded-full shadow-xs">
            404
          </span>
        </div>

        {/* Text Details */}
        <div className="space-y-2">
          <span className="text-[10px] font-black uppercase tracking-widest text-[#9e6133] bg-[#f7f0e6] px-3 py-1 rounded-full border border-[#eee0ce]">
            Page Not Found
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-[#2d180c] tracking-tight">
            Invalid Safety Route
          </h1>
          <p className="text-xs text-[#814a27]/70 leading-relaxed">
            The requested page URL does not exist or has been moved. Check the web address or return to the safety portal home.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => navigate(-1)}
            className="flex-1 bg-[#f7f0e6] hover:bg-[#eee0ce] text-[#2d180c] font-bold py-3 px-4 rounded-2xl text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer border border-[#eee0ce]"
          >
            <ArrowLeft className="w-4 h-4" /> Go Back
          </button>

          <Link
            to="/"
            className="flex-1 bg-[#9e6133] hover:bg-[#814a27] text-white font-extrabold py-3 px-4 rounded-2xl text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-[#9e6133]/25 transition-all cursor-pointer"
          >
            <Home className="w-4 h-4" /> Return Home
          </Link>
        </div>

        {/* Emergency Note */}
        <div className="pt-4 border-t border-[#f7f0e6] text-[11px] text-[#814a27]/60">
          In immediate physical danger? Call Nepal Emergency Police at <strong className="text-[#2d180c] font-mono">100</strong> or <strong className="text-[#2d180c] font-mono">102</strong>.
        </div>

      </div>
    </div>
  );
};
