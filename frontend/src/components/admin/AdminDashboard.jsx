// AdminDashboard.jsx - Clean & Professional Operations Control Center
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { 
  ShieldAlert, 
  Radio, 
  Users, 
  Send, 
  MapPin, 
  Activity, 
  CheckCircle2, 
  Phone, 
  Clock, 
  ExternalLink, 
  ShieldCheck, 
  Server, 
  RefreshCw,
  BellRing,
  AlertTriangle
} from "lucide-react";

import { alertService } from "../../services/alertService";
import { adminService } from "../../services/adminService";
import { AdminNavbar } from "./AdminNavbar";
import { SOSDispatch } from "./SOSDispatch";
import { UserData } from "./UserData";
import { AdminLiveLocation } from "./AdminLiveLocation";
import { HelplineRegister } from "./HelplineRegister";
import { AdminSettings } from "./AdminSettings";
import { InteractiveMap } from "../InteractiveMap";

export const AdminDashboard = ({
  currentUser,
  usersList = [],
  onDeleteUser,
  onToggleUserStatus,
  onAddUser,
  onEditUser,
}) => {
  const location = useLocation();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("dashboard");
  const [dispatches, setDispatches] = useState([]);
  const [broadcastTitle, setBroadcastTitle] = useState("");
  const [broadcastMessage, setBroadcastMessage] = useState("");
  const [broadcastPriority, setBroadcastPriority] = useState("High");
  const [broadcastSending, setBroadcastSending] = useState(false);
  const [broadcastSuccess, setBroadcastSuccess] = useState(false);

  // Space for sidebar
  const [navWidth, setNavWidth] = useState(256);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    navigate(`/admin?tab=${tab}`, { replace: true });
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get("tab");

    if (
      [
        "dashboard",
        "dispatches",
        "users",
        "liveLocation",
        "helplines",
        "settings",
      ].includes(tab)
    ) {
      setActiveTab(tab);
    }
  }, [location.search]);

  // Load Real Alerts
  useEffect(() => {
    const loadAlerts = async () => {
      try {
        const alertsData = await alertService.getAlerts();

        const mapped = alertsData.map((a, index) => ({
          id: a._id || a.id || `DISP-${index + 1}`,
          victimName: a.victimName || a.user?.name || "SOS User",
          victimPhone: a.victimPhone || a.user?.phone || "N/A",
          bloodGroup: a.bloodGroup || a.user?.bloodGroup || "N/A",
          medicalNotes: a.medicalNotes || a.user?.medicalNotes || "None",
          location: a.address || `${Number(a.lat || 27.7172).toFixed(4)}, ${Number(a.lng || 85.324).toFixed(4)}`,
          triggeredAt: a.createdAt || new Date().toISOString(),
          status: a.status || "Active",
          type: a.type || "SOS Alert",
          latitude: Number(a.lat || 27.7172),
          longitude: Number(a.lng || 85.324),
        }));

        setDispatches(mapped);
      } catch (error) {
        console.error("Failed to load alerts:", error);
      }
    };

    loadAlerts();

    // Real-time SOS alert listener
    import("../../services/socketService").then(({ socket, connectSocket }) => {
      connectSocket();

      const handleNewAlert = (newAlert) => {
        setDispatches((prev) => [
          {
            id: newAlert._id || newAlert.id,
            victimName: newAlert.victimName || "SOS User",
            victimPhone: newAlert.victimPhone || "N/A",
            bloodGroup: newAlert.bloodGroup || "N/A",
            medicalNotes: newAlert.medicalNotes || "None",
            location: newAlert.address || `${Number(newAlert.lat).toFixed(4)}, ${Number(newAlert.lng).toFixed(4)}`,
            triggeredAt: newAlert.createdAt || new Date().toISOString(),
            status: newAlert.status || "Active",
            type: newAlert.type || "SOS Alert",
            latitude: Number(newAlert.lat || 27.7172),
            longitude: Number(newAlert.lng || 85.324),
          },
          ...prev,
        ]);
      };

      const handleResolvedAlert = ({ alertId }) => {
        setDispatches((prev) =>
          prev.map((a) => (a.id === alertId ? { ...a, status: "Resolved" } : a))
        );
      };

      socket.on("new-sos-alert", handleNewAlert);
      socket.on("alert-resolved", handleResolvedAlert);

      return () => {
        socket.off("new-sos-alert", handleNewAlert);
        socket.off("alert-resolved", handleResolvedAlert);
      };
    });
  }, []);

  // Quick Dispatch Unit Action
  const handleQuickDispatch = async (alertId) => {
    try {
      await alertService.updateAlertStatus(alertId, "Unit Dispatched");
      setDispatches((prev) =>
        prev.map((d) => (d.id === alertId ? { ...d, status: "Unit Dispatched" } : d))
      );
    } catch (e) {
      console.error(e);
    }
  };

  // Quick Resolve Action
  const handleQuickResolve = async (alertId) => {
    try {
      await alertService.resolveAlert(alertId);
      setDispatches((prev) =>
        prev.map((d) => (d.id === alertId ? { ...d, status: "Resolved" } : d))
      );
    } catch (e) {
      console.error(e);
    }
  };

  // Broadcast Alert Form Submit
  const handleSendBroadcast = async (e) => {
    e.preventDefault();
    if (!broadcastTitle.trim() || !broadcastMessage.trim()) return;

    setBroadcastSending(true);
    try {
      await adminService.sendBroadcast({
        title: broadcastTitle.trim(),
        message: broadcastMessage.trim(),
        category: "Emergency Advisory",
        priority: broadcastPriority,
      });

      setBroadcastSuccess(true);
      setBroadcastTitle("");
      setBroadcastMessage("");
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
      <div className="min-h-screen bg-[#1a0c05] flex items-center justify-center p-6 text-white">
        <div className="bg-[#28150a] border border-red-900/60 rounded-3xl p-8 text-center max-w-md shadow-2xl">
          <ShieldAlert className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-lg font-black text-white">
            Admin Access Required
          </h2>
          <p className="text-xs text-[#cb9d75]/80 mt-2">
            Please log in with an administrator account to access this portal.
          </p>
          <Link
            to="/auth"
            className="inline-block mt-5 px-5 py-2.5 bg-[#9e6133] hover:bg-[#814a27] text-white rounded-xl text-xs font-bold transition-colors"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  const activeSOSCount = dispatches.filter(
    (item) => item.status === "Active" || item.status === "Unit Dispatched"
  ).length;

  const resolvedCount = dispatches.filter((item) => item.status === "Resolved").length;

  return (
    <div className="min-h-screen bg-[#140a04] text-white font-sans">
      {/* SIDEBAR NAVIGATION */}
      <AdminNavbar
        activeTab={activeTab}
        onTabChange={handleTabChange}
        activeSOSCount={activeSOSCount}
        onWidthChange={setNavWidth}
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
            <div className="bg-[#231207] border border-[#3d2212] rounded-2xl p-5 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
                    Admin Operations Active
                  </span>
                </div>
                <h1 className="text-xl sm:text-2xl font-black text-white mt-1">
                  Safety Command Dashboard
                </h1>
                <p className="text-xs text-[#cb9d75]/70">
                  Real-time emergency monitoring, live incident dispatch, and user management.
                </p>
              </div>

              <div className="flex items-center gap-3 self-start sm:self-auto">
                <div className="bg-[#1a0c05] border border-[#3d2212] rounded-xl px-3.5 py-2 text-right">
                  <div className="text-[10px] text-[#cb9d75]/60 uppercase font-bold">Admin Account</div>
                  <div className="text-xs font-bold text-white">{currentUser?.name || "Administrator"}</div>
                </div>
              </div>
            </div>

            {/* Live Incident Warning Bar (Shows only when active SOS exists) */}
            {activeSOSCount > 0 && (
              <div className="bg-red-950/70 border border-red-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-600 rounded-xl text-white">
                    <ShieldAlert className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-red-200">
                      {activeSOSCount} Active Emergency Alert{activeSOSCount === 1 ? '' : 's'} Requiring Action
                    </div>
                    <div className="text-[11px] text-red-300/70">
                      Review coordinates and dispatch emergency response units.
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleTabChange("dispatches")}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-2 rounded-xl text-xs transition-colors cursor-pointer shrink-0"
                >
                  View SOS Dispatches &rarr;
                </button>
              </div>
            )}

            {/* 3 Real KPI Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              
              {/* Card 1: Active Alerts */}
              <div className="bg-[#231207] border border-[#3d2212] rounded-2xl p-5 space-y-2">
                <div className="flex items-center justify-between text-[#cb9d75]">
                  <span className="text-xs font-bold uppercase tracking-wider">Active SOS Alerts</span>
                  <Radio className={`w-4 h-4 ${activeSOSCount > 0 ? 'text-red-500 animate-pulse' : 'text-[#cb9d75]/60'}`} />
                </div>
                <div className="text-3xl font-black text-white font-mono">
                  {activeSOSCount}
                </div>
                <div className="text-[11px] text-[#cb9d75]/60">
                  {activeSOSCount > 0 ? 'Requires responder dispatch' : 'No active emergencies'}
                </div>
              </div>

              {/* Card 2: Registered Users */}
              <div className="bg-[#231207] border border-[#3d2212] rounded-2xl p-5 space-y-2">
                <div className="flex items-center justify-between text-[#cb9d75]">
                  <span className="text-xs font-bold uppercase tracking-wider">Registered Users</span>
                  <Users className="w-4 h-4 text-[#cb9d75]" />
                </div>
                <div className="text-3xl font-black text-white font-mono">
                  {usersList.length}
                </div>
                <div className="text-[11px] text-[#cb9d75]/60">
                  Total registered user accounts
                </div>
              </div>

              {/* Card 3: Resolved Incidents */}
              <div className="bg-[#231207] border border-[#3d2212] rounded-2xl p-5 space-y-2">
                <div className="flex items-center justify-between text-[#cb9d75]">
                  <span className="text-xs font-bold uppercase tracking-wider">Resolved Incidents</span>
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-3xl font-black text-emerald-400 font-mono">
                  {resolvedCount}
                </div>
                <div className="text-[11px] text-[#cb9d75]/60">
                  Handled and resolved safety cases
                </div>
              </div>

            </div>

            {/* Real Map & Emergency Broadcast Section */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Live Incident Map */}
              <div className="lg:col-span-8 bg-[#231207] border border-[#3d2212] rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-red-500" /> Live Incident Map
                  </h3>
                  <button
                    onClick={() => handleTabChange("liveLocation")}
                    className="text-xs text-[#cb9d75] hover:text-white font-bold cursor-pointer"
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
              <div className="lg:col-span-4 bg-[#231207] border border-[#3d2212] rounded-2xl p-5 flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-[#3d2212] pb-2">
                    <BellRing className="w-4 h-4 text-[#cb9d75]" /> Public Safety Broadcast
                  </h3>
                  <p className="text-[11px] text-[#cb9d75]/70 mt-2">
                    Send immediate safety notices directly to all connected users.
                  </p>

                  {broadcastSuccess && (
                    <div className="mt-2 bg-emerald-950/80 border border-emerald-800 text-emerald-300 p-2 rounded-xl text-xs font-bold flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Broadcast sent successfully!</span>
                    </div>
                  )}

                  <form onSubmit={handleSendBroadcast} className="space-y-2.5 mt-3">
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-[#cb9d75] mb-1">
                        Title
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Safety Advisory"
                        value={broadcastTitle}
                        onChange={(e) => setBroadcastTitle(e.target.value)}
                        className="w-full bg-[#1a0c05] border border-[#3d2212] rounded-xl px-3 py-2 text-xs text-white placeholder-[#cb9d75]/40 focus:outline-none focus:border-[#cb9d75]"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase text-[#cb9d75] mb-1">
                        Message
                      </label>
                      <textarea
                        required
                        rows={3}
                        placeholder="Enter notice details for all users..."
                        value={broadcastMessage}
                        onChange={(e) => setBroadcastMessage(e.target.value)}
                        className="w-full bg-[#1a0c05] border border-[#3d2212] rounded-xl p-2.5 text-xs text-white placeholder-[#cb9d75]/40 focus:outline-none focus:border-[#cb9d75]"
                      />
                    </div>

                    <div className="flex gap-2 pt-1">
                      {["Normal", "High", "Critical"].map((lvl) => (
                        <button
                          key={lvl}
                          type="button"
                          onClick={() => setBroadcastPriority(lvl)}
                          className={`flex-1 py-1 rounded-lg text-[10px] font-bold uppercase transition cursor-pointer ${
                            broadcastPriority === lvl
                              ? lvl === "Critical"
                                ? "bg-red-600 text-white"
                                : "bg-[#9e6133] text-white"
                              : "bg-[#1a0c05] text-[#cb9d75]/60 border border-[#3d2212]"
                          }`}
                        >
                          {lvl}
                        </button>
                      ))}
                    </div>

                    <button
                      type="submit"
                      disabled={broadcastSending}
                      className="w-full bg-[#9e6133] hover:bg-[#814a27] text-white font-bold py-2 px-3 rounded-xl text-xs uppercase tracking-wider transition flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50 mt-2"
                    >
                      {broadcastSending ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                      <span>{broadcastSending ? "Sending..." : "Send Broadcast"}</span>
                    </button>
                  </form>
                </div>
              </div>

            </div>

            {/* Recent SOS Incidents Table */}
            <div className="bg-[#231207] border border-[#3d2212] rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between border-b border-[#3d2212] pb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Activity className="w-4 h-4 text-red-500" /> Recent SOS Alerts ({dispatches.length})
                </h3>

                <button
                  onClick={() => handleTabChange("dispatches")}
                  className="text-xs text-[#cb9d75] hover:text-white font-bold cursor-pointer"
                >
                  Manage All Dispatches &rarr;
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="bg-[#1a0c05] border-b border-[#3d2212] text-[#cb9d75]/70">
                    <tr>
                      <th className="px-3.5 py-2.5 text-left font-bold uppercase tracking-wider">User</th>
                      <th className="px-3.5 py-2.5 text-left font-bold uppercase tracking-wider">Location</th>
                      <th className="px-3.5 py-2.5 text-left font-bold uppercase tracking-wider">Time</th>
                      <th className="px-3.5 py-2.5 text-left font-bold uppercase tracking-wider">Status</th>
                      <th className="px-3.5 py-2.5 text-right font-bold uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dispatches.slice(0, 5).map((d) => {
                      const isAlert = d.status === "Active";
                      const isDispatched = d.status === "Unit Dispatched";

                      return (
                        <tr key={d.id} className="border-b border-[#3d2212] hover:bg-[#1a0c05]/60 transition-colors">
                          <td className="px-3.5 py-3 font-bold text-white">
                            <div>{d.victimName}</div>
                            <div className="text-[10px] text-[#cb9d75]/60 font-mono">{d.victimPhone} • Blood: {d.bloodGroup}</div>
                          </td>

                          <td className="px-3.5 py-3 text-[#cb9d75]">
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-red-400 shrink-0" />
                              <span className="truncate max-w-xs">{d.location}</span>
                            </div>
                          </td>

                          <td className="px-3.5 py-3 text-[#cb9d75]/70 font-mono text-[11px]">
                            {new Date(d.triggeredAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </td>

                          <td className="px-3.5 py-3">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                              isAlert
                                ? "bg-red-950 text-red-300 border-red-800"
                                : isDispatched
                                ? "bg-amber-950 text-amber-300 border-amber-800"
                                : "bg-emerald-950 text-emerald-300 border-emerald-800"
                            }`}>
                              {d.status}
                            </span>
                          </td>

                          <td className="px-3.5 py-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {isAlert && (
                                <button
                                  onClick={() => handleQuickDispatch(d.id)}
                                  className="bg-amber-600 hover:bg-amber-700 text-white px-2 py-1 rounded text-[10px] font-bold uppercase transition cursor-pointer"
                                >
                                  Dispatch
                                </button>
                              )}

                              {d.status !== "Resolved" && (
                                <button
                                  onClick={() => handleQuickResolve(d.id)}
                                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-2 py-1 rounded text-[10px] font-bold uppercase transition cursor-pointer"
                                >
                                  Resolve
                                </button>
                              )}

                              <a
                                href={`https://www.google.com/maps?q=${d.latitude},${d.longitude}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1 text-[#cb9d75] hover:text-white bg-[#1a0c05] border border-[#3d2212] rounded transition"
                                title="Open in Google Maps"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {dispatches.length === 0 && (
                <div className="text-center py-6 text-[#cb9d75]/50 text-xs">
                  No SOS alerts recorded yet.
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