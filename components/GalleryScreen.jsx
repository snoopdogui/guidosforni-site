'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import GalleryViewer from './GalleryViewer';
import { SHOW_GRID_MODE } from '../lib/flags';
import styles from './GalleryScreen.module.css';

const VIEW_PARAM = 'view';

// Owns the view mode for a gallery page, so both the viewer and the "Next"
// link see the same value.
//
// Each gallery is its own route, so the mode can't live in client state that
// survives navigation — it travels in the URL as ?view=grid. The gallery pages
// are statically generated, so the param is read after mount rather than from
// server-side searchParams, which would opt the whole route out of static
// rendering and drop the images from the prerendered HTML.
export default function GalleryScreen({ files, title, next, children }) {
  const [mode, setMode] = useState('roll');

  useEffect(() => {
    if (!SHOW_GRID_MODE) return;
    const view = new URLSearchParams(window.location.search).get(VIEW_PARAM);
    if (view === 'grid') setMode('grid');
  }, []);

  const changeMode = useCallback((to) => {
    setMode(to);
    // keep the URL honest so a reload or a shared link stays in this mode
    const url = new URL(window.location.href);
    if (to === 'grid') url.searchParams.set(VIEW_PARAM, 'grid');
    else url.searchParams.delete(VIEW_PARAM);
    window.history.replaceState(null, '', url);
  }, []);

  const nextHref = next
    ? `${next.href}${mode === 'grid' ? `?${VIEW_PARAM}=grid` : ''}`
    : null;

  return (
    <>
      <GalleryViewer
        files={files}
        title={title}
        mode={mode}
        onModeChange={changeMode}
        nextHref={nextHref}
        nextTitle={next?.title}
      />

      {children}

      <nav className={styles.pageNav} aria-label="Gallery navigation">
        <Link href="/archive" className={styles.back}>
          ‹ Archive
        </Link>
      </nav>
    </>
  );
}
