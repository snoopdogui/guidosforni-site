# Session Notes — guidosforni.com → Next.js migration

_Last updated: 2026-09-10_

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

# gallery viewer regression test (needs the site already served)
node scripts/test-film-roll.mjs              # all 9 galleries, both view modes
node scripts/test-film-roll.mjs --width 390  # a narrower breakpoint
node scripts/test-film-roll.mjs --flicks transcendence
```

- Galleries scroll **horizontally**, one image per snap-locked frame; on desktop
  the vertical wheel is remapped to horizontal with an eased follow. Touch/swipe
  is native and untouched. Each gallery also has a **grid (masonry) mode**.
- Source scrape lives at `~/guidosforni-scraper/output/` (sitemap, content/*.md,
  images/, design-tokens.json, gallery-layout.json). Re-run scrapers there if
  source content changes:
  - `node scraper.js https://www.guidosforni.com/` (full crawl)
  - `node capture-geometry.js` (→ gallery-layout.json; the viewer now uses only
    the image **order** and the 720/781 sizing convention from this file, not
    the per-image scatter coordinates)

---

## Current state — built & verified

Design system (reverse-engineered via getComputedStyle across 1440/768/390):
- Tokens in `app/globals.css`. Dark is the original design and the default:
  black `#000` bg, warm-gray text `#9b9999`, bright `#d7cccc`, dim `#808080`
  (lifted from the original `#444` for AA), plus non-text tones `--border`
  / `--border-hover` / `--border-active` / `--surface` / `--rule`.
  `--maxw-content: 1000px` (site-wide), `--maxw-case: 1140px` (work case
  studies, gallery viewer, documentary).
- Fonts via `next/font`: **Libre Franklin** (≈ Benton Sans) + **Hanken Grotesk**
  (≈ Forma DJR) — free look-alikes, no licensing.
- `components/Header` (sticky; inline nav ≥768px, hamburger overlay below),
  `components/Footer`.

Routes (all prerender):
| Route | Type | Notes |
|---|---|---|
| `/` | Home | Hero image + name + section nav overlay |
| `/work` | **Card grid** | 3 case studies: thumbnail + title + date range + blurb. Grid/List toggle (client state) |
| `/work/[slug]` | Case study | **Row-based rebuild** of the original Format module layout. All 3 done |
| `/archive` | Listing | Hover-preview list (client) |
| `/archive/[slug]` | **Gallery** | Film-roll carousel + masonry grid mode. 9 galleries |
| `/documentary` | Page | Lead image, video-with-text row (click-to-play Vimeo), 2-col masonry |
| `/blog` | Listing | 3 essays: circular thumbnail + title + date |
| `/blog/[slug]` | Essay | 780px prose column |
| `/contact` | Page | mailto link |

### Theming — light / dark

Swapped via a `data-theme` attribute on `<html>`; **never** a CSS filter or
invert, which would wreck every photograph on the site.

- Dark palette under `:root`, light under `[data-theme='light']`. Each light
  value was *solved* to hit the same measured contrast ratio against the light
  background that its dark counterpart hits against black — not inverted:
  `--text` 7.41:1, `--text-bright` 13.4:1, `--text-dim` 5.31:1, and matching
  border/rule tones. Light `--bg` is `#f4f2f1` (warm off-white, not white).
- ⚠️ `--surface` is a deliberate exception: mirroring its ratio would land it
  *lighter* than the page, but an image placeholder must read as recessed on a
  light background, so it is `#eae7e6`.
- ⚠️ Non-text colours must be tokens. Five were hardcoded in CSS modules and
  stayed dark in light mode until fixed (toggle borders, grid cell borders, the
  writing-list divider, image placeholders). The play button over the video
  poster keeps fixed white-on-scrim — it sits on a photograph, not the page.
- `components/ThemeToggle.jsx` holds **no React state**: both icons always
  render and CSS picks one off `[data-theme]`, so server and client markup
  match. Deriving the icon from stored theme during render hydration-mismatches.
  `Header` returns the toggle alone on the homepage (which has no header bar).
- No-flash: a **synchronous inline `<script>` in `<head>`** in `layout.jsx`
  reads localStorage (falling back to `prefers-color-scheme`, then dark).
  `next/script` with `beforeInteractive` and a `useEffect` both run too late.
  `<html>` carries `suppressHydrationWarning` since the script mutates it.
- ⚠️ A blanket `img { filter: none }` guard is **not usable** — FilmRoll's focus
  falloff legitimately blurs off-centre frames. The invariant is instead: no
  `[data-theme]` selector may set a filter on an image. Verified by
  pixel-diffing the same photo regions across themes (grid thumbnails, roll
  frame, home hero — max channel delta 0) and by walking every image's ancestor
  chain for `filter`/`mix-blend-mode`.

### Work case studies — row-based layout system

The original Format pages are a stack of independent rows (`_4ORMAT_content_page_row`)
on a 12-column percentage grid (column 5.217%, gutter 3.4%), each row capped at
1140px with 38px horizontal padding — reproduced **pixel-exact** at 1440/768/390
(content box 188/1064, 38/692, 28/334).

`components/case/` holds the reusable blocks, one per Format module type:
- `CaseRow` row shell · `TwoColRow` (`layout_04/05/06`, 4/8 or 8/4, either order)
- `ProseRow` (`text_03`) · `ImageRow` (`image_01/05/11`, full or `width="inset"`, optional caption)
- `HeadlineRow` (`headline_01`, `variant="pull"`) · `NarrowRow` (`text_01`, 6col centred)
- `CaseTitle` (`size="xl"|"md"`, `align`) · `CaseSection` · `CaseNav`

Per-page compositions live in `app/work/[slug]/cases/`; `page.jsx` maps slug →
composition via `ROW_LAYOUTS`. **A new work item needs both a `WORKS` entry and
a composition file** — there is no prose fallback any more (it 404s otherwise).

`loadCase()` in `lib/server-content.js` splits scraped markdown by *position*,
not heading level: first `##` is the title, the subtitle is either a paragraph
under it (encode, arium) or a second `##` (london-cinema-map), everything after
is a section. Paragraphs come back as a **list** so a page can split them across
rows (a caption, a centred sign-off, a narrow credits block). `caseSection()`
normalises whitespace when matching headings — the arium has a non-breaking
space inside `What This Doesn't Resolve`.

### Galleries — film roll + grid

Two view modes per gallery, switched client-side by an action-labelled button in
the viewer toolbar (reads "Grid" while scrolling, "Roll" while in grid).

**Scroll mode** — `components/FilmRoll.jsx`:
- one image per slide, slide = full viewport width, CSS `scroll-snap-type: x
  mandatory` + `scroll-snap-align: center`; settles exactly on a frame
- images at natural size capped to the original Format convention:
  landscape `min(50vw, 720px)` (85vw below 768), portrait to the 781px strip
  height. Nothing upscaled, nothing cropped
- focus falloff: distance from centre → `--d` (0…1) written per frame from the
  scroll handler, driving opacity/blur/scale continuously
- desktop wheel remap: deltaY accumulates into a target, an exponential follow
  eases toward it. **Tuned constants** — `DELTA_PER_SLIDE = 850`,
  `COMMIT_FRACTION = 0.15`, `DEAD_DELTA = 40`, `TAU = 95ms`, `IDLE_MS = 110`
- directional commit: past 15% of a slide it commits forward rather than
  reversing; under `DEAD_DELTA` of wheel input it does not move at all
- snap must be suspended while we drive `scrollLeft` ourselves (`.freeScroll`),
  and only restored once parked on an exact stop — otherwise the browser's own
  nearest-snap overrides the commit
- **explicitly not wanted**: sprocket-hole decoration, film-grain texture

**Grid mode** — `components/GalleryGrid.jsx`: CSS multi-column masonry,
4 columns ≥1280 / 3 ≥768 / 2 below, consistent column width, natural aspect
ratio, nothing cropped, ragged bottom accepted. No dimming or blur — that
treatment is scroll-mode only. The frame scroll mode is centred on carries a
border; clicking any thumbnail returns to scroll mode centred on that image.

`components/GalleryViewer.jsx` owns mode + current-index state and renders the
toolbar (counter left, toggle right). `FilmRoll` reports its centred frame via
`onActiveChange` and accepts `initialIndex` — **which it reads once per mount
through a ref on purpose**: mirroring the reported index straight back into
`initialIndex` creates a feedback loop that yanks the roll mid-gesture.

**Next-gallery teasers.** Format ended most gallery strips with a preview frame
belonging to the NEXT gallery, rendered larger than the gallery's own photos
(1057–1327px wide against the usual 720px). `teaserFile(slug)` in
`lib/gallery.js` identifies it and `galleryFiles(slug)` excludes it, so it
appears only in the "Next" link — never as a roll frame or grid cell.

Detection is by **asset identity, not position**: the trailing frame counts as a
teaser only if the same photo also appears in the next gallery's own set. Two
galleries have none — transcendence and gentle-shifts end on a genuine photo of
their own — so removing the last frame unconditionally would delete two real
photographs. Frames per gallery after exclusion: loose-ends 4, ilmuro 5,
clarity 5, branco 5, soft-guidance 4, transcendence 12, ando 6, higher-land 5,
gentle-shifts 6 (52 frames + 7 teasers = all 59 gallery files still used).

⚠️ Identity must key on the **source filename** from the CDN URL, not the asset
UUID in its path: Format mints a fresh UUID per placement, so the same photo
carries different UUIDs in different galleries. Keying on the UUID silently
misses three of the seven teasers.

**Navigation.** `components/GalleryScreen.jsx` owns the view mode so that both
the viewer and the "Next" link see it (`GalleryViewer` is controlled). The mode
travels across gallery navigation as `?view=grid`, read after mount rather than
from server `searchParams` — the latter would opt the route out of static
generation and drop the images from the prerendered HTML. The nav is shared by
both modes; its links and the roll toolbar's Next link all use the same
12px/0.04em treatment. Roll mode carries an extra Next link in its toolbar
because the roll is up to 781px tall and its wheel handler claims vertical
scroll, making the foot-of-page nav hard to reach from there.

`lib/gallery.js` — `galleryFiles(slug)` is the single source of truth for image
order (both modes read it); `teaserFile(slug)` decides which trailing frame is
the next-gallery preview and excludes it; `placedFiles(slug)` backs the gallery
page's unused-image check. The teaser is no longer *displayed* anywhere — the
"Next" link is text-only.

### Writing list

Circular thumbnails on `/blog` (`app/blog/writing.module.css`), backed by
`public/images/blog-<slug>.jpeg`. Two post dates were corrected in `WRITINGS`:
the-algorithmic-auteur → April 6 2025, does-the-ai-race-produce-security →
November 24 2024. Those three JPEGs are full-size (1.2–2.3 MB each) and want
the same resize pass as the rest of `public/images`.

### Documentary

Rebuilt from the captured original (`_4ORMAT_module_video_with_text_04` +
`image_set_11`) after an earlier revert lost it:
- full-width lead image, then a 6/6 row — text left, video right
- `components/VimeoEmbed.jsx` — poster first, iframe (and any request to
  player.vimeo.com) only after a click. Poster at
  `public/images/documentary-poster.jpg`
- masonry image set as a 2-column CSS grid: two landscapes stacked in one
  column, the portrait in the other, equal `--doc-gap` gutter on both axes,
  natural aspect ratios. Single column under 768px
- container is `--maxw-case`, not `--maxw-content` — that's the row box the
  original used (measured 188/1064 at 1440, 38/692 at 768)

Redirects (`next.config.mjs`): legacy numeric URLs (`/14358097` etc.) → `/archive`;
`/photography` → `/archive`; `/writing` → `/blog`.

---

## NOT done yet (known TODOs)

1. **Image optimization** — `next.config.mjs` has `images.unoptimized: true` and
   images are the raw 3–5 MB scraped originals (209 MB across 96 files in
   `public/images`), including three 1.2–2.3 MB writing-list thumbnails. Grid mode now loads every image in a gallery at once, so
   this bites harder than it used to. Before production: enable Next/Vercel
   image optimization or add a resize/compress step, and switch `<img>` →
   `next/image` where sensible.
2. **Lightbox / zoom** — no fullscreen or zoomed view in either mode. Grid mode
   partly covers "see everything at once", but there's still no way to view a
   single image larger than its frame.
3. **The arium's "Full concept deck" is dead text** — the original linked a
   Format-hosted PDF (`4ormat-asset.s3.amazonaws.com/…/the-arium.pdf`) that was
   never scraped. Download it into `public/` and re-point the link.
4. **Two work date ranges are inferred, not confirmed** — see the comment above
   `WORKS` in `lib/content.js`. Only the arium states a date in its markdown.
5. **The Vimeo embed returns 401** — `player.vimeo.com/video/769580233` is
   rejected regardless of referer or user agent (the vimeo.com page itself is
   200), so the documentary video will not play until its embed privacy is
   changed on Vimeo, or an unlisted hash (`&h=…`) is added to the URL. The
   click-to-play mechanism itself is verified working.
6. **Text proofreading** — body text is auto-extracted from scraped markdown via
   a minimal md→html renderer (`lib/markdown.js`). Not proofread; essay
   bibliographies especially need a pass. Case-study and gallery images now have
   real `alt` text, but blog/documentary/archive-listing images do not.

---

## Open questions / judgement calls to confirm

1. **Grid mode reading order is column-major.** CSS multi-column fills
   top-to-bottom, so the eye goes down column 1 then down column 2 — image order
   from `galleryFiles()` is preserved in the DOM but not read left-to-right.
   Row-major masonry needs a JS-measured layout. Confirm this is acceptable for
   a curated sequence.
2. **`soft-guidance` renders 3 columns at 1440**, not 4 — CSS column balancing
   with 5 images and one tall portrait. Cosmetic, inherent to the technique.
3. **Gentle scrolls between 40 and ~128 cumulative deltaY still ease back** to
   the starting frame rather than committing. Dropping `COMMIT_FRACTION` to 0.10
   would advance anything above ~85. One-line change if it still feels wrong.
4. **Nav label inconsistency** — the homepage uses the original section labels
   ("work / documentary / photography / writing"), but the header + canonical nav
   use "Work / Archive / Documentary / Writing / Contact". Decide on one vocabulary.
5. **Essay text merges** — a few scraped bibliography entries are concatenated
   onto one line in the source markdown (e.g. `…FSG originals.Hu, T., …` in
   the-algorithmic-auteur), so they render as one run-on paragraph.
6. **Archive hover preview** — fixed `aspect-ratio: 3/2` crops portrait covers;
   on first load it statically shows item #1's cover until you hover.
7. **Header treatment** — original inner pages used a hamburger even on desktop;
   the rebuild shows full inline nav on desktop (deliberate a11y improvement).
8. **Fonts are approximations** — Libre Franklin / Hanken Grotesk are close but
   not identical to Benton Sans / Forma DJR; the letter-spaced "GUIDO SFORNI"
   wordmark is hand-tuned, not exact.

---

## Key files

```
app/
  globals.css              # design tokens + dark/light palettes ([data-theme])
  layout.jsx               # fonts, Header/Footer shell, pre-paint theme script
  work/page.jsx            # card-grid index (server) + WorkIndex.jsx (client toggle)
  work/[slug]/page.jsx     # slug → row composition (ROW_LAYOUTS)
  work/[slug]/cases/       # one file per case study, composed from components/case
  archive/[slug]/page.jsx  # renders GalleryScreen
components/
  Header.jsx / Footer.jsx
  ThemeToggle.jsx          # light/dark switch, no React state (client)
  ArchiveList.jsx          # hover-preview archive listing (client)
  GalleryScreen.jsx        # owns view mode + gallery nav, ?view=grid (client)
  GalleryViewer.jsx        # controlled mode, current-index, toolbar (client)
  FilmRoll.jsx             # snap carousel, wheel remap, focus falloff (client)
  GalleryGrid.jsx          # masonry thumbnail sheet (client)
  VimeoEmbed.jsx           # poster-first click-to-play embed (client)
  case/                    # reusable case-study row components
lib/
  content.js               # nav + WORKS (slug/title/dates/blurb) / GALLERIES / WRITINGS
  server-content.js        # fs loaders: loadBody(), loadCase(), caseSection(), imagesFor()
  gallery.js               # galleryFiles(), teaserFile(), placedFiles()
  markdown.js              # tiny md→html
  gallery-layout.json      # captured geometry (now used for image order only)
scripts/
  test-film-roll.mjs       # CDP harness: sizing, snap, falloff, grid, --flicks
content/                   # scraped *.md (raw; chrome stripped at render time)
public/images/             # 96 images (UNOPTIMIZED, 209 MB)
next.config.mjs            # redirects + images.unoptimized
```

**Deleted along the way** (don't go looking for them): `components/GalleryFilmstrip.jsx`
and its CSS (the scatter canvas, replaced by FilmRoll), and
`app/work/[slug]/case.module.css` plus the legacy lead-image + prose renderer.
