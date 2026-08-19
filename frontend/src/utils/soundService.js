/**
 * soundService.js
 * Browser-native Web Audio API synthesizer for emergency Siren sound & Fake Call Ringtone.
 */

class SoundService {
  constructor() {
    this.audioCtx = null;
    
    // Siren State
    this.sirenOsc1 = null;
    this.sirenOsc2 = null;
    this.sirenGain = null;
    this.sirenTimer = null;
    this.isSirenPlaying = false;

    // Ringtone State
    this.ringtoneOsc1 = null;
    this.ringtoneOsc2 = null;
    this.ringtoneGain = null;
    this.ringtoneInterval = null;
    this.isRingtonePlaying = false;
  }

  getAudioContext() {
    if (!this.audioCtx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.audioCtx = new AudioCtx();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  /**
   * Start 110dB Emergency Siren Sound (Sweeping dual tone)
   */
  startSiren(volume = 0.5) {
    if (this.isSirenPlaying) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      this.isSirenPlaying = true;

      // Master Gain for smooth control & mute
      this.sirenGain = ctx.createGain();
      this.sirenGain.gain.setValueAtTime(volume, ctx.currentTime);
      this.sirenGain.connect(ctx.destination);

      // Primary Oscillator (Sawtooth for aggressive siren sound)
      this.sirenOsc1 = ctx.createOscillator();
      this.sirenOsc1.type = 'sawtooth';

      // Secondary Oscillator (Sine wave for dual harmonic)
      this.sirenOsc2 = ctx.createOscillator();
      this.sirenOsc2.type = 'sine';

      const now = ctx.currentTime;
      this.sirenOsc1.frequency.setValueAtTime(600, now);
      this.sirenOsc2.frequency.setValueAtTime(900, now);

      let high = false;
      const sweep = () => {
        if (!this.isSirenPlaying || !this.sirenOsc1 || !this.sirenGain) return;
        const currentTime = ctx.currentTime;
        const targetFreq1 = high ? 650 : 1250;
        const targetFreq2 = high ? 850 : 1600;

        this.sirenOsc1.frequency.cancelScheduledValues(currentTime);
        this.sirenOsc2.frequency.cancelScheduledValues(currentTime);

        this.sirenOsc1.frequency.exponentialRampToValueAtTime(targetFreq1, currentTime + 0.6);
        this.sirenOsc2.frequency.exponentialRampToValueAtTime(targetFreq2, currentTime + 0.6);
        
        high = !high;
      };

      sweep();
      this.sirenTimer = setInterval(sweep, 650);

      this.sirenOsc1.connect(this.sirenGain);
      this.sirenOsc2.connect(this.sirenGain);

      this.sirenOsc1.start();
      this.sirenOsc2.start();
    } catch (e) {
      console.error('Error starting siren sound:', e);
    }
  }

  /**
   * Stop Emergency Siren
   */
  stopSiren() {
    this.isSirenPlaying = false;
    if (this.sirenTimer) {
      clearInterval(this.sirenTimer);
      this.sirenTimer = null;
    }
    if (this.sirenOsc1) {
      try { this.sirenOsc1.stop(); } catch (e) {}
      this.sirenOsc1.disconnect();
      this.sirenOsc1 = null;
    }
    if (this.sirenOsc2) {
      try { this.sirenOsc2.stop(); } catch (e) {}
      this.sirenOsc2.disconnect();
      this.sirenOsc2 = null;
    }
    if (this.sirenGain) {
      this.sirenGain.disconnect();
      this.sirenGain = null;
    }
  }

  /**
   * Adjust Siren Volume (0.0 to 1.0)
   */
  setSirenVolume(volume) {
    if (this.sirenGain && this.audioCtx) {
      this.sirenGain.gain.setValueAtTime(volume, this.audioCtx.currentTime);
    }
  }

  /**
   * Start Realistic Phone Ringtone (440Hz + 480Hz dual tone in 2s ring cadence)
   */
  startRingtone(volume = 0.5) {
    if (this.isRingtonePlaying) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      this.isRingtonePlaying = true;

      this.ringtoneGain = ctx.createGain();
      this.ringtoneGain.gain.setValueAtTime(0, ctx.currentTime);
      this.ringtoneGain.connect(ctx.destination);

      // US/European Phone Dual Ring Frequency (440Hz + 480Hz)
      this.ringtoneOsc1 = ctx.createOscillator();
      this.ringtoneOsc1.type = 'sine';
      this.ringtoneOsc1.frequency.setValueAtTime(440, ctx.currentTime);

      this.ringtoneOsc2 = ctx.createOscillator();
      this.ringtoneOsc2.type = 'sine';
      this.ringtoneOsc2.frequency.setValueAtTime(480, ctx.currentTime);

      this.ringtoneOsc1.connect(this.ringtoneGain);
      this.ringtoneOsc2.connect(this.ringtoneGain);

      this.ringtoneOsc1.start();
      this.ringtoneOsc2.start();

      // Cadence: 1.8 seconds RING, 2 seconds SILENCE
      const pulseRing = () => {
        if (!this.isRingtonePlaying || !this.ringtoneGain) return;
        const now = ctx.currentTime;
        this.ringtoneGain.gain.cancelScheduledValues(now);
        this.ringtoneGain.gain.setValueAtTime(volume, now);
        this.ringtoneGain.gain.setValueAtTime(0, now + 1.8);
      };

      pulseRing();
      this.ringtoneInterval = setInterval(pulseRing, 3800);
    } catch (e) {
      console.error('Error starting ringtone:', e);
    }
  }

  /**
   * Stop Phone Ringtone
   */
  stopRingtone() {
    this.isRingtonePlaying = false;
    if (this.ringtoneInterval) {
      clearInterval(this.ringtoneInterval);
      this.ringtoneInterval = null;
    }
    if (this.ringtoneOsc1) {
      try { this.ringtoneOsc1.stop(); } catch (e) {}
      this.ringtoneOsc1.disconnect();
      this.ringtoneOsc1 = null;
    }
    if (this.ringtoneOsc2) {
      try { this.ringtoneOsc2.stop(); } catch (e) {}
      this.ringtoneOsc2.disconnect();
      this.ringtoneOsc2 = null;
    }
    if (this.ringtoneGain) {
      this.ringtoneGain.disconnect();
      this.ringtoneGain = null;
    }
  }
  /**
   * Play Phone Call Connect Sound (Double Beep when picking up)
   */
  playCallConnectSound() {
    const ctx = this.getAudioContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(425, now);
      
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.setValueAtTime(0, now + 0.15);
      gain.gain.setValueAtTime(0.3, now + 0.25);
      gain.gain.setValueAtTime(0, now + 0.4);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.45);
    } catch (e) {
      console.error('Call connect sound error:', e);
    }
  }

  /**
   * Play Phone Call End/Hangup Sound
   */
  playCallEndSound() {
    const ctx = this.getAudioContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(425, now);

      // 3 short busy/hangup tones
      for (let i = 0; i < 3; i++) {
        gain.gain.setValueAtTime(0.2, now + i * 0.25);
        gain.gain.setValueAtTime(0, now + i * 0.25 + 0.12);
      }

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.8);
    } catch (e) {
      console.error('Call end sound error:', e);
    }
  }

  /**
   * Start Phone Call Background Telephony Audio (Subtle line static & frequency chatter)
   */
  startCallAudio(volume = 0.15) {
    if (this.isCallAudioPlaying) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      this.isCallAudioPlaying = true;
      this.callAudioGain = ctx.createGain();
      this.callAudioGain.gain.setValueAtTime(volume, ctx.currentTime);
      this.callAudioGain.connect(ctx.destination);

      // Low frequency hum representing phone line connection
      this.callAudioOsc = ctx.createOscillator();
      this.callAudioOsc.type = 'triangle';
      this.callAudioOsc.frequency.setValueAtTime(180, ctx.currentTime);
      this.callAudioOsc.connect(this.callAudioGain);
      this.callAudioOsc.start();
    } catch (e) {
      console.error('Call audio error:', e);
    }
  }

  /**
   * Stop Phone Call Background Audio
   */
  stopCallAudio() {
    this.isCallAudioPlaying = false;
    if (this.callAudioOsc) {
      try { this.callAudioOsc.stop(); } catch (e) {}
      this.callAudioOsc.disconnect();
      this.callAudioOsc = null;
    }
    if (this.callAudioGain) {
      this.callAudioGain.disconnect();
      this.callAudioGain = null;
    }
  }
}

export const soundService = new SoundService();
