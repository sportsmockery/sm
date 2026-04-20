import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';
import { datalabAdmin } from '@/lib/supabase-datalab';

// =============================================================================
// Types
// =============================================================================

type Team = 'Bears' | 'Bulls' | 'Cubs' | 'White Sox' | 'Blackhawks' | 'Other';

type Story = {
  id: string;
  title: string;
  url: string;
  imageUrl: string;
  team: Team;
  summary?: string;
  publishedAt: string;
  views: number;
};

type GameResult = {
  id: string;
  team: Team;
  teamSlug: string;
  opponent: string;
  opponentFull: string;
  teamScore: number;
  opponentScore: number;
  isHome: boolean;
  result: 'W' | 'L' | 'OTL' | null;
  gameDate: string;
  scoresUrl: string;
};

// =============================================================================
// Team Mapping
// =============================================================================

const CATEGORY_TO_TEAM: Record<string, Team> = {
  bears: 'Bears',
  'chicago-bears': 'Bears',
  bulls: 'Bulls',
  'chicago-bulls': 'Bulls',
  cubs: 'Cubs',
  'chicago-cubs': 'Cubs',
  'white-sox': 'White Sox',
  'chicago-white-sox': 'White Sox',
  whitesox: 'White Sox',
  sox: 'White Sox',
  blackhawks: 'Blackhawks',
  'chicago-blackhawks': 'Blackhawks',
  'Chicago Bears': 'Bears',
  'Chicago Bulls': 'Bulls',
  'Chicago Cubs': 'Cubs',
  'Chicago White Sox': 'White Sox',
  'Chicago Blackhawks': 'Blackhawks',
};

function mapCategoryToTeam(category?: { slug?: string; name?: string }): Team {
  if (!category) return 'Other';

  if (category.slug && CATEGORY_TO_TEAM[category.slug.toLowerCase()]) {
    return CATEGORY_TO_TEAM[category.slug.toLowerCase()];
  }

  if (category.name && CATEGORY_TO_TEAM[category.name]) {
    return CATEGORY_TO_TEAM[category.name];
  }

  const name = (category.name || category.slug || '').toLowerCase();
  if (name.includes('bear')) return 'Bears';
  if (name.includes('bull')) return 'Bulls';
  if (name.includes('cub')) return 'Cubs';
  if (name.includes('sox') || name.includes('white')) return 'White Sox';
  if (name.includes('hawk') || name.includes('blackhawk')) return 'Blackhawks';

  return 'Other';
}

// =============================================================================
// Game Scores Fetcher
// =============================================================================

const TEAM_GAME_CONFIG = [
  {
    team: 'Bears' as Team,
    slug: 'chicago-bears',
    table: 'bears_games_master',
    scoreCol: 'bears_score',
    winCol: 'bears_win',
    homeCol: 'is_bears_home',
  },
  {
    team: 'Bulls' as Team,
    slug: 'chicago-bulls',
    table: 'bulls_games_master',
    scoreCol: 'bulls_score',
    winCol: 'bulls_win',
    homeCol: 'is_bulls_home',
  },
  {
    team: 'Blackhawks' as Team,
    slug: 'chicago-blackhawks',
    table: 'blackhawks_games_master',
    scoreCol: 'blackhawks_score',
    winCol: 'blackhawks_win',
    homeCol: 'is_blackhawks_home',
    hasOT: true,
  },
  {
    team: 'Cubs' as Team,
    slug: 'chicago-cubs',
    table: 'cubs_games_master',
    scoreCol: 'cubs_score',
    winCol: 'cubs_win',
    homeCol: 'is_cubs_home',
  },
  {
    team: 'White Sox' as Team,
    slug: 'chicago-white-sox',
    table: 'whitesox_games_master',
    scoreCol: 'whitesox_score',
    winCol: 'whitesox_win',
    homeCol: 'is_whitesox_home',
  },
];

async function fetchGameResults(dateStr: string, baseUrl: string): Promise<GameResult[]> {
  const results: GameResult[] = [];

  await Promise.all(
    TEAM_GAME_CONFIG.map(async (config) => {
      try {
        const { data, error } = await datalabAdmin
          .from(config.table)
          .select(
            `id, game_date, opponent, opponent_full_name, ${config.scoreCol}, opponent_score, ${config.winCol}, ${config.homeCol}${config.hasOT ? ', is_overtime' : ''}`
          )
          .eq('game_date', dateStr)
          .or(`${config.scoreCol}.gt.0,opponent_score.gt.0`);

        if (error || !data || data.length === 0) return;

        for (const game of data) {
          const g = game as Record<string, any>;
          const teamScore = g[config.scoreCol] || 0;
          const oppScore = g.opponent_score || 0;
          const isPlayed = teamScore > 0 || oppScore > 0;

          if (!isPlayed) continue;

          let result: 'W' | 'L' | 'OTL' | null = null;
          if (g[config.winCol]) {
            result = 'W';
          } else if (config.hasOT && g.is_overtime) {
            result = 'OTL';
          } else {
            result = 'L';
          }

          results.push({
            id: g.id,
            team: config.team,
            teamSlug: config.slug,
            opponent: g.opponent || '',
            opponentFull: g.opponent_full_name || g.opponent || '',
            teamScore,
            opponentScore: oppScore,
            isHome: g[config.homeCol] || false,
            result,
            gameDate: g.game_date,
            scoresUrl: `${baseUrl}/${config.slug}/scores`,
          });
        }
      } catch (err) {
        console.error(`[Daily API] Error fetching ${config.team} games:`, err);
      }
    })
  );

  return results;
}

// =============================================================================
// YouTube Channel Videos (last 24h)
// =============================================================================

const YT_CHANNELS = [
  { handle: '@untoldchicago', name: 'Untold Chicago Stories' },
  { handle: '@PinwheelsandIvyPodcast', name: 'Pinwheels & Ivy' },
  { handle: '@nostrokes', name: 'No Strokes Golf' },
];

type ChannelVideoRaw = {
  title: string;
  videoId: string;
  thumbnail: string;
  channelName: string;
  publishedAt: string;
};

async function fetchRecentChannelVideos(since: string): Promise<ChannelVideoRaw[]> {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) return [];

  const results: ChannelVideoRaw[] = [];

  await Promise.all(
    YT_CHANNELS.map(async (ch) => {
      try {
        // 1) Get channel's uploads playlist
        const chUrl = new URL('https://www.googleapis.com/youtube/v3/channels');
        chUrl.searchParams.set('part', 'contentDetails');
        chUrl.searchParams.set('forHandle', ch.handle);
        chUrl.searchParams.set('key', apiKey);
        const chRes = await fetch(chUrl.toString(), { next: { revalidate: 0 } });
        if (!chRes.ok) return;
        const chJson = await chRes.json();
        const playlistId = chJson.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;
        if (!playlistId) return;

        // 2) Get recent playlist items
        const plUrl = new URL('https://www.googleapis.com/youtube/v3/playlistItems');
        plUrl.searchParams.set('part', 'snippet,contentDetails');
        plUrl.searchParams.set('playlistId', playlistId);
        plUrl.searchParams.set('maxResults', '5');
        plUrl.searchParams.set('key', apiKey);
        const plRes = await fetch(plUrl.toString(), { next: { revalidate: 0 } });
        if (!plRes.ok) return;
        const plJson = await plRes.json();

        const sinceDate = new Date(since);
        for (const item of plJson.items || []) {
          const pub = item.snippet?.publishedAt;
          if (!pub || new Date(pub) < sinceDate) continue;
          const thumbs = item.snippet?.thumbnails || {};
          const thumb = thumbs.high?.url || thumbs.medium?.url || thumbs.default?.url || '';
          results.push({
            title: item.snippet?.title || '',
            videoId: item.contentDetails?.videoId || '',
            thumbnail: thumb,
            channelName: ch.name,
            publishedAt: pub,
          });
        }
      } catch (err) {
        console.error(`[Daily API] YouTube ${ch.name} error:`, err);
      }
    })
  );

  return results.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
}

// =============================================================================
// GET /api/daily?date=YYYY-MM-DD
// =============================================================================

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const dateParam = searchParams.get('date');

    // Parse date (default: yesterday)
    let targetDate: Date;
    if (dateParam) {
      targetDate = new Date(dateParam + 'T00:00:00');
      if (isNaN(targetDate.getTime())) {
        return NextResponse.json(
          { error: 'Invalid date format. Use YYYY-MM-DD.' },
          { status: 400 }
        );
      }
    } else {
      targetDate = new Date();
      targetDate.setDate(targetDate.getDate() - 1);
    }

    // Build date range for the target day
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const dateStr = targetDate.toISOString().split('T')[0];
    const baseUrl =
      process.env.NEXT_PUBLIC_SITE_URL || 'https://test.sportsmockery.com';

    // Fetch stories + game results + channel videos in parallel
    const [postsResult, gameResults, channelVideos] = await Promise.all([
      supabaseAdmin
        .from('sm_posts')
        .select(
          `
        id,
        title,
        slug,
        excerpt,
        featured_image,
        published_at,
        views,
        category:sm_categories(id, name, slug)
      `
        )
        .eq('status', 'published')
        .gte('published_at', startOfDay.toISOString())
        .lte('published_at', endOfDay.toISOString())
        .order('views', { ascending: false }),
      fetchGameResults(dateStr, baseUrl),
      fetchRecentChannelVideos(startOfDay.toISOString()),
    ]);

    const { data: posts, error } = postsResult;

    if (error) {
      console.error('[Daily API] Query error:', error);
    }

    // Map stories
    const stories: Story[] = (posts || []).map((post: any) => ({
      id: post.id,
      title: post.title,
      url: `${baseUrl}/${post.slug}`,
      imageUrl: post.featured_image || `${baseUrl}/placeholder.jpg`,
      team: mapCategoryToTeam(
        post.category as { slug?: string; name?: string }
      ),
      summary: post.excerpt || undefined,
      publishedAt: post.published_at || new Date().toISOString(),
      views: post.views || 0,
    }));

    // Map channel videos
    const videos = channelVideos.map((v) => ({
      title: v.title,
      url: `https://www.youtube.com/watch?v=${v.videoId}`,
      thumbnail_url: v.thumbnail,
      channel_name: v.channelName,
      published_at: v.publishedAt,
    }));

    // Return combined response
    return NextResponse.json(
      {
        stories,
        gameResults,
        channelVideos: videos,
        date: dateStr,
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        },
      }
    );
  } catch (err) {
    console.error('[Daily API] Error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
