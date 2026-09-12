# rb-001 — Local dev loop

**Purpose:** Standard iterative loop for the Frost Blitz game: run the dev server, playtest, make
changes, build, record. Used for EVERY coding session.

**Trigger:** any session that touches `game/` code or assets.

## Steps

1. Start the dev server (repo root = `blender/`, app root = `game/`):
   ```bash
   cd game && npm run dev
   ```
   → Open the printed URL (default http://localhost:5173).

2. Playtest per the acceptance checklist below. **WebGL cannot run headless** — human/agent
   verification happens in the browser.

3. After changes: `npm run build` must exit 0 before closing any ticket.

4. Record in `20-logs/command-log.md` any non-obvious commands.

## Acceptance checklist (per session touching gameplay)

- [ ] `npm run build` exits 0
- [ ] `.glb` files load without console errors (network tab shows 200s)
- [ ] Angle bar 0–360° orbits the snowman around the ring; camera follows and keeps the fortress centered
- [ ] Hold = power meter fills + trajectory preview; release fires a lob toward the center
- [ ] Projectile collides → blocks take damage / break; enemies lose health or get knocked over
- [ ] Win condition triggers when all fortress pigs are defeated; stars = f(ammo left)
- [ ] Lose condition triggers correctly
- [ ] Snow / particles / audio do not spam the console with leaks or warnings

## Verify
- Console clean of errors; game reaches menu → level 1 → win in a playtest run.

## Troubleshooting
| Symptom | Fix |
|---|---|
| 404 on assets | assets must be in `game/public/` (served from `/`) |
| Cannon bodies drift from meshes | sync `body.position`/`quaternion` → mesh in the animation loop |
