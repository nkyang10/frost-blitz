"""
Frost Blitz — procedural asset generator (Blender 4.0 headless).
Usage: blender -b -P export_assets.py -- --out /path/to/assets
Generates all .glb files into the given output directory.

Asset list (see game-design-bible §3-5):
  snowball_brave.glb   — white sphere, determined brows, carrot nose, red scarf
  snowball_cute.glb    — bigger blush, wide eyes, tiny smile
  snowball_derpy.glb   — crossed/misaligned eyes, lopsided smile
  captain_snowman.glb  — taller, scarf, top-hat (the player)
  pig_coldtooth.glb    — 2 HP, standard medium
  pig_grumpa.glb       — 3 HP, bigger, armoured snow hat
  pig_squeak.glb       — 1 HP, small
  block_snow.glb       — 1 HP, soft white/powder-blue
  block_ice.glb        — 2 HP, pale blue glassy
  block_wood.glb       — 3 HP, brown planks
  arena_ring.glb       — perimeter ring + 4 angle pillars (0/90/180/270)
  fortress_base.glb    — central fortress platform
  prop_pine.glb        — pine tree
  prop_igloo.glb       — small igloo
  prop_ground.glb      — circular ground disc
"""
import bpy
import bmesh
import math
import os
import sys
import argparse
import mathutils
from mathutils import Vector, Euler

# ── Parse args ────────────────────────────────────────────────────────────────
# Blender strips argv after the script; use environment var for reliability.
out_dir = os.environ.get("FROST_ASSET_OUT", "/tmp/frost-blitz-assets")
os.makedirs(out_dir, exist_ok=True)

def clear_scene():
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete(use_global=False)
    # NOTE: do NOT delete materials here — global M_* mats are referenced across builds.
    for block in (bpy.data.meshes, bpy.data.lights, bpy.data.cameras, bpy.data.curves, bpy.data.images):
        for item in list(block):
            if item.users == 0:
                block.remove(item)

def mat(name, base_color, roughness=0.6, metallic=0.0):
    m = bpy.data.materials.get(name) or bpy.data.materials.new(name)
    m.use_nodes = True
    bsdf = m.node_tree.nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs["Base Color"].default_value = base_color
        bsdf.inputs["Roughness"].default_value = roughness
        bsdf.inputs["Metallic"].default_value = metallic
    return m

def add_sphere(radius=0.5, segments=32, rings=16, loc=(0,0,0), mat_obj=None):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=segments, ring_count=rings, radius=radius, location=loc)
    obj = bpy.context.active_object
    if mat_obj: obj.data.materials.append(mat_obj)
    return obj

def add_box(w=1, h=1, d=1, loc=(0,0,0), mat_obj=None, bevel=0.0):
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc)
    obj = bpy.context.active_object
    obj.scale = (w, h, d)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    if bevel > 0:
        m = obj.modifiers.new("Bevel", 'BEVEL')
        m.width = bevel; m.segments = 3
        bpy.ops.object.modifier_apply(modifier=m.name)
    if mat_obj: obj.data.materials.append(mat_obj)
    return obj

def add_cone(radius_top=0.0, radius_bottom=0.3, depth=1.0, loc=(0,0,0), mat_obj=None):
    bpy.ops.mesh.primitive_cone_add(vertices=24, radius1=radius_bottom, radius2=radius_top, depth=depth, location=loc)
    obj = bpy.context.active_object
    if mat_obj: obj.data.materials.append(mat_obj)
    return obj

def add_torus(major_r=0.5, minor_r=0.08, loc=(0,0,0), mat_obj=None):
    bpy.ops.mesh.primitive_torus_add(major_radius=major_r, minor_radius=minor_r, major_segments=32, minor_segments=8, location=loc)
    obj = bpy.context.active_object
    if mat_obj: obj.data.materials.append(mat_obj)
    return obj

def join(objs):
    bpy.ops.object.select_all(action='DESELECT')
    for o in objs: o.select_set(True)
    bpy.context.view_layer.objects.active = objs[0]
    bpy.ops.object.join()
    return bpy.context.active_object

def apply_all(objs):
    bpy.ops.object.select_all(action='DESELECT')
    for o in objs: o.select_set(True)
    bpy.context.view_layer.objects.active = objs[0]
    bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)

def export(name):
    path = os.path.join(out_dir, name)
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
    bpy.ops.export_scene.gltf(filepath=path, export_format='GLB', use_selection=True)
    print(f"  ✓ {name}")

# ── Materials ─────────────────────────────────────────────────────────────────
M_WHITE    = mat("m_white",    (1.0, 0.97, 0.95, 1), roughness=0.75)
M_SNOW     = mat("m_snow",     (0.95, 0.97, 1.0, 1), roughness=0.7)
M_BLUE     = mat("m_blue",     (0.75, 0.85, 1.0, 1), roughness=0.5)
M_ICE      = mat("m_ice",      (0.7, 0.85, 1.0, 1), roughness=0.15)
M_WOOD     = mat("m_wood",     (0.55, 0.35, 0.18, 1), roughness=0.8)
M_CARROT   = mat("m_carrot",   (1.0, 0.45, 0.1, 1),  roughness=0.6)
M_EYE      = mat("m_eye",      (0.08, 0.06, 0.08, 1), roughness=0.3)
M_BLUSH    = mat("m_blush",    (1.0, 0.6, 0.65, 1),  roughness=0.7)
M_SCARF    = mat("m_scarf",    (0.9, 0.15, 0.2, 1),  roughness=0.7)
M_HAT      = mat("m_hat",      (0.15, 0.1, 0.2, 1),  roughness=0.5)
M_PIG      = mat("m_pig",      (0.65, 0.72, 0.8, 1), roughness=0.6)
M_PIG_DARK = mat("m_pig_dark", (0.5, 0.58, 0.68, 1), roughness=0.6)
M_TUSK     = mat("m_tusk",     (0.95, 0.95, 0.9, 1), roughness=0.3)
M_RAIL     = mat("m_rail",     (0.5, 0.55, 0.6, 1), roughness=0.4)
M_GROUND   = mat("m_ground",   (0.88, 0.92, 0.95, 1), roughness=0.85)
M_PINE     = mat("m_pine",     (0.15, 0.45, 0.25, 1), roughness=0.8)
M_PINE_TR  = mat("m_pine_trunk", (0.35, 0.25, 0.15, 1), roughness=0.85)
M_IGLOO    = mat("m_igloo",    (0.9, 0.94, 0.98, 1), roughness=0.65)

def eyes(loc, size=0.06, spacing=0.14):
    """Two dark eyes + optional eyebrows."""
    objs = []
    for dx in (-spacing/2, spacing/2):
        e = add_sphere(radius=size, segments=16, rings=8, loc=(loc[0]+dx, loc[1], loc[2]), mat_obj=M_EYE)
        objs.append(e)
    return objs

def blush(loc, size=0.05):
    objs = []
    for dx in (-0.15, 0.15):
        b = add_sphere(radius=size, segments=16, rings=8, loc=(loc[0]+dx, loc[1], loc[2]-0.03), mat_obj=M_BLUSH)
        objs.append(b)
    return objs

def carrot_nose(loc):
    n = add_cone(radius_top=0.0, radius_bottom=0.04, depth=0.12, loc=(loc[0], loc[1]+0.02, loc[2]), mat_obj=M_CARROT)
    n.rotation_euler = Euler((math.pi/2, 0, 0))
    return n

# ══════════════════════════════════════════════════════════════════════════════
# 1. Snowball faces
# ══════════════════════════════════════════════════════════════════════════════
def build_snowball_brave():
    clear_scene()
    body = add_sphere(radius=0.5, loc=(0,0,0), mat_obj=M_WHITE)
    e = eyes((0, 0.48, 0.12), size=0.06, spacing=0.16)
    nose = [carrot_nose((0, 0.48, 0.0))]
    bl = blush((0, 0.47, -0.12), size=0.06)
    # Scarf
    scarf = add_torus(major_r=0.38, minor_r=0.07, loc=(0,0,-0.28), mat_obj=M_SCARF)
    scarf_knot = add_box(w=0.15, h=0.2, d=0.08, loc=(0.25, 0.2, -0.45), mat_obj=M_SCARF)
    objs = [body, *e, *nose, *bl, scarf, scarf_knot]
    apply_all(objs)
    export("snowball_brave.glb")

def build_snowball_cute():
    clear_scene()
    body = add_sphere(radius=0.5, loc=(0,0,0), mat_obj=M_WHITE)
    # Wide eyes (bigger)
    e = eyes((0, 0.48, 0.1), size=0.08, spacing=0.18)
    nose = [carrot_nose((0, 0.48, -0.02))]
    # Bigger blush
    bl = blush((0, 0.47, -0.15), size=0.09)
    # Tiny smile (small box)
    smile = add_box(w=0.08, h=0.02, d=0.02, loc=(0, 0.49, -0.08), mat_obj=M_EYE)
    objs = [body, *e, *nose, *bl, smile]
    apply_all(objs)
    export("snowball_cute.glb")

def build_snowball_derpy():
    clear_scene()
    body = add_sphere(radius=0.5, loc=(0,0,0), mat_obj=M_WHITE)
    # Crossed / misaligned eyes
    e1 = add_sphere(radius=0.05, segments=16, rings=8, loc=(-0.08, 0.48, 0.14), mat_obj=M_EYE)
    e2 = add_sphere(radius=0.05, segments=16, rings=8, loc=(0.09, 0.48, 0.06), mat_obj=M_EYE)
    nose = [carrot_nose((0, 0.48, -0.02))]
    bl = blush((0, 0.47, -0.15), size=0.06)
    # Lopsided smile
    smile = add_box(w=0.1, h=0.02, d=0.02, loc=(0.03, 0.49, -0.1), mat_obj=M_EYE)
    smile.rotation_euler = Euler((0, 0, 0.2))
    objs = [body, e1, e2, *nose, *bl, smile]
    apply_all(objs)
    export("snowball_derpy.glb")

# ══════════════════════════════════════════════════════════════════════════════
# 2. Captain Snowman (the player)
# ══════════════════════════════════════════════════════════════════════════════
def build_captain_snowman():
    clear_scene()
    # Bottom sphere (larger)
    b1 = add_sphere(radius=0.55, loc=(0,0,-0.5), mat_obj=M_WHITE)
    # Top sphere (head)
    head = add_sphere(radius=0.4, loc=(0,0,0.35), mat_obj=M_WHITE)
    # Eyes
    e1 = add_sphere(radius=0.05, segments=16, rings=8, loc=(-0.12, 0.38, 0.4), mat_obj=M_EYE)
    e2 = add_sphere(radius=0.05, segments=16, rings=8, loc=(0.12, 0.38, 0.4), mat_obj=M_EYE)
    # Carrot nose
    nose = add_cone(radius_top=0.0, radius_bottom=0.03, depth=0.15, loc=(0, 0.36, 0.3), mat_obj=M_CARROT)
    nose.rotation_euler = Euler((math.pi/2, 0, 0))
    # Blush
    bl1 = add_sphere(radius=0.05, segments=16, rings=8, loc=(-0.2, 0.36, 0.28), mat_obj=M_BLUSH)
    bl2 = add_sphere(radius=0.05, segments=16, rings=8, loc=(0.2, 0.36, 0.28), mat_obj=M_BLUSH)
    # Scarf around neck
    scarf = add_torus(major_r=0.3, minor_r=0.06, loc=(0,0,-0.15), mat_obj=M_SCARF)
    scarf_tail = add_box(w=0.12, h=0.3, d=0.06, loc=(0.15, 0.15, -0.35), mat_obj=M_SCARF)
    # Top hat
    hat_base = add_box(w=0.5, h=0.06, d=0.5, loc=(0,0,0.75), mat_obj=M_HAT)
    hat_cyl = add_sphere(radius=0.2, loc=(0,0,0.85), mat_obj=M_HAT)
    hat_cyl.scale = (1, 1, 1.3)
    objs = [b1, head, e1, e2, nose, bl1, bl2, scarf, scarf_tail, hat_base, hat_cyl]
    apply_all(objs)
    export("captain_snowman.glb")

# ══════════════════════════════════════════════════════════════════════════════
# 3. Frost-pigs
# ══════════════════════════════════════════════════════════════════════════════
def _pig_body(scale=1.0):
    """Shared pig body builder. Returns list of objects."""
    body = add_sphere(radius=0.4*scale, loc=(0,0,0.3*scale), mat_obj=M_PIG)
    # Stubby legs
    legs = []
    for dx, dz in [(-0.18, 0.15), (0.18, 0.15), (-0.18, -0.15), (0.18, -0.15)]:
        leg = add_box(w=0.1*scale, h=0.25*scale, d=0.1*scale,
                      loc=(dx*scale, dz*scale, 0.12*scale), mat_obj=M_PIG_DARK)
        legs.append(leg)
    # Tusk cones (tiny)
    tusks = []
    for dx in (-0.12, 0.12):
        t = add_cone(radius_top=0.0, radius_bottom=0.02*scale, depth=0.08*scale,
                     loc=(dx*scale, 0.35*scale, 0.35*scale), mat_obj=M_TUSK)
        t.rotation_euler = Euler((math.pi/3, 0, 0))
        tusks.append(t)
    # Grumpy eyes
    e1 = add_sphere(radius=0.04*scale, segments=16, rings=8,
                    loc=(-0.1*scale, 0.36*scale, 0.42*scale), mat_obj=M_EYE)
    e2 = add_sphere(radius=0.04*scale, segments=16, rings=8,
                    loc=(0.1*scale, 0.36*scale, 0.42*scale), mat_obj=M_EYE)
    # Blush
    bl1 = add_sphere(radius=0.04*scale, segments=16, rings=8,
                     loc=(-0.18*scale, 0.34*scale, 0.35*scale), mat_obj=M_BLUSH)
    bl2 = add_sphere(radius=0.04*scale, segments=16, rings=8,
                     loc=(0.18*scale, 0.34*scale, 0.35*scale), mat_obj=M_BLUSH)
    # Snout
    snout = add_sphere(radius=0.1*scale, segments=24, rings=12,
                       loc=(0, 0.4*scale, 0.38*scale), mat_obj=M_PIG_DARK)
    # Nostrils
    n1 = add_sphere(radius=0.015*scale, segments=8, rings=6,
                    loc=(-0.04*scale, 0.48*scale, 0.4*scale), mat_obj=M_EYE)
    n2 = add_sphere(radius=0.015*scale, segments=8, rings=6,
                    loc=(0.04*scale, 0.48*scale, 0.4*scale), mat_obj=M_EYE)
    return [body, *legs, *tusks, e1, e2, bl1, bl2, snout, n1, n2]

def build_pig_coldtooth():
    clear_scene()
    objs = _pig_body(scale=1.0)
    apply_all(objs)
    export("pig_coldtooth.glb")

def build_pig_grumpa():
    clear_scene()
    objs = _pig_body(scale=1.2)
    # Armoured snow hat
    hat = add_sphere(radius=0.25, loc=(0,0,0.75), mat_obj=M_WHITE)
    hat.scale = (1.3, 1.3, 0.7)
    objs.append(hat)
    apply_all(objs)
    export("pig_grumpa.glb")

def build_pig_squeak():
    clear_scene()
    objs = _pig_body(scale=0.65)
    apply_all(objs)
    export("pig_squeak.glb")

# ══════════════════════════════════════════════════════════════════════════════
# 4. Destructible blocks
# ══════════════════════════════════════════════════════════════════════════════
def build_block_snow():
    clear_scene()
    b = add_box(w=0.8, h=0.8, d=0.8, loc=(0,0,0), mat_obj=M_SNOW, bevel=0.06)
    apply_all([b])
    export("block_snow.glb")

def build_block_ice():
    clear_scene()
    b = add_box(w=0.8, h=0.8, d=0.8, loc=(0,0,0), mat_obj=M_ICE, bevel=0.04)
    apply_all([b])
    export("block_ice.glb")

def build_block_wood():
    clear_scene()
    b = add_box(w=0.8, h=0.8, d=0.8, loc=(0,0,0), mat_obj=M_WOOD, bevel=0.02)
    apply_all([b])
    export("block_wood.glb")

# ══════════════════════════════════════════════════════════════════════════════
# 5. Arena & props
# ══════════════════════════════════════════════════════════════════════════════
def build_arena_ring():
    clear_scene()
    # Perimeter ring (torus)
    ring = add_torus(major_r=1.0, minor_r=0.06, loc=(0,0,0), mat_obj=M_RAIL)
    # 4 angle pillars at 0°, 90°, 180°, 270°
    pillars = []
    for angle_deg in (0, 90, 180, 270):
        a = math.radians(angle_deg)
        x, z = math.cos(a), math.sin(a)
        p = add_box(w=0.15, h=1.2, d=0.15, loc=(x, 0.6, z), mat_obj=M_RAIL)
        # Small cap on top
        cap = add_sphere(radius=0.1, segments=16, rings=8, loc=(x, 1.25, z), mat_obj=M_RAIL)
        pillars.extend([p, cap])
    objs = [ring, *pillars]
    apply_all(objs)
    export("arena_ring.glb")

def build_fortress_base():
    clear_scene()
    base = add_box(w=3.0, h=0.4, d=3.0, loc=(0,0.2,0), mat_obj=M_SNOW, bevel=0.05)
    # Small decorative spikes on top edges
    spikes = []
    for dx, dz in [(-1.2, 0), (1.2, 0), (0, -1.2), (0, 1.2)]:
        s = add_cone(radius_top=0.0, radius_bottom=0.1, depth=0.3,
                     loc=(dx, 0.55, dz), mat_obj=M_SNOW)
        spikes.append(s)
    objs = [base, *spikes]
    apply_all(objs)
    export("fortress_base.glb")

def build_prop_pine():
    clear_scene()
    trunk = add_cone(radius_top=0.04, radius_bottom=0.06, depth=0.3, loc=(0,0.15,0), mat_obj=M_PINE_TR)
    t1 = add_cone(radius_top=0.0, radius_bottom=0.35, depth=0.5, loc=(0,0.55,0), mat_obj=M_PINE)
    t2 = add_cone(radius_top=0.0, radius_bottom=0.28, depth=0.45, loc=(0,0.9,0), mat_obj=M_PINE)
    t3 = add_cone(radius_top=0.0, radius_bottom=0.2, depth=0.4, loc=(0,1.2,0), mat_obj=M_PINE)
    objs = [trunk, t1, t2, t3]
    apply_all(objs)
    export("prop_pine.glb")

def build_prop_igloo():
    clear_scene()
    dome = add_sphere(radius=0.6, loc=(0,0.3,0), mat_obj=M_IGLOO)
    # Cut bottom half by scaling
    dome.scale = (1, 0.6, 1)
    door = add_box(w=0.3, h=0.4, d=0.1, loc=(0, 0.2, 0.5), mat_obj=M_SNOW)
    objs = [dome, door]
    apply_all(objs)
    export("prop_igloo.glb")

def build_prop_ground():
    clear_scene()
    g = add_sphere(radius=1.5, segments=64, rings=16, loc=(0,0,0), mat_obj=M_GROUND)
    g.scale = (1, 0.05, 1)
    apply_all([g])
    export("prop_ground.glb")

# ══════════════════════════════════════════════════════════════════════════════
# Run all
# ══════════════════════════════════════════════════════════════════════════════
print(f"📦 Frost Blitz asset generator → {out_dir}")
build_snowball_brave()
build_snowball_cute()
build_snowball_derpy()
build_captain_snowman()
build_pig_coldtooth()
build_pig_grumpa()
build_pig_squeak()
build_block_snow()
build_block_ice()
build_block_wood()
build_arena_ring()
build_fortress_base()
build_prop_pine()
build_prop_igloo()
build_prop_ground()
print("✅ Done! All 15 assets exported.")
