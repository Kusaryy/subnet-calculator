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
```
booty-bouncer/
├── src/index.html, styles.css, game.js, character.js, audio.js, combo.js
├── main.js, package.json
└── PROJECT_PLAN.md, HANDOFF.md, README.md
```

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
- npm start: funktioniert
- npm run build: noch nicht geprüft

## Bekannte Probleme
- Keine bekannten Bugs

## Nächster Schritt
npm run build ausführen und Windows-Build prüfen.
