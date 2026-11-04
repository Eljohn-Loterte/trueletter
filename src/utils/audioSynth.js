// Web Audio API ambient romantic acoustic harp, warm pad, and crystal chime synthesizer
class RomanticAudioPlayer {
  constructor() {
    this.ctx = null;
    this.isPlaying = false;
    this.timer = null;
    this.padTimer = null;
    this.chimeTimer = null;
    this.masterGain = null;
    this.delayNode = null;
    this.delayFeedback = null;
    this.lowpassFilter = null;
    this.chordIndex = 0;
    this.listeners = [];
    this.userManuallyMuted = false;

    // Romantic harmony chords in Hz (Cmaj9, Am9, Fmaj9, G6add9, Em9, Dm9)
    this.chords = [
      {
        bass: 130.81, // C3
        notes: [261.63, 329.63, 392.00, 493.88, 587.33] // C4, E4, G4, B4, D5
      },
      {
        bass: 110.00, // A2
        notes: [220.00, 261.63, 329.63, 392.00, 493.88] // A3, C4, E4, G4, B4
      },
      {
        bass: 87.31,  // F2
        notes: [174.61, 261.63, 329.63, 349.23, 440.00] // F3, C4, E4, F4, A4
      },
      {
        bass: 98.00,  // G2
        notes: [196.00, 246.94, 293.66, 392.00, 440.00] // G3, B3, D4, G4, A4
      },
      {
        bass: 82.41,  // E2
        notes: [164.81, 246.94, 329.63, 392.00, 493.88] // E3, B3, E4, G4, B4
      },
      {
        bass: 73.42,  // D2
        notes: [146.83, 220.00, 293.66, 349.23, 440.00] // D3, A3, D4, F4, A4
      }
    ];

    this.activePadNodes = [];
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();

      // Master output gain
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.001, this.ctx.currentTime);

      // Warm low-pass acoustic filter (velvety tone, removes digital sharpness)
      this.lowpassFilter = this.ctx.createBiquadFilter();
      this.lowpassFilter.type = 'lowpass';
      this.lowpassFilter.frequency.setValueAtTime(1400, this.ctx.currentTime);
      this.lowpassFilter.Q.setValueAtTime(0.8, this.ctx.currentTime);

      // Stereo echo delay for acoustic cathedral warmth
      this.delayNode = this.ctx.createDelay();
      this.delayNode.delayTime.setValueAtTime(0.36, this.ctx.currentTime);

      this.delayFeedback = this.ctx.createGain();
      this.delayFeedback.gain.setValueAtTime(0.32, this.ctx.currentTime);

      // Connect delay loop
      this.delayNode.connect(this.delayFeedback);
      this.delayFeedback.connect(this.delayNode);
      this.delayFeedback.connect(this.lowpassFilter);

      // Connect filter to master, then to destination
      this.lowpassFilter.connect(this.masterGain);
      this.masterGain.connect(this.ctx.destination);
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  subscribe(callback) {
    this.listeners.push(callback);
    callback(this.isPlaying);
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  notify() {
    this.listeners.forEach(cb => cb(this.isPlaying));
  }

  playPluck(freq, delay = 0, duration = 3.2, volume = 0.22) {
    if (!this.ctx) return;
    const now = this.ctx.currentTime + delay;

    // Harmonic bell/harp dual oscillator
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const noteGain = this.ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(freq, now);

    // Warm second harmonic for acoustic shimmer
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(freq * 2, now);

    noteGain.gain.setValueAtTime(0, now);
    noteGain.gain.linearRampToValueAtTime(volume, now + 0.015);
    noteGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc1.connect(noteGain);
    osc2.connect(noteGain);

    // Route direct to filter and wet send to delay
    noteGain.connect(this.lowpassFilter);
    noteGain.connect(this.delayNode);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + duration);
    osc2.stop(now + duration);
  }

  playWarmPadChord(chord, duration = 5.2) {
    if (!this.ctx || !this.isPlaying) return;
    const now = this.ctx.currentTime;
    const padGain = this.ctx.createGain();

    // Gentle fade in and out for pad
    padGain.gain.setValueAtTime(0, now);
    padGain.gain.linearRampToValueAtTime(0.065, now + 1.8);
    padGain.gain.setValueAtTime(0.065, now + duration - 2.0);
    padGain.gain.linearRampToValueAtTime(0, now + duration);

    padGain.connect(this.lowpassFilter);

    // Bass note
    const bassOsc = this.ctx.createOscillator();
    bassOsc.type = 'sine';
    bassOsc.frequency.setValueAtTime(chord.bass, now);
    bassOsc.connect(padGain);
    bassOsc.start(now);
    bassOsc.stop(now + duration);

    // Mid pad harmonies (fundamental + fifth)
    const mid1 = this.ctx.createOscillator();
    mid1.type = 'triangle';
    mid1.frequency.setValueAtTime(chord.notes[0], now);
    mid1.connect(padGain);
    mid1.start(now);
    mid1.stop(now + duration);

    const mid2 = this.ctx.createOscillator();
    mid2.type = 'sine';
    mid2.frequency.setValueAtTime(chord.notes[2], now);
    mid2.connect(padGain);
    mid2.start(now);
    mid2.stop(now + duration);
  }

  playChime(freq = 880) {
    this.init();
    this.playPluck(freq, 0, 2.0, 0.28);
    this.playPluck(freq * 1.5, 0.09, 1.8, 0.22);
    this.playPluck(freq * 2, 0.18, 2.4, 0.16);
  }

  start() {
    this.init();
    if (this.isPlaying) return;

    this.isPlaying = true;
    this.userManuallyMuted = false;

    // Smoothly fade in ambient volume to comfortable background level
    const now = this.ctx.currentTime;
    this.masterGain.gain.cancelScheduledValues(now);
    this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
    this.masterGain.gain.linearRampToValueAtTime(0.18, now + 1.6);

    this.notify();
    this.scheduleNextArpeggio();
    this.scheduleCrystalChimes();
  }

  scheduleNextArpeggio() {
    if (!this.isPlaying) return;

    const chord = this.chords[this.chordIndex % this.chords.length];
    this.chordIndex++;

    // Play lush warm background pad chord
    this.playWarmPadChord(chord, 5.0);

    // Play gentle cascading acoustic harp notes
    chord.notes.forEach((note, idx) => {
      // Natural humanized timing variance
      const delay = idx * 0.28 + (Math.random() - 0.5) * 0.04;
      const vol = 0.18 + Math.random() * 0.06;
      this.playPluck(note, delay, 3.4, vol);
    });

    // Occasional tender octave highlight
    if (Math.random() > 0.35) {
      const topNote = chord.notes[Math.floor(Math.random() * 3) + 2] * 2;
      this.playPluck(topNote, 1.5 + Math.random() * 0.4, 2.6, 0.12);
    }

    this.timer = setTimeout(() => {
      this.scheduleNextArpeggio();
    }, 3800);
  }

  scheduleCrystalChimes() {
    if (!this.isPlaying) return;

    // Occasional gentle ethereal high chime note (like morning dew on petals)
    const chimeFreqs = [1046.50, 1174.66, 1318.51, 1567.98, 1760.00];
    const freq = chimeFreqs[Math.floor(Math.random() * chimeFreqs.length)];
    this.playPluck(freq, 0, 3.0, 0.07);

    const nextDelay = 4500 + Math.random() * 3500;
    this.chimeTimer = setTimeout(() => {
      this.scheduleCrystalChimes();
    }, nextDelay);
  }

  stop() {
    if (!this.isPlaying) return;
    this.isPlaying = false;
    this.userManuallyMuted = true;

    if (this.ctx && this.masterGain) {
      // Smooth fade out
      const now = this.ctx.currentTime;
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
      this.masterGain.gain.linearRampToValueAtTime(0.0001, now + 0.8);
    }

    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    if (this.chimeTimer) {
      clearTimeout(this.chimeTimer);
      this.chimeTimer = null;
    }

    this.notify();
  }

  toggle() {
    if (this.isPlaying) {
      this.stop();
      return false;
    } else {
      this.start();
      return true;
    }
  }

  // Automatically start ambient music on first user gesture anywhere on the page
  initAutoStart() {
    const handleFirstGesture = () => {
      if (!this.isPlaying && !this.userManuallyMuted) {
        this.start();
      }
      window.removeEventListener('pointerdown', handleFirstGesture);
      window.removeEventListener('click', handleFirstGesture);
      window.removeEventListener('touchstart', handleFirstGesture);
      window.removeEventListener('keydown', handleFirstGesture);
    };

    window.addEventListener('pointerdown', handleFirstGesture, { passive: true });
    window.addEventListener('click', handleFirstGesture, { passive: true });
    window.addEventListener('touchstart', handleFirstGesture, { passive: true });
    window.addEventListener('keydown', handleFirstGesture, { passive: true });
  }
}

export const soundManager = new RomanticAudioPlayer();
