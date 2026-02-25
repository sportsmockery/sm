// src/components/homepage/EditorPicksHero.tsx
'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';

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

const HOLD_DELAY = 500;
const CACHE_TTL = 60 * 60 * 1000;

/* ─── Scout Recap Overlay ─── */
function ScoutRecapOverlay({ postId, title, excerpt, slug, team, onClose }: { postId: string; title: string; excerpt: string | null; slug: string; team?: string | null; onClose: () => void }) {
  const [recap, setRecap] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const cacheKey = `scout-recap-${slug}`;
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const { text, ts } = JSON.parse(cached);
        if (Date.now() - ts < CACHE_TTL) { setRecap(text); setLoading(false); return; }
      }
    } catch { /* ignore */ }

    const controller = new AbortController();
    (async () => {
      try {
        const teamKey = team ? team.replace('chicago-', '').replace('-', '') : undefined;
        const payload: Record<string, unknown> = {
          postId,
          postTitle: title,
          excerpt: excerpt || '',
          team: teamKey,
        };
        if (user?.name) payload.username = user.name;

        const res = await fetch('/api/scout/summary', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          signal: controller.signal,
        });
        if (!res.ok) { setLoading(false); return; }
        const data = await res.json();
        const text = data.summary || data.response || data.answer || '';
        if (text) {
          setRecap(text);
          try { localStorage.setItem(cacheKey, JSON.stringify({ text, ts: Date.now() })); } catch { /* ignore */ }
        }
      } catch (err) {
        if ((err as Error).name !== 'AbortError') { /* ignore */ }
      } finally { setLoading(false); }
    })();
    return () => controller.abort();
  }, [slug, title, excerpt, team, postId, user?.name]);

  return (
    <div
      style={{ position: 'absolute', inset: 0, zIndex: 20, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', borderRadius: 16, overflow: 'hidden', animation: 'scoutOverlayIn 0.2s ease-out' }}
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
    >
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)' }} />
      <div style={{ position: 'relative', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Image src="/downloads/scout-v2.png" alt="Scout AI" width={20} height={20} style={{ borderRadius: '50%' }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Scout Recap</span>
          </div>
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onClose(); }}
            style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '50%', width: 26, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff' }}
            aria-label="Close recap"
          >
            <svg width="12" height="12" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            <div style={{ height: 10, borderRadius: 5, background: 'rgba(255,255,255,0.15)', width: '100%' }} />
            <div style={{ height: 10, borderRadius: 5, background: 'rgba(255,255,255,0.15)', width: '65%' }} />
          </div>
        ) : recap ? (
          <p style={{ fontSize: 13, lineHeight: 1.5, color: 'rgba(255,255,255,0.9)', margin: 0 }}>{recap}</p>
        ) : (
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', margin: 0 }}>Recap unavailable.</p>
        )}
        <Link
          href="/scout-ai"
          onClick={(e) => e.stopPropagation()}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 600, color: '#bc0000', textDecoration: 'none' }}
        >
          Ask Scout more
          <svg width="10" height="10" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
        </Link>
      </div>
      <style>{`@keyframes scoutOverlayIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }`}</style>
    </div>
  );
}

/* ─── Holdable Main Card (slot 1) ─── */
function HoldableMainCard({ pick }: { pick: EditorPick }) {
  const [showRecap, setShowRecap] = useState(false);
  const holdTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const didHold = useRef(false);

  const startHold = useCallback(() => {
    didHold.current = false;
    holdTimer.current = setTimeout(() => { didHold.current = true; setShowRecap(true); }, HOLD_DELAY);
  }, []);
  const cancelHold = useCallback(() => { if (holdTimer.current) { clearTimeout(holdTimer.current); holdTimer.current = null; } }, []);
  useEffect(() => () => { if (holdTimer.current) clearTimeout(holdTimer.current); }, []);

  const href = pick.category_slug ? `/${pick.category_slug}/${pick.slug}` : `/${pick.slug}`;

  return (
    <Link
      href={href}
      className="glass-card featured-main-link"
      style={{ padding: 0, position: 'relative' }}
      onMouseDown={startHold} onMouseUp={cancelHold} onMouseLeave={cancelHold}
      onTouchStart={startHold} onTouchEnd={cancelHold} onTouchCancel={cancelHold}
      onClick={(e) => { if (didHold.current) { e.preventDefault(); didHold.current = false; } }}
    >
      <div className="featured-image">
        {pick.featured_image ? (
          <Image src={pick.featured_image} alt={pick.title} fill sizes="(max-width: 768px) 100vw, 60vw" priority />
        ) : (
          <div className="featured-image-empty" />
        )}
        {pick.team_slug && (
          <span className="sm-tag featured-pill" style={{ display: 'inline-flex' }}>{formatTeamName(pick.team_slug)}</span>
        )}
      </div>
      <h3>{pick.title}</h3>
      {pick.excerpt && <p className="featured-excerpt">{pick.excerpt}</p>}
      <div className="featured-meta">
        {pick.team_slug && <span>{formatTeamName(pick.team_slug)}</span>}
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--sm-text-dim)', marginLeft: 'auto' }}>
          <Image src="/downloads/scout-v2.png" alt="" width={14} height={14} style={{ borderRadius: '50%', opacity: 0.6 }} />
          Hold for recap
        </span>
      </div>
      {showRecap && <ScoutRecapOverlay postId={pick.id} title={pick.title} excerpt={pick.excerpt} slug={pick.slug} team={pick.category_slug || pick.team_slug} onClose={() => setShowRecap(false)} />}
    </Link>
  );
}

/* ─── Holdable Side Card (slots 2-3) ─── */
function HoldableSideCard({ pick }: { pick: EditorPick }) {
  const [showRecap, setShowRecap] = useState(false);
  const holdTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const didHold = useRef(false);

  const startHold = useCallback(() => {
    didHold.current = false;
    holdTimer.current = setTimeout(() => { didHold.current = true; setShowRecap(true); }, HOLD_DELAY);
  }, []);
  const cancelHold = useCallback(() => { if (holdTimer.current) { clearTimeout(holdTimer.current); holdTimer.current = null; } }, []);
  useEffect(() => () => { if (holdTimer.current) clearTimeout(holdTimer.current); }, []);

  const href = pick.category_slug ? `/${pick.category_slug}/${pick.slug}` : `/${pick.slug}`;

  return (
    <Link
      href={href}
      className="glass-card-sm featured-side-card"
      style={{ padding: '16px', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.06)', position: 'relative', overflow: 'hidden' }}
      onMouseDown={startHold} onMouseUp={cancelHold} onMouseLeave={cancelHold}
      onTouchStart={startHold} onTouchEnd={cancelHold} onTouchCancel={cancelHold}
      onClick={(e) => { if (didHold.current) { e.preventDefault(); didHold.current = false; } }}
    >
      <div className="side-image">
        {pick.featured_image ? (
          <Image src={pick.featured_image} alt={pick.title} fill sizes="120px" />
        ) : (
          <div className="side-image-empty" />
        )}
      </div>
      <div className="side-content">
        {pick.team_slug && (
          <span className="sm-tag" style={{ display: 'inline-flex' }}>{formatTeamName(pick.team_slug)}</span>
        )}
        <h4>{pick.title}</h4>
        <span className="side-meta" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span>{pick.team_slug ? formatTeamName(pick.team_slug) : ''}</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 10, color: 'var(--sm-text-dim)' }}>
            <Image src="/downloads/scout-v2.png" alt="" width={12} height={12} style={{ borderRadius: '50%', opacity: 0.5 }} />
            Hold for recap
          </span>
        </span>
      </div>
      {showRecap && <ScoutRecapOverlay postId={pick.id} title={pick.title} excerpt={pick.excerpt} slug={pick.slug} team={pick.category_slug || pick.team_slug} onClose={() => setShowRecap(false)} />}
    </Link>
  );
}

/* ─── Main Component ─── */
export function EditorPicksHero({ picks = [] }: EditorPicksHeroProps) {
  const safePicks = Array.isArray(picks) ? picks : [];
  if (safePicks.length === 0) return null;

  const sorted = [...safePicks].sort((a, b) => a.pinned_slot - b.pinned_slot);
  const mainPick = sorted[0];
  const sidePicks = sorted.slice(1, 3);
  const morePicks = sorted.slice(3, 6);

  return (
    <section className="sm-featured-shell" aria-label="Featured Content" style={{ padding: '40px 0' }}>
      <div className="featured-grid" style={{ gap: '48px', padding: '0 24px' }}>
        <div className="featured-main">
          <HoldableMainCard pick={mainPick} />
        </div>
        <div className="featured-side" style={{ gap: '32px' }}>
          {sidePicks.map((pick) => (
            <HoldableSideCard key={pick.id} pick={pick} />
          ))}
        </div>
      </div>

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
