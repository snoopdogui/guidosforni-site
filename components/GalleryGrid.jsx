'use client';

import styles from './GalleryGrid.module.css';

// Masonry thumbnail sheet of every frame in a gallery. `currentIndex` is the
// frame scroll mode is centred on; picking a cell hands that index back so the
// roll can reopen there. Aspect ratios are preserved — nothing is cropped.
export default function GalleryGrid({ files, title, currentIndex = 0, onPick }) {
  if (!files?.length) return null;

  return (
    <ul className={styles.grid} aria-label={`${title} — ${files.length} images`}>
      {files.map((file, i) => (
        <li key={file} className={styles.cell}>
          <button
            type="button"
            className={`${styles.pick} ${i === currentIndex ? styles.current : ''}`}
            aria-current={i === currentIndex ? 'true' : undefined}
            aria-label={`View image ${i + 1} of ${files.length}`}
            onClick={() => onPick?.(i)}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`/images/${file}`}
              alt={`${title} — ${i + 1} of ${files.length}`}
              className={styles.thumb}
              loading="lazy"
              draggable={false}
            />
          </button>
        </li>
      ))}
    </ul>
  );
}
