/* ------------------------------------------------------------------ */
/*  Hero Data Fetcher — Server-side data pipeline for homepage hero    */
/*                                                                     */
/*  Fetches trending articles, live games, user preferences, and       */
/*  debate context. Returns typed hero props for the controller.       */
/* ------------------------------------------------------------------ */

import { supabaseAdmin } from "@/lib/supabase-server"
import type {
  FeaturedStory,
  GameContext,
  TeamContext,
  DebateContext,
} from "@/components/home/hero/types"
import { TRENDING_VIEW_THRESHOLD } from "@/components/home/hero/types"
import { getTeamFromCategory } from "@/lib/transform-post"

/* ── Team slug → display name mapping ── */

const TEAM_DISPLAY: Record<string, string> = {
  bears: "Chicago Bears",
  bulls: "Chicago Bulls",
  blackhawks: "Chicago Blackhawks",
  cubs: "Chicago Cubs",
  whitesox: "Chicago White Sox",
  "white-sox": "Chicago White Sox",
}

const TEAM_HUB_HREF: Record<string, string> = {
  bears: "/chicago-bears",
  bulls: "/chicago-bulls",
  blackhawks: "/chicago-blackhawks",
  cubs: "/chicago-cubs",
  whitesox: "/chicago-whitesox",
  "white-sox": "/chicago-whitesox",
}

/* ── Relative time formatting ── */

function formatPublishedLabel(publishedAt: string | null): string {
  if (!publishedAt) return ""
  const diffMs = Date.now() - new Date(publishedAt).getTime()
  const mins = Math.floor(diffMs / 60000)
  const hrs = Math.floor(diffMs / 3600000)
  const days = Math.floor(diffMs / 86400000)
  if (mins < 60) return `${Math.max(1, mins)}m ago`
  if (hrs < 24) return `${hrs}h ago`
  if (days < 7) return `${days}d ago`
  return `${Math.floor(days / 7)}w ago`
}

/* ── Category slug → team slug ── */

function categoryToTeamSlug(categorySlug: string | undefined): string | undefined {
  if (!categorySlug) return undefined
  const lower = categorySlug.toLowerCase()
  if (lower.includes("bears")) return "bears"
  if (lower.includes("bulls")) return "bulls"
  if (lower.includes("blackhawks")) return "blackhawks"
  if (lower.includes("cubs")) return "cubs"
  if (lower.includes("whitesox") || lower.includes("white-sox") || lower.includes("white_sox"))
    return "whitesox"
  return undefined
}

/* ── Exported result type ── */

export interface HeroData {
  featuredStory: FeaturedStory | null
  gameContext: GameContext | null
  teamContext: TeamContext | null
  debateContext: DebateContext | null
  primaryTeam: string | null
  /** The article ID used as hero, so the feed can suppress it */
  heroArticleId: number | null
}

/* ── Main fetcher ── */

export async function getHeroData(userId: string | null): Promise<HeroData> {
  const result: HeroData = {
    featuredStory: null,
    gameContext: null,
    teamContext: null,
    debateContext: null,
    primaryTeam: null,
    heroArticleId: null,
  }

  if (!supabaseAdmin) return result

  // Run independent queries in parallel
  const [featuredResult, prefsResult, liveGamesResult] = await Promise.allSettled([
    fetchFeaturedStory(),
    userId ? fetchUserPrimaryTeam(userId) : Promise.resolve(null),
    fetchLiveGames(),
  ])

  // 1. Featured/trending story
  if (featuredResult.status === "fulfilled" && featuredResult.value) {
    result.featuredStory = featuredResult.value.story
    result.heroArticleId = featuredResult.value.articleId
  }

  // 2. User primary team
  if (prefsResult.status === "fulfilled" && prefsResult.value) {
    result.primaryTeam = prefsResult.value
  }

  // 3. Live game context
  if (liveGamesResult.status === "fulfilled" && liveGamesResult.value) {
    result.gameContext = liveGamesResult.value
  }

  // 4. Team pulse context (if user has a primary team)
  if (result.primaryTeam) {
    const teamPulse = await fetchTeamPulse(result.primaryTeam)
    if (teamPulse) {
      result.teamContext = teamPulse
    }
  }

  // 5. Debate context (from recent articles with debate blocks)
  const debate = await fetchDebateContext()
  if (debate) {
    result.debateContext = debate
  }

  return result
}

/* ── Featured story query ── */

async function fetchFeaturedStory(): Promise<{
  story: FeaturedStory
  articleId: number
} | null> {
  if (!supabaseAdmin) return null

  try {
    // Max 48 hours old — never hero-takeover a stale article
    const cutoff = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString()

    // Get highest-viewed recent published article within 48h window
    const { data: posts } = await supabaseAdmin
      .from("sm_posts")
      .select(
        "id, title, slug, excerpt, featured_image, views, published_at, importance_score, category:sm_categories!category_id(slug, name)"
      )
      .eq("status", "published")
      .not("featured_image", "is", null)
      .gte("published_at", cutoff)
      .order("views", { ascending: false })
      .limit(5)

    if (!posts || posts.length === 0) return null

    // Find the best candidate: views >= threshold, or editor-boosted (importance >= 90)
    const candidate = posts.find((p) => {
      const views = p.views ?? 0
      const importance = p.importance_score ?? 0
      return views >= TRENDING_VIEW_THRESHOLD || importance >= 90
    })

    if (!candidate) return null

    const category = Array.isArray(candidate.category)
      ? candidate.category[0]
      : candidate.category
    const teamSlug = categoryToTeamSlug(category?.slug)
    const teamName = teamSlug ? TEAM_DISPLAY[teamSlug] : undefined

    // Build article URL
    const categorySlug = category?.slug || "news"
    const href = `/${categorySlug}/${candidate.slug}`

    return {
      story: {
        id: String(candidate.id),
        title: candidate.title,
        dek: candidate.excerpt || undefined,
        imageUrl: candidate.featured_image!,
        href,
        views: candidate.views ?? 0,
        team: teamName,
        publishedLabel: formatPublishedLabel(candidate.published_at),
        forceHeroFeatured: (candidate.importance_score ?? 0) >= 90,
      },
      articleId: candidate.id,
    }
  } catch (e) {
    console.error("[hero-data] fetchFeaturedStory error:", e)
    return null
  }
}

/* ── User primary team ── */

async function fetchUserPrimaryTeam(userId: string): Promise<string | null> {
  if (!supabaseAdmin) return null

  try {
    const { data } = await supabaseAdmin
      .from("sm_user_preferences")
      .select("favorite_teams")
      .eq("user_id", userId)
      .single()

    if (!data?.favorite_teams?.length) return null
    return data.favorite_teams[0] // Primary = first team
  } catch {
    return null
  }
}

/* ── Live games ── */

async function fetchLiveGames(): Promise<GameContext | null> {
  if (!supabaseAdmin) return null

  try {
    const { data: registry } = await supabaseAdmin
      .from("live_games_registry")
      .select("*")
      .in("status", ["live", "pre"])
      .limit(5)

    if (!registry || registry.length === 0) return null

    // Prefer live games over pre-game
    const game = registry.find((g: any) => g.status === "live") || registry[0]

    // Build matchup string from available data
    const matchup = game.matchup || `${game.home_team || "Home"} vs ${game.away_team || "Away"}`
    const kickoffLabel =
      game.status === "live"
        ? game.game_time || "LIVE NOW"
        : game.start_time
          ? new Date(game.start_time).toLocaleTimeString("en-US", {
              hour: "numeric",
              minute: "2-digit",
            })
          : "Today"

    // Determine team hub link
    const teamSlug = game.team_key || "bears"
    const href = TEAM_HUB_HREF[teamSlug] || "/chicago-bears"

    return {
      matchup,
      kickoffLabel,
      href,
      storyline: game.storyline || undefined,
    }
  } catch {
    return null
  }
}

/* ── Team pulse ── */

async function fetchTeamPulse(teamSlug: string): Promise<TeamContext | null> {
  if (!supabaseAdmin) return null

  try {
    // Get recent articles for this team to extract trending topics
    const { data: posts } = await supabaseAdmin
      .from("sm_posts")
      .select("title, category:sm_categories!category_id(slug)")
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .limit(50)

    if (!posts || posts.length === 0) return null

    // Filter to this team's articles
    const teamPosts = posts.filter((p) => {
      const cat = Array.isArray(p.category) ? p.category[0] : p.category
      const slug = categoryToTeamSlug(cat?.slug)
      return slug === teamSlug || slug === teamSlug.replace("-", "")
    })

    if (teamPosts.length === 0) return null

    // Extract 2-3 topic headlines (shortened)
    const topics = teamPosts
      .slice(0, 3)
      .map((p) => {
        const title = p.title || ""
        return title.length > 50 ? title.slice(0, 47) + "..." : title
      })

    return {
      teamName: TEAM_DISPLAY[teamSlug] || TEAM_DISPLAY[teamSlug.replace("-", "")] || teamSlug,
      topics,
      href: TEAM_HUB_HREF[teamSlug] || TEAM_HUB_HREF[teamSlug.replace("-", "")] || `/chicago-${teamSlug}`,
    }
  } catch {
    return null
  }
}

/* ── Debate context ── */

async function fetchDebateContext(): Promise<DebateContext | null> {
  if (!supabaseAdmin) return null

  try {
    // Look for recent articles that have debate blocks in their content
    const { data: posts } = await supabaseAdmin
      .from("sm_posts")
      .select("id, title, slug, content, category:sm_categories!category_id(slug)")
      .eq("status", "published")
      .eq("template_version", 1)
      .order("published_at", { ascending: false })
      .limit(20)

    if (!posts) return null

    for (const post of posts) {
      try {
        let contentStr = String(post.content || "")
        if (contentStr.includes("<!-- SM_BLOCKS -->")) {
          contentStr = contentStr
            .replace("<!-- SM_BLOCKS -->", "")
            .replace("<!-- /SM_BLOCKS -->", "")
            .trim()
        }
        const doc = JSON.parse(contentStr)
        const blocks = doc.blocks || []

        const debateBlock = blocks.find(
          (b: any) => b.type === "debate" && b.data?.question
        )

        if (debateBlock) {
          const cat = Array.isArray(post.category) ? post.category[0] : post.category
          const categorySlug = cat?.slug || "news"
          return {
            question: debateBlock.data.question,
            sentimentLabel: debateBlock.data.sentimentLabel || undefined,
            href: `/${categorySlug}/${post.slug}`,
          }
        }
      } catch {
        // Content not parseable, skip
      }
    }

    return null
  } catch {
    return null
  }
}
