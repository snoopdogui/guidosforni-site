import Link from 'next/link';
import { notFound } from 'next/navigation';
import { GALLERIES, getGallery } from '../../../lib/content';
import { imagesFor } from '../../../lib/server-content';
import GalleryViewer from '../../../components/GalleryViewer';
import { galleryFiles, placedFiles, teaserFile } from '../../../lib/gallery';
import styles from './gallery.module.css';

export function generateStaticParams() {
  return GALLERIES.map((g) => ({ slug: g.slug }));
}

export function generateMetadata({ params }) {
  const g = getGallery(params.slug);
  return { title: g ? `${g.title} — Guido Sforni` : 'Guido Sforni' };
}

const base = (p) => p.split('/').pop();

export default function GalleryPage({ params }) {
  const g = getGallery(params.slug);
  if (!g) notFound();

  const idx = GALLERIES.findIndex((x) => x.slug === g.slug);
  const next = GALLERIES[(idx + 1) % GALLERIES.length];

  // The trailing frame of this gallery's captured strip is a preview of the
  // NEXT gallery, so it belongs to the "Next" link rather than to this
  // gallery's own film roll or grid.
  const teaserName = teaserFile(g.slug);
  const teaser = teaserName ? `/images/${teaserName}` : null;

  // Any downloaded image for this gallery that no view uses at all (currently
  // none) — cheap insurance against a re-scrape adding files.
  const placed = placedFiles(g.slug);
  const extras = imagesFor(`archive-${g.slug}`).filter((src) => !placed.has(base(src)));

  return (
    <article className={styles.page}>
      <GalleryViewer files={galleryFiles(g.slug)} title={g.title} />

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
