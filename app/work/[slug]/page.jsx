import { notFound } from 'next/navigation';
import { WORKS, getWork } from '../../../lib/content';
import LondonCinemaMap from './cases/london-cinema-map';
import GoogleAiCampusXEncode from './cases/google-ai-campus-x-encode';
import TheArium from './cases/14358210-the-arium';
import TerraTrust from './cases/terra-trust';
import TheMerge from './cases/the-merge';
import Soundcheck from './cases/soundcheck-london';

// Each case study is laid out row by row, rebuilt from the original Format
// markup. The compositions live in ./cases and share the building blocks in
// components/case.
const ROW_LAYOUTS = {
  'terra-trust': TerraTrust,
  'the-merge': TheMerge,
  'soundcheck-london': Soundcheck,
  'london-cinema-map': LondonCinemaMap,
  'google-ai-campus-x-encode': GoogleAiCampusXEncode,
  '14358210-the-arium': TheArium,
};

export function generateStaticParams() {
  return WORKS.map((w) => ({ slug: w.slug }));
}

export function generateMetadata({ params }) {
  const w = getWork(params.slug);
  return { title: w ? `${w.title} — Guido Sforni` : 'Guido Sforni' };
}

export default function CaseStudy({ params }) {
  const w = getWork(params.slug);
  const RowLayout = w && ROW_LAYOUTS[w.slug];
  if (!RowLayout) notFound();

  return <RowLayout />;
}
