import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { 
  MapPin, 
  Layers, 
  Navigation, 
  ExternalLink, 
  Maximize2, 
  Radio, 
  ShieldAlert, 
  Compass 
} from 'lucide-react';

// Tile layer providers
const TILE_LAYERS = {
  streets: {
    name: 'Google / Streets',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19,
  },
  satellite: {
    name: 'Satellite Hybrid',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
    maxZoom: 18,
  },
  dark: {
    name: 'Tactical Dark',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
    maxZoom: 19,
  },
};

/**
 * InteractiveMap Component
 * High-performance, fully interactive map using Leaflet with Google Maps direct navigation.
 */
export const InteractiveMap = ({
  lat = 27.7172,
  lng = 85.3240,
  accuracy = 15,
  zoom = 15,
  title = 'Current Live Location',
  subtitle = '',
  markers = [], // Array of { id, lat, lng, title, details, type, status }
  height = '480px',
  isEmergency = false,
  allowLayerSwitch = true,
  className = '',
}) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const layerGroupRef = useRef(null);
  const activeTileLayerRef = useRef(null);

  const [activeLayer, setActiveLayer] = useState('streets');
  const [showLayerMenu, setShowLayerMenu] = useState(false);
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Destroy existing instance if any
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const validLat = Number(lat) || 27.7172;
    const validLng = Number(lng) || 85.3240;

    const map = L.map(mapContainerRef.current, {
      center: [validLat, validLng],
      zoom: zoom,
      zoomControl: false,
    });

    // Add zoom control at bottom-right
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Add selected tile layer
    const initialLayer = L.tileLayer(TILE_LAYERS[activeLayer].url, {
      attribution: TILE_LAYERS[activeLayer].attribution,
      maxZoom: TILE_LAYERS[activeLayer].maxZoom,
    }).addTo(map);

    activeTileLayerRef.current = initialLayer;

    // Create marker & circle layer group
    const layerGroup = L.layerGroup().addTo(map);
    layerGroupRef.current = layerGroup;
    mapInstanceRef.current = map;

    setIsMapLoaded(true);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Handle Layer Switching
  useEffect(() => {
    if (!mapInstanceRef.current || !activeTileLayerRef.current) return;

    mapInstanceRef.current.removeLayer(activeTileLayerRef.current);
    const newLayer = L.tileLayer(TILE_LAYERS[activeLayer].url, {
      attribution: TILE_LAYERS[activeLayer].attribution,
      maxZoom: TILE_LAYERS[activeLayer].maxZoom,
    }).addTo(mapInstanceRef.current);

    activeTileLayerRef.current = newLayer;
  }, [activeLayer]);

  // Update Markers & Position
  useEffect(() => {
    if (!mapInstanceRef.current || !layerGroupRef.current) return;

    const layerGroup = layerGroupRef.current;
    layerGroup.clearLayers();

    const validLat = Number(lat) || 27.7172;
    const validLng = Number(lng) || 85.3240;

    // Render multiple markers if provided
    if (markers && markers.length > 0) {
      markers.forEach((m) => {
        const mLat = Number(m.lat || m.latitude);
        const mLng = Number(m.lng || m.longitude);
        if (isNaN(mLat) || isNaN(mLng)) return;

        const isAlert = m.status === 'Active' || m.type === 'SOS Alert' || m.isEmergency;

        const iconHtml = `
          <div class="relative flex items-center justify-center">
            ${isAlert ? '<div class="absolute w-10 h-10 rounded-full bg-red-500/40 animate-ping"></div>' : ''}
            <div class="w-8 h-8 rounded-full ${isAlert ? 'bg-red-600 shadow-red-500/50' : 'bg-[#9e6133] shadow-[#9e6133]/50'} shadow-lg border-2 border-white flex items-center justify-center text-white">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/></svg>
            </div>
          </div>
        `;

        const customIcon = L.divIcon({
          html: iconHtml,
          className: 'custom-map-pin',
          iconSize: [32, 32],
          iconAnchor: [16, 16],
          popupAnchor: [0, -18],
        });

        const marker = L.marker([mLat, mLng], { icon: customIcon }).addTo(layerGroup);
        
        const popupContent = `
          <div style="font-family: sans-serif; min-width: 180px; padding: 4px;">
            <div style="font-size: 13px; font-weight: 800; color: #2d180c; margin-bottom: 2px;">
              ${m.title || m.victimName || 'Emergency Incident'}
            </div>
            <div style="font-size: 11px; color: #814a27; margin-bottom: 6px;">
              ${m.details || m.location || m.address || `${mLat.toFixed(4)}, ${mLng.toFixed(4)}`}
            </div>
            <div style="display: flex; align-items: center; justify-content: space-between; gap: 6px;">
              <span style="font-size: 10px; font-weight: 700; background: ${isAlert ? '#fee2e2' : '#f7f0e6'}; color: ${isAlert ? '#b91c1c' : '#814a27'}; padding: 2px 6px; border-radius: 6px;">
                ${m.status || 'Active'}
              </span>
              <a href="https://www.google.com/maps?q=${mLat},${mLng}" target="_blank" rel="noopener noreferrer" style="font-size: 10px; font-weight: 700; color: #9e6133; text-decoration: none;">
                Google Maps &rarr;
              </a>
            </div>
          </div>
        `;

        marker.bindPopup(popupContent);
      });

      // Fit bounds to markers if multiple
      if (markers.length > 1) {
        const bounds = L.latLngBounds(markers.map((m) => [Number(m.lat || m.latitude), Number(m.lng || m.longitude)]).filter((pt) => !isNaN(pt[0]) && !isNaN(pt[1])));
        if (bounds.isValid()) {
          mapInstanceRef.current.fitBounds(bounds, { padding: [40, 40] });
        }
      }
    } else {
      // Single primary location marker
      const markerHtml = `
        <div class="relative flex items-center justify-center">
          ${isEmergency ? '<div class="absolute w-12 h-12 rounded-full bg-red-500/40 animate-ping"></div>' : '<div class="absolute w-9 h-9 rounded-full bg-blue-500/30 animate-pulse"></div>'}
          <div class="w-8 h-8 rounded-full ${isEmergency ? 'bg-red-600' : 'bg-[#9e6133]'} shadow-xl border-2 border-white flex items-center justify-center text-white">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/></svg>
          </div>
        </div>
      `;

      const primaryIcon = L.divIcon({
        html: markerHtml,
        className: 'custom-primary-pin',
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        popupAnchor: [0, -18],
      });

      const primaryMarker = L.marker([validLat, validLng], { icon: primaryIcon }).addTo(layerGroup);

      // Add GPS Accuracy Circle
      if (accuracy && accuracy > 0) {
        L.circle([validLat, validLng], {
          radius: Math.min(accuracy, 200),
          color: isEmergency ? '#dc2626' : '#9e6133',
          fillColor: isEmergency ? '#ef4444' : '#cb9d75',
          fillOpacity: 0.15,
          weight: 1.5,
        }).addTo(layerGroup);
      }

      primaryMarker.bindPopup(`
        <div style="font-family: sans-serif; min-width: 170px;">
          <div style="font-size: 13px; font-weight: 800; color: #2d180c;">${title}</div>
          <div style="font-size: 11px; color: #6b7280; margin-top: 2px;">
            ${validLat.toFixed(5)}, ${validLng.toFixed(5)}
          </div>
          ${subtitle ? `<div style="font-size: 11px; color: #814a27; margin-top: 4px;">${subtitle}</div>` : ''}
          <div style="margin-top: 6px; padding-top: 4px; border-top: 1px solid #eee;">
            <a href="https://www.google.com/maps?q=${validLat},${validLng}" target="_blank" rel="noopener noreferrer" style="font-size: 11px; font-weight: 700; color: #9e6133; text-decoration: none;">
              Open in Google Maps &rarr;
            </a>
          </div>
        </div>
      `);

      mapInstanceRef.current.setView([validLat, validLng], mapInstanceRef.current.getZoom() || zoom);
    }
  }, [lat, lng, accuracy, markers, isEmergency, title, subtitle]);

  // Recenter Map Handler
  const handleRecenter = () => {
    if (!mapInstanceRef.current) return;
    const validLat = Number(lat) || 27.7172;
    const validLng = Number(lng) || 85.3240;
    mapInstanceRef.current.flyTo([validLat, validLng], 16, { duration: 1.2 });
  };

  const googleMapsUrl = `https://www.google.com/maps?q=${lat},${lng}`;

  return (
    <div className={`relative rounded-3xl overflow-hidden border border-[#eee0ce] shadow-md bg-[#fdfbf7] ${className}`}>
      
      {/* Top Floating Control Bar */}
      <div className="absolute top-3 left-3 right-3 z-[1000] flex items-center justify-between pointer-events-none">
        
        {/* Live GPS Telemetry Badge */}
        <div className="bg-white/90 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-[#eee0ce] shadow-sm flex items-center gap-2 pointer-events-auto">
          <span className={`w-2.5 h-2.5 rounded-full ${isEmergency ? 'bg-red-600 animate-ping' : 'bg-emerald-500 animate-pulse'}`} />
          <div className="text-xs font-black text-[#2d180c] flex items-center gap-1.5">
            <span className="text-[#814a27] font-semibold">{isEmergency ? 'EMERGENCY GPS' : 'LIVE SATELLITE'}:</span>
            <span className="font-mono">{Number(lat).toFixed(4)}° N, {Number(lng).toFixed(4)}° E</span>
          </div>
        </div>

        {/* Quick Action Tools */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Layer Selector */}
          {allowLayerSwitch && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowLayerMenu(!showLayerMenu)}
                className="bg-white/90 hover:bg-white text-[#2d180c] px-3 py-1.5 rounded-xl border border-[#eee0ce] shadow-sm text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                title="Change Map Style"
              >
                <Layers className="w-3.5 h-3.5 text-[#9e6133]" />
                <span className="hidden sm:inline">{TILE_LAYERS[activeLayer].name}</span>
              </button>

              {showLayerMenu && (
                <div className="absolute right-0 mt-1 w-44 bg-white rounded-2xl border border-[#eee0ce] shadow-xl p-1.5 space-y-1 z-50 animate-in fade-in zoom-in-95">
                  {Object.entries(TILE_LAYERS).map(([key, item]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => {
                        setActiveLayer(key);
                        setShowLayerMenu(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-colors flex items-center justify-between cursor-pointer ${
                        activeLayer === key
                          ? 'bg-[#9e6133] text-white'
                          : 'text-[#2d180c] hover:bg-[#f7f0e6]'
                      }`}
                    >
                      <span>{item.name}</span>
                      {activeLayer === key && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Recenter Button */}
          <button
            type="button"
            onClick={handleRecenter}
            className="bg-white/90 hover:bg-white text-[#2d180c] p-2 rounded-xl border border-[#eee0ce] shadow-sm transition-all cursor-pointer hover:text-[#9e6133]"
            title="Recenter Map to Device Location"
          >
            <Compass className="w-4 h-4 text-[#9e6133]" />
          </button>

          {/* Direct Google Maps Link */}
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#2d180c] hover:bg-[#4a2b18] text-white px-3 py-1.5 rounded-xl shadow-sm text-xs font-bold flex items-center gap-1.5 transition-all"
            title="Open in Google Maps for Driving Directions"
          >
            <ExternalLink className="w-3.5 h-3.5 text-[#cb9d75]" />
            <span className="hidden sm:inline">Google Maps</span>
          </a>
        </div>
      </div>

      {/* Map Canvas */}
      <div
        ref={mapContainerRef}
        style={{ height: height, width: '100%' }}
        className="z-0 relative"
      />

      {/* Bottom Status Ribbon */}
      <div className="bg-white/95 border-t border-[#eee0ce] px-4 py-2 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2 text-[#814a27]">
          <Navigation className="w-3.5 h-3.5 text-[#9e6133]" />
          <span className="font-medium text-[11px]">
            Accuracy Radius: <strong className="text-[#2d180c]">±{Math.round(accuracy || 15)}m</strong> • High Precision GPS
          </span>
        </div>
        <div className="text-[11px] text-[#814a27]/70 font-mono">
          Interactive Zoom & Drag Enabled
        </div>
      </div>
    </div>
  );
};
