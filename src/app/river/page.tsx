import { Metadata } from 'next';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { supabaseAdmin } from '@/lib/supabase-server';
import { generateTrackingToken } from '@/lib/river-tokens';
import { scorePostCandidate, scoreGenericCandidate, scoreRiverCandidates, type ScoredCard, type RiverScoringContext } from '@/lib/river-scoring';
import { isProTier } from '@/lib/stripe';
import { TEAM_CATEGORY_SLUGS } from '@/lib/db';
import type { UserEngagementProfile } from '@/lib/scoring-v2';
import type { CardType, RiverCard, UserSegment } from '@/lib/river-types';
import RiverPageClient from './RiverPageClient';

export const metadata: Metadata = {
  title: 'The River | Sports Mockery',
  description:
    'Your personalized Chicago sports feed. Live scores, breaking news, Scout AI analysis, and fan community — all in one stream.',
};

export const dynamic = 'force-dynamic';

// ---------------------------------------------------------------------------
// Accent colors per card type
// ---------------------------------------------------------------------------

const ACCENT_COLORS: Record<CardType, string> = {
  scout_summary: '#00D4FF',
  hub_update: '#BC0000',
  trade_proposal: '#D6B05E',
  vision_theater: '#BC0000',
  trending_article: '#00D4FF',
  box_score: '#BC0000',
  trending_player: '#BC0000',
  fan_chat: '#00FF00',
  mock_draft: '#BC0000',
  sm_plus: '#D6B05E',
  infographic: '#0891B2',
  chart: '#00D4FF',
  poll: '#BC0000',
  comment_spotlight: '#00D4FF',
  listen_now: '#BC0000',
  join_newsletter: '#00D4FF',
  download_app: '#BC0000',
};

// ---------------------------------------------------------------------------
// Category slug → team slug mapping
// ---------------------------------------------------------------------------

const CATEGORY_TO_TEAM = new Map<string, string>();
for (const [teamSlug, categorySlugs] of Object.entries(TEAM_CATEGORY_SLUGS)) {
  for (const cs of categorySlugs) {
    CATEGORY_TO_TEAM.set(cs, teamSlug);
  }
}

function categorySlugToTeamSlug(catSlug: string | null | undefined): string | null {
  if (!catSlug) return null;
  return CATEGORY_TO_TEAM.get(catSlug) ?? null;
}

// ---------------------------------------------------------------------------
// User segment detection (server-side, using cookies())
// ---------------------------------------------------------------------------

async function detectUserSegmentServer(): Promise<{ segment: UserSegment; userId: string | null }> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseAnonKey) {
      return { segment: 'anonymous', userId: null };
    }

    const cookieStore = await cookies();
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll() {},
      },
    });

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { segment: 'anonymous', userId: null };

    const { data: subscription } = await supabaseAdmin
      .from('subscriptions')
      .select('tier, status')
      .eq('user_id', user.id)
      .maybeSingle();

    if (subscription?.status === 'active' && isProTier(subscription?.tier ?? '')) {
      return { segment: 'sm_plus', userId: user.id };
    }

    return { segment: 'logged_in', userId: user.id };
  } catch {
    return { segment: 'anonymous', userId: null };
  }
}

// ---------------------------------------------------------------------------
// Load user engagement profile
// ---------------------------------------------------------------------------

async function loadUserEngagementProfile(userId: string): Promise<UserEngagementProfile | null> {
  try {
    const { data: prefs } = await supabaseAdmin
      .from('sm_user_preferences')
      .select('favorite_teams')
      .eq('user_id', userId)
      .maybeSingle();

    if (!prefs) return null;

    const favoriteTeams: string[] = prefs.favorite_teams ?? ['bears'];
    const teamScores: Record<string, number> = {
      bears: 30, cubs: 30, bulls: 30, blackhawks: 30, 'white-sox': 30,
    };
    for (const team of favoriteTeams) {
      teamScores[team] = 80;
    }

    return {
      user_id: userId,
      team_scores: teamScores,
      format_prefs: { article: 50, video: 50, analysis: 50 },
      author_reads: {},
      topic_views_today: {},
    };
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Algorithm state detection
// ---------------------------------------------------------------------------

async function detectAlgorithmState(): Promise<'standard' | 'game_day_active'> {
  try {
    const { data } = await supabaseAdmin
      .from('sm_box_scores')
      .select('id')
      .eq('game_status', 'live')
      .limit(1);
    return data && data.length > 0 ? 'game_day_active' : 'standard';
  } catch {
    return 'standard';
  }
}

// ---------------------------------------------------------------------------
// Card builder
// ---------------------------------------------------------------------------

function makeCard(
  cardId: string,
  cardType: CardType,
  timestamp: string,
  content: Record<string, unknown>,
  sessionId: string,
  userSegment: UserSegment,
  teamSlug: string | null
): RiverCard {
  return {
    card_id: cardId,
    card_type: cardType,
    tracking_token: generateTrackingToken(cardId, cardType, userSegment, sessionId, teamSlug),
    timestamp,
    content,
    ui_directives: {
      accent: ACCENT_COLORS[cardType],
      interactive_hold: cardType === 'scout_summary',
    },
  };
}

// ---------------------------------------------------------------------------
// Fetch initial 12 River cards server-side (direct DB, no loopback HTTP)
// ---------------------------------------------------------------------------

async function getInitialRiverCards(): Promise<{ cards: RiverCard[]; cursor: string }> {
  try {
    const limit = 12;
    const sessionId = crypto.randomUUID();

    const [{ segment: userSegment, userId }, algorithmState] = await Promise.all([
      detectUserSegmentServer(),
      detectAlgorithmState(),
    ]);

    const userProfile = userId ? await loadUserEngagementProfile(userId) : null;

    const scoringCtx: RiverScoringContext = {
      user: userProfile,
      isLoggedIn: userSegment !== 'anonymous',
      viewedPostIds: new Set(),
      algorithmState,
      teamFilter: null,
    };

    const [postsResult, hubResult, boxResult, tradesResult] = await Promise.all([
      supabaseAdmin
        .from('sm_posts')
        .select('id, title, slug, featured_image, excerpt, scout_summary, engagement_velocity, published_at, category_id, views, category:sm_categories!category_id(slug)')
        .eq('status', 'published')
        .order('published_at', { ascending: false })
        .limit(60),
      supabaseAdmin
        .from('sm_hub_updates')
        .select('*')
        .eq('feed_eligible', true)
        .order('published_at', { ascending: false })
        .limit(20),
      supabaseAdmin
        .from('sm_box_scores')
        .select('*')
        .eq('feed_eligible', true)
        .in('game_status', ['live', 'final'])
        .order('updated_at', { ascending: false })
        .limit(10),
      supabaseAdmin
        .from('sm_trade_proposals_feed')
        .select('*')
        .eq('editor_approved', true)
        .eq('rejected', false)
        .order('approved_at', { ascending: false })
        .limit(10),
    ]);

    const posts = postsResult?.data ?? [];
    const hubUpdates = hubResult?.data ?? [];
    const boxScores = boxResult?.data ?? [];
    const tradeProposals = tradesResult?.data ?? [];

    const allCandidates: ScoredCard[] = [];

    for (const post of posts) {
      const engVel = post.engagement_velocity ?? 0;
      const cardType: CardType = engVel > 10 ? 'trending_article' : 'scout_summary';
      const catSlug = (post.category as { slug?: string } | null)?.slug ?? null;
      const postTeamSlug = categorySlugToTeamSlug(catSlug);

      const score = scorePostCandidate(
        { id: post.id, published_at: post.published_at, team_slug: postTeamSlug, view_count: post.views ?? 0, engagement_velocity: engVel, importance_score: null },
        scoringCtx
      );

      allCandidates.push({
        card_type: cardType,
        score,
        card: makeCard(`post_${post.id}`, cardType, post.published_at, {
          title: post.title, slug: post.slug, featured_image: post.featured_image,
          excerpt: post.excerpt, scout_summary: post.scout_summary,
          engagement_velocity: engVel, view_count: post.views, team_slug: postTeamSlug,
        }, sessionId, userSegment, postTeamSlug),
      });
    }

    for (const hu of hubUpdates) {
      const score = scoreGenericCandidate('hub_update', hu.published_at, hu.team_slug, scoringCtx, hu.is_live ? 10 : 0);
      allCandidates.push({
        card_type: 'hub_update',
        score,
        card: makeCard(`hub_${hu.id}`, 'hub_update', hu.published_at, {
          team_slug: hu.team_slug, category: hu.category, author_name: hu.author_name,
          author_avatar_url: hu.author_avatar_url, content: hu.content,
          confidence_pct: hu.confidence_pct, is_live: hu.is_live,
          reply_count: hu.reply_count, like_count: hu.like_count,
        }, sessionId, userSegment, hu.team_slug),
      });
    }

    for (const bs of boxScores) {
      const liveBoost = bs.game_status === 'live' ? 30 : 0;
      const score = scoreGenericCandidate('box_score', bs.updated_at, bs.team_slug, scoringCtx, liveBoost);
      allCandidates.push({
        card_type: 'box_score',
        score,
        card: makeCard(bs.card_id ?? `box_${bs.id}`, 'box_score', bs.updated_at, {
          team_slug: bs.team_slug, home_team_abbr: bs.home_team_abbr, away_team_abbr: bs.away_team_abbr,
          home_team_logo_url: bs.home_team_logo_url, away_team_logo_url: bs.away_team_logo_url,
          home_score: bs.home_score, away_score: bs.away_score, game_status: bs.game_status,
          quarter_scores: bs.quarter_scores, top_performers: bs.top_performers,
          game_narrative: bs.game_narrative, game_date: bs.game_date, target_url: bs.target_url,
        }, sessionId, userSegment, bs.team_slug),
      });
    }

    for (const tp of tradeProposals) {
      const score = scoreGenericCandidate('trade_proposal', tp.approved_at ?? tp.created_at, tp.team_a_slug, scoringCtx);
      allCandidates.push({
        card_type: 'trade_proposal',
        score,
        card: makeCard(`trade_${tp.id}`, 'trade_proposal', tp.approved_at ?? tp.created_at, {
          submitted_by_username: tp.submitted_by_username, team_a_slug: tp.team_a_slug,
          team_b_slug: tp.team_b_slug, team_a_receives: tp.team_a_receives,
          team_b_receives: tp.team_b_receives, trade_score: tp.trade_score,
          ai_reasoning: tp.ai_reasoning,
        }, sessionId, userSegment, tp.team_a_slug),
      });
    }

    scoreRiverCandidates(allCandidates, scoringCtx);
    allCandidates.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.card.card_id < b.card.card_id ? -1 : a.card.card_id > b.card.card_id ? 1 : 0;
    });

    const riverCards = allCandidates.slice(0, limit).map(c => c.card);

    const lastScored = allCandidates[limit - 1];
    const cursorData = lastScored
      ? { last_score: lastScored.score, last_id: lastScored.card.card_id }
      : { last_score: 0, last_id: '' };
    const cursor = Buffer.from(JSON.stringify(cursorData)).toString('base64url');

    return { cards: riverCards, cursor };
  } catch (e) {
    console.error('[RiverPage] Failed to fetch initial cards:', e);
    return { cards: [], cursor: '' };
  }
}

export default async function RiverPage() {
  const { cards, cursor } = await getInitialRiverCards();
  return <RiverPageClient initialCards={cards} initialCursor={cursor} />;
}
