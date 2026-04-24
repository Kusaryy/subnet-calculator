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
    this.animQueue = [];
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

  drawFront(cx, cy, t) {
    if (!t) t = this._defaultTransforms();
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(cx + t.offsetX, cy + t.offsetY);
    ctx.scale(t.scaleX, t.scaleY);
    ctx.rotate(t.rotation);

    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.ellipse(0, 170, 80, 20, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.fillStyle = '#A0522D';
    ctx.beginPath();
    ctx.ellipse(-90, 100, 50, 70, -0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(90, 100, 50, 70, 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.fillStyle = '#4A90D9';
    ctx.beginPath();
    ctx.roundRect(-55, 80, 110, 90, [10]);
    ctx.fill();

    ctx.fillStyle = '#2C1810';
    ctx.fillRect(-55, 78, 110, 14);
    ctx.fillStyle = '#FFD700';
    ctx.fillRect(-10, 80, 20, 10);

    ctx.fillStyle = '#FF6B35';
    ctx.beginPath();
    ctx.roundRect(-65, -60, 130, 148, [15, 15, 0, 0]);
    ctx.fill();

    ctx.fillStyle = '#FF8C5A';
    ctx.beginPath();
    ctx.moveTo(-20, -60);
    ctx.lineTo(0, -30);
    ctx.lineTo(20, -60);
    ctx.fill();

    ctx.save();
    ctx.fillStyle = '#A0522D';
    ctx.beginPath();
    ctx.ellipse(-90, 20, 22, 65, 0.25, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(-98, 85, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.fillStyle = '#A0522D';
    ctx.beginPath();
    ctx.ellipse(90, 20, 22, 65, -0.25, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(98, 85, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.fillStyle = '#A0522D';
    ctx.beginPath();
    ctx.roundRect(-18, -75, 36, 20, [5]);
    ctx.fill();

    ctx.fillStyle = '#A0522D';
    ctx.beginPath();
    ctx.ellipse(0, -130, 58, 62, 0, 0, Math.PI * 2);
    ctx.fill();

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

    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.ellipse(-22, -135, 14, 13, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(22, -135, 14, 13, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#1C1008';
    ctx.beginPath();
    ctx.arc(-20, -133, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(24, -133, 7, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#1C1008';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, -118, 20, 0.2, Math.PI - 0.2);
    ctx.stroke();

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

    ctx.fillStyle = '#FF4444';
    ctx.beginPath();
    ctx.ellipse(-32, 170, 32, 14, -0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(32, 170, 32, 14, 0.2, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  drawBack(cx, cy, t) {
    if (!t) t = this._defaultTransforms();
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(cx + t.offsetX + this.shake.x, cy + t.offsetY + this.shake.y);
    ctx.scale(t.scaleX, t.scaleY);
    ctx.rotate(t.rotation + t.lean * 0.15);

    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.beginPath();
    ctx.ellipse(0, 200, 110 * t.bootyScaleX, 22, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#CC2222';
    ctx.beginPath();
    ctx.ellipse(-40, 190, 34, 15, 0.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(40, 190, 34, 15, -0.1, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#3A7AC0';
    ctx.beginPath();
    ctx.roundRect(-60, 80, 120, 110, [5, 5, 20, 20]);
    ctx.fill();

    ctx.strokeStyle = '#2C5D9A';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, 85);
    ctx.lineTo(0, 185);
    ctx.stroke();

    ctx.fillStyle = '#2C1810';
    ctx.fillRect(-60, 78, 120, 14);
    ctx.fillStyle = '#FFD700';
    ctx.fillRect(-12, 80, 24, 10);

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

    ctx.fillStyle = 'rgba(255,200,150,0.15)';
    ctx.beginPath();
    ctx.ellipse(-42, 95, 35, 28, -0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(42, 95, 35, 28, 0.3, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = 'rgba(100,40,10,0.5)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, 68);
    ctx.quadraticCurveTo(2, 120, 0, 170);
    ctx.stroke();

    ctx.restore();

    ctx.fillStyle = '#FF6B35';
    ctx.beginPath();
    ctx.roundRect(-65, -60, 130, 145, [15, 15, 0, 0]);
    ctx.fill();

    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.font = 'bold 36px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('69', 0, 20);

    ctx.fillStyle = '#A0522D';
    ctx.beginPath();
    ctx.ellipse(-85 + t.lean * -10, 20, 22, 60, 0.3 + t.lean * 0.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(85 + t.lean * -10, 20, 22, 60, -0.3 + t.lean * 0.1, 0, Math.PI * 2);
    ctx.fill();

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
}
