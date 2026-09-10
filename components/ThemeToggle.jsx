'use client';

import styles from './ThemeToggle.module.css';

export const THEME_KEY = 'theme';

// Action-labelled like the gallery's Grid/Roll toggle: in dark you see the sun
// (tap for light), in light you see the moon.
//
// Both icons are always rendered and CSS picks one off [data-theme], so this
// component holds no React state. That matters: the server can't know the
// stored theme, so anything derived from it in render would hydrate-mismatch.
// The click handler reads the live attribute instead.
export default function ThemeToggle({ className = '' }) {
  function toggle() {
    const root = document.documentElement;
    const next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    root.setAttribute('data-theme', next);
    try {
      localStorage.setItem(THEME_KEY, next);
    } catch {
      /* private mode / storage disabled — theme just won't persist */
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className={`${styles.toggle} ${className}`}
      aria-label="Switch between light and dark theme"
      title="Light / dark"
    >
      <span className={styles.sun} aria-hidden="true">
        <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
          <circle cx="7.5" cy="7.5" r="3.2" stroke="currentColor" />
          <path
            d="M7.5 0.5v2M7.5 12.5v2M0.5 7.5h2M12.5 7.5h2M2.6 2.6l1.4 1.4M11 11l1.4 1.4M12.4 2.6L11 4M4 11l-1.4 1.4"
            stroke="currentColor"
          />
        </svg>
      </span>
      <span className={styles.moon} aria-hidden="true">
        <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
          <path
            d="M9.6 1.3a6.2 6.2 0 100 12.4 6.4 6.4 0 01-2.3-6.4A6.4 6.4 0 019.6 1.3z"
            stroke="currentColor"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    </button>
  );
}
