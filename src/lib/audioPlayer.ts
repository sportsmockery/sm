// lib/audioPlayer.ts
import { supabaseAdmin } from '@/lib/supabase-server'

export type NextArticleMode = "team" | "recent";

export interface ArticleMeta {
  id: number;
  slug: string;
  title: string;
  team: string | null; // e.g. "bears", "bulls"
  publishedAt: string; // ISO string
}

export interface ArticleAudioInfo {
  article: ArticleMeta;
  // URL to the audio file for this article; stubbed for now
  audioUrl: string;
}

export async function getArticleMetaBySlug(slug: string): Promise<ArticleMeta | null> {
  const { data: post, error } = await supabaseAdmin
    .from('sm_posts')
    .select(`
      id,
      slug,
      title,
      published_at,
      category:sm_categories!category_id (slug)
    `)
    .eq('slug', slug)
    .eq('status', 'published')
    .single()

  if (error || !post) {
    return null
  }

  // Extract team from category slug
  // Category can be an array or single object depending on Supabase join
  const categoryData = post.category as { slug: string } | { slug: string }[] | null
  const categorySlug = Array.isArray(categoryData)
    ? categoryData[0]?.slug || null
    : categoryData?.slug || null
  let team: string | null = null
  if (categorySlug) {
    // Normalize category slug to team name
    if (categorySlug.includes('bear')) team = 'bears'
    else if (categorySlug.includes('bull')) team = 'bulls'
    else if (categorySlug.includes('cub')) team = 'cubs'
    else if (categorySlug.includes('white') || categorySlug.includes('sox')) team = 'whitesox'
    else if (categorySlug.includes('hawk') || categorySlug.includes('black')) team = 'blackhawks'
    else team = categorySlug
  }

  return {
    id: post.id,
    slug: post.slug,
    title: post.title,
    team,
    publishedAt: post.published_at,
  }
}

/**
 * Get article metadata by ID
 */
export async function getArticleMetaById(id: number): Promise<ArticleMeta | null> {
  const { data: post, error } = await supabaseAdmin
    .from('sm_posts')
    .select(`
      id,
      slug,
      title,
      published_at,
      category:sm_categories!category_id (slug)
    `)
    .eq('id', id)
    .eq('status', 'published')
    .single()

  if (error || !post) {
    return null
  }

  const categoryData = post.category as { slug: string } | { slug: string }[] | null
  const categorySlug = Array.isArray(categoryData)
    ? categoryData[0]?.slug || null
    : categoryData?.slug || null
  let team: string | null = null
  if (categorySlug) {
    if (categorySlug.includes('bear')) team = 'bears'
    else if (categorySlug.includes('bull')) team = 'bulls'
    else if (categorySlug.includes('cub')) team = 'cubs'
    else if (categorySlug.includes('white') || categorySlug.includes('sox')) team = 'whitesox'
    else if (categorySlug.includes('hawk') || categorySlug.includes('black')) team = 'blackhawks'
    else team = categorySlug
  }

  return {
    id: post.id,
    slug: post.slug,
    title: post.title,
    team,
    publishedAt: post.published_at,
  }
}

/**
 * Given the current article and a mode, return the "next" article to play.
 * - mode "team": next most recent article with the same team.
 * - mode "recent": next most recent article overall.
 */
export async function getNextArticle(
  currentArticleId: number,
  mode: NextArticleMode,
  team: string | null
): Promise<ArticleMeta | null> {
  // First, get the current article's published_at
  const currentArticle = await getArticleMetaById(currentArticleId)
  if (!currentArticle) {
    return null
  }

  let query = supabaseAdmin
    .from('sm_posts')
    .select(`
      id,
      slug,
      title,
      published_at,
      category:sm_categories!category_id (slug)
    `)
    .eq('status', 'published')
    .lt('published_at', currentArticle.publishedAt)
    .order('published_at', { ascending: false })
    .limit(1)

  // For team mode, filter by category that matches the team
  if (mode === 'team' && team) {
    // Get category IDs that match this team
    const teamPatterns: Record<string, string[]> = {
      'bears': ['bears', 'chicago-bears'],
      'bulls': ['bulls', 'chicago-bulls'],
      'cubs': ['cubs', 'chicago-cubs'],
      'whitesox': ['white-sox', 'whitesox', 'chicago-white-sox'],
      'blackhawks': ['blackhawks', 'chicago-blackhawks'],
    }

    const patterns = teamPatterns[team] || [team]

    // Get matching category IDs
    const { data: categories } = await supabaseAdmin
      .from('sm_categories')
      .select('id')
      .or(patterns.map(p => `slug.ilike.%${p}%`).join(','))

    if (categories && categories.length > 0) {
      const categoryIds = categories.map(c => c.id)
      query = query.in('category_id', categoryIds)
    }
  }

  const { data: posts, error } = await query

  if (error || !posts || posts.length === 0) {
    return null
  }

  const post = posts[0]
  const categoryData = post.category as { slug: string } | { slug: string }[] | null
  const categorySlug = Array.isArray(categoryData)
    ? categoryData[0]?.slug || null
    : categoryData?.slug || null
  let postTeam: string | null = null
  if (categorySlug) {
    if (categorySlug.includes('bear')) postTeam = 'bears'
    else if (categorySlug.includes('bull')) postTeam = 'bulls'
    else if (categorySlug.includes('cub')) postTeam = 'cubs'
    else if (categorySlug.includes('white') || categorySlug.includes('sox')) postTeam = 'whitesox'
    else if (categorySlug.includes('hawk') || categorySlug.includes('black')) postTeam = 'blackhawks'
    else postTeam = categorySlug
  }

  return {
    id: post.id,
    slug: post.slug,
    title: post.title,
    team: postTeam,
    publishedAt: post.published_at,
  }
}

/**
 * Return an audio URL for an article.
 * For now, stub this and pretend a TTS pipeline exists that generates `/api/audio/[slug].mp3`.
 */
export async function getArticleAudioInfo(slug: string): Promise<ArticleAudioInfo | null> {
  const meta = await getArticleMetaBySlug(slug)
  if (!meta) return null

  return {
    article: meta,
    audioUrl: `/api/audio/${encodeURIComponent(slug)}`, // TODO: wire to real TTS
  }
}
