import * as THREE from 'three';

const loader = new THREE.TextureLoader();
const cache = new Map();

/**
 * Load a texture once and cache it.
 * @param {string} name - e.g. 't_snow_ground', 't_ice', 't_wood'
 * @returns {Promise<THREE.Texture>}
 */
export function loadTexture(name) {
  if (cache.has(name)) return Promise.resolve(cache.get(name));
  return new Promise((resolve, reject) => {
    loader.load(`textures/${name}.png`, (tex) => {
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      tex.colorSpace = THREE.SRGBColorSpace;
      cache.set(name, tex);
      resolve(tex);
    }, undefined, reject);
  });
}

/**
 * Apply a texture to a GLB mesh's first material (with repeat + color tint).
 */
export function applyTextureToMesh(mesh, texture, { repeat = [1, 1], color = null } = {}) {
  if (!mesh) return;
  mesh.traverse((child) => {
    if (child.isMesh && child.material) {
      const mats = Array.isArray(child.material) ? child.material : [child.material];
      for (const m of mats) {
        if (m && m.isMaterial) {
          const tex = texture.clone();
          tex.needsUpdate = true;
          tex.wrapS = THREE.RepeatWrapping;
          tex.wrapT = THREE.RepeatWrapping;
          tex.repeat.set(repeat[0], repeat[1]);
          m.map = tex;
          if (color) {
            m.color.set(color);
          }
          m.needsUpdate = true;
        }
      }
    }
  });
}

/**
 * Convenience: load texture + apply in one call.
 */
export async function textureMesh(mesh, name, opts = {}) {
  const tex = await loadTexture(name);
  applyTextureToMesh(mesh, tex, opts);
  return mesh;
}
