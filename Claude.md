# Instructions for AI Assistants — Pouncer.uk

This repository is the **public marketing website** for Pouncer, a collar module
that detects a cat's stalk-and-launch signature and sounds a single short cue at
the moment of intent. It is static HTML, CSS, SVG and vanilla JavaScript with no
build step, published to GitHub Pages at [pouncer.uk](https://pouncer.uk).

Read this alongside [`README.md`](README.md), which covers running and deploying
the site.

---

## Critical: Repository Self-Containment

**This repository must be fully self-contained.**

- Do **not** reference the private product repository in any source file, link
  or document.
- Do **not** use relative paths to sibling repositories.
- Do **not** reference local filesystem paths.
- Do **not** name private repositories, unreleased internals, firmware
  architecture or supplier details anywhere in this repository.

The engineering decisions summarised below are reproduced here in full for that
reason. Treat this file as the authority for anything published on this site.

---

## Critical: claims are gated on evidence

This is the rule that matters most here, and it is not a stylistic preference.
The product makes a conservation claim, and the programme has committed to not
making that claim until a controlled trial supports it.

**Never add to this site:**

- a percentage reduction in prey caught, or any "saves N birds" figure, before a
  controlled trial supports it;
- a claim that Pouncer beats bells, collar covers, dietary change or play — the
  *mechanism* by which a bell has zero warning time may be explained, but a
  comparative outcome may not be claimed;
- a claim that cat predation is driving bird population declines;
- a warning lead time or latency figure for Pouncer itself. The prey-side number
  (~80 ms startle onset in starlings) is published and attributable; our own
  detection latency is not yet measured;
- that the device learns or adapts to an individual cat in the present tense.
  Per-cat calibration is roadmap, not shipped: "the event log is being designed
  for it now" is the acceptable phrasing;
- a final alert frequency, sound pressure level, or "inaudible to humans" claim.
  Human and avian hearing sensitivity overlap around 2–5 kHz, so "silent to
  people" is not available as a claim;
- battery life, range, weight or waterproof ratings as measured facts. They are
  design commitments until verified, and must be worded as commitments;
- Find My or Find My Device compatibility. iBeacon advertising is not a route
  into either network;
- a shipping date, a price, or a committed companion platform beyond "Windows or
  Android". When pricing does appear it is always qualified as an estimate
  (`~£XX (estimated)`) until manufacturing volumes fix it.

**Every figure on the site is attributed** in the "Where these numbers come
from" section. If a number cannot be attributed, it does not go on the page. Do
not add a statistic from memory — find the source, cite it, or leave it out.

### The evidence the site is built on

| Claim on the site | Source |
|---|---|
| ~92m prey items brought home by UK cats, Apr–Aug; 57m mammals, 27m birds, 5m reptiles and amphibians; ≥44 wild bird species | Woods, McDonald & Harris (2003), *Mammal Review* |
| Diet −36%, play −25%, collar cover −42% birds and no effect on mammals, bells no discernible effect, puzzle feeders +33% | Cecchetti et al. (2021), *Current Biology* |
| US mortality estimates; un-owned cats cause the majority | Loss, Will & Marra (2013), *Nature Communications* |
| No clear evidence cat predation drives UK bird declines | RSPB |
| ~80 ms startle onset to sound in starlings | Stephen (1977), *Animal Behaviour* |

### Two sections that must not be removed

**"What works — and what we haven't proven"** publishes the intervention table,
including the row showing cat bells had no discernible effect — the closest
tested analogue to an acoustic collar alert. **"Where Pouncer actually is"**
separates what is built from what is not yet claimed.

Both hurt conversion in the short term and are the reason the site is credible.
The audience has been sold unproven wildlife gadgets before. Do not remove
either to raise conversion.

### The bell argument (withdrawn — do not restore it)

An earlier version of this site argued that a bell's warning time is "zero by
construction" because the acceleration that rings it *is* the pounce. **That is
wrong, and it is wrong in the direction that flatters us.** A bell has no
detector and no confirmation window, so it spends essentially no time deciding:
its lead time is approximately the whole launch-to-contact interval, which is
the *largest* lead time any collar-mounted cue can have. Pouncer is necessarily
worse on timing, because it must detect and confirm before it emits.

Never write, imply, or reinstate any of the following:

- that a bell warns "too late", "at the moment of contact", or "never";
- that a cue landing with the strike is "just a bell";
- any comparative timing claim between Pouncer and a bell. We have not measured
  one.

**What may be said.** Bells showed no discernible effect on prey brought home
(Cecchetti et al. 2021). Why is unknown and the trial was not designed to answer
it. The project's hypothesis is about *salience and evasion*, not timing: a bell
rings during all movement and is omnidirectional, where Pouncer's cue is rare
and aimed forward; and a bell responds to gait, which a cat can quieten at no
cost, where Pouncer responds to the launch, which a cat cannot suppress without
abandoning the pounce. Label that as a hypothesis every time.

**The 80 ms figure is still load-bearing**, but as a budget on us, not as an
argument against bells: a startled bird needs roughly 80 ms just to begin
reacting, so detection and confirmation latency is taken directly from the
animal. Where the budget cannot be met, the device logs the event and stays
silent (ADR-0008). Moving the audio cue earlier into the stalk is **not** an
available answer — ADR-0004 permits audio only after a confirmed launch.

Hard limit: none of this is evidence that Pouncer works, and it must never be
written as though it were. The site says so explicitly, and that sentence
stays.

---

## Tone and language

- **UK English throughout**: colour, behaviour, recognise, licence (noun),
  customise. Use `£`.
- Warm, accurate, benefit-led, written for a general audience. The reader cares
  about wildlife and loves their cat; they are not a firmware engineer.
- **Never blame the cat.** Hunting is normal, healthy behaviour. No guilt, no
  panic imagery, no dead-bird photography, no predation-crisis rhetoric.
- Say "birds and small mammals", not just birds — mammals are roughly two thirds
  of prey brought home. Name them where it helps: bird, vole, shrew.
- Expect the objection *"but I want the mice caught"*. Answer it honestly: the
  prey are mostly native species rather than commensal rats and house mice, and
  the device cannot tell one small mammal from another anyway. Do not argue the
  owner out of their feelings about rodents.

---

## Technical conventions

- **No build step, ever.** No framework, no CSS preprocessor, no bundler, no npm
  install. If a change seems to need one, it does not belong on this site.
- **No third-party scripts, fonts or stylesheets.** Everything is served from
  this repository. This is not only a performance choice: `privacy/` states as
  fact that the site sets no cookies, loads nothing from third parties and needs
  no consent banner. Adding an embed, a hosted font, an analytics snippet or a
  tracking pixel makes that page false — so it must be updated in the same
  commit, and the consent question reopened.
- **Relative links only** (`../assets/…`, never `/assets/…`), so the site works
  at the domain root, at a project-pages subpath, and from the filesystem.
  `404.html` is the sole exception and uses root-absolute paths, because Pages
  serves it from arbitrary URLs.
- **JavaScript is enhancement only.** Every page must read and work with scripts
  blocked. Never put content behind JS.
- **Dark mode** follows the OS setting; define colours as tokens on `:root` and
  redefine them under `prefers-color-scheme: dark`. Give new components both.
- **Accessibility is not optional**: visible focus states, real headings in
  order, labels on inputs, `prefers-reduced-motion` respected, and no horizontal
  scroll at 390px.
- The prey-composition chart's hues are a validated categorical palette. If you
  change them, re-validate rather than eyeballing, and keep the visible value
  labels — they satisfy the light-mode contrast relief rule.
- **Product renders carry their own caveat.** The module images are concept
  renders of hardware that does not exist yet, so the PRELIMINARY marker lives
  *inside the SVG*, not in the surrounding HTML — an image gets screenshotted,
  hotlinked and pasted into threads without its caption, and the claim has to
  survive that. Any new product render needs the same marker, and all of them
  get replaced by photographs once there is a real object to photograph.
- **The 3D viewer is an enhancement with a hard budget.** `assets/3d/` carries a
  vendored three.js (2.1 MB) and is imported through the import map in
  `index.html`. It must never load on page load, never come from a CDN, and
  never hold content that exists nowhere else. The SVG poster is what most
  visitors see and is the only thing guaranteed to render: no JavaScript, no
  WebGL, or reduced motion all stop at the poster, and nothing is lost.
- **Design language: the object is a disc, machined, not a watch** — case, bezel,
  dial, caseback. The renders are drawn as SVG so they stay sharp on any
  display; keep it that way rather than reaching for a raster export or a WebGL
  viewer fetched from elsewhere.
- **Nothing published may reveal repository-only material.** The deploy workflow
  excludes `README.md` and `Claude.md` and fails if any markdown file remains in
  the publish set. Extend that exclusion list when you add a repository
  document.

---

## Before committing a change here

1. Serve it: `python3 -m http.server 8000`.
2. Check both themes and both widths (1280px and 390px).
3. Check the console is clean and nothing overflows horizontally.
4. Re-read any new sentence against the claim list above.

---

**Applies to:** the Pouncer.uk repository only.
