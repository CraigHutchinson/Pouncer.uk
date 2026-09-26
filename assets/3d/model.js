/**
 * The Pouncer module, as geometry.
 *
 * This is a tag, not a watch: there is no display, no crystal and no index
 * ring. The face exists to carry a lens, an acoustic port and a seal. Every
 * dimension below is a proportion chosen to look right, NOT a specification —
 * the real part has no published dimensions yet, and this file must never be
 * cited as though it does.
 *
 * Units are arbitrary (the disc is 1.0 across); the viewer frames to fit.
 */

import * as THREE from 'three';
import { makeFaceTextures, makeBrushedRoughness } from './textures.js';

export const PALETTE = {
  case:   0xcfcabf,  // machined aluminium
  face:   0x243f32,  // dark polymer face
  lens:   0xe0992f,  // amber alert lens
  piezo:  0xa98f4e,  // brass sounder, knocked back
  board:  0x17402f,  // circuit board, desaturated
  cell:   0xb9bfc8,  // cell
  back:   0x253e30,  // caseback
  strap:  0x345340,  // forest-green collar webbing
};

/** One layer of the stack: mesh, plus the height it settles at when exploded. */
function layer(name, mesh, explodedY, label) {
  mesh.name = name;
  mesh.userData.explodedY = explodedY;
  mesh.userData.label = label;
  return mesh;
}

export function buildModule() {
  const group = new THREE.Group();
  const parts = [];

  const metal = (color, roughness = 0.34) =>
    new THREE.MeshStandardMaterial({ color, metalness: 1.0, roughness });
  const polymer = (color, roughness = 0.55) =>
    new THREE.MeshStandardMaterial({ color, metalness: 0.0, roughness });

  const R = 0.5;

  // --- caseback, with the channel the strap passes through -----------------
  const back = new THREE.Mesh(new THREE.CylinderGeometry(R, R * 0.96, 0.042, 96), polymer(PALETTE.back, 0.6));
  back.position.y = -0.040;
  parts.push(layer('caseback', back, -0.95, 'Caseback — clips to a standard quick-release strap'));

  // --- cell ----------------------------------------------------------------
  const cell = new THREE.Mesh(new THREE.CylinderGeometry(R * 0.58, R * 0.58, 0.028, 72), metal(PALETTE.cell, 0.42));
  cell.position.y = -0.008;
  parts.push(layer('cell', cell, -0.55, 'Cell — user-replaceable, not sealed in'));

  // --- board, with a couple of components ----------------------------------
  const board = new THREE.Group();
  const pcb = new THREE.Mesh(new THREE.CylinderGeometry(R * 0.84, R * 0.84, 0.014, 72), polymer(PALETTE.board, 0.7));
  board.add(pcb);
  const chip = (w, d, x, z) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, 0.016, d), polymer(0x15181d, 0.6));
    m.position.set(x, 0.015, z);
    return m;
  };
  board.add(chip(0.16, 0.12, -0.13, 0.05));   // microcontroller
  board.add(chip(0.08, 0.08, 0.12, -0.04));   // accelerometer
  board.position.y = 0.013;
  parts.push(layer('board', board, -0.17, 'Board — accelerometer at 100 Hz, MCU, event log'));

  // --- piezo sounder -------------------------------------------------------
  const piezo = new THREE.Group();
  piezo.add(new THREE.Mesh(new THREE.CylinderGeometry(R * 0.62, R * 0.62, 0.010, 72), metal(PALETTE.piezo, 0.3)));
  const dome = new THREE.Mesh(new THREE.CylinderGeometry(R * 0.28, R * 0.28, 0.014, 48), metal(0xa8811c, 0.35));
  dome.position.y = 0.008;
  piezo.add(dome);
  piezo.position.y = 0.028;
  parts.push(layer('piezo', piezo, 0.28, 'Piezo sounder — aimed forward, shielded toward the cat'));

  // --- face plate: lens aperture and acoustic port, cut as real holes ------
  const faceShape = new THREE.Shape();
  faceShape.absarc(0, 0, R * 0.92, 0, Math.PI * 2, false);

  const lensHole = new THREE.Path();
  lensHole.absarc(0, -R * 0.46, R * 0.11, 0, Math.PI * 2, true);
  faceShape.holes.push(lensHole);

  for (let ring = 0; ring < 3; ring++) {
    const rad = R * (0.26 + ring * 0.10);
    const count = 7 + ring * 2;
    for (let i = 0; i < count; i++) {
      const a = Math.PI / 2 + (i / (count - 1) - 0.5) * 1.25;
      const h = new THREE.Path();
      h.absarc(Math.cos(a) * rad, Math.sin(a) * rad, R * 0.022, 0, Math.PI * 2, true);
      faceShape.holes.push(h);
    }
  }

  const face = new THREE.Group();
  const faceTex = makeFaceTextures();
  const faceMat = new THREE.MeshPhysicalMaterial({
    color: 0xffffff, map: faceTex.map, roughnessMap: faceTex.roughnessMap,
    metalness: 0.0, roughness: 0.52, clearcoat: 0.35, clearcoatRoughness: 0.30,
  });
  const facePlate = new THREE.Mesh(
    new THREE.ExtrudeGeometry(faceShape, { depth: 0.018, bevelEnabled: true, bevelSize: 0.004, bevelThickness: 0.004, bevelSegments: 2, curveSegments: 64 }),
    faceMat
  );
  facePlate.rotation.x = -Math.PI / 2;
  facePlate.position.y = 0.018;
  face.add(facePlate);

  const lens = new THREE.Mesh(new THREE.SphereGeometry(R * 0.085, 40, 24, 0, Math.PI * 2, 0, Math.PI / 2),
    new THREE.MeshStandardMaterial({ color: PALETTE.lens, metalness: 0.1, roughness: 0.18,
                                     emissive: 0x3a2200, emissiveIntensity: 0.0 }));
  lens.position.set(0, 0.020, R * 0.46);
  face.add(lens);
  face.position.y = 0.030;
  parts.push(layer('face', face, 0.70, 'Face — amber alert lens, acoustic port'));

  // --- bezel ring ----------------------------------------------------------
  const bezelMat = new THREE.MeshPhysicalMaterial({
    color: PALETTE.case, metalness: 1.0, roughness: 0.3,
    roughnessMap: makeBrushedRoughness(), anisotropy: 0.85, anisotropyRotation: Math.PI / 2,
  });
  const bezel = new THREE.Mesh(new THREE.TorusGeometry(R * 0.965, 0.021, 24, 180), bezelMat);
  bezel.rotation.x = Math.PI / 2;
  bezel.position.y = 0.030;
  parts.push(layer('bezel', bezel, 1.02, 'Bezel — machined aluminium retaining ring'));

  parts.forEach((p) => { p.userData.restY = p.position.y; group.add(p); });
  group.userData.parts = parts;
  return group;
}

/** Strap passing behind the module. Decorative context, not part of the stack. */
export function buildStrap() {
  const mat = new THREE.MeshStandardMaterial({ color: PALETTE.strap, metalness: 0.0, roughness: 0.85 });
  const strap = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.030, 0.44), mat);
  strap.position.y = -0.070;
  strap.name = 'strap';
  return strap;
}
