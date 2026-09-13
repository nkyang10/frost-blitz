/**
 * Level definitions (data-driven; tuning moved here per architecture).
 * Layouts are fortress designs: each block occupies a grid cell around center.
 * x,z in world units; y = stack height (0 = ground level).
 * Pigs sit on/behind blocks.
 */
export const LEVELS = [
  {
    id: 1,
    name: 'First Frost',
    ammo: 3,
    R: 6,
    star3: 3, star2: 2,
    pigs: [{ variant: 'coldtooth', x: 0, z: 1.65 }],
    blocks: [
      { material: 'snow', x: -0.8, z: 0.8, y: 0 },
      { material: 'snow', x: 0, z: 0.8, y: 0 },
      { material: 'snow', x: 0.8, z: 0.8, y: 0 },
      { material: 'snow', x: 0, z: 0.8, y: 1 },
    ],
    decor: [
      { kind: 'prop_pine', x: -2.4, z: 1.8, s: 0.8 },
      { kind: 'prop_pine', x: 2.4, z: 1.8, s: 0.8 },
      { kind: 'prop_igloo', x: -3.2, z: -0.6, s: 0.9 },
    ],
  },
  {
    id: 2,
    name: 'Ring of Ice',
    ammo: 4,
    R: 7,
    star3: 2, star2: 3,
    pigs: [
      { variant: 'coldtooth', x: -1.0, z: 1.0 },
      { variant: 'coldtooth', x: 1.0, z: 1.0 },
    ],
    blocks: [
      { material: 'snow', x: -1.0, z: 0.4, y: 0 },
      { material: 'snow', x: 1.0, z: 0.4, y: 0 },
      { material: 'ice', x: 0, z: 0.4, y: 0 },
    ],
    decor: [
      { kind: 'prop_pine', x: -1.8, z: -2.2, s: 0.9 },
      { kind: 'prop_pine', x: 1.8, z: -2.2, s: 0.9 },
    ],
  },
  {
    id: 3,
    name: 'Three-Ring Circus',
    ammo: 4,
    R: 8,
    star3: 2, star2: 3,
    pigs: [
      { variant: 'coldtooth', x: -0.8, z: 1.0 },
      { variant: 'squeak', x: 0.8, z: 1.0 },
    ],
    blocks: [
      { material: 'snow', x: -0.8, z: 0.3, y: 0 },
      { material: 'snow', x: 0.8, z: 0.3, y: 0 },
      { material: 'wood', x: 0, z: 0.3, y: 1 }, // roof
    ],
    decor: [
      { kind: 'prop_pine', x: -2.2, z: 1.9, s: 0.8 },
      { kind: 'prop_pine', x: 2.2, z: 1.9, s: 0.8 },
    ],
  },
  {
    id: 4,
    name: 'Frostworks',
    ammo: 5,
    R: 8,
    star3: 3, star2: 4,
    pigs: [
      { variant: 'coldtooth', x: -1.2, z: 0.9 },
      { variant: 'grumpa', x: 0, z: 1.4 },
      { variant: 'squeak', x: 1.2, z: 0.9 },
    ],
    blocks: [
      { material: 'snow', x: -1.2, z: 0.3, y: 0 },
      { material: 'ice', x: 0, z: 0.3, y: 0 },
      { material: 'snow', x: 1.2, z: 0.3, y: 0 },
      { material: 'wood', x: 0, z: 0.3, y: 1 },
    ],
    decor: [
      { kind: 'prop_igloo', x: -3.0, z: 1.5, s: 0.9 },
      { kind: 'prop_pine', x: 3.0, z: 1.5, s: 0.9 },
    ],
  },
  {
    id: 5,
    name: 'Pig Palace',
    ammo: 5,
    R: 9,
    star3: 3, star2: 4,
    pigs: [
      { variant: 'grumpa', x: 0, z: 1.4 },
      { variant: 'coldtooth', x: -1.2, z: 0.8 },
      { variant: 'coldtooth', x: 1.2, z: 0.8 },
    ],
    blocks: [
      { material: 'ice', x: -0.8, z: 0.2, y: 0 },
      { material: 'ice', x: 0.8, z: 0.2, y: 0 },
      { material: 'wood', x: 0, z: 0.2, y: 0 },
      { material: 'wood', x: 0, z: 0.2, y: 1 },
    ],
    decor: [
      { kind: 'prop_pine', x: -2.8, z: 1.8, s: 1.0 },
      { kind: 'prop_pine', x: 2.8, z: 1.8, s: 1.0 },
      { kind: 'prop_igloo', x: 1.8, z: -2.4, s: 0.9 },
    ],
  },
  {
    id: 6,
    name: 'The Big Chill',
    ammo: 6,
    R: 10,
    star3: 3, star2: 4,
    pigs: [
      { variant: 'grumpa', x: 0, z: 1.6 },
      { variant: 'coldtooth', x: -1.2, z: 0.8 },
      { variant: 'coldtooth', x: 1.2, z: 0.8 },
      { variant: 'squeak', x: 0, z: -0.2 },
    ],
    blocks: [
      { material: 'wood', x: -1.2, z: 0.2, y: 0 },
      { material: 'wood', x: 1.2, z: 0.2, y: 0 },
      { material: 'ice', x: 0, z: 0.2, y: 0 },
      { material: 'snow', x: 0, z: 0.2, y: 1 },
    ],
    decor: [
      { kind: 'prop_pine', x: -2.4, z: -2.2, s: 1.0 },
      { kind: 'prop_igloo', x: 2.4, z: -2.2, s: 1.0 },
    ],
  },
];
