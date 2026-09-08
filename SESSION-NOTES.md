# Session Notes — guidosforni.com → Next.js migration

_Last updated: 2026-07-15_

Rebuild of the Format site `guidosforni.com` as a Next.js (App Router) site.
Source content/images/design-tokens were scraped into `~/guidosforni-scraper/output/`
and copied into this repo. This file is the handoff for resuming work.

---

## Resume commands

```bash
cd ~/guidosforni-site
npm install        # if node_modules is missing
npm run dev        # dev server → http://localhost:3000 (hot reload)
npm run build      # production build (currently: 24/24 static pages OK)
npm run start      # serve the production build
```

- Galleries scroll **horizontally** (trackpad swipe / shift+wheel).
- Source scrape lives at `~/guidosforni-scraper/output/` (sitemap, content/*.md,
  images/, design-tokens.json, gallery-layout.json). Re-run scrapers there if
  source content changes:
  - `node scraper.js https://www.guidosforni.com/` (full crawl)
  - `node capture-geometry.js` (gallery scatter coordinates → gallery-layout.json)

---

## Current state — built & verified

Design system (reverse-engineered via getComputedStyle across 1440/768/390):
- Tokens in `app/globals.css`: black `#000` bg, warm-gray text `#9b9999`,
  bright `#d7cccc`, dim `#808080` (lifted from original `#444` for AA), type
  scale, spacing.
- Fonts via `next/font`: **Libre Franklin** (≈ Benton Sans) + **Hanken Grotesk**
  (≈ Forma DJR) — free look-alikes, no licensing.
- `components/Header` (sticky; inline nav ≥768px, hamburger overlay below),
  `components/Footer`.

Routes (all prerender; verified visually against original screenshots):
| Route | Type | Notes |
|---|---|---|
| `/` | Home | Hero image + name + section nav overlay |
| `/work` | Listing | 3 case studies |
| `/work/[slug]` | Case study | Lead image + prose + stacked images. Slugs: google-ai-campus-x-encode, london-cinema-map, 14358210-the-arium |
| `/archive` | Listing | Hover-preview list (client) |
| `/archive/[slug]` | **Gallery** | Horizontal-scroll canvas, exact scatter from captured geometry. 9 galleries |
| `/documentary` | Text page | Morgan's Wave + stills |
| `/blog` | Listing | 3 essays w/ dates |
| `/blog/[slug]` | Essay | 780px prose column |
| `/contact` | Page | mailto link |

Galleries — confirmed model + coverage:
- Original = **continuous horizontal scroll, all images in one `.gallery-assets`
  canvas** (PerfectScrollbar `ps-active-x`). NOT prev/next pagination.
- Rebuilt with exact per-breakpoint px coordinates (`lib/gallery-layout.json`),
  fixed 781px strip height, `overflow-x` scroll.
- **Every downloaded image is placed** (verified 0 unplaced): loose-ends 5,
  ilmuro/clarity/branco/higher-land/gentle-shifts 6 each, soft-guidance 5,
  ando 7, transcendence 12.

Redirects (`next.config.mjs`): legacy numeric URLs (`/14358097` etc.) → `/archive`;
`/photography` → `/archive`; `/writing` → `/blog`.

---

## NOT done yet (known TODOs)

1. **Image optimization** — `next.config.mjs` has `images.unoptimized: true` and
   images are the raw 3–5 MB scraped originals (226 MB total in `public/images`).
   Galleries load heavy (e.g. transcendence canvas is 11290px wide × 12 images).
   Before production: enable Next/Vercel image optimization or add a resize/
   compress step, and switch `<img>` → `next/image` where sensible.
2. **Lightbox** — clicking a gallery image does nothing. No zoom/fullscreen view.
3. **Work-page inline image layout** — extra case-study images just stack in a
   plain column below the prose (`app/work/[slug]/case.module.css` `.gallery`).
   Needs real art direction / placement.
4. **Text proofreading** — body text is auto-extracted from scraped markdown via
   a minimal md→html renderer (`lib/markdown.js`). Not proofread. Essay
   bibliographies especially need a pass (see observations below). Add real
   `alt` text to images (currently generic "Title — N").

---

## Things that looked off today — TO FIX NEXT TIME

### ⚠️ Your list didn't come through
The message that set up this file ended with a literal placeholder
(`[describe the specific things that looked off]`) — the actual list was empty.
**Add your observations here when you resume:**

- _(your item 1)_
- _(your item 2)_
- _(…)_

### Claude's observations (candidates — verify against your intent)
These are things I noticed that may or may not match what you saw:

1. **Nav label inconsistency** — the homepage uses the original section labels
   ("work / documentary / photography / writing"), but the header + canonical
   nav use "Work / Archive / Documentary / Writing / Contact". So "photography"
   (home) and "Archive" (header) point to the same section under different names,
   likewise "writing" vs "Writing". Decide on one vocabulary.
2. **Essay text merges** — a few scraped bibliography entries are concatenated
   onto one line in the source markdown (e.g. `…FSG originals.Hu, T., …` in
   the-algorithmic-auteur), so they render as one run-on paragraph. The md
   renderer also doesn't format citations/footnotes. Needs cleanup.
3. **Gallery horizontal-scroll discoverability** — there's no visible affordance
   that the gallery scrolls sideways; mouse-wheel (non-trackpad) users may not
   realize there's more. Consider a scroll hint / progress indicator / arrows.
4. **Archive hover preview** — fixed `aspect-ratio: 3/2` crops portrait covers;
   on first load it statically shows item #1's cover until you hover.
5. **Header treatment** — original inner pages used a hamburger even on desktop;
   the rebuild shows full inline nav on desktop (deliberate a11y improvement).
   Confirm that's wanted.
6. **Fonts are approximations** — Libre Franklin / Hanken Grotesk are close but
   not identical to Benton Sans / Forma DJR; the letter-spaced "GUIDO SFORNI"
   wordmark is hand-tuned, not exact.

---

## Key files

```
app/                       # App Router pages (+ *.module.css per route)
  globals.css              # design tokens
  layout.jsx               # fonts + Header/Footer shell
components/
  Header.jsx / Footer.jsx
  GalleryFilmstrip.jsx     # horizontal-scroll gallery (reads gallery-layout.json)
  ArchiveList.jsx          # hover-preview archive listing (client)
lib/
  content.js               # nav + WORKS/GALLERIES/WRITINGS data (client-safe)
  server-content.js        # fs loaders: loadBody(), imagesFor() (server-only)
  markdown.js              # tiny md→html
  gallery-layout.json      # captured per-breakpoint scatter geometry
content/                   # scraped *.md (raw; chrome stripped at render time)
public/images/             # 102 downloaded originals (UNOPTIMIZED)
next.config.mjs            # redirects + images.unoptimized
```
```
