'use client';

import Link from 'next/link';
import { useState } from 'react';
import WorkCover from '../../components/WorkCover';
import styles from './work.module.css';

const VIEWS = [
  { id: 'grid', label: 'Grid' },
  { id: 'list', label: 'List' },
];

// Fallback chain: the cover clip, then the case study's lead image
// (public/images/work-<slug>-0.*), then nothing, which is the plain text card.
function Cover({ item, className }) {
  if (item.coverVideo) {
    return (
      <WorkCover
        src={item.coverVideo}
        webm={item.coverWebm}
        poster={item.coverPoster ?? item.thumb}
        className={className}
      />
    );
  }
  if (item.thumb) {
    return (
      /* eslint-disable-next-line @next/next/no-img-element */
      <img src={item.thumb} alt="" aria-hidden="true" className={className} loading="lazy" />
    );
  }
  return null;
}

export default function WorkIndex({ items }) {
  const [view, setView] = useState('grid');

  return (
    <div className={styles.page}>
      <div className={styles.toolbar} role="group" aria-label="View">
        {VIEWS.map((v) => (
          <button
            key={v.id}
            type="button"
            className={styles.toggle}
            aria-pressed={view === v.id}
            onClick={() => setView(v.id)}
          >
            {v.label}
          </button>
        ))}
      </div>

      {view === 'grid' ? (
        <ul className={styles.grid}>
          {items.map((it) => (
            <li key={it.slug} className={styles.card}>
              <Link href={it.href} className={styles.cardLink}>
                <Cover item={it} className={styles.thumb} />
                <h2 className={styles.title}>{it.title}</h2>
                {it.dates && <p className={styles.dates}>{it.dates}</p>}
                <p className={styles.blurb}>{it.blurb}</p>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <ul className={styles.list}>
          {items.map((it) => (
            <li key={it.slug} className={styles.row}>
              {/* Duplicate of the title link, so kept out of the tab order. */}
              <Link href={it.href} className={styles.rowCover} tabIndex={-1} aria-hidden="true">
                <Cover item={it} className={styles.thumb} />
              </Link>
              <div className={styles.rowText}>
                <Link href={it.href} className={styles.title}>
                  {it.title}
                </Link>
                {it.dates && <p className={styles.dates}>{it.dates}</p>}
                <p className={styles.blurb}>{it.blurb}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
