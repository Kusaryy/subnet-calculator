class AudioEngine {
  constructor() {
    this.ctx = null;
    this.isPlaying = false;
    this.isMuted = false;
    this.nextBeatTime = 0;
    this.currentBeat = 0;
    this.schedulerTimer = null;
    this.BPM = 128;
    this.beatInterval = 60 / this.BPM;
  }

  _init() {
    if (!this.ctx) this.ctx = new AudioContext();
  }

  startBeat() {
    this._init();
    if (this.ctx.state === 'suspended') this.ctx.resume();
    this.isPlaying = true;
    this.nextBeatTime = this.ctx.currentTime + 0.05;
    this.currentBeat = 0;
    this.schedulerTimer = setInterval(() => this._schedule(), 25);
  }

  stopBeat() {
    this.isPlaying = false;
    clearInterval(this.schedulerTimer);
    this.schedulerTimer = null;
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    return this.isMuted;
  }

  _schedule() {
    const LOOK_AHEAD = 0.12;
    while (this.nextBeatTime < this.ctx.currentTime + LOOK_AHEAD) {
      this._playBeat(this.nextBeatTime, this.currentBeat);
      this.nextBeatTime += this.beatInterval / 2;
      this.currentBeat = (this.currentBeat + 1) % 8;
    }
  }

  _playBeat(time, beat) {
    if (this.isMuted) return;
    if (beat === 0 || beat === 4) this._kick(time);
    if (beat === 2 || beat === 6) this._snare(time);
    this._hihat(time, beat === 0 || beat === 4 ? 0.15 : 0.25);
    if (beat === 0 || beat === 3 || beat === 5) this._bass(time);
  }

  _kick(time) {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain); gain.connect(this.ctx.destination);
    osc.frequency.setValueAtTime(180, time);
    osc.frequency.exponentialRampToValueAtTime(0.01, time + 0.4);
    gain.gain.setValueAtTime(1.2, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.4);
    osc.start(time); osc.stop(time + 0.4);
  }

  _snare(time) {
    const bufSize = Math.floor(this.ctx.sampleRate * 0.1);
    const buf = this.ctx.createBuffer(1, bufSize, this.ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) data[i] = (Math.random() * 2 - 1);
    const src = this.ctx.createBufferSource();
    src.buffer = buf;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass'; filter.frequency.value = 2000; filter.Q.value = 0.5;
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.7, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.1);
    src.connect(filter); filter.connect(gain); gain.connect(this.ctx.destination);
    src.start(time);
  }

  _hihat(time, vol = 0.2) {
    const bufSize = Math.floor(this.ctx.sampleRate * 0.04);
    const buf = this.ctx.createBuffer(1, bufSize, this.ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) data[i] = (Math.random() * 2 - 1);
    const src = this.ctx.createBufferSource();
    src.buffer = buf;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass'; filter.frequency.value = 9000;
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(vol, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.04);
    src.connect(filter); filter.connect(gain); gain.connect(this.ctx.destination);
    src.start(time);
  }

  _bass(time) {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(80, time);
    gain.gain.setValueAtTime(0.3, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.15);
    osc.connect(gain); gain.connect(this.ctx.destination);
    osc.start(time); osc.stop(time + 0.15);
  }

  playSFX(name) {
    this._init();
    if (this.isMuted) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();
    const t = this.ctx.currentTime;
    switch (name) {
      case 'bounce': this._sfxBounce(t); break;
      case 'jump':   this._sfxJump(t);   break;
      case 'combo':  this._sfxCombo(t);  break;
      case 'click':  this._sfxClick(t);  break;
      case 'land':   this._sfxLand(t);   break;
    }
  }

  _sfxBounce(t) {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.frequency.setValueAtTime(200, t);
    osc.frequency.exponentialRampToValueAtTime(400, t + 0.08);
    gain.gain.setValueAtTime(0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
    osc.connect(gain); gain.connect(this.ctx.destination);
    osc.start(t); osc.stop(t + 0.1);
  }

  _sfxJump(t) {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.frequency.setValueAtTime(300, t);
    osc.frequency.exponentialRampToValueAtTime(700, t + 0.15);
    gain.gain.setValueAtTime(0.5, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
    osc.connect(gain); gain.connect(this.ctx.destination);
    osc.start(t); osc.stop(t + 0.2);
  }

  _sfxCombo(t) {
    [440, 550, 660].forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const start = t + i * 0.05;
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, start);
      gain.gain.setValueAtTime(0.4, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.2);
      osc.connect(gain); gain.connect(this.ctx.destination);
      osc.start(start); osc.stop(start + 0.25);
    });
  }

  _sfxClick(t) {
    const bufSize = Math.floor(this.ctx.sampleRate * 0.02);
    const buf = this.ctx.createBuffer(1, bufSize, this.ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / bufSize);
    const src = this.ctx.createBufferSource();
    src.buffer = buf;
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.5, t);
    src.connect(gain); gain.connect(this.ctx.destination);
    src.start(t);
  }

  _sfxLand(t) {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.frequency.setValueAtTime(120, t);
    osc.frequency.exponentialRampToValueAtTime(0.01, t + 0.15);
    gain.gain.setValueAtTime(0.6, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
    osc.connect(gain); gain.connect(this.ctx.destination);
    osc.start(t); osc.stop(t + 0.15);
  }
}
