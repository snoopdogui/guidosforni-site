'use client';

import { useCallback, useState } from 'react';
import Link from 'next/link';
import { SHOW_GRID_MODE } from '../lib/flags';
import FilmRoll from './FilmRoll';
import GalleryGrid from './GalleryGrid';
import styles from './GalleryViewer.module.css';

function RollIcon() {
  return (
    <svg width="15" height="13" viewBox="0 0 15 13" fill="none" aria-hidden="true">
      <rect x="0.5" y="0.5" width="14" height="12" stroke="currentColor" />
      <path d="M3.5 0.5v12M11.5 0.5v12" stroke="currentColor" />
      <path d="M1.5 2.5h1M1.5 6h1M1.5 9.5h1M12.5 2.5h1M12.5 6h1M12.5 9.5h1" stroke="currentColor" />
    </svg>
  );
}

function GridIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
      <rect x="0.5" y="0.5" width="5" height="5" stroke="currentColor" />
      <rect x="7.5" y="0.5" width="5" height="5" stroke="currentColor" />
      <rect x="0.5" y="7.5" width="5" height="5" stroke="currentColor" />
      <rect x="7.5" y="7.5" width="5" height="5" stroke="currentColor" />
    </svg>
  );
}

// Scroll mode (FilmRoll) and grid mode (GalleryGrid) over one gallery, sharing
// a current-frame index so switching either way keeps your place.
//
// `mode` is controlled by the parent (GalleryScreen) because the "Next" link
// has to render the same mode into its href — the mode outlives this component.
export default function GalleryViewer({
  files,
  title,
  mode = 'roll',
  onModeChange,
  nextHref,
  nextTitle,
}) {
  const [index, setIndex] = useState(0);

  // FilmRoll reports its centred frame as you scroll
  const handleActive = useCallback((i) => setIndex(i), []);

  // grid pick: remember the frame, then reopen the roll centred on it
  const handlePick = useCallback(
    (i) => {
      setIndex(i);
      onModeChange?.('roll');
    },
    [onModeChange]
  );

  const showingRoll = mode === 'roll';

  if (!files?.length) return null;

  return (
    <>
      {showingRoll ? (
        <FilmRoll
          files={files}
          title={title}
          initialIndex={index}
          onActiveChange={handleActive}
          showCounter={false}
        />
      ) : (
        <GalleryGrid files={files} title={title} currentIndex={index} onPick={handlePick} />
      )}

      <div className={styles.toolbar}>
        <p className={styles.counter}>
          {showingRoll
            ? `${String(index + 1).padStart(2, '0')} / ${String(files.length).padStart(2, '0')}`
            : `${files.length} images`}
        </p>
        <div className={styles.actions}>
          {/* The only next-gallery link on the page. It lives here rather than
              in the nav row below because the roll is up to 781px tall and its
              wheel handler claims vertical scroll, which makes the foot of the
              page hard to reach. Deliberately not gated on the view mode, so it
              survives grid mode being switched back on. */}
          {nextHref && (
            <Link href={nextHref} className={styles.nextLink}>
              Next: {nextTitle} ›
            </Link>
          )}

          {/* Grid toggle — hidden behind SHOW_GRID_MODE, not deleted. */}
          {SHOW_GRID_MODE && (
            <button
              type="button"
              className={styles.toggle}
              onClick={() => onModeChange?.(showingRoll ? 'grid' : 'roll')}
              aria-label={
                showingRoll ? 'Show all images as a grid' : 'Show images as a scrolling roll'
              }
              title={showingRoll ? 'Grid' : 'Roll'}
            >
              {showingRoll ? <GridIcon /> : <RollIcon />}
              {showingRoll ? 'Grid' : 'Roll'}
            </button>
          )}
        </div>
      </div>
    </>
  );
}
