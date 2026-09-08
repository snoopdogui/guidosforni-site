// Server-only content loaders (filesystem access). Import these ONLY from
// server components / route files, never from a 'use client' module.
import 'server-only';
import fs from 'node:fs';
import path from 'node:path';
import { mdToHtml } from './markdown';

const CONTENT_DIR = path.join(process.cwd(), 'content');
const NAV_LABELS = new Set(['Writing', 'Work', 'Archive', 'Documentary', 'Contact']);

// Read a scraped markdown file and strip the Format chrome (source comment,
// the "Guido Sforni" title, and the repeated nav list) before the real content.
function stripChrome(scrapeSlug) {
  const file = path.join(CONTENT_DIR, `${scrapeSlug}.md`);
  if (!fs.existsSync(file)) return null;
  const raw = fs.readFileSync(file, 'utf8');
  const lines = raw.split('\n').filter((line) => {
    const t = line.trim();
    if (t.startsWith('<!-- source:')) return false;
    if (t === '# Guido Sforni') return false;
    if (t.startsWith('- ') && NAV_LABELS.has(t.slice(2).trim())) return false;
    return true;
  });
  while (lines.length && lines[0].trim() === '') lines.shift();
  return lines;
}

export function loadBody(scrapeSlug) {
  const lines = stripChrome(scrapeSlug);
  return lines ? mdToHtml(lines.join('\n')) : '';
}

// Split a case-study markdown file into title, subtitle and `##` sections.
//
// The scraped source uses h2 for several different jobs, so position rather
// than heading level is what tells them apart. The first h2 is always the page
// title; the subtitle sits in one of two shapes depending on how the page was
// built in Format:
//   - as a paragraph under the title (encode, arium)
//   - as a second h2 with no body of its own (london-cinema-map)
// Everything after that is a section. Paragraphs come back as a list of
// individual `<p>` strings so a page can compose them across rows (e.g. hold
// trailing paragraphs back for a caption or a narrow closing block) instead of
// receiving one opaque blob of HTML.
export function loadCase(scrapeSlug) {
  const lines = stripChrome(scrapeSlug);
  if (!lines) return null;

  const blocks = [];
  for (const line of lines) {
    const h = line.trim().match(/^##\s+(.*)$/);
    if (h) blocks.push({ heading: h[1].trim(), lines: [] });
    else if (blocks.length) blocks[blocks.length - 1].lines.push(line);
  }

  const splitParas = (ls) =>
    ls
      .join('\n')
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .filter(Boolean);

  const head = blocks[0] ?? { heading: '', lines: [] };
  const headParas = splitParas(head.lines);
  const subtitleIsParagraph = headParas.length > 0;

  return {
    title: head.heading,
    subtitle: subtitleIsParagraph ? headParas[0] : (blocks[1]?.heading ?? ''),
    // Which shape the subtitle came from also tells us how the original styled
    // it: a paragraph subtitle rendered at body size, an h2 one at 24px.
    subtitleAs: subtitleIsParagraph ? 'paragraph' : 'heading',
    sections: (subtitleIsParagraph ? blocks.slice(1) : blocks.slice(2)).map((b) => ({
      heading: b.heading,
      paragraphs: splitParas(b.lines).map((para) => mdToHtml(para)),
    })),
  };
}

// Look up one section by heading. Whitespace is normalised on both sides
// because the scraped headings contain non-breaking spaces (e.g. "What
// This\u00a0Doesn't Resolve"), which would never match a typed lookup string.
// Returns an empty section rather than undefined so a page composition never
// crashes on a renamed heading.
const normalizeHeading = (h) => (h ?? '').replace(/\s+/g, ' ').trim();

export function caseSection(data, heading) {
  const want = normalizeHeading(heading);
  return (
    data?.sections.find((s) => normalizeHeading(s.heading) === want) ?? { heading, paragraphs: [] }
  );
}

// List downloaded image files for a scrape slug, ordered by their index.
export function imagesFor(scrapeSlug) {
  const dir = path.join(process.cwd(), 'public', 'images');
  if (!fs.existsSync(dir)) return [];
  const idx = (f) => {
    const m = f.match(new RegExp(`^${scrapeSlug}-(\\d+)\\.`, 'i'));
    return m ? Number(m[1]) : 1e9;
  };
  return fs
    .readdirSync(dir)
    .filter((f) => new RegExp(`^${scrapeSlug}-\\d+\\.`, 'i').test(f))
    .sort((a, b) => idx(a) - idx(b))
    .map((f) => `/images/${f}`);
}
