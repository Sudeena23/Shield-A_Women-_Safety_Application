import React, { useState, useEffect, useRef } from "react";
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
  VolumeX,
  Mic,
  Radio,
  Moon,
  Check,
  Save,
  KeyRound,
  ShieldAlert,
  CheckCircle2,
  RotateCcw,
  Eye,
  EyeOff,
  PhoneCall,
  Sparkles,
  Smartphone,
  BatteryCharging,
  Clock,
  AlertTriangle,
  Play,
  Square,
  ShieldCheck,
} from "lucide-react";
import { authService } from "../services/authService";

export const UserSettings = ({ currentUser, onUpdateProfile, onOpenFakeCall }) => {
  const [activeTab, setActiveTab] = useState("profile");

  // Profile Form State
  const [profileData, setProfileData] = useState({
    name: currentUser?.name || "",
    email: currentUser?.email || "",
    phone: currentUser?.phone || "",
    bloodGroup: currentUser?.bloodGroup || "O+",
    medicalNotes: currentUser?.medicalNotes || "",
    address: currentUser?.address || "Kathmandu, Nepal",
    emergencyPin: currentUser?.emergencyPin || "4321",
  });

  // Load dispatch safety settings from currentUser.settings, localStorage, or defaults
  const [dispatchSettings, setDispatchSettings] = useState(() => {
    const saved = localStorage.getItem(`shield_settings_${currentUser?.id || "default"}`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return (
      currentUser?.settings || {
        autoPush: true,
        sirenSound: true,
        sirenVolume: 80,
        audioRecord: true,
        locationStreaming: true,
        silentDuress: true,
        autoSmsGuardians: true,
        sosDelaySeconds: 0,
        fakeCallerName: "Mom",
        fakeCallDelaySeconds: 5,
        guardianCheckInReminder: true,
        lowBatteryDistressAlert: true,
        nightMode: false,
      }
    );
  });

  // Password change state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Status feedback
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Web Audio Siren Synthesizer for in-browser testing
  const [isTestingSiren, setIsTestingSiren] = useState(false);
  const audioContextRef = useRef(null);
  const sirenOscillatorRef = useRef(null);
  const sirenGainRef = useRef(null);
  const sirenIntervalRef = useRef(null);

  useEffect(() => {
    if (currentUser) {
      setProfileData({
        name: currentUser.name || "",
        email: currentUser.email || "",
        phone: currentUser.phone || "",
        bloodGroup: currentUser.bloodGroup || "O+",
        medicalNotes: currentUser.medicalNotes || "",
        address: currentUser.address || "Kathmandu, Nepal",
        emergencyPin: currentUser.emergencyPin || "4321",
      });

      if (currentUser.settings) {
        setDispatchSettings((prev) => ({
          ...prev,
          ...currentUser.settings,
        }));
      }
    }
  }, [currentUser]);

  // Clean up audio siren on unmount
  useEffect(() => {
    return () => {
      stopSirenTest();
    };
  }, []);

  const toggleDispatchSetting = (key) => {
    setDispatchSettings((prev) => {
      const updated = { ...prev, [key]: !prev[key] };
      localStorage.setItem(
        `shield_settings_${currentUser?.id || "default"}`,
        JSON.stringify(updated)
      );
      return updated;
    });
  };

  const handleSettingValueChange = (key, value) => {
    setDispatchSettings((prev) => {
      const updated = { ...prev, [key]: value };
      localStorage.setItem(
        `shield_settings_${currentUser?.id || "default"}`,
        JSON.stringify(updated)
      );
      return updated;
    });
  };

  // Save profile and settings
  const handleSaveAll = async (e) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    setErrorMessage("");

    try {
      if (onUpdateProfile && currentUser) {
        await onUpdateProfile({
          ...currentUser,
          ...profileData,
          settings: dispatchSettings,
        });
      }

      localStorage.setItem(
        `shield_settings_${currentUser?.id || "default"}`,
        JSON.stringify(dispatchSettings)
      );

      setSavedSuccess("All settings and profile details updated successfully!");
      setTimeout(() => setSavedSuccess(""), 4000);
    } catch (err) {
      setErrorMessage(err.message || "Failed to save settings. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  // Password change submission
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!passwordForm.currentPassword) {
      setErrorMessage("Please enter your current password.");
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      setErrorMessage("New password must be at least 6 characters long.");
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setErrorMessage("New password and confirm password do not match.");
      return;
    }

    setIsSaving(true);
    try {
      await authService.changePassword(
        passwordForm.currentPassword,
        passwordForm.newPassword
      );

      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      setSavedSuccess("Password changed successfully!");
      setTimeout(() => setSavedSuccess(""), 4000);
    } catch (err) {
      setErrorMessage(err.message || "Failed to change password.");
    } finally {
      setIsSaving(false);
    }
  };

  // Reset all settings to default
  const handleResetDefaults = () => {
    const defaultSettings = {
      autoPush: true,
      sirenSound: true,
      sirenVolume: 80,
      audioRecord: true,
      locationStreaming: true,
      silentDuress: true,
      autoSmsGuardians: true,
      sosDelaySeconds: 0,
      fakeCallerName: "Mom",
      fakeCallDelaySeconds: 5,
      guardianCheckInReminder: true,
      lowBatteryDistressAlert: true,
      nightMode: false,
    };
    setDispatchSettings(defaultSettings);
    localStorage.setItem(
      `shield_settings_${currentUser?.id || "default"}`,
      JSON.stringify(defaultSettings)
    );
    setSavedSuccess("Safety settings reset to recommended defaults!");
    setTimeout(() => setSavedSuccess(""), 3000);
  };

  // Web Audio Alarm Siren Synthesizer
  const startSirenTest = () => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;

      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContext();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === "suspended") {
        ctx.resume();
      }

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sawtooth";
      const volumeLevel = (dispatchSettings.sirenVolume || 80) / 100 * 0.3; // safe gain
      gain.gain.setValueAtTime(volumeLevel, ctx.currentTime);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();

      let freq = 600;
      let goingUp = true;
      const interval = setInterval(() => {
        if (!osc || !ctx) return;
        freq = goingUp ? freq + 40 : freq - 40;
        if (freq >= 1100) goingUp = false;
        if (freq <= 500) goingUp = true;
        try {
          osc.frequency.setValueAtTime(freq, ctx.currentTime);
        } catch (e) {}
      }, 50);

      sirenOscillatorRef.current = osc;
      sirenGainRef.current = gain;
      sirenIntervalRef.current = interval;
      setIsTestingSiren(true);
    } catch (e) {
      console.warn("Could not start audio siren:", e);
    }
  };

  const stopSirenTest = () => {
    if (sirenIntervalRef.current) {
      clearInterval(sirenIntervalRef.current);
      sirenIntervalRef.current = null;
    }
    if (sirenOscillatorRef.current) {
      try {
        sirenOscillatorRef.current.stop();
        sirenOscillatorRef.current.disconnect();
      } catch (e) {}
      sirenOscillatorRef.current = null;
    }
    setIsTestingSiren(false);
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
            <Settings className="w-7 h-7 text-[#cb9d75]" /> User Safety & Account Settings
          </h1>
          <p className="text-xs text-[#eee0ce]/80 mt-1">
            Customize emergency SOS triggers, profile records, alarm sirens, stealth PIN, and notifications.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={handleSaveAll}
            disabled={isSaving}
            className="bg-[#9e6133] hover:bg-[#814a27] text-white font-extrabold px-6 py-3 rounded-2xl shadow-lg shadow-[#9e6133]/30 flex items-center justify-center gap-2 text-xs transition-all cursor-pointer border border-white/10 active:scale-95 disabled:opacity-50"
          >
            <Save className="w-4 h-4" /> {isSaving ? "Saving..." : "Save All Changes"}
          </button>
        </div>
      </div>

      {/* Global Success Notification */}
      {savedSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 p-4 rounded-2xl text-xs font-bold flex items-center gap-3 animate-in fade-in shadow-xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{savedSuccess}</span>
        </div>
      )}

      {/* Global Error Notification */}
      {errorMessage && (
        <div className="bg-red-50 border border-red-200 text-red-900 p-4 rounded-2xl text-xs font-bold flex items-center gap-3 animate-in fade-in shadow-xs">
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Settings Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-[#eee0ce] pb-3">
        <button
          onClick={() => setActiveTab("profile")}
          className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === "profile"
              ? "bg-[#9e6133] text-white shadow-md shadow-[#9e6133]/20"
              : "bg-white text-[#4a2b18] hover:bg-[#f7f0e6] border border-[#eee0ce]"
          }`}
        >
          <User className="w-4 h-4" /> Personal & Medical Profile
        </button>

        <button
          onClick={() => setActiveTab("dispatch")}
          className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === "dispatch"
              ? "bg-[#9e6133] text-white shadow-md shadow-[#9e6133]/20"
              : "bg-white text-[#4a2b18] hover:bg-[#f7f0e6] border border-[#eee0ce]"
          }`}
        >
          <ShieldAlert className="w-4 h-4" /> SOS & Siren Alarms
        </button>

        <button
          onClick={() => setActiveTab("stealth")}
          className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === "stealth"
              ? "bg-[#9e6133] text-white shadow-md shadow-[#9e6133]/20"
              : "bg-white text-[#4a2b18] hover:bg-[#f7f0e6] border border-[#eee0ce]"
          }`}
        >
          <KeyRound className="w-4 h-4" /> Stealth PIN & Fake Call
        </button>

        <button
          onClick={() => setActiveTab("security")}
          className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === "security"
              ? "bg-[#9e6133] text-white shadow-md shadow-[#9e6133]/20"
              : "bg-white text-[#4a2b18] hover:bg-[#f7f0e6] border border-[#eee0ce]"
          }`}
        >
          <Lock className="w-4 h-4" /> Change Password
        </button>

        <button
          onClick={() => setActiveTab("notifications")}
          className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === "notifications"
              ? "bg-[#9e6133] text-white shadow-md shadow-[#9e6133]/20"
              : "bg-white text-[#4a2b18] hover:bg-[#f7f0e6] border border-[#eee0ce]"
          }`}
        >
          <Bell className="w-4 h-4" /> Notifications & Device
        </button>
      </div>

      {/* ========================================================= */}
      {/* TAB 1: PERSONAL & MEDICAL PROFILE                         */}
      {/* ========================================================= */}
      {activeTab === "profile" && (
        <form
          onSubmit={handleSaveAll}
          className="bg-white rounded-3xl p-6 sm:p-8 border border-[#eee0ce] shadow-xs space-y-6"
        >
          <div className="border-b border-[#f7f0e6] pb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-extrabold text-[#2d180c] flex items-center gap-2">
                <User className="w-5 h-5 text-[#9e6133]" /> Personal & Medical Profile
              </h2>
              <p className="text-xs text-[#814a27]/80">
                Update your emergency profile details shared with guardians and emergency responders during distress.
              </p>
            </div>
            <ShieldCheck className="w-6 h-6 text-emerald-600" />
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
                  disabled
                  value={profileData.email}
                  className="w-full bg-[#f7f0e6] border border-[#eee0ce] rounded-xl pl-9 pr-3 py-2.5 text-xs font-bold text-[#814a27] cursor-not-allowed opacity-80"
                  title="Email cannot be changed directly"
                />
              </div>
              <span className="text-[10px] text-[#814a27]/60 mt-0.5 block">Account primary identifier</span>
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
                  placeholder="+977 98XXXXXXXX"
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
                <Heart className="w-4 h-4 text-rose-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <select
                  value={profileData.bloodGroup}
                  onChange={(e) => setProfileData({ ...profileData, bloodGroup: e.target.value })}
                  className="w-full bg-[#fdfbf7] border border-[#eee0ce] rounded-xl pl-9 pr-3 py-2.5 text-xs font-bold text-[#2d180c] focus:outline-none focus:ring-2 focus:ring-[#9e6133] cursor-pointer"
                >
                  <option value="A+">A+ (A Positive)</option>
                  <option value="A-">A- (A Negative)</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="O+">O+ (Universal Donor)</option>
                  <option value="O-">O-</option>
                  <option value="AB+">AB+ (Universal Recipient)</option>
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
                  placeholder="e.g. Lazimpat, Kathmandu, Nepal"
                  className="w-full bg-[#fdfbf7] border border-[#eee0ce] rounded-xl pl-9 pr-3 py-2.5 text-xs font-bold text-[#2d180c] focus:outline-none focus:ring-2 focus:ring-[#9e6133]"
                />
              </div>
            </div>
          </div>

          {/* Medical Notes */}
          <div>
            <label className="block text-xs font-extrabold text-[#2d180c] uppercase tracking-wider mb-1">
              Emergency Medical Notes & Allergies
            </label>
            <textarea
              rows={3}
              value={profileData.medicalNotes}
              onChange={(e) => setProfileData({ ...profileData, medicalNotes: e.target.value })}
              placeholder="e.g. Asthma inhaler in bag, allergic to penicillin, emergency contact is father..."
              className="w-full bg-[#fdfbf7] border border-[#eee0ce] rounded-xl p-3 text-xs font-medium text-[#2d180c] focus:outline-none focus:ring-2 focus:ring-[#9e6133]"
            />
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="bg-[#9e6133] hover:bg-[#814a27] text-white font-extrabold px-6 py-3 rounded-2xl shadow-md flex items-center gap-2 text-xs uppercase tracking-wider cursor-pointer"
            >
              <Save className="w-4 h-4" /> {isSaving ? "Saving..." : "Save Profile Details"}
            </button>
          </div>
        </form>
      )}

      {/* ========================================================= */}
      {/* TAB 2: DISPATCH & SIREN ALARMS                            */}
      {/* ========================================================= */}
      {activeTab === "dispatch" && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#eee0ce] shadow-xs space-y-6">
          <div className="border-b border-[#f7f0e6] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-extrabold text-[#2d180c] flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-red-600" /> Automated Dispatch & Alarm Siren Controls
              </h2>
              <p className="text-xs text-[#814a27]/80">
                Configure automated security behaviors when the Emergency SOS button is pressed.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleResetDefaults}
                className="text-xs font-bold text-[#814a27] hover:text-[#2d180c] flex items-center gap-1 cursor-pointer bg-[#f7f0e6] px-3 py-1.5 rounded-xl border border-[#eee0ce]"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reset Defaults
              </button>
            </div>
          </div>

          {/* Interactive Siren Audio Synthesizer Test Card */}
          <div className="p-4 bg-gradient-to-r from-red-50 to-amber-50 rounded-2xl border border-red-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-red-600 text-white rounded-xl shadow-xs shrink-0">
                <Volume2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-extrabold text-[#2d180c]">
                  Live Alarm Siren Synthesizer
                </h4>
                <p className="text-[11px] text-[#814a27]/80">
                  Simulate high-frequency deterrent alarm tone directly through your device speaker.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {isTestingSiren ? (
                <button
                  type="button"
                  onClick={stopSirenTest}
                  className="bg-red-600 hover:bg-red-700 text-white font-extrabold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-md animate-pulse cursor-pointer shrink-0"
                >
                  <Square className="w-3.5 h-3.5 fill-white" /> Stop Siren Test
                </button>
              ) : (
                <button
                  type="button"
                  onClick={startSirenTest}
                  className="bg-[#2d180c] hover:bg-[#4a2b18] text-white font-extrabold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-md cursor-pointer shrink-0"
                >
                  <Play className="w-3.5 h-3.5 fill-white" /> Test Siren Audio
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Toggle 1: Live Push Broadcast */}
            <div className="p-4 rounded-2xl border border-[#eee0ce] bg-[#fdfbf7] flex items-center justify-between gap-3">
              <div>
                <div className="text-xs font-bold text-[#2d180c] flex items-center gap-1.5">
                  <Bell className="w-4 h-4 text-red-600" /> Instant Push & Guardian Broadcast
                </div>
                <div className="text-[11px] text-[#814a27]/70 mt-0.5">
                  Broadcast distress alerts with live GPS coordinates to guardians.
                </div>
              </div>
              <button
                type="button"
                onClick={() => toggleDispatchSetting("autoPush")}
                className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ${
                  dispatchSettings.autoPush !== false ? "bg-red-600" : "bg-[#eee0ce]"
                }`}
              >
                <span
                  className={`w-5 h-5 rounded-full bg-white shadow-md absolute top-0.5 transition-transform ${
                    dispatchSettings.autoPush !== false ? "left-6.5" : "left-0.5"
                  }`}
                />
              </button>
            </div>

            {/* Toggle 2: Siren Sound */}
            <div className="p-4 rounded-2xl border border-[#eee0ce] bg-[#fdfbf7] flex items-center justify-between gap-3">
              <div>
                <div className="text-xs font-bold text-[#2d180c] flex items-center gap-1.5">
                  <Volume2 className="w-4 h-4 text-amber-600" /> High-Decibel Deterrence Siren
                </div>
                <div className="text-[11px] text-[#814a27]/70 mt-0.5">
                  Play loud alarm siren through device speaker when SOS is triggered.
                </div>
              </div>
              <button
                type="button"
                onClick={() => toggleDispatchSetting("sirenSound")}
                className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ${
                  dispatchSettings.sirenSound ? "bg-red-600" : "bg-[#eee0ce]"
                }`}
              >
                <span
                  className={`w-5 h-5 rounded-full bg-white shadow-md absolute top-0.5 transition-transform ${
                    dispatchSettings.sirenSound ? "left-6.5" : "left-0.5"
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
                  Capture 30-second encrypted ambient audio snippet upon SOS dispatch.
                </div>
              </div>
              <button
                type="button"
                onClick={() => toggleDispatchSetting("audioRecord")}
                className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ${
                  dispatchSettings.audioRecord ? "bg-[#9e6133]" : "bg-[#eee0ce]"
                }`}
              >
                <span
                  className={`w-5 h-5 rounded-full bg-white shadow-md absolute top-0.5 transition-transform ${
                    dispatchSettings.audioRecord ? "left-6.5" : "left-0.5"
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
                  Stream real-time location telemetry to guardians continuously.
                </div>
              </div>
              <button
                type="button"
                onClick={() => toggleDispatchSetting("locationStreaming")}
                className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ${
                  dispatchSettings.locationStreaming ? "bg-blue-600" : "bg-[#eee0ce]"
                }`}
              >
                <span
                  className={`w-5 h-5 rounded-full bg-white shadow-md absolute top-0.5 transition-transform ${
                    dispatchSettings.locationStreaming ? "left-6.5" : "left-0.5"
                  }`}
                />
              </button>
            </div>

            {/* Toggle 5: Auto SMS Simulation */}
            <div className="p-4 rounded-2xl border border-[#eee0ce] bg-[#fdfbf7] flex items-center justify-between gap-3">
              <div>
                <div className="text-xs font-bold text-[#2d180c] flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-emerald-600" /> Auto SMS / WhatsApp Dispatch
                </div>
                <div className="text-[11px] text-[#814a27]/70 mt-0.5">
                  Prepare instant SMS distress message draft to primary guardian.
                </div>
              </div>
              <button
                type="button"
                onClick={() => toggleDispatchSetting("autoSmsGuardians")}
                className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ${
                  dispatchSettings.autoSmsGuardians ? "bg-emerald-600" : "bg-[#eee0ce]"
                }`}
              >
                <span
                  className={`w-5 h-5 rounded-full bg-white shadow-md absolute top-0.5 transition-transform ${
                    dispatchSettings.autoSmsGuardians ? "left-6.5" : "left-0.5"
                  }`}
                />
              </button>
            </div>

            {/* Setting 6: SOS Countdown Delay */}
            <div className="p-4 rounded-2xl border border-[#eee0ce] bg-[#fdfbf7] flex items-center justify-between gap-3">
              <div>
                <div className="text-xs font-bold text-[#2d180c] flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-[#814a27]" /> SOS Dispatch Countdown Delay
                </div>
                <div className="text-[11px] text-[#814a27]/70 mt-0.5">
                  Grace period before emergency alerts are dispatched.
                </div>
              </div>
              <select
                value={dispatchSettings.sosDelaySeconds || 0}
                onChange={(e) =>
                  handleSettingValueChange("sosDelaySeconds", Number(e.target.value))
                }
                className="bg-white border border-[#eee0ce] rounded-xl px-3 py-1.5 text-xs font-bold text-[#2d180c] focus:outline-none focus:ring-2 focus:ring-[#9e6133] cursor-pointer"
              >
                <option value={0}>Instant (0s)</option>
                <option value={3}>3 Seconds</option>
                <option value={5}>5 Seconds</option>
              </select>
            </div>
          </div>

          {/* Siren Volume Slider */}
          <div className="p-4 rounded-2xl border border-[#eee0ce] bg-[#fdfbf7] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#2d180c] flex items-center gap-1.5">
                <Volume2 className="w-4 h-4 text-[#9e6133]" /> Deterrence Siren Volume Level
              </span>
              <span className="text-xs font-black text-[#9e6133]">
                {dispatchSettings.sirenVolume || 80}%
              </span>
            </div>
            <input
              type="range"
              min="20"
              max="100"
              step="5"
              value={dispatchSettings.sirenVolume || 80}
              onChange={(e) =>
                handleSettingValueChange("sirenVolume", Number(e.target.value))
              }
              className="w-full accent-[#9e6133] cursor-pointer"
            />
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="button"
              onClick={handleSaveAll}
              disabled={isSaving}
              className="bg-[#9e6133] hover:bg-[#814a27] text-white font-extrabold px-6 py-3 rounded-2xl shadow-md flex items-center gap-2 text-xs uppercase tracking-wider cursor-pointer"
            >
              <Save className="w-4 h-4" /> {isSaving ? "Saving..." : "Save Dispatch Preferences"}
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 3: STEALTH PIN & FAKE CALL                            */}
      {/* ========================================================= */}
      {activeTab === "stealth" && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#eee0ce] shadow-xs space-y-6">
          <div className="border-b border-[#f7f0e6] pb-4">
            <h2 className="text-lg font-extrabold text-[#2d180c] flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-emerald-600" /> Stealth Duress PIN & Fake Call Shortcuts
            </h2>
            <p className="text-xs text-[#814a27]/80">
              Stealth protection measures when forced under duress or escaping uncomfortable situations.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Duress PIN Card */}
            <div className="p-5 bg-[#fdfbf7] rounded-2xl border border-[#eee0ce] space-y-4">
              <div className="flex items-center gap-2 text-xs font-black text-[#2d180c]">
                <Lock className="w-4 h-4 text-emerald-600" /> 4-Digit Duress PIN Code
              </div>
              <p className="text-[11px] text-[#814a27]/80 leading-relaxed">
                If forced to cancel an alert under threat, enter this distress PIN to appear disarmed while secretly sending a high-priority silent distress dispatch to guardians & police.
              </p>

              <div>
                <label className="block text-[10px] font-extrabold uppercase text-[#814a27] mb-1">
                  Your Duress PIN
                </label>
                <input
                  type="text"
                  maxLength={4}
                  value={profileData.emergencyPin}
                  onChange={(e) =>
                    setProfileData({
                      ...profileData,
                      emergencyPin: e.target.value.replace(/\D/g, ""),
                    })
                  }
                  placeholder="4321"
                  className="w-32 tracking-[0.5em] text-center font-mono font-black text-lg bg-white border border-[#eee0ce] rounded-xl px-3 py-2 text-[#2d180c] focus:outline-none focus:ring-2 focus:ring-[#9e6133]"
                />
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-[#eee0ce]">
                <span className="text-xs font-bold text-[#2d180c]">Enable Stealth Duress Mode</span>
                <button
                  type="button"
                  onClick={() => toggleDispatchSetting("silentDuress")}
                  className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ${
                    dispatchSettings.silentDuress ? "bg-emerald-600" : "bg-[#eee0ce]"
                  }`}
                >
                  <span
                    className={`w-5 h-5 rounded-full bg-white shadow-md absolute top-0.5 transition-transform ${
                      dispatchSettings.silentDuress ? "left-6.5" : "left-0.5"
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Fake Call Shortcut Card */}
            <div className="p-5 bg-[#fdfbf7] rounded-2xl border border-[#eee0ce] space-y-4">
              <div className="flex items-center gap-2 text-xs font-black text-[#2d180c]">
                <PhoneCall className="w-4 h-4 text-[#9e6133]" /> Fake Call Escape Trigger
              </div>
              <p className="text-[11px] text-[#814a27]/80 leading-relaxed">
                Configure simulated realistic incoming ring to help you discreetly excuse yourself from dangerous or uncomfortable gatherings.
              </p>

              <div>
                <label className="block text-[10px] font-extrabold uppercase text-[#814a27] mb-1">
                  Simulated Caller Name
                </label>
                <input
                  type="text"
                  value={dispatchSettings.fakeCallerName || "Mom"}
                  onChange={(e) =>
                    handleSettingValueChange("fakeCallerName", e.target.value)
                  }
                  placeholder="e.g. Mom, Dad, Police Officer"
                  className="w-full bg-white border border-[#eee0ce] rounded-xl px-3 py-2 text-xs font-bold text-[#2d180c] focus:outline-none focus:ring-2 focus:ring-[#9e6133]"
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#2d180c]">Ring Trigger Delay</span>
                <select
                  value={dispatchSettings.fakeCallDelaySeconds || 5}
                  onChange={(e) =>
                    handleSettingValueChange(
                      "fakeCallDelaySeconds",
                      Number(e.target.value)
                    )
                  }
                  className="bg-white border border-[#eee0ce] rounded-xl px-3 py-1.5 text-xs font-bold text-[#2d180c] focus:outline-none focus:ring-2 focus:ring-[#9e6133] cursor-pointer"
                >
                  <option value={3}>3 Seconds</option>
                  <option value={5}>5 Seconds</option>
                  <option value={10}>10 Seconds</option>
                  <option value={30}>30 Seconds</option>
                </select>
              </div>

              {onOpenFakeCall && (
                <button
                  type="button"
                  onClick={onOpenFakeCall}
                  className="w-full bg-[#f7f0e6] hover:bg-[#eee0ce] text-[#2d180c] font-bold py-2 rounded-xl text-xs border border-[#eee0ce] flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  <PhoneCall className="w-3.5 h-3.5 text-[#9e6133]" /> Launch Fake Call Test
                </button>
              )}
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="button"
              onClick={handleSaveAll}
              disabled={isSaving}
              className="bg-[#9e6133] hover:bg-[#814a27] text-white font-extrabold px-6 py-3 rounded-2xl shadow-md flex items-center gap-2 text-xs uppercase tracking-wider cursor-pointer"
            >
              <Save className="w-4 h-4" /> {isSaving ? "Saving..." : "Save Stealth Settings"}
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 4: CHANGE PASSWORD                                    */}
      {/* ========================================================= */}
      {activeTab === "security" && (
        <form
          onSubmit={handlePasswordSubmit}
          className="bg-white rounded-3xl p-6 sm:p-8 border border-[#eee0ce] shadow-xs space-y-6"
        >
          <div className="border-b border-[#f7f0e6] pb-4">
            <h2 className="text-lg font-extrabold text-[#2d180c] flex items-center gap-2">
              <Lock className="w-5 h-5 text-[#9e6133]" /> Account Password & Security
            </h2>
            <p className="text-xs text-[#814a27]/80">
              Update your account password to maintain security.
            </p>
          </div>

          <div className="space-y-4 max-w-md">
            {/* Current Password */}
            <div>
              <label className="block text-xs font-extrabold text-[#2d180c] uppercase tracking-wider mb-1">
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? "text" : "password"}
                  required
                  value={passwordForm.currentPassword}
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
                  }
                  placeholder="••••••••"
                  className="w-full bg-[#fdfbf7] border border-[#eee0ce] rounded-xl pl-4 pr-10 py-2.5 text-xs font-bold text-[#2d180c] focus:outline-none focus:ring-2 focus:ring-[#9e6133]"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#814a27]/60 hover:text-[#814a27]"
                >
                  {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="block text-xs font-extrabold text-[#2d180c] uppercase tracking-wider mb-1">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  required
                  minLength={6}
                  value={passwordForm.newPassword}
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                  }
                  placeholder="At least 6 characters"
                  className="w-full bg-[#fdfbf7] border border-[#eee0ce] rounded-xl pl-4 pr-10 py-2.5 text-xs font-bold text-[#2d180c] focus:outline-none focus:ring-2 focus:ring-[#9e6133]"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#814a27]/60 hover:text-[#814a27]"
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm New Password */}
            <div>
              <label className="block text-xs font-extrabold text-[#2d180c] uppercase tracking-wider mb-1">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  minLength={6}
                  value={passwordForm.confirmPassword}
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
                  }
                  placeholder="Re-type new password"
                  className="w-full bg-[#fdfbf7] border border-[#eee0ce] rounded-xl pl-4 pr-10 py-2.5 text-xs font-bold text-[#2d180c] focus:outline-none focus:ring-2 focus:ring-[#9e6133]"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#814a27]/60 hover:text-[#814a27]"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          <div className="pt-2 flex justify-start">
            <button
              type="submit"
              disabled={isSaving}
              className="bg-[#9e6133] hover:bg-[#814a27] text-white font-extrabold px-6 py-3 rounded-2xl shadow-md flex items-center gap-2 text-xs uppercase tracking-wider cursor-pointer"
            >
              <KeyRound className="w-4 h-4" /> {isSaving ? "Updating..." : "Update Password"}
            </button>
          </div>
        </form>
      )}

      {/* ========================================================= */}
      {/* TAB 5: NOTIFICATIONS & DEVICE PREFERENCES                 */}
      {/* ========================================================= */}
      {activeTab === "notifications" && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#eee0ce] shadow-xs space-y-6">
          <div className="border-b border-[#f7f0e6] pb-4">
            <h2 className="text-lg font-extrabold text-[#2d180c] flex items-center gap-2">
              <Bell className="w-5 h-5 text-[#9e6133]" /> Notifications & App Preferences
            </h2>
            <p className="text-xs text-[#814a27]/80">
              Manage automatic check-in prompts, low battery alerts, and visual contrast modes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Guardian Check-In Reminder */}
            <div className="p-4 rounded-2xl border border-[#eee0ce] bg-[#fdfbf7] flex items-center justify-between gap-3">
              <div>
                <div className="text-xs font-bold text-[#2d180c] flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" /> Guardian Check-In Reminder
                </div>
                <div className="text-[11px] text-[#814a27]/70 mt-0.5">
                  Receive periodic prompts to update guardians when traveling late.
                </div>
              </div>
              <button
                type="button"
                onClick={() => toggleDispatchSetting("guardianCheckInReminder")}
                className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ${
                  dispatchSettings.guardianCheckInReminder !== false ? "bg-emerald-600" : "bg-[#eee0ce]"
                }`}
              >
                <span
                  className={`w-5 h-5 rounded-full bg-white shadow-md absolute top-0.5 transition-transform ${
                    dispatchSettings.guardianCheckInReminder !== false ? "left-6.5" : "left-0.5"
                  }`}
                />
              </button>
            </div>

            {/* Low Battery Alert */}
            <div className="p-4 rounded-2xl border border-[#eee0ce] bg-[#fdfbf7] flex items-center justify-between gap-3">
              <div>
                <div className="text-xs font-bold text-[#2d180c] flex items-center gap-1.5">
                  <BatteryCharging className="w-4 h-4 text-amber-600" /> Low Battery Guardian Broadcast
                </div>
                <div className="text-[11px] text-[#814a27]/70 mt-0.5">
                  Alert guardians when your device battery drops below 15% during transit.
                </div>
              </div>
              <button
                type="button"
                onClick={() => toggleDispatchSetting("lowBatteryDistressAlert")}
                className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ${
                  dispatchSettings.lowBatteryDistressAlert ? "bg-amber-600" : "bg-[#eee0ce]"
                }`}
              >
                <span
                  className={`w-5 h-5 rounded-full bg-white shadow-md absolute top-0.5 transition-transform ${
                    dispatchSettings.lowBatteryDistressAlert ? "left-6.5" : "left-0.5"
                  }`}
                />
              </button>
            </div>

            {/* High Contrast Night Theme */}
            <div className="p-4 rounded-2xl border border-[#eee0ce] bg-[#fdfbf7] flex items-center justify-between gap-3">
              <div>
                <div className="text-xs font-bold text-[#2d180c] flex items-center gap-1.5">
                  <Moon className="w-4 h-4 text-[#4a2b18]" /> High-Contrast Night Safety Mode
                </div>
                <div className="text-[11px] text-[#814a27]/70 mt-0.5">
                  Dim display glares for late-night commuting and low-light walking.
                </div>
              </div>
              <button
                type="button"
                onClick={() => toggleDispatchSetting("nightMode")}
                className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ${
                  dispatchSettings.nightMode ? "bg-[#2d180c]" : "bg-[#eee0ce]"
                }`}
              >
                <span
                  className={`w-5 h-5 rounded-full bg-white shadow-md absolute top-0.5 transition-transform ${
                    dispatchSettings.nightMode ? "left-6.5" : "left-0.5"
                  }`}
                />
              </button>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="button"
              onClick={handleSaveAll}
              disabled={isSaving}
              className="bg-[#9e6133] hover:bg-[#814a27] text-white font-extrabold px-6 py-3 rounded-2xl shadow-md flex items-center gap-2 text-xs uppercase tracking-wider cursor-pointer"
            >
              <Save className="w-4 h-4" /> {isSaving ? "Saving..." : "Save Preferences"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
