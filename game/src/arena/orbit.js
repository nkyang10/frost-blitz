import * as THREE from 'three';

/**
 * Orbit state manager: θ (radians) maps to player position on the ring.
 * playerPos = C + R·(cosθ, 0, sinθ)
 */
export class Orbit {
  constructor({ radius = 7, y = 0.5 } = {}) {
    this.radius = radius;
    this.y = y;
    this.theta = 0;
    this.targetTheta = 0;
    this.lerpSpeed = 4.5; // rad/s toward target (smooth but responsive)
  }

  get angleDeg() {
    return (this.theta * 180) / Math.PI;
  }

  setAngle(rad) {
    this.targetTheta = rad;
  }

  /** Advance θ toward targetTheta; returns the new position. */
  update(dt) {
    let diff = this.targetTheta - this.theta;
    // shortest-wrap
    diff = ((diff + Math.PI) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2) - Math.PI;
    const step = this.lerpSpeed * dt;
    if (Math.abs(diff) <= step) this.theta = this.targetTheta;
    else this.theta += Math.sign(diff) * step;
    return this.position();
  }

  position() {
    const x = this.radius * Math.cos(this.theta);
    const z = this.radius * Math.sin(this.theta);
    return new THREE.Vector3(x, this.y, z);
  }
}

/**
 * Orbiting follow camera: sits behind the snowman (further out on the ring),
 * looks at the arena center so the fortress stays dead-ahead.
 */
export class OrbitCam {
  constructor(orbit, { dist = 6, height = 5 } = {}) {
    this.orbit = orbit;
    this.dist = dist;
    this.height = height;
  }

  update(camera, dt = 0.016) {
    const θ = this.orbit.theta;
    // Camera position: outward from center through player, plus height
    const camX = (this.orbit.radius + this.dist) * Math.cos(θ);
    const camZ = (this.orbit.radius + this.dist) * Math.sin(θ);
    camera.position.set(camX, this.height, camZ);
    camera.lookAt(0, 1.2, 0); // fortress center, slightly up
  }
}
