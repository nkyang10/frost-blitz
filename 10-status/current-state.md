# Current Project State

> Snapshot of the last known state. Updated by the agent at the end of EVERY session.
> If reality differs from this file, fix it immediately (drift check).

- **Last updated:** 2026-09-11 (UTC) — s003: orbit-siege mechanic approved + docs reworked (DEC-006).
- **Phase:** 0 (DOCUMENTED-ONLY). **Nothing is installed, nothing is built, no commits made.**
- **Repo:** local git repo at the folder root; no remote. Moves to next device by folder copy.

## What exists right now

- Full doc set per `README.md` folder map: `AGENTS.md`, `README.md`, `.gitignore`, `10-status/`,
  `20-logs/`, `30-runbooks/`, `40-knowledge/`, `50-projects/p001-frost-blitz/`, `90-archive/`.
- Design contract locked: `40-knowledge/game-design-bible.md` + `40-knowledge/decisions-log.md`.
- **Refined plan (s002/s003):** research-note §C-E + §H (orbit math); deterministic damage model
  (§5.1); L1..L6 tables w/ arena radius `R`; star formula (§7); orbit-siege gameplay (DEC-006,
  FU-004b/005 core); granular FU-001..FU-012 ticket breakdown; architecture tree in p001 README.

## What does NOT exist yet (all pending)

- `game/` source tree (Vite + Three.js + cannon-es app).
- Blender assets / `.glb` files / blender scripts.
- Node.js, Blender, npm dependencies on this machine (and on the target dev device).

## Next step (Phase 1)

On the **new dev device** (Linux Debian/Ubuntu), follow `30-runbooks/rb-000-bootstrap-new-device.md`:
install Node 22 (nvm) + Blender 4.0 (apt), scaffold `game/`, `npm install`, verify `npm run dev`.

## Status legend

- 🟡 **DOCUMENTED-ONLY** — current overall status: everything is blueprints, nothing implemented.
- After Phase 1 completes, flip this to 🟢 BOOTSTRAPPED, then track each phase here.
