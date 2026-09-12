# config/ — Frost Blitz

Source-of-truth configuration, all git-tracked (JSON). Placeholder dir created in s001; content
lands with Phase 2+.

## Planned files

| File | Content |
|---|---|
| `level-schema.md` | JSON schema for `game/src/content/levels/*.json` (entities, positions, materials, pig HP, snowball count). |
| `engine-constants.json` | Physics (gravity, restitution by material), orbit (R, slide lerp, charge time, vBase/vBoost, elevation curve), camera (dist/height), star thresholds. |
| `level1..6.json` (later) | Actual level data per game-design-bible §5. |
| `manifest-assets.json` | Asset name → usage mapping validated against `game/public/assets/`. |

## Conventions
- All numeric tuning values live here, not hardcoded in `game/src/`.
- Any change to tuning → update `game-design-bible.md` + an entry in `40-knowledge/decisions-log.md`.
