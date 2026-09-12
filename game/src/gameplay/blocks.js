import * as THREE from 'three';
import * as CANNON from 'cannon-es';

const MATERIAL_META = {
  snow: { hp: 1, label: '雪', color: 0xa8c8e8 },
  ice: { hp: 2, label: '冰', color: 0x9fd4f5 },
  wood: { hp: 3, label: '木', color: 0xa07030 },
};

/**
 * Destructible block mesh + cannon body.
 * `material` one of snow|ice|wood. HP from MATERIAL_META by default (overridable).
 */
export class Block {
  constructor({ material = 'snow', mesh, hp, position = [0, 0, 0], world, materials } = {}) {
    const meta = MATERIAL_META[material] || MATERIAL_META.snow;
    this.type = material;
    this.hp = hp ?? meta.hp;
    this.maxHp = this.hp;
    this.mesh = mesh;
    this.alive = true;
    if (this.mesh) {
      this.mesh.position.set(...position);
      this.mesh.castShadow = true;
      this.mesh.receiveShadow = true;
    }

    if (world) {
      const physMat = materials[material];
      const body = new CANNON.Body({
        mass: material === 'ice' ? 2.5 : material === 'wood' ? 3 : 2,
        material: physMat,
        shape: new CANNON.Box(new CANNON.Vec3(0.4, 0.4, 0.4)),
        position: new CANNON.Vec3(...position),
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
    return 1; // blocks destroyed
  }
}
