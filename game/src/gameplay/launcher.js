import * as THREE from 'three';

/**
 * Hold-to-charge launcher.
 * Power meter 0..1 fills over chargeTime; on release, launch along
 * an elevation curve toward the fortress center with vBase + vBoost·power.
 */
export class Launcher {
  constructor({ chargeTime = 1.2, power = 0, vBase = 8, vBoost = 14, elevation = 40 } = {}) {
    this.chargeTime = chargeTime;
    this.power = power;          // 0..1 current charge
    this.charging = false;
    this.vBase = vBase;
    this.vBoost = vBoost;
    this.elevation = (elevation * Math.PI) / 180; // radians
    this.velocity = new THREE.Vector3();
  }

  start() {
    this.charging = true;
    this.power = 0;
  }

  /** Advance charge; dt in seconds. Returns new power (0..1). */
  update(dt) {
    if (!this.charging) return this.power;
    this.power = Math.min(1, this.power + dt / this.chargeTime);
    return this.power;
  }

  stop() {
    this.charging = false;
    const v = this.vBase + this.vBoost * this.power;
    // Direction: from snowman toward center, with elevation
    const dir = new THREE.Vector3();
    dir.setFromSphericalCoords(1, this.elevation, 0);
    // We want direction toward arena center (-ring radius axis in world XZ)
    // The orbit code rotates the launcher; here we just compute magnitude;
    // caller applies world direction via launcher.aim(dir).
    this.velocity.copy(dir).multiplyScalar(v);
    return this.velocity.clone();
  }

  /** Set world aim direction (unit vector) — called by owner each frame. */
  aim(dir) {
    this.aimDir = dir.clone();
  }

  /** Current world-space launch velocity (for preview + actual launch). */
  worldLaunchVector(powerOverride) {
    const p = powerOverride ?? this.power;
    const v = this.vBase + this.vBoost * p;
    const d = this.aimDir ?? new THREE.Vector3(0, 1, 0);
    return d.clone().multiplyScalar(v);
  }
}
