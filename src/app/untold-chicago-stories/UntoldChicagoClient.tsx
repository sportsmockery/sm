// app/untold-chicago-stories/UntoldChicagoClient.tsx
'use client';

import { useState, useEffect } from 'react';
import type { ShowVideo } from '@/lib/youtubeTypes';
import { formatDate, truncate } from '@/lib/formatters';

type Props = {
  latestVideo: ShowVideo | null;
  previousVideos: ShowVideo[];
};

function SocialLinks() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px', marginTop: '16px' }}>
      <a href="https://www.youtube.com/@untoldchicagostories?sub_confirmation=1" target="_blank" rel="noopener noreferrer" style={{ color: '#fff', opacity: 0.8 }} title="Subscribe on YouTube">
        <svg style={{ width: 32, height: 32 }} viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
      </a>
      <a href="https://open.spotify.com/track/0LV2TlOspytIK9K2IJRilB" target="_blank" rel="noopener noreferrer" style={{ color: '#fff', opacity: 0.8 }} title="Listen on Spotify">
        <svg style={{ width: 32, height: 32 }} viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/></svg>
      </a>
    </div>
  );
}

export function UntoldChicagoClient({ latestVideo, previousVideos }: Props) {
  if (!latestVideo) {
    return (
      <main className="sm-show-page sm-untold-chicago">
        <section className="sm-show-hero">
          <div className="sm-container sm-hero-inner">
            <div className="sm-hero-text">
              <img src="/youtubelogos/untold-white.png" alt="Untold Chicago Stories" style={{ marginBottom: '0.5rem', maxWidth: '320px', height: 'auto', display: 'block', marginLeft: 'auto', marginRight: 'auto' }} />
              <span className="sm-tag" style={{ display: 'inline-flex', margin: '0 auto 8px' }}>Untold Chicago Stories</span>
              <h1 style={{ fontSize: '36px', fontWeight: 700, color: '#fff', fontFamily: "'Space Grotesk', var(--font-heading), sans-serif", margin: '0 0 8px', textAlign: 'center' }}>
                Videos temporarily unavailable
              </h1>
              <p className="sm-hero-description">Please check back soon. We&apos;re having trouble loading the latest episodes.</p>
              <SocialLinks />
            </div>
          </div>
        </section>
      </main>
    );
  }

  const [activeVideoId, setActiveVideoId] = useState(latestVideo.videoId);

  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <main className="sm-show-page sm-untold-chicago">
      <section className="sm-show-hero">
        <div className="sm-container sm-hero-inner">
          <div className="sm-hero-text">
            <img src="/youtubelogos/untold-white.png" alt="Untold Chicago Stories" style={{ marginBottom: '0.5rem', maxWidth: '320px', height: 'auto', display: 'block', marginLeft: 'auto', marginRight: 'auto' }} />
            <span className="sm-tag" style={{ display: 'inline-flex', margin: '0 auto 8px' }}>Untold Chicago Stories</span>
            <h1 style={{ fontSize: '36px', fontWeight: 700, color: '#fff', fontFamily: "'Space Grotesk', var(--font-heading), sans-serif", margin: '0 0 8px', textAlign: 'center' }}>
              {latestVideo.title}
            </h1>
            <p className="sm-hero-meta">{formatDate(latestVideo.publishedAt)} &middot; Latest episode</p>
            <p className="sm-hero-description">{truncate(latestVideo.description, 220)}</p>
            <SocialLinks />
          </div>

          <div className="sm-hero-video" style={{ alignSelf: 'center' }}>
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
          <h2 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--sm-text)', fontFamily: "'Space Grotesk', var(--font-heading), sans-serif", margin: '0 0 16px' }}>
            Recent episodes
          </h2>
          <div className="sm-video-grid">
            {previousVideos.map((video) => (
              <article key={video.videoId} className="sm-video-card glass-card">
                <button type="button" className="sm-video-thumb-button" onClick={() => setActiveVideoId(video.videoId)}>
                  <div className="sm-video-thumb">
                    <img src={video.thumbnailUrl} alt={video.title} loading="lazy" />
                    <span className="sm-video-play-icon">&#9654;</span>
                  </div>
                </button>
                <div className="sm-video-info">
                  <h3 className="sm-video-title">{video.title}</h3>
                  <p className="sm-video-meta">{formatDate(video.publishedAt)}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="sm-show-cta">
        <div className="sm-container sm-cta-inner">
          <p className="sm-cta-text">Want more Untold Chicago Stories?</p>
          <a href="https://www.youtube.com/@untoldchicagostories/videos" target="_blank" rel="noopener noreferrer" className="btn-primary">
            View Full Video Archive
          </a>
        </div>
      </section>
    </main>
  );
}
