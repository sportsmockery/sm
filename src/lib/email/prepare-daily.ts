import type {
  DailyEdgeEmailVariables,
  EmailStory,
  ScoreboardGame,
  NetworkItem,
  ChannelVideo,
} from '@/types/daily-email';

const BASE = process.env.NEXT_PUBLIC_SITE_URL || 'https://test.sportsmockery.com';

// =============================================================================
// Raw input types (from /api/daily)
// =============================================================================

type RawStory = {
  id: string;
  title: string;
  url: string;
  imageUrl: string;
  team: string;
  summary?: string;
  publishedAt: string;
  views: number;
};

type RawGame = {
  id: string;
  team: string;
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
// Text utilities
// =============================================================================

function stripHtml(str: string): string {
  return str.replace(/<[^>]*>/g, '').replace(/&[a-z]+;/gi, ' ').replace(/\s+/g, ' ').trim();
}

function truncate(str: string, max: number): string {
  const clean = stripHtml(str);
  if (clean.length <= max) return clean;
  return clean.slice(0, max - 1).trim() + '…';
}

function estimateReadTime(summary?: string, title?: string): number {
  const words = ((summary || '') + ' ' + (title || '')).split(/\s+/).length;
  // Rough: short articles 3 min, medium 5, long 7
  if (words < 40) return 3;
  if (words < 80) return 5;
  return 7;
}

function relativeTime(isoDate: string): string {
  const diff = Date.now() - new Date(isoDate).getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours < 1) return 'Just now';
  if (hours === 1) return '1 hour ago';
  if (hours < 24) return `${hours} hours ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'Yesterday';
  return `${days} days ago`;
}

function makeTagline(team: string, title: string): string {
  const lower = title.toLowerCase();
  const topics: [string, RegExp][] = [
    ['Draft', /draft|pick|prospect|mock/],
    ['Trade', /trade|deal|swap|acquire/],
    ['Free Agency', /free agent|sign|contract/],
    ['Injury', /injur|hurt|out for|sidelined/],
    ['Roster', /roster|lineup|cut|waiv/],
    ['Recap', /recap|final|score|beat|defeat|win|loss/],
    ['Analysis', /analys|breakdown|film|tape/],
    ['Rumor', /rumor|report|source|per/],
  ];
  for (const [label, re] of topics) {
    if (re.test(lower)) return `${team} · ${label}`;
  }
  return `${team} · News`;
}

// =============================================================================
// Transform stories
// =============================================================================

function toEmailStory(raw: RawStory): EmailStory {
  return {
    title: truncate(raw.title, 85),
    summary: truncate(raw.summary || raw.title, 140),
    category: raw.team || 'Chicago',
    tagline: makeTagline(raw.team || 'Chicago', raw.title),
    image_url: raw.imageUrl?.startsWith('http') && !raw.imageUrl.includes('placeholder')
      ? raw.imageUrl : '',
    url: raw.url,
    published_at: raw.publishedAt,
    minutes_read: estimateReadTime(raw.summary, raw.title),
    relative_time: relativeTime(raw.publishedAt),
    views: raw.views || 0,
  };
}

// =============================================================================
// Transform game results
// =============================================================================

function toScoreboardGames(games: RawGame[]): ScoreboardGame[] {
  return games.map((g) => ({
    team_home: g.isHome ? g.team : g.opponentFull,
    team_away: g.isHome ? g.opponentFull : g.team,
    score_home: g.isHome ? g.teamScore : g.opponentScore,
    score_away: g.isHome ? g.opponentScore : g.teamScore,
    status: g.result === 'OTL' ? 'Final/OT' : 'Final',
    winner: g.result === 'W'
      ? (g.isHome ? 'home' : 'away')
      : g.result === 'L'
        ? (g.isHome ? 'away' : 'home')
        : null,
    url: g.scoresUrl,
  }));
}

// =============================================================================
// Generate dynamic text
// =============================================================================

function generateIntroBlurb(hero: EmailStory, stories: EmailStory[]): string {
  const other = stories.find((s) => s.category !== hero.category) || stories[0];
  if (!other || other.title === hero.title) {
    return `Today's lead: ${hero.title}. Plus ${stories.length} more stories from across Chicago sports.`;
  }
  return `${hero.title.replace(/…$/, '')}. Plus: ${other.title.replace(/…$/, '')} and ${Math.max(stories.length - 1, 0)} more.`;
}

function generateScoutExamples(stories: EmailStory[]): string[] {
  // Reorder stories to prioritize team diversity
  const byTeam = new Map<string, EmailStory[]>();
  for (const s of stories) {
    const arr = byTeam.get(s.category) || [];
    arr.push(s);
    byTeam.set(s.category, arr);
  }
  // Round-robin: take 1 from each team, then repeat
  const diverseOrder: EmailStory[] = [];
  let hasMore = true;
  let idx = 0;
  const teams = [...byTeam.keys()];
  while (hasMore && diverseOrder.length < stories.length) {
    hasMore = false;
    for (const team of teams) {
      const arr = byTeam.get(team)!;
      if (idx < arr.length) {
        diverseOrder.push(arr[idx]);
        hasMore = true;
      }
    }
    idx++;
  }

  const examples: string[] = [];

  for (const s of diverseOrder) {
    if (examples.length >= 3) break;
    const t = s.title.toLowerCase();
    const team = s.category;

    // Create a specific question based on each story's actual content
    if (t.includes('should') && t.includes('trade')) {
      // Debate-style article
      const playerMatch = s.title.match(/Trade\s+([A-Z][a-zA-Z]+\s+[A-Z][a-zA-Z]+)/);
      examples.push(playerMatch ? `What's ${playerMatch[1]}'s trade value right now?` : `Should the ${team} be buyers or sellers?`);
    } else if (t.includes('trade')) {
      examples.push(`Why did the ${team} make this trade instead of standing pat?`);
    } else if (t.includes('draft') && t.includes('move down')) {
      examples.push(`What picks could the ${team} get by trading down?`);
    } else if (t.includes('draft')) {
      examples.push(`Who should the ${team} target in the draft?`);
    } else if (t.includes('interest') || t.includes('obsess')) {
      // Extract player name from title if possible
      const nameMatch = s.title.match(/(?:In|With)\s+([A-Z][a-z]+\s+[A-Z][a-z]+)/);
      if (nameMatch) {
        examples.push(`What does ${nameMatch[1]} bring to the ${team}?`);
      } else {
        examples.push(`Who are the ${team} targeting and why?`);
      }
    } else if (t.includes('offensive line') || t.includes('o-line')) {
      examples.push(`How much better is the ${team} offensive line now?`);
    } else if (t.includes('lavine') || t.includes('trade zach')) {
      examples.push(`What's LaVine's trade value right now?`);
    } else if (t.includes('pitcher') || t.includes('ace')) {
      examples.push(`How does this pitching move change the ${team} rotation?`);
    } else if (t.includes('breakout') || t.includes('williams')) {
      examples.push(`Is Caleb Williams on track for a breakout year?`);
    } else {
      examples.push(`What's the latest on the ${team}?`);
    }
  }

  // Deduplicate by team — prefer variety across teams
  const seenTeams = new Set<string>();
  const diverse: string[] = [];
  const sameTeam: string[] = [];
  for (const q of examples) {
    // Extract team name from question
    const teamMatch = q.match(/the (Bears|Bulls|Cubs|White Sox|Blackhawks)/);
    const team = teamMatch ? teamMatch[1] : q;
    if (!seenTeams.has(team)) {
      seenTeams.add(team);
      diverse.push(q);
    } else {
      sameTeam.push(q);
    }
  }
  const deduped = [...diverse, ...sameTeam];

  // Fill to 3 if needed
  while (deduped.length < 3) {
    deduped.push("What are the biggest storylines in Chicago sports today?");
  }

  return deduped.slice(0, 3);
}

function generateScoutDescription(stories: EmailStory[]): string {
  const teams = [...new Set(stories.map((s) => s.category).filter((t) => t !== 'Other'))];
  if (teams.length >= 3) {
    return `Scout has the latest on ${teams.slice(0, 3).join(', ')} and more. Ask anything.`;
  }
  if (teams.length > 0) {
    return `Scout is ready to break down today's ${teams.join(' and ')} news. Ask anything.`;
  }
  return "Get instant AI-powered analysis on any Chicago sports question.";
}

function formatDateLabel(date: Date): string {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${days[date.getDay()]}, ${months[date.getMonth()]} ${date.getDate()} · 6:00 AM CT`;
}

// =============================================================================
// Network items (static)
// =============================================================================

const NETWORK: NetworkItem[] = [
  {
    name: 'Untold Chicago Stories',
    description: 'Raw Chicago documentary series',
    logo_url: `${BASE}/downloads/untold-logo-white.png`,
    url: 'https://www.youtube.com/@untoldchicago',
    color: '#BC0000',
  },
  {
    name: 'Pinwheels & Ivy',
    description: 'Your daily Cubs podcast',
    logo_url: `${BASE}/downloads/pinwheels-ivy-logo-white.png`,
    url: 'https://www.youtube.com/c/PinwheelsandIvyPodcast',
    color: '#2D8B2D',
  },
  {
    name: 'No Strokes Golf',
    description: 'Golf without the handicap',
    logo_url: `${BASE}/downloads/nostrokes-logo.png`,
    url: 'https://www.youtube.com/@nostrokes',
    color: '#1B5E3B',
  },
];

// =============================================================================
// Main: prepare all email variables
// =============================================================================

type RawChannelVideo = {
  title: string;
  url: string;
  thumbnail_url: string;
  channel_name: string;
  published_at: string;
};

export function prepareDailyEmailVariables(
  rawStories: RawStory[],
  rawGames: RawGame[],
  sendDate: Date = new Date(),
  rawVideos: RawChannelVideo[] = [],
): DailyEdgeEmailVariables {
  // Sort by views, transform
  const sorted = [...rawStories].sort((a, b) => b.views - a.views);
  const allStories = sorted.map(toEmailStory);

  const hero = allStories[0];
  const more = allStories.slice(1, 7); // 4–6 stories

  const scoreboard = toScoreboardGames(rawGames);

  return {
    // Header
    date_label: formatDateLabel(sendDate),
    view_in_browser_url: `${BASE}/email/daily/${sendDate.toISOString().split('T')[0]}`,

    // Intro
    intro_blurb: generateIntroBlurb(hero, more),

    // Scoreboard
    scoreboard_games: scoreboard,

    // Hero
    hero_story: hero,

    // Stories
    more_stories: more,
    stories_count: String(allStories.length),
    stories_window_label: 'last 24 hours',
    all_stories_url: BASE,

    // Scout
    scout_title: 'Ask Scout anything about Chicago sports',
    scout_description: generateScoutDescription(allStories),
    scout_examples: generateScoutExamples(allStories),
    scout_url: `${BASE}/ask-ai`,

    // Network
    network_items: NETWORK,

    // Channel videos from last 24h
    channel_videos: rawVideos.slice(0, 4).map((v): ChannelVideo => ({
      title: truncate(v.title, 80),
      url: v.url,
      thumbnail_url: v.thumbnail_url,
      channel_name: v.channel_name,
      published_at: v.published_at,
      relative_time: relativeTime(v.published_at),
    })),

    // App
    app_bullets: [
      'Live scores with real-time win probability',
      'Breaking news alerts for your favorite teams',
      'Personalized feed — only the teams you follow',
    ],
    ios_url: 'https://apps.apple.com/app/sportsmockery',
    android_url: 'https://play.google.com/store/apps/details?id=com.sportsmockery',

    // Footer
    unsubscribe_url: 'https://sportsmockery.com/unsubscribe',
    preferences_url: 'https://sportsmockery.com/preferences',
  };
}
