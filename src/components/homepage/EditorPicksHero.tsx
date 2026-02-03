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
  pinned_slot: number;
}

interface EditorPicksHeroProps {
  picks: EditorPick[];
  isMobile: boolean;
}

export function EditorPicksHero({ picks = [], isMobile }: EditorPicksHeroProps) {
  const safePicks = Array.isArray(picks) ? picks : [];

  // Return null if no picks
  if (safePicks.length === 0) {
    return null;
  }

  // Slots 1-3: Visual cards with images
  const visualPicks = safePicks.filter(p => p.pinned_slot >= 1 && p.pinned_slot <= 3)
    .sort((a, b) => a.pinned_slot - b.pinned_slot);

  // Slots 4-6: Text-only list
  const textPicks = safePicks.filter(p => p.pinned_slot >= 4 && p.pinned_slot <= 6)
    .sort((a, b) => a.pinned_slot - b.pinned_slot);

  return (
    <section className="editor-picks-hero" aria-label="Editor's Picks">
      {/* Visual Cards - Horizontal scroll on mobile, 3-col grid on desktop */}
      <div className={`editor-picks-visual ${isMobile ? 'mobile-scroll' : 'desktop-grid'}`}>
        {visualPicks.map((pick) => {
          // Get first 150 chars of excerpt for subtitle
          const subtitle = pick.excerpt
            ? pick.excerpt.slice(0, 150) + (pick.excerpt.length > 150 ? '...' : '')
            : null;

          return (
            <Link
              key={pick.id}
              href={`/${pick.slug}`}
              className="editor-pick-card"
            >
              <div className="editor-pick-image-wrapper">
                {pick.featured_image ? (
                  <Image
                    src={pick.featured_image}
                    alt={pick.title}
                    fill
                    sizes={isMobile ? '280px' : '33vw'}
                    className="editor-pick-image"
                    priority={pick.pinned_slot === 1}
                  />
                ) : (
                  <div className="editor-pick-placeholder" />
                )}
              </div>
              <h2 className="editor-pick-title">{pick.title}</h2>
              {subtitle && (
                <p className="editor-pick-subtitle">{subtitle}</p>
              )}
            </Link>
          );
        })}
      </div>

      {/* Text List for slots 4-6 */}
      {textPicks.length > 0 && (
        <div className="editor-picks-text-list">
          <h3 className="editor-picks-text-header">More Featured</h3>
          <ul>
            {textPicks.map((pick) => (
              <li key={pick.id}>
                <Link href={`/${pick.slug}`} className="editor-pick-text-link">
                  {pick.team_slug && (
                    <span className={`team-indicator team-indicator--${pick.team_slug}`} />
                  )}
                  {pick.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
