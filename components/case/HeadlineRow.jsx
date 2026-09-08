import CaseRow from './CaseRow';
import styles from './case.module.css';

// Centred headline / pull-line row — Format's headline_01.
//   variant 'headline' (default) for a plain centred line, e.g. "Try it → …"
//           'pull' for the larger italic display pull-line
export default function HeadlineRow({ variant = 'headline', paragraphs = [], children }) {
  return (
    <CaseRow>
      <div className={`${styles.headline} ${variant === 'pull' ? styles.pull : ''}`}>
        {paragraphs.length > 0 && (
          <div dangerouslySetInnerHTML={{ __html: paragraphs.join('\n') }} />
        )}
        {children && <p>{children}</p>}
      </div>
    </CaseRow>
  );
}
