# Session s003 — 2026-09-11

**Slug:** orbit-siege-mechanic
**Device:** original machine (aarch64, Ubuntu noble family).

## Intent (stated before acting)

User refined the core idea away from drag-slingshot: **target at the center, player (snowman) slides
around a constant-radius ring via a bottom 0–360° bar, then applies force to shoot snowballs at the
target.** Confirm the 3 forks (force = hold-to-charge, camera = orbiting follow-cam, win = destroy
fortress w/ limited ammo) then re-document.

## What I did

- Asked 3 design-fork questions; got: **hold-to-charge+release**, **orbiting follow-cam**,
  **destroy fortress w/ limited ammo**.
- Rewrote `40-knowledge/game-design-bible.md` around the orbit-siege mechanic:
  - §1/§2 pitch + loop (slide → charge → lob → resolve → win/lose).
  - §4 "Arena & orbit mechanic" (`playerPos = C + R·(cosθ,0,sinθ)`, camera formula, charge+launch,
    trajectory preview) + §4.1 technical contract → DEC-006.
  - §6 levels: added per-level arena radius `R` (L1 6 → L6 11) + fortress tables instead of
    slingshot levels.
  - §7 scoring: same ammo-based star formula, now reads on "fortress destroyed".
  - §8 controls: angle bar + A/D nudge, hold-to-charge fire, R restart, Esc pause, touch.
- Added `DEC-006` (orbit-siege replaces drag-slingshot) to decisions-log; kept DEC-005 intact.
- Added research-notes **§H orbit-siege mathematics** (polar→world math, orbiting-cam, ballistic
  elevation curve, preview sim).
- Re-ticketed `10-status/open-followups.md`: added **FU-004b** (orbit arena core), rewrote
  FU-005→orbit charge/launch, updated Phase 2 assets (captain snowman, arena ring + 4 angle pillars),
  Phase 6 (angle readout, power meter), engine tuning items (slide lerp, charge time, camera).
- Updated `50-projects/p001-frost-blitz/README.md`: architecture tree `arena/orbit.js`,
  `arena/orbitcam.js`, `gameplay/launcher.js`, `gameplay/trajectory.js`; phase map.
- Updated `30-runbooks/rb-001` acceptance checklist for the new loop.
- Updated `README.md` pitch + `current-state.md` snapshot.

## What I verified

- decisions-log numbering consistent (DEC-001..006, no dupes).
- follow-ups match bible (R in level table ↔ FU-008; camera in FU-004b; charge in FU-005; scoring §7
  ↔ FU-007).
- No stale slingshot references left in the bible/runbooks README files (checked by grep).

## What is still open
- None new here; all build work awaits the new device (FU-001..FU-012).

## Next agent actions
- On new device: rb-000 → FU-002 → FU-004b (orbit arena + cam) → FU-005.. → as ticketed.
