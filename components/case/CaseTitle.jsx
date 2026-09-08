import styles from './case.module.css';

// Page title + subtitle. h1 for the title, a paragraph for the subtitle — the
// scraped markdown made both an h2, which flattened the hierarchy.
//
//   size        'xl' for Format's xl-headline (london-cinema-map, arium)
//               'md' for a plain h2 title at section-heading size (encode)
//   subtitleAs  'heading' renders the subtitle at 24px display size,
//               'paragraph' at body size — matches how the source marked it up
//   align       'center' for the arium's centred headline_01 treatment
export default function CaseTitle({
  title,
  subtitle,
  size = 'xl',
  subtitleAs = 'heading',
  align = 'left',
}) {
  return (
    <header className={align === 'center' ? styles.center : undefined}>
      <h1 className={size === 'md' ? styles.titleMd : styles.title}>{title}</h1>
      {subtitle && (
        <p className={subtitleAs === 'paragraph' ? styles.subtitleBody : styles.subtitle}>
          {subtitle}
        </p>
      )}
    </header>
  );
}
