/** Optional, user-controlled 3D. The static concept stays available without JS. */
function initStage(stage) {
  const scope = stage.closest('.module-sticky');
  const button = stage.querySelector('[data-stage-load]');
  const caption = scope.querySelector('[data-stage-caption]');
  const controls = scope.querySelector('.module-controls');
  const slider = scope.querySelector('[data-stage-explode]');
  const captions = stage.dataset.captions.split('|');
  let viewer;
  button.addEventListener('click', async () => {
    button.disabled = true;
    button.textContent = 'Loading…';
    try {
      const { mountViewer } = await import('../3d/viewer.js');
      viewer = await mountViewer(stage.querySelector('[data-stage-canvas]'), {
        exploded: 0, autoRotate: false, background: null,
      });
      stage.dataset.state = 'live';
      stage.querySelector('[data-stage-poster]').setAttribute('aria-hidden', 'true');
      controls.hidden = false;
      slider.focus({ preventScroll: true });
      button.remove();
    } catch (err) {
      stage.dataset.state = 'failed';
      button.disabled = false;
      button.textContent = 'Try 3D again';
      caption.textContent = '3D unavailable — the concept illustration is shown.';
    }
  });
  slider.addEventListener('input', () => {
    const value = Number(slider.value);
    viewer?.setExploded(value);
    caption.textContent = captions[Math.min(captions.length - 1, Math.floor(value * captions.length))];
  });
}
export function initModuleStages() {
  document.querySelectorAll('[data-module-stage]').forEach(initStage);
}
initModuleStages();
