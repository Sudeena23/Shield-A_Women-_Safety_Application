import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import { ExternalLink, Layers, MapPin, Radio, ShieldAlert } from "lucide-react";

const TILE_SERVERS = {
  streets: {
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>',
    maxZoom: 19,
  },
  satellite: {
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: "Tiles &copy; Esri",
    maxZoom: 18,
  },
  dark: {
    url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    attribution: "&copy; CARTO",
    maxZoom: 19,
  },
};

export const SOSMiniMap = ({
  latitude = 27.7172,
  longitude = 85.324,
  locationName = "Emergency Location",
  victimName = "User",
  status = "Active",
  height = "160px",
  zoom = 15,
  showLayerToggle = true,
  className = "",
}) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const layerGroupRef = useRef(null);
  const [layerType, setLayerType] = useState("streets");

  const validLat = Number(latitude) || 27.7172;
  const validLng = Number(longitude) || 85.324;

  const isAlert = status === "Active";

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const map = L.map(mapContainerRef.current, {
      center: [validLat, validLng],
      zoom: zoom,
      zoomControl: false,
      attributionControl: false,
      scrollWheelZoom: false,
    });

    // Tile Layer
    const tileConfig = TILE_SERVERS[layerType] || TILE_SERVERS.streets;
    L.tileLayer(tileConfig.url, {
      maxZoom: tileConfig.maxZoom,
    }).addTo(map);

    const layerGroup = L.layerGroup().addTo(map);
    layerGroupRef.current = layerGroup;

    // Custom pulsing SOS Pin
    const beaconColor = isAlert ? "#ef4444" : "#10b981";
    const beaconHtml = `
      <div style="position: relative; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center;">
        <span style="position: absolute; width: 28px; height: 28px; border-radius: 9999px; background-color: ${beaconColor}; opacity: 0.75; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></span>
        <span style="position: relative; width: 14px; height: 14px; border-radius: 9999px; background-color: ${beaconColor}; border: 2px solid #ffffff; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.5);"></span>
      </div>
    `;

    const customIcon = L.divIcon({
      html: beaconHtml,
      className: "sos-beacon-marker",
      iconSize: [28, 28],
      iconAnchor: [14, 14],
    });

    // Marker
    const marker = L.marker([validLat, validLng], { icon: customIcon }).addTo(layerGroup);
    marker.bindPopup(`
      <div style="font-family: sans-serif; font-size: 11px; padding: 2px; color: #1a0c05;">
        <strong style="display:block; color: #9e6133;">${victimName}</strong>
        <span>${locationName}</span>
      </div>
    `);

    // Accuracy Circle
    L.circle([validLat, validLng], {
      radius: 40,
      color: beaconColor,
      fillColor: beaconColor,
      fillOpacity: 0.15,
      weight: 1.5,
    }).addTo(layerGroup);

    mapInstanceRef.current = map;

    // Trigger map redraw to avoid gray tiles
    const resizeTimer = setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    }, 250);

    return () => {
      clearTimeout(resizeTimer);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [validLat, validLng, layerType, isAlert, victimName, locationName, zoom]);

  const googleMapsUrl = `https://www.google.com/maps?q=${validLat},${validLng}`;

  return (
    <div
      className={`relative rounded-2xl overflow-hidden border border-[#3d2212] bg-[#1a0c05] shadow-inner group ${className}`}
      style={{ height }}
    >
      {/* Leaflet Map DOM Container */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Top Floating Action Bar */}
      <div className="absolute top-2 left-2 right-2 flex items-center justify-between pointer-events-none z-10">
        {/* Location Badge */}
        <div className="bg-[#1a0c05]/90 backdrop-blur-xs border border-[#3d2212] text-[#f7f0e6] px-2.5 py-1 rounded-xl text-[11px] font-bold flex items-center gap-1.5 shadow-md max-w-[70%] truncate pointer-events-auto">
          <MapPin className="w-3 h-3 text-red-500 shrink-0 animate-bounce" />
          <span className="truncate">{locationName || `${validLat.toFixed(4)}, ${validLng.toFixed(4)}`}</span>
        </div>

        {/* Quick Map Controls */}
        <div className="flex items-center gap-1.5 pointer-events-auto">
          {showLayerToggle && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setLayerType((prev) => (prev === "streets" ? "satellite" : "streets"));
              }}
              className="bg-[#1a0c05]/90 hover:bg-[#2d180c] border border-[#3d2212] text-[#cb9d75] hover:text-white p-1.5 rounded-lg text-[10px] font-bold transition shadow-md cursor-pointer"
              title={`Switch to ${layerType === "streets" ? "Satellite" : "Street"} View`}
            >
              <Layers className="w-3.5 h-3.5" />
            </button>
          )}

          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="bg-[#9e6133]/90 hover:bg-[#814a27] text-white p-1.5 rounded-lg text-[10px] font-bold transition shadow-md flex items-center gap-1 cursor-pointer"
            title="Open in Google Maps"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Bottom Coordinates Bar */}
      <div className="absolute bottom-1.5 right-2 bg-[#1a0c05]/85 backdrop-blur-xs px-2 py-0.5 rounded-md text-[9px] font-mono text-[#cb9d75]/80 border border-[#3d2212] pointer-events-none z-10">
        📍 {validLat.toFixed(4)}, {validLng.toFixed(4)}
      </div>
    </div>
  );
};
