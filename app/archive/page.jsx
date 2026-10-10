import { GALLERIES } from '../../lib/content';
import layout from '../../lib/gallery-layout.json';
import ArchiveList from '../../components/ArchiveList';

function cover(slug) {
  const g = layout[`archive-${slug}`];
  for (const w of ['1440', '768', '390']) {
    const f = g?.[w]?.images?.[0]?.file;
    if (f) return `/images/${f}`;
  }
  return null;
}

export const metadata = { title: 'Archive | Guido Sforni' };

export default function ArchivePage() {
  const items = GALLERIES.map((g) => ({ ...g, href: `/archive/${g.slug}`, cover: cover(g.slug) }));
  return <ArchiveList items={items} />;
}
