# Frost Blitz — Character Pipeline Notes (2026-09-13)

## comfyui-character-3d → game integration (tested end-to-end)

Pipeline: `~/Desktop/comfyui-character-3d` (client) → 192.168.1.162:8188 (ComfyUI GPU host)
Flow: Flux2 T-pose (node 4 prompt) → BiRefNet white plate → Hunyuan3D v2.1 (4096 octree) → GLB → collect_results.py

### Key numbers
- Precheck: all 5 models present (flux2_dev_fp8, mistral_3_small_flux2, flux2-ae, birefnet, hunyuan_3d_v2.1) on RTX PRO 5000
- Generation: ~3-5 min per character (single job, queue serial)
- Raw GLB: 550k-850k faces, 9.5-15MB each — TOO HEAVY for web
- Decimated GLB (Blender DECIMATE collapse, ratio to target): 10k-32k faces, 0.76-2.6MB each — web-OK
- 7 characters generated: captain_snowman, snowball_brave/cute/derpy, pig_coldtooth/grumpa/squeak

### Scripts (in comfyui-character-3d/)
- `gen_characters.py` — batch generate: edits template node 4 (prompt), nodes 13/18/27 (prefix), node 24 (seed), queues serially, waits, calls collect_results.py per slug
- `decimate_glbs.py` — Blender DECIMATE collapse to target faces + GLB export
- Template: `assets/character_full_image_to_glb.json` (flat dict, 27 nodes)

### CRITICAL: Hunyuan GLB is geometry-only (no UV, no PBR)
- Color via front-projected albedo: projectFrontUVs() on load + ShaderMaterial sampling albedo
- MUST call projectFrontUVs() per-mesh BEFORE assigning material (forgot → all-white meshes)
- Use DoubleSide + plain texture2D sample for both faces
- loadCharacter.js in pipeline output is a good template — recreate in game as loadFrostCharacter.js scoped to game assets

### Frost Blitz integration
- New chars live at `game/public/assets/characters/<slug>/{glb, albedo.png, manifest.json}`
- `game/src/core/loadFrostCharacter.js` — THREE helper (front-projected albedo, targetHeight normalize, alignBottom)
- main.js uses loadFrostCharacter for player (captain_snowman, targetHeight 1.6), pigs (targetHeight 1.0), launched snowball (targetHeight 0.75)
- Sandbox (ring/ground/blocks) still uses loadAsset + textureMesh — unchanged
- GitHub Actions auto-deploy on push to main (pages.yml) — verify real asset URLs after deploy

### QC
- vision_analyze on tpose_white per character → all 7 passed (cute has blade-like arms, squeak is terrified rather than nervous — acceptable)
- In-game: player snowman + pigs render colored correctly after UV fix
- Mobile Safari UI (screenshots from user): castle/fortress + CHARGING + slider all working

### Gotchas
- vision_analyze may timeout when GPU busy generating — retry after queue empties
- Playwright needs `--ignore-certificate-errors` + `--no-sandbox` for vite basic-ssl localhost
- Playwright executable: `/home/ubuntu/.cache/ms-playwright/chromium-1228/chrome-linux64/chrome`
- Vite dev on localhost:5199; browser_exec can't reach private IPs — use Playwright directly
