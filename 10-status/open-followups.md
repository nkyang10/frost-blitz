# Open Follow-ups (ticket list)

> Closed items move to the bottom with a ✓ or to `90-archive/`. Numbering is monotonic (FU-NNN).
> Refined 2026-09-11 (s003) — orbit-siege mechanic (DEC-006) reworked gameplay tickets.

## Open

### Phase 1 — Toolchain (pickup on new device)
| ID | Status | Summary | Notes |
|---|---|---|---|
| FU-001 | ⏳ | Bootstrap Node 22 (nvm) + Blender 4.0 (apt) per rb-000 | needs `sudo apt` |
| FU-002 | ⏳ | Scaffold `game/` Vite app: `package.json`, `vite.config.js` (`base:'./'`), `index.html` canvas, `src/main.js` | 5 files |

### Phase 2 — Blender asset pipeline (rb-002)
| ID | Status | Summary | Subtasks |
|---|---|---|---|
| FU-003 | ⏳ | Asset pipeline produces all `.glb` files | (a) `export_assets.py`; (b) 3 snowball faces (brave/cute/derpy); (c) captain snowman player model; (d) 3 pigs (Coldtooth/Grumpa/Squeak); (e) 3 blocks (snow/ice/wood); (f) props (arena ring + 4 angle-pillars 0/90/180/270, fortress base, pine, igloo, ground); (g) `manifest-assets.json` + `validate_glb.mjs` |

### Phase 3 — Engine core (orbital arena)
| ID | Status | Summary | Subtasks |
|---|---|---|---|
| FU-004 | ⏳ | Scene/render pipeline | (a) renderer+scene+camera (pixelRatio, resize); (b) lighting (hemisphere+dir, soft shadows); (c) snow particle field; (d) cannon-es world (gravity, broadphase, fixed-step); (e) GLTFLoader cache + `loadAsset(name)→Group` |
| FU-004b | ⏳ | **Orbit arena core** | (a) arena clock/ground + perimeter rail at `R`; (b) **orbiting follow-cam** (`camPos = playerPos + outward·d + up·h`, `lookAt(C)`); (c) angle-slide bar widget (ux) feeding `θ`; (d) snowman carrier ride on ring: `playerPos = C + R·(cos θ,0,sin θ)` with smooth lerp |

### Phase 4 — Gameplay systems (orbit-siege)
| ID | Status | Summary | Subtasks |
|---|---|---|---|
| FU-005 | ⏳ | **Angle + charge + launch** | (a) θ from slide bar (mouse+touch) / keyboard A/D ±1°; (b) hold-to-charge power `0..1` (~1.2 s) w/ meter; (c) launch math `h = normalize(C−player)`, `speed=vBase+p·vBoost`, elevation mix, ballistics (research-notes §H); (d) trajectory preview ≤40 dots; (e) live ammo queue + fire state |
| FU-006 | ⏳ | **Collision damage** | (a) projectile sphere body; (b) material-gated damage via `collide` impact velocity (bible §5.1); (c) block HP + fragment swap + burst; (d) pig HP, squish + poof; (e) kill-volume check (ring edge + y < −4) |
| FU-007 | ⏳ | **Win/lose + scoring** | (a) win = all pigs dead (fortress destroyed) → stars = f(unused ammo, bible §7); (b) lose = out of ammo w/ survivors; (c) score ticker + combo; (d) end-turn settle timer before next ammo |

### Phase 5 — Content
| ID | Status | Summary | Subtasks |
|---|---|---|---|
| FU-008 | ⏳ | Level data + tuning | (a) extend `level-schema.md` for `R` (per-level radius); (b) `engine-constants.json` (slide lerp, charge time, vBase/vBoost, elevation curve, camera dist/height, ring thickness); (c) author L1..L6 JSON (bible §6 table w/ R); (d) playtest balance pass |
| FU-009 | ⏳ | Juice + audio | (a) camera shake on big impact; (b) slow-mo on pig kill; (c) WebAudio recipes (fwip slide / kreak charge / swoosh launch / thud / crackle / thock / poof / jingle) + mute toggle |

### Phase 6 — UI/UX
| ID | Status | Summary | Subtasks |
|---|---|---|---|
| FU-010 | ⏳ | Menu / level select | (a) title + start; (b) 6 level cards w/ star medals (localStorage); (c) back/next wiring |
| FU-011 | ⏳ | In-game HUD + overlays | (a) ammo counter, pigs-left, score, **angle readout (deg)**; (b) power meter; (c) pause (Esc/btn) + restart (R); (d) win overlay (stars+score+next) + lose overlay (retry) |

### Phase 7 — Shutdown
| ID | Status | Summary | Subtasks |
|---|---|---|---|
| FU-012 | ⏳ | QA + wrap | (a) `npm run build` clean; (b) playtest L1..L6 desktop+mobile; (c) perf pass (culling/instance fragments/cap particles); (d) update current-state + command-log; (e) rb-003 deploy + report URL |

## Closed
- ✓ FU-none yet (s001/s002 doc scaffold was delivered as its own deliverable, not a ticket).
