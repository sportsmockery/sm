/* ------------------------------------------------------------------ */
/*  Hero Data Fetcher — Server-side data pipeline for homepage hero    */
/*                                                                     */
/*  Fetches trending articles, live games, user preferences, and       */
/*  debate context. Returns typed hero props for the controller.       */
/* ------------------------------------------------------------------ */

import { supabaseAdmin } from "@/lib/supabase-server"
import { datalabAdmin } from "@/lib/supabase-datalab"
import type {
  FeaturedStory,
  GameContext,
  TeamContext,
  DebateContext,
  StoryUniverseContext,
  StoryUniverseRelatedStory,
  ScoutLiveContext,
  LiveSignal,
  LiveSignalType,
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
  storyUniverseContext: StoryUniverseContext | null
  scoutLiveContext: ScoutLiveContext | null
  gameContexts: GameContext[]
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
    storyUniverseContext: null,
    scoutLiveContext: null,
    gameContexts: [],
    teamContext: null,
    debateContext: null,
    primaryTeam: null,
    heroArticleId: null,
  }

  if (!supabaseAdmin) return result

  // Run independent queries in parallel
  const [featuredResult, prefsResult, liveGamesResult, storyUniverseResult, scoutLiveResult] = await Promise.allSettled([
    fetchFeaturedStory(),
    userId ? fetchUserPrimaryTeam(userId) : Promise.resolve(null),
    fetchLiveGames(),
    fetchStoryUniverse(),
    fetchScoutLive(),
  ])

  // 1. Featured/trending story
  if (featuredResult.status === "fulfilled" && featuredResult.value) {
    result.featuredStory = featuredResult.value.story
    result.heroArticleId = featuredResult.value.articleId
  }

  // 2. Story Universe context
  if (storyUniverseResult.status === "fulfilled" && storyUniverseResult.value) {
    result.storyUniverseContext = storyUniverseResult.value
  }

  // 3. Scout Live context
  if (scoutLiveResult.status === "fulfilled" && scoutLiveResult.value) {
    result.scoutLiveContext = scoutLiveResult.value
  }

  // 4. User primary team
  if (prefsResult.status === "fulfilled" && prefsResult.value) {
    result.primaryTeam = prefsResult.value
  }

  // 3. Live game contexts (may be multiple games)
  if (liveGamesResult.status === "fulfilled" && liveGamesResult.value) {
    result.gameContexts = liveGamesResult.value
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
    // Absolute cutoff: 48h from published_at — never hero-takeover a stale article
    const publishCutoff = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString()
    // Hero override display cap: 24h from when flagged
    const overrideCutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

    // Get highest-viewed recent published article within 48h window
    const { data: posts } = await supabaseAdmin
      .from("sm_posts")
      .select(
        "id, title, slug, excerpt, featured_image, views, published_at, importance_score, hero_override_at, category:sm_categories!category_id(slug, name)"
      )
      .eq("status", "published")
      .not("featured_image", "is", null)
      .gte("published_at", publishCutoff)
      .order("views", { ascending: false })
      .limit(5)

    if (!posts || posts.length === 0) return null

    // Find the best candidate: views >= threshold, or editor-boosted (importance >= 90)
    // Hero override must also be within 24h of being flagged
    const candidate = posts.find((p) => {
      const views = p.views ?? 0
      const importance = p.importance_score ?? 0
      const isForceHero = importance >= 90
      // If force-hero, check 24h display cap from hero_override_at
      if (isForceHero && p.hero_override_at) {
        if (p.hero_override_at < overrideCutoff) return false
      }
      return views >= TRENDING_VIEW_THRESHOLD || isForceHero
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

async function fetchLiveGames(): Promise<GameContext[] | null> {
  try {
    // live_games_registry is in DataLab — filter to recent, error-free entries
    const { data: registry } = await datalabAdmin
      .from("live_games_registry")
      .select("*")
      .eq("status", "active")
      .eq("error_count", 0)
      .order("created_at", { ascending: false })
      .limit(10)

    if (!registry || registry.length === 0) return null

    const games: GameContext[] = []
    const seenGameIds = new Set<string>()

    // Check each registry entry against its live table
    for (const entry of registry) {
      // Skip duplicate game IDs (same game registered for multiple teams)
      if (seenGameIds.has(entry.game_id)) continue
      seenGameIds.add(entry.game_id)

      const teamSlug = entry.team_id || "bears"
      const liveTable = `${teamSlug}_live`

      const { data: liveGames } = await datalabAdmin
        .from(liveTable)
        .select("*")
        .eq("game_id", entry.game_id)
        .limit(1)

      const game = liveGames?.[0]
      if (!game) continue

      // Determine game status
      const gameStatus = (game.status || "").toLowerCase()

      // Explicitly live/in-progress — always show
      const isLive =
        gameStatus === "in_progress" ||
        gameStatus === "in progress" ||
        gameStatus === "live"

      // Skip ended/canceled games
      if (
        gameStatus === "final" ||
        gameStatus === "post" ||
        gameStatus === "completed" ||
        gameStatus === "postponed" ||
        gameStatus === "canceled"
      ) {
        continue
      }

      // For ALL non-live games, only show if starting within 60 minutes
      if (!isLive) {
        if (!game.game_date) continue // No start time known — skip
        const startTime = new Date(game.game_date).getTime()
        const now = Date.now()
        const msUntilStart = startTime - now
        if (msUntilStart > 60 * 60 * 1000) continue // More than 1 hour away — skip
        if (msUntilStart < -4 * 60 * 60 * 1000) continue // Started 4+ hours ago with no live status — stale
      }

      // Build matchup from live table data
      const homeName = game.home_team_name || "Home"
      const awayName = game.away_team_name || "Away"
      const matchup = `${awayName} at ${homeName}`

      // Determine kickoff label based on game status
      let kickoffLabel: string
      if (isLive) {
        // Use ESPN's status detail for accurate period labels (e.g. "Bottom 2nd", "3:12 - 1st Quarter")
        const statusDetail = game.raw_payload?.status?.type?.detail
        if (statusDetail) {
          kickoffLabel = `LIVE — ${statusDetail}`
        } else {
          const period = game.period_label || `Q${game.period || ""}`
          const clock = game.clock || ""
          kickoffLabel = clock && clock !== "0:00" ? `LIVE — ${period} ${clock}` : `LIVE — ${period}`
        }
      } else if (game.game_date) {
        // Pre-game / upcoming: show start time
        const startTime = new Date(game.game_date)
        kickoffLabel = `Today @ ${startTime.toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          timeZone: "America/Chicago",
        })} CT`
        if (game.venue_name) {
          kickoffLabel += ` — ${game.venue_name}`
        }
      } else {
        kickoffLabel = "Today"
      }

      const href = TEAM_HUB_HREF[teamSlug] || `/chicago-${teamSlug}`

      let storyline: string | undefined
      if (game.broadcast_network) {
        storyline = `Watch on ${game.broadcast_network}`
      }

      // Pick the Chicago team's logo based on which side is the Chicago team
      const chicagoAbbrs: Record<string, string> = {
        bears: "CHI", bulls: "CHI", blackhawks: "CHI", cubs: "CHC", whitesox: "CHW",
      }
      const chicagoAbbr = chicagoAbbrs[teamSlug]
      const isChicagoHome = (game.home_team_abbr || "").toUpperCase() === chicagoAbbr
      const teamLogoUrl = isChicagoHome
        ? (game.home_logo_url || undefined)
        : (game.away_logo_url || undefined)

      games.push({
        matchup,
        kickoffLabel,
        href,
        storyline,
        teamLogoUrl,
        sport: entry.sport || undefined,
        homeScore: game.home_score ?? 0,
        awayScore: game.away_score ?? 0,
        homeAbbr: game.home_team_abbr || undefined,
        awayAbbr: game.away_team_abbr || undefined,
        gameId: entry.game_id,
        teamSlug,
      })
    }

    // Sort: live/in-progress games first, then upcoming
    games.sort((a, b) => {
      const aLive = a.kickoffLabel?.startsWith("LIVE") ? 0 : 1
      const bLive = b.kickoffLabel?.startsWith("LIVE") ? 0 : 1
      return aLive - bLive
    })

    return games.length > 0 ? games : null
  } catch (e) {
    console.error("[hero-data] fetchLiveGames error:", e)
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

/* ── Scout Live Feed ── */

async function fetchScoutLive(): Promise<ScoutLiveContext | null> {
  if (!supabaseAdmin) return null

  try {
    // Get recent published posts from the last 6 hours — signals from editorial activity
    const cutoff = new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()

    const { data: posts } = await supabaseAdmin
      .from("sm_posts")
      .select(
        "id, title, slug, excerpt, published_at, views, category:sm_categories!category_id(slug, name)"
      )
      .eq("status", "published")
      .gte("published_at", cutoff)
      .order("published_at", { ascending: false })
      .limit(12)

    if (!posts || posts.length < 3) return null

    // Convert recent posts into typed signals
    const signals: LiveSignal[] = []

    for (const post of posts) {
      const category = Array.isArray(post.category) ? post.category[0] : post.category
      const catSlug = category?.slug || "news"
      const href = `/${catSlug}/${post.slug}`
      const timestamp = formatPublishedLabel(post.published_at)
      const title = post.title || ""
      const titleLower = title.toLowerCase()

      // Classify signal type from post title/content
      let type: LiveSignalType = "news"
      let label: string | undefined
      let value: string | undefined

      if (titleLower.includes("rumor") || titleLower.includes("linked to") || titleLower.includes("trade") || titleLower.includes("signing") || titleLower.includes("interest in")) {
        type = "rumor"
        label = "Rumor"
      } else if (titleLower.includes("scout") || titleLower.includes("analysis") || titleLower.includes("breakdown") || titleLower.includes("film")) {
        type = "scout"
        label = "Scout"
      } else if (titleLower.includes("update") || titleLower.includes("breaking") || titleLower.includes("report") || titleLower.includes("insider")) {
        type = "update"
        label = "Update"
      } else if (titleLower.includes("stat") || titleLower.includes("rank") || titleLower.includes("rate") || titleLower.includes("average") || titleLower.includes("record")) {
        type = "stat"
        label = "Stat"
      } else if (titleLower.includes("fan") || titleLower.includes("poll") || titleLower.includes("debate") || titleLower.includes("vote")) {
        type = "sentiment"
        label = "Fans"
      }

      // Add view count as value for popular posts
      if (post.views >= 1000) {
        value = `${(post.views / 1000).toFixed(1)}K views`
      }

      // Trim title for signal message (keep it scannable)
      const message = title.length > 80 ? title.slice(0, 77) + "..." : title

      signals.push({
        id: String(post.id),
        type,
        label,
        message,
        timestamp,
        value,
        href,
      })
    }

    if (signals.length < 3) return null

    // Generate headline from the dominant signal type or most recent cluster
    const teamCounts: Record<string, number> = {}
    for (const post of posts) {
      const cat = Array.isArray(post.category) ? post.category[0] : post.category
      const team = categoryToTeamSlug(cat?.slug)
      if (team) teamCounts[team] = (teamCounts[team] || 0) + 1
    }

    // Find the hottest team (most recent activity)
    let dominantTeam = ""
    let maxCount = 0
    for (const [team, count] of Object.entries(teamCounts)) {
      if (count > maxCount) {
        maxCount = count
        dominantTeam = team
      }
    }

    const teamName = dominantTeam ? TEAM_DISPLAY[dominantTeam] : "Chicago sports"

    // Count signal types for headline flavor
    const rumorCount = signals.filter((s) => s.type === "rumor").length
    const updateCount = signals.filter((s) => s.type === "update").length

    let headline: string
    if (rumorCount >= 2) {
      headline = `${teamName} trade signals are heating up`
    } else if (updateCount >= 2) {
      headline = `Multiple ${teamName} updates breaking now`
    } else {
      headline = `Chicago Sports Intelligence`
    }

    const summary = ``

    return { headline, summary, signals: signals.slice(0, 6) }
  } catch (e) {
    console.error("[hero-data] fetchScoutLive error:", e)
    return null
  }
}

/* ── Story Universe ── */

async function fetchStoryUniverse(): Promise<StoryUniverseContext | null> {
  if (!supabaseAdmin) return null

  try {
    // Absolute cutoff: 48h from published_at
    const publishCutoff = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString()
    // Hero override display cap: 24h from when flagged
    const overrideCutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

    // Find the most recent published post with is_story_universe = true within time limits
    const { data: mainPosts } = await supabaseAdmin
      .from("sm_posts")
      .select(
        "id, title, slug, excerpt, featured_image, views, published_at, is_story_universe, story_universe_related_ids, hero_override_at, category:sm_categories!category_id(slug, name)"
      )
      .eq("status", "published")
      .eq("is_story_universe", true)
      .not("featured_image", "is", null)
      .gte("published_at", publishCutoff)
      .order("published_at", { ascending: false })
      .limit(1)

    if (!mainPosts || mainPosts.length === 0) return null

    const main = mainPosts[0]

    // Check 24h display cap from hero_override_at
    if (main.hero_override_at && main.hero_override_at < overrideCutoff) return null
    const relatedIds = main.story_universe_related_ids

    if (!relatedIds || relatedIds.length !== 2) return null

    // Fetch the 2 related stories
    const { data: relatedPosts } = await supabaseAdmin
      .from("sm_posts")
      .select(
        "id, title, slug, excerpt, featured_image, category:sm_categories!category_id(slug)"
      )
      .in("id", relatedIds)
      .eq("status", "published")

    if (!relatedPosts || relatedPosts.length !== 2) return null

    const mainCategory = Array.isArray(main.category) ? main.category[0] : main.category
    const mainCategorySlug = mainCategory?.slug || "news"
    const teamSlug = categoryToTeamSlug(mainCategorySlug)
    const teamName = teamSlug ? TEAM_DISPLAY[teamSlug] : undefined

    const mainStory: FeaturedStory = {
      id: String(main.id),
      title: main.title,
      dek: main.excerpt || undefined,
      imageUrl: main.featured_image!,
      href: `/${mainCategorySlug}/${main.slug}`,
      views: main.views ?? 0,
      team: teamName,
      publishedLabel: formatPublishedLabel(main.published_at),
    }

    // Map related posts preserving the order from relatedIds
    const relatedById = new Map(relatedPosts.map((p) => [String(p.id), p]))
    const relatedStories = relatedIds.map((rid: string) => {
      const p = relatedById.get(rid)!
      const cat = Array.isArray(p.category) ? p.category[0] : p.category
      const catSlug = cat?.slug || "news"
      return {
        id: String(p.id),
        title: p.title,
        dek: p.excerpt || undefined,
        href: `/${catSlug}/${p.slug}`,
        imageUrl: p.featured_image || undefined,
      } satisfies StoryUniverseRelatedStory
    }) as [StoryUniverseRelatedStory, StoryUniverseRelatedStory]

    return { mainStory, relatedStories }
  } catch (e) {
    console.error("[hero-data] fetchStoryUniverse error:", e)
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
