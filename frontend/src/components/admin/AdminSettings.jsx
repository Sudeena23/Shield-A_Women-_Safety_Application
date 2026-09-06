import React, { useState, useEffect, useRef } from "react";
import {
  Settings,
  Shield,
  Radio,
  Bell,
  Lock,
  Sliders,
  Database,
  FileText,
  Save,
  CheckCircle2,
  AlertTriangle,
  Volume2,
  VolumeX,
  RefreshCw,
  Send,
  Trash2,
  Download,
  KeyRound,
  ShieldAlert,
  Clock,
  MapPin,
  Activity,
  Check,
  Server,
  Sparkles,
} from "lucide-react";
import { adminService } from "../../services/adminService";

export const AdminSettings = ({ currentUser }) => {
  // Navigation sub-tabs
  const [activeSubTab, setActiveSubTab] = useState("dispatch");
  const [loading, setLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [settings, setSettings] = useState({
    emergencyAutoDispatch: true,
    sosCooldownSeconds: 120,
    gpsTrackingInterval: 5,
    emergencyRadiusKm: 10,
    audioRecordDurationSeconds: 30,
    requireAdmin2FA: false,
    sessionTimeoutMinutes: 60,
    allowPublicRegistration: true,
    maintenanceMode: false,
    maintenanceNotice:
      "Shield system is currently undergoing scheduled safety maintenance. Emergency hotlines remain active.",
  });
  const [broadcasts, setBroadcasts] = useState([]);
  const [newBroadcast, setNewBroadcast] = useState({
    title: "",
    message: "",
    category: "Security Advisory",
    priority: "High",
  });
  const [broadcastSending, setBroadcastSending] = useState(false);
  const [broadcastSuccess, setBroadcastSuccess] = useState(false);
  const [logs, setLogs] = useState([]);
  const [logFilter, setLogFilter] = useState("all");
  const [logSearch, setLogSearch] = useState("");
  const [passData, setPassData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passMsg, setPassMsg] = useState({ type: "", text: "" });
  const [stats, setStats] = useState(null);
  const [isPlayingSiren, setIsPlayingSiren] = useState(false);
  const [sirenVolume, setSirenVolume] = useState(0.5);

  const audioCtxRef = useRef(null);
  const sirenOscRef = useRef(null);
  const sirenGainRef = useRef(null);
  const sirenIntervalRef = useRef(null);

  // ----------------------------------------------------
  // LOAD DATA ON MOUNT
  // ----------------------------------------------------
  useEffect(() => {
    const initData = async () => {
      setLoading(true);
      try {
        const [loadedSettings, loadedBroadcasts, loadedLogs, loadedStats] =
          await Promise.all([
            adminService.getSettings(),
            adminService.getBroadcasts(),
            adminService.getLogs(),
            adminService.getStats(),
          ]);

        if (loadedSettings) setSettings((prev) => ({ ...prev, ...loadedSettings }));
        if (loadedBroadcasts) setBroadcasts(loadedBroadcasts);
        if (loadedLogs) setLogs(loadedLogs);
        if (loadedStats) setStats(loadedStats);
      } catch (err) {
        console.warn("Using local settings state:", err.message);
      } finally {
        setLoading(false);
      }
    };

    initData();
  }, []);

  // ----------------------------------------------------
  // SAVE SETTINGS HANDLER
  // ----------------------------------------------------
  const handleSaveSettings = async () => {
    setLoading(true);
    setSaveSuccess(false);
    setErrorMsg("");

    try {
      await adminService.updateSettings(settings);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3500);
    } catch (err) {
      setErrorMsg(err.message || "Failed to save settings.");
    } finally {
      setLoading(false);
    }
  };

  // ----------------------------------------------------
  // BROADCAST DISPATCH HANDLER
  // ----------------------------------------------------
  const handleSendBroadcast = async (e) => {
    e.preventDefault();
    if (!newBroadcast.title.trim() || !newBroadcast.message.trim()) return;

    setBroadcastSending(true);
    try {
      const res = await adminService.sendBroadcast(newBroadcast);
      setBroadcasts([res.broadcast, ...broadcasts]);
      setNewBroadcast({
        title: "",
        message: "",
        category: "Security Advisory",
        priority: "High",
      });
      setBroadcastSuccess(true);
      setTimeout(() => setBroadcastSuccess(false), 3500);
    } catch (err) {
      setErrorMsg("Failed to dispatch broadcast: " + err.message);
    } finally {
      setBroadcastSending(false);
    }
  };

  // ----------------------------------------------------
  // DELETE BROADCAST HANDLER
  // ----------------------------------------------------
  const handleDeleteBroadcast = async (id) => {
    if (!window.confirm("Are you sure you want to retract this broadcast?")) return;
    try {
      await adminService.deleteBroadcast(id);
      setBroadcasts(broadcasts.filter((b) => b.id !== id && b._id !== id));
    } catch (err) {
      setErrorMsg("Failed to delete broadcast: " + err.message);
    }
  };

  // ----------------------------------------------------
  // PASSWORD CHANGE HANDLER
  // ----------------------------------------------------
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPassMsg({ type: "", text: "" });

    if (!passData.currentPassword || !passData.newPassword) {
      setPassMsg({
        type: "error",
        text: "Please fill in all password fields.",
      });
      return;
    }

    if (passData.newPassword.length < 6) {
      setPassMsg({
        type: "error",
        text: "New password must be at least 6 characters.",
      });
      return;
    }

    if (passData.newPassword !== passData.confirmPassword) {
      setPassMsg({
        type: "error",
        text: "New password and confirmation do not match.",
      });
      return;
    }

    try {
      await adminService.changePassword(
        passData.currentPassword,
        passData.newPassword
      );
      setPassMsg({
        type: "success",
        text: "✓ Admin password changed successfully!",
      });
      setPassData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setTimeout(() => setPassMsg({ type: "", text: "" }), 4000);
    } catch (err) {
      setPassMsg({
        type: "error",
        text: err.message || "Failed to change password.",
      });
    }
  };

  // ----------------------------------------------------
  // WEB AUDIO SIREN SYNTHESIZER
  // ----------------------------------------------------
  const startSiren = () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(700, ctx.currentTime);

      gain.gain.setValueAtTime(sirenVolume, ctx.currentTime);
      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();

      let high = false;
      const interval = setInterval(() => {
        if (!osc || !ctx) return;
        const targetFreq = high ? 700 : 1200;
        osc.frequency.linearRampToValueAtTime(targetFreq, ctx.currentTime + 0.35);
        high = !high;
      }, 400);

      sirenOscRef.current = osc;
      sirenGainRef.current = gain;
      sirenIntervalRef.current = interval;
      setIsPlayingSiren(true);
    } catch (err) {
      console.error("Audio error:", err);
    }
  };

  const stopSiren = () => {
    if (sirenIntervalRef.current) clearInterval(sirenIntervalRef.current);
    if (sirenOscRef.current) {
      try {
        sirenOscRef.current.stop();
        sirenOscRef.current.disconnect();
      } catch (e) {}
    }
    if (audioCtxRef.current) {
      try {
        audioCtxRef.current.close();
      } catch (e) {}
    }
    setIsPlayingSiren(false);
  };

  const handleVolumeChange = (newVol) => {
    setSirenVolume(newVol);
    if (sirenGainRef.current && audioCtxRef.current) {
      sirenGainRef.current.gain.setValueAtTime(
        newVol,
        audioCtxRef.current.currentTime
      );
    }
  };

  // ----------------------------------------------------
  // EXPORT SYSTEM DATA (JSON & CSV)
  // ----------------------------------------------------
  const handleExportData = async (format) => {
    try {
      const data = await adminService.exportData(format);
      if (!data) return;

      const blob = new Blob(
        [format === "json" ? JSON.stringify(data, null, 2) : data],
        { type: format === "json" ? "application/json" : "text/csv" }
      );
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `shield_backup_${Date.now()}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      setErrorMsg("Failed to export backup: " + err.message);
    }
  };

  // ----------------------------------------------------
  // FILTERED AUDIT LOGS
  // ----------------------------------------------------
  const filteredLogs = logs.filter((log) => {
    const matchesCategory =
      logFilter === "all" || log.category === logFilter;
    const matchesSearch =
      !logSearch ||
      log.action.toLowerCase().includes(logSearch.toLowerCase()) ||
      log.details.toLowerCase().includes(logSearch.toLowerCase()) ||
      (log.actor && log.actor.toLowerCase().includes(logSearch.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-200">
      
      {/* Top Banner Header */}
      <div className="bg-white border border-[#eee0ce] rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-[11px] font-black text-emerald-700 uppercase tracking-wider bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              System Control & Security
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-[#2d180c] mt-2 tracking-tight">
            Admin System Settings
          </h2>
          <p className="text-xs text-[#814a27]/80 mt-1">
            Configure emergency dispatch intervals, broadcast advisories, security policies, and data backups.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSaveSettings}
            disabled={loading}
            className="bg-[#9e6133] hover:bg-[#814a27] text-white font-extrabold px-6 py-3 rounded-2xl text-xs uppercase tracking-wider transition-all shadow-md shadow-[#9e6133]/25 flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : saveSuccess ? (
              <Check className="w-4 h-4 text-emerald-300" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {saveSuccess ? "Saved Successfully!" : "Save Changes"}
          </button>
        </div>
      </div>

      {/* SUCCESS / ERROR ALERTS */}
      {saveSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 px-5 py-3.5 rounded-2xl flex items-center gap-3 text-xs font-bold shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>✓ Settings saved successfully and synchronized across the platform!</span>
        </div>
      )}

      {errorMsg && (
        <div className="bg-red-50 border border-red-200 text-red-900 px-5 py-3.5 rounded-2xl flex items-center gap-3 text-xs font-bold shadow-xs">
          <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* ====================================================
          SUB-NAVIGATION TABS
      ==================================================== */}
      <div className="flex flex-wrap gap-2 border-b border-[#eee0ce] pb-3">
        {[
          { id: "dispatch", label: "SOS & Dispatch Config", icon: Sliders },
          { id: "broadcast", label: "Emergency Broadcasts", icon: Radio },
          { id: "security", label: "Security & Passwords", icon: Lock },
          { id: "logs", label: "Audit Logs", icon: FileText },
          { id: "diagnostics", label: "Diagnostics & Tools", icon: Activity },
        ].map((tab) => {
          const Icon = tab.icon;
          const active = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-extrabold transition-all cursor-pointer border ${
                active
                  ? "bg-[#9e6133] text-white border-[#9e6133] shadow-md shadow-[#9e6133]/25"
                  : "bg-white text-[#814a27] hover:bg-[#f7f0e6] hover:text-[#2d180c] border-[#eee0ce]"
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ====================================================
          TAB 1: SOS & DISPATCH CONFIGURATION
      ==================================================== */}
      {activeSubTab === "dispatch" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Auto Dispatch & Cooldown */}
            <div className="bg-white border border-[#eee0ce] rounded-3xl p-6 space-y-5 shadow-sm">
              <div>
                <h3 className="text-base font-black text-[#2d180c] flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-[#9e6133]" />
                  Emergency Trigger & Dispatch Rules
                </h3>
                <p className="text-xs text-[#814a27]/80 mt-1">
                  Controls what happens automatically when a user clicks the primary SOS trigger button.
                </p>
              </div>

              <div className="space-y-4">
                {/* Auto Dispatch Toggle */}
                <div className="flex items-center justify-between p-4 rounded-2xl bg-[#fdfbf7] border border-[#eee0ce]">
                  <div>
                    <p className="text-xs font-extrabold text-[#2d180c]">
                      Automated Emergency Dispatch
                    </p>
                    <p className="text-[11px] text-[#814a27]/80 mt-0.5">
                      Automatically alert primary emergency units upon SOS trigger
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.emergencyAutoDispatch}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          emergencyAutoDispatch: e.target.checked,
                        })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-[#eee0ce] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#9e6133]"></div>
                  </label>
                </div>

                {/* Cooldown Timer */}
                <div className="p-4 rounded-2xl bg-[#fdfbf7] border border-[#eee0ce] space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-extrabold text-[#2d180c] flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-[#9e6133]" />
                      SOS Cooldown Interval
                    </label>
                    <span className="text-xs font-mono font-black text-[#9e6133]">
                      {settings.sosCooldownSeconds} seconds
                    </span>
                  </div>
                  <p className="text-[11px] text-[#814a27]/80">
                    Prevents a user in panic from accidentally spamming duplicate SOS dispatch entries.
                  </p>
                  <select
                    value={settings.sosCooldownSeconds}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        sosCooldownSeconds: Number(e.target.value),
                      })
                    }
                    className="w-full bg-white border border-[#eee0ce] rounded-xl px-3 py-2.5 text-xs font-bold text-[#2d180c] focus:outline-none focus:ring-2 focus:ring-[#9e6133] cursor-pointer"
                  >
                    <option value={30}>30 Seconds (Fast Retrigger)</option>
                    <option value={60}>60 Seconds (1 Minute)</option>
                    <option value={120}>120 Seconds (2 Minutes - Recommended)</option>
                    <option value={300}>300 Seconds (5 Minutes)</option>
                  </select>
                </div>

                {/* GPS Streaming Rate */}
                <div className="p-4 rounded-2xl bg-[#fdfbf7] border border-[#eee0ce] space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-extrabold text-[#2d180c] flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-red-600" />
                      Live GPS Stream Frequency
                    </label>
                    <span className="text-xs font-mono font-black text-[#9e6133]">
                      Every {settings.gpsTrackingInterval}s
                    </span>
                  </div>
                  <select
                    value={settings.gpsTrackingInterval}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        gpsTrackingInterval: Number(e.target.value),
                      })
                    }
                    className="w-full bg-white border border-[#eee0ce] rounded-xl px-3 py-2.5 text-xs font-bold text-[#2d180c] focus:outline-none focus:ring-2 focus:ring-[#9e6133] cursor-pointer"
                  >
                    <option value={3}>Every 3 Seconds (Ultra-Fast Tactical Radar)</option>
                    <option value={5}>Every 5 Seconds (Recommended Standard)</option>
                    <option value={10}>Every 10 Seconds (Battery Saver)</option>
                    <option value={30}>Every 30 Seconds (Low Power)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Safety Radius & System Maintenance */}
            <div className="bg-white border border-[#eee0ce] rounded-3xl p-6 space-y-5 shadow-sm">
              <div>
                <h3 className="text-base font-black text-[#2d180c] flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-rose-600" />
                  Safety Zones & Maintenance
                </h3>
                <p className="text-xs text-[#814a27]/80 mt-1">
                  Configure perimeter radius and system accessibility policies.
                </p>
              </div>

              <div className="space-y-4">
                {/* Emergency Radius Slider */}
                <div className="p-4 rounded-2xl bg-[#fdfbf7] border border-[#eee0ce] space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-extrabold text-[#2d180c]">
                      Emergency Response Radius
                    </label>
                    <span className="text-xs font-mono font-black text-[#9e6133]">
                      {settings.emergencyRadiusKm} km
                    </span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={50}
                    value={settings.emergencyRadiusKm}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        emergencyRadiusKm: Number(e.target.value),
                      })
                    }
                    className="w-full accent-[#9e6133] cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] font-bold text-[#814a27]/60">
                    <span>1 km</span>
                    <span>25 km</span>
                    <span>50 km</span>
                  </div>
                </div>

                {/* Maintenance Mode Toggle */}
                <div className="flex items-center justify-between p-4 rounded-2xl bg-[#fdfbf7] border border-[#eee0ce]">
                  <div>
                    <p className="text-xs font-extrabold text-[#2d180c]">
                      System Maintenance Mode
                    </p>
                    <p className="text-[11px] text-[#814a27]/80 mt-0.5">
                      Temporarily display safety notice to regular visitors
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.maintenanceMode}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          maintenanceMode: e.target.checked,
                        })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-[#eee0ce] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#9e6133]"></div>
                  </label>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ====================================================
          TAB 2: EMERGENCY BROADCAST CENTER
      ==================================================== */}
      {activeSubTab === "broadcast" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Create Broadcast Form */}
            <div className="lg:col-span-1 bg-white border border-[#eee0ce] rounded-3xl p-6 space-y-4 shadow-sm">
              <div>
                <h3 className="text-base font-black text-[#2d180c] flex items-center gap-2">
                  <Radio className="w-4 h-4 text-red-600 animate-pulse" />
                  Dispatch New Advisory
                </h3>
                <p className="text-xs text-[#814a27]/80 mt-1">
                  Send real-time alerts instantly to all connected users and devices via WebSockets.
                </p>
              </div>

              {broadcastSuccess && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 p-3 rounded-2xl text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Broadcast transmitted to all active sessions!</span>
                </div>
              )}

              <form onSubmit={handleSendBroadcast} className="space-y-3.5 text-xs">
                <div>
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#2d180c] mb-1">
                    Advisory Headline *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Kathmandu Valley Flash Flood Alert"
                    value={newBroadcast.title}
                    onChange={(e) =>
                      setNewBroadcast({ ...newBroadcast, title: e.target.value })
                    }
                    className="w-full bg-[#fdfbf7] border border-[#eee0ce] rounded-xl px-3 py-2.5 text-xs font-bold text-[#2d180c] focus:outline-none focus:ring-2 focus:ring-[#9e6133]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#2d180c] mb-1">
                    Category
                  </label>
                  <select
                    value={newBroadcast.category}
                    onChange={(e) =>
                      setNewBroadcast({
                        ...newBroadcast,
                        category: e.target.value,
                      })
                    }
                    className="w-full bg-[#fdfbf7] border border-[#eee0ce] rounded-xl px-3 py-2.5 text-xs font-bold text-[#2d180c] focus:outline-none cursor-pointer"
                  >
                    <option value="Security Advisory">🚨 Security Advisory</option>
                    <option value="Severe Weather">⛈️ Severe Weather</option>
                    <option value="Civic Unrest">⚠️ Civic Unrest / Curfew</option>
                    <option value="Health Alert">🏥 Health Emergency</option>
                    <option value="System Notice">ℹ️ System Maintenance</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#2d180c] mb-1">
                    Alert Urgency Priority
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {["Normal", "High", "Critical"].map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() =>
                          setNewBroadcast({ ...newBroadcast, priority: p })
                        }
                        className={`py-2 rounded-xl text-xs font-extrabold uppercase tracking-wider border transition-all cursor-pointer ${
                          newBroadcast.priority === p
                            ? p === "Critical"
                              ? "bg-red-600 text-white border-red-600 shadow-xs"
                              : "bg-[#9e6133] text-white border-[#9e6133] shadow-xs"
                            : "bg-[#fdfbf7] text-[#814a27] border-[#eee0ce] hover:bg-[#f7f0e6]"
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#2d180c] mb-1">
                    Broadcast Message Details *
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Enter actionable safety guidance..."
                    value={newBroadcast.message}
                    onChange={(e) =>
                      setNewBroadcast({
                        ...newBroadcast,
                        message: e.target.value,
                      })
                    }
                    className="w-full bg-[#fdfbf7] border border-[#eee0ce] rounded-xl p-3 text-xs font-bold text-[#2d180c] focus:outline-none focus:ring-2 focus:ring-[#9e6133]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={broadcastSending}
                  className="w-full bg-[#9e6133] hover:bg-[#814a27] text-white font-extrabold py-3 rounded-2xl text-xs uppercase tracking-wider transition-all shadow-md shadow-[#9e6133]/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {broadcastSending ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  <span>{broadcastSending ? "Dispatching..." : "Transmit Broadcast"}</span>
                </button>
              </form>
            </div>

            {/* Broadcast History Table */}
            <div className="lg:col-span-2 bg-white border border-[#eee0ce] rounded-3xl p-6 space-y-4 shadow-sm">
              <div className="flex justify-between items-center border-b border-[#eee0ce] pb-3">
                <h3 className="text-base font-black text-[#2d180c] flex items-center gap-2">
                  <Bell className="w-4 h-4 text-[#9e6133]" />
                  Active & Past Broadcast History ({broadcasts.length})
                </h3>
              </div>

              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                {broadcasts.map((b) => (
                  <div
                    key={b.id || b._id}
                    className="bg-[#fdfbf7] border border-[#eee0ce] rounded-2xl p-4.5 space-y-2 hover:border-[#cb9d75] transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full border ${
                              b.priority === "Critical"
                                ? "bg-red-50 text-red-700 border-red-200 animate-pulse"
                                : b.priority === "High"
                                ? "bg-amber-50 text-amber-700 border-amber-200"
                                : "bg-blue-50 text-blue-700 border-blue-200"
                            }`}
                          >
                            {b.priority}
                          </span>
                          <span className="text-[10px] font-extrabold text-[#814a27]/70 uppercase">
                            {b.category}
                          </span>
                        </div>
                        <h4 className="text-sm font-black text-[#2d180c] mt-1">{b.title}</h4>
                      </div>

                      <button
                        onClick={() => handleDeleteBroadcast(b.id || b._id)}
                        className="text-stone-400 hover:text-red-600 p-1.5 rounded-xl hover:bg-red-50 transition-colors cursor-pointer"
                        title="Retract Broadcast"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <p className="text-xs text-[#814a27]/90 leading-relaxed font-medium">
                      {b.message}
                    </p>

                    <div className="flex justify-between items-center text-[10px] text-[#814a27]/60 font-mono pt-1 border-t border-[#eee0ce]">
                      <span>Sent by: {b.sentBy || "Central Command"}</span>
                      <span>{new Date(b.createdAt || Date.now()).toLocaleString()}</span>
                    </div>
                  </div>
                ))}

                {broadcasts.length === 0 && (
                  <div className="text-center py-12 text-[#814a27]/60 text-xs font-medium">
                    No emergency broadcasts recorded yet.
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ====================================================
          TAB 3: SECURITY & PASSWORDS
      ==================================================== */}
      {activeSubTab === "security" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Change Admin Password */}
          <div className="bg-white border border-[#eee0ce] rounded-3xl p-6 space-y-4 shadow-sm">
            <div>
              <h3 className="text-base font-black text-[#2d180c] flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-[#9e6133]" />
                Change Administrator Password
              </h3>
              <p className="text-xs text-[#814a27]/80 mt-1">
                Update master login password for administrator access.
              </p>
            </div>

            {passMsg.text && (
              <div
                className={`p-3.5 rounded-2xl text-xs font-bold flex items-center gap-2 ${
                  passMsg.type === "success"
                    ? "bg-emerald-50 text-emerald-900 border border-emerald-200"
                    : "bg-red-50 text-red-900 border border-red-200"
                }`}
              >
                {passMsg.type === "success" ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                )}
                <span>{passMsg.text}</span>
              </div>
            )}

            <form onSubmit={handlePasswordChange} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#2d180c] mb-1">
                  Current Admin Password *
                </label>
                <input
                  type="password"
                  required
                  value={passData.currentPassword}
                  onChange={(e) =>
                    setPassData({ ...passData, currentPassword: e.target.value })
                  }
                  placeholder="••••••••••••"
                  className="w-full bg-[#fdfbf7] border border-[#eee0ce] rounded-xl px-3 py-2.5 text-xs font-bold text-[#2d180c] focus:outline-none focus:ring-2 focus:ring-[#9e6133]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#2d180c] mb-1">
                  New Password *
                </label>
                <input
                  type="password"
                  required
                  value={passData.newPassword}
                  onChange={(e) =>
                    setPassData({ ...passData, newPassword: e.target.value })
                  }
                  placeholder="At least 6 characters"
                  className="w-full bg-[#fdfbf7] border border-[#eee0ce] rounded-xl px-3 py-2.5 text-xs font-bold text-[#2d180c] focus:outline-none focus:ring-2 focus:ring-[#9e6133]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#2d180c] mb-1">
                  Confirm New Password *
                </label>
                <input
                  type="password"
                  required
                  value={passData.confirmPassword}
                  onChange={(e) =>
                    setPassData({ ...passData, confirmPassword: e.target.value })
                  }
                  placeholder="Repeat new password"
                  className="w-full bg-[#fdfbf7] border border-[#eee0ce] rounded-xl px-3 py-2.5 text-xs font-bold text-[#2d180c] focus:outline-none focus:ring-2 focus:ring-[#9e6133]"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#9e6133] hover:bg-[#814a27] text-white font-extrabold py-3 rounded-2xl text-xs uppercase tracking-wider transition-all shadow-md shadow-[#9e6133]/25 cursor-pointer"
              >
                Update Admin Password
              </button>
            </form>
          </div>

          {/* Session Security Policies */}
          <div className="bg-white border border-[#eee0ce] rounded-3xl p-6 space-y-4 shadow-sm">
            <div>
              <h3 className="text-base font-black text-[#2d180c] flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-600" />
                Session Security Policies
              </h3>
              <p className="text-xs text-[#814a27]/80 mt-1">
                Configure auto-logout timeouts and access guards.
              </p>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-2xl bg-[#fdfbf7] border border-[#eee0ce] space-y-2">
                <div className="flex justify-between items-center">
                  <label className="font-extrabold text-[#2d180c]">
                    Session Auto-Timeout
                  </label>
                  <span className="font-mono font-black text-[#9e6133]">
                    {settings.sessionTimeoutMinutes} min
                  </span>
                </div>
                <select
                  value={settings.sessionTimeoutMinutes}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      sessionTimeoutMinutes: Number(e.target.value),
                    })
                  }
                  className="w-full bg-white border border-[#eee0ce] rounded-xl px-3 py-2.5 text-xs font-bold text-[#2d180c] focus:outline-none focus:ring-2 focus:ring-[#9e6133] cursor-pointer"
                >
                  <option value={15}>15 Minutes</option>
                  <option value={30}>30 Minutes</option>
                  <option value={60}>60 Minutes (1 Hour - Default)</option>
                  <option value={240}>240 Minutes (4 Hours)</option>
                </select>
              </div>

              <div className="flex items-center justify-between p-4 rounded-2xl bg-[#fdfbf7] border border-[#eee0ce]">
                <div>
                  <p className="font-extrabold text-[#2d180c]">
                    Public User Registration
                  </p>
                  <p className="text-[11px] text-[#814a27]/80 mt-0.5">
                    Allow new citizens to create accounts from landing page
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.allowPublicRegistration}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        allowPublicRegistration: e.target.checked,
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-[#eee0ce] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#9e6133]"></div>
                </label>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* ====================================================
          TAB 4: AUDIT LOGS
      ==================================================== */}
      {activeSubTab === "logs" && (
        <div className="bg-white border border-[#eee0ce] rounded-3xl p-6 space-y-4 shadow-sm">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-[#eee0ce] pb-3">
            <div>
              <h3 className="text-base font-black text-[#2d180c] flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#9e6133]" />
                Security & Dispatch Audit Logs ({filteredLogs.length})
              </h3>
              <p className="text-xs text-[#814a27]/80 mt-0.5">
                Timestamped security events and administrator actions.
              </p>
            </div>

            <div className="flex gap-2 w-full sm:w-auto">
              <input
                type="text"
                value={logSearch}
                onChange={(e) => setLogSearch(e.target.value)}
                placeholder="Search audit logs..."
                className="bg-[#fdfbf7] border border-[#eee0ce] text-[#2d180c] px-3.5 py-2 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#9e6133] w-full sm:w-60"
              />
              <select
                value={logFilter}
                onChange={(e) => setLogFilter(e.target.value)}
                className="bg-[#fdfbf7] border border-[#eee0ce] text-[#2d180c] px-3 py-2 rounded-xl text-xs font-bold focus:outline-none cursor-pointer"
              >
                <option value="all">All Events</option>
                <option value="auth">Auth Events</option>
                <option value="dispatch">Dispatches</option>
                <option value="system">System Updates</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-[#fdfbf7] border-b border-[#eee0ce]">
                <tr>
                  <th className="px-4 py-3 text-left font-black text-[#814a27] uppercase text-[10px]">Action</th>
                  <th className="px-4 py-3 text-left font-black text-[#814a27] uppercase text-[10px]">Category</th>
                  <th className="px-4 py-3 text-left font-black text-[#814a27] uppercase text-[10px]">Details</th>
                  <th className="px-4 py-3 text-left font-black text-[#814a27] uppercase text-[10px]">Actor / IP</th>
                  <th className="px-4 py-3 text-left font-black text-[#814a27] uppercase text-[10px]">Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log, idx) => (
                  <tr
                    key={log.id || log._id || idx}
                    className="border-b border-[#f7f0e6] hover:bg-[#fdfbf7] transition-colors"
                  >
                    <td className="px-4 py-3 font-mono font-bold text-[#2d180c]">
                      {log.action}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-[#f7f0e6] text-[#814a27] border border-[#eee0ce]">
                        {log.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[#814a27]/90 max-w-xs truncate font-medium">
                      {log.details}
                    </td>
                    <td className="px-4 py-3 font-mono text-[#814a27]/70 text-[11px]">
                      {log.actor || "System"} ({log.ip || "127.0.0.1"})
                    </td>
                    <td className="px-4 py-3 font-mono text-[#814a27]/70 text-[11px]">
                      {new Date(log.createdAt || Date.now()).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredLogs.length === 0 && (
              <div className="text-center py-10 text-[#814a27]/60 text-xs font-medium">
                No matching audit logs found.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ====================================================
          TAB 5: DIAGNOSTICS, TOOLS & BACKUPS
      ==================================================== */}
      {activeSubTab === "diagnostics" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Web Audio Siren Tester */}
          <div className="bg-white border border-[#eee0ce] rounded-3xl p-6 space-y-4 shadow-sm">
            <div>
              <h3 className="text-base font-black text-[#2d180c] flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-[#9e6133]" />
                Emergency Siren Audio Synthesizer
              </h3>
              <p className="text-xs text-[#814a27]/80 mt-1">
                Synthesizes the dual-tone high-decibel safety alarm using the browser Web Audio API.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#fdfbf7] border border-[#eee0ce] space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-extrabold text-[#2d180c]">
                  Siren Volume Level
                </span>
                <span className="text-xs font-mono font-black text-[#9e6133]">
                  {Math.round(sirenVolume * 100)}%
                </span>
              </div>
              <input
                type="range"
                min={0.1}
                max={1.0}
                step={0.05}
                value={sirenVolume}
                onChange={(e) => handleVolumeChange(Number(e.target.value))}
                className="w-full accent-[#9e6133] cursor-pointer"
              />
            </div>

            <button
              onClick={isPlayingSiren ? stopSiren : startSiren}
              className={`w-full py-3.5 px-4 rounded-2xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md ${
                isPlayingSiren
                  ? "bg-red-600 hover:bg-red-700 text-white animate-pulse"
                  : "bg-[#9e6133] hover:bg-[#814a27] text-white shadow-[#9e6133]/25"
              }`}
            >
              {isPlayingSiren ? (
                <>
                  <VolumeX className="w-4 h-4" /> Stop Alarm Siren
                </>
              ) : (
                <>
                  <Volume2 className="w-4 h-4" /> Test Play Safety Siren
                </>
              )}
            </button>
          </div>

          {/* Backup & Data Export */}
          <div className="bg-white border border-[#eee0ce] rounded-3xl p-6 space-y-4 shadow-sm">
            <div>
              <h3 className="text-base font-black text-[#2d180c] flex items-center gap-2">
                <Database className="w-4 h-4 text-emerald-600" />
                Data Backups & Export
              </h3>
              <p className="text-xs text-[#814a27]/80 mt-1">
                Download a complete, offline archive of users, emergency dispatches, and audit logs.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => handleExportData("json")}
                className="bg-[#fdfbf7] hover:bg-[#f7f0e6] text-[#2d180c] border border-[#eee0ce] font-extrabold py-3.5 px-4 rounded-2xl text-xs flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
              >
                <Download className="w-4 h-4 text-[#9e6133]" />
                <span>Export JSON Archive</span>
              </button>

              <button
                onClick={() => handleExportData("csv")}
                className="bg-[#fdfbf7] hover:bg-[#f7f0e6] text-[#2d180c] border border-[#eee0ce] font-extrabold py-3.5 px-4 rounded-2xl text-xs flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
              >
                <Download className="w-4 h-4 text-emerald-600" />
                <span>Export CSV Report</span>
              </button>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
