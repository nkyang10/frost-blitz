import * as CANNON from 'cannon-es';

/**
 * Physics world setup (cannon-es).
 * Fixed-step integration; synchronous body→mesh update done by caller.
 */
export function createWorld() {
  const world = new CANNON.World({
    gravity: new CANNON.Vec3(0, -20, 0), // snappy, game-y gravity
  });
  world.broadphase = new CANNON.SAPBroadphase(world);
  world.allowSleep = true;

  // Material pairs
  const matDefault = new CANNON.Material('default');
  const matGround = new CANNON.Material('ground');
  const matSnow = new CANNON.Material('snow');
  const matIce = new CANNON.Material('ice');
  const matWood = new CANNON.Material('wood');
  const matPig = new CANNON.Material('pig');

  const pairs = [
    [matDefault, matDefault, 0.3, 0.1],
    [matDefault, matGround, 0.3, 0.2],
    [matDefault, matSnow, 0.3, 0.15],
    [matDefault, matIce, 0.3, 0.1],
    [matDefault, matWood, 0.3, 0.2],
    [matDefault, matPig, 0.3, 0.08],
    [matGround, matGround, 0.3, 0.1],
    [matSnow, matSnow, 0.3, 0.15],
    [matIce, matIce, 0.2, 0.08],
    [matWood, matWood, 0.25, 0.12],
    [matPig, matPig, 0.3, 0.05],
    [matGround, matSnow, 0.3, 0.2],
    [matGround, matIce, 0.3, 0.1],
    [matGround, matWood, 0.3, 0.2],
    [matGround, matPig, 0.3, 0.05],
    [matSnow, matIce, 0.3, 0.1],
    [matSnow, matWood, 0.3, 0.15],
    [matSnow, matPig, 0.3, 0.1],
    [matIce, matWood, 0.25, 0.1],
    [matIce, matPig, 0.25, 0.08],
    [matWood, matPig, 0.3, 0.1],
  ];
  for (const [a, b, friction, restitution] of pairs) {
    world.addContactMaterial(new CANNON.ContactMaterial(a, b, { friction, restitution }));
  }

  return { world, materials: { default: matDefault, ground: matGround, snow: matSnow, ice: matIce, wood: matWood, pig: matPig } };
}

export function stepWorld(world, dt) {
  // Fixed timestep with max substeps guard
  world.fixedStep = 1 / 120;
  world.step(world.fixedStep, dt, 4);
}
