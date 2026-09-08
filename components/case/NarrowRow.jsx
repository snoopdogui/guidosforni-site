import CaseRow from './CaseRow';
import styles from './case.module.css';

// Narrow closing block — Format's text_01: a 6col column centred between two
// 3col spacers. Used for the arium's Role / Status / Date credits.
export default function NarrowRow({ paragraphs = [], children }) {
  return (
    <CaseRow>
      <div className={styles.narrow}>
        {paragraphs.length > 0 && (
          <div
            className={styles.body}
            dangerouslySetInnerHTML={{ __html: paragraphs.join('\n') }}
          />
        )}
        {children}
      </div>
    </CaseRow>
  );
}
