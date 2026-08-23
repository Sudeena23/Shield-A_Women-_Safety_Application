import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  Shield,
  Radio,
  MapPin,
  Send,
  CheckCircle2,
  RefreshCw,
  BellRing,
  Activity,
  ShieldAlert,
  ShieldCheck,
  Phone,
  Settings,
  Sparkles,
} from "lucide-react";
import { alertService } from "../../services/alertService";
import { adminService } from "../../services/adminService";
import { AdminNavbar } from "./AdminNavbar";
import { SOSDispatch } from "./SOSDispatch";
import { UserData } from "./UserData";
import { HelplineRegister } from "./HelplineRegister";
import { AdminSettings } from "./AdminSettings";
import { AdminLiveLocation } from "./AdminLiveLocation";
import { InteractiveMap } from "../InteractiveMap";
import { SOSMiniMap } from "./SOSMiniMap";

export const AdminDashboard = ({
  usersList = [],
  currentUser,
  onDeleteUser,
  onToggleUserStatus,
  onAddUser,
  onEditUser,
  onLogout,
}) => {
  // Navigation State
  const [activeTab, setActiveTab] = useState("dashboard");
  const [navWidth, setNavWidth] = useState(256);

  // Live Alerts & Dispatches State
  const [dispatches, setDispatches] = useState([]);
  const [loadingAlerts, setLoadingAlerts] = useState(true);

  // Broadcast Messaging Form State
  const [broadcastTitle, setBroadcastTitle] = useState("");
  const [broadcastMessage, setBroadcastMessage] = useState("");
  const [broadcastPriority, setBroadcastPriority] = useState("Normal");
  const [broadcastSending, setBroadcastSending] = useState(false);
  const [broadcastSuccess, setBroadcastSuccess] = useState(false);

  // ----------------------------------------------------
  // Initial Fetch of Real System Dispatches & Alerts
  // ----------------------------------------------------
  const fetchLiveDispatches = async () => {
    try {
      setLoadingAlerts(true);
      const alertsData = await alertService.getAlerts();

      if (Array.isArray(alertsData)) {
        const mappedDispatches = alertsData.map((a, idx) => ({
          id: a._id || a.id || `DISP-${8900 + idx}`,
          victimName: a.victimName || a.user?.name || "Emergency Caller",
          victimPhone:
            a.victimPhone || a.user?.phone || "+977 9841-000000",
          bloodGroup: a.bloodGroup || a.user?.bloodGroup || "O+",
          medicalNotes:
            a.medicalNotes ||
            a.user?.medicalNotes ||
            "No prior medical allergies logged",
          location:
            a.address ||
            a.location ||
            `${a.lat ? Number(a.lat).toFixed(4) : "27.7172"}, ${
              a.lng ? Number(a.lng).toFixed(4) : "85.3240"
            }`,
          latitude: a.lat ? Number(a.lat) : 27.7172,
          longitude: a.lng ? Number(a.lng) : 85.3240,
          triggeredAt: a.createdAt || a.timestamp || new Date().toISOString(),
          status: a.status || "Active",
          type: a.type || "Emergency SOS Alert",
          guardianCount: a.recipientsCount || 2,
          duressActivated: Boolean(a.duressActivated),
          ipLog: a.ipLog || "127.0.0.1",
        }));

        setDispatches(mappedDispatches);
      }
    } catch (err) {
      console.warn("Dispatches initialized in local mode:", err.message);
    } finally {
      setLoadingAlerts(false);
    }
  };

  useEffect(() => {
    fetchLiveDispatches();

    // Listen for tab switch events from parent / router
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get("tab");
      if (tabParam) {
        setActiveTab(tabParam);
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // Update tab in URL history
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    const url = new URL(window.location.href);
    url.searchParams.set("tab", tabId);
    window.history.pushState({}, "", url.toString());
  };

  // Quick Dispatch Handler
  const handleQuickDispatch = async (dispatchId) => {
    try {
      setDispatches((prev) =>
        prev.map((item) =>
          item.id === dispatchId
            ? { ...item, status: "Unit Dispatched" }
            : item
        )
      );
      await alertService.updateAlertStatus(dispatchId, "Unit Dispatched");
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  // Quick Resolve Handler
  const handleQuickResolve = async (dispatchId) => {
    try {
      setDispatches((prev) =>
        prev.map((item) =>
          item.id === dispatchId
            ? { ...item, status: "Resolved" }
            : item
        )
      );
      await alertService.updateAlertStatus(dispatchId, "Resolved");
    } catch (err) {
      console.error("Failed to resolve alert:", err);
    }
  };

  // Broadcast Handler (Dispatches to all active clients via socket & backend)
  const handleSendBroadcast = async (e) => {
    e.preventDefault();
    if (!broadcastTitle.trim() || !broadcastMessage.trim()) return;

    try {
      setBroadcastSending(true);
      const payload = {
        title: broadcastTitle.trim(),
        message: broadcastMessage.trim(),
        priority: broadcastPriority,
        category: "Safety Advisory",
        active: true,
      };

      await adminService.sendBroadcast(payload);

      // Trigger socket event
      try {
        const { emitAlert } = await import("../../services/socketService");
        emitAlert({
          type: "emergency-broadcast",
          title: payload.title,
          message: payload.message,
          priority: payload.priority,
        });
      } catch (sErr) {
        console.warn("Socket broadcast emit skipped:", sErr.message);
      }

      setBroadcastTitle("");
      setBroadcastMessage("");
      setBroadcastPriority("Normal");
      setBroadcastSuccess(true);
      setTimeout(() => setBroadcastSuccess(false), 3000);
    } catch (err) {
      console.error("Broadcast transmission error:", err);
    } finally {
      setBroadcastSending(false);
    }
  };

  // Admin Clearance Guard
  if (!currentUser || currentUser.role !== "admin") {
    return (
      <div className="min-h-screen bg-[#fbf7f2] flex items-center justify-center p-6 text-[#2d180c]">
        <div className="bg-white border border-[#eee0ce] rounded-3xl p-8 text-center max-w-md shadow-xl space-y-4">
          <ShieldAlert className="w-12 h-12 text-red-600 mx-auto" />
          <h2 className="text-xl font-black text-[#2d180c]">
            Admin Access Required
          </h2>
          <p className="text-xs text-[#814a27]/80">
            Please log in with an administrator account to access this portal.
          </p>
          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            <Link
              to="/dashboard"
              className="flex-1 px-4 py-3 bg-[#9e6133] hover:bg-[#814a27] text-white rounded-2xl text-xs font-extrabold uppercase tracking-wider transition-colors shadow-md text-center"
            >
              Dashboard
            </Link>
            <Link
              to="/auth"
              className="flex-1 px-4 py-3 bg-[#f7f0e6] hover:bg-[#eee0ce] text-[#2d180c] rounded-2xl text-xs font-extrabold uppercase tracking-wider transition-colors border border-[#eee0ce] text-center"
            >
              Go to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const activeSOSCount = dispatches.filter(
    (item) => item.status === "Active" || item.status === "Unit Dispatched"
  ).length;

  const resolvedCount = dispatches.filter((item) => item.status === "Resolved").length;

  return (
    <div className="min-h-screen bg-[#fbf7f2] text-[#2d180c] font-sans">
      {/* SIDEBAR NAVIGATION */}
      <AdminNavbar
        activeTab={activeTab}
        onTabChange={handleTabChange}
        activeSOSCount={activeSOSCount}
        onWidthChange={setNavWidth}
        user={currentUser}
        onLogout={onLogout}
      />

      {/* MAIN ADMIN WORKSPACE */}
      <div
        className="transition-all duration-300 p-4 sm:p-6 lg:p-8"
        style={{ marginLeft: navWidth }}
      >
        {/* DASHBOARD OVERVIEW TAB */}
        {activeTab === "dashboard" && (
          <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-200">
            
            {/* Header Status Bar */}
            <div className="bg-white border border-[#eee0ce] rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[11px] font-extrabold text-emerald-700 uppercase tracking-wider bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    Operations Active
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-[#2d180c] mt-2 tracking-tight">
                  Safety Command Dashboard
                </h1>
                <p className="text-xs text-[#814a27]/80 mt-1">
                  Real-time emergency monitoring, live incident dispatch, and user security management.
                </p>
              </div>

              <div className="flex items-center gap-3 self-start sm:self-auto">
                <div className="bg-[#fdfbf7] border border-[#eee0ce] rounded-2xl px-4 py-2.5 text-right shadow-xs">
                  <div className="text-[10px] text-[#814a27]/70 uppercase font-extrabold">Logged Administrator</div>
                  <div className="text-xs font-black text-[#2d180c]">{currentUser?.name || "Administrator"}</div>
                </div>
              </div>
            </div>

            {/* Live Incident Warning Bar (Shows only when active SOS exists) */}
            {activeSOSCount > 0 && (
              <div className="bg-red-50 border-2 border-red-200 rounded-3xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-red-600 rounded-2xl text-white shadow-sm">
                    <ShieldAlert className="w-6 h-6 animate-pulse" />
                  </div>
                  <div>
                    <div className="text-sm font-black text-red-900">
                      {activeSOSCount} Active Emergency Alert{activeSOSCount === 1 ? '' : 's'} Requiring Response
                    </div>
                    <div className="text-xs text-red-800/80 mt-0.5">
                      Review GPS coordinates on the dispatch mini-map and assign emergency units.
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleTabChange("dispatches")}
                  className="bg-red-600 hover:bg-red-700 text-white font-extrabold px-5 py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer shrink-0 shadow-md"
                >
                  View SOS Dispatches &rarr;
                </button>
              </div>
            )}

            {/* 3 Real KPI Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              
              {/* Card 1: Active Alerts */}
              <div className="bg-white border border-[#eee0ce] rounded-3xl p-6 space-y-2 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between text-[#814a27]">
                  <span className="text-xs font-black uppercase tracking-wider">Active SOS Alerts</span>
                  <div className={`p-2 rounded-xl ${activeSOSCount > 0 ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-[#f7f0e6] text-[#9e6133]'}`}>
                    <Radio className="w-4 h-4" />
                  </div>
                </div>
                <div className={`text-3xl font-black font-mono ${activeSOSCount > 0 ? 'text-red-600' : 'text-[#2d180c]'}`}>
                  {activeSOSCount}
                </div>
                <div className="text-[11px] text-[#814a27]/70 font-medium">
                  {activeSOSCount > 0 ? 'Urgent responder dispatch needed' : 'All areas currently clear'}
                </div>
              </div>

              {/* Card 2: Registered Users */}
              <div className="bg-white border border-[#eee0ce] rounded-3xl p-6 space-y-2 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between text-[#814a27]">
                  <span className="text-xs font-black uppercase tracking-wider">Registered Users</span>
                  <div className="p-2 rounded-xl bg-[#f7f0e6] text-[#9e6133]">
                    <Users className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-3xl font-black text-[#2d180c] font-mono">
                  {usersList.length}
                </div>
                <div className="text-[11px] text-[#814a27]/70 font-medium">
                  Total protected safety profiles
                </div>
              </div>

              {/* Card 3: Resolved Incidents */}
              <div className="bg-white border border-[#eee0ce] rounded-3xl p-6 space-y-2 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between text-[#814a27]">
                  <span className="text-xs font-black uppercase tracking-wider">Resolved Incidents</span>
                  <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-3xl font-black text-emerald-700 font-mono">
                  {resolvedCount}
                </div>
                <div className="text-[11px] text-[#814a27]/70 font-medium">
                  Safely handled emergency dispatches
                </div>
              </div>

            </div>

            {/* Real Map & Emergency Broadcast Section */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Live Incident Map */}
              <div className="lg:col-span-8 bg-white border border-[#eee0ce] rounded-3xl p-6 space-y-3 shadow-sm">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black text-[#2d180c] flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-red-600" /> Live Incident Map
                  </h3>
                  <button
                    onClick={() => handleTabChange("liveLocation")}
                    className="text-xs text-[#9e6133] hover:text-[#814a27] font-bold cursor-pointer transition-colors"
                  >
                    Full Radar View &rarr;
                  </button>
                </div>

                <InteractiveMap
                  lat={27.7172}
                  lng={85.3240}
                  zoom={13}
                  markers={dispatches.map((d) => ({
                    id: d.id,
                    lat: d.latitude,
                    lng: d.longitude,
                    title: d.victimName,
                    details: `${d.location} • Status: ${d.status}`,
                    status: d.status,
                    isEmergency: d.status === "Active" || d.status === "Unit Dispatched",
                  }))}
                  height="320px"
                />
              </div>

              {/* Public Broadcast Sender */}
              <div className="lg:col-span-4 bg-white border border-[#eee0ce] rounded-3xl p-6 flex flex-col justify-between space-y-4 shadow-sm">
                <div>
                  <h3 className="text-sm font-black text-[#2d180c] flex items-center gap-2 border-b border-[#eee0ce] pb-3">
                    <BellRing className="w-4 h-4 text-[#9e6133]" /> Public Safety Broadcast
                  </h3>
                  <p className="text-[11px] text-[#814a27]/80 mt-2">
                    Broadcast instant safety alerts directly to all active user devices.
                  </p>

                  {broadcastSuccess && (
                    <div className="mt-2.5 bg-emerald-50 border border-emerald-200 text-emerald-900 p-2.5 rounded-xl text-xs font-bold flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Broadcast dispatched successfully!</span>
                    </div>
                  )}

                  <form onSubmit={handleSendBroadcast} className="space-y-3 mt-3">
                    <div>
                      <label className="block text-[10px] font-extrabold uppercase tracking-wider text-[#2d180c] mb-1">
                        Title
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Weather / Safety Advisory"
                        value={broadcastTitle}
                        onChange={(e) => setBroadcastTitle(e.target.value)}
                        className="w-full bg-[#fdfbf7] border border-[#eee0ce] rounded-xl px-3 py-2 text-xs font-bold text-[#2d180c] placeholder-[#814a27]/40 focus:outline-none focus:ring-2 focus:ring-[#9e6133]"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-extrabold uppercase tracking-wider text-[#2d180c] mb-1">
                        Message
                      </label>
                      <textarea
                        required
                        rows={3}
                        placeholder="Enter notice content for all users..."
                        value={broadcastMessage}
                        onChange={(e) => setBroadcastMessage(e.target.value)}
                        className="w-full bg-[#fdfbf7] border border-[#eee0ce] rounded-xl p-2.5 text-xs font-bold text-[#2d180c] placeholder-[#814a27]/40 focus:outline-none focus:ring-2 focus:ring-[#9e6133]"
                      />
                    </div>

                    <div className="flex gap-2 pt-1">
                      {["Normal", "High", "Critical"].map((lvl) => (
                        <button
                          key={lvl}
                          type="button"
                          onClick={() => setBroadcastPriority(lvl)}
                          className={`flex-1 py-1.5 rounded-xl text-[10px] font-extrabold uppercase tracking-wider transition cursor-pointer border ${
                            broadcastPriority === lvl
                              ? lvl === "Critical"
                                ? "bg-red-600 text-white border-red-600 shadow-xs"
                                : "bg-[#9e6133] text-white border-[#9e6133] shadow-xs"
                              : "bg-[#fdfbf7] text-[#814a27] border-[#eee0ce] hover:bg-[#f7f0e6]"
                          }`}
                        >
                          {lvl}
                        </button>
                      ))}
                    </div>

                    <button
                      type="submit"
                      disabled={broadcastSending}
                      className="w-full bg-[#9e6133] hover:bg-[#814a27] text-white font-extrabold py-2.5 px-3 rounded-xl text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-[#9e6133]/25 disabled:opacity-50 mt-2"
                    >
                      {broadcastSending ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                      <span>{broadcastSending ? "Sending..." : "Dispatch Broadcast"}</span>
                    </button>
                  </form>
                </div>
              </div>

            </div>

            {/* Recent SOS Incidents Section */}
            <div className="bg-white border border-[#eee0ce] rounded-3xl p-6 space-y-4 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#eee0ce] pb-3">
                <div className="flex items-center gap-3">
                  <h3 className="text-sm font-black text-[#2d180c] flex items-center gap-2">
                    <Activity className="w-4 h-4 text-red-600" /> Recent Emergency Alerts ({dispatches.length})
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleTabChange("dispatches")}
                    className="text-xs text-[#9e6133] hover:text-[#814a27] font-bold cursor-pointer transition-colors"
                  >
                    Manage All Dispatches &rarr;
                  </button>
                </div>
              </div>

              {/* Table / Mini-Map Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {dispatches.slice(0, 3).map((d) => {
                  const isAlert = d.status === "Active";
                  const isDispatched = d.status === "Unit Dispatched";

                  return (
                    <div
                      key={d.id}
                      className={`bg-[#fdfbf7] border rounded-2xl p-4 space-y-3 shadow-xs flex flex-col justify-between hover:border-[#cb9d75] transition-colors ${
                        isAlert ? "border-red-300 ring-1 ring-red-200" : isDispatched ? "border-amber-300" : "border-[#eee0ce]"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 border-b border-[#eee0ce] pb-2.5">
                        <div>
                          <div className="text-xs font-black text-[#2d180c]">{d.victimName}</div>
                          <div className="text-[10px] text-[#814a27]/80 font-mono mt-0.5">
                            {d.victimPhone} • Blood: <span className="font-bold text-rose-600">{d.bloodGroup}</span>
                          </div>
                        </div>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase border ${
                            isAlert
                              ? "bg-red-50 text-red-700 border-red-200 animate-pulse"
                              : isDispatched
                              ? "bg-amber-50 text-amber-700 border-amber-200"
                              : "bg-emerald-50 text-emerald-700 border-emerald-200"
                          }`}
                        >
                          {d.status}
                        </span>
                      </div>

                      {/* Interactive Mini-Map */}
                      <SOSMiniMap
                        latitude={d.latitude}
                        longitude={d.longitude}
                        locationName={d.location}
                        victimName={d.victimName}
                        status={d.status}
                        height="140px"
                        zoom={15}
                      />

                      <div className="flex items-center justify-between pt-1 gap-2">
                        <div className="text-[10px] text-[#814a27]/60 font-mono font-medium">
                          {new Date(d.triggeredAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>

                        <div className="flex items-center gap-1.5">
                          {isAlert && (
                            <button
                              onClick={() => handleQuickDispatch(d.id)}
                              className="bg-amber-600 hover:bg-amber-700 text-white px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase transition cursor-pointer shadow-xs"
                            >
                              Dispatch
                            </button>
                          )}

                          {d.status !== "Resolved" && (
                            <button
                              onClick={() => handleQuickResolve(d.id)}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase transition cursor-pointer shadow-xs"
                            >
                              Resolve
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {dispatches.length === 0 && (
                <div className="text-center py-8 text-[#814a27]/50 text-xs font-medium">
                  No SOS alerts recorded yet. All users currently safe.
                </div>
              )}
            </div>

          </div>
        )}

        {/* OTHER TABS */}
        <div className="mt-2">
          {activeTab === "dispatches" && (
            <SOSDispatch
              dispatches={dispatches}
              setDispatches={setDispatches}
            />
          )}

          {activeTab === "users" && (
            <UserData
              usersList={usersList}
              currentUser={currentUser}
              onDeleteUser={onDeleteUser}
              onToggleUserStatus={onToggleUserStatus}
              onAddUser={onAddUser}
              onEditUser={onEditUser}
            />
          )}

          {activeTab === "liveLocation" && <AdminLiveLocation />}

          {activeTab === "helplines" && <HelplineRegister />}

          {activeTab === "settings" && (
            <AdminSettings currentUser={currentUser} />
          )}
        </div>
      </div>
    </div>
  );
};