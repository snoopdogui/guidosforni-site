'use client';

import { usePathname } from 'next/navigation';
import styles from './Footer.module.css';

export default function Footer() {
  const pathname = usePathname();

  // The homepage hero fills 100dvh and carries its own name/nav bar, so a
  // footer below it would only add scroll. Mirrors Header's isHome bail-out.
  if (pathname === '/') return null;

  return (
    <footer className={styles.footer}>
      <span>© All rights reserved</span>
    </footer>
  );
}
