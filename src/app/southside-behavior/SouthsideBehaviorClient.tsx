// app/southside-behavior/SouthsideBehaviorClient.tsx
'use client';

import { useEffect } from 'react';
import Script from 'next/script';
import type { TikTokEmbed } from '@/lib/tiktokTypes';
import { formatDate, truncate } from '@/lib/formatters';

type Props = {
  latestEmbed: TikTokEmbed | null;
  previousEmbeds: TikTokEmbed[];
};

function SocialLinks() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px', marginTop: '16px' }}>
      <a href="https://www.tiktok.com/@southsidebehavior" target="_blank" rel="noopener noreferrer" style={{ color: '#fff', opacity: 0.8 }} title="Follow on TikTok">
        <svg style={{ width: 32, height: 32 }} viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/></svg>
      </a>
      <a href="https://x.com/SouthsideBhvr" target="_blank" rel="noopener noreferrer" style={{ color: '#fff', opacity: 0.8 }} title="Follow on X">
        <svg style={{ width: 32, height: 32 }} viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
      </a>
    </div>
  );
}

export function SouthsideBehaviorClient({ latestEmbed, previousEmbeds }: Props) {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (typeof window !== 'undefined' && (window as any).tiktokEmbed) {
        (window as any).tiktokEmbed.lib.render();
      }
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  if (!latestEmbed) {
    return (
      <main className="sm-show-page sm-southside-behavior">
        <section className="sm-show-hero sm-tiktok-hero">
          <div className="sm-container">
            <div className="sm-tiktok-hero-inner" style={{ justifyContent: 'center' }}>
              <div className="sm-hero-text" style={{ maxWidth: '400px', textAlign: 'center' }}>
                <img src="/youtubelogos/ssb-logo.png" alt="Southside Behavior" style={{ marginBottom: '0.5rem', maxWidth: '320px', height: 'auto', display: 'block', marginLeft: 'auto', marginRight: 'auto' }} />
                <span className="sm-tag" style={{ display: 'inline-flex', margin: '0 auto 8px' }}>Southside Behavior</span>
                <h1 style={{ fontSize: '36px', fontWeight: 700, color: 'var(--sm-text)', fontFamily: "'Space Grotesk', var(--font-heading), sans-serif", margin: '0 0 8px', textAlign: 'center' }}>
                  Videos temporarily unavailable
                </h1>
                <p className="sm-hero-description">Please check back soon. We&apos;re having trouble loading the latest TikToks.</p>
                <SocialLinks />
              </div>
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="sm-show-page sm-southside-behavior">
      <Script src="https://www.tiktok.com/embed.js" strategy="lazyOnload" />

      <section className="sm-show-hero sm-tiktok-hero">
        <div className="sm-container">
          <div className="sm-tiktok-hero-inner" style={{ justifyContent: 'center' }}>
            <div className="sm-hero-text" style={{ maxWidth: '400px', textAlign: 'center' }}>
              <img src="/youtubelogos/ssb-logo.png" alt="Southside Behavior" style={{ marginBottom: '0.5rem', maxWidth: '320px', height: 'auto', display: 'block', marginLeft: 'auto', marginRight: 'auto' }} />
              <span className="sm-tag" style={{ display: 'inline-flex', margin: '0 auto 8px' }}>Southside Behavior</span>
              <h1 style={{ fontSize: '36px', fontWeight: 700, color: 'var(--sm-text)', fontFamily: "'Space Grotesk', var(--font-heading), sans-serif", margin: '0 0 8px', textAlign: 'center' }}>
                {truncate(latestEmbed.title, 120)}
              </h1>
              <p className="sm-hero-meta">{formatDate(latestEmbed.publishedAt)} &middot; Latest TikTok</p>
              <p className="sm-hero-description">
                Quick-hit TikToks from the South Side fan perspective. Catch the latest clips, reactions, and behind-the-scenes moments from White Sox fandom.
              </p>
              <SocialLinks />
            </div>

            <div className="sm-tiktok-featured">
              <div className="sm-tiktok-embed-wrapper" dangerouslySetInnerHTML={{ __html: latestEmbed.html }} />
            </div>
          </div>
        </div>
      </section>

      {previousEmbeds.length > 0 && (
        <section className="sm-show-previous">
          <div className="sm-container">
            <h2 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--sm-text)', fontFamily: "'Space Grotesk', var(--font-heading), sans-serif", margin: '0 0 16px' }}>
              Recent videos
            </h2>
            <div className="sm-tiktok-grid">
              {previousEmbeds.map((embed) => (
                <article key={embed.url} className="sm-tiktok-card glass-card">
                  <a href={embed.url} target="_blank" rel="noopener noreferrer" className="sm-tiktok-card-link">
                    <div className="sm-tiktok-thumb">
                      <img src={embed.thumbnailUrl} alt={embed.title} loading="lazy" />
                      <span className="sm-tiktok-play-icon">&#9654;</span>
                    </div>
                  </a>
                  <div className="sm-video-info">
                    <h3 className="sm-video-title">{truncate(embed.title, 60)}</h3>
                    <p className="sm-video-meta">{formatDate(embed.publishedAt)}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="sm-show-cta">
        <div className="sm-container sm-cta-inner">
          <p className="sm-cta-text">Want more Southside Behavior content?</p>
          <a href="https://www.tiktok.com/@southsidebehavior" target="_blank" rel="noopener noreferrer" className="btn-primary">
            Follow on TikTok
          </a>
        </div>
      </section>
    </main>
  );
}
