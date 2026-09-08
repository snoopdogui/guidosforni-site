import { loadCase, caseSection, imagesFor } from '../../../../lib/server-content';
import CaseRow from '../../../../components/case/CaseRow';
import CaseTitle from '../../../../components/case/CaseTitle';
import CaseSection from '../../../../components/case/CaseSection';
import ImageRow from '../../../../components/case/ImageRow';
import ProseRow from '../../../../components/case/ProseRow';
import HeadlineRow from '../../../../components/case/HeadlineRow';
import NarrowRow from '../../../../components/case/NarrowRow';
import CaseNav from '../../../../components/case/CaseNav';

const SLUG = 'work-14358210-the-arium';

// Row-by-row rebuild of the original Format page. Row order comes from the
// captured markup in ~/guidosforni-scraper/output/html:
//   0 headline_01  12col centred title/subtitle
//   1 image_11     8col image (760x506) inset between 2col spacers
//   2 text_03      12col prose
//   3 headline_01  12col centred italic pull-line
//   4 image_01     12col image (1140x440)
//   5 text_03      12col prose
//   6 image_01     12col image (1140x440)
//   7 text_03      12col prose
//   8 text_03      12col prose
//   9 text_01      6col credits centred between 3col spacers
export default function TheArium() {
  const data = loadCase(SLUG);
  const images = imagesFor(SLUG);

  const pitch = caseSection(data, 'The Pitch');
  const whatWasMade = caseSection(data, 'What Was Made');
  const whyThisMatters = caseSection(data, 'Why This Matters');
  const doesntResolve = caseSection(data, "What This Doesn't Resolve");

  // The pull-line is an h2 with no body of its own in the source markdown, so
  // it arrives as a heading-only section rather than a section with prose.
  const pullLine = data.sections.find((s) => s.paragraphs.length === 0);

  // Role / Status / Date / concept-deck credits are the four trailing
  // paragraphs of the last section, but their own narrow row on the original.
  const resolveBody = doesntResolve.paragraphs.slice(0, -4);
  // The source marked the credit labels up as <b>Role</b>: … , but bold is lost
  // in the scraped markdown, so re-emphasise the label before the first colon.
  const credits = doesntResolve.paragraphs
    .slice(-4)
    .map((html) => html.replace(/^<p>([A-Z][A-Za-z ]{2,12}):/, '<p><strong>$1</strong>:'));

  return (
    <article>
      {/* Row 0 — centred title + subtitle */}
      <CaseRow>
        <CaseTitle
          title={data.title}
          subtitle={data.subtitle}
          subtitleAs={data.subtitleAs}
          align="center"
        />
      </CaseRow>

      {/* Row 1 — inset planetarium dome render */}
      <ImageRow
        width="inset"
        image={
          images[0] && {
            src: images[0],
            alt: 'Visitors reclining in a planetarium dome under a swirling projection of colour',
          }
        }
      />

      {/* Row 2 — the pitch */}
      <ProseRow>
        <CaseSection {...pitch} />
      </ProseRow>

      {/* Row 3 — centred italic pull-line */}
      {pullLine && <HeadlineRow variant="pull">{pullLine.heading}</HeadlineRow>}

      {/* Row 4 — three-stage concept diagram */}
      <ImageRow
        image={
          images[1] && {
            src: images[1],
            alt: 'Diagram of the three stages: tiered drawing tools, the dome, and the merged collective artwork',
          }
        }
      />

      {/* Row 5 — what was made */}
      <ProseRow>
        <CaseSection {...whatWasMade} />
      </ProseRow>

      {/* Row 6 — creation pods */}
      <ImageRow
        image={
          images[2] && {
            src: images[2],
            alt: 'A curved row of dimly lit creation pods, each with one visitor drawing on a tablet',
          }
        }
      />

      {/* Row 7 — why this matters */}
      <ProseRow>
        <CaseSection {...whyThisMatters} />
      </ProseRow>

      {/* Row 8 — what this doesn't resolve */}
      <ProseRow>
        <CaseSection heading={doesntResolve.heading} paragraphs={resolveBody} />
      </ProseRow>

      {/* Row 9 — narrow centred credits */}
      <NarrowRow paragraphs={credits} />

      <CaseNav />
    </article>
  );
}
