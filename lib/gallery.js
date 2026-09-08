// Pure gallery helpers (no Node built-ins, no fs) — safe to import anywhere.
import layout from './gallery-layout.json';

// Ordered image files for a gallery. The film-roll viewer only needs the image
// order, so this drops the per-image px coordinates that drove the old scatter
// canvas. Order is taken left-to-right from the widest captured breakpoint; it
// is identical across 1440/768/390.
export function galleryFiles(gallerySlug) {
  const data = layout[`archive-${gallerySlug}`];
  if (!data) return [];
  const set = data['1440'] ?? data['768'] ?? data['390'];
  if (!set?.images?.length) return [];
  return [...set.images]
    .sort((a, b) => a.left - b.left)
    .map((im) => im.file)
    .filter(Boolean);
}

// Files placed in the captured layout (union across breakpoints). The gallery
// page uses this to spot any downloaded image the viewer doesn't show — it
// currently finds none for any gallery, but the check is cheap insurance
// against a re-scrape adding files.
export function placedFiles(gallerySlug) {
  const data = layout[`archive-${gallerySlug}`];
  if (!data) return new Set();
  const files = new Set();
  for (const key of ['1440', '768', '390']) {
    for (const im of data[key]?.images || []) if (im.file) files.add(im.file);
  }
  return files;
}
