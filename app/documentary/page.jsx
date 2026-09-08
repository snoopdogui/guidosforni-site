import { loadBody, imagesFor } from '../../lib/server-content';
import styles from './documentary.module.css';

export const metadata = { title: 'Documentary — Guido Sforni' };

export default function DocumentaryPage() {
  const html = loadBody('documentary');
  const images = imagesFor('documentary');

  return (
    <article className={styles.page}>
      {images[0] && (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img src={images[0]} alt="Documentary" className={styles.lead} />
      )}
      <div className={`prose ${styles.body}`} dangerouslySetInnerHTML={{ __html: html }} />
      {images.length > 1 && (
        <div className={styles.stills}>
          {images.slice(1).map((src) => (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img key={src} src={src} alt="Still" loading="lazy" />
          ))}
        </div>
      )}
    </article>
  );
}
