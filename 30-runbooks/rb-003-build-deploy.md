# rb-003 — Build & deploy (static)

**Purpose:** Produce a production build of the game that runs statically, then host it on a
dev-station LAN or tunnel so Mark can playtest from anywhere.

**Trigger:** milestone "ready to playtest" / publish (FU-009).

## Steps

1. Build:
   ```bash
   cd game
   npm run build
   ```
   → Outputs to `game/dist/`.

2. Serve statically (any static server works):
   ```bash
   cd game/dist && python3 -m http.server 4173
   ```
   or, for LAN access:
   ```bash
   cd game/dist && npx serve -l 4173 --listen tcp://0.0.0.0:4173
   ```
   → Playtest at `http://localhost:4173`; LAN users at `http://<this-ip>:4173`.

3. Optional tunnel for external playtest (ephemeral):
   ```bash
   # requires cloudflared
   cloudflared tunnel --url http://localhost:4173
   ```

4. Record the published URL + version tag in `10-status/current-state.md`.

## Versioning
- Semver-ish: during dev use `0.0.0-dev-<YYYYMMDD>`. First release worth sharing = `0.1.0`.
- Document each published build in `20-logs/command-log.md` (hash of build config, timestamp).

## Verify
- `game/dist/index.html` exists and loads `assets/index-*.js`.
- Browser console clean on both local + tunnel URLs.
