import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic()

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
  action: 'headlines' | 'seo' | 'ideas' | 'grammar' | 'excerpt' | 'generate_chart' | 'generate_seo' | 'analyze_chart'
  content?: string
  title?: string
  category?: string
  team?: string
}

/**
 * POST /api/admin/ai
 * AI-powered content assistance for post creation
 */
export async function POST(request: NextRequest) {
  try {
    const body: AIRequest = await request.json()
    const { action, content, title, category, team } = body

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
  const prompt = `You are a sports journalist headline writer for Sports Mockery, a Chicago sports news site known for edgy, satirical takes.

Generate 5 alternative headlines for this article. The headlines should be:
- Attention-grabbing and click-worthy (but not clickbait)
- Witty or satirical when appropriate
- SEO-friendly (include relevant keywords)
- Varied in style (some punchy, some descriptive, some with wordplay)

Current title: "${title}"
${category ? `Category: ${category}` : ''}
${team ? `Team: ${team}` : ''}
${content ? `Article content preview: ${content.slice(0, 500)}...` : ''}

Return ONLY a JSON array of 5 headline strings, no explanation.`

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 500,
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
  const prompt = `You are an SEO expert for a sports news website called Sports Mockery.

Analyze this article and provide SEO optimization:

Title: "${title}"
${category ? `Category: ${category}` : ''}
Content: ${content.slice(0, 2000)}

Return a JSON object with:
{
  "seoTitle": "optimized title for search (50-60 chars)",
  "metaDescription": "compelling meta description (150-160 chars)",
  "focusKeyword": "primary keyword to target",
  "secondaryKeywords": ["array", "of", "secondary", "keywords"],
  "mockeryScore": {
    "score": number from 1-100,
    "feedback": "brief feedback on the article's entertainment value and Sports Mockery style"
  },
  "improvements": ["array of specific SEO improvement suggestions"]
}

Return ONLY the JSON object, no explanation.`

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 800,
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
  const prompt = `You are a creative sports content producer for Sports Mockery, a Chicago sports news site known for edgy, satirical takes on Chicago sports (Bears, Bulls, Cubs, White Sox, Blackhawks).

Generate 5 article ideas that would be timely and engaging. Consider:
- Current sports season and what's happening
- Hot takes and controversial opinions
- Player comparisons and debates
- Satirical pieces on team management
- Fan culture and memes

${category ? `Focus on category: ${category}` : ''}
${team ? `Focus on team: ${team}` : ''}

Return a JSON array of objects with:
{
  "headline": "catchy headline",
  "angle": "brief description of the angle/approach",
  "type": "news|opinion|satire|analysis|listicle"
}

Return ONLY the JSON array, no explanation.`

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 800,
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
  const prompt = `You are a professional editor. Check this content for grammar, spelling, punctuation, and clarity issues.

Content to check:
${content}

Return a JSON object with:
{
  "correctedContent": "the full content with all corrections applied",
  "issues": [
    {
      "original": "the problematic text",
      "corrected": "the corrected text",
      "explanation": "brief explanation of the issue"
    }
  ],
  "issueCount": number of issues found
}

If no issues are found, return the original content with an empty issues array and issueCount of 0.
Return ONLY the JSON object, no explanation.`

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2000,
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
  const prompt = `Generate a compelling excerpt/summary (2-3 sentences, max 200 characters) for this sports article that will make readers want to click through.

Title: "${title}"
Content: ${content.slice(0, 1500)}

Return ONLY the excerpt text, no explanation.`

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 200,
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
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : 'http://localhost:3000'

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
