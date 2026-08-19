import React from 'react';
import { Link } from 'react-router-dom';
import { Navigation, Radio, Users, PhoneCall, MapPin, Bell, ArrowRight, ShieldAlert, Lock, Volume2 } from 'lucide-react';

const iconMap = {
  Navigation,
  Radio,
  Users,
  PhoneCall,
  MapPin,
  Bell,
  ShieldAlert,
  Lock,
  Volume2,
};

export const FeatureCard = ({
  title,
  description,
  icon,
  badge,
  link,
}) => {
  const IconComponent = iconMap[icon] || Radio;

  return (
    <div className="group relative bg-white rounded-2xl p-6 border border-[#eee0ce] shadow-md hover:bg-[#9e6133] hover:text-white hover:border-[#814a27] transition-all duration-300 transform hover:scale-[1.02] hover:-translate-y-1 flex flex-col justify-between overflow-hidden cursor-pointer">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="p-3.5 rounded-full bg-[#f7f0e6] text-[#9e6133] group-hover:bg-white/20 group-hover:text-white transition-colors duration-300 shrink-0">
            <IconComponent className="w-6 h-6" />
          </div>
          <span className="text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-[#f7f0e6] text-[#814a27] group-hover:bg-white/20 group-hover:text-white border border-[#eee0ce] group-hover:border-white/30 transition-colors duration-300">
            {badge}
          </span>
        </div>

        <h3 className="text-xl font-extrabold text-[#2d180c] group-hover:text-white transition-colors duration-300 mb-2">
          {title}
        </h3>
        <p className="text-xs sm:text-sm text-[#814a27]/80 group-hover:text-white/90 leading-relaxed mb-6 transition-colors duration-300">
          {description}
        </p>
      </div>

      <Link
        to={link || '/dashboard'}
        className="inline-flex items-center justify-between w-full pt-4 border-t border-[#eee0ce] group-hover:border-white/20 text-xs font-bold text-[#814a27] group-hover:text-white transition-colors duration-300"
      >
        <span>Access Protection</span>
        <div className="p-2 rounded-xl bg-[#f7f0e6] text-[#814a27] group-hover:bg-white/20 group-hover:text-white transition-all duration-300">
          <ArrowRight className="w-4 h-4" />
        </div>
      </Link>
    </div>
  );
};
