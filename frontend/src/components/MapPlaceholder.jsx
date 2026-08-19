import React, { useState } from 'react';
import {
  MapPin,
  Shield,
  HeartPulse,
  Navigation,
  Phone,
  Search,
  Filter,
  Compass,
  ZoomIn,
  ZoomOut,
  CheckCircle2,
  Star,
  Locate,
  Layers,
  List,
  Map as MapIcon,
  Crosshair,
  ExternalLink,
  ShieldAlert,
  Clock
} from 'lucide-react';

export const MapPlaceholder = ({
  locations = [],
  selectedCategory = 'All',
  onCategorySelect,
  searchQuery = '',
  onSearchChange,
}) => {
  const [activeLocation, setActiveLocation] = useState(locations[0] || null);
  const [zoom, setZoom] = useState(14);
  const [currentFilter, setCurrentFilter] = useState(selectedCategory);
  const [viewMode, setViewMode] = useState('map'); // 'map' or 'list'
  const [mapTheme, setMapTheme] = useState('radar'); // 'radar' or 'satellite'
  
  // Real Geolocation State
  const [userCoords, setUserCoords] = useState({
    lat: 27.7128,
    lng: 85.3175,
    accuracy: 3,
    address: 'Durbar Marg, Kathmandu, Nepal',
    isRealLocation: false,
  });
  const [isLocating, setIsLocating] = useState(false);
  const [locateError, setLocateError] = useState(null);

  const handleFetchLocation = () => {
    setIsLocating(true);
    setLocateError(null);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude, accuracy } = position.coords;
          setUserCoords({
            lat: Number(latitude.toFixed(4)),
            lng: Number(longitude.toFixed(4)),
            accuracy: Math.round(accuracy) || 5,
            address: `Live Location (${latitude.toFixed(4)}° N, ${longitude.toFixed(4)}° E)`,
            isRealLocation: true,
          });
          setIsLocating(false);
        },
        (error) => {
          console.warn('Geolocation warning:', error.message);
          setLocateError('GPS permission request pending or unavailable. Using standard location coordinates.');
          setIsLocating(false);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      setLocateError('Geolocation API is not supported by your browser.');
      setIsLocating(false);
    }
  };

  const handleFilterClick = (cat) => {
    setCurrentFilter(cat);
    if (onCategorySelect) {
      onCategorySelect(cat);
    }
  };

  const filteredLocations = locations.filter((loc) => {
    const matchesCategory = currentFilter === 'All' || loc.category === currentFilter;
    const matchesSearch =
      searchQuery === '' ||
      loc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loc.address.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getPinColor = (category) => {
    switch (category) {
      case 'Police':
        return 'bg-blue-600 text-white ring-blue-300';
      case 'Hospital':
        return 'bg-red-600 text-white ring-red-300';
      case 'SafeZone':
        return 'bg-emerald-600 text-white ring-emerald-300';
      default:
        return 'bg-amber-600 text-white ring-amber-300';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Police':
        return <Shield className="w-4 h-4" />;
      case 'Hospital':
        return <HeartPulse className="w-4 h-4" />;
      case 'SafeZone':
        return <CheckCircle2 className="w-4 h-4" />;
      default:
        return <MapPin className="w-4 h-4" />;
    }
  };

  // Find nearest Police & Hospital
  const nearestPolice = locations.find((l) => l.category === 'Police');
  const nearestHospital = locations.find((l) => l.category === 'Hospital');

  return (
    <div className="bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-800 flex flex-col relative">
      
      {/* Live GPS Coordinates Header Telemetry Bar */}
      <div className="bg-[#1e1008] border-b border-[#4a2b18] px-4 py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 text-xs">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-[#3d2517] text-[#cb9d75] border border-[#683c22]">
            <Crosshair className={`w-4 h-4 ${isLocating ? 'animate-spin text-amber-400' : 'text-[#cb9d75]'}`} />
          </div>
          <div>
            <div className="font-extrabold text-white flex items-center gap-2 flex-wrap">
              <span>GPS Telemetry:</span>
              <span className="font-mono text-emerald-400 font-bold bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/80">
                {userCoords.lat.toFixed(4)}° N, {userCoords.lng.toFixed(4)}° E
              </span>
              {userCoords.isRealLocation && (
                <span className="text-[10px] bg-blue-900 text-blue-200 px-2 py-0.5 rounded-full font-bold">
                  Verified Device GPS
                </span>
              )}
            </div>
            <p className="text-[11px] text-[#eee0ce]/70 font-medium">
              Location: <span className="text-white font-bold">{userCoords.address}</span> • Accuracy: ±{userCoords.accuracy}m
            </p>
          </div>
        </div>

        <button
          onClick={handleFetchLocation}
          disabled={isLocating}
          className="bg-[#9e6133] hover:bg-[#814a27] text-white font-extrabold px-3.5 py-1.5 rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md cursor-pointer disabled:opacity-50 shrink-0 self-end sm:self-auto"
        >
          <Locate className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
          <span>{isLocating ? 'Acquiring Signal...' : 'Recalibrate GPS'}</span>
        </button>
      </div>

      {locateError && (
        <div className="bg-amber-950/90 text-amber-200 text-xs px-4 py-2 border-b border-amber-800/80 font-medium flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{locateError}</span>
        </div>
      )}

      {/* Top Filter Bar & Search */}
      <div className="bg-slate-900/90 backdrop-blur-md border-b border-slate-800 p-4 flex flex-col sm:flex-row items-center justify-between gap-3 z-20">
        
        {/* Search Bar */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
            placeholder="Search police, ERs, safe zones..."
            className="w-full bg-slate-800 border border-slate-700 text-slate-100 text-xs rounded-xl pl-9 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#9e6133] placeholder-slate-400"
          />
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
          {['All', 'Police', 'Hospital', 'SafeZone'].map((cat) => (
            <button
              key={cat}
              onClick={() => handleFilterClick(cat)}
              className={`text-xs font-extrabold px-3 py-2 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                currentFilter === cat
                  ? 'bg-[#9e6133] text-white shadow-md shadow-[#9e6133]/30'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {cat === 'All' && <Filter className="w-3.5 h-3.5" />}
              {cat === 'Police' && <Shield className="w-3.5 h-3.5 text-blue-400" />}
              {cat === 'Hospital' && <HeartPulse className="w-3.5 h-3.5 text-red-400" />}
              {cat === 'SafeZone' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
              {cat === 'SafeZone' ? 'Safe Zones' : cat}
            </button>
          ))}
        </div>

        {/* View Mode Toggle Button */}
        <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-xl border border-slate-700 shrink-0">
          <button
            onClick={() => setViewMode('map')}
            className={`p-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
              viewMode === 'map' ? 'bg-[#9e6133] text-white' : 'text-slate-400 hover:text-white'
            }`}
            title="Map View"
          >
            <MapIcon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Map</span>
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
              viewMode === 'list' ? 'bg-[#9e6133] text-white' : 'text-slate-400 hover:text-white'
            }`}
            title="List View"
          >
            <List className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">List ({filteredLocations.length})</span>
          </button>
        </div>

      </div>

      {/* MAIN VIEW AREA */}
      {viewMode === 'map' ? (
        /* Interactive Map Canvas Container */
        <div className="relative w-full h-[460px] md:h-[520px] bg-slate-950 overflow-hidden flex items-center justify-center select-none">
          
          {/* Vector Grid / Street Pattern Styling */}
          <div
            className={`absolute inset-0 opacity-25 ${
              mapTheme === 'satellite'
                ? 'bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px]'
                : 'bg-[radial-gradient(#9e6133_1px,transparent_1px)] [background-size:24px_24px]'
            }`}
            style={{ transform: `scale(${zoom / 14})` }}
          />

          {/* Simulated Road Lines SVG with route line to active location */}
          <svg className="absolute inset-0 w-full h-full opacity-30 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
            <path d="M 0 100 Q 300 120 600 80 T 1200 150" stroke="#475569" strokeWidth="12" fill="none" />
            <path d="M 200 0 Q 180 300 240 600" stroke="#334155" strokeWidth="16" fill="none" />
            <path d="M 0 350 C 400 380 700 250 1200 400" stroke="#475569" strokeWidth="10" fill="none" />
            <circle cx="50%" cy="50%" r="180" stroke="#9e6133" strokeWidth="1" strokeDasharray="4 4" fill="none" opacity="0.4" />
          </svg>

          {/* Radar Sweep Pulse Animation */}
          <div className="absolute w-80 h-80 rounded-full border border-[#9e6133]/30 bg-[#9e6133]/5 animate-pulse pointer-events-none" />

          {/* User Current Position Pin */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center group cursor-pointer">
            <div className="relative">
              <span className="absolute -inset-2 rounded-full bg-[#9e6133]/40 animate-ping" />
              <div className="w-11 h-11 rounded-full bg-[#9e6133] text-white font-extrabold flex items-center justify-center border-2 border-white shadow-xl shadow-[#9e6133]/50">
                <Compass className="w-6 h-6 animate-spin" style={{ animationDuration: '10s' }} />
              </div>
            </div>
            <span className="bg-[#1e1008] text-white text-[10px] font-black px-2.5 py-0.5 rounded-full mt-1 border border-[#683c22] shadow-md flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              You Are Here
            </span>
          </div>

          {/* Map Pins */}
          {filteredLocations.map((loc, idx) => {
            const xOffsets = [-180, 160, -220, 190, -110, 240, -150, 120];
            const yOffsets = [-130, -120, 110, 130, -190, 170, 180, -180];
            const x = xOffsets[idx % xOffsets.length];
            const y = yOffsets[idx % yOffsets.length];
            const isSelected = activeLocation?.id === loc.id;

            return (
              <div
                key={loc.id}
                onClick={() => setActiveLocation(loc)}
                style={{
                  transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
                }}
                className={`absolute top-1/2 left-1/2 z-10 cursor-pointer group transition-all duration-300 ${
                  isSelected ? 'scale-125 z-30' : 'hover:scale-110'
                }`}
              >
                <div className="relative flex flex-col items-center">
                  <div
                    className={`p-2.5 rounded-full shadow-lg border-2 border-white ring-4 transition-all ${getPinColor(
                      loc.category
                    )}`}
                  >
                    {getCategoryIcon(loc.category)}
                  </div>

                  {/* Mini Pin Label */}
                  <div
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md mt-1 shadow-md whitespace-nowrap transition-all ${
                      isSelected
                        ? 'bg-[#9e6133] text-white font-extrabold ring-2 ring-[#cb9d75]'
                        : 'bg-slate-900/90 text-slate-200 border border-slate-700'
                    }`}
                  >
                    {loc.name.split(' ')[0]} ({loc.distance.split(' ')[0]})
                  </div>
                </div>
              </div>
            );
          })}

          {/* Map Controls Floating Overlay */}
          <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
            <button
              onClick={() => handleFetchLocation()}
              className="p-2.5 bg-slate-900/90 hover:bg-slate-800 text-amber-400 rounded-xl border border-slate-700 shadow-md cursor-pointer"
              title="Center on My Location"
            >
              <Locate className="w-4 h-4" />
            </button>
            <button
              onClick={() => setZoom((z) => Math.min(z + 1, 18))}
              className="p-2.5 bg-slate-900/90 hover:bg-slate-800 text-slate-200 rounded-xl border border-slate-700 shadow-md cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={() => setZoom((z) => Math.max(z - 1, 10))}
              className="p-2.5 bg-slate-900/90 hover:bg-slate-800 text-slate-200 rounded-xl border border-slate-700 shadow-md cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={() => setMapTheme(mapTheme === 'radar' ? 'satellite' : 'radar')}
              className="p-2.5 bg-slate-900/90 hover:bg-slate-800 text-slate-200 rounded-xl border border-slate-700 shadow-md cursor-pointer"
              title="Toggle Map Grid Mode"
            >
              <Layers className="w-4 h-4" />
            </button>
          </div>

          {/* Bottom Left Map Legend */}
          <div className="absolute bottom-4 left-4 z-20 bg-slate-900/90 backdrop-blur-md p-3 rounded-2xl border border-slate-800 text-slate-300 text-xs space-y-1.5 shadow-xl hidden sm:block">
            <div className="font-extrabold text-[11px] text-white uppercase tracking-wider mb-1">
              Map Legend
            </div>
            <div className="flex items-center gap-2 text-[11px]">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
              <span>Police Station ({locations.filter(l => l.category==='Police').length})</span>
            </div>
            <div className="flex items-center gap-2 text-[11px]">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
              <span>Hospital ER ({locations.filter(l => l.category==='Hospital').length})</span>
            </div>
            <div className="flex items-center gap-2 text-[11px]">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>Verified Safe Zone ({locations.filter(l => l.category==='SafeZone').length})</span>
            </div>
          </div>
        </div>
      ) : (
        /* Nearby Locations List View */
        <div className="p-4 sm:p-6 bg-slate-950 space-y-3 max-h-[520px] overflow-y-auto">
          {filteredLocations.map((loc) => {
            const isSelected = activeLocation?.id === loc.id;
            return (
              <div
                key={loc.id}
                onClick={() => setActiveLocation(loc)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                  isSelected
                    ? 'bg-[#2d180c] border-[#9e6133] text-white shadow-lg'
                    : 'bg-slate-900 hover:bg-slate-800/80 border-slate-800 text-slate-200'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-3 rounded-xl shrink-0 ${getPinColor(loc.category)}`}>
                    {getCategoryIcon(loc.category)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm text-white">{loc.name}</span>
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                        {loc.category}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">{loc.address}</p>
                    <div className="flex items-center gap-3 mt-1.5 text-xs">
                      <span className="text-red-400 font-bold">{loc.distance}</span>
                      <span className="text-slate-400">• {loc.openHours}</span>
                      <span className="text-amber-400 font-bold flex items-center gap-1">
                        <Star className="w-3 h-3 fill-amber-400" /> {loc.rating}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                  <a
                    href={`tel:${loc.phone}`}
                    className="flex-1 sm:flex-none bg-slate-800 hover:bg-slate-700 text-white font-bold py-2 px-3 rounded-xl text-xs border border-slate-700 flex items-center justify-center gap-1"
                  >
                    <Phone className="w-3.5 h-3.5" /> Call
                  </a>
                  <a
                    href={`https://maps.google.com/?q=${encodeURIComponent(loc.name + ' ' + loc.address)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 sm:flex-none bg-[#9e6133] hover:bg-[#814a27] text-white font-bold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1 shadow-md"
                  >
                    <Navigation className="w-3.5 h-3.5" /> Navigate
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Selected Location Details Drawer */}
      {activeLocation && (
        <div className="bg-slate-900 border-t border-slate-800 p-5 text-white z-20 animate-in slide-in-from-bottom-2 duration-200">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                    activeLocation.category === 'Police'
                      ? 'bg-blue-950 text-blue-400 border border-blue-800'
                      : activeLocation.category === 'Hospital'
                      ? 'bg-red-950 text-red-400 border border-red-800'
                      : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                  }`}
                >
                  {activeLocation.category}
                </span>
                <span className="text-xs text-amber-400 font-bold flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  {activeLocation.rating} Safety Score
                </span>
                {activeLocation.verified && (
                  <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Verified Station
                  </span>
                )}
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-500" /> {activeLocation.openHours}
                </span>
              </div>

              <h3 className="text-lg md:text-xl font-extrabold text-white">
                {activeLocation.name}
              </h3>
              <p className="text-xs text-slate-400 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                {activeLocation.address} • <span className="text-red-400 font-bold">{activeLocation.distance}</span>
              </p>
            </div>

            {/* Quick Actions for Selected Location */}
            <div className="flex items-center gap-3 w-full md:w-auto">
              <a
                href={`tel:${activeLocation.phone}`}
                className="flex-1 md:flex-none bg-slate-800 hover:bg-slate-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs border border-slate-700 transition-colors flex items-center justify-center gap-1.5"
              >
                <Phone className="w-3.5 h-3.5 text-amber-400" />
                <span>{activeLocation.phone}</span>
              </a>
              <a
                href={`https://maps.google.com/?q=${encodeURIComponent(activeLocation.name + ' ' + activeLocation.address)}`}
                target="_blank"
                rel="noreferrer"
                className="flex-1 md:flex-none bg-[#9e6133] hover:bg-[#814a27] text-white font-bold py-2.5 px-4 rounded-xl text-xs shadow-md shadow-[#9e6133]/30 transition-colors flex items-center justify-center gap-1.5"
              >
                <Navigation className="w-3.5 h-3.5 fill-white" />
                <span>Get Directions</span>
                <ExternalLink className="w-3 h-3 opacity-80" />
              </a>
            </div>

          </div>
        </div>
      )}

      {/* Bottom Nearest Summary Banner */}
      <div className="bg-[#2d180c] border-t border-[#4a2b18] px-4 py-3 flex flex-wrap items-center justify-between gap-3 text-xs text-white">
        <div className="flex items-center gap-4 flex-wrap">
          {nearestPolice && (
            <div className="flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-blue-400 shrink-0" />
              <span>Nearest Police: <strong className="text-white">{nearestPolice.name.split(' ')[0]} ({nearestPolice.distance})</strong></span>
            </div>
          )}
          {nearestHospital && (
            <div className="flex items-center gap-1.5">
              <HeartPulse className="w-4 h-4 text-red-400 shrink-0" />
              <span>Nearest ER: <strong className="text-white">{nearestHospital.name.split(' ')[0]} ({nearestHospital.distance})</strong></span>
            </div>
          )}
        </div>
        <div className="text-[#cb9d75] font-extrabold flex items-center gap-1">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{locations.length} Verified Facilities Online</span>
        </div>
      </div>

    </div>
  );
};
