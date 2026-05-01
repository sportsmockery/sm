import { NextRequest, NextResponse } from 'next/server'
import { isBlockContent, parseDocument, serializeDocument } from '@/components/admin/BlockEditor/serializer'
import type { ArticleDocument } from '@/components/admin/BlockEditor'
import { getAuthUser } from '@/lib/admin-auth'
import { supabaseAdmin } from '@/lib/supabase-server'
import { runPublishGate } from '@/lib/post-publish/validate-server'
import type { PreflightInput } from '@/lib/post-publish'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * POST /api/posts/publish
 *
 * Re-runs the 20-rule schema server-side against the persisted block tree,
 * writes a row to sm_posts_publish_audits regardless of outcome, and only
 * flips the post to status='published' when every hard block passes.
 *
 * Trusts no client claim about validation. Soft-mode is controlled by the
 * `PUBLISH_GUARDRAILS_ENFORCE` env flag — when "true" we return 400 on
 * failure; otherwise we still log the audit row but allow the publish
 * through (so the rollout can ship without immediately blocking writers).
 */
export async function POST(request: NextRequest) {
  const user = await getAuthUser(request)
  if (!user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
  }

  const body = await request.json().catch(() => null)
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const postId = typeof (body as Record<string, unknown>).post_id === 'string'
    ? ((body as Record<string, unknown>).post_id as string)
    : null
  if (!postId) {
    return NextResponse.json({ error: 'post_id is required' }, { status: 400 })
  }

  const input = normalizeRequest(body as Record<string, unknown>)
  input.postId = postId

  try {
    const { response, patched } = await runPublishGate(input, { supabase: supabaseAdmin })
    const failed = response.checks.filter((c) => !c.passed)
    const enforce = process.env.PUBLISH_GUARDRAILS_ENFORCE === 'true'

    // Audit row regardless of outcome — editorial QA queries this table to
    // see how often hard blocks fire and which rules drive the most stops.
    await supabaseAdmin.from('sm_posts_publish_audits').insert({
      post_id: postId,
      user_id: user.id,
      passed: failed.length === 0,
      failed_rules: failed.map((c) => ({
        rule: c.rule,
        what_failed: c.what_failed ?? null,
      })),
      word_count: response.word_count,
      enforce_mode: enforce,
    })

    if (failed.length > 0 && enforce) {
      return NextResponse.json(
        {
          error: 'Publish blocked by guardrails',
          failed: failed.map((c) => ({
            rule: c.rule,
            what_failed: c.what_failed,
            why_it_matters: c.why_it_matters,
            how_to_fix: c.how_to_fix,
          })),
        },
        { status: 400 }
      )
    }

    // Flip status to published. We rebuild the content column from the
    // (possibly auto-fixed) document so the canonical SM_BLOCKS payload
    // matches what the validator just approved.
    const content = patched.document
      ? serializeDocument(patched.document)
      : (patched.contentHtml ?? '')

    const now = new Date().toISOString()
    const { data: updated, error } = await supabaseAdmin
      .from('sm_posts')
      .update({
        status: 'published',
        published_at: now,
        content,
        title: patched.title,
        slug: patched.slug,
      })
      .eq('id', postId)
      .select('id, slug, status, published_at')
      .single()

    if (error) {
      console.error('[posts/publish] update failed:', error)
      return NextResponse.json({ error: 'Publish update failed' }, { status: 500 })
    }

    return NextResponse.json({
      ok: true,
      enforced: enforce,
      post: updated,
      preflight: response,
    })
  } catch (err) {
    console.error('[posts/publish] error:', err)
    return NextResponse.json({ error: 'Publish failed' }, { status: 500 })
  }
}

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
