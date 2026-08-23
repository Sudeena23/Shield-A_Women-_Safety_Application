import React, { useState, useEffect, useRef } from 'react';
import { PhoneOff, Phone, User, X, Volume2, VolumeX, Mic, MicOff, Radio, Sparkles, MessageSquare } from 'lucide-react';
import { soundService } from '../utils/soundService';

export const FakeCallModal = ({ isOpen, onClose }) => {
  // Call stages: 'ringing' | 'connected'
  const [stage, setStage] = useState('ringing');
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [activePhraseIndex, setActivePhraseIndex] = useState(0);
  const [selectedPersonaIndex, setSelectedPersonaIndex] = useState(0);

  const phraseIntervalRef = useRef(null);

  // Fake Caller Personas with conversation scripts for user to read along
  const personas = [
    {
      id: 'dad',
      name: 'Dad',
      number: '+977 9801234567',
      avatarBg: 'bg-amber-900',
      tag: 'Family Guardian',
    },
    {
      id: 'police',
      name: 'Shield Police Dispatch',
      number: 'Nepal Police #100',
      avatarBg: 'bg-blue-900',
      tag: 'Emergency Command',
    },
    {
      id: 'friend',
      name: 'Maya (Best Friend)',
      number: '+977 9841122334',
      avatarBg: 'bg-[#9e6133]',
      tag: 'Friend Escort',
    },
    {
      id: 'brother',
      name: 'Aarav (Brother)',
      number: '+977 9851098765',
      avatarBg: 'bg-emerald-900',
      tag: 'Brother Escort',
    }
  ];

  const currentPersona = personas[selectedPersonaIndex] || personas[0];

  // Ringtone handling on modal open/close
  useEffect(() => {
    if (isOpen) {
      setStage('ringing');
      setCallDuration(0);
      setActivePhraseIndex(0);
      soundService.startRingtone(0.6);
    } else {
      soundService.stopRingtone();
      soundService.stopCallAudio();
      if (phraseIntervalRef.current) {
        clearInterval(phraseIntervalRef.current);
      }
    }

    return () => {
      soundService.stopRingtone();
      soundService.stopCallAudio();
      if (phraseIntervalRef.current) {
        clearInterval(phraseIntervalRef.current);
      }
    };
  }, [isOpen]);

  // Active call duration timer & phrase rotation
  useEffect(() => {
    let timer;
    if (stage === 'connected') {
      timer = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);

      // Rotate conversational script prompts every 7 seconds
      phraseIntervalRef.current = setInterval(() => {
        setActivePhraseIndex((prev) => (prev + 1) % currentPersona.phrases.length);
      }, 7000);

      return () => {
        clearInterval(timer);
        if (phraseIntervalRef.current) clearInterval(phraseIntervalRef.current);
      };
    } else {
      setCallDuration(0);
    }
    return () => clearInterval(timer);
  }, [stage, selectedPersonaIndex]);

  const handleAcceptCall = () => {
    soundService.stopRingtone();
    soundService.playCallConnectSound();
    soundService.startCallAudio(0.12);
    setStage('connected');
  };

  const handleEndCall = () => {
    soundService.stopRingtone();
    soundService.stopCallAudio();
    soundService.playCallEndSound();
    if (phraseIntervalRef.current) {
      clearInterval(phraseIntervalRef.current);
    }
    onClose();
  };

  const handleToggleSpeaker = () => {
    const nextSpeaker = !isSpeakerOn;
    setIsSpeakerOn(nextSpeaker);
    if (nextSpeaker) {
      soundService.startCallAudio(0.15);
    } else {
      soundService.startCallAudio(0.05);
    }
  };

  const formatDuration = (secs) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-xl p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm bg-[#1a0c05] border border-[#4a2b18] rounded-3xl shadow-2xl overflow-hidden text-white flex flex-col justify-between min-h-[520px]">
        
        {/* Top Header Controls */}
        <div className="p-4 flex items-center justify-between border-b border-[#381b0a] bg-[#221007]">
          <button
            onClick={handleEndCall}
            className="text-[#cb9d75] hover:text-white p-1.5 rounded-full bg-[#28150a] border border-[#4a2b18] cursor-pointer transition-colors"
            title="Close Call"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* INCOMING RINGING CALL SCREEN */}
        {stage === 'ringing' && (
          <div className="p-6 flex-1 flex flex-col justify-between items-center text-center bg-gradient-to-b from-[#1a0c05] via-[#28150a] to-[#1a0c05]">
            <div className="space-y-3 mt-4 w-full">
              <div className="relative w-24 h-24 rounded-full bg-[#9e6133]/30 border-2 border-[#9e6133] flex items-center justify-center mx-auto">
                <div className="absolute inset-0 rounded-full border border-emerald-400 animate-ping opacity-75" />
                <User className="w-12 h-12 text-white" />
              </div>

              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-400 bg-emerald-950/80 border border-emerald-800 px-3 py-1 rounded-full animate-pulse inline-block">
                  INCOMING CALL
                </span>
                <h2 className="text-2xl font-black text-white mt-2">{currentPersona.name}</h2>
                <p className="text-xs font-mono text-[#cb9d75]">{currentPersona.number}</p>
              </div>
            </div>
            <div className="text-xs text-[#eee0ce]/70 animate-pulse mb-3">
              Press Answer to start call audio & talk along
            </div>

            {/* Answer / Decline Buttons */}
            <div className="w-full flex items-center justify-around gap-6 mb-2">
              <button
                onClick={handleEndCall}
                className="flex flex-col items-center gap-1.5 group cursor-pointer"
              >
                <div className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-500 text-white flex items-center justify-center shadow-lg shadow-red-600/40 group-hover:scale-105 transition-transform">
                  <PhoneOff className="w-8 h-8" />
                </div>
                <span className="text-xs font-bold text-red-400">Decline</span>
              </button>

              <button
                onClick={handleAcceptCall}
                className="flex flex-col items-center gap-1.5 group cursor-pointer"
              >
                <div className="w-16 h-16 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-600/40 group-hover:scale-105 transition-transform animate-bounce">
                  <Phone className="w-8 h-8" />
                </div>
                <span className="text-xs font-bold text-emerald-400">Answer</span>
              </button>
            </div>
          </div>
        )}

        {/* ACTIVE CONNECTED CALL SCREEN */}
        {stage === 'connected' && (
          <div className="p-5 flex-1 flex flex-col justify-between items-center text-center bg-gradient-to-b from-[#1a0c05] via-[#28150a] to-[#1a0c05]">
            
            {/* Caller Info Header */}
            <div className="space-y-2 mt-2">
              <div className={`w-16 h-16 rounded-full ${currentPersona.avatarBg} text-white flex items-center justify-center mx-auto text-xl font-black shadow-lg border-2 border-[#cb9d75]/50`}>
                {currentPersona.name.charAt(0)}
              </div>
              <h3 className="text-lg font-black text-white">{currentPersona.name}</h3>
              <div className="inline-flex items-center gap-1.5 text-xs font-mono text-emerald-400 font-bold bg-emerald-950/60 border border-emerald-800 px-3 py-0.5 rounded-full">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>Call Active • {formatDuration(callDuration)}</span>
              </div>
            </div>

            {/* End Call Button */}
            <button
              onClick={handleEndCall}
              className="w-full bg-red-600 hover:bg-red-500 text-white font-extrabold py-3 rounded-2xl shadow-lg shadow-red-600/30 flex items-center justify-center gap-2 text-sm transition-all cursor-pointer mt-1"
            >
              <PhoneOff className="w-5 h-5" /> End Call
            </button>

          </div>
        )}

      </div>
    </div>
  );
};
