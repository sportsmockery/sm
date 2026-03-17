/* ------------------------------------------------------------------ */
/*  Story Universe Detection Utility                                   */
/*                                                                     */
/*  Auto-suggests related story clusters for Story Universe takeover.  */
/*  Deterministic V1 — no external AI dependency.                      */
/* ------------------------------------------------------------------ */

import { supabaseAdmin } from "@/lib/supabase-server"

export interface StoryUniverseCandidate {
  id: string
  title: string
  slug: string
  excerpt: string | null
  featured_image: string | null
  published_at: string | null
  views: number
  categorySlug?: string
  /** Relevance score (higher = more related) */
  score: number
}

interface PostForMatching {
  id: string
  title: string
  slug: string
  excerpt: string | null
  featured_image: string | null
  published_at: string | null
  views: number
  category_id: string | null
  category?: { slug: string } | { slug: string }[] | null
  tags?: { tag: { name: string; slug: string } }[] | null
}

/**
 * Get Story Universe candidates for a given post.
 *
 * Returns an array of related posts ranked by relevance signals:
 *  - shared category (same team)
 *  - shared tags
 *  - title keyword overlap
 *  - recency boost
 *
 * @param postId - The current post ID to find relatives for
 * @param categoryId - The current post's category ID (team)
 * @param title - The current post's title (for keyword matching)
 * @param tags - The current post's tag slugs
 * @param limit - Max candidates to return (default 10)
 */
export async function getStoryUniverseCandidates(
  postId: string,
  categoryId: string | null,
  title: string,
  tags: string[] = [],
  limit = 10
): Promise<StoryUniverseCandidate[]> {
  if (!supabaseAdmin) return []

  try {
    // Fetch recent published posts (last 14 days) excluding current post
    const cutoff = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()

    const { data: posts } = await supabaseAdmin
      .from("sm_posts")
      .select(
        "id, title, slug, excerpt, featured_image, published_at, views, category_id, category:sm_categories!category_id(slug)"
      )
      .eq("status", "published")
      .neq("id", postId)
      .gte("published_at", cutoff)
      .order("published_at", { ascending: false })
      .limit(50)

    if (!posts || posts.length === 0) return []

    // Fetch tags for these posts
    const postIds = posts.map((p) => p.id)
    const { data: postTags } = await supabaseAdmin
      .from("sm_post_tags")
      .select("post_id, tag:sm_tags(name, slug)")
      .in("post_id", postIds)

    const tagsByPost = new Map<string, string[]>()
    if (postTags) {
      for (const pt of postTags) {
        const tag = Array.isArray(pt.tag) ? pt.tag[0] : pt.tag
        if (!tag) continue
        const existing = tagsByPost.get(String(pt.post_id)) || []
        existing.push(tag.slug)
        tagsByPost.set(String(pt.post_id), existing)
      }
    }

    // Extract keywords from current post title
    const titleKeywords = extractKeywords(title)
    const tagSet = new Set(tags.map((t) => t.toLowerCase()))

    // Score each candidate
    const scored: StoryUniverseCandidate[] = posts.map((p) => {
      let score = 0

      // Category match (same team) — strong signal
      if (categoryId && p.category_id === categoryId) {
        score += 30
      }

      // Tag overlap
      const candidateTags = tagsByPost.get(String(p.id)) || []
      const tagOverlap = candidateTags.filter((t) => tagSet.has(t.toLowerCase())).length
      score += tagOverlap * 15

      // Title keyword overlap
      const candidateKeywords = extractKeywords(p.title)
      const keywordOverlap = titleKeywords.filter((kw) =>
        candidateKeywords.includes(kw)
      ).length
      score += keywordOverlap * 10

      // Recency boost (newer = higher)
      if (p.published_at) {
        const ageHours = (Date.now() - new Date(p.published_at).getTime()) / 3600000
        if (ageHours < 6) score += 15
        else if (ageHours < 24) score += 10
        else if (ageHours < 72) score += 5
      }

      // Views boost (popular related stories are better)
      if (p.views >= 2500) score += 10
      else if (p.views >= 1000) score += 5

      const category = Array.isArray(p.category) ? p.category[0] : p.category

      return {
        id: String(p.id),
        title: p.title,
        slug: p.slug,
        excerpt: p.excerpt,
        featured_image: p.featured_image,
        published_at: p.published_at,
        views: p.views ?? 0,
        categorySlug: category?.slug,
        score,
      }
    })

    // Sort by score descending, then by recency
    scored.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score
      const aTime = a.published_at ? new Date(a.published_at).getTime() : 0
      const bTime = b.published_at ? new Date(b.published_at).getTime() : 0
      return bTime - aTime
    })

    // Only return candidates with meaningful relevance
    return scored.filter((c) => c.score >= 20).slice(0, limit)
  } catch (e) {
    console.error("[story-universe-detection] error:", e)
    return []
  }
}

/**
 * Check if a post qualifies as a Story Universe candidate
 * (i.e., has enough related content to suggest Story Universe).
 */
export function isStoryUniverseDetected(candidates: StoryUniverseCandidate[]): boolean {
  // Need at least 3 related posts with decent scores
  return candidates.filter((c) => c.score >= 25).length >= 3
}

/** Extract meaningful keywords from a title (lowercase, no stop words) */
function extractKeywords(title: string): string[] {
  const stopWords = new Set([
    "the", "a", "an", "is", "are", "was", "were", "be", "been", "being",
    "have", "has", "had", "do", "does", "did", "will", "would", "could",
    "should", "may", "might", "can", "shall", "to", "of", "in", "for",
    "on", "with", "at", "by", "from", "as", "into", "through", "during",
    "before", "after", "above", "below", "between", "out", "off", "over",
    "under", "again", "further", "then", "once", "here", "there", "when",
    "where", "why", "how", "all", "both", "each", "few", "more", "most",
    "other", "some", "such", "no", "nor", "not", "only", "own", "same",
    "so", "than", "too", "very", "just", "but", "and", "or", "if", "it",
    "its", "this", "that", "these", "those", "what", "which", "who",
    "whom", "his", "her", "their", "about", "up", "new",
  ])

  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !stopWords.has(w))
}
