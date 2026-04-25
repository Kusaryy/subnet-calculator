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
        const sq = t / 0.4;
        transforms.offsetY = sq * 20;
        transforms.scaleY = 1 - sq * 0.15;
        transforms.scaleX = 1 + sq * 0.12;
      } else if (t < 0.7) {
        const air = (t - 0.4) / 0.3;
        transforms.offsetY = -air * (1 - air) * 4 * 140;
        transforms.scaleY = 1 + air * 0.1;
        transforms.bootyScaleY = 0.85 + air * 0.15;
      } else {
        const land = (t - 0.7) / 0.3;
        const squash = char._easeOutBounce(land);
        transforms.offsetY = 0;
        transforms.scaleY = 1 - (1 - land) * 0.25;
        transforms.scaleX = 1 + (1 - land) * 0.25;
        transforms.bootyScaleY = 1 + (1 - squash) * 0.4;
        transforms.bootyOffsetY = (1 - squash) * 20;
      }
      return transforms;
    }
  },

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
      transforms.offsetY = t < 0.3 ? blast * -20 : (1 - blast) * -20;
      transforms.lean = Math.sin(t * Math.PI * 2) * 0.3;
      return transforms;
    }
  },

  combo_bounce_slam: {
    duration: 900,
    apply(t, char) {
      const transforms = char._defaultTransforms();
      if (t < 0.5) {
        const slide = Math.sin(t * Math.PI * 4);
        transforms.offsetX = slide * 50;
        transforms.lean = slide * 0.4;
      } else {
        const slam = (t - 0.5) / 0.5;
        if (slam < 0.6) {
          transforms.offsetY = -slam * (1 - slam) * 4 * 120;
        } else {
          const land = (slam - 0.6) / 0.4;
          transforms.scaleY = 1 - (1 - land) * 0.3;
          transforms.scaleX = 1 + (1 - land) * 0.3;
          transforms.bootyScaleX = 1 + (1 - char._easeOutBounce(land)) * 0.6;
          transforms.bootyScaleY = 1 + (1 - char._easeOutBounce(land)) * 0.4;
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

class Character {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.cx = canvas.width / 2;
    this.cy = canvas.height / 2;

    this.currentAnim = 'idle';
    this.animProgress = 0;
    this.animDuration = 0;
    this.animElapsed = 0;
    this.animActive = false;
    this.transforms = this._defaultTransforms();

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
      lean: 0,
    };
  }

  _easeOutBounce(t) {
    const n1 = 7.5625, d1 = 2.75;
    if (t < 1 / d1)       return n1 * t * t;
    if (t < 2 / d1)       return n1 * (t -= 1.5 / d1) * t + 0.75;
    if (t < 2.5 / d1)     return n1 * (t -= 2.25 / d1) * t + 0.9375;
    return n1 * (t -= 2.625 / d1) * t + 0.984375;
  }

  _easeOutElastic(t) {
    if (t === 0 || t === 1) return t;
    return Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * (2 * Math.PI) / 3) + 1;
  }

  triggerAnimation(name) {
    const def = ANIMATIONS[name];
    if (!def) return;
    this.currentAnim = name;
    this.animElapsed = 0;
    this.animDuration = def.duration;
    this.animActive = true;
  }

  update(dt) {
    if (this.shake.timer > 0) {
      this.shake.timer -= dt;
      const s = this.shake.intensity * (this.shake.timer / 200);
      this.shake.x = (Math.random() - 0.5) * 2 * s;
      this.shake.y = (Math.random() - 0.5) * 2 * s;
    } else {
      this.shake.x = 0; this.shake.y = 0;
    }

    if (this.flash.timer > 0) {
      this.flash.timer -= dt;
      this.flash.alpha = this.flash.timer / 200;
    } else {
      this.flash.alpha = 0;
    }

    this.particles = this.particles.filter(p => p.life > 0);
    this.particles.forEach(p => {
      p.x += p.vx * (dt / 16);
      p.y += p.vy * (dt / 16);
      p.vy += 0.3 * (dt / 16);
      p.life -= dt;
      p.alpha = p.life / p.maxLife;
    });

    if (this.ratingPopup) {
      this.ratingPopup.timer -= dt;
      if (this.ratingPopup.timer <= 0) this.ratingPopup = null;
    }

    if (!this.animActive) {
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

  // ── FRONT VIEW ────────────────────────────────────────────────────
  drawFront(cx, cy, t) {
    if (!t) t = this._defaultTransforms();
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

    // Wide hips peeking from sides
    ctx.fillStyle = '#A0522D';
    ctx.beginPath();
    ctx.ellipse(-90, 100, 50, 70, -0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(90, 100, 50, 70, 0.3, 0, Math.PI * 2);
    ctx.fill();

    // Pants
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

    // Collar V
    ctx.fillStyle = '#FF8C5A';
    ctx.beginPath();
    ctx.moveTo(-20, -60);
    ctx.lineTo(0, -30);
    ctx.lineTo(20, -60);
    ctx.fill();

    // Left arm
    ctx.fillStyle = '#A0522D';
    ctx.beginPath();
    ctx.ellipse(-90, 20, 22, 65, 0.25, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(-98, 85, 18, 0, Math.PI * 2);
    ctx.fill();

    // Right arm
    ctx.beginPath();
    ctx.ellipse(90, 20, 22, 65, -0.25, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(98, 85, 18, 0, Math.PI * 2);
    ctx.fill();

    // Neck
    ctx.beginPath();
    ctx.roundRect(-18, -75, 36, 20, [5]);
    ctx.fill();

    // Head
    ctx.beginPath();
    ctx.ellipse(0, -130, 58, 62, 0, 0, Math.PI * 2);
    ctx.fill();

    // Afro
    ctx.fillStyle = '#1C1008';
    ctx.beginPath();
    ctx.ellipse(0, -165, 90, 75, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#2C1810';
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const r = 70 + Math.sin(i * 1.7) * 12;
      ctx.beginPath();
      ctx.arc(Math.cos(angle) * r * 0.8, -165 + Math.sin(angle) * r * 0.7, 18, 0, Math.PI * 2);
      ctx.fill();
    }

    // Eye whites
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

    // Glasses
    ctx.strokeStyle = '#2C2C2C';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.ellipse(-22, -135, 17, 16, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(22, -135, 17, 16, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-5, -135);
    ctx.lineTo(5, -135);
    ctx.stroke();
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

  // ── BACK VIEW ─────────────────────────────────────────────────────
  drawBack(cx, cy, t) {
    if (!t) t = this._defaultTransforms();
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

    // Shoes
    ctx.fillStyle = '#CC2222';
    ctx.beginPath();
    ctx.ellipse(-40, 190, 34, 15, 0.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(40, 190, 34, 15, -0.1, 0, Math.PI * 2);
    ctx.fill();

    // Pants
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

    // ── THE BOOTY ────────────────────────────────────────────────────
    ctx.save();
    ctx.translate(0, t.bootyOffsetY);
    ctx.scale(t.bootyScaleX, t.bootyScaleY);

    ctx.fillStyle = '#A0522D';
    ctx.beginPath();
    ctx.arc(-38, 115, 72, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(38, 115, 72, 0, Math.PI * 2);
    ctx.fill();

    // Highlights
    ctx.fillStyle = 'rgba(255,200,150,0.15)';
    ctx.beginPath();
    ctx.ellipse(-42, 95, 35, 28, -0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(42, 95, 35, 28, 0.3, 0, Math.PI * 2);
    ctx.fill();

    // Center line
    ctx.strokeStyle = 'rgba(100,40,10,0.5)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, 68);
    ctx.quadraticCurveTo(2, 120, 0, 170);
    ctx.stroke();

    ctx.restore();
    // ─────────────────────────────────────────────────────────────────

    // Shirt
    ctx.fillStyle = '#FF6B35';
    ctx.beginPath();
    ctx.roundRect(-65, -60, 130, 145, [15, 15, 0, 0]);
    ctx.fill();

    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.font = 'bold 36px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('69', 0, 20);

    // Arms
    ctx.fillStyle = '#A0522D';
    ctx.beginPath();
    ctx.ellipse(-85 + t.lean * -10, 20, 22, 60, 0.3 + t.lean * 0.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(85 + t.lean * -10, 20, 22, 60, -0.3 + t.lean * 0.1, 0, Math.PI * 2);
    ctx.fill();

    // Afro
    ctx.fillStyle = '#1C1008';
    ctx.beginPath();
    ctx.ellipse(0, -145, 85, 70, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#2C1810';
    for (let i = 0; i < 7; i++) {
      const angle = (i / 7) * Math.PI;
      ctx.beginPath();
      ctx.arc(Math.cos(angle + 0.4) * 65, -145 + Math.sin(angle) * 50, 20, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  drawEffects(cx, cy) {
    const ctx = this.ctx;

    this.particles.forEach(p => {
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    if (this.flash.alpha > 0) {
      ctx.save();
      ctx.globalAlpha = this.flash.alpha * 0.5;
      ctx.fillStyle = this.flash.color;
      ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      ctx.restore();
    }

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
}
