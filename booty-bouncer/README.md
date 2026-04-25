# Booty-Bouncer

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

Inputs innerhalb von 1 Sekunde eingeben:

| Sequenz | Name | Rating |
|---|---|---|
| W → A | TWERK STORM | Nice |
| W → D | BOOTY BLAST | Dope |
| A → A → Space | BOUNCE SLAM | Wild |
| S → D → Space | GROUND SHAKER | Legendary |

## Windows-Build

```bash
npm run build
```

Erzeugt in `dist/`: NSIS-Installer + Portable EXE.

## Tech

- HTML5 Canvas 2D (alle Grafiken programmatisch, keine Bild-Assets)
- Electron 28
- Web Audio API (kein Audio-File-Dependency)
- electron-builder
