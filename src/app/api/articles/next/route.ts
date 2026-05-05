import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'
import {
  sanitizeWordPressContent,
  stripDuplicateFeaturedImage,
  calculateReadTime,
} from '@/lib/content-utils'
import { buildAutoLinkContextForPost, applyAutoLinksToHtml } from '@/lib/autolink'
import { isBlockContent, parseDocument } from '@/components/admin/BlockEditor/serializer'
import { getArticleAudioInfo } from '@/lib/audioPlayer'
import { getArticleFaqsForRender } from '@/lib/articleFaq'
import type { FAQItem } from '@/lib/seo/schema/faq-page'
import type { ArticleDocument } from '@/components/admin/BlockEditor/types'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const TEAM_PATTERNS: Record<string, string[]> = {
  bears: ['bears', 'chicago-bears'],
  bulls: ['bulls', 'chicago-bulls'],
  cubs: ['cubs', 'chicago-cubs'],
  whitesox: ['white-sox', 'whitesox', 'chicago-white-sox'],
  'white-sox': ['white-sox', 'whitesox', 'chicago-white-sox'],
  blackhawks: ['blackhawks', 'chicago-blackhawks'],
}

interface StreamedArticleAuthor {
  id: number
  display_name: string
  bio: string | null
  avatar_url: string | null
  email: string | null
}

interface StreamedArticleCategory {
  id: number
  name: string
  slug: string
}

export interface StreamedArticlePayload {
  post: {
    id: number
    slug: string
    title: string
    excerpt: string | null
    content: string
    featured_image: string | null
    image_variants: Record<string, { url?: string }> | null
    published_at: string
    updated_at: string | null
    seo_title: string | null
    seo_description: string | null
    author_id: number | null
    category_id: number
    views: number
    comments_count: number
    toc: Array<{ id: string; text: string; level: number }> | null
  }
  author: StreamedArticleAuthor | null
  category: StreamedArticleCategory
  tags: string[]
  readingTime: number
  hasEnoughHeadings: boolean
  /** Sanitized + auto-linked HTML, ready to render. Null when blockDocument is present. */
  processedHtml: string | null
  /** Parsed block document, or null for legacy HTML posts. */
  blockDocument: ArticleDocument | null
  audio: {
    audioUrl: string
  } | null
  team: string | null
  url: string
  faqs: FAQItem[]
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const afterIdRaw = searchParams.get('afterId')
    const team = searchParams.get('team')
    const excludeRaw = searchParams.get('exclude') || ''

    const afterId = afterIdRaw ? Number(afterIdRaw) : NaN
    if (!Number.isFinite(afterId)) {
      return NextResponse.json({ error: 'afterId required' }, { status: 400 })
    }

    const excludeIds = excludeRaw
      .split(',')
      .map((s) => Number(s))
      .filter((n) => Number.isFinite(n))

    // Look up the cursor article's published_at to walk backward in time.
    const { data: cursor, error: cursorErr } = await supabaseAdmin
      .from('sm_posts')
      .select('id, published_at')
      .eq('id', afterId)
      .single()

    if (cursorErr || !cursor?.published_at) {
      return NextResponse.json({ error: 'cursor not found' }, { status: 404 })
    }

    // Resolve same-team category IDs once (when team given).
    let teamCategoryIds: number[] | null = null
    if (team) {
      const patterns = TEAM_PATTERNS[team] || [team]
      const { data: cats } = await supabaseAdmin
        .from('sm_categories')
        .select('id')
        .or(patterns.map((p) => `slug.ilike.%${p}%`).join(','))
      teamCategoryIds = (cats || []).map((c) => c.id)
    }

    // Try same-team first; fall back to any-published if no same-team match.
    const selectCols =
      'id, slug, title, content, excerpt, featured_image, image_variants, published_at, updated_at, seo_title, seo_description, author_id, category_id, views, comments_count, toc, faq_json'

    const runQuery = async (categoryIds: number[] | null) => {
      let q = supabaseAdmin
        .from('sm_posts')
        .select(selectCols)
        .eq('status', 'published')
        .lt('published_at', cursor.published_at)
        .order('published_at', { ascending: false })
        .limit(1)
      if (categoryIds && categoryIds.length > 0) {
        q = q.in('category_id', categoryIds)
      }
      if (excludeIds.length > 0) {
        q = q.not('id', 'in', `(${excludeIds.join(',')})`)
      }
      const { data } = await q
      return data?.[0] || null
    }

    let post = teamCategoryIds && teamCategoryIds.length > 0 ? await runQuery(teamCategoryIds) : null
    if (!post) post = await runQuery(null)

    if (!post) {
      return NextResponse.json({ post: null }, { status: 200 })
    }

    // Side data in parallel.
    const [authorRes, categoryRes, tagsRes, audioInfo] = await Promise.all([
      post.author_id
        ? supabaseAdmin
            .from('sm_authors')
            .select('id, display_name, bio, avatar_url, email')
            .eq('id', post.author_id)
            .single()
        : Promise.resolve({ data: null, error: null } as {
            data: StreamedArticleAuthor | null
            error: null
          }),
      supabaseAdmin
        .from('sm_categories')
        .select('id, name, slug')
        .eq('id', post.category_id)
        .single(),
      supabaseAdmin
        .from('sm_post_tags')
        .select('tag:sm_tags(id, name, slug)')
        .eq('post_id', post.id),
      getArticleAudioInfo(post.slug).catch(() => null),
    ])

    const author = authorRes.data || null
    const category = categoryRes.data
    if (!category) {
      return NextResponse.json({ error: 'category missing' }, { status: 500 })
    }

    const tags = (tagsRes.data || [])
      .map((t: unknown) => {
        const tagData = t as {
          tag?: { name?: string } | Array<{ name?: string }>
        }
        return Array.isArray(tagData.tag) ? tagData.tag[0]?.name : tagData.tag?.name
      })
      .filter((n): n is string => typeof n === 'string')

    const rawContent = post.content || ''
    const blockDocument = isBlockContent(rawContent) ? parseDocument(rawContent) : null

    let processedHtml: string | null = null
    if (!blockDocument) {
      const sanitized = sanitizeWordPressContent(rawContent)
      let linked = sanitized
      try {
        const ctx = await buildAutoLinkContextForPost(post.id, category.slug)
        linked = applyAutoLinksToHtml(sanitized, ctx)
      } catch (err) {
        console.error('[articles/next] autolink failed', err)
      }
      processedHtml = stripDuplicateFeaturedImage(linked, post.featured_image)
    }

    const storedToc = post.toc as Array<{ id: string; text: string; level: number }> | null
    const hasEnoughHeadings = (() => {
      if (storedToc && storedToc.length >= 3) return true
      const matches = rawContent.match(/<h[23][^>]*>/gi)
      return (matches?.length || 0) >= 3
    })()

    // FAQs — cached → blocks → AI generation. Runs in parallel-ish with the
    // rest of the payload assembly via await (cached path is a fast no-op).
    let faqs: FAQItem[] = []
    try {
      const resolved = await getArticleFaqsForRender(
        { id: post.id, title: post.title, content: rawContent },
        { cachedFaqJson: (post as { faq_json?: unknown }).faq_json }
      )
      faqs = resolved.items
    } catch (err) {
      console.error('[articles/next] faq resolution failed', err)
    }

    const teamFromCategory = (() => {
      const slug = category.slug.toLowerCase()
      if (slug.includes('bear')) return 'bears'
      if (slug.includes('bull')) return 'bulls'
      if (slug.includes('cub')) return 'cubs'
      if (slug.includes('white') || slug.includes('sox')) return 'whitesox'
      if (slug.includes('hawk') || slug.includes('black')) return 'blackhawks'
      return null
    })()

    const payload: StreamedArticlePayload = {
      post: {
        id: post.id,
        slug: post.slug,
        title: post.title,
        excerpt: post.excerpt,
        content: rawContent,
        featured_image: post.featured_image,
        image_variants: post.image_variants as StreamedArticlePayload['post']['image_variants'],
        published_at: post.published_at,
        updated_at: post.updated_at,
        seo_title: post.seo_title,
        seo_description: post.seo_description,
        author_id: post.author_id,
        category_id: post.category_id,
        views: post.views || 0,
        comments_count: post.comments_count || 0,
        toc: storedToc,
      },
      author,
      category,
      tags,
      readingTime: calculateReadTime(rawContent),
      hasEnoughHeadings,
      processedHtml,
      blockDocument,
      audio: audioInfo
        ? {
            audioUrl: audioInfo.audioUrl,
          }
        : null,
      team: teamFromCategory,
      url: `/${category.slug}/${post.slug}`,
      faqs,
    }

    return NextResponse.json(payload, {
      headers: {
        // Cache briefly at the edge to soften load — content is published, not personalized.
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    })
  } catch (err) {
    console.error('[articles/next] error', err)
    return NextResponse.json({ error: 'internal error' }, { status: 500 })
  }
}
