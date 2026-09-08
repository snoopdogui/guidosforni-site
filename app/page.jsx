import Link from 'next/link';
import styles from './home.module.css';

// Homepage keeps the original section labels ("photography" -> /archive,
// "writing" -> /blog) for character; routes are normalized.
const HOME_NAV = [
  { label: 'work', href: '/work' },
  { label: 'documentary', href: '/documentary' },
  { label: 'photography', href: '/archive' },
  { label: 'writing', href: '/blog' },
];

export default function Home() {
  return (
    <section className={styles.hero}>
      {/* .frame is width: fit-content, so it collapses to the image's rendered
          width and the bar below aligns to the image's edges (as on Format). */}
      <div className={styles.frame}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/index-0.JPG" alt="Guido Sforni" className={styles.image} />
        <div className={styles.bar}>
          <Link href="/" className={styles.name}>
            GUIDO&nbsp;&nbsp;SFORNI
          </Link>
          <nav className={styles.nav} aria-label="Sections">
            {HOME_NAV.map((n) => (
              <Link key={n.href} href={n.href}>
                {n.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </section>
  );
}
