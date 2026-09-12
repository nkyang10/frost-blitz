# Current Project State

> Snapshot of the last known state. Updated by the agent at the end of EVERY session.
> If reality differs from this file, fix it immediately (drift check).

- **Last updated:** 2026-09-12 (UTC) — s004: full build + GitHub Pages deploy.
- **Phase:** 4 (PLAYABLE + DEPLOYED). All core tickets done; polish/QA follow-ups open.
- **Repo:** local git repo at folder root **+** remote `https://github.com/nkyang10/frost-blitz` (main branch).
- **Live URL:** https://nkyang10.github.io/frost-blitz/ (GitHub Pages, source = GitHub Actions).

## What exists right now

- Full doc set per `README.md` folder map (AGENTS.md, README, .gitignore, 10-status/, 20-logs/,
  30-runbooks/, 40-knowledge/, 50-projects/, 90-archive/) + `game/` tree.
- **Game source** (`game/`): Vite + Three.js + cannon-es, 6 levels, orbit-siege gameplay
  (slide bar → orbit, hold-to-charge, trajectory preview, physics damage, WebAudio SFX).
- **Blender assets** (`game/public/assets/`): 15 procedural `.glb` — 3 snowball faces, captain
  snowman, 3 frost-pigs, 3 blocks, arena ring, fortress base, props (pine/igloo/ground).
- **Asset pipeline** (`50-projects/.../scripts/export_assets.py`): headless Blender generator.
- **Asset validation** (`game/scripts/validate_glb.mjs`): 15/15 pass.
- **CI/CD** (`.github/workflows/pages.yml`): builds game/dist → GitHub Pages (Actions source).
- **Smoke-tested**: menu → level → charge → launch → physics resolve; zero console errors
  on local preview and on live Pages URL (Playwright headless Chromium).

## What does NOT exist yet (open tickets)

- FU-005 cost/star polish tuning per level (current values functional, not tuned).
- FU-006 audio polish (only basic synth SFX; no music).
- FU-007 difficulty curve validation across all 6 levels.
- FU-008 touch controls refinement (basic pointer events work; not tested on real mobile).
- FU-009 win/lose animation polish (no pig squish particle burst; instant removal).
- FU-010 level select stars persistence (localStorage not implemented).
- FU-011 more snowball variants in gameplay (brave always used; cute/derpy not selectable).
- FU-012 settings (mute, sensitivity).

## Next step (Phase 5 polish)

Play the live game, note what feels off, and iterate on tuning (charge speed, launch strength,
damage gates, star thresholds). See `50-projects/p001-frost-blitz/notes/` for planned balance notes.
