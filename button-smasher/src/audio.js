// Web Audio API – all sounds synthesized, no external files needed.

const AudioCtx = window.AudioContext || window.webkitAudioContext;
let _ctx = null;

function ctx() {
  if (!_ctx) _ctx = new AudioCtx();
  if (_ctx.state === 'suspended') _ctx.resume();
  return _ctx;
}

const audio = {
  // Short percussive hit. Pitch and harshness scale with cps + combo.
  playHit(cps, combo) {
    try {
      const c = ctx();
      const osc = c.createOscillator();
      const gain = c.createGain();
      osc.connect(gain);
      gain.connect(c.destination);

      const basePitch = 180 + cps * 25 + combo * 8;
      osc.type = combo >= 6 ? 'sawtooth' : 'square';
      osc.frequency.setValueAtTime(basePitch, c.currentTime);
      osc.frequency.exponentialRampToValueAtTime(basePitch * 0.4, c.currentTime + 0.08);

      const vol = Math.min(0.08 + cps * 0.006, 0.18);
      gain.gain.setValueAtTime(vol, c.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + 0.1);

      osc.start(c.currentTime);
      osc.stop(c.currentTime + 0.12);
    } catch (_) {}
  },

  // Dramatic sting when entering a new damage phase.
  playPhaseChange(phase) {
    try {
      const c = ctx();
      const freqs = [0, 220, 330, 440, 600];
      const freq  = freqs[Math.min(phase, freqs.length - 1)];
      const osc = c.createOscillator();
      const gain = c.createGain();
      osc.connect(gain);
      gain.connect(c.destination);

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq * 0.5, c.currentTime);
      osc.frequency.exponentialRampToValueAtTime(freq, c.currentTime + 0.25);

      gain.gain.setValueAtTime(0.22, c.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + 0.4);

      osc.start(c.currentTime);
      osc.stop(c.currentTime + 0.45);
    } catch (_) {}
  },

  // Triumphant fanfare → chaotic explosion (win sequence).
  playWin() {
    try {
      const c = ctx();

      // Ascending C-Dur Arpeggio (Fanfare)
      const notes = [261.63, 329.63, 392, 523.25, 659.25, 783.99, 1046.5];
      notes.forEach((freq, i) => {
        const osc = c.createOscillator();
        const g   = c.createGain();
        osc.connect(g); g.connect(c.destination);
        osc.type = 'square';
        const t = c.currentTime + i * 0.07;
        osc.frequency.setValueAtTime(freq, t);
        g.gain.setValueAtTime(0.12, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.28);
        osc.start(t); osc.stop(t + 0.32);
      });

      // Großer Akkord beim Peak (t = 0.52)
      [523.25, 659.25, 783.99].forEach(freq => {
        const osc = c.createOscillator();
        const g   = c.createGain();
        osc.connect(g); g.connect(c.destination);
        osc.type = 'sawtooth';
        const t = c.currentTime + 0.52;
        osc.frequency.setValueAtTime(freq, t);
        g.gain.setValueAtTime(0.1, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.6);
        osc.start(t); osc.stop(t + 0.65);
      });

      // Explosions-Crash bei t = 0.95s
      const bufSize = Math.floor(c.sampleRate * 0.9);
      const buf  = c.createBuffer(1, bufSize, c.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < bufSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufSize, 0.4);
      }
      const noise = c.createBufferSource();
      noise.buffer = buf;

      const filt = c.createBiquadFilter();
      filt.type = 'lowpass';
      filt.frequency.setValueAtTime(2500, c.currentTime + 0.95);
      filt.frequency.exponentialRampToValueAtTime(60, c.currentTime + 1.85);

      const ng = c.createGain();
      ng.gain.setValueAtTime(0.65, c.currentTime + 0.95);
      ng.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 1.9);

      noise.connect(filt); filt.connect(ng); ng.connect(c.destination);
      noise.start(c.currentTime + 0.95);
    } catch (_) {}
  },

  // Ascending arpeggio sting when entering a new sub-phase.
  playSubPhaseString(subPhase) {
    try {
      const c = ctx();
      const freqSets = {
        1: [220, 440, 880],
        2: [180, 360, 720, 1440],
        3: [100, 200, 400, 800, 1600],
      };
      const notes = freqSets[subPhase] || freqSets[1];
      notes.forEach((freq, i) => {
        const osc = c.createOscillator();
        const g   = c.createGain();
        osc.connect(g); g.connect(c.destination);
        osc.type = 'square';
        const t = c.currentTime + i * 0.06;
        osc.frequency.setValueAtTime(freq, t);
        g.gain.setValueAtTime(0.14, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
        osc.start(t); osc.stop(t + 0.35);
      });
    } catch(_) {}
  },

  // Extended victory fanfare – longer arpeggio + sustained chord + noise burst.
  playVictoryFanfare() {
    try {
      const c = ctx();
      const notes = [261.63, 329.63, 392, 523.25, 659.25, 783.99, 1046.5, 1318.5, 1567.98];
      notes.forEach((freq, i) => {
        const osc = c.createOscillator();
        const g   = c.createGain();
        osc.connect(g); g.connect(c.destination);
        osc.type = 'square';
        const t = c.currentTime + i * 0.09;
        osc.frequency.setValueAtTime(freq, t);
        g.gain.setValueAtTime(0.13, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.45);
        osc.start(t); osc.stop(t + 0.5);
      });

      [523.25, 659.25, 783.99, 1046.5].forEach(freq => {
        const osc = c.createOscillator();
        const g   = c.createGain();
        osc.connect(g); g.connect(c.destination);
        osc.type = 'sawtooth';
        const t = c.currentTime + 0.88;
        osc.frequency.setValueAtTime(freq, t);
        g.gain.setValueAtTime(0.12, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 1.3);
        osc.start(t); osc.stop(t + 1.4);
      });

      // Noise burst
      const bufSize = Math.floor(c.sampleRate * 0.7);
      const buf  = c.createBuffer(1, bufSize, c.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < bufSize; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufSize, 0.35);
      const noise = c.createBufferSource();
      noise.buffer = buf;
      const filt = c.createBiquadFilter();
      filt.type = 'lowpass';
      filt.frequency.setValueAtTime(3000, c.currentTime + 0.85);
      filt.frequency.exponentialRampToValueAtTime(120, c.currentTime + 1.8);
      const ng = c.createGain();
      ng.gain.setValueAtTime(0.55, c.currentTime + 0.85);
      ng.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 2.0);
      noise.connect(filt); filt.connect(ng); ng.connect(c.destination);
      noise.start(c.currentTime + 0.85);
    } catch(_) {}
  },

  // Explosion crash on button death.
  playGameOver() {
    try {
      const c = ctx();

      // White-noise burst
      const bufSize = Math.floor(c.sampleRate * 0.9);
      const buf = c.createBuffer(1, bufSize, c.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < bufSize; i++) {
        data[i] = (Math.random() * 2 - 1) * (1 - i / bufSize) * 0.9;
      }
      const noise = c.createBufferSource();
      noise.buffer = buf;

      const filter = c.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1200, c.currentTime);
      filter.frequency.exponentialRampToValueAtTime(80, c.currentTime + 0.9);

      const noiseGain = c.createGain();
      noiseGain.gain.setValueAtTime(0.5, c.currentTime);
      noiseGain.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + 0.9);

      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(c.destination);
      noise.start();

      // Three descending tones
      [400, 300, 180].forEach((freq, i) => {
        const osc = c.createOscillator();
        const g = c.createGain();
        osc.connect(g);
        g.connect(c.destination);
        osc.type = 'square';
        const t = c.currentTime + i * 0.12;
        osc.frequency.setValueAtTime(freq, t);
        osc.frequency.exponentialRampToValueAtTime(40, t + 0.55);
        g.gain.setValueAtTime(0.18, t);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.6);
        osc.start(t);
        osc.stop(t + 0.65);
      });
    } catch (_) {}
  },
};
