import * as THREE from 'three';

/**
 * Gentle falling snow particle field (Points).
 */
export function createSnowField(scene, { count = 1200, spread = 25, height = 12 } = {}) {
  const geo = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * spread * 2;
    positions[i * 3 + 1] = Math.random() * height;
    positions[i * 3 + 2] = (Math.random() - 0.5) * spread * 2;
  }
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  const sizes = new Float32Array(count);
  for (let i = 0; i < count; i++) sizes[i] = 0.03 + Math.random() * 0.06;
  geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

  const mat = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.08,
    transparent: true,
    opacity: 0.85,
    sizeAttenuation: true,
    depthWrite: false,
  });

  const points = new THREE.Points(geo, mat);
  points.userData = { count, spread, height, speeds: Array.from({ length: count }, () => 0.5 + Math.random() * 0.8) };
  scene.add(points);
  return points;
}

export function updateSnow(snow, dt) {
  const pos = snow.geometry.attributes.position.array;
  const { count, spread, height, speeds } = snow.userData;
  for (let i = 0; i < count; i++) {
    pos[i * 3 + 1] -= speeds[i] * dt;
    if (pos[i * 3 + 1] < 0) {
      pos[i * 3 + 1] = height;
      pos[i * 3] = (Math.random() - 0.5) * spread * 2;
      pos[i * 3 + 2] = (Math.random() - 0.5) * spread * 2;
    }
  }
  snow.geometry.attributes.position.needsUpdate = true;
}
