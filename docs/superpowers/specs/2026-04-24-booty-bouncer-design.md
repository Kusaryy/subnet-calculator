# Booty-Bouncer — Design Spec

**Datum:** 2026-04-24  
**Status:** Approved

---

## Spielkonzept

Humorvolles, cartoonhaftes Singleplayer-Arcade-Tanzspiel. Der Spieler steuert eine überzeichnete Comic-Figur (großer, kräftiger schwarzer Mann, Afro, Brille, riesiger Cartoon-Booty) und lässt sie passend zu Eingaben bouncen, shaken und jumpen. Fokus liegt auf reaktiver Steuerung, comichaften Animationen und einem Combo-System.

---

## Tech-Stack

| Komponente | Wahl |
|---|---|
| Rendering | HTML5 Canvas (programmatisch, keine Bild-Assets) |
| Desktop-Shell | Electron |
| Build | electron-builder → Windows NSIS + Portable |
| Audio | Web Audio API (synthetisch, keine Audiodateien) |
| Sprache | Vanilla JavaScript (ES6+) |

**Begründung:** Gleicher Stack wie `button-smasher` (bereits erprobt), kein Asset-Dependency, schnellster Weg zum spielbaren Build.

---

## Projektstruktur

```
booty-bouncer/
├── src/
│   ├── index.html       — Electron-Renderer, Canvas-Markup
│   ├── styles.css       — Grundlayout, Fullscreen
│   ├── game.js          — State-Machine, Game-Loop, Score
│   ├── character.js     — Canvas-Zeichenlogik, Animationssystem
│   ├── audio.js         — Web Audio Engine (Beat + SFX)
│   └── combo.js         — Input-Buffer, Combo-Erkennung, Rating
├── assets/              — leer (alles programmatisch)
├── main.js              — Electron Entry Point
├── package.json
├── PROJECT_PLAN.md
├── HANDOFF.md
└── README.md
```

---

## Game States

```
INTRO → MENU → GAMEPLAY → RESULT
         ↑________________________|  (Retry)
         |________________________|  (Back to Menu)
```

### INTRO
- Dauer: ~3 Sekunden
- Canvas: Figur von vorne (Frontansicht), lustige Eingangspose, Afro + Brille gut sichtbar
- Einblende: Titel "BOOTY-BOUNCER" mit Bounce-Animation
- Automatischer Übergang → MENU

### MENU
- Buttons: Start Game / Music On/Off / Quit
- Kleiner Info-Text: Steuerung (WASD + Space)
- Figur im Hintergrund leicht wackelnd (Idle)

### GAMEPLAY
- Dauer: **60 Sekunden** (zeitbasiert, einfacher als Endless)
- Canvas: Rückansicht der Figur, Booty im Mittelpunkt
- Loopender synthetischer Beat startet
- HUD: Score | Combo-Counter | Multiplikator | Timer

### RESULT
- Endscore, Höchste Combo, Multiplikator
- Buttons: Retry / Back to Menu

---

## Figur — Zeichenlogik (Canvas)

### Frontansicht (Intro)
- Torso: breites Oval, dunkle Hautfarbe
- Kopf: runder Kreis, markante Afro-Krone (großes, dunkles Fluff-Ellipsoid)
- Brille: zwei Kreise, dicke Fassung
- Augen: weiße Kreise hinter Brille
- Arme: zwei geschwungene Linien
- Booty: seitlich angedeutet, übergroßes Oval hinter dem Torso

### Rückansicht (Gameplay)
- Torso: breites Rechteck von hinten
- Afro: großes Ellipsoid oben sichtbar
- Booty: **Hauptelement** — zwei sehr große Halbkreise, klar lesbar, mittig-unten
- Beine: kurze, dicke Zylinder
- Arme: seitlich herausragend

---

## Animationssystem

Keyframe-basiert: jede Animation hat `duration`, `easing` und ein Set von `transforms`:

```js
{ offsetX, offsetY, scaleX, scaleY, rotation, bootyScaleY, bootyOffsetY }
```

### Animationen

| Input | Animation | Beschreibung |
|---|---|---|
| Idle | Idle Bounce | Leichtes Auf-Ab-Wippen, Booty federt |
| W | Forward Bounce | Vorwärts-Lean, Booty nach oben/hinten |
| A | Left Shake | Seitwärts-Twist links, Booty schlägt links |
| S | Back Bounce | Backward-Bend, Booty nach vorne gedrückt |
| D | Right Shake | Seitwärts-Twist rechts, Booty schlägt rechts |
| Space | Jump Bounce | Hoch-Jump, Squash bei Landung |

### Combo-Animationen (4 Stück)

| Combo | Sequence | Animation |
|---|---|---|
| Twerk Storm | W + A | Schnelles Alternieren, Screen Shake |
| Booty Blast | W + D | Großer Vorwärts-Schlag, Partikel-Burst |
| Bounce Slam | A + A + Space | Doppel-Side + Jump mit Absturz-Landung |
| Ground Shaker | S + D + Space | Backward-Spin + Jump, Impact-Flash |

### Visuelle Effekte bei Combos
- Screen Shake (kurze Canvas-Verschiebung)
- Impact-Flash (kurzer weißer Overlay-Blitz)
- Rating-Popup (zentriert, groß, faded aus)
- Partikel (kleine Kreise, radial explodierend)

---

## Combo-System

```
Input-Buffer: letzte 5 Inputs, max 800ms zwischen Inputs
Erkennung: nach jedem Input wird Buffer gegen Combo-Liste geprüft
```

### Ratings

| Combo | Rating | Multiplikator-Bonus |
|---|---|---|
| W + A | Nice | +0.5x |
| W + D | Dope | +1.0x |
| A + A + Space | Wild | +1.5x |
| S + D + Space | Legendary | +2.0x |

Multiplikator startet bei 1x, cap bei 8x, decayt nach 3s Inaktivität.

---

## Score-System

```
Score += 10 × Multiplikator    (pro Input)
Score += 50 × Multiplikator    (pro Combo)
```

---

## Audio (Web Audio API — kein File-Dependency)

### Beat (Loop)
- Synthetischer 4/4-Kick via `OscillatorNode` (Sine, freq sweep 150→50Hz) + `GainNode` Envelope
- Hihat: kurzes `WhiteNoise`-Buffer via `AudioBufferSourceNode`
- Tempo: 120 BPM, Loop alle 2 Bars

### SFX
| Event | Synthese |
|---|---|
| Bounce | Kurzer Sine-Sweep up (200→400Hz, 80ms) |
| Jump | Sine-Sweep up (300→600Hz, 150ms) |
| Combo | Kurzer Chord-Burst (3 Sines, 200ms) |
| Click | Kurzer Click-Transient (Noise, 30ms) |
| Landing | Thud (Sine, 150→50Hz, 100ms) |

---

## Steuerung

| Taste | Aktion |
|---|---|
| W | Forward Bounce |
| A | Left Shake |
| S | Back Bounce |
| D | Right Shake |
| Space | Jump Bounce |
| ESC | Pause / Back to Menu |

---

## Akzeptanzkriterien

- [ ] Startbar via `npm start`
- [ ] Alle 4 States funktionieren (Intro → Menu → Gameplay → Result)
- [ ] WASD + Space reagieren sofort mit sichtbarer Animation
- [ ] 4 Combos erkennbar und visuell belohnt
- [ ] Score, Combo-Counter, Multiplikator im HUD sichtbar
- [ ] 60s Timer läuft, Result-Screen erscheint
- [ ] Beat loopt während Gameplay
- [ ] SFX auf Inputs
- [ ] Figur klar erkennbar (Afro, Brille, Booty)
- [ ] Frontansicht im Intro, Rückansicht im Gameplay
- [ ] Windows-Build via `npm run build` möglich
- [ ] README erklärt Start + Build
