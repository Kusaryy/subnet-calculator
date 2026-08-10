# Booty-Bouncer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a fully playable HTML5 + Electron cartoon dance game "Booty-Bouncer" with intro, menu, 60s gameplay, result screen, combo system, and procedural Web Audio beat — no external asset files required.

**Architecture:** Single Canvas game loop in `game.js` drives a 4-state machine. `character.js` owns all drawing + keyframe animation. `audio.js` synthesizes beat and SFX via Web Audio API. `combo.js` handles input buffering and combo detection. All wired together in `src/index.html`.

**Tech Stack:** Electron 28, HTML5 Canvas 2D, Web Audio API, Vanilla JS ES6+, electron-builder (NSIS + Portable)

**Design Spec:** `docs/superpowers/specs/2026-04-24-booty-bouncer-design.md`

---

## File Map

| File | Responsibility |
|---|---|
| `main.js` | Electron main process, BrowserWindow |
| `src/index.html` | Canvas element, script load order |
| `src/styles.css` | Fullscreen layout, no scrollbars |
| `src/audio.js` | AudioEngine class — beat scheduling + SFX |
| `src/combo.js` | InputBuffer class — key history + combo detection |
| `src/character.js` | Character class — Canvas drawing + animation system |
| `src/game.js` | Game class — state machine, loop, HUD, screens, score |
| `package.json` | Electron + electron-builder config |
| `PROJECT_PLAN.md` | Session-persistent task tracker |
| `HANDOFF.md` | Handoff notes for continuation |
| `README.md` | Start + build instructions |

---

### Task 1: Project Scaffold

**Files:**
- Create: `booty-bouncer/package.json`
- Create: `booty-bouncer/main.js`
- Create: `booty-bouncer/src/index.html`
- Create: `booty-bouncer/src/styles.css`
- Create: `booty-bouncer/src/audio.js` (empty stub)
- Create: `booty-bouncer/src/combo.js` (empty stub)
- Create: `booty-bouncer/src/character.js` (empty stub)
- Create: `booty-bouncer/src/game.js` (empty stub)

- [ ] **Step 1: Create project directory**

```bash
mkdir -p /mnt/data/code-projects/booty-bouncer/src
mkdir -p /mnt/data/code-projects/booty-bouncer/assets
cd /mnt/data/code-projects/booty-bouncer
```

- [ ] **Step 2: Write `package.json`**

```json
{
  "name": "booty-bouncer",
  "version": "1.0.0",
  "description": "The most ridiculous cartoon dance game ever created",
  "main": "main.js",
  "scripts": {
    "start": "electron .",
    "build": "electron-builder --win --x64",
    "build:linux": "electron-builder --linux --x64"
  },
  "devDependencies": {
    "electron": "^28.3.3",
    "electron-builder": "^24.13.3"
  },
  "build": {
    "appId": "com.bootybouncer.app",
    "productName": "Booty-Bouncer",
    "directories": { "output": "dist" },
    "win": {
      "target": [
        { "target": "nsis", "arch": ["x64"] },
        { "target": "portable", "arch": ["x64"] }
      ]
    },
    "nsis": {
      "oneClick": true,
      "createDesktopShortcut": true
    },
    "linux": {
      "target": [{ "target": "AppImage", "arch": ["x64"] }],
      "category": "Game"
    }
  }
}
```

- [ ] **Step 3: Write `main.js`**

```js
const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 900,
    height: 700,
    resizable: false,
    title: 'Booty-Bouncer',
    backgroundColor: '#1A0A2E',
    webPreferences: { nodeIntegration: false, contextIsolation: true }
  });
  win.setMenuBarVisibility(false);
  win.loadFile(path.join(__dirname, 'src', 'index.html'));
}

app.whenReady().then(createWindow);
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
```

- [ ] **Step 4: Write `src/index.html`**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Booty-Bouncer</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <canvas id="gameCanvas" width="900" height="700"></canvas>
  <script src="audio.js"></script>
  <script src="combo.js"></script>
  <script src="character.js"></script>
  <script src="game.js"></script>
</body>
</html>
```

- [ ] **Step 5: Write `src/styles.css`**

```css
* { margin: 0; padding: 0; box-sizing: border-box; }
html, body {
  width: 100%; height: 100%;
  background: #1A0A2E;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}
canvas { display: block; cursor: default; }
```

- [ ] **Step 6: Create empty stubs for the 4 JS files**

Each file gets one line so the HTML doesn't throw errors:

`src/audio.js`: `// AudioEngine`
`src/combo.js`: `// InputBuffer`  
`src/character.js`: `// Character`  
`src/game.js`: `// Game`

- [ ] **Step 7: Install dependencies**

```bash
cd /mnt/data/code-projects/booty-bouncer && npm install
```
Expected: `node_modules/` created, no errors.

- [ ] **Step 8: Verify window opens**

```bash
npm start
```
Expected: Dark purple Electron window 900×700, blank canvas, no console errors.

- [ ] **Step 9: Commit**

```bash
git add -A && git commit -m "feat: scaffold booty-bouncer project"
```

---

### Task 2: Audio Engine

**Files:**
- Modify: `booty-bouncer/src/audio.js`

- [ ] **Step 1: Write complete `src/audio.js`**

```js
class AudioEngine {
  constructor() {
    this.ctx = null;
    this.isPlaying = false;
    this.isMuted = false;
    this.nextBeatTime = 0;
    this.currentBeat = 0;
    this.schedulerTimer = null;
    this.BPM = 128;
    this.beatInterval = 60 / this.BPM; // seconds per quarter note
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
      this.nextBeatTime += this.beatInterval / 2; // 8th notes
      this.currentBeat = (this.currentBeat + 1) % 8;
    }
  }

  _playBeat(time, beat) {
    if (this.isMuted) return;
    // Kick: beats 0, 4
    if (beat === 0 || beat === 4) this._kick(time);
    // Snare: beats 2, 6
    if (beat === 2 || beat === 6) this._snare(time);
    // Hihat: every 8th note
    this._hihat(time, beat === 0 || beat === 4 ? 0.15 : 0.25);
    // Bass stab: beats 0, 3, 5
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
```

- [ ] **Step 2: Smoke-test audio in browser console**

In `npm start`, open DevTools (Ctrl+Shift+I), paste:
```js
const a = new AudioEngine(); a.startBeat();
```
Expected: Audible kick+hihat beat pattern starts.
Then: `a.stopBeat()` — beat stops.

- [ ] **Step 3: Commit**

```bash
git add src/audio.js && git commit -m "feat: add Web Audio beat engine and SFX"
```

---

### Task 3: Combo System

**Files:**
- Modify: `booty-bouncer/src/combo.js`

- [ ] **Step 1: Write complete `src/combo.js`**

```js
const COMBO_DEFINITIONS = [
  {
    id: 'twerk_storm',
    sequence: ['w', 'a'],
    label: 'TWERK STORM',
    rating: 'Nice',
    multiplierBonus: 0.5,
    animation: 'combo_twerk_storm',
  },
  {
    id: 'booty_blast',
    sequence: ['w', 'd'],
    label: 'BOOTY BLAST',
    rating: 'Dope',
    multiplierBonus: 1.0,
    animation: 'combo_booty_blast',
  },
  {
    id: 'bounce_slam',
    sequence: ['a', 'a', ' '],
    label: 'BOUNCE SLAM',
    rating: 'Wild',
    multiplierBonus: 1.5,
    animation: 'combo_bounce_slam',
  },
  {
    id: 'ground_shaker',
    sequence: ['s', 'd', ' '],
    label: 'GROUND SHAKER',
    rating: 'Legendary',
    multiplierBonus: 2.0,
    animation: 'combo_ground_shaker',
  },
];

class InputBuffer {
  constructor() {
    this.buffer = [];           // { key, time }
    this.MAX_WINDOW = 800;      // ms
    this.MAX_LENGTH = 5;
    this.onCombo = null;        // callback(comboDef)
  }

  push(key) {
    const now = Date.now();
    // Prune stale entries
    this.buffer = this.buffer.filter(e => now - e.time < this.MAX_WINDOW);
    this.buffer.push({ key: key.toLowerCase(), time: now });
    if (this.buffer.length > this.MAX_LENGTH) this.buffer.shift();
    this._check();
  }

  _check() {
    const keys = this.buffer.map(e => e.key);
    // Check longest combos first
    const sorted = [...COMBO_DEFINITIONS].sort((a, b) => b.sequence.length - a.sequence.length);
    for (const combo of sorted) {
      const seq = combo.sequence;
      if (keys.length < seq.length) continue;
      const tail = keys.slice(-seq.length);
      if (seq.every((k, i) => k === tail[i])) {
        this.buffer = [];
        if (this.onCombo) this.onCombo(combo);
        return;
      }
    }
  }

  clear() {
    this.buffer = [];
  }
}
```

- [ ] **Step 2: Verify combo logic manually (DevTools console)**

```js
const buf = new InputBuffer();
buf.onCombo = c => console.log('COMBO:', c.label);
buf.push('w'); buf.push('a');
```
Expected console output: `COMBO: TWERK STORM`

```js
buf.push('a'); buf.push('a'); buf.push(' ');
```
Expected: `COMBO: BOUNCE SLAM`

- [ ] **Step 3: Commit**

```bash
git add src/combo.js && git commit -m "feat: add combo input buffer and detection"
```

---

### Task 4: Character Drawing — Front View (Intro)

**Files:**
- Modify: `booty-bouncer/src/character.js`

- [ ] **Step 1: Write character.js with front-view drawing**

```js
class Character {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.cx = canvas.width / 2;
    this.cy = canvas.height / 2;

    // Animation state
    this.currentAnim = 'idle';
    this.animProgress = 0;   // 0..1
    this.animDuration = 0;   // ms
    this.animElapsed = 0;    // ms
    this.animQueue = [];
    this.transforms = this._defaultTransforms();

    // Effects
    this.shake = { x: 0, y: 0, timer: 0, intensity: 0 };
    this.flash = { alpha: 0, timer: 0, color: '#ffffff' };
    this.particles = [];
    this.ratingPopup = null;
  }

  _defaultTransforms() {
    return {
      offsetX: 0, offsetY: 0,
      scaleX: 1, scaleY: 1,
      rotation: 0,
      bootyScaleX: 1, bootyScaleY: 1,
      bootyOffsetY: 0,
      lean: 0,           // sideways lean -1..1
    };
  }

  // ── FRONT VIEW ────────────────────────────────────────────────
  drawFront(cx, cy, t = this._defaultTransforms(), introT = 0) {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(cx + t.offsetX, cy + t.offsetY);
    ctx.scale(t.scaleX, t.scaleY);
    ctx.rotate(t.rotation);

    // Shadow
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.ellipse(0, 170, 80, 20, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Booty (front — wide hips peeking from sides)
    ctx.save();
    ctx.fillStyle = '#A0522D';
    ctx.beginPath();
    ctx.ellipse(-90, 100, 50, 70, -0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(90, 100, 50, 70, 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Pants (lower body)
    ctx.fillStyle = '#4A90D9';
    ctx.beginPath();
    ctx.roundRect(-55, 80, 110, 90, [10]);
    ctx.fill();

    // Belt
    ctx.fillStyle = '#2C1810';
    ctx.fillRect(-55, 78, 110, 14);
    ctx.fillStyle = '#FFD700';
    ctx.fillRect(-10, 80, 20, 10);

    // Shirt
    ctx.fillStyle = '#FF6B35';
    ctx.beginPath();
    ctx.roundRect(-65, -60, 130, 148, [15, 15, 0, 0]);
    ctx.fill();

    // Shirt detail (collar)
    ctx.fillStyle = '#FF8C5A';
    ctx.beginPath();
    ctx.moveTo(-20, -60);
    ctx.lineTo(0, -30);
    ctx.lineTo(20, -60);
    ctx.fill();

    // Left arm
    ctx.save();
    ctx.fillStyle = '#A0522D';
    ctx.beginPath();
    ctx.ellipse(-90, 20, 22, 65, 0.25, 0, Math.PI * 2);
    ctx.fill();
    // Left hand
    ctx.beginPath();
    ctx.arc(-98, 85, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Right arm
    ctx.save();
    ctx.fillStyle = '#A0522D';
    ctx.beginPath();
    ctx.ellipse(90, 20, 22, 65, -0.25, 0, Math.PI * 2);
    ctx.fill();
    // Right hand
    ctx.beginPath();
    ctx.arc(98, 85, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Neck
    ctx.fillStyle = '#A0522D';
    ctx.beginPath();
    ctx.roundRect(-18, -75, 36, 20, [5]);
    ctx.fill();

    // Head
    ctx.fillStyle = '#A0522D';
    ctx.beginPath();
    ctx.ellipse(0, -130, 58, 62, 0, 0, Math.PI * 2);
    ctx.fill();

    // Afro
    ctx.fillStyle = '#1C1008';
    ctx.beginPath();
    ctx.ellipse(0, -165, 90, 75, 0, 0, Math.PI * 2);
    ctx.fill();
    // Afro texture bumps
    ctx.fillStyle = '#2C1810';
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const r = 70 + Math.sin(i * 1.7) * 12;
      ctx.beginPath();
      ctx.arc(Math.cos(angle) * r * 0.8, -165 + Math.sin(angle) * r * 0.7, 18, 0, Math.PI * 2);
      ctx.fill();
    }

    // Eyes (whites)
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.ellipse(-22, -135, 14, 13, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(22, -135, 14, 13, 0, 0, Math.PI * 2);
    ctx.fill();

    // Pupils
    ctx.fillStyle = '#1C1008';
    ctx.beginPath();
    ctx.arc(-20, -133, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(24, -133, 7, 0, Math.PI * 2);
    ctx.fill();

    // Smile
    ctx.strokeStyle = '#1C1008';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, -118, 20, 0.2, Math.PI - 0.2);
    ctx.stroke();

    // Glasses frames
    ctx.strokeStyle = '#2C2C2C';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.ellipse(-22, -135, 17, 16, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(22, -135, 17, 16, 0, 0, Math.PI * 2);
    ctx.stroke();
    // Bridge
    ctx.beginPath();
    ctx.moveTo(-5, -135);
    ctx.lineTo(5, -135);
    ctx.stroke();
    // Arms
    ctx.beginPath();
    ctx.moveTo(-39, -135);
    ctx.lineTo(-58, -128);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(39, -135);
    ctx.lineTo(58, -128);
    ctx.stroke();

    // Shoes
    ctx.fillStyle = '#FF4444';
    ctx.beginPath();
    ctx.ellipse(-32, 170, 32, 14, -0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(32, 170, 32, 14, 0.2, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  // ── BACK VIEW ─────────────────────────────────────────────────
  drawBack(cx, cy, t = this._defaultTransforms()) {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(cx + t.offsetX + this.shake.x, cy + t.offsetY + this.shake.y);
    ctx.scale(t.scaleX, t.scaleY);
    ctx.rotate(t.rotation + t.lean * 0.15);

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.beginPath();
    ctx.ellipse(0, 200, 110 * t.bootyScaleX, 22, 0, 0, Math.PI * 2);
    ctx.fill();

    // Shoes (back)
    ctx.fillStyle = '#CC2222';
    ctx.beginPath();
    ctx.ellipse(-40, 190, 34, 15, 0.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(40, 190, 34, 15, -0.1, 0, Math.PI * 2);
    ctx.fill();

    // Pants (back)
    ctx.fillStyle = '#3A7AC0';
    ctx.beginPath();
    ctx.roundRect(-60, 80, 120, 110, [5, 5, 20, 20]);
    ctx.fill();

    // Pants crease
    ctx.strokeStyle = '#2C5D9A';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, 85);
    ctx.lineTo(0, 185);
    ctx.stroke();

    // Belt
    ctx.fillStyle = '#2C1810';
    ctx.fillRect(-60, 78, 120, 14);
    ctx.fillStyle = '#FFD700';
    ctx.fillRect(-12, 80, 24, 10);

    // ── THE BOOTY ────────────────────────────────────────────────
    ctx.save();
    ctx.translate(0, t.bootyOffsetY);
    ctx.scale(t.bootyScaleX, t.bootyScaleY);

    // Left cheek
    ctx.fillStyle = '#A0522D';
    ctx.beginPath();
    ctx.arc(-38, 115, 72, 0, Math.PI * 2);
    ctx.fill();

    // Right cheek
    ctx.beginPath();
    ctx.arc(38, 115, 72, 0, Math.PI * 2);
    ctx.fill();

    // Booty highlight (sheen)
    ctx.fillStyle = 'rgba(255,200,150,0.15)';
    ctx.beginPath();
    ctx.ellipse(-42, 95, 35, 28, -0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(42, 95, 35, 28, 0.3, 0, Math.PI * 2);
    ctx.fill();

    // Crack line
    ctx.strokeStyle = 'rgba(100,40,10,0.5)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, 68);
    ctx.quadraticCurveTo(2, 120, 0, 170);
    ctx.stroke();

    ctx.restore();
    // ─────────────────────────────────────────────────────────────

    // Shirt (back)
    ctx.fillStyle = '#FF6B35';
    ctx.beginPath();
    ctx.roundRect(-65, -60, 130, 145, [15, 15, 0, 0]);
    ctx.fill();

    // Shirt back number "69" (humor)
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.font = 'bold 36px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('69', 0, 20);

    // Arms (back)
    ctx.fillStyle = '#A0522D';
    ctx.beginPath();
    ctx.ellipse(-85 + t.lean * -10, 20, 22, 60, 0.3 + t.lean * 0.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(85 + t.lean * -10, 20, 22, 60, -0.3 + t.lean * 0.1, 0, Math.PI * 2);
    ctx.fill();

    // Afro (back — big)
    ctx.fillStyle = '#1C1008';
    ctx.beginPath();
    ctx.ellipse(0, -145, 85, 70, 0, 0, Math.PI * 2);
    ctx.fill();
    // Afro bumps
    ctx.fillStyle = '#2C1810';
    for (let i = 0; i < 7; i++) {
      const angle = (i / 7) * Math.PI;  // half circle for back
      ctx.beginPath();
      ctx.arc(Math.cos(angle + 0.4) * 65, -145 + Math.sin(angle) * 50, 20, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }
}
```

- [ ] **Step 2: Add temporary test render in `game.js`**

```js
window.addEventListener('load', () => {
  const canvas = document.getElementById('gameCanvas');
  const char = new Character(canvas);
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#1A0A2E';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  char.drawFront(450, 420);
  char.drawBack(450, 420);
});
```

- [ ] **Step 3: Run and visually verify**

`npm start` — should show the character. Verify:
- Front view: Afro visible ✓, Glasses ✓, Orange shirt ✓, Wide hips ✓
- Back view: Two large butt cheeks prominent ✓, Afro from behind ✓

- [ ] **Step 4: Remove test code from game.js (revert to stub)**

- [ ] **Step 5: Commit**

```bash
git add src/character.js && git commit -m "feat: add character front and back view drawing"
```

---

### Task 5: Animation System

**Files:**
- Modify: `booty-bouncer/src/character.js` — add animation methods

- [ ] **Step 1: Add easing functions and animation system to Character class**

Add these methods to the `Character` class after the constructor:

```js
// ── EASING ────────────────────────────────────────────────────
_easeOutBounce(t) {
  const n1 = 7.5625, d1 = 2.75;
  if (t < 1/d1)       return n1*t*t;
  if (t < 2/d1)       return n1*(t-=1.5/d1)*t+0.75;
  if (t < 2.5/d1)     return n1*(t-=2.25/d1)*t+0.9375;
  return n1*(t-=2.625/d1)*t+0.984375;
}

_easeOutElastic(t) {
  if (t === 0 || t === 1) return t;
  return Math.pow(2, -10*t) * Math.sin((t*10-0.75)*(2*Math.PI)/3) + 1;
}

_easeInOutQuad(t) {
  return t < 0.5 ? 2*t*t : 1-Math.pow(-2*t+2,2)/2;
}

_lerp(a, b, t) { return a + (b - a) * t; }

// ── ANIMATION TRIGGER ─────────────────────────────────────────
triggerAnimation(name) {
  const def = ANIMATIONS[name];
  if (!def) return;
  this.currentAnim = name;
  this.animElapsed = 0;
  this.animDuration = def.duration;
  this.animActive = true;
}

// ── UPDATE (call every frame with dt in ms) ───────────────────
update(dt) {
  // Screen shake
  if (this.shake.timer > 0) {
    this.shake.timer -= dt;
    const s = this.shake.intensity * (this.shake.timer / 200);
    this.shake.x = (Math.random()-0.5)*2*s;
    this.shake.y = (Math.random()-0.5)*2*s;
  } else {
    this.shake.x = 0; this.shake.y = 0;
  }

  // Flash
  if (this.flash.timer > 0) {
    this.flash.timer -= dt;
    this.flash.alpha = this.flash.timer / 200;
  } else {
    this.flash.alpha = 0;
  }

  // Particles
  this.particles = this.particles.filter(p => p.life > 0);
  this.particles.forEach(p => {
    p.x += p.vx * (dt/16);
    p.y += p.vy * (dt/16);
    p.vy += 0.3 * (dt/16);  // gravity
    p.life -= dt;
    p.alpha = p.life / p.maxLife;
  });

  // Rating popup
  if (this.ratingPopup) {
    this.ratingPopup.timer -= dt;
    if (this.ratingPopup.timer <= 0) this.ratingPopup = null;
  }

  // Current animation
  if (!this.animActive) {
    // Idle
    const idleT = (Date.now() % 600) / 600;
    const bounce = Math.sin(idleT * Math.PI * 2) * 0.5 + 0.5;
    this.transforms = this._defaultTransforms();
    this.transforms.offsetY = bounce * -8;
    this.transforms.bootyScaleY = 1 + bounce * 0.06;
    return;
  }

  this.animElapsed += dt;
  const rawT = Math.min(this.animElapsed / this.animDuration, 1);

  const def = ANIMATIONS[this.currentAnim];
  if (def) {
    this.transforms = def.apply(rawT, this);
  }

  if (rawT >= 1) {
    this.animActive = false;
    this.transforms = this._defaultTransforms();
  }
}

// ── EFFECTS ───────────────────────────────────────────────────
screenShake(intensity = 12, duration = 200) {
  this.shake.intensity = intensity;
  this.shake.timer = duration;
}

flashEffect(color = '#ffffff', duration = 150) {
  this.flash.color = color;
  this.flash.alpha = 1;
  this.flash.timer = duration;
}

spawnParticles(x, y, count = 12, color = '#FFD700') {
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2;
    const speed = 3 + Math.random() * 4;
    this.particles.push({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 3,
      color,
      size: 5 + Math.random() * 8,
      life: 600 + Math.random() * 400,
      maxLife: 800,
      alpha: 1,
    });
  }
}

showRating(text, color = '#FFD700') {
  this.ratingPopup = { text, color, timer: 1200, maxTimer: 1200 };
}

// ── DRAW EFFECTS ──────────────────────────────────────────────
drawEffects(cx, cy) {
  const ctx = this.ctx;
  // Particles
  this.particles.forEach(p => {
    ctx.save();
    ctx.globalAlpha = p.alpha;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });

  // Flash overlay
  if (this.flash.alpha > 0) {
    ctx.save();
    ctx.globalAlpha = this.flash.alpha * 0.5;
    ctx.fillStyle = this.flash.color;
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    ctx.restore();
  }

  // Rating popup
  if (this.ratingPopup) {
    const p = this.ratingPopup;
    const progress = 1 - p.timer / p.maxTimer;
    const y = cy - 180 - progress * 60;
    const alpha = p.timer < 300 ? p.timer / 300 : 1;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.font = 'bold 52px Arial Black, Arial';
    ctx.textAlign = 'center';
    ctx.fillStyle = p.color;
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 5;
    ctx.strokeText(p.text, cx, y);
    ctx.fillText(p.text, cx, y);
    ctx.restore();
  }
}
```

- [ ] **Step 2: Add ANIMATIONS constant (before the class definition)**

```js
const ANIMATIONS = {
  idle: {
    duration: 600,
    apply(t, char) {
      const transforms = char._defaultTransforms();
      const bounce = Math.sin(t * Math.PI * 2) * 0.5 + 0.5;
      transforms.offsetY = bounce * -8;
      transforms.bootyScaleY = 1 + bounce * 0.06;
      return transforms;
    }
  },

  bounce_w: {
    duration: 350,
    apply(t, char) {
      const transforms = char._defaultTransforms();
      const peak = t < 0.4 ? t / 0.4 : 1 - (t - 0.4) / 0.6;
      transforms.offsetY = -peak * 35;
      transforms.lean = peak * 0.3;
      transforms.bootyScaleY = 1 + peak * 0.25;
      transforms.bootyOffsetY = peak * -15;
      transforms.scaleY = 1 - peak * 0.05;
      transforms.scaleX = 1 + peak * 0.05;
      return transforms;
    }
  },

  bounce_a: {
    duration: 300,
    apply(t, char) {
      const transforms = char._defaultTransforms();
      const shake = Math.sin(t * Math.PI * 3) * (1 - t);
      transforms.offsetX = shake * -40;
      transforms.lean = shake * -0.4;
      transforms.bootyScaleX = 1 + Math.abs(shake) * 0.3;
      transforms.bootyOffsetY = Math.abs(shake) * -8;
      return transforms;
    }
  },

  bounce_s: {
    duration: 350,
    apply(t, char) {
      const transforms = char._defaultTransforms();
      const peak = t < 0.4 ? t / 0.4 : 1 - (t - 0.4) / 0.6;
      transforms.offsetY = peak * 20;
      transforms.scaleY = 1 - peak * 0.1;
      transforms.scaleX = 1 + peak * 0.12;
      transforms.bootyScaleX = 1 + peak * 0.35;
      transforms.bootyScaleY = 1 + peak * 0.2;
      transforms.bootyOffsetY = peak * 12;
      return transforms;
    }
  },

  bounce_d: {
    duration: 300,
    apply(t, char) {
      const transforms = char._defaultTransforms();
      const shake = Math.sin(t * Math.PI * 3) * (1 - t);
      transforms.offsetX = shake * 40;
      transforms.lean = shake * 0.4;
      transforms.bootyScaleX = 1 + Math.abs(shake) * 0.3;
      transforms.bootyOffsetY = Math.abs(shake) * -8;
      return transforms;
    }
  },

  jump: {
    duration: 600,
    apply(t, char) {
      const transforms = char._defaultTransforms();
      if (t < 0.4) {
        // Anticipation squash
        const sq = t / 0.4;
        transforms.offsetY = sq * 20;
        transforms.scaleY = 1 - sq * 0.15;
        transforms.scaleX = 1 + sq * 0.12;
      } else if (t < 0.7) {
        // Air time
        const air = (t - 0.4) / 0.3;
        transforms.offsetY = -air * (1 - air) * 4 * 140;
        transforms.scaleY = 1 + air * 0.1;
        transforms.bootyScaleY = 0.85 + air * 0.15;
      } else {
        // Landing squash
        const land = (t - 0.7) / 0.3;
        const squash = char._easeOutBounce(land);
        transforms.offsetY = 0;
        transforms.scaleY = 1 - (1-land) * 0.25;
        transforms.scaleX = 1 + (1-land) * 0.25;
        transforms.bootyScaleY = 1 + (1-squash) * 0.4;
        transforms.bootyOffsetY = (1-squash) * 20;
      }
      return transforms;
    }
  },

  // ── COMBOS ─────────────────────────────────────────────────────
  combo_twerk_storm: {
    duration: 800,
    apply(t, char) {
      const transforms = char._defaultTransforms();
      const twerk = Math.sin(t * Math.PI * 10) * (1 - t * 0.3);
      transforms.lean = twerk * 0.5;
      transforms.bootyScaleY = 1 + Math.abs(twerk) * 0.5;
      transforms.bootyScaleX = 1 + (1 - Math.abs(twerk)) * 0.15;
      transforms.offsetY = Math.abs(twerk) * -10;
      return transforms;
    }
  },

  combo_booty_blast: {
    duration: 700,
    apply(t, char) {
      const transforms = char._defaultTransforms();
      const blast = t < 0.3 ? t / 0.3 : char._easeOutBounce((t - 0.3) / 0.7);
      transforms.bootyScaleX = 1 + (t < 0.3 ? blast * 0.8 : (1 - blast) * 0.8);
      transforms.bootyScaleY = 1 + (t < 0.3 ? blast * 0.6 : (1 - blast) * 0.6);
      transforms.offsetY = t < 0.3 ? blast * -20 : (1-blast) * -20;
      transforms.lean = Math.sin(t * Math.PI * 2) * 0.3;
      return transforms;
    }
  },

  combo_bounce_slam: {
    duration: 900,
    apply(t, char) {
      const transforms = char._defaultTransforms();
      if (t < 0.5) {
        // Side-to-side
        const slide = Math.sin(t * Math.PI * 4);
        transforms.offsetX = slide * 50;
        transforms.lean = slide * 0.4;
      } else {
        // Jump and slam
        const slam = (t - 0.5) / 0.5;
        if (slam < 0.6) {
          transforms.offsetY = -slam * (1-slam) * 4 * 120;
        } else {
          const land = (slam - 0.6) / 0.4;
          transforms.scaleY = 1 - (1-land) * 0.3;
          transforms.scaleX = 1 + (1-land) * 0.3;
          transforms.bootyScaleX = 1 + (1-char._easeOutBounce(land)) * 0.6;
          transforms.bootyScaleY = 1 + (1-char._easeOutBounce(land)) * 0.4;
        }
      }
      return transforms;
    }
  },

  combo_ground_shaker: {
    duration: 1000,
    apply(t, char) {
      const transforms = char._defaultTransforms();
      const spin = t < 0.4 ? t / 0.4 : 1;
      transforms.rotation = spin * Math.PI * 0.25 * Math.sin(t * Math.PI);
      transforms.bootyScaleX = 1 + Math.abs(Math.sin(t * Math.PI * 3)) * 0.4;
      transforms.bootyScaleY = 1 + Math.abs(Math.sin(t * Math.PI * 3)) * 0.3;
      transforms.offsetY = Math.sin(t * Math.PI) * -60;
      if (t > 0.7) {
        transforms.scaleY = 1 - (t - 0.7) / 0.3 * 0.25;
        transforms.scaleX = 1 + (t - 0.7) / 0.3 * 0.25;
      }
      return transforms;
    }
  },
};
```

- [ ] **Step 3: Verify animations run**

Temporary test in game.js:
```js
window.addEventListener('load', () => {
  const canvas = document.getElementById('gameCanvas');
  const char = new Character(canvas);
  const ctx = canvas.getContext('2d');
  char.triggerAnimation('bounce_w');
  let last = performance.now();
  function loop(now) {
    const dt = now - last; last = now;
    ctx.fillStyle = '#1A0A2E'; ctx.fillRect(0, 0, canvas.width, canvas.height);
    char.update(dt);
    char.drawBack(450, 450, char.transforms);
    char.drawEffects(450, 450);
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
  setInterval(() => {
    const keys = ['bounce_w','bounce_a','bounce_s','bounce_d','jump','combo_twerk_storm'];
    char.triggerAnimation(keys[Math.floor(Math.random()*keys.length)]);
  }, 800);
});
```

`npm start` — verify each animation looks distinct and bouncy. All 6 core + 4 combos should be visible.

- [ ] **Step 4: Remove test code**

- [ ] **Step 5: Commit**

```bash
git add src/character.js && git commit -m "feat: add animation system with easing and effects"
```

---

### Task 6: Main Game Loop & State Machine

**Files:**
- Modify: `booty-bouncer/src/game.js`

- [ ] **Step 1: Write complete `src/game.js`**

```js
// ── CONSTANTS ──────────────────────────────────────────────────
const STATE = { INTRO: 'INTRO', MENU: 'MENU', GAMEPLAY: 'GAMEPLAY', RESULT: 'RESULT' };
const CANVAS_W = 900, CANVAS_H = 700;
const GAME_DURATION = 60; // seconds
const INPUT_MAP = { w: 'bounce_w', a: 'bounce_a', s: 'bounce_s', d: 'bounce_d', ' ': 'jump' };
const SFX_MAP  = { w: 'bounce', a: 'bounce', s: 'bounce', d: 'bounce', ' ': 'jump' };

const RATING_COLORS = {
  'Nice':      '#88FF88',
  'Dope':      '#FFDD00',
  'Wild':      '#FF8800',
  'Legendary': '#FF44FF',
};

// ── GAME STATE ─────────────────────────────────────────────────
const game = {
  state: STATE.INTRO,
  introTimer: 0,       // ms
  introDone: false,
  score: 0,
  bestScore: 0,
  multiplier: 1,
  multiplierTimer: 0,  // decay timer ms
  comboCount: 0,
  bestCombo: 0,
  timeLeft: GAME_DURATION,
  gameTimer: 0,
  menuButtons: [],
  resultButtons: [],
  musicOn: true,
  keys: {},            // currently held keys (for combo display)
  lastInputTime: 0,
};

// ── INSTANCES ──────────────────────────────────────────────────
let canvas, ctx, char, audio, inputBuf;
let lastTime = 0;
let introCharAnim = 0;

// ── SETUP ──────────────────────────────────────────────────────
window.addEventListener('load', () => {
  canvas = document.getElementById('gameCanvas');
  ctx    = canvas.getContext('2d');
  char   = new Character(canvas);
  audio  = new AudioEngine();
  inputBuf = new InputBuffer();

  inputBuf.onCombo = handleCombo;

  window.addEventListener('keydown', onKeyDown);

  // Build menu buttons
  game.menuButtons = [
    { label: 'START GAME',    x: 450, y: 360, w: 280, h: 60, action: startGame },
    { label: 'MUSIC ON',      x: 450, y: 440, w: 280, h: 60, action: toggleMusic, id: 'music' },
    { label: 'QUIT',          x: 450, y: 520, w: 280, h: 60, action: () => window.close() },
  ];
  game.resultButtons = [
    { label: 'RETRY',         x: 450, y: 480, w: 220, h: 60, action: startGame },
    { label: 'MAIN MENU',     x: 450, y: 560, w: 220, h: 60, action: goMenu },
  ];

  canvas.addEventListener('click', onCanvasClick);

  requestAnimationFrame(loop);
});

// ── GAME LOOP ──────────────────────────────────────────────────
function loop(now) {
  const dt = Math.min(now - lastTime, 50); // cap at 50ms
  lastTime = now;

  update(dt);
  render();

  requestAnimationFrame(loop);
}

function update(dt) {
  char.update(dt);

  switch (game.state) {
    case STATE.INTRO:
      game.introTimer += dt;
      introCharAnim = Math.min(game.introTimer / 600, 1);
      if (game.introTimer > 3200) goMenu();
      break;

    case STATE.GAMEPLAY:
      game.gameTimer += dt;
      game.timeLeft = Math.max(0, GAME_DURATION - game.gameTimer / 1000);

      // Multiplier decay
      if (game.multiplierTimer > 0) {
        game.multiplierTimer -= dt;
        if (game.multiplierTimer <= 0) {
          game.multiplier = Math.max(1, game.multiplier - 0.5);
          game.multiplierTimer = game.multiplier > 1 ? 2000 : 0;
        }
      }

      if (game.timeLeft <= 0) endGame();
      break;
  }
}

// ── INPUT ──────────────────────────────────────────────────────
function onKeyDown(e) {
  const key = e.key.toLowerCase();
  if (e.repeat) return;

  if (game.state === STATE.GAMEPLAY && INPUT_MAP[key]) {
    e.preventDefault();
    // Check combo first
    inputBuf.push(key);
    // If no combo fired, trigger normal anim
    if (!char.animActive || char.currentAnim.startsWith('combo_') === false) {
      char.triggerAnimation(INPUT_MAP[key]);
    }
    audio.playSFX(SFX_MAP[key]);
    addScore(10);
  }

  if (key === 'escape' && game.state === STATE.GAMEPLAY) goMenu();
}

function handleCombo(comboDef) {
  // Override with combo animation
  char.triggerAnimation(comboDef.animation);
  audio.playSFX('combo');
  char.screenShake(16, 300);
  char.flashEffect(RATING_COLORS[comboDef.rating] || '#ffffff', 200);
  char.spawnParticles(450, 420, 18, RATING_COLORS[comboDef.rating] || '#FFD700');
  char.showRating(comboDef.rating, RATING_COLORS[comboDef.rating]);

  // Score
  addScore(50);
  game.multiplier = Math.min(8, game.multiplier + comboDef.multiplierBonus);
  game.multiplierTimer = 3000;
  game.comboCount++;
  game.bestCombo = Math.max(game.bestCombo, game.comboCount);
}

function addScore(base) {
  game.score += Math.floor(base * game.multiplier);
}

// ── STATE TRANSITIONS ──────────────────────────────────────────
function goMenu() {
  game.state = STATE.MENU;
  audio.stopBeat();
  char.animActive = false;
}

function startGame() {
  game.state = STATE.GAMEPLAY;
  game.score = 0;
  game.multiplier = 1;
  game.multiplierTimer = 0;
  game.comboCount = 0;
  game.bestCombo = 0;
  game.timeLeft = GAME_DURATION;
  game.gameTimer = 0;
  inputBuf.clear();
  char.animActive = false;
  char.particles = [];
  if (game.musicOn) audio.startBeat();
  audio.playSFX('click');
}

function endGame() {
  game.state = STATE.RESULT;
  game.bestScore = Math.max(game.bestScore, game.score);
  audio.stopBeat();
}

function toggleMusic() {
  game.musicOn = audio.toggleMute();
  // Update button label
  const btn = game.menuButtons.find(b => b.id === 'music');
  if (btn) btn.label = game.musicOn ? 'MUSIC ON' : 'MUSIC OFF';
  audio.playSFX('click');
}

// ── CLICK HANDLING ─────────────────────────────────────────────
function onCanvasClick(e) {
  const rect = canvas.getBoundingClientRect();
  const mx = e.clientX - rect.left;
  const my = e.clientY - rect.top;

  const buttons =
    game.state === STATE.MENU   ? game.menuButtons :
    game.state === STATE.RESULT ? game.resultButtons : [];

  for (const btn of buttons) {
    if (mx > btn.x - btn.w/2 && mx < btn.x + btn.w/2 &&
        my > btn.y - btn.h/2 && my < btn.y + btn.h/2) {
      audio.playSFX('click');
      btn.action();
      return;
    }
  }

  // Click-through on intro → skip to menu
  if (game.state === STATE.INTRO) goMenu();
}

// ── RENDER ─────────────────────────────────────────────────────
function render() {
  ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);

  switch (game.state) {
    case STATE.INTRO:    renderIntro();    break;
    case STATE.MENU:     renderMenu();     break;
    case STATE.GAMEPLAY: renderGameplay(); break;
    case STATE.RESULT:   renderResult();   break;
  }
}

// ── RENDER: INTRO ──────────────────────────────────────────────
function renderIntro() {
  // BG gradient
  const grad = ctx.createLinearGradient(0, 0, 0, CANVAS_H);
  grad.addColorStop(0, '#2D0A5E');
  grad.addColorStop(1, '#1A0A2E');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

  // Spotlight
  const spot = ctx.createRadialGradient(450, 400, 0, 450, 400, 350);
  spot.addColorStop(0, 'rgba(255,200,100,0.15)');
  spot.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = spot;
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

  // Character slide-in
  const slideT = _easeOutBounce(Math.min(game.introTimer / 800, 1));
  const charY = CANVAS_H - 120 + (1 - slideT) * 300;
  const scale = 0.85 + slideT * 0.15;
  ctx.save();
  ctx.translate(450, charY);
  ctx.scale(scale, scale);
  ctx.translate(-450, -charY);
  char.drawFront(450, charY);
  ctx.restore();

  // Title
  const titleAlpha = Math.min((game.introTimer - 600) / 500, 1);
  if (titleAlpha > 0) {
    const bounce = 1 + Math.sin(game.introTimer / 300) * 0.04;
    ctx.save();
    ctx.globalAlpha = titleAlpha;
    ctx.translate(450, 80);
    ctx.scale(bounce, bounce);
    ctx.translate(-450, -80);
    ctx.font = 'bold 80px Arial Black, Arial';
    ctx.textAlign = 'center';
    ctx.strokeStyle = '#FF6B35';
    ctx.lineWidth = 8;
    ctx.strokeText('BOOTY-BOUNCER', 450, 90);
    ctx.fillStyle = '#FFD700';
    ctx.fillText('BOOTY-BOUNCER', 450, 90);
    ctx.restore();
  }

  // Subtitle
  const subAlpha = Math.min((game.introTimer - 1200) / 500, 1);
  if (subAlpha > 0) {
    ctx.save();
    ctx.globalAlpha = subAlpha;
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#FF8C5A';
    ctx.fillText('SHAKE IT OR LOSE IT', 450, 135);
    ctx.restore();
  }

  // Skip hint
  if (game.introTimer > 2000) {
    const pulse = 0.5 + Math.sin(game.introTimer / 200) * 0.5;
    ctx.globalAlpha = pulse * 0.7;
    ctx.font = '18px Arial';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#aaaaaa';
    ctx.fillText('Click anywhere to skip', 450, CANVAS_H - 30);
    ctx.globalAlpha = 1;
  }
}

// ── RENDER: MENU ───────────────────────────────────────────────
function renderMenu() {
  const grad = ctx.createLinearGradient(0, 0, 0, CANVAS_H);
  grad.addColorStop(0, '#2D0A5E');
  grad.addColorStop(1, '#1A0A2E');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

  // Disco floor tiles
  _drawDiscoFloor();

  // Idle character (back view)
  char.drawBack(450, 500, char.transforms);

  // Title
  const bounce = 1 + Math.sin(Date.now() / 400) * 0.03;
  ctx.save();
  ctx.translate(450, 120);
  ctx.scale(bounce, bounce);
  ctx.translate(-450, -120);
  ctx.font = 'bold 72px Arial Black, Arial';
  ctx.textAlign = 'center';
  ctx.strokeStyle = '#FF6B35';
  ctx.lineWidth = 7;
  ctx.strokeText('BOOTY-BOUNCER', 450, 130);
  ctx.fillStyle = '#FFD700';
  ctx.fillText('BOOTY-BOUNCER', 450, 130);
  ctx.restore();

  // Controls hint
  ctx.font = '16px Arial';
  ctx.fillStyle = '#aaa';
  ctx.textAlign = 'center';
  ctx.fillText('WASD = Shake  |  SPACE = Jump  |  ESC = Menu', 450, 310);

  // Buttons
  _drawButtons(game.menuButtons);
}

// ── RENDER: GAMEPLAY ───────────────────────────────────────────
function renderGameplay() {
  // BG
  const grad = ctx.createLinearGradient(0, 0, 0, CANVAS_H);
  grad.addColorStop(0, '#1A0A2E');
  grad.addColorStop(1, '#0D0520');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

  // Disco floor
  _drawDiscoFloor();

  // Stage platform
  ctx.fillStyle = '#3A0D7A';
  ctx.beginPath();
  ctx.ellipse(450, 600, 220, 40, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#6B2FA0';
  ctx.lineWidth = 3;
  ctx.stroke();

  // Character (back view)
  char.drawBack(450, 490, char.transforms);
  char.drawEffects(450, 490);

  // HUD
  _drawHUD();
}

// ── RENDER: RESULT ─────────────────────────────────────────────
function renderResult() {
  const grad = ctx.createLinearGradient(0, 0, 0, CANVAS_H);
  grad.addColorStop(0, '#2D0A5E');
  grad.addColorStop(1, '#1A0A2E');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

  ctx.font = 'bold 64px Arial Black, Arial';
  ctx.textAlign = 'center';
  ctx.strokeStyle = '#FF6B35';
  ctx.lineWidth = 6;
  ctx.strokeText('GAME OVER', 450, 120);
  ctx.fillStyle = '#FFD700';
  ctx.fillText('GAME OVER', 450, 120);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 28px Arial';
  ctx.fillText(`SCORE: ${game.score}`, 450, 210);
  ctx.fillText(`BEST:  ${game.bestScore}`, 450, 250);
  ctx.fillText(`MAX COMBO: ×${game.bestCombo}`, 450, 290);
  ctx.fillText(`MULTIPLIER PEAK: ×${Math.floor(game.multiplier * 10) / 10}`, 450, 330);

  // Grade
  const grade = game.score > 5000 ? '🔥 LEGENDARY' :
                game.score > 3000 ? '⚡ WILD' :
                game.score > 1500 ? '💥 DOPE' : '👍 NICE';
  ctx.font = 'bold 40px Arial';
  ctx.fillStyle = '#FFD700';
  ctx.fillText(grade, 450, 400);

  _drawButtons(game.resultButtons);
}

// ── HELPERS ────────────────────────────────────────────────────
function _drawHUD() {
  // Timer bar
  const barW = 600;
  const progress = game.timeLeft / GAME_DURATION;
  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  ctx.fillRect(150, 20, barW, 24);
  const barColor = progress > 0.4 ? '#44FF88' : progress > 0.2 ? '#FFAA00' : '#FF4444';
  ctx.fillStyle = barColor;
  ctx.fillRect(150, 20, barW * progress, 24);
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2;
  ctx.strokeRect(150, 20, barW, 24);

  ctx.font = 'bold 16px Arial';
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffffff';
  ctx.fillText(`${Math.ceil(game.timeLeft)}s`, 450, 37);

  // Score
  ctx.font = 'bold 32px Arial Black';
  ctx.textAlign = 'left';
  ctx.fillStyle = '#FFD700';
  ctx.fillText(`${game.score}`, 20, 75);
  ctx.font = '14px Arial';
  ctx.fillStyle = '#aaa';
  ctx.fillText('SCORE', 20, 90);

  // Multiplier
  ctx.font = 'bold 28px Arial Black';
  ctx.textAlign = 'right';
  ctx.fillStyle = '#FF8800';
  ctx.fillText(`×${Math.floor(game.multiplier * 10) / 10}`, 880, 75);
  ctx.font = '14px Arial';
  ctx.fillStyle = '#aaa';
  ctx.fillText('MULT', 880, 90);

  // Combo count
  ctx.font = 'bold 20px Arial';
  ctx.textAlign = 'center';
  ctx.fillStyle = '#88FFFF';
  ctx.fillText(`COMBOS: ${game.comboCount}`, 450, 75);
}

function _drawButtons(buttons) {
  buttons.forEach(btn => {
    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.beginPath();
    ctx.roundRect(btn.x - btn.w/2 + 3, btn.y - btn.h/2 + 3, btn.w, btn.h, [12]);
    ctx.fill();

    // Button bg
    ctx.fillStyle = '#FF6B35';
    ctx.beginPath();
    ctx.roundRect(btn.x - btn.w/2, btn.y - btn.h/2, btn.w, btn.h, [12]);
    ctx.fill();

    // Border
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(btn.x - btn.w/2, btn.y - btn.h/2, btn.w, btn.h, [12]);
    ctx.stroke();

    // Label
    ctx.font = 'bold 22px Arial';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(btn.label, btn.x, btn.y + 8);
  });
}

function _drawDiscoFloor() {
  const tileSize = 60;
  const t = Date.now() / 800;
  const colors = ['#3A0D7A','#2D0A5E','#500D8A','#1A0A2E','#6B2FA0','#4B0082'];
  for (let x = 0; x < CANVAS_W; x += tileSize) {
    for (let y = 450; y < CANVAS_H; y += tileSize) {
      const ci = Math.floor((x/tileSize + y/tileSize + Math.floor(t)) % colors.length);
      const flash = Math.sin(t * 2 + x * 0.05 + y * 0.07) > 0.85;
      ctx.fillStyle = flash ? '#8844FF' : colors[Math.abs(ci)];
      ctx.fillRect(x, y, tileSize - 2, tileSize - 2);
    }
  }
}

function _easeOutBounce(t) {
  const n1 = 7.5625, d1 = 2.75;
  if (t < 1/d1)     return n1*t*t;
  if (t < 2/d1)     return n1*(t-=1.5/d1)*t+0.75;
  if (t < 2.5/d1)   return n1*(t-=2.25/d1)*t+0.9375;
  return n1*(t-=2.625/d1)*t+0.984375;
}
```

- [ ] **Step 2: Run full game and test all states**

```bash
npm start
```

Verify manually:
- Intro plays (title bounces in, character slides up) ✓
- Auto-transitions to menu after ~3s ✓
- "START GAME" button works ✓
- WASD + Space trigger animations in gameplay ✓
- 60s timer counts down ✓
- Score increments on each input ✓
- Result screen shows after 60s ✓
- Retry and Main Menu buttons work ✓

- [ ] **Step 3: Commit**

```bash
git add src/game.js && git commit -m "feat: complete game state machine, HUD, all screens"
```

---

### Task 7: Wire Combo System into Gameplay

**Files:**
- Modify: `booty-bouncer/src/game.js` — combo feedback already in handleCombo(), verify wiring

- [ ] **Step 1: Test each combo manually**

Run `npm start`, start game, then:
- Press W then A quickly (< 800ms) → should see "TWERK STORM" / "Nice" popup
- Press W then D quickly → "BOOTY BLAST" / "Dope"
- Press A, A, Space quickly → "BOUNCE SLAM" / "Wild"
- Press S, D, Space quickly → "GROUND SHAKER" / "Legendary"

Verify for each: combo animation plays, rating popup appears, particles burst, screen shakes, score jumps.

- [ ] **Step 2: Fix any timing issues**

If combos don't fire reliably, adjust `MAX_WINDOW` in `combo.js`:
```js
this.MAX_WINDOW = 1000; // increase to 1000ms if 800ms too tight
```

- [ ] **Step 3: Commit**

```bash
git add src/combo.js src/game.js && git commit -m "feat: verify and tune combo detection timing"
```

---

### Task 8: PROJECT_PLAN.md + HANDOFF.md + README.md

**Files:**
- Create: `booty-bouncer/PROJECT_PLAN.md`
- Create: `booty-bouncer/HANDOFF.md`
- Create: `booty-bouncer/README.md`

- [ ] **Step 1: Write `PROJECT_PLAN.md`**

```markdown
# Booty-Bouncer — Project Plan

## Projektziel
Humorvolles, cartoonhaftes Arcade-Tanzspiel. HTML5 Canvas + Electron.

## Tech-Stack
- Renderer: HTML5 Canvas 2D (programmatisch, keine Assets)
- Desktop: Electron 28
- Build: electron-builder (NSIS + Portable)
- Audio: Web Audio API (synthetisch)
- Sprache: Vanilla JS ES6+

## Dateistruktur
booty-bouncer/
├── src/index.html, styles.css, game.js, character.js, audio.js, combo.js
├── main.js, package.json
└── PROJECT_PLAN.md, HANDOFF.md, README.md

## Aufgabenliste
- [x] Projekt-Scaffold (package.json, main.js, index.html, styles.css)
- [x] Audio Engine (Web Audio beat + SFX)
- [x] Combo System (InputBuffer, 4 Combos)
- [x] Character Drawing (Front + Back View)
- [x] Animation System (Keyframes, Easing, Effekte)
- [x] Game Loop + State Machine (INTRO/MENU/GAMEPLAY/RESULT)
- [x] Combo Wiring + Tuning
- [x] Dokumentation (PROJECT_PLAN, HANDOFF, README)
- [ ] Build-Verifikation (npm run build)

## Build-Status
- npm start: ✓ funktioniert
- npm run build: [ ] noch nicht geprüft

## Bekannte Probleme
- Keine bekannten Bugs

## Nächster Schritt
npm run build ausführen und Windows-Build prüfen.
```

- [ ] **Step 2: Write `HANDOFF.md`**

```markdown
# Booty-Bouncer — Handoff

## Aktueller Stand
Vollständig spielbares Spiel. Alle 4 States, alle Animationen, Audio, Combos, Score.

## Was funktioniert
- Intro (Frontansicht, Titel-Animation, Auto-Skip)
- Hauptmenü (Start, Music On/Off, Quit)
- Gameplay (60s, WASD+Space, 4 Combos, Score, HUD)
- Result-Screen (Score, Best Combo, Retry, Menu)
- Web Audio Beat (128 BPM, synthetisch)
- SFX (Bounce, Jump, Combo, Click, Land)
- Alle 4 Kombos mit Animationen und Effekten
- Screen Shake, Flash, Partikel, Rating-Popup

## Was noch fehlt
- Windows Build-Verifikation (npm run build)

## Nächste 3 Schritte
1. npm run build ausführen → prüfen ob dist/ NSIS-Installer erzeugt wird
2. Installer testen → Spiel starten und kurz spielen
3. Ggf. Build-Config anpassen falls Fehler

## Start-Kommandos
- Dev: `cd booty-bouncer && npm start`
- Build: `cd booty-bouncer && npm run build`

## Letzter Checkpoint
Alle Tasks abgeschlossen, Build noch ausstehend.
```

- [ ] **Step 3: Write `README.md`**

```markdown
# Booty-Bouncer 🎮

Cartoonhaftes Arcade-Tanzspiel. Shake it or lose it.

## Starten (Development)

```bash
cd booty-bouncer
npm install
npm start
```

## Steuerung

| Taste | Aktion |
|---|---|
| W | Forward Bounce |
| A | Left Shake |
| S | Back Bounce |
| D | Right Shake |
| Space | Jump Bounce |
| ESC | Hauptmenü |

## Kombos

| Sequenz | Name | Rating |
|---|---|---|
| W → A | Twerk Storm | Nice |
| W → D | Booty Blast | Dope |
| A → A → Space | Bounce Slam | Wild |
| S → D → Space | Ground Shaker | Legendary |

Inputs innerhalb von 800ms eingeben.

## Windows-Build

```bash
npm run build
```

Erzeugt in `dist/`: NSIS-Installer + Portable EXE.

## Tech

- HTML5 Canvas 2D (alle Grafiken programmatisch)
- Electron 28
- Web Audio API (kein Audio-File-Dependency)
- electron-builder
```

- [ ] **Step 4: Commit**

```bash
git add PROJECT_PLAN.md HANDOFF.md README.md
git commit -m "docs: add PROJECT_PLAN, HANDOFF and README"
```

---

### Task 9: Build Verification

**Files:**
- No code changes expected

- [ ] **Step 1: Run build**

```bash
cd /mnt/data/code-projects/booty-bouncer && npm run build
```

Expected: `dist/` directory created with:
- `Booty-Bouncer Setup 1.0.0.exe` (NSIS installer)
- `Booty-Bouncer 1.0.0.exe` (Portable)

- [ ] **Step 2: If build fails with icon error**

Add to `package.json` build section:
```json
"win": {
  "icon": null,
  "target": [...]
}
```
Or create a minimal icon:
```bash
# Skip icon — electron-builder uses default if not specified
```

- [ ] **Step 3: Update PROJECT_PLAN.md build status**

Change `- [ ] Build-Verifikation` to `- [x] Build-Verifikation (✓ dist/ erzeugt)`

- [ ] **Step 4: Final commit**

```bash
git add PROJECT_PLAN.md HANDOFF.md
git commit -m "chore: verify Windows build, update docs"
```

---

## Acceptance Checklist

After all tasks complete, verify:

- [ ] `npm start` launches without errors
- [ ] Intro: character visible from front (Afro + Glasses + orange shirt), title "BOOTY-BOUNCER" appears
- [ ] Menu: Start / Music / Quit buttons work
- [ ] Gameplay: WASD + Space each trigger distinct animation
- [ ] Gameplay: Back-view character with large booty visible
- [ ] Gameplay: Beat plays, SFX on inputs
- [ ] Gameplay: 60s timer counts down, reaches 0 → Result screen
- [ ] Combos: W+A → "TWERK STORM" / Nice
- [ ] Combos: W+D → "BOOTY BLAST" / Dope
- [ ] Combos: A+A+Space → "BOUNCE SLAM" / Wild
- [ ] Combos: S+D+Space → "GROUND SHAKER" / Legendary
- [ ] HUD: Score, Multiplier, Combo count, Timer all visible
- [ ] Result: Shows score, best combo, Retry + Menu buttons
- [ ] `npm run build` produces EXE in `dist/`
