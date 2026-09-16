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
Claude.md               # conventions — read before changing copy
```

## Run it locally

```sh
python3 -m http.server 8000
# then open http://localhost:8000/
```

Opening `index.html` from the filesystem also works; a server is only needed to
make paths behave exactly as they do in production.

## Before you change anything

Read [`Claude.md`](Claude.md). It is written for AI assistants but applies to
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

Anything that stores addresses needs a privacy notice and a working
unsubscribe before it goes live. Add both in the same change.

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

`README.md` and `Claude.md` are for people working here, not for visitors, so
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

## Browser support

Modern evergreen browsers. Layout uses CSS grid and `color-mix()`; the header
tint degrades gracefully where `color-mix()` is unsupported. Dark mode follows
the operating system preference, and `prefers-reduced-motion` disables smooth
scrolling and transitions.

## Licence

There is deliberately no licence file, so the default applies: all rights
reserved. Add one if you want the copy, design or assets to be reusable —
that is a decision for the owner, not a default worth guessing at.
