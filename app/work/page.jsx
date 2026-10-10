import { WORKS } from '../../lib/content';
import { imagesFor } from '../../lib/server-content';
import WorkIndex from './WorkIndex';

export const metadata = { title: 'Work | Guido Sforni' };

export default function WorkPage() {
  // Reuse the case-study image convention: first downloaded image is the lead.
  const items = WORKS.map((w) => ({
    ...w,
    href: `/work/${w.slug}`,
    thumb: imagesFor(`work-${w.slug}`)[0] ?? null,
  }));

  return <WorkIndex items={items} />;
}
