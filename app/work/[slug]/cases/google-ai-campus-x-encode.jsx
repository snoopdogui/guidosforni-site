import { loadCase, caseSection, imagesFor } from '../../../../lib/server-content';
import CaseTitle from '../../../../components/case/CaseTitle';
import CaseSection from '../../../../components/case/CaseSection';
import TwoColRow from '../../../../components/case/TwoColRow';
import ImageRow from '../../../../components/case/ImageRow';
import ProseRow from '../../../../components/case/ProseRow';
import CaseNav from '../../../../components/case/CaseNav';

const SLUG = 'work-google-ai-campus-x-encode';

// Row-by-row rebuild of the original Format page. Row order and column splits
// come from the captured markup in ~/guidosforni-scraper/output/html:
//   0 text_08     8col title/subtitle, 4col left empty
//   1 layout_05   4col image (380x506) + 8col text
//   2 layout_04   4col text + 8col image (760x760, square)
//   3 image_05    12col image (1140x440) + caption beneath
//   4 text_03     12col prose
export default function GoogleAiCampusXEncode() {
  const data = loadCase(SLUG);
  const images = imagesFor(SLUG);

  const brief = caseSection(data, 'The Brief');
  const whatIDid = caseSection(data, 'What I Did');
  const results = caseSection(data, 'Results');
  const tookFromIt = caseSection(data, 'What I Took From It');

  // "Results" runs across two rows on the original: the first two paragraphs
  // sit beside the cluster plot, the last two are the caption under the
  // full-width group-profile table.
  const resultsBody = results.paragraphs.slice(0, 2);
  const plotCaption = results.paragraphs.slice(2);

  return (
    <article>
      {/* Row 0 — title + subtitle in an 8col, 4col deliberately empty */}
      <TwoColRow split="8-4" imageSide="right">
        {/* plain h2 in the source, not xl-headline — smaller than cinema-map's title */}
        <CaseTitle
          title={data.title}
          subtitle={data.subtitle}
          size="md"
          subtitleAs={data.subtitleAs}
        />
      </TwoColRow>

      {/* Row 1 — photo of the venue beside the opening two sections */}
      <TwoColRow
        split="4-8"
        imageSide="left"
        image={
          images[0] && {
            src: images[0],
            alt: 'Guido Sforni outside the entrance to the London AI Campus, supported by Google',
          }
        }
      >
        <CaseSection {...brief} />
        <CaseSection {...whatIDid} />
      </TwoColRow>

      {/* Row 2 — results text beside the square Pol.is opinion-cluster plot */}
      <TwoColRow
        split="4-8"
        imageSide="right"
        image={
          images[1] && {
            src: images[1],
            alt: 'Pol.is opinion map showing three participant clusters — groups A, B and C — around a central axis',
          }
        }
      >
        <CaseSection heading={results.heading} paragraphs={resultsBody} />
      </TwoColRow>

      {/* Row 3 — full-width group profile table, with its caption below */}
      <ImageRow
        image={
          images[2] && {
            src: images[2],
            alt: 'Pol.is report table: statements which make group A unique, with per-group agree and disagree splits',
          }
        }
        caption={plotCaption}
      />

      {/* Row 4 — full-width closing prose */}
      <ProseRow>
        <CaseSection {...tookFromIt} />
      </ProseRow>

      <CaseNav />
    </article>
  );
}
