# Pouncer.uk

The public website for **Pouncer** — a collar module that detects a cat's
stalk-and-launch signature and sounds a single short cue at the moment of
intent, to give birds and small mammals a head start.

Live at [pouncer.uk](https://pouncer.uk).

## What this is

Static HTML, CSS, SVG and vanilla JavaScript. No build step, no bundler, no
framework, no third-party script, font or stylesheet. Every asset is served
from this repository, which keeps the site fast, private and free of consent
banners.

```
index.html              # the landing page
preorder/index.html     # reserve page — join the list, no checkout
404.html                # served by Pages on a bad path
CNAME                   # custom domain
.nojekyll               # do not run Jekyll over this folder
robots.txt, sitemap.xml
assets/
  css/styles.css        # single stylesheet, light and dark themes
  js/main.js            # progressive enhancement only
  img/                  # SVG logo, favicon, hero diagram, social card
AGENTS.md               # conventions — read before changing copy
```

## Run it locally

```sh
python3 -m http.server 8000
# then open http://localhost:8000/
```

Opening `index.html` from the filesystem also works; a server is only needed to
make paths behave exactly as they do in production.

## Before you change anything

Read [`AGENTS.md`](AGENTS.md). It is written for AI assistants but applies to
everyone: it carries the claim rules, the tone, the UK English requirement and
the technical constraints. The claim rules are not stylistic preferences —
several statements are deliberately absent from this site because no
measurement supports them yet.

Two sections are load-bearing and should not be trimmed to improve conversion:
**"What works — and what we haven't proven"**, which publishes the evidence
including the result that cat bells had no discernible effect, and **"Where
Pouncer actually is"**. Both exist to be trusted rather than to convert.

## Relative links

All internal links are relative (`../assets/…`), never root-absolute
(`/assets/…`), so the site works at the domain root, at a project-pages
subpath, and from the filesystem. `404.html` is the sole exception and uses
root-absolute paths, because Pages serves it from arbitrary URLs.

## Email signup

Both the landing page and the reserve page carry a signup form with an empty
`data-endpoint` attribute, so nothing is posted anywhere by default and no
address is silently discarded — `main.js` falls back to composing a message to
`hello@pouncer.uk`.

GitHub Pages is static and cannot receive a form post, so wiring this up means a
third-party endpoint (Buttondown, Formspree, Mailchimp or similar). Set the
attribute on **both** forms to an endpoint accepting `POST {"email": "..."}`:

```html
<form class="signup" id="signup-form" data-endpoint="https://…/subscribe" novalidate>
```

### Before the signup form goes live

`privacy/` exists and is linked from both forms and every footer. It is written
for what the site does **today** — no cookies, no trackers, no third-party
subresources, and a form that opens your mail app rather than posting anywhere.
Three things must be completed before an address is stored by a provider:

1. **Name the provider** under "Who else sees it", and have a data-processing
   agreement with them.
2. **Add the registered legal entity and postal address** under "Contact". A
   trading name and an email address are not sufficient for a UK notice once you
   are actually processing data. There is an HTML comment at that spot.
3. **Wire a real unsubscribe** — a working link in every message, not a reply-to
   request.

Update the "Last updated" date in the same change. If the claim that the site
sets no cookies ever stops being true — an embed, a hosted font, an analytics
script — that section must change in the same commit that makes it untrue.

## WhatsApp

Set `WHATSAPP_NUMBER` at the top of `assets/js/main.js` to the number in
international format, digits only, no `+` and no spaces:

```js
var WHATSAPP_NUMBER = "447700900123";
```

While it is empty the WhatsApp card stays hidden on every page, so the site
cannot ship a dead `wa.me` link. Setting it reveals the card and builds the link
with a pre-filled message. Note that a `wa.me` link exposes the number to anyone
who views the page — use a business number, not a personal one.

## The prey-composition chart

The stacked bar on the landing page uses a categorical palette declared as
`--series-*` tokens on `.viz-root` in `styles.css`. The dark values are the same
hues re-stepped for the dark surface, not an automatic flip.

Those hues were validated for lightness band, chroma floor, colour-vision
separation, normal-vision separation and surface contrast in both modes. If you
change them, re-validate rather than eyeballing — and keep the visible value
labels, which are what satisfies the light-mode contrast relief rule.

## Deployment

`.github/workflows/pages.yml` publishes this repository to GitHub Pages on every
push to `main`.

`README.md` and `AGENTS.md` are for people working here, not for visitors, so
the workflow stages a copy of the repository, excludes them, and **fails the
build if any markdown file is left in the publish set**. A new repository
document therefore cannot leak onto the site by being forgotten. Add anything
repository-only to that exclusion list when you add it here.

### First-time setup

1. **Enable Pages by hand, once.** Settings → Pages → Build and deployment →
   Source: **GitHub Actions**. Every deploy fails until this is done, at the
   `Setup Pages` step with "Get Pages site failed".

   This cannot be automated here. `configure-pages` has an `enablement: true`
   input for exactly this case, and it was tried: the workflow's `GITHUB_TOKEN`
   is not permitted to create a Pages site on this account, so the run fails
   with "Create Pages site failed / Resource not accessible by integration"
   instead. The flag is deliberately absent, and the workflow comments say so.
2. **The custom domain claims itself.** The `CNAME` file in the published
   artifact sets `pouncer.uk` as the custom domain on the first successful
   deploy. That happens before you point any DNS at GitHub, which is the order
   that matters: DNS pointing at GitHub while no repository claims the domain is
   what allows someone else to host a site on it. Check the domain has appeared
   under Settings → Pages before doing the next step.
3. **Create the DNS records.** Four `A` records at the apex:

   ```
   185.199.108.153
   185.199.109.153
   185.199.110.153
   185.199.111.153
   ```

   Plus a `CNAME` for `www` pointing at `<user>.github.io`. GitHub also
   publishes `AAAA` records for IPv6 — take those from
   [the GitHub Pages documentation](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site),
   and check the addresses above against that page too, since they are GitHub's
   to change.

   Avoid wildcard DNS records for this domain: they expose it to takeover even
   once verified.
4. **Enable "Enforce HTTPS"** once the certificate has been issued.

## Action versions

The deploy workflow pins major tags, currently `checkout@v7`,
`configure-pages@v6`, `upload-pages-artifact@v5` and `deploy-pages@v5`. All four
run on Node 24; the earlier majors ran on Node 20, which Actions has deprecated.

One input is load-bearing rather than cosmetic. From v4 onwards
`upload-pages-artifact` adds `--exclude=.[^/]*` to its tar unless
`include-hidden-files: true` is set, so without it `.nojekyll` is silently
dropped from the artifact — v3 excluded only `.git` and `.github`. If you bump
that action again, check its `action.yml` for changes to that input before
trusting the upgrade.

## The 3D module viewer

`assets/3d/` holds a vendored three.js and a small viewer the product section
uses to take the module apart as you scroll. `sandbox/` is the bench for working
on it and is excluded from the published site.

Three rules keep it honest, and they are not negotiable:

1. **It never loads on page load.** three.js is 2.1 MB; it is fetched only when
   the stage nears the viewport, and not at all under `prefers-reduced-motion`,
   where it waits for a button press instead.
2. **It is vendored, never a CDN.** `privacy/` states that the site fetches
   nothing from a third party. A CDN request would make that false.
3. **It is an enhancement.** The SVG poster renders first and stays as the
   fallback. No JavaScript, no WebGL, or reduced motion all end at the poster,
   and no content lives only inside the canvas.

## Browser support

Modern evergreen browsers. Layout uses CSS grid and `color-mix()`; the header
tint degrades gracefully where `color-mix()` is unsupported. Dark mode follows
the operating system preference, and `prefers-reduced-motion` disables smooth
scrolling and transitions.

## Licence

There is deliberately no licence file, so the default applies: all rights
reserved. Add one if you want the copy, design or assets to be reusable —
that is a decision for the owner, not a default worth guessing at.
