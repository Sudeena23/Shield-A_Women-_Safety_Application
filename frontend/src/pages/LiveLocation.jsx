import React, { useState, useEffect, useRef } from 'react';
import { 
  Radio, 
  MapPin, 
  Users, 
  History, 
  Copy, 
  Check, 
  Play, 
  Square, 
  Compass, 
  ExternalLink,
  Shield,
  Hospital,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import { InteractiveMap } from '../components/InteractiveMap';
import { SAFE_LOCATIONS } from '../data/mockData';
import { socket, connectSocket } from '../services/socketService';

/**
 * LiveLocation Page Component
 * Real-Time GPS Tracking with Interactive Google-like Map (Leaflet) & Socket Broadcasting
 */
export const LiveLocation = ({ guardians = [], currentUser }) => {
  const [isSharing, setIsSharing] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState('30 min');
  const [shareLinkCopied, setShareLinkCopied] = useState(false);
  const [locationError, setLocationError] = useState(null);
  
  // Real GPS State (defaulting to Kathmandu central coordinates until GPS lock)
  const [gpsPosition, setGpsPosition] = useState({
    lat: 27.7172,
    lng: 85.3240,
    accuracy: 12,
    address: 'Kathmandu, Nepal (Acquiring live GPS...)',
  });

  const watchIdRef = useRef(null);

  // Initialize GPS on load
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setGpsPosition({
            lat,
            lng,
            accuracy: pos.coords.accuracy || 10,
            address: `Live GPS: ${lat.toFixed(5)}° N, ${lng.toFixed(5)}° E`,
          });
        },
        (err) => {
          console.warn('GPS initial lock notice:', err.message);
          setLocationError('Allow location permissions for high-precision live GPS tracking.');
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    }
  }, []);

  // Handle Real-Time Location Broadcasting
  useEffect(() => {
    if (isSharing) {
      connectSocket();

      if ('geolocation' in navigator) {
        watchIdRef.current = navigator.geolocation.watchPosition(
          (pos) => {
            const lat = pos.coords.latitude;
            const lng = pos.coords.longitude;
            const accuracy = pos.coords.accuracy || 10;

            const newPos = {
              lat,
              lng,
              accuracy,
              address: `Live Stream: ${lat.toFixed(5)}° N, ${lng.toFixed(5)}° E`,
            };

            setGpsPosition(newPos);

            // Broadcast to backend & connected emergency monitors via Socket.io
            socket.emit('share-location', {
              userId: currentUser?.id || currentUser?._id || 'guest-user',
              userName: currentUser?.name || 'Anonymous User',
              lat,
              lng,
              accuracy,
              timestamp: new Date().toISOString(),
            });
          },
          (err) => {
            console.error('WatchPosition error:', err);
          },
          { enableHighAccuracy: true, maximumAge: 3000 }
        );
      }
    } else {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    }

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [isSharing, currentUser]);

  const [history, setHistory] = useState([
    {
      id: 'lh-1',
      date: 'Today, 2:45 PM',
      duration: '30 min',
      recipients: guardians.slice(0, 2).map((g) => `${g.name} (${g.relationship})`),
      status: 'Completed',
    },
  ]);

  const liveTrackingUrl = `https://www.google.com/maps?q=${gpsPosition.lat},${gpsPosition.lng}`;

  const handleToggleSharing = () => {
    if (!isSharing) {
      setIsSharing(true);
      const newHistoryItem = {
        id: `lh-${Date.now()}`,
        date: 'Just now (Active Session)',
        duration: selectedDuration,
        recipients: guardians.map((g) => `${g.name} (${g.relationship})`),
        status: 'Active',
      };
      setHistory([newHistoryItem, ...history]);
    } else {
      setIsSharing(false);
      setHistory((prev) =>
        prev.map((item, index) =>
          index === 0 && item.status === 'Active' ? { ...item, status: 'Completed' } : item
        )
      );
    }
  };

  const copyShareLink = () => {
    navigator.clipboard.writeText(liveTrackingUrl);
    setShareLinkCopied(true);
    setTimeout(() => setShareLinkCopied(false), 2500);
  };

  // Convert safe locations into markers
  const mapMarkers = [
    {
      id: 'user-current',
      lat: gpsPosition.lat,
      lng: gpsPosition.lng,
      title: currentUser?.name ? `${currentUser.name}'s Live Location` : 'Your Live Location',
      details: gpsPosition.address,
      status: isSharing ? 'Broadcasting Live' : 'Active GPS',
      isEmergency: isSharing,
    },
    ...SAFE_LOCATIONS.map((loc) => ({
      id: loc.id,
      lat: loc.lat,
      lng: loc.lng,
      title: loc.name,
      details: `${loc.type} • Emergency line: ${loc.phone || '100'}`,
      status: loc.type,
      isEmergency: false,
    })),
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-200">
      
      {/* Page Header */}
      <div className="bg-gradient-to-r from-[#2d180c] via-[#3d2517] to-[#2d180c] text-white rounded-3xl p-6 sm:p-8 border border-[#4a2b18] shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider bg-[#f7f0e6] text-[#814a27] border border-[#eee0ce] px-3 py-1 rounded-full w-fit mb-2">
            <Radio className="w-3.5 h-3.5 animate-pulse text-[#9e6133]" /> Live GPS Tracking & Navigation Map
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Real-Time Live Location Broadcast
          </h1>
          <p className="text-xs text-[#eee0ce]/80 mt-1 max-w-xl">
            Continuous satellite GPS broadcast. Share Google Maps encrypted tracking links with your trusted guardians during late transit.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <a
            href={liveTrackingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#1e1008] hover:bg-[#381b05] text-[#cb9d75] border border-[#522f18] px-4 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-colors shadow-md"
          >
            <ExternalLink className="w-4 h-4" /> Open in Google Maps
          </a>
        </div>
      </div>

      {locationError && (
        <div className="bg-amber-50 border border-amber-200 text-amber-900 p-4 rounded-2xl text-xs font-semibold flex items-center gap-3">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>{locationError}</span>
        </div>
      )}

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Interactive Map & Broadcast Engine */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Interactive Map Component (Leaflet / Google Maps Style) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-extrabold text-[#2d180c] flex items-center gap-2">
                <Compass className="w-5 h-5 text-[#9e6133]" /> Interactive Satellite Navigation Map
              </h2>
              <span className="text-xs font-bold text-[#814a27] bg-[#f7f0e6] px-2.5 py-1 rounded-lg border border-[#eee0ce]">
                {SAFE_LOCATIONS.length} Safe Zones Nearby
              </span>
            </div>

            <InteractiveMap
              lat={gpsPosition.lat}
              lng={gpsPosition.lng}
              accuracy={gpsPosition.accuracy}
              zoom={15}
              title={currentUser?.name ? `${currentUser.name} (You)` : 'You (Live Location)'}
              subtitle={gpsPosition.address}
              markers={mapMarkers}
              height="440px"
              isEmergency={isSharing}
            />
          </div>

          {/* Broadcast Control & Telemetry Panel */}
          <div className="bg-[#2d180c] rounded-3xl p-6 text-white shadow-xl border border-[#4a2b18] space-y-5">
            <div className="flex items-center justify-between border-b border-[#4a2b18] pb-4">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-2xl ${isSharing ? 'bg-emerald-500/20 text-emerald-400' : 'bg-[#4a2b18] text-[#cb9d75]'}`}>
                  <Radio className={`w-5 h-5 ${isSharing ? 'animate-pulse' : ''}`} />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-white">Broadcast Transmitter Status</h3>
                  <p className="text-xs text-[#eee0ce]/70 mt-0.5">
                    Engine: <strong className={isSharing ? 'text-emerald-400' : 'text-[#cb9d75]'}>{isSharing ? 'LIVE BROADCAST ACTIVE' : 'Standby Mode'}</strong>
                  </p>
                </div>
              </div>

              {isSharing && (
                <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-950 text-emerald-400 px-3 py-1 rounded-full border border-emerald-800 flex items-center gap-1.5 shadow-lg">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" /> Live Socket Sync
                </span>
              )}
            </div>

            {/* Sharing Duration Picker */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-[#cb9d75] uppercase tracking-wider">
                Broadcast Duration
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {['15 min', '30 min', '1 hr', 'Until Stopped'].map((dur) => (
                  <button
                    key={dur}
                    disabled={isSharing}
                    onClick={() => setSelectedDuration(dur)}
                    className={`py-2.5 px-3 rounded-xl text-xs font-extrabold transition-all border ${
                      selectedDuration === dur
                        ? 'bg-[#9e6133] border-[#cb9d75] text-white shadow-md'
                        : 'bg-[#3d2517] border-[#683c22] text-[#eee0ce] hover:bg-[#4a2b18]'
                    } ${isSharing ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    {dur}
                  </button>
                ))}
              </div>
            </div>

            {/* Action Button */}
            <button
              type="button"
              onClick={handleToggleSharing}
              className={`w-full py-3.5 px-6 rounded-2xl font-black text-xs tracking-wider uppercase shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99] ${
                isSharing
                  ? 'bg-red-700 hover:bg-red-800 text-white shadow-red-900/40'
                  : 'bg-[#9e6133] hover:bg-[#814a27] text-white shadow-[#9e6133]/40'
              }`}
            >
              {isSharing ? (
                <>
                  <Square className="w-4 h-4 fill-white" /> Stop Live Location Broadcast
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-white" /> Start Live Location Broadcast
                </>
              )}
            </button>

            {/* Shareable Google Maps Link */}
            <div className="bg-[#1e1008] p-3.5 rounded-2xl border border-[#4a2b18] flex items-center justify-between gap-3 text-xs">
              <div className="truncate text-[#cb9d75] font-mono text-[11px]">
                {liveTrackingUrl}
              </div>
              <button
                type="button"
                onClick={copyShareLink}
                className="bg-[#9e6133] hover:bg-[#814a27] text-white px-3 py-1.5 rounded-xl shrink-0 flex items-center gap-1.5 font-bold text-xs cursor-pointer shadow-sm"
              >
                {shareLinkCopied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{shareLinkCopied ? 'Link Copied!' : 'Copy Link'}</span>
              </button>
            </div>
          </div>

        </div>

        {/* Right Column: Receiving Guardians & Safety Zone Directory */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Active Guardians Card */}
          <div className="bg-white rounded-3xl p-6 border border-[#eee0ce] shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#f7f0e6] pb-3">
              <h3 className="text-sm font-extrabold text-[#2d180c] flex items-center gap-2">
                <Users className="w-4 h-4 text-[#9e6133]" />
                Receiving Guardians ({guardians.length})
              </h3>
            </div>

            {guardians.length === 0 ? (
              <div className="text-center py-6 text-xs text-[#814a27]/70">
                No emergency guardians configured. Add guardians in the <strong>My Guardians</strong> tab.
              </div>
            ) : (
              <div className="space-y-2.5">
                {guardians.map((g) => (
                  <div
                    key={g.id || g._id}
                    className="flex items-center justify-between p-3 rounded-2xl bg-[#fdfbf7] border border-[#eee0ce] text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-xl ${g.avatarBg || 'bg-[#9e6133]'} text-white font-extrabold flex items-center justify-center text-xs shadow-xs shrink-0`}>
                        {g.name?.charAt(0) || 'G'}
                      </div>
                      <div>
                        <span className="font-extrabold text-[#2d180c] block">{g.name}</span>
                        <span className="text-[#814a27]/70 text-[10px]">{g.relationship} • {g.phone}</span>
                      </div>
                    </div>

                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                      isSharing ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-[#f7f0e6] text-[#814a27]'
                    }`}>
                      {isSharing ? 'Receiving GPS' : 'Standby'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Nearby Safe Stations List */}
          <div className="bg-white rounded-3xl p-6 border border-[#eee0ce] shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#f7f0e6] pb-3">
              <h3 className="text-sm font-extrabold text-[#2d180c] flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#9e6133]" />
                Nearby Emergency Safe Zones
              </h3>
            </div>

            <div className="space-y-2.5">
              {SAFE_LOCATIONS.map((loc) => (
                <div
                  key={loc.id}
                  className="p-3 bg-[#fdfbf7] rounded-2xl border border-[#eee0ce] text-xs flex items-center justify-between gap-3 hover:bg-[#f7f0e6] transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`p-2 rounded-xl text-white font-bold shrink-0 ${loc.type === 'Police' ? 'bg-blue-600' : 'bg-rose-600'}`}>
                      {loc.type === 'Police' ? <Shield className="w-3.5 h-3.5" /> : <Hospital className="w-3.5 h-3.5" />}
                    </div>
                    <div>
                      <div className="font-extrabold text-[#2d180c]">{loc.name}</div>
                      <div className="text-[10px] text-[#814a27]/70 font-medium">{loc.address}</div>
                    </div>
                  </div>

                  <a
                    href={`https://www.google.com/maps?q=${loc.lat},${loc.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 text-[#814a27] hover:text-[#2d180c] hover:bg-[#eee0ce] rounded-lg transition-colors shrink-0"
                    title="Directions"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              ))}
            </div>
          </div>

          {/* Session History List */}
          <div className="bg-white rounded-3xl p-6 border border-[#eee0ce] shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#f7f0e6] pb-3">
              <h3 className="text-sm font-extrabold text-[#2d180c] flex items-center gap-2">
                <History className="w-4 h-4 text-[#9e6133]" />
                Session History
              </h3>
            </div>

            <div className="space-y-2.5">
              {history.map((h) => (
                <div key={h.id} className="p-3 bg-[#fdfbf7] rounded-2xl border border-[#eee0ce] text-xs space-y-1">
                  <div className="flex items-center justify-between font-extrabold text-[#2d180c]">
                    <span>{h.date}</span>
                    <span className={`text-[10px] uppercase font-black px-2 py-0.5 rounded-full ${
                      h.status === 'Active'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-[#f7f0e6] text-[#814a27]'
                    }`}>
                      {h.status}
                    </span>
                  </div>
                  <div className="text-[#814a27]/70 text-[10px]">Duration: {h.duration} • Shared with {h.recipients.length} contacts</div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
