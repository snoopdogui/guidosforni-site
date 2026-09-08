import CaseRow from './CaseRow';
import styles from './case.module.css';

// Standalone image row, optionally with a caption beneath it.
// Covers Format's image_01 / image_05 (full 12col) and image_11 (an 8col image
// inset between 2col spacers).
//
//   width    'full' (default) or 'inset'
//   caption  list of paragraph HTML strings, rendered under the image
export default function ImageRow({ image, caption = [], width = 'full' }) {
  if (!image) return null;

  return (
    <CaseRow>
      <figure
        className={width === 'inset' ? `${styles.figure} ${styles.inset}` : styles.figure}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={image.src} alt={image.alt} className={styles.media} loading="lazy" />
        {caption.length > 0 && (
          <figcaption
            className={`${styles.body} ${styles.caption}`}
            dangerouslySetInnerHTML={{ __html: caption.join('\n') }}
          />
        )}
      </figure>
    </CaseRow>
  );
}
