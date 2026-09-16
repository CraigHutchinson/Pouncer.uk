/**
 * Scroll-driven module stage.
 *
 * Progressive enhancement, in this order:
 *   1. No JavaScript      -> the SVG poster and the exploded SVG, as today.
 *   2. JS, no WebGL       -> same. Nothing is lost.
 *   3. Reduced motion     -> 3D loads only on request, and scroll never drives it.
 *   4. Full              -> the canvas pins while the section scrolls, and
 *                           scroll position drives the module apart and back.
 *
 * three.js is only fetched when the stage is close to the viewport AND the
 * visitor has not asked for reduced motion. It is 2.1 MB; it is never part of
 * the initial page load, and the page is complete without it.
 */

const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;

function webglAvailable() {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch { return false; }
}

function initStage(stage) {
  const track = stage.closest('[data-module-track]') || stage.parentElement;
  // The caption and hint sit beside the stage, not inside it, so look them up
  // from the sticky wrapper rather than from the stage element.
  const scope = stage.closest('.module-sticky') || stage.parentElement || stage;
  const canvasHost = stage.querySelector('[data-stage-canvas]');
  const poster = stage.querySelector('[data-stage-poster]');
  const caption = scope.querySelector('[data-stage-caption]');
  const button = stage.querySelector('[data-stage-load]');
  const captions = (stage.dataset.captions || '').split('|');

  if (!webglAvailable()) {
    if (button) button.remove();
    return;                                   // poster stays; nothing is lost
  }

  let viewer = null;
  let loading = false;

  function progress() {
    // 0 while the track's top is at the viewport top, 1 once it has scrolled
    // its full height past. Clamped, so overscroll does not invert it.
    const r = track.getBoundingClientRect();
    const usable = r.height - innerHeight;
    if (usable <= 0) return 0;
    return Math.min(1, Math.max(0, -r.top / usable));
  }

  function paintCaption(t) {
    if (!caption || !captions.length) return;
    const i = Math.min(captions.length - 1, Math.floor(t * captions.length));
    if (caption.textContent !== captions[i]) caption.textContent = captions[i];
  }

  let ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      ticking = false;
      const t = progress();
      if (viewer) viewer.setExploded(t);
      paintCaption(t);
    });
  }

  async function load() {
    if (loading || viewer) return;
    loading = true;
    if (button) { button.disabled = true; button.textContent = 'Loading…'; }
    try {
      const { mountViewer } = await import('../3d/viewer.js');
      viewer = await mountViewer(canvasHost, {
        exploded: REDUCED ? 0 : progress(),
        autoRotate: !REDUCED,
        background: null,
      });
      stage.dataset.state = 'live';
      if (poster) poster.setAttribute('aria-hidden', 'true');
      if (button) button.remove();
      if (!REDUCED) {
        addEventListener('scroll', onScroll, { passive: true });
        addEventListener('resize', onScroll, { passive: true });
        onScroll();
      }
    } catch (err) {
      // A failed enhancement must never remove what was already working.
      stage.dataset.state = 'failed';
      if (button) { button.disabled = false; button.textContent = 'View in 3D'; }
      console.warn('[module-stage] 3D unavailable, poster retained:', err);
    } finally {
      loading = false;
    }
  }

  if (button) button.addEventListener('click', load);

  // Reduced motion never autoloads: it waits to be asked.
  if (!REDUCED) {
    const io = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) { io.disconnect(); load(); }
    }, { rootMargin: '600px 0px' });
    io.observe(stage);
  }
}

export function initModuleStages() {
  document.querySelectorAll('[data-module-stage]').forEach(initStage);
}

if (document.readyState === 'loading') {
  addEventListener('DOMContentLoaded', initModuleStages);
} else {
  initModuleStages();
}
