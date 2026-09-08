import Link from 'next/link';
import { notFound } from 'next/navigation';
import { GALLERIES, getGallery } from '../../../lib/content';
import { imagesFor } from '../../../lib/server-content';
import GalleryFilmstrip, { placedFiles } from '../../../components/GalleryFilmstrip';
import FilmRoll from '../../../components/FilmRoll';
import { galleryFiles } from '../../../lib/gallery';
import styles from './gallery.module.css';

export function generateStaticParams() {
  return GALLERIES.map((g) => ({ slug: g.slug }));
}

export function generateMetadata({ params }) {
  const g = getGallery(params.slug);
  return { title: g ? `${g.title} — Guido Sforni` : 'Guido Sforni' };
}

const base = (p) => p.split('/').pop();

// Galleries migrated to the film-roll viewer. The rest still use the original
// scatter filmstrip until they're moved over.
const FILM_ROLL = new Set(['transcendence']);

export default function GalleryPage({ params }) {
  const g = getGallery(params.slug);
  if (!g) notFound();

  const idx = GALLERIES.findIndex((x) => x.slug === g.slug);
  const next = GALLERIES[(idx + 1) % GALLERIES.length];

  // Any downloaded image for this gallery not placed in the scatter canvas.
  // On the old site the extra is the next-gallery teaser thumbnail; render it
  // in the "Next" link so every downloaded asset is used and reachable.
  const placed = placedFiles(g.slug);
  const leftovers = imagesFor(`archive-${g.slug}`).filter((src) => !placed.has(base(src)));
  const teaser = leftovers[0] || null;
  const extras = leftovers.slice(1);

  return (
    <article className={styles.page}>
      {FILM_ROLL.has(g.slug) ? (
        <FilmRoll files={galleryFiles(g.slug)} title={g.title} />
      ) : (
        <GalleryFilmstrip gallerySlug={g.slug} title={g.title} />
      )}

      {extras.length > 0 && (
        <div className={styles.extras}>
          {extras.map((src) => (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img key={src} src={src} alt={`${g.title} — additional`} loading="lazy" />
          ))}
        </div>
      )}

      <nav className={styles.pageNav} aria-label="Gallery navigation">
        <Link href="/archive" className={styles.back}>
          ‹ Archive
        </Link>
        {next && (
          <Link href={`/archive/${next.slug}`} className={styles.nextPage}>
            {teaser && (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={teaser} alt="" className={styles.teaser} loading="lazy" />
            )}
            <span className={styles.nextMeta}>
              <span className={styles.nextLabel}>Next</span>
              <span className={styles.nextName}>{next.title} ›</span>
            </span>
          </Link>
        )}
      </nav>
    </article>
  );
}
