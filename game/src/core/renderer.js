import * as THREE from 'three';

export function createRenderer(canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  return renderer;
}

export function createScene() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x9dc7e8); // soft winter sky
  scene.fog = new THREE.Fog(0x9dc7e8, 40, 90);
  return scene;
}

export function createCamera() {
  const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 200);
  camera.position.set(0, 6, 12);
  camera.lookAt(0, 0, 0);
  return camera;
}

export function createLights(scene) {
  const hemi = new THREE.HemisphereLight(0xffffff, 0x9db8d8, 1.0);
  scene.add(hemi);

  const dir = new THREE.DirectionalLight(0xfff5e0, 2.2);
  dir.position.set(10, 18, 8);
  dir.castShadow = true;
  dir.shadow.mapSize.set(2048, 2048);
  dir.shadow.camera.near = 1;
  dir.shadow.camera.far = 50;
  dir.shadow.camera.left = -20;
  dir.shadow.camera.right = 20;
  dir.shadow.camera.top = 20;
  dir.shadow.camera.bottom = -20;
  scene.add(dir);
  scene.add(dir.target);

  const fill = new THREE.DirectionalLight(0xbfdcff, 0.6);
  fill.position.set(-8, 6, -6);
  scene.add(fill);

  return { hemi, dir, fill };
}

export function handleResize(renderer, camera) {
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}

export function createSkybox(scene) {
  // Soft gradient via a big inverted sphere with basic material; simpler than cubemap
  const geo = new THREE.SphereGeometry(80, 16, 12);
  const mat = new THREE.MeshBasicMaterial({
    color: 0xbfe0ff,
    side: THREE.BackSide,
    fog: false,
  });
  const sky = new THREE.Mesh(geo, mat);
  scene.add(sky);
  return sky;
}
