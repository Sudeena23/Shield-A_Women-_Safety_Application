import React, { useState, useEffect } from "react";
import { 
  MapPin, 
  Radio, 
  Users, 
  Clock, 
  ExternalLink, 
  ShieldAlert, 
  RefreshCw,
  Compass,
  AlertTriangle
} from "lucide-react";
import { connectSocket, listenForLocation, listenForAlerts } from "../../services/socketService";
import { alertService } from "../../services/alertService";
import { InteractiveMap } from "../InteractiveMap";

export const AdminLiveLocation = () => {
  const [activeSharers, setActiveSharers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIncident, setSelectedIncident] = useState(null);

  useEffect(() => {
    // Initial fetch of active alerts with location
    const loadInitialLocations = async () => {
      try {
        const alerts = await alertService.getAlerts();
        const activeAlertsWithLocation = alerts
          .filter((a) => a.lat && a.lng)
          .map((a) => ({
            id: a._id || a.id,
            name: a.victimName || a.user?.name || "Active SOS Victim",
            location: a.address || `${Number(a.lat).toFixed(4)}, ${Number(a.lng).toFixed(4)}`,
            since: "Active Dispatch",
            lat: Number(a.lat),
            lng: Number(a.lng),
            status: a.status || "Active",
            timestamp: new Date(a.createdAt || Date.now()).toLocaleTimeString(),
            isEmergency: a.status === "Active" || a.status === "Unit Dispatched",
          }));

        setActiveSharers(activeAlertsWithLocation);
        if (activeAlertsWithLocation.length > 0) {
          setSelectedIncident(activeAlertsWithLocation[0]);
        }
      } catch (err) {
        console.error("Failed loading initial locations:", err);
      } finally {
        setLoading(false);
      }
    };

    loadInitialLocations();

    // Connect to Socket.io for live updates
    connectSocket();

    // Real-time location stream listener
    listenForLocation((locationData) => {
      console.log("Admin received live location update:", locationData);
      const { userId, lat, lng, accuracy, timestamp } = locationData;

      setActiveSharers((prev) => {
        const existingIndex = prev.findIndex((u) => u.id === userId);
        const updatedItem = {
          id: userId || `user-${Date.now()}`,
          name: locationData.userName || `User ${userId?.substring(0, 6) || ""}`,
          location: `Live GPS (±${accuracy || 5}m)`,
          since: "Just now",
          lat: Number(lat),
          lng: Number(lng),
          status: "Live Tracking",
          timestamp: new Date(timestamp || Date.now()).toLocaleTimeString(),
          isEmergency: true,
        };

        if (existingIndex > -1) {
          const newSharers = [...prev];
          newSharers[existingIndex] = updatedItem;
          return newSharers;
        } else {
          return [updatedItem, ...prev];
        }
      });
    });

    // Real-time SOS alert listener
    listenForAlerts((newAlert) => {
      console.log("Admin received new SOS alert:", newAlert);
      if (newAlert.lat && newAlert.lng) {
        const newIncident = {
          id: newAlert._id || newAlert.id,
          name: newAlert.victimName || "EMERGENCY SOS USER",
          location: newAlert.address || `GPS: ${newAlert.lat}, ${newAlert.lng}`,
          since: "JUST NOW (SOS)",
          lat: Number(newAlert.lat),
          lng: Number(newAlert.lng),
          status: "EMERGENCY SOS",
          timestamp: new Date().toLocaleTimeString(),
          isEmergency: true,
        };

        setActiveSharers((prev) => [
          newIncident,
          ...prev.filter((u) => u.id !== newAlert._id && u.id !== newAlert.id)
        ]);

        setSelectedIncident(newIncident);
      }
    });

  }, []);

  const defaultCenter = selectedIncident || activeSharers[0] || { lat: 27.7172, lng: 85.3240 };

  const markers = activeSharers.map((s) => ({
    id: s.id,
    lat: s.lat,
    lng: s.lng,
    title: s.name,
    details: `${s.location} • ${s.timestamp}`,
    status: s.status,
    isEmergency: s.isEmergency,
  }));

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#28150a] rounded-3xl p-6 border border-[#3d2212] flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <h3 className="text-base font-extrabold text-white">
              Command Dispatch Live Satellite Map
            </h3>
          </div>
          <p className="text-xs text-[#cb9d75]/70 mt-1">
            Real-time interactive tactical map tracking all active SOS distress calls & GPS broadcasts.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-emerald-400 bg-emerald-950/60 px-3.5 py-1.5 rounded-xl border border-emerald-800 flex items-center gap-1.5 shadow-sm">
            <Radio className="w-3.5 h-3.5 animate-pulse" /> {activeSharers.length} Active Incident{activeSharers.length === 1 ? '' : 's'}
          </span>
        </div>
      </div>

      {/* Interactive Map */}
      <div className="space-y-2">
        <InteractiveMap
          lat={defaultCenter.lat}
          lng={defaultCenter.lng}
          zoom={14}
          title={defaultCenter.name || "Incident Location"}
          subtitle={defaultCenter.location}
          markers={markers}
          height="480px"
          isEmergency={defaultCenter.isEmergency}
        />
      </div>

      {/* Active Sharers List & Incident Triage */}
      <div className="bg-[#28150a] rounded-3xl p-6 border border-[#3d2212] space-y-4">
        <div className="flex items-center justify-between border-b border-[#3d2212] pb-3">
          <h4 className="text-sm font-extrabold text-white flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-red-500" /> Active Emergency Broadcasters & GPS Feeds
          </h4>
          <span className="text-xs text-[#cb9d75]/60 font-mono">
            WebSocket Live Sync
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {activeSharers.map((u) => {
            const isEmergency = u.isEmergency || u.status?.includes("SOS");
            const isSelected = selectedIncident?.id === u.id;

            return (
              <div
                key={u.id}
                onClick={() => setSelectedIncident(u)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                  isSelected
                    ? "bg-[#381b05] border-[#cb9d75] shadow-lg shadow-[#9e6133]/20"
                    : isEmergency
                    ? "bg-red-950/40 border-red-800/80 hover:border-red-600"
                    : "bg-[#1a0c05] border-[#3d2212] hover:border-[#9e6133]"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-white shrink-0 border ${
                        isEmergency
                          ? "bg-red-700 border-red-500 shadow-md shadow-red-900/50"
                          : "bg-[#3d2212] border-[#522f18]"
                      }`}
                    >
                      {isEmergency ? <ShieldAlert className="w-5 h-5 text-white animate-pulse" /> : u.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-bold text-white text-xs flex items-center gap-1.5">
                        {u.name}
                        <span
                          className={`text-[9px] uppercase font-black px-2 py-0.5 rounded-full ${
                            isEmergency
                              ? "bg-red-900/90 text-red-200 border border-red-700"
                              : "bg-emerald-950 text-emerald-300 border border-emerald-800"
                          }`}
                        >
                          {u.status}
                        </span>
                      </div>
                      <div className="text-[#cb9d75]/80 text-[11px] mt-0.5 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-red-400 shrink-0" /> {u.location}
                      </div>
                    </div>
                  </div>

                  <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1 shrink-0">
                    <Clock className="w-3 h-3" /> {u.timestamp}
                  </span>
                </div>

                <div className="flex items-center justify-between border-t border-[#3d2212] pt-2 text-xs">
                  <span className="text-[#cb9d75]/60 text-[10px] font-mono">
                    Coords: {u.lat?.toFixed(5)}, {u.lng?.toFixed(5)}
                  </span>
                  <a
                    href={`https://www.google.com/maps?q=${u.lat},${u.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-[#cb9d75] hover:text-white font-bold text-[11px] flex items-center gap-1"
                  >
                    Google Maps <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            );
          })}

          {activeSharers.length === 0 && !loading && (
            <div className="col-span-2 text-center py-10 text-[#cb9d75]/60 space-y-2">
              <MapPin className="w-8 h-8 mx-auto text-[#cb9d75]/40" />
              <p className="text-xs font-bold">No active users broadcasting live GPS currently</p>
              <p className="text-[11px] text-[#cb9d75]/50">When a user initiates SOS or shares live location, their satellite stream displays here instantly.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};