import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { createRenderer, createScene, createCamera, createLights, handleResize } from './core/renderer.js';
import { createWorld, stepWorld } from './core/physics.js';
import { loadAsset } from './core/loader.js';
import { loadFrostCharacter } from './core/loadFrostCharacter.js';
import { createSnowField, updateSnow } from './core/snow.js';
import { Orbit, OrbitCam } from './arena/orbit.js';
import { Input } from './arena/input.js';
import { Launcher } from './gameplay/launcher.js';
import { Block } from './gameplay/blocks.js';
import { Pig } from './gameplay/pigs.js';
import { sfx } from './gameplay/audio.js';
import { UI } from './gameplay/ui.js';
import { LEVELS } from './content/levels.js';
import { textureMesh, loadTexture } from './core/textures.js';

const STATE = {
  MENU: 'MENU',
  PLAYING: 'PLAYING',
  RESOLVE: 'RESOLVE',
  RESULT: 'RESULT',
};

class Game {
  constructor() {
    this.canvas = document.getElementById('game-canvas');
    this.renderer = createRenderer(this.canvas);
    this.scene = createScene();
    this.camera = createCamera();
    this.lights = createLights(this.scene);
    handleResize(this.renderer, this.camera);
    this.snow = createSnowField(this.scene);

    const { world, materials } = createWorld();
    this.world = world;
    this.materials = materials;

    this.ui = new UI();
    this.ui.onLevelPicked = (n) => this.startLevel(n);
    this.ui.onRestart = () => this.startLevel(this.currentLevelId);
    this.ui.onNext = () => this.startLevel(this.currentLevelId + 1);
    this.ui.onMenu = () => this.toMenu();

    // Ground plane (static, infinite-ish)
    this._addGround();

    // Input (slide bar, keyboard, charge) — needs callbacks into game state
    this.input = new Input({
      onTheta: (rad) => { if (this.orbit) this.orbit.setAngle(rad); },
      onChargeStart: () => {
        if (this.state === STATE.PLAYING) {
          this.launcher?.start();
          sfx.charge();
        }
      },
      onChargeEnd: () => {
        if (this.state === STATE.PLAYING && this.launcher?.charging) {
          const v = this.launcher.stop();
          this._launchSnowball(v);
          this.launcher.charging = false;
          this.ui.setPower(0);
          this._clearTrajectoryPreview();
        }
      },
    });

    this.state = STATE.MENU;
    this.ui.showMenu();
    this._startLoop();
  }

  _addGround() {
    const groundBody = new CANNON.Body({
      mass: 0,
      shape: new CANNON.Plane(),
      material: this.materials.ground,
    });
    groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
    groundBody.position.y = -0.05;
    this.world.addBody(groundBody);
    this.groundBody = groundBody;
  }

  // ── Level setup ──────────────────────────────────────────────────────────
  async startLevel(id) {
    const level = LEVELS[id - 1];
    if (!level) return;
    this.currentLevelId = id;
    this.ui.hideMenu();
    this.ui.hideResult();
    this.ui.showHud();

    this._clearLevel();
    this.ammo = level.ammo;
    this.ammoLeft = level.ammo;
    this.pigsTotal = level.pigs.length;
    this.pigsDown = 0;
    this.ui.setAmmo(this.ammoLeft);
    this.ui.setPigs(this.pigsTotal);

    // Orbit
    this.orbit = new Orbit({ radius: level.R, y: 0.5 });
    this.orbitCam = new OrbitCam(this.orbit, { dist: 5.5, height: 5.2 });
    this.launcher = new Launcher({ chargeTime: 1.2, vBase: 10, vBoost: 16, elevation: 42 });

    // Player snowman
    const playerChar = await loadFrostCharacter(THREE, {
      glbUrl: 'assets/characters/captain_snowman/captain_snowman.glb',
      albedoUrl: 'assets/characters/captain_snowman/captain_snowman_albedo.png',
      targetHeight: 1.6,
    });
    this.player = playerChar.root;
    this.player.scale.set(0.9, 0.9, 0.9);
    this.scene.add(this.player);
    this.playerGroup = new THREE.Group();
    this.playerGroup.add(this.player);
    this.scene.add(this.playerGroup);

    // Arena decoration
    const ring = await loadAsset('arena_ring');
    ring.scale.set(level.R, 1, level.R);
    ring.position.y = 0.05;
    this.scene.add(ring);
    await textureMesh(ring, 't_ice', { repeat: [3, 1], color: 0xbfe0ff });
    const ground = await loadAsset('prop_ground');
    ground.scale.set(level.R * 0.55, 1, level.R * 0.55);
    ground.position.y = -0.02;
    this.scene.add(ground);
    await textureMesh(ground, 't_snow_ground', { repeat: [4, 4], color: 0xffffff });

    // Fortress blocks
    this.blocks = [];
    for (const b of level.blocks) {
      const mesh = await loadAsset(`block_${b.material}`);
      const pos = [b.x, b.y + 0.4, b.z];
      const block = new Block({ material: b.material, mesh, position: pos, world: this.world, materials: this.materials });
      this.blocks.push(block);
      this.scene.add(mesh);
      // Texture by material type
      const texName = b.material === 'snow' ? 't_snow_ground' : b.material === 'ice' ? 't_ice' : 't_wood';
      const tint = b.material === 'snow' ? 0xffffff : b.material === 'ice' ? 0xbfe0ff : 0xd8b088;
      await textureMesh(mesh, texName, { repeat: [1, 1], color: tint });
    }

    // Decorative props (visual only, no collision — outside the play area)
    this.decor = [];
    if (level.decor) {
      for (const d of level.decor) {
        const prop = await loadAsset(d.kind);
        const s = d.s || 1;
        prop.scale.set(s, s, s);
        prop.position.set(d.x, 0, d.z);
        prop.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
        prop.userData.isLevelEntity = true;
        this.scene.add(prop);
        this.decor.push(prop);
      }
    }

    // Pigs
    this.pigs = [];
    for (const p of level.pigs) {
      const char = await loadFrostCharacter(THREE, {
        glbUrl: `assets/characters/pig_${p.variant}/pig_${p.variant}.glb`,
        albedoUrl: `assets/characters/pig_${p.variant}/pig_${p.variant}_albedo.png`,
        targetHeight: 1.0,
      });
      const mesh = char.root;
      const pos = [p.x, 0.5, p.z];
      // Robust spawn: avoid spawning inside blocks (push outward along z if overlapping)
      const pigHalf = 0.45;
      for (const b of level.blocks) {
        const bx = b.x, bz = b.z;
        const overlapX = Math.abs(p.x - bx) < 0.4 + pigHalf;
        const overlapZ = Math.abs(p.z - bz) < 0.4 + pigHalf;
        if (overlapX && overlapZ) {
          // push pig out along the axis away from block center (toward +z mostly)
          if (p.z >= bz) pos[2] = bz + 0.4 + pigHalf + 0.05;
          else pos[2] = bz - 0.4 - pigHalf - 0.05;
        }
      }
      const pig = new Pig({ variant: p.variant, mesh, position: pos, world: this.world, materials: this.materials });
      this.pigs.push(pig);
      this.scene.add(mesh);
    }

    // Delay kill-volume checks until physics settles (0.8s)
    this._killCheckDelay = 0.8;

    // Collision damage listeners
    this._bindCollisions();

    this.state = STATE.PLAYING;
  }

  _clearLevel() {
    // Remove any dynamic entities from previous level
    const toRemove = [];
    this.scene.traverse((obj) => {
      if (obj.userData?.isLevelEntity) toRemove.push(obj);
    });
    for (const o of toRemove) this.scene.remove(o);

    for (const b of this.blocks || []) {
      this.world.removeBody(b.body);
      this.scene.remove(b.mesh);
    }
    for (const p of this.pigs || []) {
      this.world.removeBody(p.body);
      this.scene.remove(p.mesh);
    }
    this.blocks = [];
    this.pigs = [];
    this.snowballs = [];
    this.ballBodies = [];
    if (this.player) { this.scene.remove(this.playerGroup); }
    if (this.ring) { this.scene.remove(this.ring); }
    if (this.groundMesh) { this.scene.remove(this.groundMesh); }
    this.trajectoryLine?.parent?.remove(this.trajectoryLine);
    this.trajectoryLine = null;
  }

  // ── Collisions / damage ──────────────────────────────────────────────────
  _bindCollisions() {
    if (this.collisionHandler) {
      this.world.removeEventListener('collide', this.collisionHandler);
    }
    this.collisionHandler = (e) => this._onCollide(e);
    this.world.addEventListener('collide', this.collisionHandler);
  }

  _onCollide(e) {
    const { body: a, body: b } = e;
    const impact = e.contact?.getImpactVelocityAlongNormal() ?? 0;
    const abs = Math.abs(impact);

    // Snowball hitting something
    const ballA = this._ballForBody(a);
    const ballB = this._ballForBody(b);
    const ball = ballA || ballB;
    if (ball) {
      const other = ballA ? b : a;
      if (abs >= 1.2) {
        // Damage target via its meta
        const dmg = Math.max(1, Math.round(abs / 5));
        const targetBlock = this.blocks.find((bl) => bl.body === other);
        if (targetBlock) {
          const gate = targetBlock.type === 'snow' ? 1.2 : targetBlock.type === 'ice' ? 2.0 : 3.2;
          if (abs >= gate) {
            const destroyed = targetBlock.takeDamage(dmg);
            if (destroyed) {
              this.scene.remove(targetBlock.mesh);
              this.world.removeBody(targetBlock.body);
              targetBlock.alive = false;
              sfx.crack();
            } else {
              sfx.thud();
            }
            this._markBall(ball);
          }
        }
        const targetPig = this.pigs.find((p) => p.body === other);
        if (targetPig) {
          if (abs >= 2.5) {
            const defeated = targetPig.takeDamage(dmg);
            if (defeated) {
              this._killPig(targetPig);
              sfx.poof();
            } else {
              sfx.thud();
            }
            this._markBall(ball);
          }
        }
      }
    }
  }

  _markBall(ball) {
    this.ballBodies = this.ballBodies.filter((bb) => bb !== ball.body);
    if (ball.mesh) this.scene.remove(ball.mesh);
    this.world.removeBody(ball.body);
  }

  _ballForBody(body) {
    return (this.snowballs || []).find((s) => s.body === body);
  }

  _killPig(pig) {
    if (!pig.alive) return;
    pig.alive = false;
    this.pigsDown++;
    this.scene.remove(pig.mesh);
    this.world.removeBody(pig.body);
    this.ui.setPigs(this.pigsTotal - this.pigsDown);
    // Squish poof visual: small particle burst (skip, sfx enough for v1)
    this._checkWin();
  }

  // ── Launch ───────────────────────────────────────────────────────────────
  _launchSnowball(velocity) {
    if (this.ammoLeft <= 0 || this.state !== STATE.PLAYING) return;
    this.ammoLeft--;
    this.ui.setAmmo(this.ammoLeft);

    loadFrostCharacter(THREE, {
      glbUrl: 'assets/characters/snowball_brave/snowball_brave.glb',
      albedoUrl: 'assets/characters/snowball_brave/snowball_brave_albedo.png',
      targetHeight: 0.75,
    }).then(({ root }) => {
      // Spawn at player position, slightly forward/up
      const pos = this.orbit.position();
      pos.y += 1.2;
      root.position.copy(pos);
      root.traverse((o) => { if (o.isMesh) { o.castShadow = true; } });
      root.userData.isLevelEntity = true;
      this.scene.add(root);
      const mesh = root;

      const body = new CANNON.Body({
        mass: 0.8,
        shape: new CANNON.Sphere(0.3),
        position: new CANNON.Vec3(pos.x, pos.y, pos.z),
        material: this.materials.default,
      });
      body.velocity.set(velocity.x, velocity.y, velocity.z);
      this.world.addBody(body);

      const ball = { body, mesh };
      this.snowballs.push(ball);
      sfx.launch();
    });
  }

  // ── Resolve / checks ─────────────────────────────────────────────────────
  _checkWin() {
    if (this.pigsDown >= this.pigsTotal) {
      this.state = STATE.RESULT;
      const stars = this.ammoLeft >= 3 ? 3 : this.ammoLeft >= 1 ? 2 : 1;
      sfx.win();
      const sub = `剩餘雪球 ${this.ammoLeft} / ${this.ammo}`;
      this.ui.showResult('勝利！', stars, sub);
      setTimeout(() => this.state = STATE.RESULT, 400);
    }
  }

  _checkLose() {
    if (this.ammoLeft <= 0 && this.pigsDown < this.pigsTotal) {
      // Only if no snowballs are still flying
      const anyFlying = (this.snowballs || []).length > 0;
      if (!anyFlying) {
        this.state = STATE.RESULT;
        sfx.lose();
        this.ui.showResult('輸咗…', 0, '用晒啲雪球，仲有豬仔未倒！');
        setTimeout(() => this.state = STATE.RESULT, 400);
      }
    }
  }

  _killVolumeCheck(dt) {
    // Delay so physics can settle after spawn (avoids spawn-overlap false kills)
    if (this._killCheckDelay > 0) {
      this._killCheckDelay -= dt;
      return;
    }
    // Pigs knocked out of kill volume (ring + y < -4) die
    for (const pig of this.pigs) {
      if (!pig.alive) continue;
      const p = pig.body.position;
      const dist = Math.sqrt(p.x * p.x + p.z * p.z);
      if (this.orbit?.radius && (dist > this.orbit.radius + 1.5 || p.y < -4)) {
        this._killPig(pig);
      }
    }
  }

  // ── Main loop ────────────────────────────────────────────────────────────
  _startLoop() {
    const clock = new THREE.Clock();
    const animate = () => {
      requestAnimationFrame(animate);
      const dt = Math.min(clock.getDelta(), 0.05);

      if (this.state === STATE.PLAYING || this.state === STATE.RESOLVE) {
        stepWorld(this.world, dt);
        this._updatePlaying(dt);
      } else if (this.state === STATE.MENU) {
        // Gentle camera drift in menu
        this.camera.position.x = 14 * Math.cos(this._menuT || 0);
        this.camera.position.z = 14 * Math.sin(this._menuT || 0);
        this.camera.position.y = 7;
        this.camera.lookAt(0, 0, 0);
        this._menuT = (this._menuT || 0) + dt * 0.15;
      }

      updateSnow(this.snow, dt);
      this.renderer.render(this.scene, this.camera);
    };
    animate();
  }

  _updatePlaying(dt) {
    // Slide-bar input → orbit target
    if (this.input) {
      const t = this.input._slideTarget;
      // (input writes target via callback)
    }

    // Orbit update + player placement
    const pos = this.orbit.update(dt);
    this.playerGroup.position.copy(pos);

    // Rotate snowman to face center (inward) — turret always faces target
    const look = new THREE.Vector3(-pos.x, 0, -pos.z).normalize();
    this.playerGroup.lookAt(look.clone().multiplyScalar(10));

    // Keyboard nudge
    if (this.input?.keys?.['KeyA']) this.orbit.setAngle(this.orbit.theta - dt * 2.2);
    if (this.input?.keys?.['KeyD']) this.orbit.setAngle(this.orbit.theta + dt * 2.2);

    // Aim direction: from player toward center, elevated
    const dir = new THREE.Vector3(-pos.x, 0, -pos.z).normalize();
    const aimDir = dir.clone().add(new THREE.Vector3(0, Math.tan(this.launcher.elevation), 0)).normalize();

    // Charge update (start/stop via callbacks; here we only update power + preview while holding)
    this.launcher.aim(aimDir);
    if (this.launcher.charging) {
      this.launcher.update(dt);
      this.ui.setPower(this.launcher.power);
      this._updateTrajectoryPreview(aimDir, this.launcher.power);
    }

    // Step bodies → meshes
    this._syncPhysics();
    // Snowball life
    this._updateSnowballs(dt);
    // Kill volume
    this._killVolumeCheck(dt);
    // Orbit camera
    this.orbitCam?.update(this.camera, dt);

    // Loss / win checks
    if (this.state === STATE.PLAYING) this._checkLose();
  }

  _syncPhysics() {
    for (const block of this.blocks || []) {
      if (block.body && block.mesh) {
        block.mesh.position.copy(block.body.position);
        block.mesh.quaternion.copy(block.body.quaternion);
      }
    }
    for (const pig of this.pigs || []) {
      if (pig.body && pig.mesh) {
        pig.mesh.position.copy(pig.body.position);
        pig.mesh.quaternion.copy(pig.body.quaternion);
      }
    }
    for (const ball of this.snowballs || []) {
      if (ball.body && ball.mesh) {
        ball.mesh.position.copy(ball.body.position);
        ball.mesh.quaternion.copy(ball.body.quaternion);
      }
    }
  }

  _updateSnowballs(dt) {
    this.snowballs = this.snowballs.filter((s) => {
      const p = s.body.position;
      const speed = s.body.velocity.length();
      // Remove if out of bounds / too slow after some time
      const oob = Math.abs(p.x) > 40 || Math.abs(p.z) > 40 || p.y < -8;
      const sleepy = speed < 0.3 && this.state === STATE.RESOLVE;
      if (oob || sleepy) {
        this.scene.remove(s.mesh);
        this.world.removeBody(s.body);
        return false;
      }
      return true;
    });
  }

  // ── Trajectory preview ───────────────────────────────────────────────────
  _updateTrajectoryPreview(aimDir, power) {
    if (!this.trajectoryLine) {
      const geo = new THREE.BufferGeometry().setFromPoints([]);
      const mat = new THREE.LineBasicMaterial({ color: 0xffdd88, transparent: true, opacity: 0.7 });
      this.trajectoryLine = new THREE.Line(geo, mat);
      this.scene.add(this.trajectoryLine);
    }
    const v = this.launcher.worldLaunchVector(power);
    const pts = [];
    const start = this.orbit.position();
    start.y += 1.2;
    let p = start.clone();
    const dt = 0.06;
    for (let i = 0; i < 30; i++) {
      p = p.clone().add(v.clone().multiplyScalar(dt));
      v.y -= 20 * dt;
      pts.push(p);
    }
    this.trajectoryLine.geometry.dispose();
    this.trajectoryLine.geometry = new THREE.BufferGeometry().setFromPoints(pts);
  }

  _clearTrajectoryPreview() {
    if (this.trajectoryLine) {
      this.scene.remove(this.trajectoryLine);
      this.trajectoryLine = null;
    }
  }

  // ── Menu ─────────────────────────────────────────────────────────────────
  toMenu() {
    this.state = STATE.MENU;
    this.ui.showMenu();
    this._clearLevel();
  }
}

// Boot when DOM ready
window.addEventListener('DOMContentLoaded', () => {
  window.game = new Game();
});
