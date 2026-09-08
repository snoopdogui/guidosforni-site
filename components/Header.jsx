'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { NAV } from '../lib/content';
import styles from './Header.module.css';

export default function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // The homepage renders its own name/nav overlay on the hero.
  const isHome = pathname === '/';

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  if (isHome) return null;

  return (
    <header className={styles.header}>
      <Link href="/" className={styles.brand}>
        Guido Sforni
      </Link>

      <nav className={styles.navDesktop} aria-label="Primary">
        {NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={pathname.startsWith(item.href) ? styles.active : undefined}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <button
        className={styles.burger}
        aria-label={open ? 'Close menu' : 'Open menu'}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span />
        <span />
        <span />
      </button>

      {open && (
        <nav className={styles.overlay} aria-label="Primary mobile">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
