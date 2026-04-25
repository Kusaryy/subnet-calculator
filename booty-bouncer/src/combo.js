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
    this.buffer = [];
    this.MAX_WINDOW = 1000;
    this.MAX_LENGTH = 5;
    this.onCombo = null;
  }

  push(key) {
    const now = Date.now();
    this.buffer = this.buffer.filter(e => now - e.time < this.MAX_WINDOW);
    this.buffer.push({ key: key.toLowerCase(), time: now });
    if (this.buffer.length > this.MAX_LENGTH) this.buffer.shift();
    this._check();
  }

  _check() {
    const keys = this.buffer.map(e => e.key);
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
