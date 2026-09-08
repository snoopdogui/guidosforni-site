import Link from 'next/link';
import CaseRow from './CaseRow';
import styles from './case.module.css';

export default function CaseNav() {
  return (
    <CaseRow as="nav" className={styles.pageNav}>
      <Link href="/work" className={styles.back}>
        ‹ Work
      </Link>
    </CaseRow>
  );
}
