import { loadCase, caseSection, imagesFor } from '../../../../lib/server-content';
import CaseTitle from '../../../../components/case/CaseTitle';
import CaseSection from '../../../../components/case/CaseSection';
import TwoColRow from '../../../../components/case/TwoColRow';
import ProseRow from '../../../../components/case/ProseRow';
import HeadlineRow from '../../../../components/case/HeadlineRow';
import CaseNav from '../../../../components/case/CaseNav';

const SLUG = 'work-london-cinema-map';

// Row-by-row rebuild of the original Format page. Row order and column splits
// come from the captured markup in ~/guidosforni-scraper/output/html:
//   0 layout_04    4col title/subtitle + 8col image (760x400)
//   1 layout_05    4col image (380x506) + 8col text
//   2 layout_06    8col text + 4col image (380x506)
//   3 text_03      12col prose
//   4 headline_01  12col centred
export default function LondonCinemaMap() {
  const data = loadCase(SLUG);
  const images = imagesFor(SLUG);

  const brief = caseSection(data, 'The Brief');
  const whatItDoes = caseSection(data, 'What It Does');
  const howIBuiltIt = caseSection(data, 'How I built It');
  const whatILearnt = caseSection(data, 'What I Learnt');

  // "Try it → london-cinema-map.vercel.app" is the trailing paragraph of the
  // last section in the markdown, but its own centred row on the original page.
  const learntBody = whatILearnt.paragraphs.slice(0, -1);
  const tryIt = whatILearnt.paragraphs.slice(-1);

  return (
    <article>
      {/* Row 0 — title + subtitle beside the dashboard screenshot */}
      <TwoColRow
        split="4-8"
        imageSide="right"
        image={
          images[0] && {
            src: images[0],
            alt: 'The London Cinema Map interface: filter sidebar beside a dark map of London covered in cinema pins',
          }
        }
      >
        <CaseTitle title={data.title} subtitle={data.subtitle} subtitleAs={data.subtitleAs} />
      </TwoColRow>

      {/* Row 1 — mobile screenshot beside the opening two sections */}
      <TwoColRow
        split="4-8"
        imageSide="left"
        image={
          images[1] && {
            src: images[1],
            alt: 'Mobile view of the app listing cinemas open on Friday with accessibility filters applied',
          }
        }
      >
        <CaseSection {...brief} />
        <CaseSection {...whatItDoes} />
      </TwoColRow>

      {/* Row 2 — build notes beside the venue detail screenshot.
          NOTE: the brief for this pilot described row 2 as an empty 4col, but
          the original page has an image here (see the 1440 capture). Built to
          match the original; drop the `image` prop to get the empty column. */}
      <TwoColRow
        split="8-4"
        imageSide="right"
        image={
          images[2] && {
            src: images[2],
            alt: 'Venue detail popover for Prince Charles Cinema showing screenings, price and accessibility',
          }
        }
      >
        <CaseSection {...howIBuiltIt} />
      </TwoColRow>

      {/* Row 3 — full-width prose */}
      <ProseRow>
        <CaseSection heading={whatILearnt.heading} paragraphs={learntBody} />
      </ProseRow>

      {/* Row 4 — centred sign-off link */}
      <HeadlineRow paragraphs={tryIt} />

      <CaseNav />
    </article>
  );
}
