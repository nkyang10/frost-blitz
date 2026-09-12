import * as THREE from 'three';
import * as CANNON from 'cannon-es';

const PIG_META = {
  coldtooth: { hp: 2, label: 'Coldtooth', scale: 1.0 },
  grumpa: { hp: 3, label: 'Grumpa', scale: 1.2 },
  squeak: { hp: 1, label: 'Squeak', scale: 0.65 },
};

/**
 * Frost-pig: mesh + cannon body + HP.
 * Dies on HP<=0 (squish) or when launched outside kill volume.
 */
export class Pig {
  constructor({ variant = 'coldtooth', mesh, position = [0, 0, 0], world, materials } = {}) {
    const meta = PIG_META[variant] || PIG_META.coldtooth;
    this.variant = variant;
    this.hp = meta.hp;
    this.maxHp = meta.hp;
    this.mesh = mesh;
    this.alive = true;
    if (this.mesh) {
      const s = meta.scale;
      this.mesh.scale.set(s, s, s);
      this.mesh.position.set(...position);
      this.mesh.castShadow = true;
      this.mesh.receiveShadow = true;
    }

    if (world) {
      const body = new CANNON.Body({
        mass: variant === 'squeak' ? 1.2 : variant === 'grumpa' ? 4 : 2.5,
        material: materials.pig,
        shape: new CANNON.Sphere(0.45 * meta.scale),
        position: new CANNON.Vec3(...position),
        linearDamping: 0.3,
        angularDamping: 0.4,
      });
      this.body = body;
      world.addBody(body);
    }
  }

  takeDamage(amount) {
    if (!this.alive) return 0;
    this.hp -= amount;
    if (this.hp <= 0) return this.die();
    return 0;
  }

  die() {
    this.alive = false;
    return 1; // pigs defeated
  }
}
