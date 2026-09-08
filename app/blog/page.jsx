import Link from 'next/link';
import { WRITINGS } from '../../lib/content';
import styles from './writing.module.css';

export const metadata = { title: 'Writing — Guido Sforni' };

export default function WritingPage() {
  return (
    <div className={styles.list}>
      <h1 className={styles.heading}>Writing</h1>
      {WRITINGS.map((w) => (
        <article key={w.slug} className={styles.item}>
          <Link href={`/blog/${w.slug}`} className={styles.title}>
            {w.title}
          </Link>
          <div className={styles.date}>{w.date}</div>
        </article>
      ))}
    </div>
  );
}
