// src/components/homepage/EditorPicksHero.tsx
'use client';

import Link from 'next/link';
import Image from 'next/image';

interface EditorPick {
  id: string;
  title: string;
  slug: string;
  featured_image: string | null;
  excerpt: string | null;
  team_slug: string | null;
  category_slug: string | null;
  content_type?: string;
  pinned_slot: number;
}

const CONTENT_BADGES: Record<string, string> = {
  video: 'VIDEO',
  analysis: 'ANALYSIS',
  podcast: 'PODCAST',
  gallery: 'GALLERY',
};

interface EditorPicksHeroProps {
  picks: EditorPick[];
}

function formatTeamName(slug: string | null): string {
  if (!slug) return '';
  return slug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function EditorPicksHero({ picks = [] }: EditorPicksHeroProps) {
  const safePicks = Array.isArray(picks) ? picks : [];

  if (safePicks.length === 0) {
    return null;
  }

  const sorted = [...safePicks].sort((a, b) => a.pinned_slot - b.pinned_slot);

  // Slot 1: Large featured card (left column)
  const mainPick = sorted[0];

  // Slots 2-3: Stacked side cards (right column)
  const sidePicks = sorted.slice(1, 3);

  // Slots 4-6: More featured headline links
  const morePicks = sorted.slice(3, 6);

  return (
    <section className="sm-featured-shell" aria-label="Featured Content">
      <div className="featured-grid">
        {/* Left column: Large featured card */}
        <div className="featured-main">
          <Link href={mainPick.category_slug ? `/${mainPick.category_slug}/${mainPick.slug}` : `/${mainPick.slug}`} className="glass-card featured-main-link">
            <div className="featured-image">
              {mainPick.featured_image ? (
                <Image
                  src={mainPick.featured_image}
                  alt={mainPick.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 60vw"
                  priority
                />
              ) : (
                <div className="featured-image-empty" />
              )}
              {mainPick.team_slug && (
                <span className="sm-tag featured-pill" style={{ display: 'inline-flex' }}>
                  {formatTeamName(mainPick.team_slug)}
                </span>
              )}
            </div>
            <h3>{mainPick.title}</h3>
            {mainPick.excerpt && (
              <p className="featured-excerpt">{mainPick.excerpt}</p>
            )}
            <div className="featured-meta">
              {mainPick.team_slug && (
                <span>{formatTeamName(mainPick.team_slug)}</span>
              )}
            </div>
          </Link>
        </div>

        {/* Right column: Stacked side cards */}
        <div className="featured-side">
          {sidePicks.map((pick) => (
            <Link
              key={pick.id}
              href={pick.category_slug ? `/${pick.category_slug}/${pick.slug}` : `/${pick.slug}`}
              className="glass-card-sm featured-side-card"
            >
              <div className="side-image">
                {pick.featured_image ? (
                  <Image
                    src={pick.featured_image}
                    alt={pick.title}
                    fill
                    sizes="120px"
                  />
                ) : (
                  <div className="side-image-empty" />
                )}
              </div>
              <div className="side-content">
                {pick.team_slug && (
                  <span className="sm-tag" style={{ display: 'inline-flex' }}>
                    {formatTeamName(pick.team_slug)}
                  </span>
                )}
                <h4>{pick.title}</h4>
                <span className="side-meta">
                  {pick.team_slug ? formatTeamName(pick.team_slug) : ''}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* More Featured (slots 4-6) */}
      {morePicks.length > 0 && (
        <div className="featured-more">
          <h4 className="featured-more-title">More Featured</h4>
          <ul className="featured-more-list">
            {morePicks.map((pick) => (
              <li key={pick.id}>
                <Link
                  href={pick.category_slug ? `/${pick.category_slug}/${pick.slug}` : `/${pick.slug}`}
                  className="featured-more-link"
                >
                  {pick.team_slug && (
                    <span className="sm-tag" style={{ display: 'inline-flex', fontSize: '10px', padding: '2px 8px' }}>
                      {formatTeamName(pick.team_slug)}
                    </span>
                  )}
                  {pick.content_type && CONTENT_BADGES[pick.content_type] && (
                    <span className="card-badge" style={{ fontSize: '9px', padding: '1px 6px' }}>
                      {CONTENT_BADGES[pick.content_type]}
                    </span>
                  )}
                  <span className="featured-more-headline">{pick.title}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
