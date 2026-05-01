// SmPostsArticleHydrator
// Reads articles + authors from the SM Edge Supabase tables (sm_posts,
// sm_authors, sm_categories, sm_tags, sm_post_tags) and shapes them into the
// ArticleInput / AuthorInput contract that the Google rules engine expects.
//
// This is the single hydrator the rescore worker uses on test.sportsmockery.com.
// sm_posts holds both legacy WordPress imports and natively-authored Next.js
// posts, so the same hydrator covers both.

import type { SupabaseClient } from '@supabase/supabase-js'
import type { ArticleHydrator } from '@/workers/google-rescore-worker'
import type { ArticleInput, AuthorInput } from './google-rules-engine'

interface SmPostRow {
  id: string
  title: string | null
  slug: string | null
  content: string | null
  excerpt: string | null
  status: string | null
  published_at: string | null
  updated_at: string | null
  created_at: string | null
  category_id: string | null
  author_id: string | null
  seo_title: string | null
  seo_description: string | null
  featured_image: string | null
  // Optional columns that may exist; reads tolerate absence.
  canonical_url?: string | null
  robots?: string | null
  byline?: string | null
}

interface SmAuthorRow {
  id: string
  display_name: string | null
  bio: string | null
  email: string | null
  avatar_url: string | null
  social_twitter?: string | null
  social_linkedin?: string | null
  website?: string | null
  slug?: string | null
}

interface SmCategoryRow {
  id: string
  name: string | null
  slug: string | null
}

interface SmTagJoinRow {
  // Supabase row types model joined relations as arrays even when the FK is
  // 1:1, so `tag` is `{ ... }[]`. We take the first element below.
  tag: Array<{ id: string; name: string | null; slug: string | null }> | null
}

const TEAM_BY_CATEGORY_SLUG: Record<string, string> = {
  'chicago-bears': 'Bears',
  'chicago-blackhawks': 'Blackhawks',
  'chicago-bulls': 'Bulls',
  'chicago-cubs': 'Cubs',
  'chicago-white-sox': 'White Sox',
}

// Strip HTML tags but keep visible text. Used so rule heuristics that count
// words / measure length see the prose, not the markup.
function stripHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, ' ')
    .trim()
}

// Block content lives as JSON in sm_posts.content for new authoring; legacy
// WordPress imports store HTML. Detect and normalize to a plain-text body and
// extract image alts + link counts + schema hints.
interface ExtractedBody {
  body: string
  bodyImages: Array<{ src: string; alt: string | null }>
  internalLinkCount: number
  externalLinkCount: number
  schemaTypes: string[]
}

function extractFromHtml(html: string): ExtractedBody {
  const bodyImages: Array<{ src: string; alt: string | null }> = []
  const imgRe = /<img[^>]*?src=["']([^"']+)["'][^>]*?(?:alt=["']([^"']*)["'])?[^>]*>/gi
  let m: RegExpExecArray | null
  while ((m = imgRe.exec(html)) !== null) {
    bodyImages.push({ src: m[1], alt: m[2] ?? null })
  }

  let internalLinkCount = 0
  let externalLinkCount = 0
  const linkRe = /<a[^>]*?href=["']([^"']+)["'][^>]*>/gi
  while ((m = linkRe.exec(html)) !== null) {
    const href = m[1]
    if (/^https?:\/\//i.test(href) && !/sportsmockery\.com/i.test(href)) externalLinkCount += 1
    else internalLinkCount += 1
  }

  const schemaTypes: string[] = []
  const ldRe = /<script[^>]*?type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi
  while ((m = ldRe.exec(html)) !== null) {
    try {
      const json = JSON.parse(m[1])
      const t = json['@type']
      if (Array.isArray(t)) schemaTypes.push(...t.map(String))
      else if (typeof t === 'string') schemaTypes.push(t)
    } catch {
      // ignore malformed ld+json
    }
  }

  return {
    body: stripHtml(html),
    bodyImages,
    internalLinkCount,
    externalLinkCount,
    schemaTypes,
  }
}

interface BlockNode {
  type?: string
  data?: Record<string, unknown>
  children?: BlockNode[]
}

function extractFromBlocks(doc: unknown): ExtractedBody {
  const bodyParts: string[] = []
  const bodyImages: Array<{ src: string; alt: string | null }> = []
  let internalLinkCount = 0
  let externalLinkCount = 0
  const schemaTypes: string[] = []

  const visit = (node: BlockNode | null | undefined): void => {
    if (!node || typeof node !== 'object') return
    const data = (node.data ?? {}) as Record<string, unknown>
    const t = node.type
    if (t === 'paragraph' || t === 'subheading' || t === 'heading' || t === 'callout' || t === 'insight' || t === 'update' || t === 'quote') {
      const html = String(data.html ?? data.text ?? '')
      const stripped = stripHtml(html)
      if (stripped) bodyParts.push(stripped)
      const linkRe = /<a[^>]*?href=["']([^"']+)["'][^>]*>/gi
      let m: RegExpExecArray | null
      while ((m = linkRe.exec(html)) !== null) {
        if (/^https?:\/\//i.test(m[1]) && !/sportsmockery\.com/i.test(m[1])) externalLinkCount += 1
        else internalLinkCount += 1
      }
    }
    if (t === 'image' || t === 'figure') {
      const src = String(data.src ?? data.url ?? '')
      if (src) bodyImages.push({ src, alt: (data.alt as string | null) ?? null })
    }
    if (t === 'chart' || t === 'analytics') schemaTypes.push('Dataset')
    if (t === 'rumorConfidence' || t === 'rumor') schemaTypes.push('NewsArticle')
    if (t === 'debate' || t === 'poll') schemaTypes.push('NewsArticle')
    if (t === 'playerComparison' || t === 'draftPick') schemaTypes.push('SportsEvent')

    const children = node.children
    if (Array.isArray(children)) for (const c of children) visit(c)
  }

  if (doc && typeof doc === 'object') {
    const root = doc as { blocks?: BlockNode[]; children?: BlockNode[] }
    const blocks = Array.isArray(root.blocks) ? root.blocks : Array.isArray(root.children) ? root.children : null
    if (blocks) for (const b of blocks) visit(b)
  }

  return {
    body: bodyParts.join('\n\n'),
    bodyImages,
    internalLinkCount,
    externalLinkCount,
    schemaTypes,
  }
}

function isLikelyBlockJson(s: string): boolean {
  const trimmed = s.trim()
  if (!trimmed.startsWith('{') && !trimmed.startsWith('[')) return false
  try {
    const parsed = JSON.parse(trimmed)
    if (Array.isArray(parsed)) return parsed.some((n: unknown) => typeof n === 'object' && n !== null && 'type' in (n as Record<string, unknown>))
    if (parsed && typeof parsed === 'object') {
      const o = parsed as Record<string, unknown>
      return Array.isArray(o.blocks) || Array.isArray(o.children)
    }
  } catch {
    return false
  }
  return false
}

function extractBody(content: string | null): ExtractedBody {
  if (!content || !content.trim()) {
    return { body: '', bodyImages: [], internalLinkCount: 0, externalLinkCount: 0, schemaTypes: [] }
  }
  if (isLikelyBlockJson(content)) {
    try {
      return extractFromBlocks(JSON.parse(content))
    } catch {
      return extractFromHtml(content)
    }
  }
  return extractFromHtml(content)
}

// Topic entities: derive from tags + title keywords (cheap heuristic — the
// rules engine scores presence/breadth, not semantic depth).
function deriveTopicEntities(title: string, tags: string[]): string[] {
  const fromTags = tags.map((t) => t.trim()).filter(Boolean)
  const fromTitle = title
    .split(/\s+/)
    .filter((w) => /^[A-Z][a-zA-Z'’.-]{2,}$/.test(w))
    .slice(0, 8)
  return Array.from(new Set([...fromTags, ...fromTitle]))
}

export class SmPostsArticleHydrator implements ArticleHydrator {
  constructor(private readonly db: SupabaseClient) {}

  async hydrate(articleId: string): Promise<{ article: ArticleInput; author: AuthorInput } | null> {
    const { data: postRaw, error } = await this.db
      .from('sm_posts')
      .select('*')
      .eq('id', articleId)
      .maybeSingle()
    if (error || !postRaw) return null
    const post = postRaw as SmPostRow

    const [categoryRes, authorRes, tagsRes, authorPostCountRes] = await Promise.all([
      post.category_id
        ? this.db.from('sm_categories').select('id,name,slug').eq('id', post.category_id).maybeSingle()
        : Promise.resolve({ data: null as SmCategoryRow | null }),
      post.author_id
        ? this.db.from('sm_authors').select('*').eq('id', post.author_id).maybeSingle()
        : Promise.resolve({ data: null as SmAuthorRow | null }),
      this.db.from('sm_post_tags').select('tag:sm_tags(id,name,slug)').eq('post_id', articleId),
      post.author_id
        ? this.db.from('sm_posts').select('id', { count: 'exact', head: true }).eq('author_id', post.author_id).eq('status', 'published')
        : Promise.resolve({ count: 0 }),
    ])

    const category = (categoryRes.data ?? null) as SmCategoryRow | null
    const author = (authorRes.data ?? null) as SmAuthorRow | null
    const tagRows = ((tagsRes.data ?? []) as SmTagJoinRow[])
      .map((r) => (Array.isArray(r.tag) ? r.tag[0] : r.tag))
      .filter((t): t is { id: string; name: string | null; slug: string | null } => t !== null && t !== undefined)
    const tagNames = tagRows.map((t) => t.name ?? '').filter(Boolean)
    const publishedArticleCount = Number((authorPostCountRes as { count?: number | null }).count ?? 0)

    const extracted = extractBody(post.content)
    const team = category?.slug ? (TEAM_BY_CATEGORY_SLUG[category.slug] ?? null) : null

    // Auto-derive the canonical from category + slug when the post doesn't
    // carry an explicit one. Matches the live URL pattern on sportsmockery.com
    // so writers don't have to set this per article — the rule passes for free
    // and the suggestion stops nagging across the leaderboard.
    const derivedCanonical =
      category?.slug && post.slug
        ? `https://sportsmockery.com/${category.slug}/${post.slug}/`
        : null
    const canonical = post.canonical_url ?? derivedCanonical

    const articleInput: ArticleInput = {
      id: String(post.id),
      title: post.title ?? '',
      body: extracted.body,
      category: category?.name ?? '—',
      tags: tagNames,
      metaTitle: post.seo_title ?? null,
      metaDescription: post.seo_description ?? post.excerpt ?? null,
      canonical,
      robots: post.robots ?? null,
      publishedAt: post.published_at,
      updatedAt: post.updated_at,
      byline: post.byline ?? author?.display_name ?? null,
      bodyImages: extracted.bodyImages,
      internalLinkCount: extracted.internalLinkCount,
      externalLinkCount: extracted.externalLinkCount,
      schemaTypes: extracted.schemaTypes.length > 0 ? extracted.schemaTypes : ['NewsArticle'],
      topicEntities: deriveTopicEntities(post.title ?? '', tagNames),
      team,
    }

    const authorInput: AuthorInput = {
      id: author?.id ?? post.author_id ?? '',
      name: author?.display_name ?? '',
      bio: author?.bio ?? null,
      hasAuthorPage: Boolean(author?.slug || author?.id),
      hasContactInfo: Boolean(author?.email || author?.social_twitter || author?.social_linkedin || author?.website),
      hasCredentials: Boolean(author?.bio && author.bio.length >= 60),
      publishedArticleCount,
    }

    return { article: articleInput, author: authorInput }
  }
}
