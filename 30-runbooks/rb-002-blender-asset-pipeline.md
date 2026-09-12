# rb-002 — Blender asset pipeline

**Purpose:** Create all Frost Blitz 3D assets procedurally in Blender (Python API), export to
`.glb` next to the game loader, validate output. Reproducible so anyone can re-run it.

**Trigger:** first asset generation (FU-003) and every asset iteration.

## Design contract (from game-design-bible.md)

- Cute cartoony style: rounded primitives, chunky geometry, no heavy sculpt.
- **Snowballs-characters:** white sphere body, dark sphere eyes, cone carrot nose, blush
  spheres, smile arc. Three variants: brave / cute / derpy.
- **Frost-pigs:** plump snowball-ish villains with cheeks + tiny tusk cones.
- **Blocks:** snow (weak), ice (medium), wood (bouncy). Chunky boxes/planks with color-tinted
  materials.
- **Props:** capture-snowman player, arena ring + 4 angle pillars, pine tree, igloo, fortress base, ground, cloud.
- Units: 1 Blender unit = 1 meter; forward = **+Y**; apply rotation+scale before export.

## Example headless export script (`50-projects/p001-frost-blitz/scripts/export_assets.py`)

```python
import bpy, os, sys

OUT = bpy.path.abspath(sys.argv[sys.argv.index("--")+1])

def export(name):
    os.makedirs(OUT, exist_ok=True)
    bpy.ops.export_scene.gltf(
        filepath=os.path.join(OUT, name + ".glb"),
        export_format="GLB",
        use_selection=True,
        export_materials="EXPORT",
    )

# Collect everything under a Collection per asset, e.g. c["snowball_brave"]
for coll in bpy.data.collections:
    if coll.name.startswith("asset:"):
        bpy.ops.object.select_all(action="DESELECT")
        for o in coll.all_objects:
            o.select_set(True)
        export(coll.name[6:])
```

Run headless:
```bash
blender -b "src/assets.blend" -P scripts/export_assets.py -- game/public/assets
```

## Naming convention

| Asset prefix | Example |
|---|---|
| `asset:snowball_<variant>` | `asset:snowball_brave` |
| `asset:pig_<variant>` | `asset:pig_cold`, `asset:pig_grumpy` |
| `asset:block_<material>` | `asset:block_snow`, `asset:block_ice`, `asset:block_wood` |
| `asset:prop_<name>` | `asset:prop_captain`, `asset:prop_ring`, `asset:prop_pine`, `asset:prop_igloo` |

## Validation
- Every `.glb` parses as JSON (Type 0x4654 6c42 = "gl" "b") or with GLTFLoader import in node.
- Quick check after export:
  ```bash
  ls -la game/public/assets/
  node -e "const g=require('fs').readFileSync('game/public/assets/snowball_brave.glb'); console.log(g.slice(0,4).toString())"
  ```
- Then load in the game and eyeball scale/rotation once (rb-001 step 2).

## Post-export
Update `game/public/assets/manifest.json` (names → used-by mapping) and note changes in
`20-logs/command-log.md`.

## Troubleshooting
| Symptom | Fix |
|---|---|
| `.glb` upside down | rotate model -90° on X in Blender, or use `-Y`/`+Z` camera convention in three.js |
| materials black | ensure Principled BSDF used, not cycles nodes; unwrap not needed for vert colors / base color |
| child objects missing | export with `use_selection=True` including children, or flat parent them into one mesh |
