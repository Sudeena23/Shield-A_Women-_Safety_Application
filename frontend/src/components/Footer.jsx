import React from 'react';
import { Link } from 'react-router-dom';
import {
  Shield,
  PhoneCall,
  Heart,
  Radio,
  Lock,
  ShieldCheck,
  UserCheck,
  Settings,
  LayoutDashboard,
  Home as HomeIcon,
  ShieldAlert,
  Flame,
  Users,
} from 'lucide-react';

export const Footer = ({ currentUser }) => {
  const isAdmin = currentUser?.role === 'admin';

  return (
    <footer className="bg-[#2d180c] text-[#eee0ce] pt-12 pb-8 border-t border-[#4a2b18]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 pb-10 border-b border-[#4a2b18]">
          
          {/* Col 1: Brand & Mission */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#9e6133] text-white flex items-center justify-center shadow-md">
                <Shield className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-lg font-black tracking-tight text-white">SHIELD</span>
                  {isAdmin && (
                    <span className="text-[9px] font-black uppercase tracking-wider bg-[#814a27] text-amber-200 px-1.5 py-0.5 rounded border border-[#522f18]">
                      ADMIN
                    </span>
                  )}
                </div>
              </div>
            </div>
            <p className="text-xs text-[#cb9d75]/80 leading-relaxed">
              {isAdmin
                ? 'Shield Admin Management Console provides system-wide SOS alert oversight, user account administration, and emergency hotline registry management.'
                : 'Shield is your personal safety companion app built to provide instantaneous access to guardian networks, emergency lines, live GPS tracking, and instant SOS dispatch.'}
            </p>
            <div className="flex items-center gap-2 text-xs text-[#e0c8ad]">
              <ShieldCheck className="w-4 h-4 text-[#cb9d75]" />
              <span>{isAdmin ? 'Official Admin Control System' : 'Verified Emergency Response System'}</span>
            </div>
          </div>

          {/* Col 2: Core Modules / Admin Feeds */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-[#cb9d75]" />
              {isAdmin ? 'Admin Control Panel' : 'All Core Modules'}
            </h4>
            <ul className="space-y-2 text-xs">
              {isAdmin ? (
                <>
                  <li>
                    <Link to="/admin?tab=dispatches" className="hover:text-[#cb9d75] transition-colors flex items-center gap-2">
                      <Radio className="w-3.5 h-3.5 text-red-400" />
                      <span>Live SOS Feeds</span>
                    </Link>
                  </li>
                  <li>
                    <Link to="/admin?tab=users" className="hover:text-[#cb9d75] transition-colors flex items-center gap-2">
                      <Users className="w-3.5 h-3.5 text-sky-400" />
                      <span>User Database</span>
                    </Link>
                  </li>
                  <li>
                    <Link to="/admin?tab=helplines" className="hover:text-[#cb9d75] transition-colors flex items-center gap-2">
                      <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Helplines Registry</span>
                    </Link>
                  </li>
                  <li>
                    <Link to="/settings" className="hover:text-[#cb9d75] transition-colors flex items-center gap-2">
                      <Settings className="w-3.5 h-3.5 text-[#cb9d75]/70" />
                      <span>System Settings</span>
                    </Link>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <Link to="/" className="hover:text-[#cb9d75] transition-colors flex items-center gap-2">
                      <HomeIcon className="w-3.5 h-3.5 text-[#cb9d75]/70" />
                      <span>Home Overview</span>
                    </Link>
                  </li>
                  <li>
                    <Link to="/dashboard" className="hover:text-[#cb9d75] transition-colors flex items-center gap-2">
                      <LayoutDashboard className="w-3.5 h-3.5 text-[#cb9d75]/70" />
                      <span>SOS Command Dashboard</span>
                    </Link>
                  </li>
                  <li>
                    <Link to="/live-location" className="hover:text-[#cb9d75] transition-colors flex items-center gap-2">
                      <Radio className="w-3.5 h-3.5 text-[#cb9d75]/70" />
                      <span>Live Location Tracker</span>
                    </Link>
                  </li>
                  <li>
                    <Link to="/guardians" className="hover:text-[#cb9d75] transition-colors flex items-center gap-2">
                      <Heart className="w-3.5 h-3.5 text-[#cb9d75]/70" />
                      <span>Guardian Network</span>
                    </Link>
                  </li>
                  <li>
                    <Link to="/emergency-numbers" className="hover:text-[#cb9d75] transition-colors flex items-center gap-2">
                      <PhoneCall className="w-3.5 h-3.5 text-[#cb9d75]/70" />
                      <span>Emergency Helplines</span>
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>

          {/* Col 3: Account & Control Center */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-[#cb9d75]" />
              {isAdmin ? 'Admin Operations' : 'User Control Center'}
            </h4>
            <ul className="space-y-2 text-xs">
              {isAdmin ? (
                <>
                  <li>
                    <Link to="/profile" className="hover:text-[#cb9d75] transition-colors flex items-center gap-2">
                      <UserCheck className="w-3.5 h-3.5 text-[#cb9d75]/70" />
                      <span>Administrator Profile</span>
                    </Link>
                  </li>
                  <li>
                    <Link to="/settings" className="hover:text-[#cb9d75] transition-colors flex items-center gap-2">
                      <Settings className="w-3.5 h-3.5 text-[#cb9d75]/70" />
                      <span>System Preferences</span>
                    </Link>
                  </li>
                  <li>
                    <Link to="/emergency-numbers" className="hover:text-[#cb9d75] transition-colors flex items-center gap-2">
                      <PhoneCall className="w-3.5 h-3.5 text-[#cb9d75]/70" />
                      <span>Emergency Hotline Directory</span>
                    </Link>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <Link to="/profile" className="hover:text-[#cb9d75] transition-colors flex items-center gap-2">
                      <UserCheck className="w-3.5 h-3.5 text-[#cb9d75]/70" />
                      <span>Medical & Safety Profile</span>
                    </Link>
                  </li>
                  <li>
                    <Link to="/settings" className="hover:text-[#cb9d75] transition-colors flex items-center gap-2">
                      <Settings className="w-3.5 h-3.5 text-[#cb9d75]/70" />
                      <span>Safety Preferences & Siren</span>
                    </Link>
                  </li>
                  <li>
                    <Link to="/auth" className="hover:text-[#cb9d75] transition-colors flex items-center gap-2">
                      <Lock className="w-3.5 h-3.5 text-[#cb9d75]/70" />
                      <span>Secure Login / Signup</span>
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>

          {/* Col 4: Trust, Helplines & Security Standard */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-[#cb9d75]" />
              Quick Rescue Helplines
            </h4>
            <div className="grid grid-cols-2 gap-1.5 text-xs text-[#cb9d75]">
              <a href="tel:100" className="p-2 bg-[#1e1008] hover:bg-[#4a2b18] border border-[#4a2b18] rounded-xl font-bold flex items-center justify-between text-white transition-colors">
                <span>Police</span>
                <span className="text-[#cb9d75] font-mono">100</span>
              </a>
              <a href="tel:1145" className="p-2 bg-[#1e1008] hover:bg-[#4a2b18] border border-[#4a2b18] rounded-xl font-bold flex items-center justify-between text-white transition-colors">
                <span>Women</span>
                <span className="text-[#cb9d75] font-mono">1145</span>
              </a>
              <a href="tel:102" className="p-2 bg-[#1e1008] hover:bg-[#4a2b18] border border-[#4a2b18] rounded-xl font-bold flex items-center justify-between text-white transition-colors">
                <span>Ambulance</span>
                <span className="text-[#cb9d75] font-mono">102</span>
              </a>
              <a href="tel:101" className="p-2 bg-[#1e1008] hover:bg-[#4a2b18] border border-[#4a2b18] rounded-xl font-bold flex items-center justify-between text-white transition-colors">
                <span>Fire</span>
                <span className="text-[#cb9d75] font-mono">101</span>
              </a>
            </div>

            <div className="p-3 bg-[#1e1008] rounded-xl border border-[#4a2b18] text-xs space-y-1">
              <div className="flex items-center gap-1.5 font-semibold text-[#f7f0e6]">
                <Lock className="w-3.5 h-3.5 text-[#cb9d75]" />
                {isAdmin ? 'Authorized Admin Access' : 'Zero Data Selling'}
              </div>
              <p className="text-[11px] text-[#cb9d75]/70">
                {isAdmin
                  ? 'Access restricted to system administrators. All alert logs and user records are encrypted and audited.'
                  : 'Your GPS coordinates are shared exclusively with your designated emergency guardians during active distress sessions.'}
              </p>
            </div>
          </div>

        </div>

        {/* Bottom Credits */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-[#cb9d75]/70 gap-4">
          <p>© {new Date().getFullYear()} Shield Safety Companion. {isAdmin ? 'Admin Management Terminal.' : "Built for Women's Safety & Empowerment."}</p>
          <div className="flex items-center gap-4">
            <span className="hover:text-white transition-colors cursor-pointer">Privacy Policy</span>
            <span>•</span>
            <span className="hover:text-white transition-colors cursor-pointer">Terms of Protection</span>
            <span>•</span>
            <span className="hover:text-white transition-colors cursor-pointer">Community Safety Guidelines</span>
          </div>
        </div>

      </div>
    </footer>
  );
};

