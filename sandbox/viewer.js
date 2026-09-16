/**
 * Reusable 3D viewer for the Pouncer module.
 *
 * Designed to be dropped anywhere on the site:
 *
 *   import { mountViewer } from './viewer.js';
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
  renderer.toneMappingExposure = 1.05;
  el.appendChild(renderer.domElement);
  renderer.domElement.style.display = 'block';
  renderer.domElement.style.width = '100%';
  renderer.domElement.style.height = '100%';

  const scene = new THREE.Scene();
  if (background !== null) scene.background = new THREE.Color(background);

  // Procedural environment: believable metal with no HDRI to download.
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
  camera.position.set(1.22, 0.58, 1.52);

  const key = new THREE.DirectionalLight(0xffffff, 2.1);
  key.position.set(-1.4, 2.2, 1.6);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xbcd0ff, 0.9);
  rim.position.set(1.8, 0.6, -1.9);
  scene.add(rim);

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
  const BASE = camera.position.clone().normalize();
  const BASE_DIST = camera.position.length();

  function applyExplode() {
    // Ease so the stack settles rather than sliding linearly.
    const e = t * t * (3 - 2 * t);
    for (const p of parts) {
      p.position.y = p.userData.restY + (p.userData.explodedY - p.userData.restY) * e;
    }
    strap.visible = t < 0.2;
    strap.position.y = -0.070 - e * 0.5;
    // Pull the camera back as the stack spreads, so nothing leaves the frame.
    const want = BASE_DIST * (1 + 0.88 * e);
    const dir = camera.position.clone().sub(controls.target).normalize();
    camera.position.copy(controls.target).add(dir.multiplyScalar(want));
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
    if (running) frame(); else cancelAnimationFrame(raf);
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
      pmrem.dispose(); renderer.dispose();
      if (renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement);
    },
  };
  if (onReady) onReady(api);
  return api;
}
