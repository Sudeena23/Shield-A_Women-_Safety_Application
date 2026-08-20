import React from "react";
import { ShieldAlert } from "lucide-react";

export const SOSButton = ({
  onTrigger,
  size = "md",
  label = "PRESS SOS",
  sublabel = "Hold for emergency alert",
  className = "",
}) => {
  const sizeClasses = {
    sm: "w-24 h-24 text-sm",
    md: "w-36 h-36 text-base",
    lg: "w-48 h-48 text-xl",
    hero: "w-56 h-56 md:w-64 md:h-64 text-2xl",
  };

  const iconSizes = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
    hero: "w-20 h-20",
  };

  return (
    <div
      className={`relative flex flex-col items-center justify-center ${className}`}
    >
      <div className="absolute inset-0 rounded-full bg-[#9e6133]/20 animate-ping pointer-events-none" />

      <div className="absolute -inset-4 rounded-full bg-[#814a27]/10 animate-pulse pointer-events-none" />

      <div className="absolute -inset-8 rounded-full bg-[#814a27]/5 pointer-events-none" />

      <button
        id="sos-button-main"
        onClick={onTrigger}
        type="button"
        className={`relative z-10 ${
          sizeClasses[size] || sizeClasses.md
        } rounded-full bg-gradient-to-br from-[#b87b48] via-[#9e6133] to-[#683c22] text-white font-extrabold shadow-2xl flex flex-col items-center justify-center border-4 border-[#eee0ce]/40 cursor-pointer group`}
        aria-label="Emergency SOS Button"
      >
        <div className="absolute inset-0 rounded-full bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />

        <ShieldAlert
          className={`${
            iconSizes[size] || iconSizes.md
          } text-white mb-1`}
        />

        <span className="tracking-wider uppercase font-black">
          {label}
        </span>

        {size !== "sm" && sublabel && (
          <span className="text-[10px] md:text-xs font-medium text-[#f7f0e6] opacity-90 mt-0.5 max-w-[80%] text-center leading-tight">
            {sublabel}
          </span>
        )}
      </button>
    </div>
  );
};