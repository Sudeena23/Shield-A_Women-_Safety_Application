import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldAlert,
  MapPin,
  ShieldCheck,
  UserCheck,
  Mail,
  Phone,
  Droplet,
  FileText,
  Settings,
} from 'lucide-react';
import { SOSButton } from '../components/SOSButton';

export const Dashboard = ({
  onTriggerSOS,
  guardians,
  currentUser,
}) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      
      {/* Top Welcome & Safety Status Banner */}
      <div className="bg-gradient-to-r from-[#2d180c] via-[#3d2517] to-[#2d180c] rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-[#4a2b18] flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Shield Active • Protection Level 100%
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {currentUser ? `Welcome back, ${currentUser.name}` : 'Safety Command Center'}
          </h1>
          <p className="text-xs sm:text-sm text-[#eee0ce]/80">
            {currentUser ? `Emergency Profile Recorded: ${currentUser.phone} • Blood: ${currentUser.bloodGroup || 'O+'}` : `Current GPS telemetry live. All ${guardians.length} guardians connected and receiving status signals.`}
          </p>
        </div>

        {/* Status Badge Pills */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="bg-[#4a2b18]/80 px-4 py-2.5 rounded-2xl border border-[#683c22] flex items-center gap-2 text-xs font-semibold">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Guardians: <strong className="text-white">{guardians.length} Ready</strong></span>
          </div>
          <div className="bg-[#4a2b18]/80 px-4 py-2.5 rounded-2xl border border-[#683c22] flex items-center gap-2 text-xs font-semibold">
            <MapPin className="w-4 h-4 text-[#cb9d75]" />
            <span>GPS: <strong className="text-white">Active (High Accuracy)</strong></span>
          </div>
        </div>
      </div>

      {/* Recorded User Information Card */}
      {currentUser && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#eee0ce] shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#f7f0e6] pb-5">
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-2xl bg-[#9e6133] text-white font-black text-xl flex items-center justify-center shadow-md shrink-0`}>
                {currentUser.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-black text-[#2d180c]">{currentUser.name}</h2>
                  <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full text-xs font-bold flex items-center gap-1">
                    <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                    Recorded User
                  </span>
                </div>
                <p className="text-xs text-[#814a27]/70 font-medium">User ID: <code className="font-mono text-[#2d180c]">{currentUser.id}</code></p>
              </div>
            </div>

            <Link
              to="/settings"
              className="inline-flex items-center gap-2 bg-[#f7f0e6] hover:bg-[#eee0ce] text-[#2d180c] text-xs font-extrabold px-4 py-2.5 rounded-xl transition-all border border-[#eee0ce] self-start sm:self-auto"
            >
              <Settings className="w-4 h-4 text-[#814a27]" />
              <span>Safety & Profile Settings</span>
            </Link>
          </div>

          {/* User Recorded Fields Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Email */}
            <div className="p-4 bg-[#fdfbf7] rounded-2xl border border-[#eee0ce] space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-[#814a27]/70 uppercase tracking-wider">
                <Mail className="w-4 h-4 text-[#9e6133]" />
                <span>Email Address</span>
              </div>
              <div className="text-sm font-extrabold text-[#2d180c] truncate">{currentUser.email}</div>
            </div>

            {/* Phone Number */}
            <div className="p-4 bg-[#fdfbf7] rounded-2xl border border-[#eee0ce] space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-[#814a27]/70 uppercase tracking-wider">
                <Phone className="w-4 h-4 text-[#9e6133]" />
                <span>Phone Number</span>
              </div>
              <div className="text-sm font-extrabold text-[#2d180c]">{currentUser.phone}</div>
            </div>

            {/* Blood Group */}
            <div className="p-4 bg-[#fdfbf7] rounded-2xl border border-[#eee0ce] space-y-1 sm:col-span-2 lg:col-span-1">
              <div className="flex items-center gap-2 text-xs font-bold text-[#814a27]/70 uppercase tracking-wider">
                <Droplet className="w-4 h-4 text-[#9e6133]" />
                <span>Blood Group</span>
              </div>
              <div className="text-sm font-extrabold text-[#9e6133]">{currentUser.bloodGroup || 'O+'}</div>
            </div>

          </div>

          {/* Medical & Emergency Notes */}
          {currentUser.medicalNotes && (
            <div className="p-4 bg-[#f7f0e6] rounded-2xl border border-[#eee0ce] space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-[#814a27] uppercase tracking-wider">
                <FileText className="w-4 h-4 text-[#9e6133]" />
                <span>Recorded Medical Notes & Emergency Instructions</span>
              </div>
              <p className="text-xs text-[#2d180c] font-semibold leading-relaxed">
                {currentUser.medicalNotes}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Hero SOS Command Hub */}
      <div className="bg-gradient-to-b from-[#f7f0e6] via-[#fdfbf7] to-[#fbf8f3] rounded-3xl p-8 sm:p-12 border-2 border-[#eee0ce] shadow-xl flex flex-col items-center text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#cb9d75]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#b87b48]/10 rounded-full blur-3xl pointer-events-none" />

        <span className="text-xs font-black uppercase tracking-widest text-[#814a27] bg-[#f7f0e6] px-3.5 py-1 rounded-full border border-[#eee0ce] mb-6">
          PRIMARY EMERGENCY TRIGGER
        </span>

        {/* Central SOS Button */}
        <SOSButton
          onTrigger={onTriggerSOS}
          size="hero"
          label="PRESS SOS"
          sublabel="Instant Distress Alert to Guardians & Police"
          className="my-2"
        />

        <p className="text-xs text-[#814a27]/80 font-medium max-w-md mt-8 leading-relaxed">
          Pressing SOS dispatches live GPS coordinates, triggers optional loud siren alert, and alerts all your designated guardians immediately.
        </p>
      </div>

    </div>
  );
};

