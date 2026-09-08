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
