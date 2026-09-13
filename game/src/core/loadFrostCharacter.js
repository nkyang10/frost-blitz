/**
 * loadFrostCharacter.js — load Hunyuan-generated Frost Blitz characters
 * (geometry-only GLB + albedo.png) with front-projected coloring.
 *
 * Mirrors comfyui-character-3d's loadCharacter.js but scoped to the game
 * asset folders and with per-character height normalization.
 */
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const loader = new GLTFLoader();

function projectFrontUVs(THREE, geometry) {
  geometry.computeBoundingBox();
  const bb = geometry.boundingBox;
  const pos = geometry.attributes.position;
  const uvs = new Float32Array(pos.count * 2);
  const sx = Math.max(bb.max.x - bb.min.x, 1e-6);
  const sy = Math.max(bb.max.y - bb.min.y, 1e-6);
  for (let i = 0; i < pos.count; i++) {
    uvs[i * 2] = (pos.getX(i) - bb.min.x) / sx;
    uvs[i * 2 + 1] = (pos.getY(i) - bb.min.y) / sy;
  }
  geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
}

function makeFrontOnlyMaterial(THREE, map, iceColorHex = 0x8fadc0) {
  return new THREE.ShaderMaterial({
    uniforms: {
      map: { value: map },
      iceColor: { value: new THREE.Color(iceColorHex) },
    },
    side: THREE.DoubleSide,
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform sampler2D map;
      uniform vec3 iceColor;
      varying vec2 vUv;
      void main() {
        vec4 tex = texture2D(map, vUv);
        gl_FragColor = tex;
      }
    `,
  });
}

/**
 * @param {*} THREE
 * @param {object} opts { glbUrl, albedoUrl, targetHeight, alignBottom=true }
 * @returns {Promise<{root: THREE.Group, dispose: Function}>}
 */
export async function loadFrostCharacter(THREE, opts) {
  const { glbUrl, albedoUrl, targetHeight = 1.0, alignBottom = true } = opts;
  const gltf = await new Promise((resolve, reject) => loader.load(glbUrl, resolve, undefined, reject));
  const root = new THREE.Group();
  root.add(gltf.scene);

  // material: front-projected albedo
  const texLoader = new THREE.TextureLoader();
  const albedo = await new Promise((resolve, reject) => texLoader.load(albedoUrl, resolve, undefined, reject));
  albedo.colorSpace = THREE.SRGBColorSpace;
  // Our projectFrontUVs writes OpenGL-style UVs (v=0 at bottom, v=1 at top);
  // disable three's default flipY so texture rows map 1:1 (head stays up).
  albedo.flipY = false;
  gltf.scene.traverse((child) => {
    if (child.isMesh) {
      projectFrontUVs(THREE, child.geometry);
      const mat = makeFrontOnlyMaterial(THREE, albedo);
      child.material = mat;
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });

  // normalize height
  const box = new THREE.Box3().setFromObject(root);
  const h = box.max.y - box.min.y || 1;
  const s = targetHeight / h;
  root.scale.set(s, s, s);
  if (alignBottom) {
    const box2 = new THREE.Box3().setFromObject(root);
    root.position.y -= box2.min.y;
  }
  root.rotation.y = 0;
  return {
    root,
    dispose() {
      albedo.dispose();
      gltf.scene.traverse((c) => {
        if (c.isMesh) c.material?.dispose();
      });
    },
  };
}
