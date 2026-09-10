import { notFound } from 'next/navigation';
import { GALLERIES, getGallery } from '../../../lib/content';
import { imagesFor } from '../../../lib/server-content';
import GalleryScreen from '../../../components/GalleryScreen';
import { galleryFiles, placedFiles } from '../../../lib/gallery';
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
  const nextGallery = GALLERIES[(idx + 1) % GALLERIES.length];

  // Any downloaded image for this gallery that no view uses at all (currently
  // none) — cheap insurance against a re-scrape adding files.
  const placed = placedFiles(g.slug);
  const extras = imagesFor(`archive-${g.slug}`).filter((src) => !placed.has(base(src)));

  return (
    <article className={styles.page}>
      <GalleryScreen
        files={galleryFiles(g.slug)}
        title={g.title}
        next={
          nextGallery && nextGallery.slug !== g.slug
            ? { href: `/archive/${nextGallery.slug}`, title: nextGallery.title }
            : null
        }
      >
        {extras.length > 0 && (
          <div className={styles.extras}>
            {extras.map((src) => (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img key={src} src={src} alt={`${g.title} — additional`} loading="lazy" />
            ))}
          </div>
        )}
      </GalleryScreen>
    </article>
  );
}
