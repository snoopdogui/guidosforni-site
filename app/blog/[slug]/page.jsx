import Link from 'next/link';
import { notFound } from 'next/navigation';
import { WRITINGS, getWriting } from '../../../lib/content';
import { loadBody } from '../../../lib/server-content';
import styles from './essay.module.css';

export function generateStaticParams() {
  return WRITINGS.map((w) => ({ slug: w.slug }));
}

export function generateMetadata({ params }) {
  const w = getWriting(params.slug);
  return { title: w ? `${w.title} — Guido Sforni` : 'Guido Sforni' };
}

export default function Essay({ params }) {
  const w = getWriting(params.slug);
  if (!w) notFound();

  const html = loadBody(`blog-${w.slug}`);

  return (
    <article className={styles.page}>
      <header className={styles.head}>
        <div className={styles.date}>{w.date}</div>
      </header>
      <div className="prose" dangerouslySetInnerHTML={{ __html: html }} />
      <nav className={styles.pageNav}>
        <Link href="/blog" className={styles.back}>
          ‹ Writing
        </Link>
      </nav>
    </article>
  );
}
