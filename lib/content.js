// Pure, client-safe site data (no Node built-ins, so safe to import from client
// components). Server-only loaders that touch the filesystem live in
// ./server-content.js.

// --- Canonical navigation (normalized from the two nav variants on the old site) ---
export const NAV = [
  { label: 'Work', href: '/work' },
  { label: 'Archive', href: '/archive' },
  { label: 'Documentary', href: '/documentary' },
  { label: 'Writing', href: '/blog' },
  { label: 'Contact', href: '/contact' },
];

// --- Work case studies ---
// `blurb` = 1–2 sentence card summary, condensed from each content/work-*.md
// (the source pages carry a subtitle line but no standalone summary field).
// `dates` = display date range for the /work card grid. Only the-arium states a
// date in its markdown ("Date: 2025"); the other two are INFERRED, so verify:
//   - encode workshop: sits inside the Encode AI fellowship (Jan 2026–present
//     per the CV); the exact event date isn't recorded anywhere in the repo.
//   - london-cinema-map: earliest repo file mtime is 2026-03-25, still shipping.
// The GitHub-sourced entries (terra-trust, the-merge, soundcheck-london) take
// `dates` from the repo's first commit, and carry `url` (live site) and `repo`
// (GitHub). Their case-study copy lives in content/work-<slug>.md like the rest.
// `coverVideo` / `coverPoster` = the looping card cover (H.264 MP4), made with
// scripts/make-cover.sh into public/work/<slug>/. Set them to null for an entry
// without a clip and the card falls back to its lead image, then to text only.
export const WORKS = [
  {
    slug: 'terra-trust',
    title: 'Terra Trust',
    dates: '2026 · proof of concept',
    blurb:
      'A proof-of-concept data trust for cocoa cooperatives, built on synthetic data. Farmers set consent per data category and purpose, on the web or a feature phone. Buyers get aggregates only, and a policy engine refuses and explains. Tested against 25 adversarial queries.',
    url: 'https://terra-trust-beta.vercel.app',
    repo: 'https://github.com/snoopdogui/terra-trust',
    coverVideo: '/work/terra-trust/cover.mp4',
    coverPoster: '/work/terra-trust/poster.jpg',
  },
  {
    slug: 'the-merge',
    title: 'The Merge',
    dates: 'Oct 2026 · Moth Hack',
    blurb:
      'One shared canvas that every upload gets blended into, at a strength drawn from a quantum random number generator. You can reroll before you commit, and every original stays listed beside the canvas.',
    url: 'https://the-merge-ten.vercel.app',
    repo: 'https://github.com/snoopdogui/the-merge',
    coverVideo: '/work/the-merge/cover.mp4',
    coverPoster: '/work/the-merge/poster.jpg',
  },
  {
    slug: 'soundcheck-london',
    title: 'Soundcheck',
    dates: 'May 2026',
    blurb:
      'A gig finder for London’s grassroots venues, hand-picked rather than ranked by an algorithm. An editorial feed of picks plus a filterable map of 15 real venues, running on a sample gig dataset for now.',
    url: 'https://soundcheck-london.vercel.app',
    repo: 'https://github.com/snoopdogui/soundcheck-london',
    coverVideo: '/work/soundcheck-london/cover.mp4',
    coverPoster: '/work/soundcheck-london/poster.jpg',
  },
  {
    slug: 'google-ai-campus-x-encode',
    title: 'Google AI Campus x Encode',
    dates: '2026',
    blurb:
      'A live Pol.is workshop on AI and wealth inequality, run at Google AI Campus for a politically mixed room. Designed end-to-end (prompts, session flow, live facilitation), it clustered the audience into three opinion groups and found the one statement 89% of them agreed on.',
    coverVideo: '/work/google-ai-campus-x-encode/cover.mp4',
    coverPoster: '/work/google-ai-campus-x-encode/poster.jpg',
  },
  {
    slug: 'london-cinema-map',
    title: 'London Cinema Map',
    dates: 'Mar 2026 – present',
    blurb:
      'An interactive map of every cinema in London, designed to give independents the same visual weight as the chains. Next.js and React-Leaflet over live MovieGlu showtimes, merged with a curated metadata layer for accessibility, pricing and format.',
    coverVideo: '/work/london-cinema-map/cover.mp4',
    coverPoster: '/work/london-cinema-map/poster.jpg',
  },
  {
    slug: '14358210-the-arium',
    title: 'The Arium',
    dates: '2025 · concept',
    blurb:
      'An immersive exhibition concept about hierarchy in artistic production: visitors pay for one of three tiers of creative tools, then watch the hierarchy they bought into shatter in a planetarium dome. The AI layer redistributes visibility rather than generating anything new.',
    coverVideo: '/work/14358210-the-arium/cover.mp4',
    coverPoster: '/work/14358210-the-arium/poster.jpg',
  },
];

// --- Archive photo galleries (title -> gallery slug) ---
export const GALLERIES = [
  { slug: 'loose-ends', title: 'Wild touch' },
  { slug: 'ilmuro', title: 'Il Muro' },
  { slug: 'clarity', title: 'Clarity' },
  { slug: 'branco', title: 'Branco' },
  { slug: 'soft-guidance', title: 'Soft guidance' },
  { slug: 'transcendence', title: 'Transcendence' },
  { slug: 'ando', title: 'Ando' },
  { slug: 'higher-land', title: 'Higher Land' },
  { slug: 'gentle-shifts', title: 'Gentle Shifts South' },
];

// --- Writing / essays ---
export const WRITINGS = [
  { slug: 'datafication-as-mastery', title: 'Datafication as Mastery', date: 'February 13, 2026' },
  { slug: 'the-algorithmic-auteur', title: 'The Algorithmic Auteur', date: 'April 6, 2025' },
  { slug: 'does-the-ai-race-produce-security', title: 'Does the AI Race Produce Security?', date: 'November 24, 2024' },
];

export const getWork = (slug) => WORKS.find((w) => w.slug === slug);
export const getGallery = (slug) => GALLERIES.find((g) => g.slug === slug);
export const getWriting = (slug) => WRITINGS.find((w) => w.slug === slug);
