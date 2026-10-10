import { loadCase, caseSection, imagesFor } from '../../../../lib/server-content';
import CaseTitle from '../../../../components/case/CaseTitle';
import CaseSection from '../../../../components/case/CaseSection';
import TwoColRow from '../../../../components/case/TwoColRow';
import ProseRow from '../../../../components/case/ProseRow';
import HeadlineRow from '../../../../components/case/HeadlineRow';
import CaseNav from '../../../../components/case/CaseNav';

const SLUG = 'work-the-merge';

// Copy lives in content/work-the-merge.md. Images are
// public/images/work-the-merge-N.* (0 = lead screenshot, 1 = optional second).
// Until they exist, the title sits in an 8col with the 4col left empty
// (encode's text_08 treatment) and the second section falls back to prose.
export default function TheMerge() {
  const data = loadCase(SLUG);
  const images = imagesFor(SLUG);

  const brief = caseSection(data, 'The Brief');
  const whatItDoes = caseSection(data, 'What It Does');
  const built = caseSection(data, 'How I Built It');
  const learnt = caseSection(data, 'What I Learnt');

  // The closing "Try it" line is the last paragraph of the final section,
  // shown as its own centred row (same convention as the cinema map page).
  const learntBody = learnt.paragraphs.slice(0, -1);
  const tryIt = learnt.paragraphs.slice(-1);

  const title = <CaseTitle title={data.title} subtitle={data.subtitle} subtitleAs={data.subtitleAs} />;

  return (
    <article>
      {images[0] ? (
        <TwoColRow
          split="4-8"
          imageSide="right"
          image={{ src: images[0], alt: 'The Merge: the current collective canvas' }}
        >
          {title}
        </TwoColRow>
      ) : (
        <TwoColRow split="8-4" imageSide="right">
          {title}
        </TwoColRow>
      )}

      <ProseRow>
        <CaseSection {...brief} />
      </ProseRow>

      {images[1] ? (
        <TwoColRow
          split="4-8"
          imageSide="left"
          image={{
            src: images[1],
            alt: 'The Merge contributions list: the original uploads kept beside the canvas',
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
        <CaseSection {...built} />
      </ProseRow>

      <ProseRow>
        <CaseSection heading={learnt.heading} paragraphs={learntBody} />
      </ProseRow>

      <HeadlineRow paragraphs={tryIt} />

      <CaseNav />
    </article>
  );
}
