const STATE = { INTRO: 'INTRO', MENU: 'MENU', GAMEPLAY: 'GAMEPLAY', RESULT: 'RESULT' };
const CANVAS_W = 900, CANVAS_H = 700;
const GAME_DURATION = 60;
const INPUT_MAP = { w: 'bounce_w', a: 'bounce_a', s: 'bounce_s', d: 'bounce_d', ' ': 'jump' };
const SFX_MAP  = { w: 'bounce', a: 'bounce', s: 'bounce', d: 'bounce', ' ': 'jump' };

const RATING_COLORS = {
  'Nice':      '#88FF88',
  'Dope':      '#FFDD00',
  'Wild':      '#FF8800',
  'Legendary': '#FF44FF',
};

const game = {
  state: STATE.INTRO,
  introTimer: 0,
  score: 0,
  bestScore: 0,
  multiplier: 1,
  multiplierTimer: 0,
  comboCount: 0,
  bestCombo: 0,
  timeLeft: GAME_DURATION,
  gameTimer: 0,
  menuButtons: [],
  resultButtons: [],
  musicOn: true,
};

let canvas, ctx, char, audio, inputBuf;
let lastTime = 0;

window.addEventListener('load', () => {
  canvas = document.getElementById('gameCanvas');
  ctx    = canvas.getContext('2d');
  char   = new Character(canvas);
  audio  = new AudioEngine();
  inputBuf = new InputBuffer();

  inputBuf.onCombo = handleCombo;

  window.addEventListener('keydown', onKeyDown);

  game.menuButtons = [
    { label: 'START GAME', x: 450, y: 360, w: 280, h: 60, action: startGame },
    { label: 'MUSIC ON',   x: 450, y: 440, w: 280, h: 60, action: toggleMusic, id: 'music' },
    { label: 'QUIT',       x: 450, y: 520, w: 280, h: 60, action: () => window.close() },
  ];
  game.resultButtons = [
    { label: 'RETRY',      x: 450, y: 480, w: 220, h: 60, action: startGame },
    { label: 'MAIN MENU',  x: 450, y: 560, w: 220, h: 60, action: goMenu },
  ];

  canvas.addEventListener('click', onCanvasClick);
  requestAnimationFrame(loop);
});

function loop(now) {
  const dt = Math.min(now - lastTime, 50);
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
      if (game.introTimer > 3200) goMenu();
      break;

    case STATE.GAMEPLAY:
      game.gameTimer += dt;
      game.timeLeft = Math.max(0, GAME_DURATION - game.gameTimer / 1000);

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

function onKeyDown(e) {
  const key = e.key.toLowerCase();
  if (e.repeat) return;

  if (game.state === STATE.GAMEPLAY && INPUT_MAP[key]) {
    e.preventDefault();
    inputBuf.push(key);
    if (!char.animActive || !char.currentAnim.startsWith('combo_')) {
      char.triggerAnimation(INPUT_MAP[key]);
    }
    audio.playSFX(SFX_MAP[key]);
    addScore(10);
  }

  if (key === 'escape' && game.state === STATE.GAMEPLAY) goMenu();
}

function handleCombo(comboDef) {
  char.triggerAnimation(comboDef.animation);
  audio.playSFX('combo');
  char.screenShake(16, 300);
  char.flashEffect(RATING_COLORS[comboDef.rating] || '#ffffff', 200);
  char.spawnParticles(450, 420, 18, RATING_COLORS[comboDef.rating] || '#FFD700');
  char.showRating(comboDef.label, RATING_COLORS[comboDef.rating]);

  addScore(50);
  game.multiplier = Math.min(8, game.multiplier + comboDef.multiplierBonus);
  game.multiplierTimer = 3000;
  game.comboCount++;
  game.bestCombo = Math.max(game.bestCombo, game.comboCount);
}

function addScore(base) {
  game.score += Math.floor(base * game.multiplier);
}

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
  const muted = audio.toggleMute();
  game.musicOn = !muted;
  const btn = game.menuButtons.find(b => b.id === 'music');
  if (btn) btn.label = muted ? 'MUSIC OFF' : 'MUSIC ON';
  audio.playSFX('click');
}

function onCanvasClick(e) {
  const rect = canvas.getBoundingClientRect();
  const mx = e.clientX - rect.left;
  const my = e.clientY - rect.top;

  const buttons =
    game.state === STATE.MENU   ? game.menuButtons :
    game.state === STATE.RESULT ? game.resultButtons : [];

  for (const btn of buttons) {
    if (mx > btn.x - btn.w / 2 && mx < btn.x + btn.w / 2 &&
        my > btn.y - btn.h / 2 && my < btn.y + btn.h / 2) {
      audio.playSFX('click');
      btn.action();
      return;
    }
  }

  if (game.state === STATE.INTRO) goMenu();
}

// ── RENDER ───────────────────────────────────────────────────────────
function render() {
  ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
  switch (game.state) {
    case STATE.INTRO:    renderIntro();    break;
    case STATE.MENU:     renderMenu();     break;
    case STATE.GAMEPLAY: renderGameplay(); break;
    case STATE.RESULT:   renderResult();   break;
  }
}

function renderIntro() {
  const grad = ctx.createLinearGradient(0, 0, 0, CANVAS_H);
  grad.addColorStop(0, '#2D0A5E');
  grad.addColorStop(1, '#1A0A2E');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

  const spot = ctx.createRadialGradient(450, 400, 0, 450, 400, 350);
  spot.addColorStop(0, 'rgba(255,200,100,0.15)');
  spot.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = spot;
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

  const slideT = _easeOutBounce(Math.min(game.introTimer / 800, 1));
  const charY = CANVAS_H - 120 + (1 - slideT) * 300;
  const scale = 0.85 + slideT * 0.15;
  ctx.save();
  ctx.translate(450, charY);
  ctx.scale(scale, scale);
  ctx.translate(-450, -charY);
  char.drawFront(450, charY);
  ctx.restore();

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

function renderMenu() {
  const grad = ctx.createLinearGradient(0, 0, 0, CANVAS_H);
  grad.addColorStop(0, '#2D0A5E');
  grad.addColorStop(1, '#1A0A2E');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

  _drawDiscoFloor();

  char.drawBack(450, 500, char.transforms);

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

  ctx.font = '16px Arial';
  ctx.fillStyle = '#aaa';
  ctx.textAlign = 'center';
  ctx.fillText('WASD = Shake  |  SPACE = Jump  |  ESC = Menu', 450, 310);

  _drawButtons(game.menuButtons);
}

function renderGameplay() {
  const grad = ctx.createLinearGradient(0, 0, 0, CANVAS_H);
  grad.addColorStop(0, '#1A0A2E');
  grad.addColorStop(1, '#0D0520');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

  _drawDiscoFloor();

  ctx.fillStyle = '#3A0D7A';
  ctx.beginPath();
  ctx.ellipse(450, 600, 220, 40, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#6B2FA0';
  ctx.lineWidth = 3;
  ctx.stroke();

  char.drawBack(450, 490, char.transforms);
  char.drawEffects(450, 490);

  _drawHUD();
}

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
  ctx.fillText(`MAX COMBO: x${game.bestCombo}`, 450, 290);
  ctx.fillText(`MULTIPLIER: x${Math.floor(game.multiplier * 10) / 10}`, 450, 330);

  const grade =
    game.score > 5000 ? 'LEGENDARY' :
    game.score > 3000 ? 'WILD' :
    game.score > 1500 ? 'DOPE' : 'NICE';
  ctx.font = 'bold 40px Arial';
  ctx.fillStyle = '#FFD700';
  ctx.fillText(grade, 450, 400);

  _drawButtons(game.resultButtons);
}

// ── HELPERS ──────────────────────────────────────────────────────────
function _drawHUD() {
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

  ctx.font = 'bold 32px Arial Black';
  ctx.textAlign = 'left';
  ctx.fillStyle = '#FFD700';
  ctx.fillText(`${game.score}`, 20, 75);
  ctx.font = '14px Arial';
  ctx.fillStyle = '#aaa';
  ctx.fillText('SCORE', 20, 90);

  ctx.font = 'bold 28px Arial Black';
  ctx.textAlign = 'right';
  ctx.fillStyle = '#FF8800';
  ctx.fillText(`x${Math.floor(game.multiplier * 10) / 10}`, 880, 75);
  ctx.font = '14px Arial';
  ctx.fillStyle = '#aaa';
  ctx.fillText('MULT', 880, 90);

  ctx.font = 'bold 20px Arial';
  ctx.textAlign = 'center';
  ctx.fillStyle = '#88FFFF';
  ctx.fillText(`COMBOS: ${game.comboCount}`, 450, 75);
}

function _drawButtons(buttons) {
  buttons.forEach(btn => {
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.beginPath();
    ctx.roundRect(btn.x - btn.w / 2 + 3, btn.y - btn.h / 2 + 3, btn.w, btn.h, [12]);
    ctx.fill();

    ctx.fillStyle = '#FF6B35';
    ctx.beginPath();
    ctx.roundRect(btn.x - btn.w / 2, btn.y - btn.h / 2, btn.w, btn.h, [12]);
    ctx.fill();

    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(btn.x - btn.w / 2, btn.y - btn.h / 2, btn.w, btn.h, [12]);
    ctx.stroke();

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
      const ci = Math.floor((x / tileSize + y / tileSize + Math.floor(t)) % colors.length);
      const flash = Math.sin(t * 2 + x * 0.05 + y * 0.07) > 0.85;
      ctx.fillStyle = flash ? '#8844FF' : colors[Math.abs(ci)];
      ctx.fillRect(x, y, tileSize - 2, tileSize - 2);
    }
  }
}

function _easeOutBounce(t) {
  const n1 = 7.5625, d1 = 2.75;
  if (t < 1 / d1)     return n1 * t * t;
  if (t < 2 / d1)     return n1 * (t -= 1.5 / d1) * t + 0.75;
  if (t < 2.5 / d1)   return n1 * (t -= 2.25 / d1) * t + 0.9375;
  return n1 * (t -= 2.625 / d1) * t + 0.984375;
}
