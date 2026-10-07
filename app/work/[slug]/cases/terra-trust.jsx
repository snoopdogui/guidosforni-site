import { loadCase, caseSection, imagesFor } from '../../../../lib/server-content';
import CaseTitle from '../../../../components/case/CaseTitle';
import CaseSection from '../../../../components/case/CaseSection';
import TwoColRow from '../../../../components/case/TwoColRow';
import ProseRow from '../../../../components/case/ProseRow';
import HeadlineRow from '../../../../components/case/HeadlineRow';
import CaseNav from '../../../../components/case/CaseNav';

const SLUG = 'work-terra-trust';

// Copy lives in content/work-terra-trust.md. Images are
// public/images/work-terra-trust-N.* (0 = lead screenshot, 1 = optional second).
export default function TerraTrust() {
  const data = loadCase(SLUG);
  const images = imagesFor(SLUG);

  const brief = caseSection(data, 'The Brief');
  const whatItDoes = caseSection(data, 'What It Does');
  const tested = caseSection(data, 'How I Tested It');
  const isNot = caseSection(data, 'What It Is Not');
  const learnt = caseSection(data, 'What I Learnt');

  // The closing "Try it" line is the last paragraph of the final section,
  // shown as its own centred row (same convention as the cinema map page).
  const learntBody = learnt.paragraphs.slice(0, -1);
  const tryIt = learnt.paragraphs.slice(-1);

  return (
    <article>
      <TwoColRow
        split="4-8"
        imageSide="right"
        image={
          images[0] && {
            src: images[0],
            alt: 'Terra Trust buyer portal showing a refused query and the policy checks, in order, that led to the refusal',
          }
        }
      >
        <CaseTitle title={data.title} subtitle={data.subtitle} subtitleAs={data.subtitleAs} />
      </TwoColRow>

      <ProseRow>
        <CaseSection {...brief} />
      </ProseRow>

      {images[1] ? (
        <TwoColRow
          split="4-8"
          imageSide="left"
          image={{
            src: images[1],
            alt: 'Terra Trust evaluation screen listing adversarial test cases and their results',
          }}
        >
          <CaseSection {...whatItDoes} />
        </TwoColRow>
      ) : (
        <ProseRow>
          <CaseSection {...whatItDoes} />
        </ProseRow>
      )}

      <ProseRow>
        <CaseSection {...tested} />
      </ProseRow>

      <ProseRow>
        <CaseSection {...isNot} />
      </ProseRow>

      <ProseRow>
        <CaseSection heading={learnt.heading} paragraphs={learntBody} />
      </ProseRow>

      <HeadlineRow paragraphs={tryIt} />

      <CaseNav />
    </article>
  );
}
