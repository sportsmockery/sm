/**
 * PostIQ Media Scanner
 * Fetches current headlines from Chicago sports media sources
 * to provide context for AI-generated headlines
 */

import Parser from 'rss-parser'

const parser = new Parser({
  timeout: 5000,
  headers: {
    'User-Agent': 'SportsMockery-PostIQ/1.0',
  },
})

// Team-specific RSS feeds from Media_Source.json
const TEAM_RSS_FEEDS: Record<string, string[]> = {
  bears: [
    'https://www.chicagobears.com/rss/',
    'https://www.espn.com/espn/rss/nfl/news',
    'https://sportstalkchicago.com/feed/',
  ],
  bulls: [
    'https://www.chicagobullshq.com/rss.do',
    'https://www.espn.com/espn/rss/nba/news',
  ],
  cubs: [
    'https://www.bleachernation.com/cubs/feed/',
    'https://www.espn.com/espn/rss/mlb/news',
  ],
  whitesox: [
    'https://www.espn.com/espn/rss/mlb/news',
  ],
  blackhawks: [
    'https://www.espn.com/espn/rss/nhl/news',
  ],
}

// General Chicago sports feeds
const GENERAL_FEEDS = [
  'https://sportstalkchicago.com/feed/',
  'https://www.chicagosportshq.com/rss.do',
]

interface MediaHeadline {
  title: string
  link: string
  source: string
  pubDate: string
  snippet?: string
}

/**
 * Fetch current headlines for a specific team
 */
export async function fetchTeamHeadlines(
  team: string,
  limit: number = 10
): Promise<MediaHeadline[]> {
  const teamKey = team.toLowerCase().replace(/\s+/g, '')
  const feeds = TEAM_RSS_FEEDS[teamKey] || GENERAL_FEEDS
  const allHeadlines: MediaHeadline[] = []

  const feedPromises = feeds.map(async (feedUrl) => {
    try {
      const feed = await parser.parseURL(feedUrl)
      const headlines = (feed.items || []).slice(0, 5).map((item) => ({
        title: item.title || '',
        link: item.link || '',
        source: feed.title || feedUrl,
        pubDate: item.pubDate || '',
        snippet: item.contentSnippet?.slice(0, 200) || '',
      }))
      return headlines
    } catch (error) {
      console.error(`Failed to fetch RSS feed ${feedUrl}:`, error)
      return []
    }
  })

  const results = await Promise.allSettled(feedPromises)

  for (const result of results) {
    if (result.status === 'fulfilled') {
      allHeadlines.push(...result.value)
    }
  }

  // Sort by date (newest first) and limit
  return allHeadlines
    .sort((a, b) => {
      const dateA = new Date(a.pubDate).getTime() || 0
      const dateB = new Date(b.pubDate).getTime() || 0
      return dateB - dateA
    })
    .slice(0, limit)
}

/**
 * Format headlines for inclusion in AI prompt
 */
export function formatHeadlinesForPrompt(headlines: MediaHeadline[]): string {
  if (headlines.length === 0) {
    return ''
  }

  const formatted = headlines
    .map((h, i) => `${i + 1}. "${h.title}" - ${h.source}`)
    .join('\n')

  return `
CURRENT MEDIA HEADLINES (for context - match the urgency and angles):
${formatted}

Use these current headlines to inform your angle and urgency. Your headlines should feel timely and relevant to what's happening NOW in Chicago sports.
`
}

/**
 * Get trending topics from recent headlines
 */
export function extractTrendingTopics(headlines: MediaHeadline[]): string[] {
  const topics: string[] = []

  // Extract player names, team mentions, and key events
  const patterns = [
    /Caleb Williams/gi,
    /DJ Moore/gi,
    /Rome Odunze/gi,
    /Zach LaVine/gi,
    /DeMar DeRozan/gi,
    /Connor Bedard/gi,
    /playoff/gi,
    /trade/gi,
    /injury/gi,
    /contract/gi,
    /draft/gi,
    /free agent/gi,
  ]

  for (const headline of headlines) {
    for (const pattern of patterns) {
      const matches = headline.title.match(pattern)
      if (matches) {
        topics.push(...matches)
      }
    }
  }

  // Dedupe and return
  return [...new Set(topics.map(t => t.toLowerCase()))]
}

/**
 * Full media context builder for PostIQ
 */
export async function getMediaContext(team?: string): Promise<{
  headlines: MediaHeadline[]
  promptContext: string
  trendingTopics: string[]
}> {
  const headlines = team
    ? await fetchTeamHeadlines(team, 10)
    : await fetchTeamHeadlines('general', 10)

  return {
    headlines,
    promptContext: formatHeadlinesForPrompt(headlines),
    trendingTopics: extractTrendingTopics(headlines),
  }
}
