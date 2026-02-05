import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import Anthropic from '@anthropic-ai/sdk'
import { getPostIQSystemPrompt, getTeamKnowledge, VOICE_GUIDELINES, HEADLINE_GUIDELINES, SOCIAL_STRATEGY, JOURNALISM_STANDARDS } from '@/lib/postiq-knowledge'

const anthropic = new Anthropic()
const DATALAB_API = 'https://datalab.sportsmockery.com'

/**
 * Create a poll from DataLab's suggestion and insert it into content
 */
async function createPollFromDataLabSuggestion(
  pollSuggestion: {
    question: string
    options: string[]
    poll_type?: string
    team_theme?: string
    confidence?: number
  },
  content: string,
  category?: string,
  team?: string,
  postId?: string
): Promise<NextResponse> {
  try {
    // Determine team theme
    const teamMap: Record<string, string> = {
      'Chicago Bears': 'bears',
      'Bears': 'bears',
      'Chicago Bulls': 'bulls',
      'Bulls': 'bulls',
      'Chicago Cubs': 'cubs',
      'Cubs': 'cubs',
      'Chicago White Sox': 'whitesox',
      'White Sox': 'whitesox',
      'Chicago Blackhawks': 'blackhawks',
      'Blackhawks': 'blackhawks',
    }
    const teamTheme = pollSuggestion.team_theme || team || (category ? teamMap[category] : null) || null

    // Create the poll via internal API call
    const pollPayload = {
      question: pollSuggestion.question,
      options: pollSuggestion.options.map((text: string) => ({ text })),
      pollType: pollSuggestion.poll_type || 'single',
      status: 'active',
      showResults: true,
      teamTheme,
      source: 'postiq',
      sourcePostId: postId || null,
      aiConfidence: pollSuggestion.confidence || 0.8,
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL
      || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')

    const pollResponse = await fetch(`${baseUrl}/api/admin/polls`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(pollPayload),
    })

    if (!pollResponse.ok) {
      console.error('Failed to create poll from DataLab suggestion:', await pollResponse.text())
      return NextResponse.json({
        success: false,
        reason: 'Failed to create poll',
        poll: pollSuggestion,
      })
    }

    const pollResult = await pollResponse.json()
    const pollId = pollResult.id || pollResult.poll?.id
    const shortcode = `[poll:${pollId}]`

    // Insert shortcode after 2nd paragraph by default
    const updatedContent = insertPollShortcodeAfterParagraph(content, shortcode, 2)

    return NextResponse.json({
      success: true,
      pollId,
      shortcode,
      question: pollSuggestion.question,
      options: pollSuggestion.options,
      confidence: pollSuggestion.confidence || 0.8,
      paragraphIndex: 2,
      updatedContent,
      poll: {
        id: pollId,
        question: pollSuggestion.question,
        options: pollSuggestion.options,
        poll_type: pollSuggestion.poll_type || 'single',
        team_theme: teamTheme,
        confidence: pollSuggestion.confidence || 0.8,
      },
      api_version: 'v2_with_creation',
    })
  } catch (error) {
    console.error('Error creating poll from DataLab suggestion:', error)
    return NextResponse.json({
      success: false,
      reason: 'Failed to process DataLab poll suggestion',
      poll: pollSuggestion,
    })
  }
}

/**
 * Extract JSON from a response that might be wrapped in markdown code blocks
 */
function extractJSON(text: string): string {
  // Remove markdown code blocks if present
  const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (jsonMatch) {
    return jsonMatch[1].trim()
  }
  // Try to find JSON array or object
  const arrayMatch = text.match(/\[[\s\S]*\]/)
  if (arrayMatch) {
    return arrayMatch[0]
  }
  const objectMatch = text.match(/\{[\s\S]*\}/)
  if (objectMatch) {
    return objectMatch[0]
  }
  return text.trim()
}

interface AIRequest {
  action: 'headlines' | 'seo' | 'ideas' | 'grammar' | 'excerpt' | 'generate_chart' | 'generate_seo' | 'analyze_chart' | 'generate_poll' | 'poll' | 'publish-assist'
  content?: string
  title?: string
  category?: string
  team?: string
  postId?: string // For linking generated polls to posts
}

/**
 * Try to call DataLab's PostIQ v2 API first, fall back to local Anthropic if it fails
 */
async function tryDataLabPostIQ(body: AIRequest, userId?: string): Promise<Response | null> {
  // Only proxy certain actions to DataLab
  const datalabActions = ['headlines', 'seo', 'generate_seo', 'ideas', 'grammar', 'excerpt', 'analyze_chart', 'poll', 'publish-assist']
  if (!datalabActions.includes(body.action)) {
    return null // Use local handler for chart generation
  }

  if (!process.env.POSTIQ_INTERNAL_KEY) {
    console.log('[PostIQ] No internal key configured, using local fallback')
    return null
  }

  try {
    const response = await fetch(`${DATALAB_API}/api/v2/postiq/suggest`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-PostIQ-Internal-Key': process.env.POSTIQ_INTERNAL_KEY,
      },
      body: JSON.stringify({
        task: body.action,
        articleTitle: body.title,
        articleContent: body.content,
        category: body.category,
        team: body.team,
        user_id: userId,
      }),
    })

    if (response.ok) {
      return response
    }

    // Check if DataLab says to fallback
    const data = await response.json()
    if (data.fallback_to_legacy) {
      console.log('[PostIQ] DataLab returned fallback_to_legacy, using local handler')
      return null
    }

    console.error('[PostIQ] DataLab error:', response.status, data)
    return null
  } catch (error) {
    console.error('[PostIQ] DataLab request failed:', error)
    return null
  }
}

/**
 * POST /api/admin/ai
 * AI-powered content assistance for post creation
 * Proxies to DataLab PostIQ v2 API, falls back to local Anthropic
 */
export async function POST(request: NextRequest) {
  try {
    const body: AIRequest = await request.json()
    const { action, content, title, category, team, postId } = body

    // Get user session for logging
    let userId: string | undefined
    try {
      const cookieStore = await cookies()
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            getAll() {
              return cookieStore.getAll()
            },
            setAll(cookiesToSet) {
              cookiesToSet.forEach(({ name, value, options }) => {
                try {
                  cookieStore.set(name, value, options)
                } catch {
                  // Ignore
                }
              })
            },
          },
        }
      )
      const { data: { session } } = await supabase.auth.getSession()
      userId = session?.user?.id
    } catch {
      // Continue without user ID
    }

    // Try DataLab first
    const datalabResponse = await tryDataLabPostIQ(body, userId)
    if (datalabResponse) {
      const data = await datalabResponse.json()

      // For poll action, DataLab returns just the suggestion - we need to create the poll
      if ((action === 'poll' || action === 'publish-assist') && data.poll) {
        return await createPollFromDataLabSuggestion(data.poll, content || '', category, team, postId)
      }

      return NextResponse.json(data)
    }

    // Fall back to local handlers
    switch (action) {
      case 'headlines':
        return await generateHeadlines(title || '', content || '', category, team)
      case 'seo':
      case 'generate_seo':
        return await optimizeSEO(title || '', content || '', category)
      case 'ideas':
        return await generateIdeas(category, team)
      case 'grammar':
        return await checkGrammar(content || '')
      case 'excerpt':
        return await generateExcerpt(title || '', content || '')
      case 'analyze_chart':
        return await analyzeChartData(title || '', content || '', category)
      case 'generate_chart':
        return await generateChartForPost(title || '', content || '', category)
      case 'poll':
      case 'generate_poll':
        return await generatePollForPost(title || '', content || '', category, team, postId)
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('AI API error:', error)
    return NextResponse.json(
      { error: 'AI service temporarily unavailable' },
      { status: 500 }
    )
  }
}

async function generateHeadlines(title: string, content: string, category?: string, team?: string) {
  const teamContext = team ? getTeamKnowledge(team) : ''
  const systemPrompt = getPostIQSystemPrompt(team)

  const prompt = `${HEADLINE_GUIDELINES}

${teamContext}

Generate 5 alternative headlines for this article following Sports Mockery voice guidelines.

REQUIREMENTS:
- Generate 4 platform variants for each: SEO (50-60 chars), X/Twitter, Facebook, Push notification
- Score each on: Rage (0-100), LOL (0-100), Hope (0-100)
- Use fan-first language ("we" not neutral)
- Include team-specific references when relevant
- Make them click-worthy but credible

Current title: "${title}"
${category ? `Category: ${category}` : ''}
${team ? `Team: ${team.charAt(0).toUpperCase() + team.slice(1)}` : ''}
${content ? `Article content preview: ${content.slice(0, 500)}...` : ''}

Return ONLY a JSON array of 5 headline strings (use the best/main headline for each), no explanation.`

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 500,
    system: systemPrompt,
    messages: [{ role: 'user', content: prompt }],
  })

  const responseText = message.content[0].type === 'text' ? message.content[0].text : ''
  console.log('Headlines raw response:', responseText.slice(0, 500))

  try {
    // Extract and parse JSON
    const jsonText = extractJSON(responseText)
    const headlines = JSON.parse(jsonText)
    return NextResponse.json({ headlines: Array.isArray(headlines) ? headlines : [] })
  } catch (e) {
    console.error('Headlines JSON parse error:', e)
    // If not valid JSON, extract lines
    const headlines = responseText
      .split('\n')
      .filter(line => line.trim())
      .map(line => line.replace(/^[\d\-\.\*]+\s*/, '').replace(/^["']|["']$/g, '').trim())
      .filter(line => line.length > 0 && !line.startsWith('```'))
      .slice(0, 5)
    return NextResponse.json({ headlines })
  }
}

async function optimizeSEO(title: string, content: string, category?: string) {
  const systemPrompt = getPostIQSystemPrompt()

  const prompt = `You are PostIQ's SEO Autopilot function for Sports Mockery.

${VOICE_GUIDELINES}

Analyze this article and provide comprehensive SEO optimization:

Title: "${title}"
${category ? `Category: ${category}` : ''}
Content: ${content.slice(0, 2000)}

Return a JSON object with:
{
  "seoTitle": "optimized title for search (50-60 chars) - keywords first",
  "metaDescription": "compelling meta description (150-160 chars) - fan-first voice",
  "focusKeyword": "primary keyword to target",
  "secondaryKeywords": ["array", "of", "secondary", "keywords"],
  "suggestedSlug": "url-friendly-slug",
  "mockeryScore": {
    "score": number from 1-100,
    "feedback": "feedback on authenticity (fan voice), credibility (sourcing), virality (engagement potential)"
  },
  "emotionTags": {
    "rage": 0-100,
    "hope": 0-100,
    "lol": 0-100,
    "nostalgia": 0-100
  },
  "improvements": ["array of specific improvements for SM voice and engagement"],
  "internalLinkSuggestions": ["suggested topics to link to"]
}

Return ONLY the JSON object, no explanation.`

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 800,
    system: systemPrompt,
    messages: [{ role: 'user', content: prompt }],
  })

  const responseText = message.content[0].type === 'text' ? message.content[0].text : ''

  try {
    const jsonText = extractJSON(responseText)
    const seo = JSON.parse(jsonText)
    return NextResponse.json(seo)
  } catch (e) {
    console.error('SEO JSON parse error:', e)
    return NextResponse.json({
      seoTitle: title.slice(0, 60),
      metaDescription: content.slice(0, 160),
      focusKeyword: '',
      secondaryKeywords: [],
      mockeryScore: { score: 50, feedback: 'Unable to analyze' },
      improvements: ['Unable to generate suggestions']
    })
  }
}

async function generateIdeas(category?: string, team?: string) {
  const teamContext = team ? getTeamKnowledge(team) : ''
  const systemPrompt = getPostIQSystemPrompt(team)

  const prompt = `You are PostIQ's Angle Finder function for Sports Mockery.

${teamContext}

Generate 5 article ideas using the ANGLE FINDER approach. Each idea should:
- Be tagged with primary emotion (rage/hope/LOL/nostalgia/panic/analysis)
- Use team-specific context and current events
- Balance authenticity (fan voice), credibility (factual basis), virality (shareability)

${category ? `Focus on category: ${category}` : ''}
${team ? `Focus on team: ${team.charAt(0).toUpperCase() + team.slice(1)}` : ''}

Consider:
- Current team context and recent events
- Rivalry angles (Packers for Bears, Cardinals for Cubs, etc.)
- Historical comparisons and nostalgia hooks
- Fan frustrations and hopes
- Satirical/meme-worthy situations

Return a JSON array of objects with:
{
  "headline": "catchy SM-voice headline",
  "angle": "brief description of the approach",
  "type": "news|opinion|satire|analysis|listicle|hot-take",
  "emotion": "rage|hope|LOL|nostalgia|panic|analysis",
  "emotionScore": 0-100,
  "viralPotential": "low|medium|high"
}

Return ONLY the JSON array, no explanation.`

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 800,
    system: systemPrompt,
    messages: [{ role: 'user', content: prompt }],
  })

  const responseText = message.content[0].type === 'text' ? message.content[0].text : ''
  console.log('Ideas raw response:', responseText.slice(0, 500))

  try {
    const jsonText = extractJSON(responseText)
    const ideas = JSON.parse(jsonText)
    return NextResponse.json({ ideas: Array.isArray(ideas) ? ideas : [] })
  } catch (e) {
    console.error('Ideas JSON parse error:', e)
    return NextResponse.json({ ideas: [], error: 'Failed to parse ideas' })
  }
}

async function checkGrammar(content: string) {
  const systemPrompt = `You are PostIQ's Ethics Checker and Copy Tightener for Sports Mockery.

${JOURNALISM_STANDARDS}

${VOICE_GUIDELINES}`

  const prompt = `Check this content for:

1. GRAMMAR/SPELLING/PUNCTUATION issues
2. JOURNALISM ETHICS issues:
   - Unsourced claims that need attribution
   - Potential defamation risks
   - Opinion presented as fact
   - Missing context
3. VOICE issues:
   - Weak/passive verbs
   - Corporate speak that should be fan voice
   - Missed opportunities for SM personality

Content to check:
${content}

Return a JSON object with:
{
  "correctedContent": "the full content with grammar corrections applied",
  "issues": [
    {
      "original": "the problematic text",
      "corrected": "the corrected text",
      "explanation": "brief explanation",
      "type": "grammar|spelling|punctuation|attribution|voice|defamation-risk"
    }
  ],
  "issueCount": number of issues found,
  "ethicsFlags": ["any serious journalism concerns"],
  "voiceSuggestions": ["ways to make copy more SM-voice"]
}

If no issues are found, return the original content with empty arrays and issueCount of 0.
Return ONLY the JSON object, no explanation.`

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2000,
    system: systemPrompt,
    messages: [{ role: 'user', content: prompt }],
  })

  const responseText = message.content[0].type === 'text' ? message.content[0].text : ''

  try {
    const jsonText = extractJSON(responseText)
    const result = JSON.parse(jsonText)
    return NextResponse.json(result)
  } catch (e) {
    console.error('Grammar JSON parse error:', e)
    return NextResponse.json({
      correctedContent: content,
      issues: [],
      issueCount: 0,
      error: 'Unable to parse grammar check results'
    })
  }
}

async function generateExcerpt(title: string, content: string) {
  const systemPrompt = getPostIQSystemPrompt()

  const prompt = `Generate a compelling excerpt for this Sports Mockery article.

${VOICE_GUIDELINES}

Requirements:
- 2-3 sentences, max 200 characters
- Fan-first voice (use "we" when appropriate)
- Tease tension, don't resolve it
- Create urgency to click through
- Match the emotional tone of the article

Title: "${title}"
Content: ${content.slice(0, 1500)}

Return ONLY the excerpt text, no explanation.`

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 200,
    system: systemPrompt,
    messages: [{ role: 'user', content: prompt }],
  })

  const excerpt = message.content[0].type === 'text' ? message.content[0].text : ''

  return NextResponse.json({ excerpt: excerpt.trim() })
}

/**
 * Analyze article content for chartable data (returns analysis only, doesn't create chart)
 * Used by the interactive chart modal
 */
async function analyzeChartData(title: string, content: string, category?: string) {
  // Strip HTML tags for analysis
  const plainText = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()

  const prompt = `You are a sports data analyst for Sports Mockery. Analyze this article and identify data that would make a compelling chart visualization.

Article Title: "${title}"
Article Content:
${plainText.slice(0, 3000)}

Your task:
1. Find statistical data, comparisons, rankings, or trends mentioned in the article that could be visualized
2. Choose the best chart type:
   - "bar" for comparing values (player stats, rankings, comparisons)
   - "line" for trends over time (season progress, performance over weeks/games)
   - "pie" for percentages or distributions (play types, snap counts)
   - "player-comparison" for comparing two players head-to-head
   - "team-stats" for team performance metrics
3. Extract the data points with labels and values
4. Identify which paragraph contains the data (count from 1)

Return a JSON object with:
{
  "shouldCreateChart": true or false (false if no good data found),
  "chartType": "bar" | "line" | "pie" | "player-comparison" | "team-stats",
  "chartTitle": "descriptive title for the chart",
  "data": [
    { "label": "Category/Time", "value": number }
  ],
  "paragraphIndex": number (1-based index of paragraph where chart should appear after),
  "reasoning": "brief explanation of why this data makes a good chart"
}

If the article doesn't contain good chartable data (no statistics, comparisons, or trends), set shouldCreateChart to false.
Return ONLY the JSON object, no explanation.`

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1000,
    messages: [{ role: 'user', content: prompt }],
  })

  const responseText = message.content[0].type === 'text' ? message.content[0].text : ''
  console.log('Chart analysis response:', responseText.slice(0, 500))

  try {
    const jsonText = extractJSON(responseText)
    const analysis = JSON.parse(jsonText)

    // Ensure response has the correct shape - AI sometimes returns just the data array
    if (Array.isArray(analysis)) {
      // If AI returned just an array, wrap it in the expected format
      return NextResponse.json({
        shouldCreateChart: analysis.length >= 2,
        chartType: 'bar',
        chartTitle: 'Data from Article',
        data: analysis,
        paragraphIndex: 1,
        reasoning: 'Data extracted from article',
      })
    }

    // Ensure shouldCreateChart is a boolean
    if (typeof analysis.shouldCreateChart !== 'boolean') {
      analysis.shouldCreateChart = !!(analysis.data && analysis.data.length >= 2)
    }

    return NextResponse.json(analysis)
  } catch (e) {
    console.error('Chart analysis parse error:', e)
    return NextResponse.json({
      shouldCreateChart: false,
      reason: 'Failed to analyze content for chart data',
    })
  }
}

/**
 * Generate a chart for a post based on its content
 * Analyzes the article to find chartable data, creates a chart, and inserts it
 */
async function generateChartForPost(title: string, content: string, category?: string) {
  // Strip HTML tags for analysis
  const plainText = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()

  // Determine team from category
  const teamMap: Record<string, string> = {
    'Chicago Bears': 'bears',
    'Bears': 'bears',
    'Chicago Bulls': 'bulls',
    'Bulls': 'bulls',
    'Chicago Cubs': 'cubs',
    'Cubs': 'cubs',
    'Chicago White Sox': 'whitesox',
    'White Sox': 'whitesox',
    'Chicago Blackhawks': 'blackhawks',
    'Blackhawks': 'blackhawks',
  }
  const team = category ? (teamMap[category] || 'bears') : 'bears'

  const prompt = `You are a sports data analyst for Sports Mockery. Analyze this article and identify data that would make a compelling chart visualization.

Article Title: "${title}"
Article Content:
${plainText.slice(0, 3000)}

Your task:
1. Find statistical data, comparisons, rankings, or trends mentioned in the article that could be visualized
2. Choose the best chart type:
   - "bar" for comparing values (player stats, rankings, comparisons)
   - "line" for trends over time (season progress, performance over weeks/games)
   - "pie" for percentages or distributions (play types, snap counts)
3. Extract the data points with labels and values
4. Identify which paragraph contains the data (count from 1)

Return a JSON object with:
{
  "shouldCreateChart": true or false (false if no good data found),
  "chartType": "bar" | "line" | "pie",
  "chartTitle": "descriptive title for the chart",
  "data": [
    { "label": "Category/Time", "value": number }
  ],
  "paragraphIndex": number (1-based index of paragraph where chart should appear after),
  "reasoning": "brief explanation of why this data makes a good chart"
}

If the article doesn't contain good chartable data (no statistics, comparisons, or trends), set shouldCreateChart to false.
Return ONLY the JSON object, no explanation.`

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1000,
    messages: [{ role: 'user', content: prompt }],
  })

  const responseText = message.content[0].type === 'text' ? message.content[0].text : ''
  console.log('Chart analysis response:', responseText.slice(0, 500))

  try {
    const jsonText = extractJSON(responseText)
    const analysis = JSON.parse(jsonText)

    if (!analysis.shouldCreateChart || !analysis.data || analysis.data.length < 2) {
      return NextResponse.json({
        success: false,
        reason: 'No suitable chart data found in article',
        updatedContent: null,
      })
    }

    // Create the chart via internal API call
    const chartPayload = {
      type: analysis.chartType || 'bar',
      title: analysis.chartTitle || `${title} - Data`,
      size: 'medium',
      colors: { scheme: 'team', team },
      data: analysis.data,
      dataSource: 'manual',
    }

    // Make internal request to create chart
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL
      || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')

    const chartResponse = await fetch(`${baseUrl}/api/charts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(chartPayload),
    })

    if (!chartResponse.ok) {
      console.error('Failed to create chart:', await chartResponse.text())
      return NextResponse.json({
        success: false,
        reason: 'Failed to create chart',
        updatedContent: null,
      })
    }

    const chartResult = await chartResponse.json()
    const shortcode = `[chart:${chartResult.id}]`

    // Insert shortcode after the specified paragraph
    const updatedContent = insertShortcodeAfterParagraph(
      content,
      shortcode,
      analysis.paragraphIndex || 1
    )

    return NextResponse.json({
      success: true,
      chartId: chartResult.id,
      shortcode,
      chartType: analysis.chartType,
      chartTitle: analysis.chartTitle,
      updatedContent,
    })
  } catch (e) {
    console.error('Chart generation error:', e)
    return NextResponse.json({
      success: false,
      reason: 'Failed to analyze content for chart',
      updatedContent: null,
    })
  }
}

/**
 * Insert a shortcode after a specific paragraph in HTML content
 */
function insertShortcodeAfterParagraph(
  htmlContent: string,
  shortcode: string,
  paragraphIndex: number
): string {
  // Find all closing </p> tags
  const closingTagRegex = /<\/p>/gi
  let match
  let count = 0
  let insertPosition = -1

  while ((match = closingTagRegex.exec(htmlContent)) !== null) {
    count++
    if (count === paragraphIndex) {
      insertPosition = match.index + match[0].length
      break
    }
  }

  // If we found the position, insert the shortcode wrapped in a div
  if (insertPosition > 0) {
    const chartBlock = `\n<div class="chart-embed my-6">${shortcode}</div>\n`
    return (
      htmlContent.slice(0, insertPosition) +
      chartBlock +
      htmlContent.slice(insertPosition)
    )
  }

  // If paragraph not found, insert at the end of content
  const chartBlock = `\n<div class="chart-embed my-6">${shortcode}</div>`
  return htmlContent + chartBlock
}

/**
 * Generate a poll for a post based on its content
 * Analyzes the article to find a compelling question for readers to vote on
 * Supports new DataLab PostIQ integration with source tracking and post linking
 */
async function generatePollForPost(title: string, content: string, category?: string, team?: string, postId?: string) {
  // Strip HTML tags for analysis
  const plainText = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()

  // Determine team theme from category or team param
  const teamMap: Record<string, string> = {
    'Chicago Bears': 'bears',
    'Bears': 'bears',
    'Chicago Bulls': 'bulls',
    'Bulls': 'bulls',
    'Chicago Cubs': 'cubs',
    'Cubs': 'cubs',
    'Chicago White Sox': 'whitesox',
    'White Sox': 'whitesox',
    'Chicago Blackhawks': 'blackhawks',
    'Blackhawks': 'blackhawks',
  }
  const teamTheme = team || (category ? teamMap[category] : null) || null

  const prompt = `You are a sports engagement analyst for Sports Mockery, a Chicago sports fan site. Analyze this article and create an engaging poll question for readers to vote on.

Article Title: "${title}"
${category ? `Category: ${category}` : ''}
Article Content:
${plainText.slice(0, 3000)}

Your task:
1. Identify a debatable topic, prediction, or opinion from the article that fans would want to vote on
2. Create a compelling poll question that encourages engagement
3. Generate 2-4 answer options (not too many, keep it focused)
4. Determine where in the article the poll should appear (after which paragraph)

Poll types that work well for sports:
- Predictions ("Will the Bears make the playoffs?")
- Opinions ("Who should start at QB?")
- Debates ("Best Bears QB of all time?")
- Fan sentiment ("How do you feel about this trade?")
- Comparisons ("Which player has more potential?")

Return a JSON object with:
{
  "shouldCreatePoll": true or false (false if no good poll topic found),
  "question": "The poll question to ask fans",
  "options": ["Option 1", "Option 2", "Option 3"],
  "poll_type": "single",
  "paragraphIndex": number (1-based index of paragraph where poll should appear after),
  "confidence": number between 0 and 1 indicating how confident you are this is a good poll,
  "reasoning": "brief explanation of why this poll engages fans"
}

IMPORTANT:
- Questions should be fan-centric ("we" perspective where appropriate)
- Options should be clear and mutually exclusive
- Maximum 4 options, minimum 2
- Poll should relate directly to the article content
- If the article doesn't lend itself to a poll, set shouldCreatePoll to false

Return ONLY the JSON object, no explanation.`

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1000,
    messages: [{ role: 'user', content: prompt }],
  })

  const responseText = message.content[0].type === 'text' ? message.content[0].text : ''
  console.log('Poll generation response:', responseText.slice(0, 500))

  try {
    const jsonText = extractJSON(responseText)
    const analysis = JSON.parse(jsonText)

    if (!analysis.shouldCreatePoll || !analysis.options || analysis.options.length < 2) {
      return NextResponse.json({
        success: false,
        reason: 'No suitable poll topic found in article',
        updatedContent: null,
        poll: null,
      })
    }

    // Create the poll via internal API call with new PostIQ fields
    const pollPayload = {
      question: analysis.question,
      options: analysis.options.map((text: string) => ({ text })),
      pollType: analysis.poll_type || 'single',
      status: 'active',
      showResults: true,
      teamTheme,
      // New PostIQ tracking fields
      source: 'postiq',
      sourcePostId: postId || null,
      aiConfidence: analysis.confidence || 0.8,
    }

    // Make internal request to create poll
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL
      || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')

    const pollResponse = await fetch(`${baseUrl}/api/admin/polls`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(pollPayload),
    })

    if (!pollResponse.ok) {
      console.error('Failed to create poll:', await pollResponse.text())
      return NextResponse.json({
        success: false,
        reason: 'Failed to create poll',
        updatedContent: null,
        poll: null,
      })
    }

    const pollResult = await pollResponse.json()
    const pollId = pollResult.id || pollResult.poll?.id
    const shortcode = `[poll:${pollId}]`

    // Insert shortcode after the specified paragraph
    const updatedContent = insertPollShortcodeAfterParagraph(
      content,
      shortcode,
      analysis.paragraphIndex || 2 // Default to after 2nd paragraph
    )

    return NextResponse.json({
      success: true,
      pollId,
      shortcode,
      question: analysis.question,
      options: analysis.options,
      confidence: analysis.confidence || 0.8,
      reasoning: analysis.reasoning,
      paragraphIndex: analysis.paragraphIndex || 2,
      updatedContent,
      // Return poll object for frontend preview
      poll: {
        id: pollId,
        question: analysis.question,
        options: analysis.options,
        poll_type: analysis.poll_type || 'single',
        team_theme: teamTheme,
        confidence: analysis.confidence || 0.8,
      },
    })
  } catch (e) {
    console.error('Poll generation error:', e)
    return NextResponse.json({
      success: false,
      reason: 'Failed to analyze content for poll',
      updatedContent: null,
      poll: null,
    })
  }
}

/**
 * Insert a poll shortcode after a specific paragraph in HTML content
 */
function insertPollShortcodeAfterParagraph(
  htmlContent: string,
  shortcode: string,
  paragraphIndex: number
): string {
  // Find all closing </p> tags
  const closingTagRegex = /<\/p>/gi
  let match
  let count = 0
  let insertPosition = -1

  while ((match = closingTagRegex.exec(htmlContent)) !== null) {
    count++
    if (count === paragraphIndex) {
      insertPosition = match.index + match[0].length
      break
    }
  }

  // If we found the position, insert the shortcode wrapped in a div
  if (insertPosition > 0) {
    const pollBlock = `\n<div class="poll-embed my-6">${shortcode}</div>\n`
    return (
      htmlContent.slice(0, insertPosition) +
      pollBlock +
      htmlContent.slice(insertPosition)
    )
  }

  // If paragraph not found, insert at the end of content
  const pollBlock = `\n<div class="poll-embed my-6">${shortcode}</div>`
  return htmlContent + pollBlock
}
