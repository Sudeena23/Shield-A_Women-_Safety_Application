import React, { useState } from 'react';
import { User, Mail, Phone, Heart, Save, ShieldCheck, MapPin, CheckCircle2, ShieldAlert, Lock } from 'lucide-react';

/**
 * User Profile Page Component
 * View and edit own details only, no admin controls.
 * Shows total emergency alerts triggered count.
 */
export const UserProfile = ({ currentUser, onUpdateProfile, alerts = [] }) => {
  const [formData, setFormData] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    phone: currentUser?.phone || '',
    bloodGroup: currentUser?.bloodGroup || 'O+',
    medicalNotes: currentUser?.medicalNotes || '',
    address: currentUser?.address || 'Kathmandu, Nepal',
  });

  const [savedSuccess, setSavedSuccess] = useState(false);

  // MISUSE PREVENTION CHECK: USER ALERT COUNT
  const totalAlertsCount = alerts
    ? alerts.filter(
        (a) => a.userId === currentUser?.id || a.user === currentUser?.name || a.victimName === currentUser?.name
      ).length
    : 0;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onUpdateProfile) {
      onUpdateProfile({
        ...currentUser,
        ...formData,
      });
    }
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8 animate-in fade-in duration-200">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#2d180c] via-[#3d2517] to-[#2d180c] text-white rounded-3xl p-6 sm:p-8 border border-[#4a2b18] shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-[#9e6133] flex items-center justify-center text-white text-2xl font-black shadow-lg border-2 border-white/20 shrink-0">
            {formData.name.charAt(0).toUpperCase() || 'U'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider bg-[#f7f0e6] text-[#814a27] border border-[#eee0ce] px-2.5 py-0.5 rounded-full">
                Verified User Profile
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-[#4a2b18] text-[#eee0ce] px-2.5 py-0.5 rounded-full">
                Role: {currentUser?.role || 'user'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">{formData.name}</h1>
            <p className="text-xs text-[#eee0ce]/80">{formData.email} • {formData.phone || 'No phone'}</p>
          </div>
        </div>

        <div className="bg-[#1e1008] p-3.5 rounded-2xl border border-[#4a2b18] text-xs space-y-1 shrink-0">
          <div className="text-[#eee0ce]/70 font-medium">Blood Group</div>
          <div className="text-lg font-mono font-black text-rose-400 flex items-center gap-1">
            <Heart className="w-4 h-4 text-rose-400 fill-rose-400" /> {formData.bloodGroup || 'O+'}
          </div>
        </div>
      </div>

      {/* User SOS Alert Count Display Card */}
      <div className="bg-white border border-[#eee0ce] rounded-3xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-[#f7f0e6] text-[#9e6133] rounded-2xl shrink-0">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-black uppercase tracking-wider text-[#814a27]/70">
              Safety Record Telemetry
            </div>
            <h3 className="text-sm font-extrabold text-[#2d180c]">
              Total Emergency SOS Alerts Triggered
            </h3>
            <p className="text-xs text-[#814a27]/70">
              Visible safety metric logged for emergency dispatchers.
            </p>
          </div>
        </div>

        <div className="bg-[#f7f0e6] border border-[#eee0ce] px-5 py-2.5 rounded-2xl flex items-center gap-2 text-[#2d180c] font-mono font-black text-2xl shrink-0">
          <span className="text-xs text-[#814a27] font-sans font-bold">Total Alerts:</span>
          <span>{totalAlertsCount}</span>
        </div>
      </div>

      {/* Success Banner */}
      {savedSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl flex items-center gap-3 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="text-xs font-bold">Profile and emergency details updated successfully!</span>
        </div>
      )}

      {/* Profile Edit Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 sm:p-8 border border-[#eee0ce] shadow-xs space-y-6">
        <div className="border-b border-[#f7f0e6] pb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-extrabold text-[#2d180c] flex items-center gap-2">
              <User className="w-5 h-5 text-[#9e6133]" /> Personal & Emergency Details
            </h2>
            <p className="text-xs text-[#814a27]/80">
              This information is shared with guardians during an active emergency distress call.
            </p>
          </div>
          <ShieldCheck className="w-6 h-6 text-emerald-600" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Full Name */}
          <div>
            <label className="block text-xs font-extrabold text-[#2d180c] uppercase tracking-wider mb-1">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-[#814a27]/50 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-[#fdfbf7] border border-[#eee0ce] rounded-xl pl-9 pr-3 py-2.5 text-xs font-bold text-[#2d180c] focus:outline-none focus:ring-2 focus:ring-[#9e6133]"
              />
            </div>
          </div>

          {/* Email Address */}
          <div>
            <label className="block text-xs font-extrabold text-[#2d180c] uppercase tracking-wider mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#814a27]/50 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-[#fdfbf7] border border-[#eee0ce] rounded-xl pl-9 pr-3 py-2.5 text-xs font-bold text-[#2d180c] focus:outline-none focus:ring-2 focus:ring-[#9e6133]"
              />
            </div>
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-xs font-extrabold text-[#2d180c] uppercase tracking-wider mb-1">Mobile Phone Number</label>
            <div className="relative">
              <Phone className="w-4 h-4 text-[#814a27]/50 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full bg-[#fdfbf7] border border-[#eee0ce] rounded-xl pl-9 pr-3 py-2.5 text-xs font-bold text-[#2d180c] focus:outline-none focus:ring-2 focus:ring-[#9e6133]"
              />
            </div>
          </div>

          {/* Blood Group */}
          <div>
            <label className="block text-xs font-extrabold text-[#2d180c] uppercase tracking-wider mb-1">Blood Group</label>
            <div className="relative">
              <Heart className="w-4 h-4 text-[#9e6133] absolute left-3 top-1/2 -translate-y-1/2" />
              <select
                value={formData.bloodGroup}
                onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                className="w-full bg-[#fdfbf7] border border-[#eee0ce] rounded-xl pl-9 pr-3 py-2.5 text-xs font-bold text-[#2d180c] focus:outline-none focus:ring-2 focus:ring-[#9e6133] cursor-pointer"
              >
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
              </select>
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="block text-xs font-extrabold text-[#2d180c] uppercase tracking-wider mb-1">Home Base / Safe Zone</label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-[#814a27]/50 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full bg-[#fdfbf7] border border-[#eee0ce] rounded-xl pl-9 pr-3 py-2.5 text-xs font-bold text-[#2d180c] focus:outline-none focus:ring-2 focus:ring-[#9e6133]"
              />
            </div>
          </div>
        </div>

        {/* Medical Notes */}
        <div>
          <label className="block text-xs font-extrabold text-[#2d180c] uppercase tracking-wider mb-1">Emergency Medical Notes & Instructions</label>
          <textarea
            rows={3}
            value={formData.medicalNotes}
            onChange={(e) => setFormData({ ...formData, medicalNotes: e.target.value })}
            placeholder="e.g. Penicillin allergy, Contact emergency contacts in distress..."
            className="w-full bg-[#fdfbf7] border border-[#eee0ce] rounded-xl p-3 text-xs font-medium text-[#2d180c] focus:outline-none focus:ring-2 focus:ring-[#9e6133]"
          />
        </div>

        {/* Submit Button */}
        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            className="bg-[#9e6133] hover:bg-[#814a27] text-white font-extrabold px-6 py-3 rounded-2xl shadow-md flex items-center gap-2 text-xs uppercase tracking-wider cursor-pointer btn-primary"
          >
            <Save className="w-4 h-4" /> Save Profile Details
          </button>
        </div>
      </form>

    </div>
  );
};
