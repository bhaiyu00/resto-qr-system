/**
 * Web Audio API synthesizer for café order chimes and kitchen bells.
 * Zero external mp3 dependencies, works offline and reliably in browser sandboxes.
 */

class SoundManager {
  private audioCtx: AudioContext | null = null;
  private isMuted: boolean = false;

  constructor() {
    // Check local storage for user mute preference
    if (typeof window !== 'undefined') {
      this.isMuted = localStorage.getItem('cozybite_sound_muted') === 'true';
    }
  }

  private initContext() {
    if (!this.audioCtx && typeof window !== 'undefined') {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (typeof window !== 'undefined') {
      localStorage.setItem('cozybite_sound_muted', String(muted));
    }
  }

  public toggleMute(): boolean {
    this.setMuted(!this.isMuted);
    return this.isMuted;
  }

  /**
   * Warm brass kitchen counter bell (two-tone melodic chime: G5 -> C6).
   */
  public playNewOrderBell() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.audioCtx) return;

      const now = this.audioCtx.currentTime;

      // Note 1: 784 Hz (G5)
      this.createChimeTone(783.99, now, 0.45, 0.15);
      // Note 2: 1046.5 Hz (C6)
      this.createChimeTone(1046.5, now + 0.12, 0.7, 0.2);
    } catch {
      // Audio autoplay policy fallback
    }
  }

  /**
   * Pleasant status transition chime (Single soft ping).
   */
  public playStatusUpdateChime() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.audioCtx) return;

      const now = this.audioCtx.currentTime;
      this.createChimeTone(880, now, 0.5, 0.12);
    } catch {
      // Fallback
    }
  }

  /**
   * Cheerful success chime (G5 -> B5 -> D6 harmonic arpeggio).
   */
  public playOrderSuccessChime() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.audioCtx) return;

      const now = this.audioCtx.currentTime;
      this.createChimeTone(587.33, now, 0.3, 0.12);
      this.createChimeTone(739.99, now + 0.1, 0.35, 0.14);
      this.createChimeTone(880.00, now + 0.2, 0.5, 0.18);
    } catch {
      // Fallback
    }
  }

  /**
   * Crisp electronic camera scanner beep (1200 Hz -> 1800 Hz quick chirp).
   */
  public playQRScanBeep() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.audioCtx) return;

      const now = this.audioCtx.currentTime;
      this.createChimeTone(1480, now, 0.12, 0.18);
    } catch {
      // Fallback
    }
  }

  private createChimeTone(freq: number, startTime: number, duration: number, peakGain: number) {
    if (!this.audioCtx) return;

    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, startTime);

    gain.gain.setValueAtTime(0.0001, startTime);
    gain.gain.exponentialRampToValueAtTime(peakGain, startTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    osc.connect(gain);
    gain.connect(this.audioCtx.destination);

    osc.start(startTime);
    osc.stop(startTime + duration);
  }
}

export const soundManager = new SoundManager();
