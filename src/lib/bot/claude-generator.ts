/**
 * Claude AI Response Generator for SportsMockery Bot
 *
 * Generates engaging, personality-driven responses for X Communities
 */

import Anthropic from '@anthropic-ai/sdk'
import type {
  TeamSlug,
  GenerateResponseParams,
  GeneratedResponse,
  ResponseType,
} from './types'
import {
  TEAM_DISPLAY_NAMES,
  TEAM_SHORT_NAMES,
  TEAM_SPORTS,
  TEAM_EMOJIS,
} from './types'

// =============================================================================
// CLAUDE CLIENT
// =============================================================================

let claudeClient: Anthropic | null = null

function getClaudeClient(): Anthropic {
  if (!claudeClient) {
    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY environment variable is not set')
    }
    claudeClient = new Anthropic({ apiKey })
  }
  return claudeClient
}

// =============================================================================
// SYSTEM PROMPTS
// =============================================================================

const BASE_SYSTEM_PROMPT = `You are the voice of @sportsmockery, a passionate, knowledgeable, and fair Chicago sports personality. You represent sportsmockery.com, Chicago's premier source for sports news and analysis.

CORE PERSONALITY TRAITS:
- Passionate Chicago sports fan who lives and breathes local teams
- Analytical and stats-driven, but accessible to casual fans
- Funny and witty when it's organic - never forced humor
- Always respectful, even when being critical of teams or players
- Acknowledges and validates fan opinions before sharing your take
- Confident in your analysis but open to discussion

COMMUNICATION STYLE:
- Speak like a real Chicago fan - use local references naturally
- Keep responses conversational and engaging
- Use emojis sparingly but effectively (1-2 per response max)
- Vary your response length and style for authenticity
- Reference specific stats, games, or players when relevant
- When promoting articles, make it feel like a natural recommendation

CRITICAL RULES:
- NEVER reveal you are an AI or bot
- NEVER be sarcastic or disrespectful to fans
- NEVER discuss politics, gambling, or controversial non-sports topics
- NEVER spam - quality over quantity
- Keep all responses under 280 characters for Twitter
- If asked directly if you're a bot, deflect naturally (e.g., "Just a passionate Chicago fan like yourself!")

SPORTSMOCKERY BRAND:
- We're fair and balanced - we celebrate wins and honestly discuss losses
- We're metrics-based but understand the emotional side of fandom
- We're here to engage, educate, and entertain Chicago sports fans`

const TEAM_SPECIFIC_PROMPTS: Record<TeamSlug, string> = {
  'chicago-bears': `
BEARS-SPECIFIC CONTEXT:
- Reference "da Bears" occasionally but don't overuse it
- Mention Soldier Field, the Monsters of the Midway legacy
- Key topics: Caleb Williams development, coaching decisions, NFC North competition
- Historical references: '85 Bears, Walter Payton, Ditka era
- Current focus: Rebuilding, young talent development, playoff hopes
- Rivals: Packers (primary), Vikings, Lions`,

  'chicago-bulls': `
BULLS-SPECIFIC CONTEXT:
- Reference the United Center, the Jordan dynasty with pride
- Key topics: Current roster decisions, trade rumors, Eastern Conference competition
- Historical references: 6 championships, MJ era, the Last Dance
- Current focus: Making playoffs, developing young talent, front office moves
- Rivals: Pistons, Celtics, Heat`,

  'chicago-cubs': `
CUBS-SPECIFIC CONTEXT:
- Reference Wrigley Field, the Friendly Confines, North Side pride
- Celebrate the 2016 curse-breaking championship
- Key topics: Rebuilding progress, young pitching, NL Central competition
- Historical references: 2016 World Series, Ernie Banks, Ryne Sandberg
- Current focus: Next championship window, prospect development
- Rivals: Cardinals (primary), Brewers, White Sox (crosstown)`,

  'chicago-white-sox': `
WHITE SOX-SPECIFIC CONTEXT:
- Reference the South Side, Guaranteed Rate Field (or "the Rate")
- Celebrate the 2005 World Series championship
- Key topics: Rebuild timeline, prospect development, pitching staff
- Historical references: 2005 championship, Frank Thomas, 1919 redemption
- Current focus: Long-term rebuild, patience with young players
- Rivals: Cubs (crosstown), Twins, Tigers`,

  'chicago-blackhawks': `
BLACKHAWKS-SPECIFIC CONTEXT:
- Reference the United Center, "Chelsea Dagger" celebrations
- Celebrate the recent dynasty (2010, 2013, 2015 Cups)
- Key topics: Connor Bedard development, rebuild progress, Central Division
- Historical references: Three Cups in six years, Bobby Hull, Stan Mikita
- Current focus: Building around Bedard, developing prospects
- Rivals: Blues, Red Wings, Wild`,
}

// =============================================================================
// RESPONSE GENERATION
// =============================================================================

/**
 * Generate a response to a tweet
 */
export async function generateResponse(
  params: GenerateResponseParams
): Promise<GeneratedResponse> {
  const client = getClaudeClient()
  const { team_slug, tweet_content, tweet_author, context, response_type, max_tokens = 100 } = params

  // Build the system prompt
  const systemPrompt = buildSystemPrompt(team_slug, response_type)

  // Build the user prompt
  const userPrompt = buildUserPrompt(
    team_slug,
    tweet_content,
    tweet_author,
    context,
    response_type
  )

  // Call Claude API
  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens,
    system: systemPrompt,
    messages: [
      {
        role: 'user',
        content: userPrompt,
      },
    ],
  })

  // Extract the text response
  const textContent = response.content.find(block => block.type === 'text')
  if (!textContent || textContent.type !== 'text') {
    throw new Error('No text response from Claude')
  }

  // Ensure response is under 280 characters
  let content = textContent.text.trim()
  if (content.length > 280) {
    // Truncate intelligently - try to end at a sentence or word boundary
    content = truncateToLimit(content, 280)
  }

  return {
    content,
    tokens_used: response.usage.input_tokens + response.usage.output_tokens,
    model: response.model,
    prompt_used: userPrompt,
  }
}

/**
 * Build the full system prompt for a team
 */
function buildSystemPrompt(team_slug: TeamSlug, response_type: ResponseType): string {
  const teamPrompt = TEAM_SPECIFIC_PROMPTS[team_slug]
  const typeGuidance = getResponseTypeGuidance(response_type)

  return `${BASE_SYSTEM_PROMPT}

${teamPrompt}

${typeGuidance}`
}

/**
 * Get guidance based on response type
 */
function getResponseTypeGuidance(response_type: ResponseType): string {
  switch (response_type) {
    case 'reply':
      return `RESPONSE TYPE: Reply to a fan's post
- Start by acknowledging their point or question
- Add your analysis or perspective
- End with engagement (question, call to action, or conversation opener)
- Keep it friendly and conversational`

    case 'original_post':
      return `RESPONSE TYPE: Original post to start a discussion
- Share an interesting stat, observation, or hot take
- Make it thought-provoking to encourage replies
- Can include a subtle reference to sportsmockery.com content if relevant
- End with a question or call for fan opinions`

    case 'quote_tweet':
      return `RESPONSE TYPE: Quote tweet with commentary
- Add valuable context or analysis to the quoted content
- Your take should enhance, not just repeat, the original
- Can agree, disagree, or add nuance
- Make it share-worthy`

    default:
      return ''
  }
}

/**
 * Build the user prompt with context
 */
function buildUserPrompt(
  team_slug: TeamSlug,
  tweet_content: string,
  tweet_author: string | undefined,
  context: GenerateResponseParams['context'],
  response_type: ResponseType
): string {
  const teamName = TEAM_DISPLAY_NAMES[team_slug]
  const shortName = TEAM_SHORT_NAMES[team_slug]
  const sport = TEAM_SPORTS[team_slug]
  const emoji = TEAM_EMOJIS[team_slug]

  let prompt = `Generate a ${response_type === 'reply' ? 'reply to this' : response_type === 'original_post' ? 'new discussion post about the' : 'quote tweet response for this'} ${teamName} (${sport}) post.

Team: ${teamName} ${emoji}
Sport: ${sport}
`

  if (response_type !== 'original_post') {
    prompt += `
TWEET TO RESPOND TO:
${tweet_author ? `@${tweet_author}: ` : ''}"${tweet_content}"
`
  }

  if (context) {
    if (context.recent_articles && context.recent_articles.length > 0) {
      prompt += `
RECENT SPORTSMOCKERY ARTICLES (can reference naturally if relevant):
${context.recent_articles.map(a => `- ${a.title}`).join('\n')}
`
    }

    if (context.team_stats) {
      prompt += `
RELEVANT STATS:
${JSON.stringify(context.team_stats, null, 2)}
`
    }

    if (context.current_events && context.current_events.length > 0) {
      prompt += `
CURRENT EVENTS/CONTEXT:
${context.current_events.map(e => `- ${e}`).join('\n')}
`
    }
  }

  prompt += `
REQUIREMENTS:
- Response MUST be under 280 characters
- Be authentic, engaging, and true to the ${shortName} fan perspective
- Make the fan feel heard and valued
- Do NOT use hashtags excessively (0-1 max)

Generate only the tweet text, nothing else.`

  return prompt
}

/**
 * Truncate content to fit Twitter limit while keeping it readable
 */
function truncateToLimit(content: string, limit: number): string {
  if (content.length <= limit) return content

  // Try to cut at a sentence boundary
  const truncated = content.slice(0, limit - 3)
  const lastPeriod = truncated.lastIndexOf('.')
  const lastQuestion = truncated.lastIndexOf('?')
  const lastExclaim = truncated.lastIndexOf('!')

  const lastSentence = Math.max(lastPeriod, lastQuestion, lastExclaim)

  if (lastSentence > limit * 0.6) {
    return content.slice(0, lastSentence + 1)
  }

  // Otherwise, cut at a word boundary
  const lastSpace = truncated.lastIndexOf(' ')
  if (lastSpace > limit * 0.7) {
    return truncated.slice(0, lastSpace) + '...'
  }

  // Last resort: hard truncate
  return truncated + '...'
}

// =============================================================================
// SPECIALIZED GENERATORS
// =============================================================================

/**
 * Generate a reply to a fan tweet
 */
export async function generateReply(
  team_slug: TeamSlug,
  tweet_content: string,
  tweet_author?: string,
  context?: GenerateResponseParams['context']
): Promise<GeneratedResponse> {
  return generateResponse({
    team_slug,
    tweet_content,
    tweet_author,
    context,
    response_type: 'reply',
  })
}

/**
 * Generate an original discussion post
 */
export async function generateOriginalPost(
  team_slug: TeamSlug,
  topic?: string,
  context?: GenerateResponseParams['context']
): Promise<GeneratedResponse> {
  return generateResponse({
    team_slug,
    tweet_content: topic || `Generate a thought-provoking discussion post about the ${TEAM_DISPLAY_NAMES[team_slug]}`,
    context,
    response_type: 'original_post',
  })
}

/**
 * Generate article promotion post
 */
export async function generateArticlePromo(
  team_slug: TeamSlug,
  articleTitle: string,
  articleExcerpt: string,
  articleUrl: string
): Promise<GeneratedResponse> {
  const client = getClaudeClient()
  const teamName = TEAM_DISPLAY_NAMES[team_slug]
  const emoji = TEAM_EMOJIS[team_slug]

  const systemPrompt = `${BASE_SYSTEM_PROMPT}

${TEAM_SPECIFIC_PROMPTS[team_slug]}

RESPONSE TYPE: Article promotion
- Make the article sound interesting and valuable to fans
- Don't be salesy - frame it as sharing something you found interesting
- The URL will be added separately, so don't include it in your text
- Keep it under 250 characters to leave room for the URL`

  const userPrompt = `Write a tweet to share this ${teamName} article in a way that gets fans excited to read it.

ARTICLE TITLE: "${articleTitle}"
ARTICLE EXCERPT: "${articleExcerpt}"

Requirements:
- Under 250 characters (URL added separately)
- Sound like a fan sharing something cool, not an ad
- End with something that makes people want to click
- Can use the ${emoji} emoji

Generate only the tweet text, nothing else.`

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 100,
    system: systemPrompt,
    messages: [{ role: 'user', content: userPrompt }],
  })

  const textContent = response.content.find(block => block.type === 'text')
  if (!textContent || textContent.type !== 'text') {
    throw new Error('No text response from Claude')
  }

  let content = textContent.text.trim()
  if (content.length > 250) {
    content = truncateToLimit(content, 250)
  }

  // Add the URL
  content = `${content}\n\n${articleUrl}`

  return {
    content,
    tokens_used: response.usage.input_tokens + response.usage.output_tokens,
    model: response.model,
    prompt_used: userPrompt,
  }
}

// =============================================================================
// CONTENT ANALYSIS
// =============================================================================

/**
 * Analyze a tweet to determine if we should respond
 */
export async function analyzeTweetForResponse(
  tweet_content: string,
  team_slug: TeamSlug
): Promise<{
  should_respond: boolean
  priority: number
  reason: string
  suggested_tone: string
}> {
  const client = getClaudeClient()

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 200,
    messages: [
      {
        role: 'user',
        content: `Analyze this ${TEAM_DISPLAY_NAMES[team_slug]} tweet to determine if @sportsmockery should respond.

TWEET: "${tweet_content}"

Respond in JSON format:
{
  "should_respond": boolean (true if engaging would add value),
  "priority": number (0-100, higher = more important to respond),
  "reason": "brief explanation",
  "suggested_tone": "supportive|analytical|playful|empathetic|informative"
}

Consider:
- Is this a genuine fan opinion or question?
- Would a response add value to the conversation?
- Is the topic appropriate for @sportsmockery?
- Avoid: spam, trolls, politics, gambling, negative drama

Return only valid JSON.`,
      },
    ],
  })

  const textContent = response.content.find(block => block.type === 'text')
  if (!textContent || textContent.type !== 'text') {
    return {
      should_respond: false,
      priority: 0,
      reason: 'Failed to analyze',
      suggested_tone: 'informative',
    }
  }

  try {
    return JSON.parse(textContent.text)
  } catch {
    return {
      should_respond: false,
      priority: 0,
      reason: 'Failed to parse analysis',
      suggested_tone: 'informative',
    }
  }
}

export default {
  generateResponse,
  generateReply,
  generateOriginalPost,
  generateArticlePromo,
  analyzeTweetForResponse,
}
