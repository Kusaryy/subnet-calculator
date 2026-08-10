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
| ESC | Hauptmenu |

## Kombos

Inputs innerhalb von 800ms eingeben:

| Sequenz | Name | Rating |
|---|---|---|
| W -> A | Twerk Storm | Nice |
| W -> D | Booty Blast | Dope |
| A -> A -> Space | Bounce Slam | Wild |
| S -> D -> Space | Ground Shaker | Legendary |

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
