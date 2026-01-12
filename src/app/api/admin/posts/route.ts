import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic()

/**
 * Strip HTML tags and normalize whitespace
 */
function stripHtml(html: string): string {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Truncate string at word boundary
 */
function truncateAtWord(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str
  const truncated = str.substring(0, maxLength)
  const lastSpace = truncated.lastIndexOf(' ')
  if (lastSpace > maxLength * 0.7) {
    return truncated.substring(0, lastSpace) + '...'
  }
  return truncated + '...'
}

/**
 * Generate AI-powered SEO fields
 * Returns optimized SEO title, description, and excerpt
 */
async function generateAISEO(title: string, content: string, category?: string): Promise<{
  seoTitle: string
  seoDescription: string
  excerpt: string
}> {
  const plainContent = stripHtml(content)

  try {
    const prompt = `You are an SEO expert for Sports Mockery, a Chicago sports news site.

Generate SEO-optimized fields for this article:

Title: "${title}"
${category ? `Category: ${category}` : ''}
Content: ${plainContent.slice(0, 1500)}

Return a JSON object with these EXACT fields:
{
  "seoTitle": "SEO-optimized title (50-60 characters)",
  "seoDescription": "Meta description (150-160 characters) that encourages clicks",
  "excerpt": "2-3 sentence summary (max 250 characters)"
}

Make it Sports Mockery style - engaging, punchy, Chicago sports focused.
Return ONLY valid JSON, no explanation.`

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 500,
      messages: [{ role: 'user', content: prompt }],
    })

    const responseText = message.content[0].type === 'text' ? message.content[0].text : ''
    const seo = JSON.parse(responseText)

    return {
      seoTitle: seo.seoTitle || title.slice(0, 60),
      seoDescription: seo.seoDescription || plainContent.slice(0, 160),
      excerpt: seo.excerpt || plainContent.slice(0, 250),
    }
  } catch (error) {
    console.error('AI SEO generation failed, using fallback:', error)
    // Fallback to basic generation
    return {
      seoTitle: title.slice(0, 60),
      seoDescription: plainContent.slice(0, 160),
      excerpt: plainContent.slice(0, 250),
    }
  }
}

/**
 * Auto-fill missing SEO fields before saving
 * Uses AI when possible, falls back to content extraction
 * SAFETY: Only fills empty fields, never overwrites existing data
 */
async function autoFillSEOFields(
  postData: Record<string, unknown>,
  categoryName?: string
): Promise<Record<string, unknown>> {
  const title = postData.title as string || ''
  const content = postData.content as string || ''
  const plainContent = stripHtml(content)

  // Check which fields need filling
  const needsSeoTitle = !postData.seo_title || (postData.seo_title as string).trim() === ''
  const needsSeoDesc = !postData.seo_description || (postData.seo_description as string).trim() === ''
  const needsExcerpt = !postData.excerpt || (postData.excerpt as string).trim() === ''

  // If any SEO fields are empty and we have content, try AI generation
  if ((needsSeoTitle || needsSeoDesc || needsExcerpt) && plainContent.length > 50) {
    const aiSeo = await generateAISEO(title, content, categoryName)

    // Only fill empty fields (never overwrite)
    if (needsSeoTitle) {
      postData.seo_title = aiSeo.seoTitle
    }
    if (needsSeoDesc) {
      postData.seo_description = aiSeo.seoDescription
    }
    if (needsExcerpt) {
      postData.excerpt = aiSeo.excerpt
    }
  } else {
    // Fallback for very short content - use basic extraction
    if (needsSeoTitle) {
      postData.seo_title = title.slice(0, 60)
    }
    if (needsSeoDesc) {
      const excerpt = postData.excerpt as string || ''
      if (excerpt.trim()) {
        postData.seo_description = truncateAtWord(stripHtml(excerpt), 160)
      } else if (plainContent) {
        postData.seo_description = truncateAtWord(plainContent, 160)
      }
    }
    if (needsExcerpt && plainContent) {
      postData.excerpt = truncateAtWord(plainContent, 300)
    }
  }

  return postData
}

/**
 * GET /api/admin/posts
 * List all posts for admin
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    let query = supabaseAdmin
      .from('sm_posts')
      .select(`
        *,
        category:sm_categories(id, name, slug),
        author:sm_authors(id, display_name)
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (status) {
      query = query.eq('status', status)
    }

    const { data: posts, error, count } = await query

    if (error) {
      console.error('Error fetching posts:', error)
      return NextResponse.json(
        { error: 'Failed to fetch posts' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      posts,
      total: count,
      limit,
      offset,
    })
  } catch (error) {
    console.error('Error fetching posts:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/posts
 * Create a new post
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate required fields
    if (!body.title || !body.slug) {
      return NextResponse.json(
        { error: 'Title and slug are required' },
        { status: 400 }
      )
    }

    // Check for duplicate slug
    const { data: existing } = await supabaseAdmin
      .from('sm_posts')
      .select('id')
      .eq('slug', body.slug)
      .single()

    if (existing) {
      return NextResponse.json(
        { error: 'A post with this slug already exists' },
        { status: 400 }
      )
    }

    // Prepare post data
    let postData: Record<string, unknown> = {
      title: body.title,
      slug: body.slug,
      content: body.content || '',
      excerpt: body.excerpt || null,
      featured_image: body.featured_image || null,
      status: body.status || 'draft',
      category_id: body.category_id || null,
      author_id: body.author_id || null,
      seo_title: body.seo_title || null,
      seo_description: body.seo_description || null,
      created_at: new Date().toISOString(),
    }

    // Auto-fill SEO fields if publishing (ensure posts always have SEO data)
    if (body.status === 'published') {
      // Get category name for better AI context
      let categoryName: string | undefined
      if (body.category_id) {
        const { data: category } = await supabaseAdmin
          .from('sm_categories')
          .select('name')
          .eq('id', body.category_id)
          .single()
        categoryName = category?.name
      }

      postData = await autoFillSEOFields(postData, categoryName)
      postData.published_at = new Date().toISOString()
    }

    const { data: post, error } = await supabaseAdmin
      .from('sm_posts')
      .insert(postData)
      .select()
      .single()

    if (error) {
      console.error('Error creating post:', error)
      return NextResponse.json(
        { error: 'Failed to create post' },
        { status: 500 }
      )
    }

    return NextResponse.json(post, { status: 201 })
  } catch (error) {
    console.error('Error creating post:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
