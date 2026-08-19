import React, { useState } from 'react';
import { Radio, MapPin, Users, History, Copy, Check, Play, Square } from 'lucide-react';
import { LOCATION_SHARE_HISTORY, SAFE_LOCATIONS } from '../data/mockData';
import { MapPlaceholder } from '../components/MapPlaceholder';

/**
 * LiveLocation Page Component
 * Card showing sharing status with a map placeholder area as required.
 */
export const LiveLocation = ({ guardians = [] }) => {
  const [isSharing, setIsSharing] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState('30 min');
  const [shareLinkCopied, setShareLinkCopied] = useState(false);
  const [history, setHistory] = useState(LOCATION_SHARE_HISTORY);

  const mockLink = 'https://shield.app/track/session-8921a4f0';

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
    navigator.clipboard.writeText(mockLink);
    setShareLinkCopied(true);
    setTimeout(() => setShareLinkCopied(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Page Header */}
      <div className="border-b border-[#eee0ce] pb-6">
        <div className="flex items-center gap-2 text-xs font-bold text-[#814a27] uppercase tracking-widest bg-[#f7f0e6] px-3.5 py-1 rounded-full border border-[#eee0ce] w-fit mb-2">
          <Radio className="w-3.5 h-3.5 animate-pulse text-[#9e6133]" /> Real-Time GPS Broadcast
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-[#2d180c] tracking-tight">
          Live Location Sharing
        </h1>
        <p className="text-sm text-[#814a27]/80 mt-1">
          Stream your live GPS movement on an encrypted map link with designated guardians.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Sharing Status Card & Control */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Sharing Status Card */}
          <div className="bg-[#2d180c] rounded-3xl p-6 text-white shadow-xl border border-[#4a2b18] space-y-6 relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-[#4a2b18] pb-4">
              <div className="flex items-center gap-2.5">
                <div className={`p-2.5 rounded-xl ${isSharing ? 'bg-emerald-500/20 text-emerald-400' : 'bg-[#4a2b18] text-[#eee0ce]'}`}>
                  <Radio className={`w-5 h-5 ${isSharing ? 'animate-pulse' : ''}`} />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">Live Location Sharing Status</h3>
                  <p className="text-xs text-[#eee0ce]/70">
                    Status: <span className={isSharing ? 'text-emerald-400 font-bold' : 'text-[#eee0ce]/60'}>
                      {isSharing ? 'BROADCASTING LIVE' : 'Inactive'}
                    </span>
                  </p>
                </div>
              </div>

              {isSharing && (
                <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-950 text-emerald-400 px-3 py-1 rounded-full border border-emerald-800 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" /> Live
                </span>
              )}
            </div>

            {/* Address Telemetry Display */}
            <div className="bg-[#1e1008] rounded-2xl p-4 border border-[#4a2b18] space-y-1">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#cb9d75]">
                <MapPin className="w-4 h-4 text-[#9e6133]" />
                Current GPS Telemetry
              </div>
              <div className="text-base font-extrabold text-white">Durbar Marg, Kathmandu, Nepal</div>
              <div className="text-xs font-mono text-[#eee0ce]/60">Accuracy: ± 3 meters • Coordinates: 27.7128° N, 85.3175° E</div>
            </div>

            {/* Duration Selector */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-[#cb9d75] uppercase tracking-wider">
                Sharing Duration
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

            {/* Start / Stop Toggle Button */}
            <button
              onClick={handleToggleSharing}
              className={`w-full py-4 px-6 rounded-2xl font-black text-sm tracking-wider uppercase shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer btn-press ${
                isSharing
                  ? 'bg-red-700 hover:bg-red-800 text-white shadow-red-900/40'
                  : 'bg-[#9e6133] hover:bg-[#814a27] text-white shadow-[#9e6133]/40'
              }`}
            >
              {isSharing ? (
                <>
                  <Square className="w-5 h-5 fill-white" /> Stop Live Location Broadcast
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 fill-white" /> Start Live Location Broadcast
                </>
              )}
            </button>

            {/* Encrypted Share Link Box */}
            {isSharing && (
              <div className="bg-[#1e1008] p-3.5 rounded-xl border border-[#4a2b18] flex items-center justify-between gap-2 text-xs">
                <div className="truncate text-[#eee0ce] font-mono text-[11px]">{mockLink}</div>
                <button
                  onClick={copyShareLink}
                  className="bg-[#4a2b18] hover:bg-[#683c22] text-white px-3 py-1.5 rounded-lg shrink-0 flex items-center gap-1 font-bold text-xs cursor-pointer"
                >
                  {shareLinkCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {shareLinkCopied ? 'Copied' : 'Copy'}
                </button>
              </div>
            )}

          </div>

          {/* Live Coordinates & Nearby Safety Map */}
          <div className="space-y-2">
            <h3 className="text-base font-extrabold text-[#2d180c]">Live GPS Coordinates & Nearby Police / Hospitals Map</h3>
            <MapPlaceholder locations={SAFE_LOCATIONS} />
          </div>

        </div>

        {/* Right Column: Guardians Receiving & Location History */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Active Recipients */}
          <div className="bg-white rounded-2xl p-6 border border-[#eee0ce] shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#f7f0e6] pb-3">
              <h3 className="text-base font-extrabold text-[#2d180c] flex items-center gap-2">
                <Users className="w-5 h-5 text-[#9e6133]" />
                Receiving Guardians ({guardians.length})
              </h3>
            </div>

            <div className="space-y-3">
              {guardians.map((g) => (
                <div
                  key={g.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-[#fdfbf7] border border-[#eee0ce] text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`w-7 h-7 rounded-lg ${g.avatarBg || 'bg-[#9e6133]'} text-white font-extrabold flex items-center justify-center text-xs`}>
                      {g.name.charAt(0)}
                    </div>
                    <div>
                      <span className="font-bold text-[#2d180c]">{g.name}</span>
                      <span className="text-[#814a27]/70 text-[11px] block">{g.relationship}</span>
                    </div>
                  </div>

                  <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                    isSharing ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-[#f7f0e6] text-[#814a27]'
                  }`}>
                    {isSharing ? 'Receiving GPS' : 'Standby'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* History List */}
          <div className="bg-white rounded-2xl p-6 border border-[#eee0ce] shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#f7f0e6] pb-3">
              <h3 className="text-base font-extrabold text-[#2d180c] flex items-center gap-2">
                <History className="w-5 h-5 text-[#9e6133]" />
                Location Sharing History
              </h3>
            </div>

            <div className="space-y-3">
              {history.map((h) => (
                <div key={h.id} className="p-3 bg-[#fdfbf7] rounded-xl border border-[#eee0ce] text-xs space-y-1">
                  <div className="flex items-center justify-between font-bold text-[#2d180c]">
                    <span>{h.date}</span>
                    <span className={`text-[10px] uppercase font-black px-2 py-0.5 rounded-full ${
                      h.status === 'Active'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-[#f7f0e6] text-[#814a27]'
                    }`}>
                      {h.status}
                    </span>
                  </div>
                  <div className="text-[#814a27]/70 text-[11px]">Duration: {h.duration} • Shared with {h.recipients.length} contacts</div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
