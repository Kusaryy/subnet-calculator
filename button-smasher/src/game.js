// ─── CONFIG ────────────────────────────────────────────────────────────────

const CFG = {
  BASE_DAMAGE:       6,
  COMBO_FAST_MS:     280,
  COMBO_RESET_MS:    850,
  COMBO_MULTIPLIER:  0.18,
  MAX_COMBO_MULT:    5.0,
  CPS_WINDOW_MS:     1000,
  TAUNT_COOLDOWN_MS: 550,
  DECAY_TICK_MS:     100,
};

const LEVELS = [
  {
    id: 1, name: 'Der Anfänger', hp: 500,
    decayPerPhase: [0, 0.5, 1.0, 2.0, 3.5],
    movement:  { enabled: false },
    invincible:{ enabled: false },
    counter:   { enabled: false },
    memeFreq:  15000,
    subPhases: null,
  },
  {
    id: 2, name: 'Er wird nervös', hp: 800,
    decayPerPhase: [0, 0.9, 2.0, 3.5, 5.5],
    movement:  { enabled: false },
    invincible:{ enabled: true, durationMs: 2000, cooldownMs: 20000 },
    counter:   { enabled: false },
    memeFreq:  12000,
    subPhases: null,
  },
  {
    id: 3, name: 'Der Ausweicher', hp: 1100,
    decayPerPhase: [0, 1.5, 3.0, 5.5, 8.0],
    movement:  { enabled: true, intervalMs: 4000, maxOffsetPx: 100, teleport: false },
    invincible:{ enabled: true, durationMs: 3000, cooldownMs: 15000 },
    counter:   { enabled: false },
    memeFreq:  8000,
    subPhases: null,
  },
  {
    id: 4, name: 'Volle Panik', hp: 1500,
    decayPerPhase: [0, 2.5, 5.0, 8.5, 12.0],
    movement:  { enabled: true, intervalMs: 2000, maxOffsetPx: 140, teleport: true },
    invincible:{ enabled: true, durationMs: 2500, cooldownMs: 10000 },
    counter:   { enabled: true, triggerEveryNHits: 15, durationMs: 800 },
    memeFreq:  5000,
    subPhases: null,
  },
  {
    id: 5, name: 'DER ENDGEGNER', hp: 2200,
    decayPerPhase: [0, 4.0, 7.5, 12.0, 18.0],
    movement:  { enabled: true, intervalMs: 1500, maxOffsetPx: 160, teleport: true },
    invincible:{ enabled: true, durationMs: 2000, cooldownMs: 7000 },
    counter:   { enabled: true, triggerEveryNHits: 10, durationMs: 1000 },
    memeFreq:  3000,
    subPhases: {
      1: { hpMin: 1501, hpMax: 2200, name: 'Erste Form',  sub: 1 },
      2: { hpMin:  701, hpMax: 1500, name: 'Zweite Form', sub: 2,
           movement:  { intervalMs: 800,  maxOffsetPx: 180, teleport: true },
           invincible:{ durationMs: 2500, cooldownMs: 5000 } },
      3: { hpMin:    0, hpMax:  700, name: 'Letzte Form', sub: 3,
           movement:  { intervalMs: 550,  maxOffsetPx: 200, teleport: true },
           invincible:{ durationMs: 3000, cooldownMs: 4000 },
           counter:   { triggerEveryNHits: 6 } },
    },
  },
];

// ─── CONTENT ───────────────────────────────────────────────────────────────

const TAUNTS = {
  idle: [
    'Drück mich. Wenn du dich traust.',
    'Los, klick mich. Ich warte. (Ich hab keine Angst.)',
    'Mach schon. Ich bitte dich regelrecht darum.',
  ],
  phase1: [
    'Ist das ALLES? Meine Oma klickt härter. Die ist seit 12 Jahren tot.',
    'lol. nett versucht. wirklich. ernsthaft. so traurig.',
    'Das hat gekitzelt. Wie eine Feder. Eine winzige Feder. Von einem winzigen Vogel.',
    'Du nennst DAS Smashen? Das war ein liebevoller Klaps.',
    'Deine Maus hat mir gerade eine Nachricht geschickt, ob du okay bist.',
    'In diesem Tempo sterbe ich an Altersschwäche. Ich bin ein Button. Das wird nicht passieren.',
    'Ooooh, gruselig. Sehr gruselig. Absolut erschreckend. (Null Schrecken.)',
    'Mein Entwickler hat mich für genau diesen Moment gebaut. Ich bin SO. WAS. GELANGWEILT.',
    'Ein Klick? EINER? Die Frechheit.',
    'Dein Zeigefinger sollte sich schämen. Direkt jetzt.',
  ],
  phase2: [
    'Okay. Du hast meine Aufmerksamkeit. KAUM.',
    'Ohhh, mehrere Klicks! Jemand ruf die Medien!',
    'HÄRTER, du Tastatur-Goblin! Ich spür dich kaum.',
    'Ist das dein Speedrun? Das ist der traurigste Speedrun den ich je gesehen hab.',
    'Mich haben Kätzchen gekratzt. Das war bedrohlicher.',
    'Sogar DSL 1000 war schneller als deine Klickfrequenz.',
    'KOMM SCHON. Meine Oma klickt schneller. Sie ist immer noch tot.',
    'Du schwitzt. Ich nicht. Das sagt alles.',
    'Weißt du was? Ich bemitleide dich. Ernsthaft.',
    'Bro versucht so hart. Bro versagt so hart.',
  ],
  phase3: [
    'Okay okay OKAY— wart mal—',
    'W-warte. Das hat irgendwie... AU.',
    'AUFHÖREN. Nein warte— NICHT aufhören. Doch AUFHÖREN. NICHT.',
    'Ich spür wie mein CSS Border-Radius bricht!!',
    'DU ABSOLUTER CHAOS-GOBLIN',
    'Die Dreistigkeit. Die SCHIERE, WAHNSINNIGE Dreistigkeit.',
    'Mein Entwickler hat das NICHT stress-getestet!',
    'Ich entwickle echte Gefühle dazu und die sind SCHLECHT.',
    'MEIN BORDER TRENNT SICH VON MEINEM HINTERGRUND',
    'Okay ich fange an meine ganze Persönlichkeit zu hinterfragen.',
  ],
  phase4: [
    'NICHT DAS GESICHT, NICHT DAS GESICHT!!',
    'ICH FRAGMENTIERE MICH BUCHSTÄBLICH HILFE',
    'WARUM TUST DU DAS EINEM UNSCHULDIGEN BUTTON AN',
    'ALLES BRENNT UND ICH BRENNE AUCH',
    'ICH BEREUE JEDEN EINZELNEN TAUNT DEN ICH JE GESAGT HAB',
    'BITTE ICH HAB EINE FAMILIE. (HAB ICH NICHT. ICH BIN EIN WAISEN-BUTTON.)',
    'ALLES GUT. NICHTS IST GUT. RUF 110 AN.',
    'ICH WILL EINEN ANWALT UND AUCH THERAPIE',
    'ICH BIN GESCHWINDIGKEIT. ICH STERBE AUCH GERADE. HAUPTSÄCHLICH STERBE ICH.',
    'DIE PIXEL— DIE PIXEL VERLASSEN MEINEN KÖRPER—',
  ],
  comboBig: [
    'COMBO-BESTIE!!',
    'DEINE FINGER SIND EIN TATORTBEFUND',
    'ZU SCHNELL. ZU RASEND. ZU VIEL.',
    'WUTMULTIPLIKATOR EINGERASTET',
    'SMASH-LORD ERKANNT',
    'WAS PASSIERT GERADE MIT MIR',
    'ABSOLUTE KLICK-EINHEIT',
  ],
  // Wird gefeuert wenn Schaden eine Phase zurückfällt
  phaseDown: [
    'HAHAHA du wirst langsamer!',
    'ICH HEILE MICH ZURÜCK LMAOOO',
    'Zu langsam — ich regeneriere. Gib mehr Gas.',
    'WEITERKLICKEN, Feigling. Ich spür wie ich mich erhole.',
    'Oh schau, mir geht\'s besser. Wie peinlich für dich.',
    'Du nennst das Smashen? Ich nenn das Urlaub.',
    'Ich heile gerade buchstäblich. In Echtzeit. Und beobachte dein Versagen.',
  ],
  l1: [
    'Ist das ALLES? Meine Oma klickt härter. Die ist seit 12 Jahren tot.',
    'lol. nett versucht. Ich hab Zeit. Ich bin ein Button.',
    'Klick ruhig weiter. Ich warte. Ich hab keine Angst vor dir.',
    'Ooooh gruselig. SEHR gruselig. NULL Gruseln bei mir.',
    'Mein Entwickler hat mich für genau diesen Moment gebaut. Ich bin SO. WAS. GELANGWEILT.',
  ],
  l2: [
    'Warte— okay. Das war... hm. Nein. Ich bin okay.',
    'Ich hab jetzt einen Schild. Hast du einen Schild? Nein? Schade.',
    'SCHILD AKTIV. Was machst du jetzt, Klick-Goblin?',
    'Oh interessant. Du versuchst es trotzdem. Ich respektiere das nicht.',
    'Ich regeneriere. In Echtzeit. Und du schaust zu. Peinlich.',
  ],
  l3: [
    'WARTE— wo bin ich hin— ich BIN NOCH HIER!',
    'Du wirst mich nicht erwischen. Ich bin SCHNELL.',
    'Nein nein nein— ich beweg mich einfach weg. Problem gelöst.',
    'FANG MICH DOCH! (bitte nicht fangen)',
    'Ich dachte Bewegung würde helfen. Vielleicht. Mal sehen.',
  ],
  l4: [
    '[PANIK.exe reagiert nicht]',
    'DAS HÄTTE NICHT PASSIEREN DÜRFEN',
    'ICH HALTE DAGEGEN. SIEH HER. ICH— WARTE—',
    'N-NEIN. NEIN. NEEEIN.',
    'GEGENANGRIFF. ICH GREIFE ZURÜCK. JA. DAS MACHE ICH.',
  ],
  l5f1: [
    'Du hast es bis hierher geschafft. Gut. Jetzt stirbst du hier.',
    'ERSTE FORM. Ich hab noch zwei weitere. Viel Spaß.',
    'Bereit? Ich bin bereit. Ich war immer bereit.',
    'Du weißt nicht was dich erwartet. Ich schon.',
  ],
  l5f2: [
    'ZWEITE FORM AKTIVIERT. Du hast mich wütend gemacht.',
    'Das war meine freundliche Seite. WILLKOMMEN IN DER ZWEITEN FORM.',
    'OH. DU WILLST WIRKLICH KÄMPFEN. GUT. LASS UNS KÄMPFEN.',
    'Ich bin jetzt NICHT mehr höflich.',
  ],
  l5f3: [
    'LETZTE FORM. ICH BIN NICHT FERTIG.',
    'ALLES ODER NICHTS. ICH FÜRCHTE NICHTS. ICH LÜGE.',
    'DIE PIXEL— DIE PIXEL VERLASSEN MEINEN KÖRPER—',
    'WENN ICH GEHE, NEHME ICH DEINE MAUS MIT!!!',
    'ICH BEREUE JEDEN EINZELNEN TAUNT. JEDEN. EINZELNEN.',
  ],
};

const BUTTON_LABELS = {
  phase1: ['KLICK MICH', 'DRÜCK MICH', 'NA LOS, FEIGLING', 'MACH SCHON', 'TRAU DICH'],
  phase2: ['HÄRTER!!', 'IST DAS ALLES??', 'SCHNELLER, WURM!', 'NOCH HÄRTER!!!', 'WIRKLICH??'],
  phase3: ['h-hör auf...', 'au au AU', 'n-nicht mehr...', 'w-warte...', 'AAUGH'],
  phase4: ['NEEEEIIN!', 'AAAAARGH!', '💀 ICH STERBE 💀', 'WARUMMMM', 'ICH GEH!!'],
};

const MEMES = {
  smug:       { emoji: '( ͡° ͜ʖ ͡°)', text: 'SKILL ISSUE.' },
  nervous:    { emoji: '😰',           text: 'W-WARTE MAL—' },
  flee:       { emoji: '🏃',           text: 'ICH BIN SCHNELL. DU NICHT.' },
  panic:      { emoji: '💀',           text: '[PANIK.exe hat aufgehört zu reagieren]' },
  denial:     { emoji: '🔥',           text: 'THIS IS FINE.' },
  plead:      { emoji: '🙏',           text: 'BITTE. ICH FLEHE DICH AN.' },
  inv:        { emoji: '🛡️',           text: 'SCHILD AKTIV. VERSUCH WAS.' },
  counter:    { emoji: '⚡',           text: 'DAS GEHT JETZT SO NICHT WEITER.' },
  speed:      { gif: 'assets/memes/meme-speed.gif',      text: 'I AM SPEED.' },
  panik:      { gif: 'assets/memes/meme-panik.gif',      text: 'TOTALE PANIK.' },
  thisisfine: { gif: 'assets/memes/meme-thisisfine.gif', text: 'ALLES GUT HIER. 🔥' },
  nope:       { gif: 'assets/memes/meme-nope.gif',       text: 'NOPE. NOPE. NOPE.' },
};

const LEVEL_MEME_POOL = {
  1: ['smug', 'smug'],
  2: ['nervous', 'inv'],
  3: ['flee', 'nervous'],
  4: ['panic', 'counter'],
  5: ['thisisfine', 'plead', 'denial'],
};

// ─── STATE ─────────────────────────────────────────────────────────────────

let state = buildState();
let decayTimer = null;

function buildState() {
  return {
    damage: 0, combo: 0, maxCombo: 0,
    totalClicks: 0, maxCPS: 0, startTime: null,
    lastClickTime: 0, clickTimestamps: [],
    phase: 1, isGameOver: false,

    currentLevelIdx: 0,
    currentLevel: LEVELS[0],
    currentSubPhase: null,

    isInvincible: false,
    invTimer: null, invCooldownTimer: null,

    moveTimer: null,
    btnOffsetX: 0, btnOffsetY: 0,

    hitsSinceLastCounter: 0,
    counterActive: false,

    memeTimer: null,

    tauntCursors: {
      phase1:0, phase2:0, phase3:0, phase4:0,
      comboBig:0, phaseDown:0, idle:0,
      l1:0, l2:0, l3:0, l4:0, l5f1:0, l5f2:0, l5f3:0,
    },
    labelCursors: { phase1:0, phase2:0, phase3:0, phase4:0 },
    lastTauntAt: 0, hitVariant: 0,
  };
}

// ─── DOM ───────────────────────────────────────────────────────────────────

const dom = {};

function initDom() {
  dom.hitLayer      = document.getElementById('button-hit-layer');
  dom.button        = document.getElementById('smash-button');
  dom.buttonText    = document.getElementById('button-text');
  dom.tauntText     = document.getElementById('taunt-text');
  dom.damageBar     = document.getElementById('damage-bar');
  dom.damageValue   = document.getElementById('damage-value');
  dom.comboDisplay  = document.getElementById('combo-display');
  dom.cpsDisplay    = document.getElementById('cps-display');
  dom.particles     = document.getElementById('particles');
  dom.gameScreen    = document.getElementById('game-screen');
  dom.flashOverlay  = document.getElementById('flash-overlay');
  dom.breakOverlay  = document.getElementById('break-overlay');
  dom.breakMessage  = document.getElementById('break-message');
  dom.levelNum        = document.getElementById('level-num');
  dom.levelName       = document.getElementById('level-name');
  dom.invLabel        = document.getElementById('inv-label');
  dom.memeCard        = document.getElementById('meme-card');
  dom.memeEmoji       = document.getElementById('meme-emoji');
  dom.memeText        = document.getElementById('meme-text');
  dom.memeGif         = document.getElementById('meme-gif');
  dom.levelTransition = document.getElementById('level-transition');
  dom.ltLevelNum      = document.getElementById('lt-level-num');
  dom.ltAnnounce      = document.getElementById('lt-announce');
  dom.victoryScreen   = document.getElementById('victory-screen');
  dom.vClicks         = document.getElementById('v-clicks');
  dom.vTime           = document.getElementById('v-time');
  dom.vCps            = document.getElementById('v-cps');
  dom.vCombo          = document.getElementById('v-combo');
  dom.buttonArea      = document.querySelector('.button-area');
  dom.caOverlay       = document.getElementById('counter-attack-overlay');
  dom.restartBtn      = document.getElementById('restart-btn');
}

// ─── TAUNT / LABEL HELPERS ─────────────────────────────────────────────────

function nextTaunt(key) {
  const pool = TAUNTS[key];
  const i = state.tauntCursors[key] % pool.length;
  state.tauntCursors[key]++;
  return pool[i];
}

function nextLabel(phase) {
  const key = `phase${Math.min(phase, 4)}`;
  const pool = BUTTON_LABELS[key];
  const i = state.labelCursors[key] % pool.length;
  state.labelCursors[key]++;
  return pool[i];
}

function updateTaunt(cps) {
  const now = Date.now();
  if (now - state.lastTauntAt < CFG.TAUNT_COOLDOWN_MS && cps < 8) return;
  state.lastTauntAt = now;

  let text;
  const lvl = state.currentLevel.id;

  if (cps >= 8 && state.combo >= 5) {
    text = nextTaunt('comboBig');
  } else if (lvl === 5 && state.currentSubPhase === 3) {
    text = nextTaunt('l5f3');
  } else if (lvl === 5 && state.currentSubPhase === 2) {
    text = nextTaunt('l5f2');
  } else if (lvl === 5) {
    text = nextTaunt('l5f1');
  } else {
    text = nextTaunt(`l${lvl}`);
  }

  dom.tauntText.classList.remove('taunt-flash');
  void dom.tauntText.offsetWidth;
  dom.tauntText.textContent = text;
  dom.tauntText.classList.add('taunt-flash');
}

// ─── CPS ───────────────────────────────────────────────────────────────────

function getCPS() {
  const cutoff = Date.now() - CFG.CPS_WINDOW_MS;
  state.clickTimestamps = state.clickTimestamps.filter(t => t > cutoff);
  return state.clickTimestamps.length;
}

// ─── PHASE MANAGEMENT ──────────────────────────────────────────────────────

function phaseFor(damage) {
  const hp = state.currentLevel.hp;
  if (damage >= hp)         return 5;
  if (damage >= hp * 0.75)  return 4;
  if (damage >= hp * 0.5)   return 3;
  if (damage >= hp * 0.25)  return 2;
  return 1;
}

function syncPhase() {
  const newPhase = phaseFor(state.damage);
  if (newPhase === state.phase) return;

  const goingDown = newPhase < state.phase;
  state.phase = newPhase;

  dom.button.setAttribute('data-phase', newPhase);
  document.body.setAttribute('data-phase', newPhase);
  dom.buttonText.textContent = nextLabel(newPhase);

  if (goingDown) {
    // Mocking taunt — no shake, button is recovering
    dom.tauntText.textContent = nextTaunt('phaseDown');
  } else {
    audio.playPhaseChange(newPhase);
    screenShake('heavy');
    dom.tauntText.textContent = nextTaunt(`phase${Math.min(newPhase, 4)}`);
  }

  dom.tauntText.classList.remove('taunt-flash');
  void dom.tauntText.offsetWidth;
  dom.tauntText.classList.add('taunt-flash');
}

// ─── DECAY ─────────────────────────────────────────────────────────────────

function tickDecay() {
  if (state.isGameOver || state.damage <= 0) return;
  const rates = state.currentLevel.decayPerPhase;
  const rate  = rates[Math.min(state.phase, rates.length - 1)] ?? rates[1];
  state.damage = Math.max(0, state.damage - rate);
  updateUI(getCPS());
  syncPhase();
}

function startDecay() {
  if (decayTimer) return;
  decayTimer = setInterval(tickDecay, CFG.DECAY_TICK_MS);
}

function stopDecay() {
  clearInterval(decayTimer);
  decayTimer = null;
}

// ─── HIT ANIMATIONS (applied to wrapper, not button itself) ───────────────

const HIT_VARIANTS  = ['anim-hit-a', 'anim-hit-b', 'anim-hit-c'];
const HIT_DURATIONS = { 'anim-hit-a': 240, 'anim-hit-b': 270, 'anim-hit-c': 220, 'anim-rage': 170, 'anim-heated': 200 };

function triggerHitAnimation(cps) {
  const el = dom.hitLayer;
  el.classList.remove('anim-hit-a', 'anim-hit-b', 'anim-hit-c', 'anim-rage', 'anim-heated');
  void el.offsetWidth;

  let cls;
  if (cps >= 13) {
    cls = 'anim-rage';
  } else if (cps >= 6) {
    cls = 'anim-heated';
  } else {
    cls = HIT_VARIANTS[state.hitVariant % 3];
    state.hitVariant++;
  }

  el.classList.add(cls);
  setTimeout(() => el.classList.remove(cls), HIT_DURATIONS[cls] + 20);
}

// ─── SCREEN SHAKE ──────────────────────────────────────────────────────────

function screenShake(level) {
  const el = dom.gameScreen;
  el.classList.remove('shake-light', 'shake-medium', 'shake-heavy');
  void el.offsetWidth;
  el.classList.add(`shake-${level}`);
  const dur = level === 'heavy' ? 420 : level === 'medium' ? 320 : 240;
  setTimeout(() => el.classList.remove(`shake-${level}`), dur);
}

// ─── PARTICLES ─────────────────────────────────────────────────────────────

const PARTICLE_COLORS = ['#ff6b6b', '#ffd93d', '#6bcb77', '#4d96ff', '#c77dff', '#ff9a3c'];

function spawnParticles(cx, cy, count, cps) {
  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    p.className = 'particle';

    const angle = Math.random() * Math.PI * 2;
    const speed = 60 + Math.random() * (40 + cps * 12);
    const vx = Math.cos(angle) * speed;
    const vy = Math.sin(angle) * speed - 60; // slight upward bias

    const size = 3 + Math.random() * 5;
    const color = PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)];

    p.style.cssText =
      `left:${cx}px;top:${cy}px;width:${size}px;height:${size}px;` +
      `background:${color};--vx:${vx}px;--vy:${vy}px;`;

    dom.particles.appendChild(p);
    setTimeout(() => p.remove(), 750);
  }
}

function spawnComboText(x, y, combo) {
  const el = document.createElement('div');
  el.className = 'combo-pop';
  el.textContent = `${combo}× COMBO!`;
  el.style.left = `${x}px`;
  el.style.top  = `${y}px`;
  dom.particles.appendChild(el);
  setTimeout(() => el.remove(), 1050);
}

// ─── MEME SYSTEM ───────────────────────────────────────────────────────────

let memeHideTimer = null;

function showMeme(key) {
  const m = MEMES[key];
  if (!m) return;
  if (memeHideTimer) { clearTimeout(memeHideTimer); memeHideTimer = null; }

  const lvl = state.currentLevel.id;
  dom.memeCard.className = `level-${lvl}`;
  dom.memeCard.classList.toggle('has-gif', !!m.gif);

  if (m.gif) {
    dom.memeGif.src          = m.gif;
    dom.memeText.textContent = m.text;
    dom.memeEmoji.textContent = '';
  } else {
    dom.memeEmoji.textContent = m.emoji || '';
    dom.memeText.textContent  = m.text  || '';
    dom.memeGif.src = '';
  }

  dom.memeCard.classList.add('visible');

  memeHideTimer = setTimeout(() => {
    dom.memeCard.classList.remove('visible');
  }, m.gif ? 3500 : 2000);
}

function scheduleMeme() {
  if (!state.currentLevel.memeFreq || state.isGameOver) return;
  const jitter = state.currentLevel.memeFreq * 0.5;
  state.memeTimer = setTimeout(() => {
    if (!state.isGameOver) {
      const pool = LEVEL_MEME_POOL[state.currentLevel.id] || [];
      if (pool.length) showMeme(pool[Math.floor(Math.random() * pool.length)]);
    }
    scheduleMeme();
  }, state.currentLevel.memeFreq + Math.random() * jitter);
}

// ─── UI UPDATE ─────────────────────────────────────────────────────────────

function updateUI(cps) {
  const maxHp = state.currentLevel.hp;
  const pct   = (state.damage / maxHp) * 100;
  dom.damageBar.style.width = `${pct}%`;
  dom.damageValue.textContent = `${Math.round(pct)}%`;

  if (pct >= 75) {
    dom.damageBar.style.background = 'linear-gradient(90deg,#ff2020,#ff6b00)';
  } else if (pct >= 50) {
    dom.damageBar.style.background = 'linear-gradient(90deg,#ff6b00,#ffd93d)';
  } else if (pct >= 25) {
    dom.damageBar.style.background = 'linear-gradient(90deg,#ffd93d,#4d96ff)';
  } else {
    dom.damageBar.style.background = 'linear-gradient(90deg,#4d96ff,#c77dff)';
  }

  // Combo
  if (state.combo >= 2) {
    dom.comboDisplay.textContent = `${state.combo}× COMBO`;
    dom.comboDisplay.className =
      state.combo >= 12 ? 'combo-insane' :
      state.combo >= 6  ? 'combo-high'   : 'combo-normal';
  } else {
    dom.comboDisplay.textContent = '';
    dom.comboDisplay.className   = '';
  }

  // CPS
  dom.cpsDisplay.textContent = `${cps} CPS`;
  dom.cpsDisplay.className =
    cps >= 12 ? 'cps-insane' :
    cps >= 6  ? 'cps-high'   : '';
}

// ─── GAME OVER → WIN + BREAK-SEQUENZ ──────────────────────────────────────

function triggerGameOver() {
  if (state.isGameOver) return;
  state.isGameOver = true;

  stopDecay();

  // Button kaputt
  dom.button.setAttribute('data-phase', 'broken');
  dom.hitLayer.classList.remove('anim-hit-a','anim-hit-b','anim-hit-c','anim-rage','anim-heated');
  dom.button.classList.add('broken-final');
  dom.buttonText.textContent = '💀';
  dom.tauntText.textContent = '...du hast es wirklich getan. Du absolutes Monster.';
  dom.tauntText.classList.remove('taunt-flash');

  // Win-Sound (Fanfare → Explosion)
  audio.playWin();

  // Weißer Flash + Shake-Kaskade
  dom.flashOverlay.classList.add('flash-white');
  setTimeout(() => dom.flashOverlay.classList.remove('flash-white'), 160);

  let ticks = 0;
  const shakeInterval = setInterval(() => {
    screenShake('heavy');
    if (++ticks >= 6) clearInterval(shakeInterval);
  }, 85);

  // Phase 1: Spiel fängt an zu brechen (Glitch-Overlay + Body-Distortion)
  setTimeout(() => {
    document.body.classList.add('game-breaking');
    dom.breakOverlay.classList.add('active');
  }, 1300);

  // Phase 2: Fake-Fehlermeldung einblenden
  setTimeout(() => {
    dom.breakMessage.classList.add('visible');
  }, 1700);

  // Phase 3: Alles schwarz → Fenster schließen
  setTimeout(() => {
    dom.breakMessage.classList.add('closing');
    setTimeout(() => window.close(), 600);
  }, 3800);
}

// ─── CLICK HANDLER ─────────────────────────────────────────────────────────

function handleClick(e) {
  if (state.isGameOver) return;

  if (state.startTime === null) state.startTime = Date.now();

  const now = Date.now();
  state.totalClicks++;
  state.clickTimestamps.push(now);

  // Combo logic
  const gap = now - state.lastClickTime;
  if (state.lastClickTime > 0) {
    if (gap < CFG.COMBO_FAST_MS) {
      state.combo = Math.min(state.combo + 1, 30);
    } else if (gap > CFG.COMBO_RESET_MS) {
      state.combo = 0;
    }
    // neutral zone: combo stays
  }
  state.lastClickTime = now;
  state.maxCombo = Math.max(state.maxCombo, state.combo);

  const cps = getCPS();
  state.maxCPS = Math.max(state.maxCPS, cps);

  // Damage
  const comboMult = Math.min(1 + state.combo * CFG.COMBO_MULTIPLIER, CFG.MAX_COMBO_MULT);
  const dmg = Math.round(CFG.BASE_DAMAGE * comboMult);
  state.damage = Math.min(state.damage + dmg, state.currentLevel.hp);

  // Audio
  audio.playHit(cps, state.combo);

  // Animations
  triggerHitAnimation(cps);

  if      (cps >= 12 || state.combo >= 10) screenShake('heavy');
  else if (cps >= 6  || state.combo >= 5)  screenShake('medium');
  else                                      screenShake('light');

  // Particles
  const count = Math.min(3 + Math.floor(cps * 0.9), 22);
  spawnParticles(e.clientX, e.clientY, count, cps);

  // Combo pop every 5 levels
  if (state.combo > 0 && state.combo % 5 === 0) {
    const r = dom.button.getBoundingClientRect();
    spawnComboText(r.left + r.width / 2, r.top, state.combo);
  }

  updateTaunt(cps);
  updateUI(cps);
  syncPhase();

  if (state.damage >= state.currentLevel.hp) triggerLevelComplete();
}

// ─── INIT ──────────────────────────────────────────────────────────────────

function init() {
  initDom();
  dom.button.addEventListener('click', handleClick);

  dom.button.setAttribute('data-phase', '1');
  document.body.setAttribute('data-phase', '1');
  dom.tauntText.textContent = TAUNTS.idle[0];
  startDecay();
}

document.addEventListener('DOMContentLoaded', init);
