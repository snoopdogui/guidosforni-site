'use client';

import Link from 'next/link';
import { useState } from 'react';
import styles from './ArchiveList.module.css';

export default function ArchiveList({ items }) {
  const [active, setActive] = useState(0);
  const preview = items[active]?.cover;

  return (
    <div className={styles.layout}>
      <ul className={styles.list}>
        {items.map((it, i) => (
          <li key={it.slug} onMouseEnter={() => setActive(i)}>
            <Link href={it.href} className={styles.title}>
              {it.title}
            </Link>
            <Link href={it.href} className={styles.more}>
              See More ›
            </Link>
            {/* mobile inline cover */}
            {it.cover && (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img className={styles.mobileCover} src={it.cover} alt={it.title} loading="lazy" />
            )}
          </li>
        ))}
      </ul>

      <div className={styles.preview} aria-hidden="true">
        {preview && (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={preview} alt="" className={styles.previewImg} />
        )}
      </div>
    </div>
  );
}
