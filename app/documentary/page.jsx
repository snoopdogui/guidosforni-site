import { loadBody, imagesFor } from '../../lib/server-content';
import VimeoEmbed from '../../components/VimeoEmbed';
import styles from './documentary.module.css';

export const metadata = { title: 'Documentary — Guido Sforni' };

const VIMEO_ID = '769580233';
const VIMEO_PARAMS = 'title=0&byline=0&portrait=0&color=ffffff&api=1&autoplay=1';

// Row order from the captured original (~/guidosforni-scraper/output/html):
//   0 image_01                full-width lead
//   1 video_with_text_04      sixcol text (left) + sixcol video (right)
//   2 image_set_11 (masonry)  2 columns: two landscapes stacked / one portrait
export default function DocumentaryPage() {
  const html = loadBody('documentary');
  const images = imagesFor('documentary'); // poster is not `documentary-<n>` so it's excluded
  const [lead, ...stills] = images;

  // masonry: the two landscapes stack in column one, the portrait fills column two
  const stacked = [stills[0], stills[2]].filter(Boolean);
  const tall = stills[1];

  return (
    <article className={styles.page}>
      {lead && (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={lead}
          alt="Surfer carrying a board at the water's edge, from the Morgan's Wave shoot"
          className={styles.lead}
        />
      )}

      <div className={styles.videoRow}>
        <div className={styles.copy} dangerouslySetInnerHTML={{ __html: html }} />
        <VimeoEmbed
          videoId={VIMEO_ID}
          params={VIMEO_PARAMS}
          poster="/images/documentary-poster.jpg"
          title="Morgan's Wave — trailer"
        />
      </div>

      {(stacked.length > 0 || tall) && (
        <div className={styles.stills}>
          <div className={styles.stack}>
            {stacked.map((src, i) => (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img key={src} src={src} alt={`Morgan's Wave — still ${i + 1}`} loading="lazy" />
            ))}
          </div>
          {tall && (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={tall} alt="Morgan's Wave — still 3" loading="lazy" />
          )}
        </div>
      )}
    </article>
  );
}
