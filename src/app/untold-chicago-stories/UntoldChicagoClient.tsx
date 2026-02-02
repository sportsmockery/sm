// app/untold-chicago-stories/UntoldChicagoClient.tsx
'use client';

import { useState, useEffect } from 'react';
import type { ShowVideo } from '@/lib/youtubeTypes';
import { formatDate, truncate } from '@/lib/formatters';

type Props = {
  latestVideo: ShowVideo | null;
  previousVideos: ShowVideo[];
};

export function UntoldChicagoClient({ latestVideo, previousVideos }: Props) {
  if (!latestVideo) {
    return (
      <main className="sm-show-page sm-untold-chicago">
        <section className="sm-show-hero">
          <div className="sm-container sm-hero-inner">
            <div className="sm-hero-text">
              <img
                src="/youtubelogos/untold-white.png"
                alt="Untold Chicago Stories"
                style={{ marginBottom: '0.5rem', maxWidth: '320px', height: 'auto', display: 'block', marginLeft: 'auto', marginRight: 'auto' }}
              />
              <span className="sm-show-label">Untold Chicago Stories</span>
              <h1 className="sm-hero-title">Videos temporarily unavailable</h1>
              <p className="sm-hero-description">
                Please check back soon. We&apos;re having trouble loading the latest episodes.
              </p>
              <div className="flex items-center justify-center gap-5 mt-4">
                {/* YouTube */}
                <a
                  href="https://www.youtube.com/@untoldchicagostories?sub_confirmation=1"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white hover:text-white/70 transition-colors"
                  title="Subscribe on YouTube"
                >
                  <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>
    );
  }

  const [activeVideoId, setActiveVideoId] = useState(latestVideo.videoId);

  // Scroll to top on mount (prevents iframe from stealing scroll position)
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <main className="sm-show-page sm-untold-chicago">
      {/* Spotify Player Bar */}
      <div style={{
        width: '100%',
        backgroundColor: '#bc0000',
        padding: '8px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
      }}>
        <svg className="w-5 h-5 flex-shrink-0 text-white" fill="currentColor" viewBox="0 0 496 512">
          <path d="M248 8C111.1 8 0 119.1 0 256s111.1 248 248 248 248-111.1 248-248S384.9 8 248 8zm100.7 364.9c-4.2 0-6.8-1.3-10.7-3.6-62.4-37.6-135-39.2-206.7-24.5-3.9 1-9 2.6-11.9 2.6-9.7 0-15.8-7.7-15.8-15.8 0-10.3 6.1-15.2 13.6-16.8 81.9-18.1 165.6-16.5 237 26.2 6.1 3.9 9.7 7.4 9.7 16.5s-7.1 15.4-15.2 15.4zm26.9-65.6c-5.2 0-8.7-2.3-12.3-4.2-62.5-37-155.7-51.9-238.6-29.4-4.8 1.3-7.4 2.6-11.9 2.6-10.7 0-19.4-8.7-19.4-19.4s5.2-17.8 15.5-20.7c27.8-7.8 56.2-13.6 97.8-13.6 64.9 0 127.6 16.1 177 45.5 8.1 4.8 11.3 11 11.3 19.7-.1 10.8-8.5 19.5-19.4 19.5zm31-76.2c-5.2 0-8.4-1.3-12.9-3.9-71.2-42.5-198.5-52.7-280.9-29.7-3.6 1-8.1 2.6-12.9 2.6-13.2 0-23.3-10.3-23.3-23.6 0-13.6 8.4-21.3 17.4-23.9 35.2-10.3 74.6-15.2 117.5-15.2 73 0 149.5 15.2 205.4 47.8 7.8 4.5 12.9 10.7 12.9 22.6 0 13.6-11 23.3-23.2 23.3z"/>
        </svg>
        <span style={{ color: 'white', fontSize: '13px', fontWeight: 600 }}>Listen to Untold Chicago Stories</span>
        <iframe
          style={{ borderRadius: '12px', border: 'none' }}
          src="https://open.spotify.com/embed/track/0LV2TlOspytIK9K2IJRilB?utm_source=generator&theme=0"
          width="300"
          height="80"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
        />
      </div>
      <section className="sm-show-hero">
        <div className="sm-container sm-hero-inner">
          <div className="sm-hero-text">
            <img
              src="/youtubelogos/untold-white.png"
              alt="Untold Chicago Stories"
              style={{ marginBottom: '0.5rem', maxWidth: '320px', height: 'auto', display: 'block', marginLeft: 'auto', marginRight: 'auto' }}
            />
            <span className="sm-show-label">Untold Chicago Stories</span>
            <h1 className="sm-hero-title">{latestVideo.title}</h1>
            <p className="sm-hero-meta">
              {formatDate(latestVideo.publishedAt)} · Latest episode
            </p>
            <p className="sm-hero-description">
              {truncate(latestVideo.description, 220)}
            </p>
            <div className="flex items-center justify-center gap-5 mt-4">
              {/* YouTube */}
              <a
                href="https://www.youtube.com/@untoldchicagostories?sub_confirmation=1"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-white/70 transition-colors"
                title="Subscribe on YouTube"
              >
                <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
            </div>
          </div>

          <div className="sm-hero-video self-center">
            <div className="sm-video-wrapper">
              <iframe
                src={`https://www.youtube.com/embed/${activeVideoId}`}
                title={latestVideo.title}
                frameBorder={0}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      </section>

      <section className="sm-show-previous">
        <div className="sm-container">
          <h2 className="sm-section-title">Recent episodes</h2>
          <div className="sm-video-grid">
            {previousVideos.map((video) => (
              <article key={video.videoId} className="sm-video-card">
                <button
                  type="button"
                  className="sm-video-thumb-button"
                  onClick={() => setActiveVideoId(video.videoId)}
                >
                  <div className="sm-video-thumb">
                    <img
                      src={video.thumbnailUrl}
                      alt={video.title}
                      loading="lazy"
                    />
                    <span className="sm-video-play-icon">▶</span>
                  </div>
                </button>
                <div className="sm-video-info">
                  <h3 className="sm-video-title">{video.title}</h3>
                  <p className="sm-video-meta">
                    {formatDate(video.publishedAt)}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="sm-show-cta">
        <div className="sm-container sm-cta-inner">
          <p className="sm-cta-text">
            Want more Untold Chicago Stories?
          </p>
          <a
            href="https://www.youtube.com/@untoldchicagostories/videos"
            target="_blank"
            rel="noopener noreferrer"
            className="sm-cta-button-untold"
          >
            View Full Video Archive
          </a>
        </div>
      </section>
    </main>
  );
}
