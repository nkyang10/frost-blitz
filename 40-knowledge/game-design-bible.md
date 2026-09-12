# Game Design Bible — Frost Blitz ❄️

> THE design contract. Any gameplay/balance/level change MUST be reflected here + noted in the
> decisions log. Read before touching anything gameplay-related.

## 1. Elevator pitch

A cute 3D **orbit-siege** game: the frost-pig fortress sits at the **center of a round arena**, and
you are a **snowman turret that slides along a circular rail** at a fixed radius, always facing the
target. A **slide bar maps 0–360°** to your position on the circle; you pick your spot, then
**hold to charge** and release to lob **cute smiling snowballs** into the fortress. Physics-based
destruction, silly faces, warm-and-fluffy winter vibes.

## 2. Core loop

1. **Menu** → pick a level (6 total).
2. **Position:** drag the bottom **angle bar (0–360°)** — the snowman glides around the perimeter
   ring at constant radius, and the orbiting camera follows so the fortress stays dead-ahead.
3. **Charge:** press and **hold** — a power meter fills while a trajectory preview arcs in.
4. **Release:** the snowball launches along the preview; cannon-es resolves flight + collisions.
5. **Resolve:** physics knocks blocks and pigs around for a few seconds.
6. **Result:** fortress destroyed (all frost-pigs down) → **WIN** with 1–3 stars from snowballs
   unused. Out of snowballs with pigs alive → **LOSE**.
7. Restart (same level) or next level.

## 3. Characters

### Snowball heroes (the player ammo + mascots)
| Variant | Look (procedural) | Trait |
|---|---|---|
| Brave | white sphere, determined brows, carrot nose, red knitted scarf | default, balanced |
| Cute | bigger blush, wide eyes, tiny smile | pint-sized, same physics |
| Derpy | crossed/misaligned eyes, lopsided smile | cosmetic alt |

All share: white snowy cratered surface (subtle roughness variation), dark pebble eyes, conical
carrot nose, rosy blush spheres. The **player itself** is a spruced-up "captain snowman" (taller,
scarf, top-hat) that rides the ring.

### Frost-pig villains (targets, inside the central fortress)
Round, chubby, snow-crustacean cousins of classic pigs: pale blue-grey body, stubby legs, tiny
tusk cones, grumpy eyes + cheek blush. **Variants:**
- *Coldtooth* (2 HP) — standard, medium
- *Grumpa* (3 HP) — bigger, armoured snow hat
- *Squeak* (1 HP) — small, fast to topple

Health chips on any contact damage; a pig **dies** if its HP hits 0 (squish animation + "poof"
sound) **or** if it is launched/knocked out of the kill volume. Fortress is **destroyed when all
its pigs are eliminated** (blocks are the walls protecting them).

## 4. Arena & the orbit mechanic (the core invention)

- **Arena:** flat circular frozen lake/field. Center = fortress spawn area. Perimeter ring radius
  `R` per level (see §5). Kill volume = 1.5 m beyond the ring edge and `y < -4`.
- **Snowman position on the ring:** `playerPos = center + R·(cos θ, 0, sin θ)`, θ from the slide
  bar, clipped to `[0, 2π]`. Movement is smooth-lerped (not teleported) so the slide feels glidy.
- **Camera (orbit follow):** camera is placed outward behind the snowman (`camPos = playerPos +
  outward·dist + up·height`) and **looks at the fortress center**. As θ changes, the camera orbits
  with the player; the fortress is always on screen center — aiming is: "spin to the side of the
  fort I want to hit, then tune power."
- **Charge & launch:** hold = power `p` fills `0→1` over ~1.2 s (linear); release fires at that `p`.
  Launch velocity is a ballistic lob toward center: horizontal speed toward fortress scaled by
  `p`, plus an upward arc component tuned so `p≈0.35` lands at the near ring edge and `p≈0.95`
  clears the far edge of the fortress.
- **Trajectory preview:** while holding, simulate the shot forward (~60 steps) and draw a dot trail
  (≤ 40 points) so players can dial the exact arc.

### 4.1 Position/power technical contract (DEC-006)
- `angle 0..360` from slide bar (deg), converted to `θ` in radians.
- `playerPos = C + R·(cos θ, 0, sin θ)`; `outward = (playerPos - C).normalize()`.
- `launchDir = normalize((C_target - playerPos)·hAxis + up·k(p))` where `k(p)` rises with power;
  `speed = base + p·boost` (tuned in config, §engine-constants).
- Camera `dist ≈ 9`, `height ≈ 6` relative to player; `lookAt(C)`.
- Blender/gLTF/naming conventions unchanged. Basis in research-notes §C/D.

## 5. Destructible materials

| Material | Look | HP | Interaction |
|---|---|---|---|
| Snow | soft white / powder-blue block | 1 | crumbles on hit, slow to stack |
| Ice | pale blue glassy block | 2 | shatters into flakes, slides more |
| Wood | brown planks/beams | 3 | bounces, rarely breaks from light hits |

Blocks snap into pieces when HP ≤ 0 (mesh swap to fragments + particle burst). Falling blocks deal
damage to whatever they crush (physics-chain destruction, siege-style).

### 5.1 Damage model (v1 — DEC-003)
- Damage applied per physical contact that clears a **material impact gate** (`collide` event →
  `contact.getImpactVelocityAlongNormal()`).
- Gates: snow ≥ 1.2 m/s, ice ≥ 2.0 m/s, wood ≥ 3.2 m/s, pig ≥ 2.5 m/s. Below gate = resting/rolling,
  no damage.
- On a gated contact, `damage = max(1, round(impact / 5))` (a fast lob can one-shot snow/ice).
- Grazing shots: impact measured along contact normal is naturally low → no extra curve needed.
- Blocks take damage if a heavy body lands on them (same gate) → towers collapse when pillars cut.
- Pigs also die outside the kill volume (ring edge + y < -4).

## 6. Level design (levels 1–6)

JSON format (see `50-projects/p001-frost-blitz/config/level-schema.md`). Design rules:
- Each level raises `R` (harder arcing) and fortress complexity; **first-time teaching** drives
  composition.
- Pigs always guarded on at least one side; never unfairly shielded.

| # | Name | Ammo | R | Pigs | Fortress (composition) | Teaches |
|---|---|---|---|---|---|---|
| L1 | First Frost | 3 | 6 | 1×Coldtooth | snow tower (3 snow) | slide + charge + crumble |
| L2 | Ring of Ice | 4 | 7 | 2×Coldtooth | snow base + ice row | ice HP2, chain drop |
| L3 | Three-Ring Circus | 4 | 8 | 1×Coldtooth, 1×Squeak | 2 pillars, wood beam roof | wood bounces, arc-over |
| L4 | Rim Shot | 5 | 9 | 2×Coldtooth, 1×Grumpa | wide wall (snow+ice) with gap | pick the weak point |
| L5 | Hairpin Heights | 5 | 10 | 1×Squeak, 2×Coldtooth | sloped igloo, ice-heavy, pig on roof | steep l-o-b, slide kills |
| L6 | Frost Throne | 6 | 11 | 2×Coldtooth, 1×Grumpa, 1×Squeak | 2-room fort, wood roof, pivot pillar | multi-room collapse, combo |

## 7. Scoring & stars

- **Star threshold (deterministic):** stars from remaining snowballs `r` of `a`:
  - `r ≥ ceil(a×0.7)` → 3★; `r ≥ ceil(a×0.4)` → 2★; else 1★.
  - (L1 3 ammo → 3★ needs ≥2 left; L6 6 ammo → 3★ needs ≥4 left.)
- HUD: remaining snowballs, pigs left, current score ticker (+1 snow, +2 ice, +3 wood, +5 pig,
  combo multiplier for chain reactions).
- Max-stars persist per level on the menu (localStorage).

## 8. Controls

- **Angle (slide bar):** drag/tap the bottom bar (0–360°); the snowman + camera orbit to match.
- **Keyboard alt:** `A`/`D` or arrow `←`/`→` nudge θ by ±1°; hold for continuous.
- **Fire:** press-hold anywhere on the arena → charge meter + trajectory preview → release to shoot.
  Tap `R` to restart, `Esc` (or pause button) to pause.
- **Touch:** bottom-drag on slide bar (thumb-friendly); tap-hold anywhere to charge.

## 9. Look & feel (art direction)

- **Arena:** circular frost ring, brushed-snow texture, perimeter rail with angle tick marks
  (0°/90°/180°/270° pillars), soft light scatter from center fort.
- Palette: winter whites, baby blues, warm wood browns, carrot orange, candy-pink blush.
- Sky: gradient + drifting translucent snow particles; faint mountains outside the ring.
- Sound: WebAudio-generated (slide *fwip*, charge *tensile kreak*, launch *swoosh*, impact *thud*,
  ice *crackle*, wood *thock*, pig *poof*, win *jingle*) — no asset files.
- Juice: camera shake on big impacts, slow-mo on pig kill, squash-stretch while charging, snowman
  lean into the ring while sliding.

## 10. Scope guardrails

- **In v1:** orbit-siege arena, 6 levels + varying `R`, 3 snowball variants, 3 pig variants, 3
  materials, slide bar + hold-to-charge, orbiting camera, menu, level select, HUD, win/lose,
  particles, audio, touch input.
- **NOT in v1 (future):** multiplayer, PvP, procedurally generated arenas, boss fights,
  upgrades/energy, online leaderboard, moving targets, Blender sculpted textures.

## 11. References

- Prompt patterns studied: `github.com/BeatAPI/awesome-3d-prompts` (cute 3D game craft).
- Orbit-siege mechanic decision: `40-knowledge/decisions-log.md` DEC-006.
- Research notes: `40-knowledge/research-notes.md`.
