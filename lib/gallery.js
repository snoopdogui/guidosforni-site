// Pure gallery helpers (no Node built-ins, no fs) — safe to import anywhere.
import layout from './gallery-layout.json';
import { GALLERIES } from './content';

// Images for a gallery, ordered left-to-right from the widest captured
// breakpoint (order is identical across 1440/768/390). The per-image px
// coordinates that drove the old scatter canvas are dropped.
function orderedImages(gallerySlug) {
  const data = layout[`archive-${gallerySlug}`];
  const set = data?.['1440'] ?? data?.['768'] ?? data?.['390'];
  if (!set?.images?.length) return [];
  return [...set.images].sort((a, b) => a.left - b.left);
}

// Identity of the underlying photo, independent of which gallery placed it.
//
// Use the source filename out of the Format CDN URL, NOT the asset UUID in the
// path: Format mints a fresh UUID per placement, so the same photo carries
// different UUIDs in different galleries (loose-ends' teaser and its copy in
// ilmuro share `Image+1+%282%29.jpg` but nothing else). The filename survives.
function assetKey(im) {
  const src = im?.currentSrc || '';
  const name = src.split('/').pop()?.split('?')[0];
  return name || null;
}

// Format ended most gallery strips with a teaser frame for the NEXT gallery,
// rendered larger than the gallery's own photos. It belongs to the "Next" link,
// not to this gallery's own set.
//
// Detected by asset identity rather than by position: the trailing frame counts
// as a teaser only if the same photo also appears in the next gallery's own
// set. That holds for 7 of the 9 galleries — transcendence and gentle-shifts
// end on a genuine photo of their own, and must keep it.
export function teaserFile(gallerySlug) {
  const images = orderedImages(gallerySlug);
  if (images.length < 2) return null;

  const last = images[images.length - 1];
  const key = assetKey(last);
  if (!key) return null;

  const i = GALLERIES.findIndex((g) => g.slug === gallerySlug);
  if (i === -1) return null;
  const next = GALLERIES[(i + 1) % GALLERIES.length];
  if (!next || next.slug === gallerySlug) return null;

  const nextKeys = new Set(orderedImages(next.slug).map(assetKey).filter(Boolean));
  return nextKeys.has(key) ? last.file : null;
}

// Ordered image files a gallery actually owns — teaser excluded.
export function galleryFiles(gallerySlug) {
  const teaser = teaserFile(gallerySlug);
  return orderedImages(gallerySlug)
    .map((im) => im.file)
    .filter((f) => f && f !== teaser);
}

// Files placed in the captured layout (union across breakpoints), teaser
// included — the gallery page uses this to spot any downloaded image that no
// view uses at all.
export function placedFiles(gallerySlug) {
  const data = layout[`archive-${gallerySlug}`];
  if (!data) return new Set();
  const files = new Set();
  for (const key of ['1440', '768', '390']) {
    for (const im of data[key]?.images || []) if (im.file) files.add(im.file);
  }
  return files;
}
