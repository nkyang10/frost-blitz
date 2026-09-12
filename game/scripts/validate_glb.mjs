/**
 * Frost Blitz — asset manifest validator.
 * Verifies every .glb in game/public/assets/ matches the expected manifest
 * (all 15 assets exist, non-trivial size, valid GLB magic).
 *
 * Usage: node scripts/validate_glb.mjs [assetsDir]
 */
import { readdirSync, statSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const EXPECTED = [
  'snowball_brave.glb',
  'snowball_cute.glb',
  'snowball_derpy.glb',
  'captain_snowman.glb',
  'pig_coldtooth.glb',
  'pig_grumpa.glb',
  'pig_squeak.glb',
  'block_snow.glb',
  'block_ice.glb',
  'block_wood.glb',
  'arena_ring.glb',
  'fortress_base.glb',
  'prop_pine.glb',
  'prop_igloo.glb',
  'prop_ground.glb',
];

const assetsDir = resolve(process.argv[2] ?? 'public/assets');

let ok = true;
const missing = EXPECTED.filter((f) => !exists(join(assetsDir, f)));
if (missing.length) {
  ok = false;
  console.error(`❌ Missing: ${missing.join(', ')}`);
}

const files = readdirSync(assetsDir).filter((f) => f.endsWith('.glb'));
const unknown = files.filter((f) => !EXPECTED.includes(f));
if (unknown.length) {
  ok = false;
  console.error(`❌ Unexpected: ${unknown.join(', ')}`);
}

for (const f of EXPECTED) {
  const p = join(assetsDir, f);
  if (!exists(p)) continue;
  const st = statSync(p);
  if (st.size < 1024) {
    ok = false;
    console.error(`❌ ${f}: too small (${st.size} bytes)`);
  }
  // GLB magic: 0x46546C67 ("glTF")
  const buf = readFileSync(p).subarray(0, 4);
  if (buf.toString('ascii') !== 'glTF') {
    ok = false;
    console.error(`❌ ${f}: not a valid GLB (magic mismatch)`);
  }
}

if (ok) {
  console.log(`✅ Asset manifest OK — ${EXPECTED.length}/${EXPECTED.length} assets valid in ${assetsDir}`);
} else {
  console.error('❌ Asset manifest validation FAILED');
  process.exit(1);
}

function exists(p) {
  try { statSync(p); return true; } catch { return false; }
}
