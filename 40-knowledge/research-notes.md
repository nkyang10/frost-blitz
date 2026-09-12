# Research Notes — Frost Blitz pipeline

> Findings gathered during design (s001). Kept as reference for the implementing agent; cite here
> instead of re-searching. Source links kept.

## A. Blender → glTF → Three.js pipeline

- Export via `bpy.ops.export_scene.gltf` with `filepath`, `export_format='GLB'`,
  `use_selection=True`, `export_materials='EXPORT'`. Ref:
  - Blender Python API docs — `bpy.ops.export_scene` (glTF operators).
  - khronos.org/glTF-Tutorials (BlenderGltfConverter section).
- **Batch export pattern (headless):** `blender -b file.blend -P script.py -- <args>`; select
  objects per collection → export each. See `rb-002`.
- **Common pitfalls (from threejs discourse + reddit):**
  - Materials must be Principled BSDF (cycles nodes don't map); keep base color in sRGB.
  - Scale vs. position: apply rotation + scale before export (Ctrl+A) or Three.js shows
    bogus transforms.
  - Forward axis: Blender exports +Z up (+Y forward); Three.js GLTFLoader matches by default.
  - Draco compression optional; skip in v1 (few assets).

## B. Cannon-es → Three.js sync

- Create world with custom `Broadphase(SAP or Naive)`; step fixed timestep in the RAF loop
  (e.g. `world.step(1/120, dt, 3)`).
- Sync `body.position`/`body.quaternion` into `mesh` every frame; **not** the reverse.
- Use `ContactMaterial` per material pair (snow/ice/wood) for restitution + friction tuning;
  triggering block breaks requires contact event listeners or engine-priority collisions.
- Falling-object kills = chain-reaction natural if blocks have HP + restitution > 0.

## C. Slingshot / angry-birds mechanics (found 2026-09-11 searches) — SUPERSEDED by orbit-siege §H

> DEC-006 replaced the drag-slingshot with the orbit-siege launcher (bottom 0–360° bar + hold-to-
> charge). Kept for the reusable bits: trajectory-preview simulation idea, squash-stretch juice,
> cannon-es recommendation. Do NOT re-add rubber-band/slingshot logic.

- **Reference clones to skim before coding:** `ad451/Angry-Birds-Clone` (Matter.js + p5: drag vector,
  rubber band, release-by-distance), `yumin-jung/angry-birds`, Unity clones (for string line-renderer
  pattern: two segments, one to each fork).
- **Launch math (proven pattern):** `releaseVelocity = (slingshotWorldPos - dragWorldPos) * power`,
  clamped to a max pull radius (~2 m). Store slingshot origin once; compute drag point by raycast on a
  plane facing the camera; multiply by mass → `body.velocity`.
- **Rubber band:** two `THREE.Line`/thin cylinder segments anchored at left fork and right fork, both
  routing through the ammo origin. Update each frame while dragging.
- **Trajectory preview:** sample projectile with physics-forward simulation every frame (60 substeps)
  while dragging; render an `THREE.Points` dot trail; hide > 40 dots for perf.
- **Tension juice:** squash-stretch on ammo (scale y *= 1 + pull, x/z *= 1/(1+pull*0.7)) while held.
- **Reference:** discourse "Should I keep using cannon-es?" → cannon-es still recommended for
  three.js; consider `@dimforge/rapier3d-compat` only if perf becomes an issue (bigger bundles).

## D. Damage + destruction (found 2026-09-11 searches)

- cannon-es `body.addEventListener('collide', e => ...)` provides `e.contact.getImpactVelocityAlongNormal()`
  — use a velocity threshold per material to gate damage (ignore resting/rolling contacts).
- Alternative instrumented approach: compare relative inbound speed of projectile vs block via
  `(va-vb)·normal` before adding damage; simpler and testable.
- Stack collapse: gravity already chains; add small random angular impulse on destroy for flair.
- Destroy = remove body + swap 3-6 fragments (from a pre-baked geometry pool) + particle burst.
- Ground/non-destructible uses high-density static body so it never takes damage.

## E. Blender → glTF crispness (confirmations from searches)

- **Always Apply Transforms (Ctrl+A, then apply rotation+scale) before export** — unapplied
  transforms get baked on export and break three.js assumptions (confirmed by varsitytutors guide +
  funwithtriangles blender-to-threejs guide).
- Prefer glTF/GLB over OBJ/FBX for three.js; materials export best from Principled BSDF.
- Orientation: Blender exports +Y forward +Z up; GLTFLoader aligns with three.js conventions by
  default — don't rotate models manually "to fix it" unless you confirm a real mismatch.
- `base:'./'` in vite config required for GLB asset URLs to survive subpath deploys.

## F. Cute design language (from `BeatAPI/awesome-3d-prompts` catalog)

- Chunky rounded shapes, oversized heads relative to body, big blush + simple smiles.
- Warm palette offset: white snowballs pop against baby-blue sky without tinting props.
- Sounds > narrative for "cute": pop/crackle/boing reads better than VO in v1.

## G. Environment facts (recorded 2026-09-11)
- Original machine: aarch64 (arm64), Ubuntu noble-family, Python 3.12, git-only repo.
- Target dev device: Linux (Debian/Ubuntu). Blender 4.0.2 available via apt in noble
  (`ports.ubuntu.com ... noble/universe arm64` — both amd64+arm64).
- apt `nodejs` is 18.19.1 (too old for Vite 7) → use nvm Node 22 (DEC-001).

## H. Orbit-siege mathematics (DEC-006, design session 2026-09-11)

Player = snowman turret at fixed radius `R` from arena center `C`, angle `θ` from a 0–360° bar.
- `playerPos = C + R·(cos θ, 0, sin θ)` — canvas plane is XZ (Y up).
- **Camera (orbiting follow):** `outward = (playerPos − C).normalize()`;
  `camPos = playerPos + outward·camDist + (0, camHeight, 0)`; `cam.lookAt(C)`.
  As θ changes the camera sweeps around the fortress; target stays centered.
- **Launch (hold-to-charge, power `p ∈ [0,1]`):** ballistic lob toward fortress.
  - Horizontal dir `h = normalize(C − playerPos)` (zero out Y).
  - `speed = vBase + p·vBoost`; elevation controlled so near-mid-far ring coverage is intuitive:
    `elevAngel ≈ mix(10°, 55°, p)` or derive from sim. Tune in `engine-constants.json`.
  - `velocity = h·speed·cos(el)` + `up·speed·sin(el)`.
- **Trajectory preview:** forward-sim 60 fixed steps using the same world step; store ≤ 40 points
  as a `THREE.Points` trail updated only while charging (perf-friendly, matches §C preview idea).
- **Slide bar UX:** map screen-x of the bar to `θ`; smooth-lerp actual `playerPos` to the target θ
  (not teleport) with a `θLerp ≈ 12/s`; add 0°/90°/180°/270° tick markers on the rail for reference.
- **Note for balance:** larger `R` (L1 6 → L6 11) raises arc difficulty naturally; fortress designs
  (§6 bible) provide cover variety without moving targets.

