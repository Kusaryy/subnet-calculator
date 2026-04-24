# Booty-Bouncer — Handoff

## Letzter sauberer Checkpoint

**Phase 1 (Planung) vollständig abgeschlossen.**
Phase 2 (Implementierung) wartet auf explizite Freigabe.

---

## Was geplant wurde

### Vollständiger Implementierungsplan
`docs/superpowers/plans/2026-04-25-booty-bouncer.md`

Dieser Plan enthält:
- Alle 9 Tasks mit vollständigem Code
- Exakte Dateiinhalte für alle 6 Quelldateien
- Manuelle Testschritte pro Task
- Build-Verifikationsschritte

### Planungsdokumente in diesem Verzeichnis
- `PROJECT_PLAN.md` — Tech-Stack, Architektur, Aufgabenliste, Akzeptanzkriterien
- `HANDOFF.md` — (diese Datei)

---

## Projektstand

| Bereich | Status |
|---|---|
| Tech-Stack | HTML5 Canvas + Electron 28 — ENTSCHIEDEN |
| Dateistruktur | Definiert (6 Quelldateien) |
| Game States | 4 States vollständig geplant |
| Charakter | Frontansicht + Rückansicht geplant (Canvas-Shapes) |
| Animationen | 10 Animationen definiert (Idle + 5 Moves + 4 Combos) |
| Combo-System | 4 Combos mit Timing, Ratings, Multiplier |
| Audio | Web Audio API — Beat + 5 SFX (keine externen Dateien) |
| Score-System | Multiplier-Decay, Base-Score, Grade |
| Windows-Build | electron-builder NSIS + Portable konfiguriert |
| Implementierungscode | NICHT VORHANDEN (Phase 2 gesperrt) |

---

## Was noch fehlt

- Gesamte Implementierung (Phase 2)
- Windows-Build-Verifikation (Phase 3)
- README.md (wird in Phase 2 Task 8 erstellt)

---

## Nächste 3 Schritte nach Freigabe

1. **Task 1: Projekt-Scaffold** — `package.json`, `main.js`, `src/index.html`, `src/styles.css` + leere JS-Stubs erstellen, `npm install`, `npm start` prüfen (leeres Fenster sichtbar)

2. **Task 2: Audio Engine** — `src/audio.js` vollständig implementieren, Beat-Scheduler + alle SFX in DevTools testen

3. **Task 3: Combo System** — `src/combo.js` implementieren, Combo-Detection in DevTools manuell verifizieren

---

## Start-Kommandos (nach Implementierung)

```bash
# Dev-Modus
cd /mnt/data/code-projects/booty-bouncer
npm install
npm start

# Windows-Build
npm run build
# → dist/Booty-Bouncer Setup 1.0.0.exe (NSIS)
# → dist/Booty-Bouncer 1.0.0.exe (Portable)
```

---

## Freigabe-Wörter für Phase 2

Implementierung startet wenn der User schreibt:
- „jetzt umsetzen"
- „beginne mit Phase 2"
- „starte die Implementierung"

---

## Bekannte Risiken

- electron-builder kann Icon-Fehler werfen → `"icon": null` in Build-Config löst es
- Web Audio AudioContext-Sperre → erst nach User-Klick initialisieren (bereits im Plan berücksichtigt)
- Combo-Timing: `MAX_WINDOW = 800ms`, bei Bedarf auf `1000ms` erhöhen

---

## Vollständiger Plan-Link

`/mnt/data/code-projects/docs/superpowers/plans/2026-04-25-booty-bouncer.md`

Dieser Plan hat alles — **dort direkt weiterlesen für Phase 2**.
