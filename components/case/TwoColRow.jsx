import CaseRow from './CaseRow';
import styles from './case.module.css';

// Two-column row: text beside an image, either order, at a 4/8 or 8/4 split.
// Covers Format's layout_04 (4col text + 8col image), layout_05 (4col image +
// 8col text) and layout_06 (8col text + 4col image).
//
//   split     column widths in DOM order — '4-8' or '8-4'
//   imageSide which column the image occupies — 'left' or 'right'
//   image     { src, alt }; omit to leave the other column empty (text_08)
//
// DOM order is the mobile stack order, which is how the original behaved.
export default function TwoColRow({ split = '4-8', imageSide = 'right', image, children }) {
  const grid = `${styles.cols} ${split === '8-4' ? styles.split84 : styles.split48}`;

  const media = image ? (
    <div>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={image.src} alt={image.alt} className={styles.media} loading="lazy" />
    </div>
  ) : (
    <div aria-hidden="true" />
  );

  return (
    <CaseRow>
      <div className={grid}>
        {imageSide === 'left' ? (
          <>
            {media}
            <div>{children}</div>
          </>
        ) : (
          <>
            <div>{children}</div>
            {media}
          </>
        )}
      </div>
    </CaseRow>
  );
}
