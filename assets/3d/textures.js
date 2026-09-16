/**
 * Procedurally generated textures.
 *
 * Drawn on a canvas at runtime rather than shipped as image files: it keeps the
 * repository free of binary assets, and more importantly it means the viewer
 * still fetches nothing from anywhere — the privacy page says the site loads
 * nothing from a third party, and that has to stay true of the 3D path too.
 */

import * as THREE from 'three';

function canvas(size) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  return [c, c.getContext('2d')];
}

/**
 * The face: concentric turning marks left by a lathe, plus the engraved mark.
 * Returns { map, roughnessMap }.
 */
export function makeFaceTextures(size = 1024) {
  const [cMap, g] = canvas(size);
  const mid = size / 2;

  g.fillStyle = '#1b2338';
  g.fillRect(0, 0, size, size);

  // Concentric turning: fine alternating rings, densest toward the rim.
  for (let r = 4; r < mid; r += 3) {
    const a = 0.030 + 0.022 * Math.abs(Math.sin(r * 0.21));
    g.beginPath(); g.arc(mid, mid, r, 0, Math.PI * 2);
    g.strokeStyle = `rgba(255,255,255,${a.toFixed(3)})`;
    g.lineWidth = 1.1; g.stroke();
    g.beginPath(); g.arc(mid, mid, r + 1.5, 0, Math.PI * 2);
    g.strokeStyle = `rgba(0,0,0,${(a * 0.8).toFixed(3)})`;
    g.lineWidth = 1.1; g.stroke();
  }

  // Engraved wordmark, sunk into the face.
  g.save();
  g.translate(mid, mid + size * 0.075);
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = `500 ${Math.round(size * 0.062)}px Georgia, 'Times New Roman', serif`;
  g.letterSpacing = `${Math.round(size * 0.014)}px`;
  g.fillStyle = 'rgba(0,0,0,0.55)';
  g.fillText('POUNCER', 0, Math.round(size * 0.004));
  g.fillStyle = 'rgba(190,205,235,0.62)';
  g.fillText('POUNCER', 0, 0);
  g.restore();

  // Roughness: the engraving and the turning catch light differently.
  const [cR, r2] = canvas(size);
  r2.fillStyle = '#6e6e6e';
  r2.fillRect(0, 0, size, size);
  for (let r = 4; r < mid; r += 3) {
    r2.beginPath(); r2.arc(mid, mid, r, 0, Math.PI * 2);
    r2.strokeStyle = `rgba(255,255,255,${(0.10 + 0.08 * Math.abs(Math.sin(r * 0.21))).toFixed(3)})`;
    r2.lineWidth = 1.2; r2.stroke();
  }
  r2.save();
  r2.translate(mid, mid + size * 0.075);
  r2.textAlign = 'center'; r2.textBaseline = 'middle';
  r2.font = `500 ${Math.round(size * 0.062)}px Georgia, 'Times New Roman', serif`;
  r2.letterSpacing = `${Math.round(size * 0.014)}px`;
  r2.fillStyle = 'rgba(40,40,40,1)';
  r2.fillText('POUNCER', 0, 0);
  r2.restore();

  const mk = (c) => {
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
    // ExtrudeGeometry maps front faces straight from shape x/y, so remap that
    // range onto 0..1 rather than rebuilding the UVs.
    // Shape coords run about -0.47..0.47, so scale then shift to land on 0..1.
    // The transform is u' = (u - center)*repeat + center + offset, so center
    // must be 0 here — with center at 0.5 the result goes negative and clamps
    // to an edge pixel, which renders as a flat untextured face.
    t.center.set(0, 0);
    t.repeat.set(1 / 0.94, 1 / 0.94);
    t.offset.set(0.5, 0.5);
    return t;
  };
  const map = mk(cMap);
  const roughnessMap = mk(cR);
  roughnessMap.colorSpace = THREE.NoColorSpace;
  return { map, roughnessMap };
}

/** Radial brushing for the bezel, as a roughness map. */
export function makeBrushedRoughness(size = 512) {
  const [c, g] = canvas(size);
  g.fillStyle = '#4a4a4a';
  g.fillRect(0, 0, size, size);
  // The torus UV runs around the ring in u, so vertical streaks become radial
  // brushing once wrapped.
  for (let x = 0; x < size; x++) {
    const v = 0.30 + Math.random() * 0.34;
    g.fillStyle = `rgba(255,255,255,${v.toFixed(3)})`;
    g.fillRect(x, 0, 1, size);
    if (Math.random() > 0.72) {
      g.fillStyle = `rgba(0,0,0,${(Math.random() * 0.35).toFixed(3)})`;
      g.fillRect(x, 0, 1, size);
    }
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.NoColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(3, 1);
  t.anisotropy = 8;
  return t;
}
