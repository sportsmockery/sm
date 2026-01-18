import { NextRequest, NextResponse } from 'next/server'
import { datalabAdmin } from '@/lib/supabase-datalab'

// Use Anthropic SDK if available, otherwise provide canned responses
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

// Get context about the Bears from the database
async function getBearsContext() {
  if (!datalabAdmin) {
    return {
      record: '10-5',
      recentGames: [],
      players: [],
    }
  }

  try {
    // Fetch recent games
    const { data: games } = await datalabAdmin
      .from('bears_games')
      .select('*')
      .order('game_date', { ascending: false })
      .limit(5)

    // Fetch roster
    const { data: players } = await datalabAdmin
      .from('bears_players')
      .select('name, position, jersey_number')
      .eq('is_active', true)
      .limit(20)

    // Calculate record
    const wins = games?.filter(g => g.bears_win === true).length || 0
    const losses = games?.filter(g => g.bears_win === false).length || 0

    return {
      record: `${wins}-${losses}`,
      recentGames: games || [],
      players: players || [],
    }
  } catch (error) {
    console.error('Error fetching Bears context:', error)
    return { record: 'N/A', recentGames: [], players: [] }
  }
}

// Generate response using AI or fallback
async function generateResponse(
  question: string,
  context: Awaited<ReturnType<typeof getBearsContext>>
): Promise<string> {
  // If we have Anthropic API key, use it
  if (ANTHROPIC_API_KEY) {
    try {
      const Anthropic = (await import('@anthropic-ai/sdk')).default
      const anthropic = new Anthropic({ apiKey: ANTHROPIC_API_KEY })

      const systemPrompt = `You are a Chicago Bears expert assistant on SportsMockery.com. You provide accurate, engaging information about the Chicago Bears NFL team.

Current Context:
- Current Record: ${context.record}
- Recent Games: ${context.recentGames.map(g => `${g.is_bears_home ? 'vs' : '@'} ${g.opponent}: ${g.bears_score ?? '?'}-${g.opponent_score ?? '?'}`).join(', ')}
- Key Players: ${context.players.map(p => `${p.name} (${p.position})`).join(', ')}

Guidelines:
- Be enthusiastic but balanced in your takes
- Reference recent games and current roster when relevant
- Provide context for hot takes and rumors
- Keep responses concise (2-3 paragraphs max)
- End with a question or call-to-action when appropriate`

      const response = await anthropic.messages.create({
        model: 'claude-3-haiku-20240307',
        max_tokens: 500,
        system: systemPrompt,
        messages: [{ role: 'user', content: question }],
      })

      const textContent = response.content.find(block => block.type === 'text')
      return textContent?.text || 'I couldn\'t generate a response. Please try again.'
    } catch (error) {
      console.error('AI generation error:', error)
      // Fall through to fallback responses
    }
  }

  // Fallback responses based on question keywords
  const lowerQuestion = question.toLowerCase()

  if (lowerQuestion.includes('caleb') || lowerQuestion.includes('williams') || lowerQuestion.includes('quarterback')) {
    return `Caleb Williams has been the centerpiece of the Bears\' offense this season. As the young QB continues to develop, fans are excited about his potential to lead Chicago back to playoff contention. His ability to extend plays and make throws under pressure has been a bright spot. Check our latest articles for in-depth analysis of his performance!`
  }

  if (lowerQuestion.includes('schedule') || lowerQuestion.includes('next game')) {
    return `The Bears are gearing up for their next matchup! Check out our schedule page for the full list of upcoming games, including dates, times, and opponent breakdowns. Each week we provide game previews and predictions. Who do you think the Bears will face their toughest challenge against?`
  }

  if (lowerQuestion.includes('trade') || lowerQuestion.includes('rumors')) {
    return `The trade rumor mill is always churning in Chicago! Our team tracks all the latest whispers about potential moves. Whether it\'s strengthening the offensive line or adding defensive depth, we\'ve got the inside scoop. What position do you think the Bears need to address most?`
  }

  if (lowerQuestion.includes('record') || lowerQuestion.includes('standings')) {
    return `The Bears currently sit at ${context.record} this season. It\'s been an exciting journey with plenty of ups and downs. The NFC North is always competitive, but there\'s reason for optimism in Chicago. What do you think the Bears\' final record will be?`
  }

  // Default response
  return `Great question about the Bears! Our team of writers and analysts cover every aspect of Chicago Bears football - from game breakdowns to roster moves to hot takes. Browse our latest articles for the most up-to-date coverage, or ask me something more specific about the team, players, or schedule!`
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { message, history = [] } = body as {
      message: string
      history?: ChatMessage[]
    }

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    // Get context from database
    const context = await getBearsContext()

    // Generate response
    const response = await generateResponse(message, context)

    return NextResponse.json({
      response,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Bears chat error:', error)
    return NextResponse.json(
      { error: 'Failed to process message' },
      { status: 500 }
    )
  }
}
