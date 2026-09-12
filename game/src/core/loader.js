import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const loader = new GLTFLoader();
const cache = new Map();

/**
 * Load a .glb once and cache the parsed Group.
 * @param {string} name - file name without extension (e.g. 'snowball_brave')
 * @returns {Promise<THREE.Group>}
 */
export function loadAsset(name) {
  if (cache.has(name)) return Promise.resolve(cache.get(name));
  const url = `assets/${name}.glb`;
  return new Promise((resolve, reject) => {
    loader.load(url, (gltf) => {
      // Cache a clone source; return a fresh clone each call so callers can
      // freely add/remove from scene without corrupting the cache.
      cache.set(name, gltf.scene);
      resolve(gltf.scene.clone(true));
    }, undefined, reject);
  });
}
