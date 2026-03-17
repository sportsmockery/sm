import { NextResponse } from "next/server"
import { datalabAdmin } from "@/lib/supabase-datalab"

const TEAM_HUB_HREF: Record<string, string> = {
  bears: "/chicago-bears",
  bulls: "/chicago-bulls",
  blackhawks: "/chicago-blackhawks",
  cubs: "/chicago-cubs",
  whitesox: "/chicago-whitesox",
}

const TEAM_DISPLAY: Record<string, string> = {
  bears: "Chicago Bears",
  bulls: "Chicago Bulls",
  blackhawks: "Chicago Blackhawks",
  cubs: "Chicago Cubs",
  whitesox: "Chicago White Sox",
}

const CHICAGO_ABBRS: Record<string, string> = {
  bears: "CHI",
  bulls: "CHI",
  blackhawks: "CHI",
  cubs: "CHC",
  whitesox: "CHW",
}

const CHICAGO_NICKNAMES: Record<string, string> = {
  bears: "Bears",
  bulls: "Bulls",
  blackhawks: "Blackhawks",
  cubs: "Cubs",
  whitesox: "White Sox",
}

function getTeamNickname(fullName: string | null | undefined, teamSlug: string | null): string {
  if (teamSlug && CHICAGO_NICKNAMES[teamSlug]) {
    return CHICAGO_NICKNAMES[teamSlug]
  }
  if (!fullName) return "Team"

  const parts = fullName.trim().split(/\s+/)
  if (parts.length === 1) return parts[0]

  // Keep last two words when the last word is short (e.g. "Sox", "FC") to avoid over-truncating
  const last = parts[parts.length - 1]
  const secondLast = parts[parts.length - 2]
  if (last.length <= 3) {
    return `${secondLast} ${last}`
  }

  // Default: use final word as nickname ("Angels", "Packers", etc.)
  return last
}

export async function GET() {
  try {
    const { data: registry } = await datalabAdmin
      .from("live_games_registry")
      .select("*")
      .eq("status", "active")
      .eq("error_count", 0)
      .order("created_at", { ascending: false })
      .limit(10)

    if (!registry || registry.length === 0) {
      return NextResponse.json({ games: [] }, {
        headers: { "Cache-Control": "public, s-maxage=10, stale-while-revalidate=5" },
      })
    }

    const games: any[] = []
    const seenGameIds = new Set<string>()

    for (const entry of registry) {
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

      const gameStatus = (game.status || "").toLowerCase()
      if (["final", "post", "completed", "postponed", "canceled"].includes(gameStatus)) continue

      // Upcoming games: only show if starting within 1 hour
      if (["upcoming", "pre", "scheduled"].includes(gameStatus) && game.game_date) {
        const msUntilStart = new Date(game.game_date).getTime() - Date.now()
        if (msUntilStart > 60 * 60 * 1000) continue
      }

      const homeName = game.home_team_name || "Home"
      const awayName = game.away_team_name || "Away"
      const chicagoAbbr = CHICAGO_ABBRS[teamSlug]
      const isChicagoHome = (game.home_team_abbr || "").toUpperCase() === chicagoAbbr

      const homeNickname = getTeamNickname(homeName, isChicagoHome ? teamSlug : null)
      const awayNickname = getTeamNickname(awayName, !isChicagoHome ? teamSlug : null)

      // For homepage Game Day hero, always show nicknames only (no city):
      // e.g. "Athletics vs. White Sox" when Chicago is home.
      const matchup = isChicagoHome
        ? `${awayNickname} vs. ${homeNickname}`
        : `${homeNickname} at ${awayNickname}`

      let kickoffLabel: string
      if (gameStatus === "in_progress" || gameStatus === "in progress" || gameStatus === "live") {
        const statusDetail = game.raw_payload?.status?.type?.detail
        if (statusDetail) {
          kickoffLabel = `LIVE — ${statusDetail}`
        } else {
          const period = game.period_label || `Q${game.period || ""}`
          const clock = game.clock || ""
          kickoffLabel = clock && clock !== "0:00" ? `LIVE — ${period} ${clock}` : `LIVE — ${period}`
        }
      } else if (game.game_time_central || game.game_date) {
        // Prefer DataLab's Central Time string (game_time_central) to avoid timezone drift.
        const central = (game.game_time_central as string | null) || null
        if (central) {
          // Format: "MM/DD/YYYY, 6:30 PM CT" → we want "6:30 PM CT"
          const commaIdx = central.indexOf(", ")
          const timePart = commaIdx >= 0 ? central.slice(commaIdx + 2) : central
          kickoffLabel = `Today @ ${timePart}`
        } else {
          // Fallback to local Central formatting from game_date if central string missing
          const startTime = new Date(game.game_date)
          kickoffLabel = `Today @ ${startTime.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            timeZone: "America/Chicago",
          })} CT`
        }
        if (game.venue_name) kickoffLabel += ` — ${game.venue_name}`
      } else {
        kickoffLabel = "Today"
      }

      const href = TEAM_HUB_HREF[teamSlug] || `/chicago-${teamSlug}`
      const teamLogoUrl = isChicagoHome ? game.home_logo_url : game.away_logo_url

      games.push({
        matchup,
        kickoffLabel,
        href,
        storyline: game.broadcast_network ? `Watch on ${game.broadcast_network}` : undefined,
        teamLogoUrl: teamLogoUrl || undefined,
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
    games.sort((a: any, b: any) => {
      const aLive = a.kickoffLabel?.startsWith("LIVE") ? 0 : 1
      const bLive = b.kickoffLabel?.startsWith("LIVE") ? 0 : 1
      return aLive - bLive
    })

    return NextResponse.json({ games }, {
      headers: { "Cache-Control": "public, s-maxage=10, stale-while-revalidate=5" },
    })
  } catch (e) {
    console.error("[hero-games] error:", e)
    return NextResponse.json({ games: [] }, { status: 500 })
  }
}
