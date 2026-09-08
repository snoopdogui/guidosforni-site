import styles from './case.module.css';

// The row shell every case-study module sits in: capped at --maxw-case with
// Format's 36px vertical padding. `as` lets a row keep a more meaningful
// element than <section> (e.g. <nav> for the back link).
export default function CaseRow({ as: Tag = 'section', children, className = '' }) {
  return <Tag className={`${styles.row} ${className}`}>{children}</Tag>;
}
