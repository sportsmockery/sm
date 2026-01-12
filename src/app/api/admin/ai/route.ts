import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic()

interface AIRequest {
  action: 'headlines' | 'seo' | 'ideas' | 'polish' | 'excerpt'
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
        return await optimizeSEO(title || '', content || '', category)
      case 'ideas':
        return await generateIdeas(category, team)
      case 'polish':
        return await polishContent(content || '')
      case 'excerpt':
        return await generateExcerpt(title || '', content || '')
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

  try {
    // Try to parse as JSON
    const headlines = JSON.parse(responseText)
    return NextResponse.json({ headlines })
  } catch {
    // If not valid JSON, extract lines
    const headlines = responseText
      .split('\n')
      .filter(line => line.trim())
      .map(line => line.replace(/^[\d\-\.\*]+\s*/, '').replace(/^["']|["']$/g, '').trim())
      .filter(line => line.length > 0)
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
    const seo = JSON.parse(responseText)
    return NextResponse.json(seo)
  } catch {
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

  try {
    const ideas = JSON.parse(responseText)
    return NextResponse.json({ ideas })
  } catch {
    return NextResponse.json({ ideas: [] })
  }
}

async function polishContent(content: string) {
  const prompt = `You are an editor at Sports Mockery, a Chicago sports news site known for edgy, satirical takes.

Polish this content to match the Sports Mockery voice:
- Add wit and personality
- Make it more engaging and punchy
- Fix any grammar or clarity issues
- Keep the core message intact
- Add some satirical edge where appropriate

Original content:
${content}

Return ONLY the polished content, no explanation or commentary.`

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2000,
    messages: [{ role: 'user', content: prompt }],
  })

  const polishedContent = message.content[0].type === 'text' ? message.content[0].text : content

  return NextResponse.json({ content: polishedContent })
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
