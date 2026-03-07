import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { supabaseAdmin } from '@/lib/supabase-server';
import { generateTrackingToken } from '@/lib/river-tokens';
import { scorePostCandidate, scoreGenericCandidate, scoreRiverCandidates, type ScoredCard, type RiverScoringContext } from '@/lib/river-scoring';
import { isProTier } from '@/lib/stripe';
import { TEAM_CATEGORY_SLUGS } from '@/lib/db';
import type { UserEngagementProfile } from '@/lib/scoring-v2';
import type { CardType, RiverCard, RiverFeedResponse, SmFeedRule, TeamSlug, UserSegment } from '@/lib/river-types';

// ---------------------------------------------------------------------------
// Constants
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

const FEED_MODE_CARD_FILTERS: Record<string, CardType[] | null> = {
  for_you: null, // all types
  live: null, // special handling
  trending: null, // special sorting
  scout: ['scout_summary', 'trending_article'],
  community: ['fan_chat', 'poll', 'comment_spotlight', 'trade_proposal'],
  watch: ['vision_theater'],
  listen: ['listen_now'],
  data: ['infographic', 'chart', 'box_score'],
};

const VALID_TEAM_SLUGS = new Set(['bears', 'cubs', 'bulls', 'blackhawks', 'white-sox', 'all']);
const VALID_MODES = new Set(Object.keys(FEED_MODE_CARD_FILTERS));
const DRAFT_ELIGIBLE_TEAMS = new Set(['bears', 'cubs']);

// ---------------------------------------------------------------------------
// Feed Rules Cache (in-memory, 60s TTL)
// ---------------------------------------------------------------------------

let cachedRules: Map<CardType, SmFeedRule> | null = null;
let cacheTimestamp = 0;
const RULES_CACHE_TTL = 60_000;

async function getFeedRules(): Promise<Map<CardType, SmFeedRule>> {
  if (cachedRules && Date.now() - cacheTimestamp < RULES_CACHE_TTL) {
    return cachedRules;
  }
  const { data, error } = await supabaseAdmin
    .from('sm_feed_rules')
    .select('*');
  if (error) {
    console.error('[river] Failed to fetch feed rules:', error.message);
    return cachedRules ?? new Map();
  }
  const map = new Map<CardType, SmFeedRule>();
  for (const row of data ?? []) {
    map.set(row.card_type as CardType, row as SmFeedRule);
  }
  cachedRules = map;
  cacheTimestamp = Date.now();
  return map;
}

// ---------------------------------------------------------------------------
// Cursor helpers
// ---------------------------------------------------------------------------

interface CursorData {
  last_score: number;
  last_id: string;
}

function decodeCursor(cursor: string | null): CursorData | null {
  if (!cursor) return null;
  try {
    return JSON.parse(Buffer.from(cursor, 'base64url').toString());
  } catch {
    return null;
  }
}

function encodeCursor(data: CursorData): string {
  return Buffer.from(JSON.stringify(data)).toString('base64url');
}

// ---------------------------------------------------------------------------
// User segment detection
// ---------------------------------------------------------------------------

async function detectUserSegment(req: NextRequest): Promise<{ segment: UserSegment; userId: string | null }> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseAnonKey) {
      return { segment: 'anonymous', userId: null };
    }

    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll() {},
      },
    });

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { segment: 'anonymous', userId: null };

    // Check for SM+ subscription in the subscriptions table
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
// Load user engagement profile for personalized scoring
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
    // Build team_scores from favorite teams: favorites get 80, others get default 30
    const teamScores: Record<string, number> = {
      bears: 30,
      cubs: 30,
      bulls: 30,
      blackhawks: 30,
      'white-sox': 30,
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
// Static marketing card generators
// ---------------------------------------------------------------------------

function generateStaticCards(
  teamFilter: string | null,
  userSegment: UserSegment,
  sessionId: string
): ScoredCard[] {
  const cards: ScoredCard[] = [];
  const now = new Date().toISOString();

  // SM+ promo (skip for SM+ users)
  if (userSegment !== 'sm_plus') {
    cards.push({
      card_type: 'sm_plus',
      score: 10,
      card: makeCard('promo_sm_plus', 'sm_plus', now, {
        headline: 'Upgrade to SM+',
        description: 'Get exclusive analysis, ad-free experience, and more.',
        cta_url: '/sm-plus',
        cta_label: 'Learn More',
      }, sessionId, userSegment, teamFilter),
    });
  }

  // Newsletter
  cards.push({
    card_type: 'join_newsletter',
    score: 5,
    card: makeCard('promo_newsletter', 'join_newsletter', now, {
      headline: 'Chicago Sports Daily',
      description: 'Get the top stories delivered to your inbox every morning.',
      cta_url: '/newsletter',
      cta_label: 'Subscribe Free',
    }, sessionId, userSegment, teamFilter),
  });

  // App download
  cards.push({
    card_type: 'download_app',
    score: 5,
    card: makeCard('promo_app', 'download_app', now, {
      headline: 'Get the SM App',
      description: 'Live scores, breaking news, and Scout AI in your pocket.',
      cta_url: '/app',
      cta_label: 'Download Now',
    }, sessionId, userSegment, teamFilter),
  });

  // Mock draft card (only for explicit draft-eligible team filters during Mar-May)
  const month = new Date().getMonth() + 1;
  if (month >= 3 && month <= 5 && teamFilter && DRAFT_ELIGIBLE_TEAMS.has(teamFilter)) {
    cards.push({
      card_type: 'mock_draft',
      score: 20,
      card: makeCard('promo_mock_draft', 'mock_draft', now, {
        headline: '2026 Mock Draft',
        description: 'Build your dream draft. See how the experts would pick.',
        cta_url: '/mock-draft',
        cta_label: 'Start Your Mock',
        team_slug: teamFilter,
      }, sessionId, userSegment, teamFilter),
    });
  }

  return cards;
}

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
// Insertion rules enforcement
// ---------------------------------------------------------------------------

function applyInsertionRules(
  candidates: ScoredCard[],
  rules: Map<CardType, SmFeedRule>,
  limit: number,
  userSegment: UserSegment
): RiverCard[] {
  const result: RiverCard[] = [];
  const lastSeenIndex = new Map<CardType, number>();

  for (const candidate of candidates) {
    if (result.length >= limit) break;

    const rule = rules.get(candidate.card_type);
    if (!rule || !rule.enabled) {
      result.push(candidate.card);
      continue;
    }

    const currentIndex = result.length;
    const lastIndex = lastSeenIndex.get(candidate.card_type) ?? -999;

    // Check max_per_n_cards within the last n_cards_window
    const windowStart = Math.max(0, currentIndex - rule.n_cards_window);
    const countInWindow = result
      .slice(windowStart)
      .filter(c => c.card_type === candidate.card_type).length;

    if (countInWindow >= rule.max_per_n_cards) continue;

    // Check min_gap_cards
    if (currentIndex - lastIndex < rule.min_gap_cards) continue;

    // SM+ users: skip sm_plus marketing cards
    if (candidate.card_type === 'sm_plus' && userSegment === 'sm_plus') continue;

    result.push(candidate.card);
    lastSeenIndex.set(candidate.card_type, currentIndex);
  }

  return result;
}

// ---------------------------------------------------------------------------
// Main handler
// ---------------------------------------------------------------------------

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const cursorParam = searchParams.get('cursor');
    const teamParam = searchParams.get('team') ?? 'all';
    const modeParam = searchParams.get('mode') ?? 'for_you';
    const limitParam = Math.min(Math.max(parseInt(searchParams.get('limit') ?? '20', 10) || 20, 1), 40);

    // Validate params
    const teamFilter = VALID_TEAM_SLUGS.has(teamParam) ? teamParam : 'all';
    const feedMode = VALID_MODES.has(modeParam) ? modeParam : 'for_you';
    const cursor = decodeCursor(cursorParam);
    const sessionId = req.headers.get('x-session-id') ?? crypto.randomUUID();

    // 1. Auth & segment detection, feed rules, algorithm state — in parallel
    const [{ segment: userSegment, userId }, rules, algorithmState] = await Promise.all([
      detectUserSegment(req),
      getFeedRules(),
      detectAlgorithmState(),
    ]);

    // 2. Load user engagement profile for personalized scoring
    const userProfile = userId ? await loadUserEngagementProfile(userId) : null;

    const scoringCtx: RiverScoringContext = {
      user: userProfile,
      isLoggedIn: userSegment !== 'anonymous',
      viewedPostIds: new Set(),
      algorithmState,
      teamFilter: teamFilter !== 'all' ? teamFilter : null,
    };

    // 3. Parallel data fetching
    const teamFilterQuery = teamFilter !== 'all' ? teamFilter : null;

    const [postsResult, hubResult, boxResult, tradesResult, pollsResult, chartsResult, chatResult, videosResult] = await Promise.all([
      // sm_posts (with category join for team_slug derivation)
      (async () => {
        try {
          let query = supabaseAdmin
            .from('sm_posts')
            .select('id, title, slug, featured_image, excerpt, scout_summary, engagement_velocity, published_at, category_id, views, category:sm_categories!category_id(slug)')
            .eq('status', 'published')
            .order('published_at', { ascending: false })
            .limit(60);
          return await query;
        } catch (e) {
          console.error('[river] sm_posts query failed:', e);
          return { data: null, error: e };
        }
      })(),
      // sm_hub_updates
      (async () => {
        try {
          let query = supabaseAdmin
            .from('sm_hub_updates')
            .select('*')
            .eq('feed_eligible', true)
            .order('published_at', { ascending: false })
            .limit(20);
          if (teamFilterQuery) query = query.eq('team_slug', teamFilterQuery);
          return await query;
        } catch (e) {
          console.error('[river] sm_hub_updates query failed:', e);
          return { data: null, error: e };
        }
      })(),
      // sm_box_scores
      (async () => {
        try {
          let query = supabaseAdmin
            .from('sm_box_scores')
            .select('*')
            .eq('feed_eligible', true)
            .in('game_status', ['live', 'final'])
            .order('updated_at', { ascending: false })
            .limit(10);
          if (teamFilterQuery) query = query.eq('team_slug', teamFilterQuery);
          return await query;
        } catch (e) {
          console.error('[river] sm_box_scores query failed:', e);
          return { data: null, error: e };
        }
      })(),
      // sm_trade_proposals_feed
      (async () => {
        try {
          let query = supabaseAdmin
            .from('sm_trade_proposals_feed')
            .select('*')
            .eq('editor_approved', true)
            .eq('rejected', false)
            .order('approved_at', { ascending: false })
            .limit(10);
          return await query;
        } catch (e) {
          console.error('[river] sm_trade_proposals_feed query failed:', e);
          return { data: null, error: e };
        }
      })(),
      // sm_polls (active polls for community/poll feed)
      (async () => {
        try {
          return await supabaseAdmin
            .from('sm_polls')
            .select('id, question, status, created_at, updated_at')
            .eq('status', 'active')
            .order('created_at', { ascending: false })
            .limit(10);
        } catch (e) {
          console.error('[river] sm_polls query failed:', e);
          return { data: null, error: e };
        }
      })(),
      // sm_charts (for data/chart feed)
      (async () => {
        try {
          return await supabaseAdmin
            .from('sm_charts')
            .select('id, title, options, created_at, updated_at')
            .order('created_at', { ascending: false })
            .limit(10);
        } catch (e) {
          console.error('[river] sm_charts query failed:', e);
          return { data: null, error: e };
        }
      })(),
      // chat_messages (recent fan chat for community feed — graceful fallback)
      (async () => {
        try {
          return await supabaseAdmin
            .from('chat_messages')
            .select('id, content, user_id, room_id, created_at')
            .order('created_at', { ascending: false })
            .limit(10);
        } catch (e) {
          console.error('[river] chat_messages query failed (table may not exist):', e);
          return { data: null, error: e };
        }
      })(),
      // sm_posts filtered for video content (vision_theater)
      (async () => {
        try {
          return await supabaseAdmin
            .from('sm_posts')
            .select('id, title, slug, featured_image, excerpt, published_at, views')
            .eq('status', 'published')
            .eq('content_type', 'video')
            .order('published_at', { ascending: false })
            .limit(10);
        } catch (e) {
          console.error('[river] sm_posts video query failed:', e);
          return { data: null, error: e };
        }
      })(),
    ]);

    const posts = postsResult?.data ?? [];
    const hubUpdates = hubResult?.data ?? [];
    const boxScores = boxResult?.data ?? [];
    const tradeProposals = tradesResult?.data ?? [];
    const polls = pollsResult?.data ?? [];
    const charts = chartsResult?.data ?? [];
    const chatMessages = chatResult?.data ?? [];
    const videoPosts = videosResult?.data ?? [];

    // 4. Build scored candidates
    const allCandidates: ScoredCard[] = [];

    // Posts → scout_summary or trending_article
    for (const post of posts) {
      const engVel = post.engagement_velocity ?? 0;
      const cardType: CardType = engVel > 10 ? 'trending_article' : 'scout_summary';
      const catSlug = (post.category as { slug?: string } | null)?.slug ?? null;
      const postTeamSlug = categorySlugToTeamSlug(catSlug);

      const score = scorePostCandidate(
        {
          id: post.id,
          published_at: post.published_at,
          team_slug: postTeamSlug,
          view_count: post.views ?? 0,
          engagement_velocity: engVel,
          importance_score: null,
        },
        scoringCtx
      );

      allCandidates.push({
        card_type: cardType,
        score,
        card: makeCard(
          `post_${post.id}`,
          cardType,
          post.published_at,
          {
            title: post.title,
            slug: post.slug,
            featured_image: post.featured_image,
            excerpt: post.excerpt,
            scout_summary: post.scout_summary,
            engagement_velocity: engVel,
            view_count: post.views,
            team_slug: postTeamSlug,
          },
          sessionId,
          userSegment,
          postTeamSlug
        ),
      });
    }

    // Hub updates
    for (const hu of hubUpdates) {
      const score = scoreGenericCandidate('hub_update', hu.published_at, hu.team_slug, scoringCtx, hu.is_live ? 10 : 0);
      allCandidates.push({
        card_type: 'hub_update',
        score,
        card: makeCard(
          `hub_${hu.id}`,
          'hub_update',
          hu.published_at,
          {
            team_slug: hu.team_slug,
            category: hu.category,
            author_name: hu.author_name,
            author_avatar_url: hu.author_avatar_url,
            content: hu.content,
            confidence_pct: hu.confidence_pct,
            is_live: hu.is_live,
            reply_count: hu.reply_count,
            like_count: hu.like_count,
          },
          sessionId,
          userSegment,
          hu.team_slug
        ),
      });
    }

    // Box scores
    for (const bs of boxScores) {
      const liveBoost = bs.game_status === 'live' ? 30 : 0;
      const score = scoreGenericCandidate('box_score', bs.updated_at, bs.team_slug, scoringCtx, liveBoost);
      allCandidates.push({
        card_type: 'box_score',
        score,
        card: makeCard(
          bs.card_id ?? `box_${bs.id}`,
          'box_score',
          bs.updated_at,
          {
            team_slug: bs.team_slug,
            home_team_abbr: bs.home_team_abbr,
            away_team_abbr: bs.away_team_abbr,
            home_team_logo_url: bs.home_team_logo_url,
            away_team_logo_url: bs.away_team_logo_url,
            home_score: bs.home_score,
            away_score: bs.away_score,
            game_status: bs.game_status,
            quarter_scores: bs.quarter_scores,
            top_performers: bs.top_performers,
            game_narrative: bs.game_narrative,
            game_date: bs.game_date,
            target_url: bs.target_url,
          },
          sessionId,
          userSegment,
          bs.team_slug
        ),
      });
    }

    // Trade proposals
    for (const tp of tradeProposals) {
      const score = scoreGenericCandidate('trade_proposal', tp.approved_at ?? tp.created_at, tp.team_a_slug, scoringCtx);
      allCandidates.push({
        card_type: 'trade_proposal',
        score,
        card: makeCard(
          `trade_${tp.id}`,
          'trade_proposal',
          tp.approved_at ?? tp.created_at,
          {
            submitted_by_username: tp.submitted_by_username,
            team_a_slug: tp.team_a_slug,
            team_b_slug: tp.team_b_slug,
            team_a_receives: tp.team_a_receives,
            team_b_receives: tp.team_b_receives,
            trade_score: tp.trade_score,
            ai_reasoning: tp.ai_reasoning,
          },
          sessionId,
          userSegment,
          tp.team_a_slug
        ),
      });
    }

    // Polls → poll cards
    for (const poll of polls) {
      const score = scoreGenericCandidate('poll', poll.created_at, null, scoringCtx);
      allCandidates.push({
        card_type: 'poll',
        score,
        card: makeCard(
          `poll_${poll.id}`,
          'poll',
          poll.created_at,
          {
            question: poll.question,
            poll_id: poll.id,
          },
          sessionId,
          userSegment,
          null
        ),
      });
    }

    // Charts → chart cards
    for (const chart of charts) {
      const score = scoreGenericCandidate('chart', chart.created_at, null, scoringCtx);
      allCandidates.push({
        card_type: 'chart',
        score,
        card: makeCard(
          `chart_${chart.id}`,
          'chart',
          chart.created_at,
          {
            title: chart.title,
            chart_id: chart.id,
            options: chart.options,
          },
          sessionId,
          userSegment,
          null
        ),
      });
    }

    // Fan chat → fan_chat cards
    // Collect unique room IDs and fetch live user counts from chat_presence
    const chatRoomIds = [...new Set(chatMessages.map((m: any) => m.room_id).filter(Boolean))];
    const roomUserCounts = new Map<string, number>();
    if (chatRoomIds.length > 0) {
      try {
        const { data: presenceData } = await supabaseAdmin
          .from('chat_presence')
          .select('room_id')
          .in('room_id', chatRoomIds)
          .eq('is_online', true);
        if (presenceData) {
          for (const p of presenceData) {
            roomUserCounts.set(p.room_id, (roomUserCounts.get(p.room_id) || 0) + 1);
          }
        }
      } catch {
        // chat_presence may not exist yet — graceful fallback
      }
    }

    // Fetch room titles
    const roomTitles = new Map<string, string>();
    if (chatRoomIds.length > 0) {
      try {
        const { data: rooms } = await supabaseAdmin
          .from('chat_rooms')
          .select('id, team_name')
          .in('id', chatRoomIds);
        if (rooms) {
          for (const r of rooms) {
            roomTitles.set(r.id, r.team_name);
          }
        }
      } catch {
        // graceful fallback
      }
    }

    for (const msg of chatMessages) {
      const score = scoreGenericCandidate('fan_chat', msg.created_at, null, scoringCtx);
      allCandidates.push({
        card_type: 'fan_chat',
        score,
        card: makeCard(
          `chat_${msg.room_id ?? msg.id}`,
          'fan_chat',
          msg.created_at,
          {
            message: msg.content,
            room_id: msg.room_id,
            user_count: roomUserCounts.get(msg.room_id) ?? 0,
            room_title: roomTitles.get(msg.room_id) ?? 'Fan Chat',
          },
          sessionId,
          userSegment,
          null
        ),
      });
    }

    // Video posts → vision_theater cards
    for (const vp of videoPosts) {
      const score = scoreGenericCandidate('vision_theater', vp.published_at, null, scoringCtx);
      allCandidates.push({
        card_type: 'vision_theater',
        score,
        card: makeCard(
          `video_${vp.id}`,
          'vision_theater',
          vp.published_at,
          {
            title: vp.title,
            slug: vp.slug,
            featured_image: vp.featured_image,
            excerpt: vp.excerpt,
            view_count: vp.views,
          },
          sessionId,
          userSegment,
          null
        ),
      });
    }

    // Static injectors for card types that lack dedicated DB sources
    // These ensure mode filtering doesn't collapse to empty for listen, data (infographic), community (comment_spotlight)
    const nowTs = new Date().toISOString();

    if (!allCandidates.some(c => c.card_type === 'listen_now')) {
      allCandidates.push({
        card_type: 'listen_now',
        score: 5,
        card: makeCard('static_listen_now', 'listen_now', nowTs, {
          headline: 'SM Podcasts',
          description: 'Listen to the latest Chicago sports analysis and hot takes.',
          cta_url: '/podcasts',
          cta_label: 'Listen Now',
        }, sessionId, userSegment, null),
      });
    }

    if (!allCandidates.some(c => c.card_type === 'infographic')) {
      allCandidates.push({
        card_type: 'infographic',
        score: 5,
        card: makeCard('static_infographic', 'infographic', nowTs, {
          headline: 'Team Stats at a Glance',
          description: 'Visual breakdowns of your favorite Chicago teams.',
          cta_url: '/data',
          cta_label: 'Explore Data',
        }, sessionId, userSegment, null),
      });
    }

    if (!allCandidates.some(c => c.card_type === 'comment_spotlight')) {
      allCandidates.push({
        card_type: 'comment_spotlight',
        score: 5,
        card: makeCard('static_comment_spotlight', 'comment_spotlight', nowTs, {
          headline: 'Fan Voices',
          description: 'See what the community is saying about Chicago sports.',
          cta_url: '/community',
          cta_label: 'Join the Conversation',
        }, sessionId, userSegment, null),
      });
    }

    if (!allCandidates.some(c => c.card_type === 'trending_player')) {
      allCandidates.push({
        card_type: 'trending_player',
        score: 5,
        card: makeCard('static_trending_player', 'trending_player', nowTs, {
          headline: 'Trending Players',
          description: 'See which Chicago athletes are making headlines.',
          cta_url: '/trending',
          cta_label: 'View Trending',
        }, sessionId, userSegment, null),
      });
    }

    // Static marketing cards
    allCandidates.push(...generateStaticCards(teamFilter !== 'all' ? teamFilter : null, userSegment, sessionId));

    // 5. Apply feed mode filters
    const modeAllowedTypes = FEED_MODE_CARD_FILTERS[feedMode];
    let filtered = allCandidates;

    if (feedMode === 'live') {
      // Only live content
      filtered = allCandidates.filter(c =>
        c.card_type === 'box_score' && (c.card.content as Record<string, unknown>).game_status === 'live' ||
        c.card_type === 'hub_update' && (c.card.content as Record<string, unknown>).is_live === true
      );
    } else if (modeAllowedTypes) {
      const allowed = new Set(modeAllowedTypes);
      filtered = allCandidates.filter(c => allowed.has(c.card_type));
    }

    if (feedMode === 'trending') {
      // Sort by engagement velocity / view count, with deterministic card_id tiebreak
      filtered.sort((a, b) => {
        const aVel = ((a.card.content as Record<string, unknown>).engagement_velocity as number) ?? 0;
        const bVel = ((b.card.content as Record<string, unknown>).engagement_velocity as number) ?? 0;
        if (bVel !== aVel) return bVel - aVel;
        const aViews = ((a.card.content as Record<string, unknown>).view_count as number) ?? 0;
        const bViews = ((b.card.content as Record<string, unknown>).view_count as number) ?? 0;
        if (bViews !== aViews) return bViews - aViews;
        return a.card.card_id < b.card.card_id ? -1 : a.card.card_id > b.card.card_id ? 1 : 0;
      });
    } else {
      // Standard score-based sort with deterministic card_id tiebreak
      scoreRiverCandidates(filtered, scoringCtx);
      filtered.sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return a.card.card_id < b.card.card_id ? -1 : a.card.card_id > b.card.card_id ? 1 : 0;
      });
    }

    // 6. Apply cursor filtering using (score, card_id) composite key
    if (cursor) {
      filtered = filtered.filter(c =>
        c.score < cursor.last_score ||
        (c.score === cursor.last_score && c.card.card_id > cursor.last_id)
      );
    }

    // 7. Team filter: allow some cross-team variety (max 20%)
    if (teamFilter !== 'all' && teamFilterQuery) {
      const teamCards: ScoredCard[] = [];
      const crossCards: ScoredCard[] = [];
      for (const c of filtered) {
        const ts = (c.card.content as Record<string, unknown>).team_slug as string | undefined;
        if (!ts || ts === teamFilterQuery) {
          teamCards.push(c);
        } else {
          crossCards.push(c);
        }
      }
      const maxCross = Math.ceil(limitParam * 0.2);
      filtered = [...teamCards, ...crossCards.slice(0, maxCross)];
      // Re-sort after merging
      filtered.sort((a, b) => b.score - a.score);
    }

    // 8. Apply insertion rules
    const riverCards = applyInsertionRules(filtered, rules, limitParam, userSegment);

    // 9. Build cursor for next page from last emitted card
    const lastEmitted = riverCards.length > 0 ? riverCards[riverCards.length - 1] : null;
    // Find the score of the last emitted card by matching card_id in filtered
    const lastEmittedScored = lastEmitted
      ? filtered.find(c => c.card.card_id === lastEmitted.card_id)
      : null;
    const nextCursorData: CursorData = {
      last_score: lastEmittedScored?.score ?? 0,
      last_id: lastEmitted?.card_id ?? '',
    };
    const hasMore = filtered.length > riverCards.length || posts.length >= 60;

    const response: RiverFeedResponse = {
      feed_meta: {
        next_cursor: encodeCursor(nextCursorData),
        has_more: hasMore,
        algorithm_state: algorithmState,
      },
      river_cards: riverCards,
    };

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': algorithmState === 'game_day_active'
          ? 'public, s-maxage=10, stale-while-revalidate=5'
          : 'public, s-maxage=30, stale-while-revalidate=15',
      },
    });
  } catch (error) {
    console.error('[river] Unhandled error:', error);
    // Return empty feed rather than 500
    const emptyResponse: RiverFeedResponse = {
      feed_meta: {
        next_cursor: '',
        has_more: false,
        algorithm_state: 'standard',
      },
      river_cards: [],
    };
    return NextResponse.json(emptyResponse, { status: 200 });
  }
}
