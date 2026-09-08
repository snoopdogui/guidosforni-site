/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Scraped originals are large; serve as-is for now. TODO: add a resize step
    // (or Vercel image optimization) before production.
    unoptimized: true,
  },
  async redirects() {
    // Legacy Format URLs folded into /archive (empty 13966720 included).
    const legacy = ['14358097', '11517325', '11498924', '13966720'].map((id) => ({
      source: `/${id}`,
      destination: '/archive',
      permanent: true,
    }));
    return [
      ...legacy,
      // Homepage used "photography"/"writing" labels for these sections.
      { source: '/photography', destination: '/archive', permanent: true },
      { source: '/writing', destination: '/blog', permanent: true },
    ];
  },
};

export default nextConfig;
