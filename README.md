# Frost Blitz ❄️ — Cute Orbit-Siege Snowball Game (3D Web)

A 3D web game where you ride a **cute snowman turret** around a circular rail at a **0–360° angle**,
charge your shot, and lob **smiling snowballs** into the grumpy **frost-pig** fortress at the arena's
center. Built with **Blender** (models → `.glb`), **Three.js** (rendering), **cannon-es** (physics).

**Status:** 🟡 DOCUMENTED-ONLY — no code, no assets, no toolchain installed yet.
**Bible:** `40-knowledge/game-design-bible.md` (the design contract).
**Decisions:** `40-knowledge/decisions-log.md`.

> **Git:** local repo only (no remote). The folder travels to the next dev device by copy — see
> `30-runbooks/rb-000-bootstrap-new-device.md`.
> **Secrets:** `opencode.json`, `*.env`, API keys are git-ignored. Never commit live keys.

## Operating model

```
USER (Mark)          AGENT (controller)              NEW DEV DEVICE
    | request ────────▶ plan + confirm ────────────▶  Linux (Debian/Ubuntu)
    |                  implement + test ───────────▶  blender/ copied as-is
    |◀─── report ────  log everything ─────────────  docs self-bootstrap the agent
```

Docs-first: any successor agent reads this README, then `10-status/`, then the runbooks, and can
continue the build without further input from Mark.

## Folder map

| Path | Purpose |
|---|---|
| `AGENTS.md` | **Late-comer agent protocol** — read first. |
| `README.md` | This file: operating model + folder map. |
| `10-status/` | `current-state.md` (snapshot) + `open-followups.md` (pending work). |
| `20-logs/` | `command-log.md` + per-session records (`sessions/`). |
| `30-runbooks/` | Repeatable procedures: bootstrap, dev loop, assets, deploy. |
| `40-knowledge/` | `decisions-log.md`, `game-design-bible.md`, `research-notes.md`. |
| `50-projects/p001-frost-blitz/` | Project brief + config/notes/scripts/sessions. |
| `90-archive/` | Historical/outdated material. |
| `game/` | **Source tree — not created yet (Phase 2+).** |

## Stack decision (DEC-001, summary)

| Layer | Choice |
|---|---|
| Node | 22 LTS via nvm |
| Bundler | Vite |
| Renderer | Three.js |
| Physics | cannon-es |
| 3D assets | Blender 4.0 → `.glb` (`bpy.ops.export_scene.gltf`) |
| Audio | WebAudio synth (no binary files) |
| Content | JSON-driven levels |

Full rationale: `40-knowledge/decisions-log.md`. Install steps: `30-runbooks/rb-000-bootstrap-new-device.md`.

## Current milestone (end of s001)

- ✅ Phase 0: full documentation scaffolded in this repo.
- ⏳ Phase 1: bootstrap Node 22 + Blender 4.0 on the new device (`rb-000`).
- ⏳ Phases 2–8: asset pipeline, engine, gameplay, content, UI, polish.
