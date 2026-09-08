import styles from './case.module.css';

// One `## heading` + its paragraphs. Renders a real h2 for the section heading;
// the page title/subtitle use CaseTitle instead, so the two no longer collide.
// Paragraphs arrive as separate strings (so a page can split them across rows)
// but are joined into one HTML block here — wrapping each in its own element
// would make every <p> a :last-child and kill the spacing between them.
export default function CaseSection({ heading, paragraphs = [] }) {
  return (
    <div className={styles.section}>
      {heading && <h2 className={styles.heading}>{heading}</h2>}
      <div className={styles.body} dangerouslySetInnerHTML={{ __html: paragraphs.join('\n') }} />
    </div>
  );
}
