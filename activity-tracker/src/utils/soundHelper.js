/**
 * soundHelper.js
 * Utility to generate and play notification sounds using the Web Audio API. 
 * This avoids the need for external MP3/WAV files.
 */

class SoundHelper {
  constructor() {
    this.audioContext = null;
  }

  init() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
  }

  playNotification() {
    this.init();
    if (!this.audioContext) return;

    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();

    osc.type = 'sine'; // Soft, clean sound
    osc.frequency.setValueAtTime(880, this.audioContext.currentTime); // High pitch A5
    osc.frequency.exponentialRampToValueAtTime(440, this.audioContext.currentTime + 0.5); // Slide down to A4

    gain.gain.setValueAtTime(0, this.audioContext.currentTime);
    gain.gain.linearRampToValueAtTime(0.3, this.audioContext.currentTime + 0.05); // Fade in
    gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.8); // Fade out

    osc.connect(gain);
    gain.connect(this.audioContext.destination);

    osc.start();
    osc.stop(this.audioContext.currentTime + 0.8);
  }

  playCompletion() {
    this.init();
    if (!this.audioContext) return;

    const ctx = this.audioContext;
    const now = ctx.currentTime;

    const ding = (time, freq) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine'; // bell-like
      osc.frequency.setValueAtTime(freq, time);

      gain.gain.setValueAtTime(0.0001, time);
      gain.gain.exponentialRampToValueAtTime(0.3, time + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.6);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(time);
      osc.stop(time + 0.6);
    };

    const duration = 10; // seconds
    const interval = 0.8; // gap between ding-dong pairs

    for (let t = 0; t < duration; t += interval) {
      const start = now + t;

      ding(start, 880);        // "ding"
      ding(start + 0.4, 660);  // "dong"
    }
  }
}

export const soundHelper = new SoundHelper();
