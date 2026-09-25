/**
 * Reusable 3D viewer for the Pouncer module.
 *
 * Designed to be dropped anywhere on the site:
 *
 *   import { mountViewer } from '/assets/3d/viewer.js';
 *   const v = await mountViewer(el, { exploded: 0, autoRotate: true });
 *   v.setExploded(1);   v.dispose();
 *
 * Rules this file has to respect, because the site depends on them:
 *  - three.js is vendored locally and imported through an import map. It must
 *    never be loaded from a CDN: the privacy page states that nothing is
 *    fetched from a third party, and a CDN would make that false.
 *  - Nothing here runs unless the caller asks. The page must render, read and
 *    make sense with this module never loaded at all.
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { buildModule, buildStrap } from './model.js';

const REDUCED = typeof matchMedia === 'function'
  && matchMedia('(prefers-reduced-motion: reduce)').matches;

export function webglAvailable() {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch { return false; }
}

export async function mountViewer(el, opts = {}) {
  const {
    exploded = 0,
    autoRotate = !REDUCED,
    background = null,       // null = transparent, lets the page show through
    pixelRatioCap = 2,
    onReady = null,
  } = opts;

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: background === null });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, pixelRatioCap));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.85;
  el.appendChild(renderer.domElement);
  renderer.domElement.style.display = 'block';
  renderer.domElement.style.width = '100%';
  renderer.domElement.style.height = '100%';

  const scene = new THREE.Scene();
  if (background !== null) scene.background = new THREE.Color(background);

  // Procedural environment: believable metal with no HDRI to download.
  const pmrem = new THREE.PMREMGenerator(renderer);
  const environment = new RoomEnvironment();
  const environmentTarget = pmrem.fromScene(environment, 0.04);
  scene.environment = environmentTarget.texture;
  scene.environmentIntensity = 0.75;
  environment.dispose();

  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
  camera.position.set(1.22, 0.58, 1.52);

  // Studio rig: a broad key, a soft fill to keep the shadow side readable, and
  // two rims to put a defined edge on the bezel, which is what sells machined
  // metal. RoomEnvironment alone left everything flat.
  const key = new THREE.DirectionalLight(0xfff6e8, 1.8);
  key.position.set(-1.5, 2.4, 1.5);
  scene.add(key);
  const fill = new THREE.DirectionalLight(0xe9efdf, 0.75);
  fill.position.set(1.6, 0.9, 2.2);
  scene.add(fill);
  const rimA = new THREE.DirectionalLight(0xd5e4cd, 1.0);
  rimA.position.set(2.0, 0.5, -1.9);
  scene.add(rimA);
  const rimB = new THREE.DirectionalLight(0xffd9a8, 1.1);
  rimB.position.set(-1.9, 0.35, -1.7);
  scene.add(rimB);

  const root = new THREE.Group();
  const module = buildModule();
  const strap = buildStrap();
  root.add(strap, module);
  scene.add(root);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.07;
  controls.enablePan = false;
  controls.minDistance = 1.1;
  controls.maxDistance = 4.0;
  controls.autoRotate = autoRotate;
  controls.autoRotateSpeed = 0.9;
  controls.target.set(0, 0, 0);

  let t = exploded;
  const parts = module.userData.parts;
  const BASE_DIST = camera.position.length();
  const SPH = new THREE.Spherical();
  const PHI_CLOSED = Math.acos(camera.position.y / BASE_DIST);   // low, product angle
  const PHI_OPEN = PHI_CLOSED * 0.60;                            // higher, diagram angle

  function applyExplode() {
    // Ease so the stack settles rather than sliding linearly.
    const e = t * t * (3 - 2 * t);
    for (const p of parts) {
      p.position.y = p.userData.restY + (p.userData.explodedY - p.userData.restY) * e;
    }
    strap.visible = t < 0.2;
    strap.position.y = -0.070 - e * 0.5;

    // Rise and pull back as the stack spreads. A low angle flatters the
    // assembled disc but foreshortens the gaps between layers, so the exploded
    // end of the scrub is viewed from higher up where the separation reads.
    // Azimuth is taken from wherever the visitor has dragged to, so orbiting
    // still works while the scroll drives the rest.
    SPH.setFromVector3(camera.position.clone().sub(controls.target));
    SPH.phi = PHI_CLOSED + (PHI_OPEN - PHI_CLOSED) * e;
    SPH.radius = BASE_DIST * (1 + 1.05 * e);
    camera.position.copy(controls.target).add(new THREE.Vector3().setFromSpherical(SPH));
    controls.update();
  }
  applyExplode();

  function resize() {
    const w = el.clientWidth || 1, h = el.clientHeight || 1;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  resize();
  const ro = new ResizeObserver(resize);
  ro.observe(el);

  let raf = 0, running = true;
  function frame() {
    if (!running) return;
    raf = requestAnimationFrame(frame);
    controls.update();
    renderer.render(scene, camera);
  }
  frame();

  // Stop work when the viewer is off-screen: a marketing page should not spin
  // a GPU for a canvas nobody is looking at.
  const io = new IntersectionObserver(([e]) => {
    running = e.isIntersecting;
    cancelAnimationFrame(raf);
    if (running) frame();
  }, { threshold: 0.01 });
  io.observe(el);

  const api = {
    setExploded(v) { t = Math.max(0, Math.min(1, v)); applyExplode(); },
    getExploded() { return t; },
    setAutoRotate(v) { controls.autoRotate = !!v; },
    resetView() { camera.position.set(1.22, 0.58, 1.52); controls.target.set(0,0,0); controls.update(); },
    partLabels() { return parts.map((p) => ({ name: p.name, label: p.userData.label })); },
    renderer, scene, camera, controls, module,
    dispose() {
      running = false; cancelAnimationFrame(raf);
      io.disconnect(); ro.disconnect(); controls.dispose();
      scene.traverse((o) => {
        if (o.geometry) o.geometry.dispose();
        if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => m.dispose());
      });
      environmentTarget.dispose(); pmrem.dispose(); renderer.dispose();
      if (renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement);
    },
  };
  if (onReady) onReady(api);
  return api;
}
