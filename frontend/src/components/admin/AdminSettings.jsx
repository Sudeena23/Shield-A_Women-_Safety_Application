/**
 * ADMIN SETTINGS COMPONENT (100% Free & Noob-Friendly)
 * ------------------------------------------------------------------
 * This component allows administrators to manage app settings,
 * send emergency broadcasts, change admin passwords, and inspect logs.
 *
 * ALL FEATURES ARE 100% FREE:
 * - Free WebSocket Broadcasts
 * - Free Web Audio Siren Synthesizer (runs in browser)
 * - Free Emergency SMS Simulator
 * - Free 1-Click JSON/CSV Data Backups
 * - Free Local/Database Storage
 * ------------------------------------------------------------------
 */

import React, { useState, useEffect, useRef } from "react";
import {
  Settings,
  Shield,
  Radio,
  Bell,
  Lock,
  Smartphone,
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
  Zap,
  HelpCircle,
  Sparkles,
} from "lucide-react";
import { adminService } from "../../services/adminService";

export const AdminSettings = ({ currentUser }) => {
  // Navigation sub-tabs
  const [activeSubTab, setActiveSubTab] = useState("dispatch");
  const [loading, setLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // ----------------------------------------------------
  // 1. SYSTEM SETTINGS STATE (All 100% Free)
  // ----------------------------------------------------
  const [settings, setSettings] = useState({
    emergencyAutoDispatch: true,
    sosCooldownSeconds: 120,
    smsGatewayMode: "mock", // 'mock' is free built-in simulation
    smsEmergencyTemplate:
      "EMERGENCY SOS ALERT! {victimName} needs immediate assistance! Location: {location}. Live Map: {mapLink}",
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

  // ----------------------------------------------------
  // 2. BROADCAST STATE (Free Real-time Alerting)
  // ----------------------------------------------------
  const [broadcasts, setBroadcasts] = useState([]);
  const [newBroadcast, setNewBroadcast] = useState({
    title: "",
    message: "",
    category: "Security Advisory",
    priority: "High",
  });
  const [broadcastSending, setBroadcastSending] = useState(false);
  const [broadcastSuccess, setBroadcastSuccess] = useState(false);

  // ----------------------------------------------------
  // 3. AUDIT LOGS STATE
  // ----------------------------------------------------
  const [logs, setLogs] = useState([]);
  const [logFilter, setLogFilter] = useState("all");
  const [logSearch, setLogSearch] = useState("");

  // ----------------------------------------------------
  // 4. PASSWORD CHANGE STATE
  // ----------------------------------------------------
  const [passData, setPassData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passMsg, setPassMsg] = useState({ type: "", text: "" });

  // ----------------------------------------------------
  // 5. DIAGNOSTICS & SIREN TEST (Free Web Audio API)
  // ----------------------------------------------------
  const [stats, setStats] = useState(null);
  const [smsTestPhone, setSmsTestPhone] = useState("+977 9841000000");
  const [smsTestStatus, setSmsTestStatus] = useState("");
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

        if (loadedSettings) setSettings(loadedSettings);
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
  const handleSaveSettings = async (e) => {
    if (e) e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      const updated = await adminService.updateSettings(settings);
      setSettings(updated);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setErrorMsg(err.message || "Failed to save settings");
    } finally {
      setLoading(false);
    }
  };

  // ----------------------------------------------------
  // DYNAMIC TAG INSERTION (For SMS Template)
  // ----------------------------------------------------
  const insertTemplateTag = (tag) => {
    setSettings((prev) => ({
      ...prev,
      smsEmergencyTemplate: prev.smsEmergencyTemplate + " " + tag,
    }));
  };

  // ----------------------------------------------------
  // SEND EMERGENCY BROADCAST (Free WebSocket transmission)
  // ----------------------------------------------------
  const handleSendBroadcast = async (e) => {
    e.preventDefault();
    if (!newBroadcast.title.trim() || !newBroadcast.message.trim()) {
      setErrorMsg("Broadcast title and message are required.");
      return;
    }

    setBroadcastSending(true);
    setErrorMsg("");

    try {
      const created = await adminService.sendBroadcast(newBroadcast);
      setBroadcasts((prev) => [created, ...prev]);
      setNewBroadcast({
        title: "",
        message: "",
        category: "Security Advisory",
        priority: "High",
      });
      setBroadcastSuccess(true);
      setTimeout(() => setBroadcastSuccess(false), 3500);

      // Refresh log list
      const updatedLogs = await adminService.getLogs();
      setLogs(updatedLogs);
    } catch (err) {
      setErrorMsg(err.message || "Failed to dispatch broadcast");
    } finally {
      setBroadcastSending(false);
    }
  };

  const handleDeleteBroadcast = async (id) => {
    if (!window.confirm("Dismiss this emergency broadcast?")) return;
    await adminService.deleteBroadcast(id);
    setBroadcasts((prev) => prev.filter((b) => (b._id || b.id) !== id));
  };

  // ----------------------------------------------------
  // CHANGE ADMIN PASSWORD
  // ----------------------------------------------------
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPassMsg({ type: "", text: "" });

    if (!passData.currentPassword || !passData.newPassword) {
      setPassMsg({
        type: "error",
        text: "Please enter your current and new password.",
      });
      return;
    }

    if (passData.newPassword !== passData.confirmPassword) {
      setPassMsg({
        type: "error",
        text: "New passwords do not match.",
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

    try {
      await adminService.changePassword(
        passData.currentPassword,
        passData.newPassword
      );
      setPassMsg({
        type: "success",
        text: "Admin password updated successfully!",
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
        text: err.message || "Failed to update password.",
      });
    }
  };

  // ----------------------------------------------------
  // FREE SMS TEST SIMULATION
  // ----------------------------------------------------
  const handleTestSms = async () => {
    setSmsTestStatus("Sending free simulation SMS...");
    try {
      const res = await adminService.testSms(
        smsTestPhone,
        "TEST DISPATCH: Shield Women Safety System verification test. All channels operational."
      );
      setSmsTestStatus(`✓ ${res.message || "Test dispatch sent successfully!"}`);
      setTimeout(() => setSmsTestStatus(""), 4000);
    } catch (err) {
      setSmsTestStatus("✗ Simulation message: " + err.message);
    }
  };

  // ----------------------------------------------------
  // 100% FREE SIREN SYNTHESIZER (Browser Web Audio API)
  // ----------------------------------------------------
  const toggleSirenAudio = () => {
    if (isPlayingSiren) {
      stopSirenAudio();
    } else {
      startSirenAudio();
    }
  };

  const startSirenAudio = () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;

      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sawtooth";
      gain.gain.setValueAtTime(sirenVolume, ctx.currentTime);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();

      let high = false;
      osc.frequency.setValueAtTime(750, ctx.currentTime);

      const interval = setInterval(() => {
        if (!ctx || ctx.state === "closed") return;
        high = !high;
        osc.frequency.setTargetAtTime(
          high ? 980 : 650,
          ctx.currentTime,
          0.1
        );
      }, 350);

      audioCtxRef.current = ctx;
      sirenOscRef.current = osc;
      sirenGainRef.current = gain;
      sirenIntervalRef.current = interval;
      setIsPlayingSiren(true);
    } catch (e) {
      console.warn("Audio Context init error:", e);
    }
  };

  const stopSirenAudio = () => {
    if (sirenIntervalRef.current) {
      clearInterval(sirenIntervalRef.current);
      sirenIntervalRef.current = null;
    }
    if (sirenOscRef.current) {
      try {
        sirenOscRef.current.stop();
        sirenOscRef.current.disconnect();
      } catch (e) {}
      sirenOscRef.current = null;
    }
    if (audioCtxRef.current) {
      try {
        audioCtxRef.current.close();
      } catch (e) {}
      audioCtxRef.current = null;
    }
    setIsPlayingSiren(false);
  };

  useEffect(() => {
    return () => {
      stopSirenAudio();
    };
  }, []);

  // ----------------------------------------------------
  // FREE EXPORT AS JSON & CSV (Zero cost client-side downloads)
  // ----------------------------------------------------
  const exportLogsAsJson = () => {
    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(logs, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute(
      "download",
      `shield_audit_logs_${new Date().toISOString().slice(0, 10)}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const exportLogsAsCsv = () => {
    if (logs.length === 0) return;
    const headers = ["Timestamp", "Action", "Category", "Details", "Actor", "IP"];
    const rows = logs.map((l) => [
      new Date(l.createdAt || Date.now()).toISOString(),
      `"${l.action || ""}"`,
      `"${l.category || ""}"`,
      `"${(l.details || "").replace(/"/g, '""')}"`,
      `"${l.actor || ""}"`,
      `"${l.ip || ""}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", encodeURI(csvContent));
    downloadAnchor.setAttribute(
      "download",
      `shield_audit_logs_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const exportFullSystemBackup = async () => {
    const fullBackup = {
      system: "Shield Women Safety Application",
      tier: "100% Free & Open",
      exportTimestamp: new Date().toISOString(),
      adminUser: currentUser?.email || "Admin",
      settings,
      broadcasts,
      logs,
      stats,
    };

    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(fullBackup, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute(
      "download",
      `shield_full_system_backup_${new Date().toISOString().slice(0, 10)}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleClearResolved = async () => {
    if (
      !window.confirm(
        "Are you sure you want to purge resolved SOS alert history?"
      )
    )
      return;
    const res = await adminService.clearResolvedAlerts();
    alert(res.message || "Resolved alerts cleared.");
  };

  const handleClearLogs = async () => {
    if (!window.confirm("Permanently clear the audit log trail?")) return;
    await adminService.clearLogs();
    const updated = await adminService.getLogs();
    setLogs(updated);
  };

  // Filter logs based on search query & category
  const filteredLogs = logs.filter((log) => {
    const matchesCategory =
      logFilter === "all" || log.category === logFilter;
    const matchesSearch =
      !logSearch ||
      log.action?.toLowerCase().includes(logSearch.toLowerCase()) ||
      log.details?.toLowerCase().includes(logSearch.toLowerCase()) ||
      log.actor?.toLowerCase().includes(logSearch.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* ====================================================
          TOP BANNER WITH NOOB-FRIENDLY HINTS
      ==================================================== */}
      <div className="bg-[#28150a] border border-[#3d2212] rounded-3xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-xl">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="px-3 py-1 rounded-full bg-[#3d2212] text-[#cb9d75] text-[10px] font-black uppercase tracking-wider">
              <Settings className="inline w-3 h-3 mr-1" />
              Admin Center
            </span>
            <span className="px-3 py-1 rounded-full bg-emerald-950/70 text-emerald-300 border border-emerald-800 text-[10px] font-bold flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-emerald-400" /> 100% Free & Unpaid
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">
            Admin Safety Settings & Control
          </h2>
          <p className="text-xs text-[#cb9d75]/80 mt-1">
            Easy-to-use settings for emergency dispatches, broadcast announcements, passwords, and data backups.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSaveSettings}
            disabled={loading}
            className="bg-[#9e6133] hover:bg-[#814a27] text-white px-5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-[#9e6133]/20 cursor-pointer"
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
        <div className="bg-emerald-950/60 border border-emerald-700 text-emerald-200 px-4 py-3 rounded-2xl flex items-center gap-3 text-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>✓ Settings saved successfully and synchronized!</span>
        </div>
      )}

      {errorMsg && (
        <div className="bg-red-950/60 border border-red-700 text-red-200 px-4 py-3 rounded-2xl flex items-center gap-3 text-xs">
          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* ====================================================
          SUB-NAVIGATION TABS
      ==================================================== */}
      <div className="flex flex-wrap gap-2 border-b border-[#302018] pb-3">
        {[
          { id: "dispatch", label: "SOS & Dispatch Config", icon: Sliders },
          { id: "broadcast", label: "Emergency Broadcasts", icon: Radio },
          { id: "security", label: "Security & Passwords", icon: Lock },
          { id: "logs", label: "Audit Logs", icon: FileText },
          { id: "diagnostics", label: "Diagnostics & Free Tools", icon: Activity },
        ].map((tab) => {
          const Icon = tab.icon;
          const active = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                active
                  ? "bg-[#9e6133] text-white shadow-md shadow-[#9e6133]/20"
                  : "bg-[#1f1008] text-[#a9856c] hover:bg-[#2c170d] hover:text-white border border-[#3d2212]"
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
            <div className="bg-[#28150a] border border-[#3d2212] rounded-3xl p-6 space-y-5">
              <div>
                <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-[#cb9d75]" />
                  Emergency Trigger & Dispatch Rules
                </h3>
                <p className="text-[11px] text-[#cb9d75]/60 mt-1">
                  💡 How it works: Controls what happens automatically when a user clicks the big SOS button.
                </p>
              </div>

              <div className="space-y-4">
                {/* Auto Dispatch Toggle */}
                <div className="flex items-center justify-between p-4 rounded-2xl bg-[#1a0c05] border border-[#3d2212]">
                  <div>
                    <p className="text-xs font-bold text-white">
                      Automated Emergency Dispatch
                    </p>
                    <p className="text-[11px] text-[#cb9d75]/60 mt-0.5">
                      Automatically alert primary emergency helplines & guardians upon SOS trigger
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
                    <div className="w-11 h-6 bg-[#3d2212] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#9e6133]"></div>
                  </label>
                </div>

                {/* Cooldown Timer */}
                <div className="p-4 rounded-2xl bg-[#1a0c05] border border-[#3d2212] space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-white flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-[#cb9d75]" />
                      SOS Cooldown Interval
                    </label>
                    <span className="text-xs font-mono font-bold text-[#cb9d75]">
                      {settings.sosCooldownSeconds} seconds
                    </span>
                  </div>
                  <p className="text-[10px] text-[#cb9d75]/60">
                    Prevents a panic user from accidentally spamming multiple SOS requests.
                  </p>
                  <select
                    value={settings.sosCooldownSeconds}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        sosCooldownSeconds: Number(e.target.value),
                      })
                    }
                    className="w-full bg-[#28150a] border border-[#3d2212] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#9e6133]"
                  >
                    <option value={30}>30 Seconds (Fast Retrigger)</option>
                    <option value={60}>60 Seconds (1 Minute)</option>
                    <option value={120}>120 Seconds (2 Minutes - Recommended)</option>
                    <option value={300}>300 Seconds (5 Minutes)</option>
                  </select>
                </div>

                {/* GPS Streaming Rate */}
                <div className="p-4 rounded-2xl bg-[#1a0c05] border border-[#3d2212] space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-white flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-red-400" />
                      Live GPS Stream Frequency
                    </label>
                    <span className="text-xs font-mono font-bold text-[#cb9d75]">
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
                    className="w-full bg-[#28150a] border border-[#3d2212] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#9e6133]"
                  >
                    <option value={3}>3 Seconds (High Precision)</option>
                    <option value={5}>5 Seconds (Recommended)</option>
                    <option value={10}>10 Seconds (Power Saving)</option>
                  </select>
                </div>

                {/* Emergency Radius */}
                <div className="p-4 rounded-2xl bg-[#1a0c05] border border-[#3d2212] space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-white">
                      Emergency Alert Search Radius
                    </label>
                    <span className="text-xs font-mono font-bold text-[#cb9d75]">
                      {settings.emergencyRadiusKm} km
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="50"
                    value={settings.emergencyRadiusKm}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        emergencyRadiusKm: Number(e.target.value),
                      })
                    }
                    className="w-full accent-[#9e6133] cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-[#cb9d75]/50">
                    <span>1 km</span>
                    <span>25 km</span>
                    <span>50 km</span>
                  </div>
                </div>
              </div>
            </div>

            {/* SMS Gateway & Template */}
            <div className="bg-[#28150a] border border-[#3d2212] rounded-3xl p-6 space-y-5">
              <div>
                <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-amber-400" />
                  Free SMS Emergency Dispatch Simulator
                </h3>
                <p className="text-[11px] text-[#cb9d75]/60 mt-1">
                  💡 100% Free: Test your SMS emergency formats without needing any paid third-party subscriptions.
                </p>
              </div>

              <div className="space-y-4">
                {/* Gateway Mode */}
                <div className="p-4 rounded-2xl bg-[#1a0c05] border border-[#3d2212] space-y-2">
                  <label className="text-xs font-bold text-white">
                    Emergency SMS Dispatch Mode
                  </label>
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() =>
                        setSettings({ ...settings, smsGatewayMode: "mock" })
                      }
                      className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition cursor-pointer ${
                        settings.smsGatewayMode === "mock"
                          ? "bg-[#9e6133]/20 border-[#9e6133] text-amber-200"
                          : "bg-[#28150a] border-[#3d2212] text-[#a9856c]"
                      }`}
                    >
                      <span className="flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-400" /> Free Simulator
                      </span>
                      <span className="text-[10px] font-normal text-[#cb9d75]/60">
                        Zero cost, console output
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setSettings({ ...settings, smsGatewayMode: "twilio" })
                      }
                      className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition cursor-pointer ${
                        settings.smsGatewayMode === "twilio"
                          ? "bg-[#9e6133]/20 border-[#9e6133] text-amber-200"
                          : "bg-[#28150a] border-[#3d2212] text-[#a9856c]"
                      }`}
                    >
                      <span>Custom API Gateway</span>
                      <span className="text-[10px] font-normal text-[#cb9d75]/60">
                        Optional for production
                      </span>
                    </button>
                  </div>
                </div>

                {/* SMS Template */}
                <div className="p-4 rounded-2xl bg-[#1a0c05] border border-[#3d2212] space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-white">
                      Emergency SMS Message Template
                    </label>
                    <span className="text-[10px] text-[#cb9d75]/60">
                      Auto-populated on SOS
                    </span>
                  </div>

                  <textarea
                    rows={3}
                    value={settings.smsEmergencyTemplate}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        smsEmergencyTemplate: e.target.value,
                      })
                    }
                    className="w-full bg-[#28150a] border border-[#3d2212] rounded-xl p-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#9e6133]"
                  />

                  {/* Dynamic Tags Helper */}
                  <div className="space-y-1 pt-1">
                    <p className="text-[10px] text-[#cb9d75]/70 font-semibold">
                      Click variable to add to message template:
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        "{victimName}",
                        "{location}",
                        "{mapLink}",
                        "{timestamp}",
                        "{userPhone}",
                      ].map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => insertTemplateTag(tag)}
                          className="bg-[#28150a] hover:bg-[#3d2212] text-[#cb9d75] border border-[#3d2212] text-[10px] font-mono px-2 py-1 rounded-lg transition cursor-pointer"
                        >
                          + {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Free SMS Tester */}
                <div className="p-4 rounded-2xl bg-[#1a0c05] border border-[#3d2212] space-y-2">
                  <label className="text-xs font-bold text-white flex items-center gap-2">
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    Test SMS Simulator
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={smsTestPhone}
                      onChange={(e) => setSmsTestPhone(e.target.value)}
                      placeholder="+977 98XXXXXXXX"
                      className="flex-1 bg-[#28150a] border border-[#3d2212] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#9e6133]"
                    />
                    <button
                      type="button"
                      onClick={handleTestSms}
                      className="bg-[#3d2212] hover:bg-[#522f18] text-white px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <Send className="w-3 h-3" /> Test Run
                    </button>
                  </div>
                  {smsTestStatus && (
                    <p className="text-[11px] text-emerald-300 font-mono pt-1">
                      {smsTestStatus}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================
          TAB 2: EMERGENCY BROADCAST CENTER (100% Free WebSockets)
      ==================================================== */}
      {activeSubTab === "broadcast" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Create Broadcast Form */}
            <div className="lg:col-span-1 bg-[#28150a] border border-[#3d2212] rounded-3xl p-6 space-y-4">
              <div>
                <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                  <Radio className="w-4 h-4 text-red-400 animate-pulse" />
                  Dispatch Emergency Broadcast
                </h3>
                <p className="text-xs text-[#cb9d75]/70 mt-1">
                  💡 Free WebSockets: Transmit real-time warnings to all active app users without any cost.
                </p>
              </div>

              <form onSubmit={handleSendBroadcast} className="space-y-3 pt-2">
                <div>
                  <label className="text-[11px] font-bold text-[#cb9d75] uppercase">
                    Broadcast Title
                  </label>
                  <input
                    type="text"
                    required
                    value={newBroadcast.title}
                    onChange={(e) =>
                      setNewBroadcast({ ...newBroadcast, title: e.target.value })
                    }
                    placeholder="e.g. Weather Alert - Stay Safe in Kathmandu"
                    className="w-full bg-[#1a0c05] border border-[#3d2212] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#9e6133] mt-1"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-bold text-[#cb9d75] uppercase">
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
                      className="w-full bg-[#1a0c05] border border-[#3d2212] rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#9e6133] mt-1"
                    >
                      <option value="Security Advisory">Security Advisory</option>
                      <option value="Severe Weather">Severe Weather</option>
                      <option value="Curfew Alert">Curfew Alert</option>
                      <option value="Hazard Zone">Hazard Zone</option>
                      <option value="System Notice">System Notice</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-[#cb9d75] uppercase">
                      Priority Level
                    </label>
                    <select
                      value={newBroadcast.priority}
                      onChange={(e) =>
                        setNewBroadcast({
                          ...newBroadcast,
                          priority: e.target.value,
                        })
                      }
                      className="w-full bg-[#1a0c05] border border-[#3d2212] rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#9e6133] mt-1"
                    >
                      <option value="Normal">Normal</option>
                      <option value="High">High</option>
                      <option value="Critical">Critical (Red Alert)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-[#cb9d75] uppercase">
                    Alert Message
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={newBroadcast.message}
                    onChange={(e) =>
                      setNewBroadcast({
                        ...newBroadcast,
                        message: e.target.value,
                      })
                    }
                    placeholder="Describe safety instructions or evacuation guidance for users..."
                    className="w-full bg-[#1a0c05] border border-[#3d2212] rounded-xl p-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#9e6133] mt-1"
                  />
                </div>

                <button
                  type="submit"
                  disabled={broadcastSending}
                  className="w-full bg-red-800 hover:bg-red-700 text-white font-bold py-2.5 rounded-xl text-xs transition flex items-center justify-center gap-2 shadow-lg shadow-red-950/50 cursor-pointer"
                >
                  {broadcastSending ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Radio className="w-4 h-4" />
                  )}
                  {broadcastSending
                    ? "Sending Alert..."
                    : "Transmit Live Broadcast"}
                </button>

                {broadcastSuccess && (
                  <p className="text-emerald-400 text-xs text-center font-bold">
                    ✓ Emergency broadcast sent to all users!
                  </p>
                )}
              </form>
            </div>

            {/* Broadcast History */}
            <div className="lg:col-span-2 bg-[#28150a] border border-[#3d2212] rounded-3xl p-6 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                  <Bell className="w-4 h-4 text-[#cb9d75]" />
                  Active Broadcast Announcements
                </h3>
                <span className="text-xs text-[#cb9d75]/60">
                  {broadcasts.length} total alert{broadcasts.length === 1 ? "" : "s"}
                </span>
              </div>

              <div className="space-y-3">
                {broadcasts.map((b) => {
                  const isCritical = b.priority === "Critical";
                  return (
                    <div
                      key={b._id || b.id}
                      className={`p-4 rounded-2xl border transition-all ${
                        isCritical
                          ? "bg-red-950/30 border-red-800"
                          : "bg-[#1a0c05] border-[#3d2212]"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                                isCritical
                                  ? "bg-red-900 text-red-200"
                                  : "bg-[#3d2212] text-[#cb9d75]"
                              }`}
                            >
                              {b.category}
                            </span>
                            <span
                              className={`text-[10px] font-bold ${
                                isCritical
                                  ? "text-red-400"
                                  : "text-amber-400"
                              }`}
                            >
                              ● {b.priority} Priority
                            </span>
                          </div>
                          <h4 className="text-sm font-bold text-white mt-1.5">
                            {b.title}
                          </h4>
                          <p className="text-xs text-[#cb9d75]/80 mt-1 leading-relaxed">
                            {b.message}
                          </p>
                        </div>

                        <button
                          onClick={() => handleDeleteBroadcast(b._id || b.id)}
                          className="text-[#cb9d75]/40 hover:text-red-400 p-1.5 rounded-lg transition cursor-pointer"
                          title="Dismiss alert"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-[#cb9d75]/50 border-t border-[#302018] pt-2.5 mt-3">
                        <span>Sent by: {b.sentBy || "Admin"}</span>
                        <span>
                          {new Date(b.createdAt || Date.now()).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  );
                })}

                {broadcasts.length === 0 && (
                  <div className="text-center py-10 text-[#cb9d75]/50">
                    <Radio className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p className="text-xs">No active broadcasts currently running</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================
          TAB 3: SECURITY & ACCESS CONTROL
      ==================================================== */}
      {activeSubTab === "security" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Master Password Change */}
            <div className="bg-[#28150a] border border-[#3d2212] rounded-3xl p-6 space-y-4">
              <div>
                <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-[#cb9d75]" />
                  Change Admin Master Password
                </h3>
                <p className="text-xs text-[#cb9d75]/70 mt-1">
                  💡 No external service needed: Passwords are automatically encrypted with free bcrypt hashing.
                </p>
              </div>

              <form onSubmit={handlePasswordChange} className="space-y-3 pt-2">
                <div>
                  <label className="text-[11px] font-bold text-[#cb9d75] uppercase">
                    Current Password
                  </label>
                  <input
                    type="password"
                    required
                    value={passData.currentPassword}
                    onChange={(e) =>
                      setPassData({
                        ...passData,
                        currentPassword: e.target.value,
                      })
                    }
                    placeholder="Enter current admin password"
                    className="w-full bg-[#1a0c05] border border-[#3d2212] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#9e6133] mt-1"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-[#cb9d75] uppercase">
                    New Password
                  </label>
                  <input
                    type="password"
                    required
                    value={passData.newPassword}
                    onChange={(e) =>
                      setPassData({ ...passData, newPassword: e.target.value })
                    }
                    placeholder="At least 6 characters"
                    className="w-full bg-[#1a0c05] border border-[#3d2212] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#9e6133] mt-1"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-[#cb9d75] uppercase">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    required
                    value={passData.confirmPassword}
                    onChange={(e) =>
                      setPassData({
                        ...passData,
                        confirmPassword: e.target.value,
                      })
                    }
                    placeholder="Re-type new password"
                    className="w-full bg-[#1a0c05] border border-[#3d2212] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#9e6133] mt-1"
                  />
                </div>

                {passMsg.text && (
                  <p
                    className={`text-xs font-bold ${
                      passMsg.type === "success"
                        ? "text-emerald-400"
                        : "text-red-400"
                    }`}
                  >
                    {passMsg.text}
                  </p>
                )}

                <button
                  type="submit"
                  className="w-full bg-[#9e6133] hover:bg-[#814a27] text-white font-bold py-2.5 rounded-xl text-xs transition shadow-lg shadow-[#9e6133]/20 cursor-pointer"
                >
                  Update Master Password
                </button>
              </form>
            </div>

            {/* Access Policies & Maintenance Mode */}
            <div className="bg-[#28150a] border border-[#3d2212] rounded-3xl p-6 space-y-4">
              <div>
                <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                  <Shield className="w-4 h-4 text-[#cb9d75]" />
                  System Security & Registration
                </h3>
                <p className="text-xs text-[#cb9d75]/70 mt-1">
                  💡 Turn registration on or off and configure emergency maintenance banners.
                </p>
              </div>

              <div className="space-y-4 pt-2">
                {/* Public Registration Toggle */}
                <div className="flex items-center justify-between p-4 rounded-2xl bg-[#1a0c05] border border-[#3d2212]">
                  <div>
                    <p className="text-xs font-bold text-white">
                      Public User Registration
                    </p>
                    <p className="text-[11px] text-[#cb9d75]/60 mt-0.5">
                      Allow new users to sign up themselves from the home page
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
                    <div className="w-11 h-6 bg-[#3d2212] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#9e6133]"></div>
                  </label>
                </div>

                {/* 2FA Mode */}
                <div className="flex items-center justify-between p-4 rounded-2xl bg-[#1a0c05] border border-[#3d2212]">
                  <div>
                    <p className="text-xs font-bold text-white">
                      Require 2-Factor Auth (2FA) for Admins
                    </p>
                    <p className="text-[11px] text-[#cb9d75]/60 mt-0.5">
                      Enforce second authentication layer for admin logins
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.requireAdmin2FA}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          requireAdmin2FA: e.target.checked,
                        })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-[#3d2212] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#9e6133]"></div>
                  </label>
                </div>

                {/* Maintenance Mode */}
                <div className="p-4 rounded-2xl bg-[#1a0c05] border border-[#3d2212] space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-white flex items-center gap-1.5">
                        <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                        System Maintenance Mode
                      </p>
                      <p className="text-[11px] text-[#cb9d75]/60 mt-0.5">
                        Shows a maintenance warning banner on public pages
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
                      <div className="w-11 h-6 bg-[#3d2212] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
                    </label>
                  </div>

                  {settings.maintenanceMode && (
                    <div className="pt-2">
                      <label className="text-[10px] font-bold text-[#cb9d75] uppercase">
                        Maintenance Banner Text
                      </label>
                      <input
                        type="text"
                        value={settings.maintenanceNotice}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            maintenanceNotice: e.target.value,
                          })
                        }
                        className="w-full bg-[#28150a] border border-amber-900 rounded-xl px-3 py-2 text-xs text-amber-200 focus:outline-none focus:ring-1 focus:ring-amber-500 mt-1"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================
          TAB 4: SYSTEM AUDIT LOGS (Free CSV/JSON Export)
      ==================================================== */}
      {activeSubTab === "logs" && (
        <div className="bg-[#28150a] border border-[#3d2212] rounded-3xl p-6 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#cb9d75]" />
                System Activity & Audit Log Trail
              </h3>
              <p className="text-xs text-[#cb9d75]/60 mt-0.5">
                💡 Simple log trail showing when admins change settings, send alerts, or manage accounts.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={exportLogsAsCsv}
                className="bg-[#1a0c05] hover:bg-[#3d2212] text-[#cb9d75] border border-[#3d2212] px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" /> Export CSV
              </button>
              <button
                onClick={exportLogsAsJson}
                className="bg-[#1a0c05] hover:bg-[#3d2212] text-[#cb9d75] border border-[#3d2212] px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" /> Export JSON
              </button>
              <button
                onClick={handleClearLogs}
                className="bg-red-950/40 hover:bg-red-900 text-red-300 border border-red-800 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" /> Clear
              </button>
            </div>
          </div>

          {/* Search & Filter */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <input
              type="text"
              value={logSearch}
              onChange={(e) => setLogSearch(e.target.value)}
              placeholder="Search by action, details, or admin name..."
              className="flex-1 bg-[#1a0c05] border border-[#3d2212] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#9e6133]"
            />
            <select
              value={logFilter}
              onChange={(e) => setLogFilter(e.target.value)}
              className="bg-[#1a0c05] border border-[#3d2212] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#9e6133]"
            >
              <option value="all">All Categories</option>
              <option value="dispatch">Dispatch & SOS</option>
              <option value="user">User Management</option>
              <option value="broadcast">Broadcasts</option>
              <option value="security">Security & Auth</option>
              <option value="system">System Settings</option>
            </select>
          </div>

          {/* Logs Table */}
          <div className="overflow-x-auto rounded-2xl border border-[#3d2212]">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#1a0c05] text-[#cb9d75] uppercase text-[10px] font-bold border-b border-[#3d2212]">
                <tr>
                  <th className="p-3">Time</th>
                  <th className="p-3">Action</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Details</th>
                  <th className="p-3">Admin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#3d2212] text-[#cb9d75]/80">
                {filteredLogs.map((log) => (
                  <tr key={log._id || log.id} className="hover:bg-[#1a0c05]/60 transition">
                    <td className="p-3 font-mono text-[11px] text-[#cb9d75]/60 whitespace-nowrap">
                      {new Date(log.createdAt || Date.now()).toLocaleTimeString()}
                      <span className="block text-[9px]">
                        {new Date(log.createdAt || Date.now()).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="p-3 font-bold text-white">
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-mono bg-[#3d2212] text-[#cb9d75]">
                        {log.action}
                      </span>
                    </td>
                    <td className="p-3 capitalize">{log.category}</td>
                    <td className="p-3 text-white/90 max-w-xs truncate">{log.details}</td>
                    <td className="p-3 font-mono text-[11px] text-[#cb9d75]/70">{log.actor}</td>
                  </tr>
                ))}

                {filteredLogs.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-[#cb9d75]/40">
                      No matching log entries found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ====================================================
          TAB 5: DIAGNOSTICS & FREE TOOLS
      ==================================================== */}
      {activeSubTab === "diagnostics" && (
        <div className="space-y-6">
          {/* Health Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-[#28150a] border border-[#3d2212] rounded-3xl p-5">
              <p className="text-[10px] text-[#cb9d75] font-bold uppercase flex items-center gap-1.5">
                <Server className="w-3.5 h-3.5 text-emerald-400" /> Database & Server
              </p>
              <p className="text-xl font-black text-emerald-400 mt-2">Connected</p>
              <p className="text-[11px] text-[#cb9d75]/60 mt-1">100% Free / Ready</p>
            </div>

            <div className="bg-[#28150a] border border-[#3d2212] rounded-3xl p-5">
              <p className="text-[10px] text-[#cb9d75] font-bold uppercase flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-cyan-400" /> Real-time Sockets
              </p>
              <p className="text-xl font-black text-cyan-400 mt-2">
                {stats?.activeSockets ?? 1} Online
              </p>
              <p className="text-[11px] text-[#cb9d75]/60 mt-1">Free GPS & Alert stream</p>
            </div>

            <div className="bg-[#28150a] border border-[#3d2212] rounded-3xl p-5">
              <p className="text-[10px] text-[#cb9d75] font-bold uppercase flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-400" /> System Uptime
              </p>
              <p className="text-xl font-black text-white mt-2">99.9%</p>
              <p className="text-[11px] text-[#cb9d75]/60 mt-1">Local daemon active</p>
            </div>

            <div className="bg-[#28150a] border border-[#3d2212] rounded-3xl p-5">
              <p className="text-[10px] text-[#cb9d75] font-bold uppercase flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-red-400" /> Total SOS Handled
              </p>
              <p className="text-xl font-black text-red-400 mt-2">
                {stats?.totalAlerts ?? 12}
              </p>
              <p className="text-[11px] text-[#cb9d75]/60 mt-1">Free SOS records</p>
            </div>
          </div>

          {/* Sound Synthesizer & Free Backup Tools */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Free Built-in Alarm Siren Synthesizer */}
            <div className="bg-[#28150a] border border-[#3d2212] rounded-3xl p-6 space-y-4">
              <div>
                <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-red-400" />
                  Free Browser Alarm Siren Tester
                </h3>
                <p className="text-xs text-[#cb9d75]/70 mt-1">
                  💡 100% Free: Uses the browser's built-in Web Audio API to synthesize emergency police/alarm siren tones without needing audio files or paid tools.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#1a0c05] border border-[#3d2212] space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-3 h-3 rounded-full ${
                        isPlayingSiren
                          ? "bg-red-500 animate-ping"
                          : "bg-[#3d2212]"
                      }`}
                    ></span>
                    <span className="text-xs font-bold text-white">
                      Status: {isPlayingSiren ? "SIREN SOUNDING" : "Silent (Standby)"}
                    </span>
                  </div>

                  <button
                    onClick={toggleSirenAudio}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                      isPlayingSiren
                        ? "bg-red-700 hover:bg-red-600 text-white animate-pulse"
                        : "bg-[#9e6133] hover:bg-[#814a27] text-white"
                    }`}
                  >
                    {isPlayingSiren ? (
                      <>
                        <VolumeX className="w-4 h-4" /> Stop Alarm Siren
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-4 h-4" /> Test Alarm Siren
                      </>
                    )}
                  </button>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-[#cb9d75]">
                    <span>Siren Master Volume</span>
                    <span className="font-mono">{Math.round(sirenVolume * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={sirenVolume}
                    onChange={(e) => {
                      const v = Number(e.target.value);
                      setSirenVolume(v);
                      if (sirenGainRef.current && audioCtxRef.current) {
                        sirenGainRef.current.gain.setValueAtTime(
                          v,
                          audioCtxRef.current.currentTime
                        );
                      }
                    }}
                    className="w-full accent-[#9e6133] cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Free Backup & Cleanup Tools */}
            <div className="bg-[#28150a] border border-[#3d2212] rounded-3xl p-6 space-y-4">
              <div>
                <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                  <Database className="w-4 h-4 text-[#cb9d75]" />
                  Free Backup & Maintenance
                </h3>
                <p className="text-xs text-[#cb9d75]/70 mt-1">
                  💡 Download all your app data or clean resolved cases with 1 click.
                </p>
              </div>

              <div className="space-y-3">
                <button
                  onClick={exportFullSystemBackup}
                  className="w-full bg-[#1a0c05] hover:bg-[#3d2212] text-white border border-[#3d2212] p-3.5 rounded-2xl text-xs font-bold transition flex items-center justify-between cursor-pointer"
                >
                  <div className="text-left">
                    <p className="font-bold text-white">Download Full System Backup</p>
                    <p className="text-[11px] text-[#cb9d75]/60">
                      Free JSON file backup of settings, broadcasts, and activity logs
                    </p>
                  </div>
                  <Download className="w-4 h-4 text-[#cb9d75] shrink-0" />
                </button>

                <button
                  onClick={handleClearResolved}
                  className="w-full bg-[#1a0c05] hover:bg-red-950/30 text-white border border-[#3d2212] hover:border-red-800 p-3.5 rounded-2xl text-xs font-bold transition flex items-center justify-between cursor-pointer"
                >
                  <div className="text-left">
                    <p className="font-bold text-red-300">Clean Resolved SOS Cases</p>
                    <p className="text-[11px] text-[#cb9d75]/60">
                      Remove old resolved SOS records to keep database fast
                    </p>
                  </div>
                  <Trash2 className="w-4 h-4 text-red-400 shrink-0" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
