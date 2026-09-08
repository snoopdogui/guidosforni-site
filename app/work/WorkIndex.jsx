'use client';

import Link from 'next/link';
import { useState } from 'react';
import styles from './work.module.css';

const VIEWS = [
  { id: 'grid', label: 'Grid' },
  { id: 'list', label: 'List' },
];

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
                {it.thumb && (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={it.thumb}
                    alt={`${it.title} — lead image`}
                    className={styles.thumb}
                    loading="lazy"
                  />
                )}
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
              <Link href={it.href} className={styles.title}>
                {it.title}
              </Link>
              {it.dates && <p className={styles.dates}>{it.dates}</p>}
              <p className={styles.blurb}>{it.blurb}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
