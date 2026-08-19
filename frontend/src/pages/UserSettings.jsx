import React, { useState, useEffect } from 'react';
import {
  Settings,
  User,
  Mail,
  Phone,
  Heart,
  MapPin,
  Shield,
  Bell,
  Lock,
  Volume2,
  Mic,
  Radio,
  Moon,
  Check,
  Save,
  KeyRound,
  ShieldAlert,
  CheckCircle2,
  RotateCcw,
} from 'lucide-react';

export const UserSettings = ({ currentUser, onUpdateProfile }) => {
  const [activeTab, setActiveTab] = useState('profile');

  // Profile Form State
  const [profileData, setProfileData] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    phone: currentUser?.phone || '',
    bloodGroup: currentUser?.bloodGroup || 'O+',
    medicalNotes: currentUser?.medicalNotes || '',
    emergencyPin: currentUser?.emergencyPin || '9911',
    address: currentUser?.address || 'Kathmandu, Nepal',
  });

  // Load dispatch safety settings from local storage or default
  const [dispatchSettings, setDispatchSettings] = useState(() => {
    const saved = localStorage.getItem(`shield_settings_${currentUser?.id || 'default'}`);
    return saved
      ? JSON.parse(saved)
      : {
          autoSms: true,
          audioRecord: true,
          sirenSound: true,
          nightMode: false,
          silentDuress: true,
          locationStreaming: true,
        };
  });

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [pinChangeMsg, setPinChangeMsg] = useState('');

  useEffect(() => {
    if (currentUser) {
      setProfileData({
        name: currentUser.name || '',
        email: currentUser.email || '',
        phone: currentUser.phone || '',
        bloodGroup: currentUser.bloodGroup || 'O+',
        medicalNotes: currentUser.medicalNotes || '',
        emergencyPin: currentUser.emergencyPin || '9911',
        address: currentUser.address || 'Kathmandu, Nepal',
      });
    }
  }, [currentUser]);

  const toggleDispatchSetting = (key) => {
    setDispatchSettings((prev) => {
      const updated = { ...prev, [key]: !prev[key] };
      localStorage.setItem(`shield_settings_${currentUser?.id || 'default'}`, JSON.stringify(updated));
      return updated;
    });
  };

  const handleSaveAll = (e) => {
    if (e) e.preventDefault();
    if (onUpdateProfile && currentUser) {
      onUpdateProfile({
        ...currentUser,
        ...profileData,
      });
    }

    localStorage.setItem(`shield_settings_${currentUser?.id || 'default'}`, JSON.stringify(dispatchSettings));
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handlePinUpdate = (e) => {
    e.preventDefault();
    if (!profileData.emergencyPin || profileData.emergencyPin.length !== 4) {
      setPinChangeMsg('PIN must be exactly 4 numerical digits.');
      return;
    }
    handleSaveAll();
    setPinChangeMsg('Emergency PIN updated successfully!');
    setTimeout(() => setPinChangeMsg(''), 3000);
  };

  const handleResetDefaults = () => {
    const defaultSettings = {
      autoSms: true,
      audioRecord: true,
      sirenSound: true,
      nightMode: false,
      silentDuress: true,
      locationStreaming: true,
    };
    setDispatchSettings(defaultSettings);
    localStorage.setItem(`shield_settings_${currentUser?.id || 'default'}`, JSON.stringify(defaultSettings));
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8 animate-in fade-in duration-200">
      
      {/* Page Header */}
      <div className="bg-gradient-to-r from-[#2d180c] via-[#3d2517] to-[#2d180c] text-white rounded-3xl p-6 sm:p-8 border border-[#4a2b18] shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <span className="text-[10px] font-black uppercase tracking-wider bg-[#f7f0e6] text-[#814a27] border border-[#eee0ce] px-2.5 py-1 rounded-full">
            Account & Safety Control Center
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white mt-2 flex items-center gap-2.5">
            <Settings className="w-7 h-7 text-[#cb9d75]" /> Account Settings & Profile
          </h1>
          <p className="text-xs text-[#eee0ce]/80 mt-1">
            Maintain your personal safety details, emergency PIN, guardian SMS triggers, and siren preferences.
          </p>
        </div>

        <button
          onClick={handleSaveAll}
          className="bg-[#9e6133] hover:bg-[#814a27] text-white font-extrabold px-6 py-3 rounded-2xl shadow-lg shadow-[#9e6133]/30 flex items-center justify-center gap-2 text-xs transition-all cursor-pointer shrink-0 border border-white/10 active:scale-95"
        >
          <Save className="w-4 h-4" /> Save All Settings
        </button>
      </div>

      {/* Global Success Notification */}
      {savedSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 p-4 rounded-2xl text-xs font-bold flex items-center gap-3 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>Settings and profile details updated successfully!</span>
        </div>
      )}

      {/* Settings Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-[#eee0ce] pb-3">
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'profile'
              ? 'bg-[#9e6133] text-white shadow-md shadow-[#9e6133]/20'
              : 'bg-white text-[#4a2b18] hover:bg-[#f7f0e6] border border-[#eee0ce]'
          }`}
        >
          <User className="w-4 h-4" /> Personal Profile
        </button>

        <button
          onClick={() => setActiveTab('dispatch')}
          className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'dispatch'
              ? 'bg-[#9e6133] text-white shadow-md shadow-[#9e6133]/20'
              : 'bg-white text-[#4a2b18] hover:bg-[#f7f0e6] border border-[#eee0ce]'
          }`}
        >
          <ShieldAlert className="w-4 h-4" /> Dispatch & Siren Alarms
        </button>
      </div>

      {/* TAB 1: Profile & Medical Details */}
      {activeTab === 'profile' && (
        <form onSubmit={handleSaveAll} className="bg-white rounded-3xl p-6 sm:p-8 border border-[#eee0ce] shadow-xs space-y-6">
          <div className="border-b border-[#f7f0e6] pb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-extrabold text-[#2d180c] flex items-center gap-2">
                <User className="w-5 h-5 text-[#9e6133]" /> Personal & Medical Profile
              </h2>
              <p className="text-xs text-[#814a27]/80">
                Update your contact details and critical medical info shared with emergency responders.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-extrabold text-[#2d180c] uppercase tracking-wider mb-1">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-[#814a27]/50 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={profileData.name}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  className="w-full bg-[#fdfbf7] border border-[#eee0ce] rounded-xl pl-9 pr-3 py-2.5 text-xs font-bold text-[#2d180c] focus:outline-none focus:ring-2 focus:ring-[#9e6133]"
                />
              </div>
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-xs font-extrabold text-[#2d180c] uppercase tracking-wider mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#814a27]/50 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={profileData.email}
                  onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                  className="w-full bg-[#fdfbf7] border border-[#eee0ce] rounded-xl pl-9 pr-3 py-2.5 text-xs font-bold text-[#2d180c] focus:outline-none focus:ring-2 focus:ring-[#9e6133]"
                />
              </div>
            </div>

            {/* Mobile Phone */}
            <div>
              <label className="block text-xs font-extrabold text-[#2d180c] uppercase tracking-wider mb-1">
                Mobile Phone Number
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-[#814a27]/50 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={profileData.phone}
                  onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                  className="w-full bg-[#fdfbf7] border border-[#eee0ce] rounded-xl pl-9 pr-3 py-2.5 text-xs font-bold text-[#2d180c] focus:outline-none focus:ring-2 focus:ring-[#9e6133]"
                />
              </div>
            </div>

            {/* Blood Group */}
            <div>
              <label className="block text-xs font-extrabold text-[#2d180c] uppercase tracking-wider mb-1">
                Blood Group
              </label>
              <div className="relative">
                <Heart className="w-4 h-4 text-[#9e6133] absolute left-3 top-1/2 -translate-y-1/2" />
                <select
                  value={profileData.bloodGroup}
                  onChange={(e) => setProfileData({ ...profileData, bloodGroup: e.target.value })}
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

            {/* Home Base Address */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-extrabold text-[#2d180c] uppercase tracking-wider mb-1">
                Home Base / Primary Safe Zone Location
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-[#814a27]/50 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={profileData.address}
                  onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                  placeholder="e.g. Kathmandu, Nepal"
                  className="w-full bg-[#fdfbf7] border border-[#eee0ce] rounded-xl pl-9 pr-3 py-2.5 text-xs font-bold text-[#2d180c] focus:outline-none focus:ring-2 focus:ring-[#9e6133]"
                />
              </div>
            </div>
          </div>

          {/* Medical Notes */}
          <div>
            <label className="block text-xs font-extrabold text-[#2d180c] uppercase tracking-wider mb-1">
              Emergency Medical Notes & Instructions
            </label>
            <textarea
              rows={3}
              value={profileData.medicalNotes}
              onChange={(e) => setProfileData({ ...profileData, medicalNotes: e.target.value })}
              placeholder="e.g. Penicillin allergy, Contact emergency contacts in distress..."
              className="w-full bg-[#fdfbf7] border border-[#eee0ce] rounded-xl p-3 text-xs font-medium text-[#2d180c] focus:outline-none focus:ring-2 focus:ring-[#9e6133]"
            />
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="bg-[#9e6133] hover:bg-[#814a27] text-white font-extrabold px-6 py-3 rounded-2xl shadow-md flex items-center gap-2 text-xs uppercase tracking-wider cursor-pointer"
            >
              <Save className="w-4 h-4" /> Save Profile Details
            </button>
          </div>
        </form>
      )}

      {/* TAB 2: Dispatch & Siren Alarms */}
      {activeTab === 'dispatch' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#eee0ce] shadow-xs space-y-6">
          <div className="border-b border-[#f7f0e6] pb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-extrabold text-[#2d180c] flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-red-600" /> Automated Dispatch & Alarm Siren Controls
              </h2>
              <p className="text-xs text-[#814a27]/80">
                Customize automated behaviors when the Emergency SOS button is pressed.
              </p>
            </div>

            <button
              onClick={handleResetDefaults}
              className="text-xs font-bold text-[#814a27] hover:text-[#2d180c] flex items-center gap-1 cursor-pointer bg-[#f7f0e6] px-3 py-1.5 rounded-xl border border-[#eee0ce]"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset Defaults
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Toggle 1: SMS */}
            <div className="p-4 rounded-2xl border border-[#eee0ce] bg-[#fdfbf7] flex items-center justify-between gap-3">
              <div>
                <div className="text-xs font-bold text-[#2d180c] flex items-center gap-1.5">
                  <Bell className="w-4 h-4 text-red-600" /> Instant SMS Guardian Broadcast
                </div>
                <div className="text-[11px] text-[#814a27]/70 mt-0.5">
                  Automatically send emergency SMS with live GPS link to all guardians.
                </div>
              </div>
              <button
                type="button"
                onClick={() => toggleDispatchSetting('autoSms')}
                className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ${
                  dispatchSettings.autoSms ? 'bg-red-600' : 'bg-[#eee0ce]'
                }`}
              >
                <span
                  className={`w-5 h-5 rounded-full bg-white shadow-md absolute top-0.5 transition-transform ${
                    dispatchSettings.autoSms ? 'left-6.5' : 'left-0.5'
                  }`}
                />
              </button>
            </div>

            {/* Toggle 2: Siren */}
            <div className="p-4 rounded-2xl border border-[#eee0ce] bg-[#fdfbf7] flex items-center justify-between gap-3">
              <div>
                <div className="text-xs font-bold text-[#2d180c] flex items-center gap-1.5">
                  <Volume2 className="w-4 h-4 text-amber-600" /> High-Decibel Deterrence Siren
                </div>
                <div className="text-[11px] text-[#814a27]/70 mt-0.5">
                  Play loud 110dB alarm sound through device speakers during active SOS.
                </div>
              </div>
              <button
                type="button"
                onClick={() => toggleDispatchSetting('sirenSound')}
                className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ${
                  dispatchSettings.sirenSound ? 'bg-red-600' : 'bg-[#eee0ce]'
                }`}
              >
                <span
                  className={`w-5 h-5 rounded-full bg-white shadow-md absolute top-0.5 transition-transform ${
                    dispatchSettings.sirenSound ? 'left-6.5' : 'left-0.5'
                  }`}
                />
              </button>
            </div>

            {/* Toggle 3: Audio Record */}
            <div className="p-4 rounded-2xl border border-[#eee0ce] bg-[#fdfbf7] flex items-center justify-between gap-3">
              <div>
                <div className="text-xs font-bold text-[#2d180c] flex items-center gap-1.5">
                  <Mic className="w-4 h-4 text-[#9e6133]" /> Auto Background Audio Recording
                </div>
                <div className="text-[11px] text-[#814a27]/70 mt-0.5">
                  Record 30-second encrypted background audio snippet upon SOS trigger.
                </div>
              </div>
              <button
                type="button"
                onClick={() => toggleDispatchSetting('audioRecord')}
                className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ${
                  dispatchSettings.audioRecord ? 'bg-[#9e6133]' : 'bg-[#eee0ce]'
                }`}
              >
                <span
                  className={`w-5 h-5 rounded-full bg-white shadow-md absolute top-0.5 transition-transform ${
                    dispatchSettings.audioRecord ? 'left-6.5' : 'left-0.5'
                  }`}
                />
              </button>
            </div>

            {/* Toggle 4: Live GPS Streaming */}
            <div className="p-4 rounded-2xl border border-[#eee0ce] bg-[#fdfbf7] flex items-center justify-between gap-3">
              <div>
                <div className="text-xs font-bold text-[#2d180c] flex items-center gap-1.5">
                  <Radio className="w-4 h-4 text-blue-600" /> Continuous GPS Coordinates Stream
                </div>
                <div className="text-[11px] text-[#814a27]/70 mt-0.5">
                  Stream real-time location updates to police & guardians every 10 seconds.
                </div>
              </div>
              <button
                type="button"
                onClick={() => toggleDispatchSetting('locationStreaming')}
                className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ${
                  dispatchSettings.locationStreaming ? 'bg-blue-600' : 'bg-[#eee0ce]'
                }`}
              >
                <span
                  className={`w-5 h-5 rounded-full bg-white shadow-md absolute top-0.5 transition-transform ${
                    dispatchSettings.locationStreaming ? 'left-6.5' : 'left-0.5'
                  }`}
                />
              </button>
            </div>

            {/* Toggle 5: Stealth Duress Mode */}
            <div className="p-4 rounded-2xl border border-[#eee0ce] bg-[#fdfbf7] flex items-center justify-between gap-3">
              <div>
                <div className="text-xs font-bold text-[#2d180c] flex items-center gap-1.5">
                  <Lock className="w-4 h-4 text-emerald-600" /> Stealth Duress Key Enabling
                </div>
                <div className="text-[11px] text-[#814a27]/70 mt-0.5">
                  Enable entry of 4321 for silent police distress dispatch.
                </div>
              </div>
              <button
                type="button"
                onClick={() => toggleDispatchSetting('silentDuress')}
                className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ${
                  dispatchSettings.silentDuress ? 'bg-emerald-600' : 'bg-[#eee0ce]'
                }`}
              >
                <span
                  className={`w-5 h-5 rounded-full bg-white shadow-md absolute top-0.5 transition-transform ${
                    dispatchSettings.silentDuress ? 'left-6.5' : 'left-0.5'
                  }`}
                />
              </button>
            </div>

            {/* Toggle 6: Night Safety Theme */}
            <div className="p-4 rounded-2xl border border-[#eee0ce] bg-[#fdfbf7] flex items-center justify-between gap-3">
              <div>
                <div className="text-xs font-bold text-[#2d180c] flex items-center gap-1.5">
                  <Moon className="w-4 h-4 text-[#4a2b18]" /> High-Contrast Night Safety Mode
                </div>
                <div className="text-[11px] text-[#814a27]/70 mt-0.5">
                  Optimize display contrast for late night commuting and low light.
                </div>
              </div>
              <button
                type="button"
                onClick={() => toggleDispatchSetting('nightMode')}
                className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ${
                  dispatchSettings.nightMode ? 'bg-[#2d180c]' : 'bg-[#eee0ce]'
                }`}
              >
                <span
                  className={`w-5 h-5 rounded-full bg-white shadow-md absolute top-0.5 transition-transform ${
                    dispatchSettings.nightMode ? 'left-6.5' : 'left-0.5'
                  }`}
                />
              </button>
            </div>

          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="button"
              onClick={handleSaveAll}
              className="bg-[#9e6133] hover:bg-[#814a27] text-white font-extrabold px-6 py-3 rounded-2xl shadow-md flex items-center gap-2 text-xs uppercase tracking-wider cursor-pointer"
            >
              <Save className="w-4 h-4" /> Save Dispatch Preferences
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
