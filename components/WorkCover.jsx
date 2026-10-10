'use client';

import { useEffect, useRef, useState } from 'react';

// Looping, muted cover clip for a /work card. It only plays while at least a
// quarter of it is on screen, and with prefers-reduced-motion it never plays:
// the poster is rendered as a plain image instead.
//
// Clips come from scripts/make-cover.sh (public/work/<slug>/). The caller
// handles the fallback chain; this only renders when there's a video.
export default function WorkCover({ src, webm, poster, className }) {
  const ref = useRef(null);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    const video = ref.current;
    if (!video || reduced) return;
    // React doesn't reliably reflect `muted` as an attribute, and browsers only
    // allow programmatic play() on muted video, so set the property directly.
    video.muted = true;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) video.play().catch(() => {});
        else video.pause();
      },
      { threshold: 0.25 },
    );
    io.observe(video);
    return () => {
      io.disconnect();
      video.pause();
    };
  }, [reduced]);

  // Decorative: the card's title already names the work.
  if (reduced) {
    return poster ? (
      /* eslint-disable-next-line @next/next/no-img-element */
      <img src={poster} alt="" aria-hidden="true" className={className} loading="lazy" />
    ) : null;
  }

  return (
    <video
      ref={ref}
      className={className}
      poster={poster}
      muted
      loop
      playsInline
      preload="metadata"
      aria-hidden="true"
      tabIndex={-1}
    >
      {webm && <source src={webm} type="video/webm" />}
      <source src={src} type="video/mp4" />
    </video>
  );
}
