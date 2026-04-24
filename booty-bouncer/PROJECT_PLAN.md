# Booty-Bouncer — Project Plan

## Projektziel
Humorvolles, cartoonhaftes Singleplayer-Arcade-Tanzspiel.
Spieler steuert eine überzeichnete Figur (großer schwarzer Mann, Afro, Brille, riesiger comichafter Hintern).
60-Sekunden-Runden, WASD+Space-Steuerung, Combo-System, Endscore.

---

## Tech-Stack (Entscheidung + Begründung)

| Technologie | Rolle | Begründung |
|---|---|---|
| HTML5 Canvas 2D | Renderer | Programmatische Kartoon-Grafik, keine Sprite-Sheets nötig |
| Vanilla JS ES6+ | Spiellogik | Kein Framework-Overhead, volle Kontrolle über Gameloop |
| Web Audio API | Audio | Synthetischer Beat + SFX — keine externen Audio-Dateien nötig |
| Electron 28 | Desktop-Wrapper | Schnellstes Wrapping als Windows-.exe |
| electron-builder | Build | NSIS-Installer + Portable EXE mit einer Config-Zeile |

**Gewählt: HTML5 Canvas + Electron**
Gründe: Schnellste Iteration, keine Asset-Abhängigkeiten, Canvas reicht für Cartoon-Grafik, Electron kapselt direkt für Windows.

---

## Dateistruktur (geplant)

```
booty-bouncer/
├── src/
│   ├── index.html       HTML-Shell, Canvas-Element, Script-Load-Order
│   ├── styles.css       Fullscreen-Layout, kein Scrollbar
│   ├── audio.js         AudioEngine — Web Audio Beat + SFX
│   ├── combo.js         InputBuffer — Key-History + Combo-Detection
│   ├── character.js     Character — Canvas-Drawing + Animation-System
│   └── game.js          Game — State Machine, Loop, HUD, alle Screens
├── main.js              Electron Main Process, BrowserWindow
├── package.json         Electron + electron-builder Config
├── PROJECT_PLAN.md      (diese Datei)
├── HANDOFF.md           Session-Handoff
└── README.md            Start- und Build-Anleitung
```

**Kein `/assets/audio/`** — Audio wird synthetisch per Web Audio API erzeugt.

---

## Game States

| State | Beschreibung |
|---|---|
| INTRO | 3s Frontansicht, Charakter-Slide-in, Titel-Animation, Auto-Skip |
| MENU | Start Game / Music On+Off / Quit, Idle-Charakter (Rückansicht) |
| GAMEPLAY | 60s, Beat läuft, WASD+Space triggert Animationen + Combos, HUD |
| RESULT | Endscore, Max Combo, Grade, Retry / Main Menu |

---

## Steuerung

| Taste | Aktion | Animation |
|---|---|---|
| W | Forward Bounce | `bounce_w` |
| A | Left Shake | `bounce_a` |
| S | Back Bounce | `bounce_s` |
| D | Right Shake | `bounce_d` |
| Space | Jump Bounce | `jump` |
| ESC | Zurück ins Menü | — |

---

## Animationen (geplant)

| Animation | Typ | Beschreibung |
|---|---|---|
| idle | Loop | Sanftes Bouncen, Booty-Sway |
| bounce_w | Move | Forward lean, Booty pop nach oben |
| bounce_a | Move | Links-Shimmy, Booty schwingt links |
| bounce_s | Move | Backward, Booty thrust zur Kamera |
| bounce_d | Move | Rechts-Shimmy, Booty schwingt rechts |
| jump | Move | Anticipation-Squash → Airtime → Landing-Squash |
| combo_twerk_storm | Combo | Schnelle Twerk-Schwingung |
| combo_booty_blast | Combo | Booty explodiert nach außen → Bounce-Back |
| combo_bounce_slam | Combo | Side-to-Side dann Jump+Slam |
| combo_ground_shaker | Combo | Rotation + Booty-Shaker + Ground-Impact |
| drawFront() | Intro | Frontansicht mit Afro, Brille, Gesicht, Shirt, Hüften |
| drawBack() | Gameplay | Rückansicht — Booty dominant, Afro-Silhouette |

Alle Animationen: Squash-and-Stretch, Anticipation, Follow-Through, Bounce-Back.

---

## Combo-System

| Sequenz | Name | Rating | Multiplikator-Bonus |
|---|---|---|---|
| W → A | TWERK STORM | Nice | +0.5 |
| W → D | BOOTY BLAST | Dope | +1.0 |
| A → A → Space | BOUNCE SLAM | Wild | +1.5 |
| S → D → Space | GROUND SHAKER | Legendary | +2.0 |

- Input-Buffer: letzte 5 Inputs, 800ms Zeitfenster
- Bei Combo-Treffer: Sonder-Animation, Screen-Shake, Flash, Partikel, Rating-Popup
- Multiplikator verfällt nach 3s (Step: -0.5)

---

## Audio (Web Audio API, synthetisch)

| Sound | Trigger |
|---|---|
| Beat 128 BPM | Läuft während GAMEPLAY |
| bounce | Jede WASD-Eingabe |
| jump | Space-Eingabe |
| combo | Combo-Treffer |
| click | Menü-Buttons |
| land | Jump-Landung |

---

## Score-System

- Jede Move-Eingabe: +10 × Multiplikator
- Combo-Treffer: +50 × Multiplikator
- Multiplikator startet bei ×1, steigt durch Combos, verfällt bei Pause
- Endscore → Grade: Nice / Dope / Wild / Legendary

---

## Kamera-Regel

| Zustand | Ansicht |
|---|---|
| INTRO, Frontansicht | Afro, Brille, Gesicht, Silhouette sichtbar |
| MENU (Idle) | Rückansicht (Charakter tanzt idle) |
| GAMEPLAY | Rückansicht — Booty dominiert den Frame |

---

## Build-Strategie Windows

```bash
npm run build
# → dist/Booty-Bouncer Setup 1.0.0.exe (NSIS)
# → dist/Booty-Bouncer 1.0.0.exe (Portable)
```

electron-builder Config in `package.json`:
- Target: `nsis` (x64) + `portable` (x64)
- oneClick: true
- createDesktopShortcut: true

---

## Aufgabenliste (Phase 2 — Implementierung)

```
[ ] Task 1: Projekt-Scaffold (package.json, main.js, index.html, styles.css, Stubs)
[ ] Task 2: Audio Engine (Beat-Scheduler + alle SFX)
[ ] Task 3: Combo System (InputBuffer + 4 Combo-Definitionen)
[ ] Task 4: Character Drawing — Front + Back View
[ ] Task 5: Animation System (ANIMATIONS-Objekt, update(), Effekte)
[ ] Task 6: Game Loop + State Machine (alle 4 States vollständig)
[ ] Task 7: Combo-Wiring + Tuning (manueller Test aller 4 Combos)
[ ] Task 8: Dokumentation (PROJECT_PLAN.md, HANDOFF.md, README.md)
[ ] Task 9: Build-Verifikation (npm run build, EXE prüfen)
```

---

## Bereits abgeschlossen (Phase 1 — Planung)

```
[x] Tech-Stack gewählt und begründet
[x] Dateistruktur definiert
[x] Game States beschrieben
[x] Steuerung, Audio, Animationen, Combos, Score geplant
[x] Kamera-Regel dokumentiert
[x] Windows-Build-Strategie festgelegt
[x] Vollständiger Implementierungsplan erstellt:
    docs/superpowers/plans/2026-04-25-booty-bouncer.md
[x] PROJECT_PLAN.md erstellt
[x] HANDOFF.md erstellt
```

---

## Bekannte Risiken

| Risiko | Wahrscheinlichkeit | Maßnahme |
|---|---|---|
| electron-builder Icon-Error beim Build | Mittel | `"icon": null` in Build-Config setzen |
| Web Audio AudioContext locked (Browser-Policy) | Niedrig | Erst nach erstem User-Klick initialisieren |
| roundRect() nicht in älterem Chromium | Niedrig | Electron 28 nutzt Chromium 120+, roundRect verfügbar |
| Combo-Timing zu eng | Mittel | MAX_WINDOW auf 1000ms erhöhen falls nötig |

---

## Akzeptanzkriterien (fertiges Spiel)

- [ ] `npm start` startet ohne Fehler
- [ ] INTRO: Frontansicht (Afro + Brille + orange Shirt sichtbar), Titel erscheint
- [ ] MENU: Start / Music / Quit funktionieren
- [ ] GAMEPLAY: WASD + Space triggern je eigene Animation
- [ ] GAMEPLAY: Rückansicht mit großem Booty als Fokus
- [ ] GAMEPLAY: Beat läuft, SFX bei Inputs
- [ ] GAMEPLAY: 60s Timer zählt runter → Result-Screen
- [ ] COMBOS: Alle 4 Combos auslösbar + Feedback (Popup, Partikel, Shake)
- [ ] HUD: Score, Multiplikator, Combo-Zähler, Timer
- [ ] RESULT: Score, Best-Combo, Retry + Menu
- [ ] `npm run build` erzeugt EXE in `dist/`

---

## Build-Status

- Phase 1 (Planung): ABGESCHLOSSEN
- Phase 2 (Implementierung): GESPERRT bis Freigabe
- Phase 3 (Validierung): GESPERRT bis Freigabe
- npm start: nicht geprüft (kein Code vorhanden)
- npm run build: nicht geprüft
