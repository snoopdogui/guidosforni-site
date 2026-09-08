import layout from '../lib/gallery-layout.json';
import styles from './GalleryFilmstrip.module.css';

// Original galleries are a single horizontally-scrolling canvas (PerfectScrollbar
// ps-active-x) holding ALL images at a fixed strip height (~781px). We reproduce
// that per breakpoint using the exact captured px coordinates inside an
// overflow-x container — so the whole set is reachable by scrolling right.
const SETS = [
  { key: '1440', className: styles.bp1440 },
  { key: '768', className: styles.bp768 },
  { key: '390', className: styles.bp390 },
];

function Track({ set, className, title }) {
  if (!set || !set.images?.length) return null;
  return (
    <div
      className={`${styles.track} ${className}`}
      style={{ width: `${set.containerW}px`, height: `${set.containerH}px` }}
    >
      {set.images.map((im, i) => (
        <img
          key={i}
          src={`/images/${im.file}`}
          alt={`${title} — ${i + 1}`}
          loading="lazy"
          className={styles.asset}
          style={{
            left: `${im.left}px`,
            top: `${im.top}px`,
            width: `${im.width}px`,
            height: `${im.height}px`,
          }}
        />
      ))}
    </div>
  );
}

export default function GalleryFilmstrip({ gallerySlug, title }) {
  const data = layout[`archive-${gallerySlug}`];
  if (!data) return null;
  return (
    <div className={styles.scroller} aria-label={`${title} gallery — scroll horizontally`}>
      {SETS.map((s) => (
        <Track key={s.key} set={data[s.key]} className={s.className} title={title} />
      ))}
    </div>
  );
}

// Files placed in the scatter canvas (union across breakpoints) — used by the
// gallery page to detect any downloaded image not shown here.
export function placedFiles(gallerySlug) {
  const data = layout[`archive-${gallerySlug}`];
  if (!data) return new Set();
  const files = new Set();
  for (const key of ['1440', '768', '390']) {
    for (const im of data[key]?.images || []) if (im.file) files.add(im.file);
  }
  return files;
}
