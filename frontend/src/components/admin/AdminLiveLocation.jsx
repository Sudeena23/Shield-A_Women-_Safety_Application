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
      <div className="bg-white rounded-3xl p-6 border border-[#eee0ce] shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h3 className="text-lg font-black text-[#2d180c]">
              Command Dispatch Live Incident Map
            </h3>
          </div>
          <p className="text-xs text-[#814a27]/80 mt-1">
            Real-time tactical GPS radar tracking active distress signals and location shares.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-4 py-2 rounded-2xl border border-emerald-200 flex items-center gap-2 shadow-xs">
            <Radio className="w-4 h-4 text-emerald-600 animate-pulse" /> {activeSharers.length} Active Incident{activeSharers.length === 1 ? '' : 's'}
          </span>
        </div>
      </div>

      {/* Interactive Map */}
      <div className="bg-white rounded-3xl p-6 border border-[#eee0ce] shadow-sm space-y-3">
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

      {/* Active Sharers List */}
      <div className="bg-white rounded-3xl p-6 border border-[#eee0ce] shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-[#eee0ce] pb-3">
          <h4 className="text-sm font-black text-[#2d180c] flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-red-600" /> Active Emergency Broadcasters & GPS Streams
          </h4>
          <span className="text-xs text-[#814a27]/70 font-mono font-bold">
            Live WebSocket Sync
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {activeSharers.map((u) => {
            const isEmergency = u.isEmergency || u.status?.includes("SOS");
            const isSelected = selectedIncident?.id === u.id;

            return (
              <div
                key={u.id}
                onClick={() => setSelectedIncident(u)}
                className={`p-4 rounded-2xl border cursor-pointer flex flex-col justify-between gap-3 ${
                  isSelected
                    ? "bg-[#fdfbf7] border-[#9e6133] ring-2 ring-[#9e6133]/20 shadow-md"
                    : isEmergency
                    ? "bg-red-50/50 border-red-200"
                    : "bg-[#fdfbf7] border-[#eee0ce]"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-white shrink-0 border ${
                        isEmergency
                          ? "bg-red-600 border-red-500 shadow-sm"
                          : "bg-[#9e6133] border-[#814a27]"
                      }`}
                    >
                      {isEmergency ? <ShieldAlert className="w-5 h-5 text-white animate-pulse" /> : u.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-extrabold text-[#2d180c] text-xs flex items-center gap-1.5">
                        {u.name}
                        <span
                          className={`text-[9px] uppercase font-black px-2 py-0.5 rounded-full border ${
                            isEmergency
                              ? "bg-red-100 text-red-700 border-red-300"
                              : "bg-emerald-50 text-emerald-700 border-emerald-200"
                          }`}
                        >
                          {u.status}
                        </span>
                      </div>
                      <div className="text-[#814a27]/80 text-[11px] font-medium mt-0.5 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-red-600 shrink-0" /> {u.location}
                      </div>
                    </div>
                  </div>

                  <span className="text-[10px] text-emerald-700 font-mono font-bold flex items-center gap-1 shrink-0 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    <Clock className="w-3 h-3" /> {u.timestamp}
                  </span>
                </div>

                <div className="flex items-center justify-between border-t border-[#eee0ce] pt-2 text-xs">
                  <span className="text-[#814a27]/70 text-[10px] font-mono">
                    GPS: {u.lat?.toFixed(5)}, {u.lng?.toFixed(5)}
                  </span>
                  <a
                    href={`https://www.google.com/maps?q=${u.lat},${u.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-[#9e6133] hover:text-[#814a27] font-extrabold text-[11px] flex items-center gap-1"
                  >
                    Open Google Maps <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            );
          })}

          {activeSharers.length === 0 && !loading && (
            <div className="col-span-2 text-center py-10 text-[#814a27]/70 space-y-2">
              <MapPin className="w-8 h-8 mx-auto text-[#9e6133]/50" />
              <p className="text-xs font-black text-[#2d180c]">No active GPS emergency streams right now</p>
              <p className="text-[11px] text-[#814a27]/70">When a user initiates an SOS alert or shares their live location, their coordinates track here immediately.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};