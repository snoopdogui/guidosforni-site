'use client';

import { useState } from 'react';
import styles from './VimeoEmbed.module.css';

// Poster-first Vimeo embed. The iframe is not rendered until the poster is
// clicked, so the player is never loaded for visitors who don't watch.
export default function VimeoEmbed({ videoId, poster, title, params = '' }) {
  const [playing, setPlaying] = useState(false);

  return (
    <div className={styles.frame}>
      {playing ? (
        <iframe
          className={styles.player}
          src={`https://player.vimeo.com/video/${videoId}?${params}`}
          title={title}
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
        />
      ) : (
        <button
          type="button"
          className={styles.poster}
          onClick={() => setPlaying(true)}
          aria-label={`Play ${title}`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={poster} alt="" className={styles.thumb} />
          <span className={styles.play}>
            <svg width="16" height="18" viewBox="0 0 16 18" aria-hidden="true">
              <path d="M1 1l14 8-14 8V1z" fill="currentColor" />
            </svg>
          </span>
        </button>
      )}
    </div>
  );
}
