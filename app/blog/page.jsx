import Image from 'next/image';
import Link from 'next/link';
import { WRITINGS } from '../../lib/content';
import styles from './writing.module.css';

export const metadata = { title: 'Writing | Guido Sforni' };

export default function WritingPage() {
  return (
    <div className={styles.list}>
      <h1 className={styles.heading}>Writing</h1>
      {WRITINGS.map((w) => (
        <article key={w.slug} className={styles.item}>
          <Link href={`/blog/${w.slug}`} className={styles.thumbWrap}>
            <Image
              src={`/images/blog-${w.slug}.jpeg`}
              alt={w.title}
              width={120}
              height={120}
              className={styles.thumb}
            />
          </Link>
          <div className={styles.text}>
            <Link href={`/blog/${w.slug}`} className={styles.title}>
              {w.title}
            </Link>
            <div className={styles.date}>{w.date}</div>
          </div>
        </article>
      ))}
    </div>
  );
}
