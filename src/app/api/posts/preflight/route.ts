import { NextRequest, NextResponse } from 'next/server'
import { isBlockContent, parseDocument } from '@/components/admin/BlockEditor/serializer'
import type { ArticleDocument } from '@/components/admin/BlockEditor'
import { runPreflight, type PreflightInput } from '@/lib/post-publish'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * POST /api/posts/preflight
 *
 * Stateless validation — runs the 20 rules against the supplied draft and
 * returns the spec response shape. Called from the editor on debounced
 * changes, so it must stay fast (no DB reads, no network).
 *
 * Accepts either:
 *   - body_blocks: ArticleDocument (preferred — block tree as JSON)
 *   - body: string (legacy — SM_BLOCKS-marked HTML or plain HTML)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null)
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    }

    const input = normalizeRequest(body)
    const { response } = runPreflight(input)
    return NextResponse.json(response)
  } catch (err) {
    console.error('[posts/preflight] error:', err)
    return NextResponse.json({ error: 'Preflight failed' }, { status: 500 })
  }
}

/** Translate the spec wire format into the validators' input shape. */
function normalizeRequest(body: Record<string, unknown>): PreflightInput {
  let document: ArticleDocument | null = null
  let contentHtml: string | undefined

  if (body.body_blocks && typeof body.body_blocks === 'object') {
    document = body.body_blocks as ArticleDocument
  } else if (typeof body.body === 'string') {
    if (isBlockContent(body.body)) {
      document = parseDocument(body.body)
    } else {
      contentHtml = body.body
    }
  }

  return {
    postId: typeof body.post_id === 'string' ? body.post_id : null,
    title: typeof body.title === 'string' ? body.title : '',
    slug: typeof body.slug === 'string' ? body.slug : '',
    document,
    contentHtml,
    categoryId: typeof body.category_id === 'string' ? body.category_id : null,
    categorySlug: typeof body.category_slug === 'string' ? body.category_slug : null,
    featuredImageUrl:
      typeof body.featured_image_url === 'string' ? body.featured_image_url : null,
    featuredImageAlt:
      typeof body.featured_image_alt === 'string' ? body.featured_image_alt : null,
    metaDescription:
      typeof body.meta_description === 'string' ? body.meta_description : null,
    authorId: typeof body.author_id === 'string' ? body.author_id : null,
  }
}
