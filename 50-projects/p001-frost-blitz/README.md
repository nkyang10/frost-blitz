# p001 — Frost Blitz

**Project:** Cute 3D orbit-siege: slide a snowman turret around a ring, charge, and lob cute
snowballs into the frost-pig fortress at the center.
**Status:** 🟡 PLANNED (docs refined s003; no code yet).
**Bible:** `40-knowledge/game-design-bible.md` · **Decisions:** `40-knowledge/decisions-log.md`.
**Pickup:** read `AGENTS.md` → `10-status/current-state.md` → `30-runbooks/rb-000*.md`.

## Mission

Deliver a playable, polished 3D web game in this folder that runs fully from `game/dist/` on any
static server — no backend, no binary assets, generated entirely by repo scripts + Blender.

## Technical architecture (s003 refine)

```
game/
  src/
    main.js            # boot, render loop, state FSM
    config.js          # stateless defaults (real tuning lives in 50-projects config/)
    core/
      renderer.js      # renderer/scene/camera/lights/resize
      physics.js       # cannon-es world, fixed-step, sync bodies→meshes
      loader.js        # GLTFLoader cache + loadAsset()
      snow.js          # snow particle field
    arena/
      orbit.js         # θ state, playerPos = C + R·(cosθ,0,sinθ), smooth lerp, rail
      orbitcam.js      # orbiting follow-cam (behind snowman, lookAt center)
      input.js         # slide-bar θ (mouse+touch), keyboard A/D, charge hold
    gameplay/
      launcher.js      # hold-to-charge power, launchVelocity(math §H), ammo queue
      trajectory.js    # 60-step forward-sim preview (≤40 dots)
      damage.js        # impact-gate damage, block HP, fragment swap, burst
      enemies.js       # pig lifecycle, squish, kill-volume
      scoring.js       # ticker, combo, stars = f(remaining ammo)
      level.js         # load level JSON → spawn entities + R
    content/levels/L1..L6.json
    ui/                # menu, level select, HUD, angle bar, power meter, win/lose
    fx/                # camera shake, slow-mo, particles
    audio.js           # WebAudio synth (fwip/kreak/swoosh/thud/crackle/thock/poof/jingle)
```

## Deliverables map

| Directory | Purpose |
|---|---|
| `config/` | Level JSON schema, engine constants, tuning tables (git-tracked). |
| `notes/` | Design/balance notes, tuning decision write-ups. |
| `scripts/` | Source-of-truth scripts: `export_assets.py`, `validate_glb.mjs`, level-gen helpers. |
| `sessions/` | Per-focus working notes (say s002-pipeline, s003-engine). |
| (`README.md`) | This brief. |

## Phases (current → target)

| Phase | Deliverable | Runbook | Tickets |
|---|---|---|---|---|
| 0 ✅ | Docs scaffold + refine (s001/s002/s003) | — | — |
| 1 ⏳ | Toolchain on new device | rb-000 | FU-001, FU-002 |
| 2 ⏳ | Blender assets → `.glb` (3 faces, captain snowman, 3 pigs, 3 blocks, arena+props) | rb-002 | FU-003 |
| 3 ⏳ | Engine core + **orbit arena + orbital cam + angle bar** | rb-001 | FU-004, FU-004b |
| 4 ⏳ | Gameplay (angle/charge/launch, damage, enemies, scoring) | rb-001 | FU-005..007 |
| 5 ⏳ | Content (schema + `R`-scaled L1..L6 JSON + tuning) | rb-001 | FU-008 |
| 6 ⏳ | Juice + audio | rb-001 | FU-009 |
| 7 ⏳ | UI/UX (menu/select/angle-bar/HUD/overlays) | rb-001 | FU-010, FU-011 |
| 8 ⏳ | QA + wrap (build, perf, playtest, deploy) | rb-001/rb-003 | FU-012 |

## Definition of done (v1)

`npm run build` exits 0; `game/dist/` serves menu → level select → 6 playable levels with win/lose
+ stars; sound + snow particles; touch + mouse input; console-clean; `current-state.md` updated.
