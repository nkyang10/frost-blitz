# rb-000 — Bootstrap the new dev device

**Purpose:** Take a fresh Linux (Debian/Ubuntu) machine, install Node 22 + Blender 4.0, verify the
toolchain, and scaffold the Vite `game/` app. This is the FIRST runbook a successor agent runs
after the `blender/` folder is copied over.

**Trigger:** new device / fresh clone of this folder (FU-001 + FU-002).
**Environment:** Debian/Ubuntu (tested baseline). Repo root = the `blender/` folder.

## Steps

### 0. Preflight
```bash
cd ~/Desktop/blender && git status        # confirm we are at repo root
ls 10-status/current-state.md             # confirm doc set travelled with the folder
```

### 1. Install Node 22 via nvm
```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm install 22
nvm use 22
nvm alias default 22
```

### 2. Install Blender 4.0 via apt (arm64/amd64 both packaged in noble)
```bash
sudo apt update
sudo apt install -y blender
blender --version | head -1     # expect Blender 4.0.x
```

### 3. Scaffold the Vite app (`game/`)
```bash
mkdir -p game/src
cd game
npm init -y
npm install three cannon-es
npm install -D vite @vitejs/plugin-basic-ssl
```
Create the minimal skeleton (Phase 2 files; exact layout per `50-projects/p001-frost-blitz/README.md`):
```bash
mkdir -p public/assets src/core src/gameplay src/content src/ui src/fx
touch index.html vite.config.js src/main.js
```
`index.html` must reference `/src/main.js` (module) and a `<canvas id="game">`; `vite.config.js` sets
`base: './'` so the build works from any static server.

### 4. Install deps + smoke test
```bash
npm install
npm run build      # must exit 0
npx vite preview   # manual smoke test in browser at http://localhost:4173
```

## Verify
- `node --version` → v22.x
- `blender --version` → 4.0.x
- `npm run build` exits 0 and emits `game/dist/`

## Troubleshooting
| Symptom | Fix |
|---|---|
| `blender` not found after apt | `sudo apt update` then retry; on non-noble distro use official tarball from blender.org |
| npm install EACCES | nvm was not activated; re-source `$NVM_DIR/nvm.sh` |
| vite preview blank page | confirm `canvas` id in HUD init and `base:'./'` in vite config |

## After this runbook
Mark FU-001 and FU-002 progress in `10-status/open-followups.md`, update `current-state.md`,
then proceed to `rb-002-blender-asset-pipeline.md`.
