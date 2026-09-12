# Decisions Log

> Every stack / gameplay / architecture decision gets an entry. Append-only, newest at bottom.
> Format: `<ID> — <date> — <one-line title heavy>. <What/Why>. <Status>`.

## DEC-001 — Stack: Vite + Three.js + cannon-es + Blender glTF (2026-09-11)
- **What:** Node 22 (nvm), Vite bundler, Three.js renderer, cannon-es physics, Blender 4.0
  → `.glb` assets, WebAudio synth SFX, JSON-driven levels.
- **Why:** battle-tested pipeline for blender/glTF web games; cannon-es is pure-JS and stable;
  no binary audio assets to manage; levels as JSON keep content data-driven.
- **Status:** ✅ accepted (s001).

## DEC-002 — Procedural cute geometry for assets (2026-09-11)
- **What:** All models authored as procedural geometry in Blender (spheres, cones, rounded
  boxes) with Principled BSDF base colors — no external texture files for characters.
- **Why:** reproducible asset pipeline (headless export), cartoon-cute look via shapes and colors;
  export avoids texture-atlas/UV complexity in v1.
- **Status:** ✅ accepted (s001).

## DEC-003 — Gameplay contract (2026-09-11)
- **What:** **Amended by DEC-006 (orbit-siege).** Prevailing rules: cannon-es collision drives
  damage; blocks have HP by material (snow < ice < wood); win = all frost-pigs defeated (fortress
  destroyed); 3 stars scaled by snowballs remaining; 6 levels.
- **Status:** ✅ accepted (s001), amended (s003).

## DEC-004 — Docs layout mirrors /home/mark/Desktop/ide (2026-09-11)
- **What:** AGENTS.md + README + 10-status + 20-logs + 30-runbooks + 40-knowledge +
  50-projects/p001-frost-blitz + 90-archive.
- **Why:** established, agent-recurrable workspace pattern; project brief lives in
  `50-projects/p001-frost-blitz/README.md`.
- **Status:** ✅ accepted (s001).

## DEC-005 — Do not commit unless the user asks (2026-09-11)
- **What:** keep working tree untouched by auto-commits; user preference recorded in s001.
- **Status:** ✅ accepted (s001).

## DEC-006 — Orbit-siege mechanic replaces drag-slingshot (2026-09-11)
- **What:** Frost-pig fortress is at the **center** of a round arena; the player is a snowman turret
  that slides along a **perimeter rail** at fixed radius `R` via a **bottom 0–360° angle bar**;
  the camera orbits behind the player looking at the fortress. Firing = **hold-to-charge** (power
  0..1 over ~1.2 s) then release for a ballistic lob toward center, with a live trajectory preview.
  Win = destroy fortress (eliminate all pigs) within limited ammo; stars from unused snowballs.
- **Why:** user refinement — "3D game, target at middle, slide bar = angle around the center,
  apply force to shoot". Simpler to read than 2D drag-slingshot and makes 3D useful (circular view).
- **Amends:** DEC-003 (gameplay contract) — replaces slingshot aim where not stated otherwise;
  slingshot-specific constants (k=5.5, max pull 2m) retired from config.
- **Status:** ✅ accepted (s003).
