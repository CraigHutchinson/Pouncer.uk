# Sandbox — module viewer

A workbench for the WebGL module viewer, kept out of the published site.

## Why it is separate

The viewer is a real dependency decision, not a graphic. It brings 2.1 MB of
vendored three.js and a GPU context onto a marketing page that currently ships
no third-party code at all. That deserves to be built and judged somewhere it
cannot accidentally ship.

## Run it

```sh
python3 -m http.server 8000     # from the repository root
# then open http://localhost:8000/sandbox/
```

## Constraints it has to satisfy

1. **three.js is vendored**, in `vendor/`, and imported through the import map
   in `index.html`. It must never be loaded from a CDN: `privacy/` states that
   the site fetches nothing from a third party, and a CDN request would make
   that false. Same reason there is no hosted font.
2. **It loads on demand.** 2.1 MB unminified is far too much to put in front of
   someone reading a landing page, so on a real page the SVG poster renders
   first and the viewer loads only when the visitor asks for it.
3. **It is an enhancement.** Every page must read and work with this module
   never loaded — no content lives only inside the canvas.
4. **No build step.** Plain ES modules, served as-is, consistent with the rest
   of the site.
5. **It stops when off-screen.** The render loop pauses via `IntersectionObserver`
   rather than spinning a GPU for a canvas nobody is looking at.

## Files

| File | What it is |
|---|---|
| `model.js` | The module as geometry: caseback, cell, board, piezo, face, bezel |
| `viewer.js` | `mountViewer(el, opts)` — the reusable piece meant for the site |
| `index.html` | The bench: assembled, exploded, and the SVG side by side |
| `vendor/` | three.js, OrbitControls, RoomEnvironment, and the three.js licence |

## The proportions are not specifications

`model.js` contains numbers because geometry needs numbers. They were chosen to
look right. **They are not dimensions**, nothing has been measured, and no
figure from this file may be published as a specification — see the claim rules
in `../Claude.md`.

## Where it actually stands

The setup works. `mountViewer()` is reusable, the explode is a single
`setExploded(0..1)` call, it loads in roughly 300 ms once three.js is fetched,
draws in 11 calls, pauses when off-screen and disposes cleanly.

**The model is not yet good enough to ship.** Judged against the SVG sitting
beside it on the bench:

- the exploded 3D view is now clear and well separated, and is arguably the
  better teaching image — but the SVG version costs no JavaScript at all and
  already does that job on the page today;
- the assembled 3D view is *worse* than the SVG. It reads as a plain moulded
  disc, without the machined turning, the brushed bezel grain or the engraved
  mark that make the SVG look like a considered object;
- the materials are flat. A procedural room environment is not enough for
  convincing anodised aluminium, and the board green and brass read as toy
  colours against the site's restrained palette.

So the honest position is: the harness is ready, the asset is not, and nothing
should go on a real page until the 3D view beats the picture it would replace.

## Open questions before this goes on the site

- Does it beat the SVG by enough to justify the download and the GPU?
- Does the exploded transition explain the parts better than the SVG diagram,
  which is currently doing that job well and costs nothing?
- What does it look like on a low-end phone, where SwiftShader or a weak GPU
  may make it worse than the poster?
