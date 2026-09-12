# scripts/ — Frost Blitz source-of-truth scripts

Placeholder dir created in s001 (empty by design). See `30-runbooks/rb-002` for full pipeline.

## Planned scripts
| File | Purpose |
|---|---|
| `export_assets.py` | Blender headless exporter: scene collections → `.glb` under `game/public/assets/`. |
| `validate_glb.mjs` | Parse every `.glb`, report size/meshes/primitives; fail-fast on corruption. |
| `gen-level-json.mjs` | Human-friendly level authoring helper → validated `levels/*.json`. |
| `serve-game.mjs` | Static server wrapper (`python3 -m http.server` alt) for `game/dist`. |

## Running conventions
- Blender scripts: `blender -b -P scripts/export_assets.py -- <mode> <args>` (run from repo root).
- Node scripts: `node scripts/validate_glb.mjs game/public/assets`.
