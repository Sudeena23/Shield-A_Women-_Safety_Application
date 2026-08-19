import React, { useState, useEffect } from 'react';
import { ShieldAlert, Volume2, VolumeX, Phone, X, CheckCircle, MapPin, Send, AlertOctagon, KeyRound, AlertTriangle, ShieldCheck } from 'lucide-react';
import { soundService } from '../utils/soundService';

export const SOSAlertModal = ({ isOpen, onClose, guardians }) => {
  const [countdown, setCountdown] = useState(5);
  const [isTriggered, setIsTriggered] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [dispatchStatus, setDispatchStatus] = useState([]);

  // Siren Audio Control
  useEffect(() => {
    if (isOpen && soundEnabled && (isTriggered || countdown <= 3)) {
      soundService.startSiren(0.5);
    } else {
      soundService.stopSiren();
    }

    return () => {
      soundService.stopSiren();
    };
  }, [isOpen, soundEnabled, isTriggered, countdown]);

  useEffect(() => {
    let timer;
    if (isOpen && countdown > 0 && !isTriggered) {
      timer = setTimeout(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (isOpen && countdown === 0 && !isTriggered) {
      setIsTriggered(true);
      simulateBroadcast();
    }

    return () => clearTimeout(timer);
  }, [isOpen, countdown, isTriggered]);

  useEffect(() => {
    if (!isOpen) {
      setCountdown(5);
      setIsTriggered(false);
      setDispatchStatus([]);
    }
  }, [isOpen]);

  const simulateBroadcast = () => {
    setDispatchStatus(['Locking precise GPS coordinates...']);
    setTimeout(() => {
      setDispatchStatus((prev) => [...prev, 'Encrypted emergency signal generated.']);
    }, 800);
    setTimeout(() => {
      setDispatchStatus((prev) => [...prev, `SMS alert broadcasted to ${guardians.length} guardians.`]);
    }, 1600);
    setTimeout(() => {
      setDispatchStatus((prev) => [...prev, 'Live location stream active: Market Street & 4th Ave.']);
    }, 2400);
    setTimeout(() => {
      setDispatchStatus((prev) => [...prev, 'Nearest Police Station (0.4 mi) notified.']);
    }, 3200);
  };

  const handleStopSOS = () => {
    soundService.stopSiren();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#28150a] border-2 border-red-600/80 rounded-2xl shadow-2xl shadow-red-950/50 p-6 text-white overflow-hidden">
        {/* Top Warning Glow */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-red-600/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-red-600/30 rounded-full blur-3xl pointer-events-none" />

        {/* Close button */}
        <button
          id="sos-modal-close"
          onClick={handleStopSOS}
          className="absolute top-4 right-4 text-[#cb9d75] hover:text-white bg-[#3d2212] hover:bg-[#522f18] p-2 rounded-full transition-colors cursor-pointer border border-[#522f18]"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {!isTriggered ? (
          /* Countdown Screen */
          <div className="text-center py-4 space-y-6">
            <div className="inline-flex items-center justify-center p-4 bg-red-500/20 rounded-full ring-8 ring-red-500/10 animate-bounce">
              <ShieldAlert className="w-16 h-16 text-red-500" />
            </div>

            <div>
              <span className="inline-block px-3 py-1 bg-[#1a0c05] text-red-400 text-xs font-semibold uppercase tracking-widest rounded-full border border-red-800 mb-2">
                Emergency Alert Mode
              </span>
              <h2 className="text-2xl md:text-3xl font-black tracking-tight text-white">
                Dispatching Emergency SOS
              </h2>
              <p className="text-[#cb9d75] text-sm mt-1">
                Distress signal will trigger in <span className="text-red-400 font-bold text-lg">{countdown}s</span>
              </p>
            </div>

            {/* Countdown Circle */}
            <div className="relative w-28 h-28 mx-auto flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-[#3d2212]" />
              <div
                className="absolute inset-0 rounded-full border-4 border-red-500 border-t-transparent animate-spin"
                style={{ animationDuration: '1s' }}
              />
              <span className="text-4xl font-black text-red-500">{countdown}</span>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                id="cancel-sos-dispatch"
                onClick={handleStopSOS}
                className="flex-1 bg-[#3d2212] hover:bg-[#522f18] text-white font-bold py-3 px-4 rounded-xl transition-all border border-[#522f18] cursor-pointer"
              >
                Cancel SOS Signal
              </button>
              <button
                id="trigger-sos-now"
                onClick={() => {
                  setCountdown(0);
                  setIsTriggered(true);
                  simulateBroadcast();
                }}
                className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-black py-3 px-4 rounded-xl shadow-lg shadow-red-600/40 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <AlertOctagon className="w-5 h-5" />
                Dispatch Now
              </button>
            </div>
          </div>
        ) : (
          /* Active Alert Triggered Screen */
          <div className="space-y-5 py-2">
            <div className="flex items-center gap-3 border-b border-[#3d2212] pb-4">
              <div className="p-3 bg-red-600/20 text-red-500 rounded-xl animate-pulse">
                <ShieldAlert className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-white">SOS BROADCAST ACTIVE</h3>
                <p className="text-xs text-red-400 font-medium">Live safety protocol in progress</p>
              </div>
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="ml-auto text-[#cb9d75] hover:text-white p-2 rounded-lg bg-[#3d2212] border border-[#522f18] cursor-pointer"
                title="Toggle siren sound"
              >
                {soundEnabled ? <Volume2 className="w-5 h-5 text-red-400" /> : <VolumeX className="w-5 h-5" />}
              </button>
            </div>

            {/* Current Location Pin */}
            <div className="bg-[#1a0c05] rounded-xl p-3 border border-[#3d2212] flex items-center gap-3">
              <MapPin className="w-5 h-5 text-red-400 shrink-0" />
              <div className="text-xs">
                <div className="font-semibold text-white">Current Broadcasted Location:</div>
                <div className="text-[#cb9d75]/80">Durbar Marg & Thamel Area (27.7128 N, 85.3175 E)</div>
              </div>
            </div>

            {/* Broadcast Terminal Log */}
            <div className="bg-[#1a0c05] rounded-xl p-4 border border-[#3d2212] space-y-2 text-xs font-mono min-h-[140px]">
              <div className="text-[#cb9d75] font-sans text-xs font-semibold mb-2 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Send className="w-3.5 h-3.5 text-red-400 animate-pulse" />
                  Live Dispatch Timeline
                </span>
              </div>
              {dispatchStatus.map((log, idx) => (
                <div key={idx} className="flex items-start gap-2 text-emerald-400 animate-in fade-in">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{log}</span>
                </div>
              ))}
            </div>

            {/* Guardians notified list */}
            <div>
              <div className="text-xs font-semibold text-[#cb9d75] mb-2">Notified Emergency Contacts ({guardians.length}):</div>
              <div className="flex flex-wrap gap-2">
                {guardians.map((g) => (
                  <span key={g.id} className="text-xs px-2.5 py-1 bg-[#1a0c05] border border-[#3d2212] text-white rounded-full flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                    {g.name} ({g.relationship})
                  </span>
                ))}
              </div>
            </div>

            {/* Direct Dial Emergency Button & Stop SOS button */}
            <div className="flex gap-3 pt-2">
              <a
                href="tel:100"
                className="flex-1 bg-red-600 hover:bg-red-500 text-white font-bold py-3 px-4 rounded-xl shadow-lg flex items-center justify-center gap-2 text-sm transition-all text-center"
              >
                <Phone className="w-4 h-4 fill-white" />
                Call Nepal Police (100)
              </a>
              <button
                onClick={handleStopSOS}
                className="bg-[#3d2212] hover:bg-[#522f18] text-white text-sm font-semibold px-4 py-3 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 border border-[#522f18]"
              >
                Stop SOS
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

