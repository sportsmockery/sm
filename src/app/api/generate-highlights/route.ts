import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'
import Anthropic from '@anthropic-ai/sdk'

/**
 * AI-Generated Highlights API Route
 *
 * POST /api/generate-highlights
 *
 * This route generates dynamic AI highlights for Chicago sports teams:
 * - Called on team page load (no user input required)
 * - Uses Claude AI to create 3-5 highlights per team
 * - Caches results in Supabase (sm_highlights table)
 * - Refreshes every 60 minutes
 *
 * Highlight types:
 * - chart: JSON data for Chart.js (line/bar charts)
 * - data: Text stats (e.g., "Win Probability 58%")
 * - meme: Description for meme generation
 * - commentary: Witty mockery text
 * - video_highlight: Short clip (5-15s) from official sources with overlay instructions
 *
 * Video Clip Guidelines (Fair Use):
 * - Max 5-15 seconds per clip
 * - Must be transformative (overlaid with commentary, memes, charts)
 * - Embed from official sources only (NFL/NBA/MLB/NHL YouTube)
 * - Always credit source
 * - 1-3 clips per highlight reel maximum
 */

// Cache duration in milliseconds (60 minutes)
const CACHE_DURATION = 60 * 60 * 1000

// Team configurations
const TEAM_CONFIG: Record<string, {
  name: string
  league: string
  fullName: string
}> = {
  'chicago-bears': { name: 'Bears', league: 'NFL', fullName: 'Chicago Bears' },
  'chicago-bulls': { name: 'Bulls', league: 'NBA', fullName: 'Chicago Bulls' },
  'chicago-blackhawks': { name: 'Blackhawks', league: 'NHL', fullName: 'Chicago Blackhawks' },
  'chicago-cubs': { name: 'Cubs', league: 'MLB', fullName: 'Chicago Cubs' },
  'chicago-white-sox': { name: 'White Sox', league: 'MLB', fullName: 'Chicago White Sox' },
}

export async function POST(request: NextRequest) {
  try {
    const { teamSlug } = await request.json()

    if (!teamSlug || !TEAM_CONFIG[teamSlug]) {
      return NextResponse.json(
        { error: 'Invalid team slug' },
        { status: 400 }
      )
    }

    const teamConfig = TEAM_CONFIG[teamSlug]

    // Check cache first
    const cachedHighlights = await getCachedHighlights(teamSlug)
    if (cachedHighlights) {
      return NextResponse.json({ highlights: cachedHighlights, cached: true })
    }

    // Generate new highlights with Claude
    const highlights = await generateHighlightsWithClaude(teamSlug, teamConfig)

    // Cache the results
    await cacheHighlights(teamSlug, highlights)

    return NextResponse.json({ highlights, cached: false })
  } catch (error) {
    console.error('Generate highlights error:', error)

    // Return fallback mock data on error
    const { teamSlug } = await request.json().catch(() => ({ teamSlug: 'chicago-bears' }))
    const fallbackHighlights = generateFallbackHighlights(teamSlug)

    return NextResponse.json({
      highlights: fallbackHighlights,
      cached: false,
      fallback: true,
    })
  }
}

/**
 * Check for cached highlights in Supabase
 */
async function getCachedHighlights(teamSlug: string) {
  try {
    const { data, error } = await supabaseAdmin
      .from('sm_highlights')
      .select('highlights, updated_at')
      .eq('team_slug', teamSlug)
      .single()

    if (error || !data) return null

    // Check if cache is still valid
    const updatedAt = new Date(data.updated_at).getTime()
    const now = Date.now()

    if (now - updatedAt < CACHE_DURATION) {
      return data.highlights
    }

    return null
  } catch {
    return null
  }
}

/**
 * Cache highlights in Supabase
 */
async function cacheHighlights(teamSlug: string, highlights: unknown[]) {
  try {
    await supabaseAdmin
      .from('sm_highlights')
      .upsert({
        team_slug: teamSlug,
        highlights,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'team_slug',
      })
  } catch (error) {
    console.error('Cache highlights error:', error)
  }
}

/**
 * Generate highlights using Claude AI
 */
async function generateHighlightsWithClaude(
  teamSlug: string,
  teamConfig: typeof TEAM_CONFIG[string]
) {
  // Check if Anthropic API key is available
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    console.warn('Anthropic API key not found, using fallback highlights')
    return generateFallbackHighlights(teamSlug)
  }

  try {
    const anthropic = new Anthropic({ apiKey })

    const prompt = `Generate exactly 4-5 dynamic sports highlights for the ${teamConfig.fullName} (${teamConfig.league}). Return ONLY valid JSON (no markdown, no explanation).

Format your response as a JSON array with this exact structure:
[
  {
    "id": "unique-id",
    "type": "chart",
    "title": "Performance Trend Title",
    "content": {
      "labels": ["Week 1", "Week 2", "Week 3", "Week 4", "Week 5"],
      "datasets": [{"label": "Stat Name", "data": [numbers], "fill": true}],
      "chartType": "line"
    },
    "shareText": "Tweet text",
    "timestamp": "${new Date().toISOString()}"
  },
  {
    "id": "unique-id-2",
    "type": "data",
    "title": "Key Stat Alert",
    "content": "Win Probability: 58%",
    "shareText": "Tweet text",
    "timestamp": "${new Date().toISOString()}"
  },
  {
    "id": "unique-id-3",
    "type": "meme",
    "title": "Meme Title",
    "content": "Meme description for image generation",
    "shareText": "Tweet text",
    "timestamp": "${new Date().toISOString()}"
  },
  {
    "id": "unique-id-4",
    "type": "commentary",
    "title": "Commentary Title",
    "content": "Witty commentary about the team",
    "shareText": "Tweet text",
    "timestamp": "${new Date().toISOString()}"
  },
  {
    "id": "unique-id-5",
    "type": "video_highlight",
    "title": "Clip: Key Moment Title",
    "content": {
      "video_url": "https://www.youtube.com/watch?v=OFFICIAL_VIDEO_ID",
      "overlay_text": "AI mockery overlay text for the clip",
      "credit": "Source: ${teamConfig.league} Official YouTube",
      "duration_seconds": 10
    },
    "shareText": "Tweet text about the clip",
    "timestamp": "${new Date().toISOString()}"
  }
]

IMPORTANT FOR video_highlight TYPE:
- Only use real official ${teamConfig.league} YouTube channel URLs (not made up IDs)
- Keep clips 5-15 seconds conceptually (duration_seconds field)
- overlay_text must be transformative mockery/commentary
- Always credit the official source

Make it Chicago-sports focused with mockery/humor. Include realistic-looking stats. Types must be: chart, data, meme, commentary, or video_highlight. Include at least one video_highlight if appropriate for recent ${teamConfig.league} moments.`

    const response = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    })

    // Extract text content from response
    const textContent = response.content.find(block => block.type === 'text')
    if (!textContent || textContent.type !== 'text') {
      throw new Error('No text response from Claude')
    }

    // Parse JSON response
    const highlights = JSON.parse(textContent.text)

    if (!Array.isArray(highlights)) {
      throw new Error('Invalid highlights format')
    }

    return highlights
  } catch (error) {
    console.error('Claude API error:', error)
    return generateFallbackHighlights(teamSlug)
  }
}

/**
 * Generate fallback highlights when API fails
 */
function generateFallbackHighlights(teamSlug: string) {
  const teamConfig = TEAM_CONFIG[teamSlug] || TEAM_CONFIG['chicago-bears']
  const now = new Date().toISOString()

  // Generate varied stats based on team
  const winPct = Math.floor(Math.random() * 30) + 35 // 35-65%
  const weeklyData = Array.from({ length: 5 }, () => Math.floor(Math.random() * 30) + 40)

  return [
    {
      id: `${teamSlug}-chart-${Date.now()}`,
      type: 'chart',
      title: `${teamConfig.name} Performance Trend`,
      content: {
        labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5'],
        datasets: [{
          label: 'Win Probability %',
          data: weeklyData,
          fill: true,
        }],
        chartType: 'line',
      },
      shareText: `${teamConfig.name} performance trending... AI analysis says interesting times ahead! @sportsmockery`,
      timestamp: now,
    },
    {
      id: `${teamSlug}-data-${Date.now()}`,
      type: 'data',
      title: 'AI Win Probability',
      content: `${teamConfig.name} Win Probability: ${winPct}%`,
      shareText: `The AI gives the ${teamConfig.name} a ${winPct}% win probability. Thoughts? @sportsmockery`,
      timestamp: now,
    },
    {
      id: `${teamSlug}-meme-${Date.now()}`,
      type: 'meme',
      title: `${teamConfig.name} Fan Experience`,
      content: `POV: You're a ${teamConfig.name} fan checking the score in the 4th quarter and it's not what you expected...`,
      shareText: `Every ${teamConfig.name} fan knows this feeling 😂 @sportsmockery`,
      timestamp: now,
    },
    {
      id: `${teamSlug}-commentary-${Date.now()}`,
      type: 'commentary',
      title: `${teamConfig.name} Mockery Update`,
      content: `The ${teamConfig.name} continue to provide Chicago with its favorite pastime: hope followed by disappointment. At least we're consistent!`,
      shareText: `${teamConfig.name} Mockery Update: Still on brand! @sportsmockery`,
      timestamp: now,
    },
  ]
}
