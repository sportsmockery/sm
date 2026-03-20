"use client"

import React, { useMemo, useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  ArrowRight,
  Bot,
  BrainCircuit,
  ChevronRight,
  Flame,
  Search,
  Sparkles,
  Star,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

const filters = ["For You", "Bears", "Bulls", "Cubs", "Blackhawks", "White Sox"] as const
type FilterKey = (typeof filters)[number]
type Tone = "neutral" | "cyan" | "red" | "gold"

interface FeedArticle {
  id: number
  title: string
  slug: string
  excerpt: string | null
  featured_image: string | null
  published_at: string | null
  views: number | null
  importance_score: number | null
  category: { slug: string; name: string } | { slug: string; name: string }[] | null
  author: { display_name: string } | { display_name: string }[] | null
}

interface LiveGame {
  game_id: string
  home_team: string
  away_team: string
  home_score: number
  away_score: number
  status: string
  period: string | null
  clock: string | null
  sport: string
  game_time_display?: string
}

interface PollData {
  id: number
  question: string
  status: string
  team_theme: string | null
  options: { id: number; option_text: string; vote_count: number }[]
}

/* ------------------------------------------------------------------ */
/*  Layout constants — single source of truth                          */
/* ------------------------------------------------------------------ */

const SHELL = "mx-auto w-full max-w-[1440px] px-4 md:px-8"
const HERO_GRID = "grid gap-10 xl:grid-cols-[minmax(0,1.06fr)_360px] xl:items-start"
const FEED_GRID = "grid gap-8 xl:grid-cols-[minmax(0,720px)_360px] xl:items-start xl:justify-between"
const CARD_STACK = "space-y-6"

/* ------------------------------------------------------------------ */
/*  Fallback seed data — keeps layout stable before hydration          */
/* ------------------------------------------------------------------ */

const FALLBACK_ARTICLES: FeedArticle[] = [
  {
    id: -1,
    title: "Loading latest Chicago sports intelligence...",
    slug: "",
    excerpt: "Your personalized feed is loading. The latest articles, analysis, and rumor updates will appear here momentarily.",
    featured_image: null,
    published_at: new Date().toISOString(),
    views: null,
    importance_score: 50,
    category: { slug: "chicago-sports", name: "Chicago Sports" },
    author: { display_name: "Sports Mockery" },
  },
  {
    id: -2,
    title: "Scout AI is ready for your questions",
    slug: "",
    excerpt: "Ask Scout about any Chicago team — Bears, Bulls, Cubs, Blackhawks, or White Sox. Get instant analysis powered by live data.",
    featured_image: null,
    published_at: new Date().toISOString(),
    views: null,
    importance_score: 50,
    category: { slug: "chicago-sports", name: "Scout AI" },
    author: { display_name: "Scout" },
  },
]

const FALLBACK_WATCHLIST = [
  { label: "Bears", title: "Loading trending stories...", meta: "Just now", href: "#" },
  { label: "Cubs", title: "Loading trending stories...", meta: "Just now", href: "#" },
  { label: "Bulls", title: "Loading trending stories...", meta: "Just now", href: "#" },
]

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function getCategorySlug(article: FeedArticle): string {
  const cat = Array.isArray(article.category) ? article.category[0] : article.category
  return cat?.slug?.toLowerCase() || ""
}

function getCategoryName(article: FeedArticle): string {
  const cat = Array.isArray(article.category) ? article.category[0] : article.category
  return cat?.name || "Chicago Sports"
}

function getAuthorName(article: FeedArticle): string {
  const auth = Array.isArray(article.author) ? article.author[0] : article.author
  return auth?.display_name || "Sports Mockery"
}

function getTeamFromSlug(slug: string): string {
  if (slug.includes("bears")) return "Bears"
  if (slug.includes("bulls")) return "Bulls"
  if (slug.includes("blackhawks")) return "Blackhawks"
  if (slug.includes("cubs")) return "Cubs"
  if (slug.includes("whitesox") || slug.includes("white-sox")) return "White Sox"
  return "Chicago"
}

function matchesFilter(article: FeedArticle, filter: FilterKey): boolean {
  if (filter === "For You") return true
  const slug = getCategorySlug(article)
  const teamMap: Record<string, string[]> = {
    Bears: ["bears"],
    Bulls: ["bulls"],
    Cubs: ["cubs"],
    Blackhawks: ["blackhawks"],
    "White Sox": ["whitesox", "white-sox"],
  }
  return (teamMap[filter] || []).some((t) => slug.includes(t))
}

function formatRelativeTime(publishedAt: string | null): string {
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

function formatViews(views: number | null): string {
  if (!views) return "0"
  if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`
  if (views >= 1000) return `${(views / 1000).toFixed(1)}K`
  return String(views)
}

function articleHref(article: FeedArticle): string {
  const catSlug = getCategorySlug(article)
  if (catSlug && article.slug) return `/${catSlug}/${article.slug}`
  return "#"
}

/* ------------------------------------------------------------------ */
/*  Tone styles                                                        */
/* ------------------------------------------------------------------ */

const toneStyles: Record<
  Tone,
  {
    border: string
    pill: string
    tint: string
    dot: string
    accent: string
    glow: string
  }
> = {
  neutral: {
    border: "border-white/10",
    pill: "border-white/10 bg-white/[0.04] text-white/75",
    tint: "bg-white/[0.04]",
    dot: "bg-white/70",
    accent: "text-white",
    glow: "rgba(255,255,255,0.08)",
  },
  cyan: {
    border: "border-[#00D4FF]/20",
    pill: "border-[#00D4FF]/20 bg-[#00D4FF]/10 text-[#00D4FF]",
    tint: "bg-[#00D4FF]/10",
    dot: "bg-[#00D4FF]",
    accent: "text-[#00D4FF]",
    glow: "rgba(0,212,255,0.16)",
  },
  red: {
    border: "border-[#BC0000]/20",
    pill: "border-[#BC0000]/20 bg-[#BC0000]/10 text-white",
    tint: "bg-[#BC0000]/10",
    dot: "bg-[#BC0000]",
    accent: "text-[#BC0000]",
    glow: "rgba(188,0,0,0.16)",
  },
  gold: {
    border: "border-[#D6B05E]/20",
    pill: "border-[#D6B05E]/20 bg-[#D6B05E]/10 text-[#D6B05E]",
    tint: "bg-[#D6B05E]/10",
    dot: "bg-[#D6B05E]",
    accent: "text-[#D6B05E]",
    glow: "rgba(214,176,94,0.18)",
  },
}

/* ------------------------------------------------------------------ */
/*  Main page — NO local header/sidebar/shell (layout.tsx owns those)  */
/* ------------------------------------------------------------------ */

export default function NewHomePage() {
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [activeFilter, setActiveFilter] = useState<FilterKey>("For You")

  // Real data state — initialised with fallbacks so layout never collapses
  const [articles, setArticles] = useState<FeedArticle[]>(FALLBACK_ARTICLES)
  const [trending, setTrending] = useState<FeedArticle[]>([])
  const [liveGames, setLiveGames] = useState<LiveGame[]>([])
  const [polls, setPolls] = useState<PollData[]>([])
  const [isSeeded, setIsSeeded] = useState(true)

  // Fetch real data from APIs
  useEffect(() => {
    async function fetchData() {
      try {
        const [feedRes, liveRes, pollsRes] = await Promise.all([
          fetch("/api/feed").then((r) => r.json()),
          fetch("/api/live-games").then((r) => r.json()).catch(() => ({ games: [] })),
          fetch("/api/polls?status=active&limit=5").then((r) => r.json()).catch(() => ({ polls: [] })),
        ])

        const all: FeedArticle[] = []
        if (feedRes.featured) all.push(feedRes.featured)
        if (feedRes.topHeadlines) all.push(...feedRes.topHeadlines)
        if (feedRes.latestNews) all.push(...feedRes.latestNews)

        if (all.length > 0) {
          setArticles(all)
          setIsSeeded(false)
        }
        setTrending(feedRes.trending || [])
        setLiveGames(liveRes.games || [])
        setPolls(pollsRes.polls || pollsRes.data || [])
      } catch (err) {
        console.error("NewHome data fetch error:", err)
      }
    }
    fetchData()
  }, [])

  // Derived data
  const filteredArticles = useMemo(() => {
    return articles.filter((a) => matchesFilter(a, activeFilter))
  }, [articles, activeFilter])

  const featuredArticle = articles[0] || null
  const topArticles = articles.slice(1, 4)
  const totalArticles = articles.length
  const liveCount = liveGames.length
  const trendingCount = trending.length

  const promptChips = useMemo(() => {
    const chips: string[] = []
    if (articles.find((a) => getCategorySlug(a).includes("bears")))
      chips.push("What's the latest on the Bears?")
    if (articles.find((a) => getCategorySlug(a).includes("cubs")))
      chips.push("Give me the Cubs update today")
    if (articles.find((a) => getCategorySlug(a).includes("bulls")))
      chips.push("What are fans saying about the Bulls?")
    if (chips.length === 0) chips.push("What's happening in Chicago sports today?")
    return chips.slice(0, 3)
  }, [articles])

  const teamChips = useMemo(() => {
    const teams = [
      { label: "Chicago Bears", slug: "bears" },
      { label: "Chicago Bulls", slug: "bulls" },
      { label: "Chicago Cubs", slug: "cubs" },
      { label: "Chicago Blackhawks", slug: "blackhawks" },
      { label: "Chicago White Sox", slug: "whitesox" },
    ]
    return teams.map((t) => ({
      ...t,
      count: articles.filter((a) => getCategorySlug(a).includes(t.slug)).length,
    }))
  }, [articles])

  const platformMessages = useMemo(() => {
    return topArticles.map((a) => {
      const team = getTeamFromSlug(getCategorySlug(a))
      return `${team}: ${a.title}`
    })
  }, [topArticles])

  const watchlist = useMemo(() => {
    if (trending.length === 0) return FALLBACK_WATCHLIST
    return trending.slice(0, 3).map((a) => ({
      label: getTeamFromSlug(getCategorySlug(a)),
      title: a.title,
      meta: formatRelativeTime(a.published_at),
      href: articleHref(a),
    }))
  }, [trending])

  const scoutPrompts = useMemo(() => {
    const prompts: string[] = []
    for (const team of ["bears", "bulls", "cubs", "blackhawks", "whitesox"]) {
      const teamArticle = articles.find((a) => getCategorySlug(a).includes(team))
      if (teamArticle && prompts.length < 3) {
        prompts.push(`Tell me more about: ${teamArticle.title.slice(0, 60)}`)
      }
    }
    return prompts.length > 0 ? prompts : ["What's happening in Chicago sports today?"]
  }, [articles])

  const handleScoutSubmit = () => {
    if (query.trim()) {
      router.push(`/ask-ai?q=${encodeURIComponent(query.trim())}`)
    }
  }

  /* ── Render — always the full page shell, never a bare loader ── */
  return (
    <div className="min-h-screen bg-[#0B0F14] text-[#FAFAFB]">
      {/* Background radials */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background: `
            radial-gradient(circle at 14% 12%, rgba(0,212,255,0.16), transparent 24%),
            radial-gradient(circle at 84% 10%, rgba(214,176,94,0.18), transparent 18%),
            radial-gradient(circle at 76% 22%, rgba(188,0,0,0.14), transparent 18%),
            linear-gradient(180deg, rgba(11,15,20,0.72) 0%, rgba(11,15,20,0.12) 24%, rgba(11,15,20,1) 100%)
          `,
        }}
      />

      <main className="relative z-10">
        {/* ── HERO SECTION ── */}
        <section className="min-h-screen px-4 pb-16 pt-[112px] md:px-8">
          <div className={`${SHELL} ${HERO_GRID}`}>
            {/* Left column */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: "easeOut" }}
              className="space-y-8"
            >
              <TonePill tone="cyan">Live Chicago Sports OS</TonePill>

              <div className="max-w-[860px] space-y-6">
                <h1 className="text-[clamp(48px,5vw,72px)] font-bold leading-[0.94] tracking-[-0.06em]">
                  The front page of
                  <span className="block text-[#00D4FF]">Chicago sports intelligence.</span>
                </h1>
                {featuredArticle && (
                  <p className="max-w-[720px] text-[18px] leading-[1.6] text-white/75">
                    {featuredArticle.excerpt
                      ? featuredArticle.excerpt.slice(0, 200)
                      : featuredArticle.title}
                  </p>
                )}
              </div>

              {/* Scout AI Command */}
              <Panel tone="cyan" className="p-5 md:p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <TonePill tone="cyan">Scout AI Command</TonePill>
                  <div className="flex items-center gap-2 rounded-full border border-[#00D4FF]/20 bg-[#00D4FF]/10 px-3 py-1 text-[13px] uppercase tracking-[0.16em] text-[#00D4FF]">
                    <Bot className="h-3.5 w-3.5" />
                    Live Model
                  </div>
                </div>

                <div className="mt-5 flex flex-col gap-3 lg:flex-row">
                  <label className="flex h-14 flex-1 items-center gap-3 rounded-[14px] border border-white/10 bg-black/25 px-4">
                    <Search className="h-5 w-5 text-[#00D4FF]" />
                    <input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleScoutSubmit()}
                      className="w-full bg-transparent text-[18px] text-white outline-none placeholder:text-white/35"
                      placeholder="Ask Scout about Chicago right now..."
                    />
                  </label>
                  <button
                    type="button"
                    onClick={handleScoutSubmit}
                    className="inline-flex h-14 items-center justify-center gap-2 rounded-[14px] px-6 text-sm font-medium transition duration-200 ease-out hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00D4FF]"
                    style={{ backgroundColor: "#00D4FF", color: "#0B0F14" }}
                  >
                    Run Scout
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {promptChips.map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      onClick={() => setQuery(prompt)}
                      className="h-10 rounded-full border border-white/10 bg-white/[0.04] px-4 text-sm text-white/75 transition duration-200 ease-out hover:border-[#00D4FF]/20 hover:bg-[#00D4FF]/10 hover:text-[#00D4FF]"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </Panel>

              {/* Context block — real articles */}
              <Panel tone="neutral" className="p-5 md:p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <TonePill tone="neutral">Tonight on EDGE</TonePill>
                    <h2 className="mt-4 text-[22px] font-medium tracking-[-0.04em]">
                      What&apos;s moving right now
                    </h2>
                  </div>
                  <div className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-white/70">
                    {totalArticles} stories live
                  </div>
                </div>

                <div className="mt-5 space-y-3">
                  {platformMessages.length > 0 ? (
                    platformMessages.map((msg) => (
                      <div
                        key={msg}
                        className="flex items-start gap-3 rounded-[12px] border border-white/10 bg-white/[0.03] p-4"
                      >
                        <div className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-[#00D4FF]" />
                        <p className="text-[18px] leading-[1.55] text-white/78">{msg}</p>
                      </div>
                    ))
                  ) : (
                    <div className="flex items-start gap-3 rounded-[12px] border border-white/10 bg-white/[0.03] p-4">
                      <div className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-white/30 animate-pulse" />
                      <p className="text-[18px] leading-[1.55] text-white/40">Loading latest updates...</p>
                    </div>
                  )}
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  {teamChips.map((team) => (
                    <button
                      key={team.label}
                      type="button"
                      className={`h-10 rounded-full border px-4 text-sm transition duration-200 ease-out ${
                        team.count > 0
                          ? "border-[#00D4FF]/20 bg-[#00D4FF]/10 text-[#00D4FF]"
                          : "border-white/10 bg-white/[0.04] text-white/72 hover:border-white/20 hover:bg-white/[0.06]"
                      }`}
                    >
                      {team.label} ({team.count})
                    </button>
                  ))}
                </div>
              </Panel>

              {/* Hero signal cards */}
              <div className="grid gap-5 md:grid-cols-3">
                <HeroSignal
                  label="Live stories"
                  value={String(totalArticles)}
                  note="Articles, analysis, and updates across all Chicago teams."
                  tone="cyan"
                  Icon={BrainCircuit}
                />
                <HeroSignal
                  label="Live games"
                  value={String(liveCount)}
                  note={liveCount > 0 ? "Games in progress right now." : "No live games right now."}
                  tone="red"
                  Icon={Flame}
                />
                <HeroSignal
                  label="Trending"
                  value={String(trendingCount)}
                  note="Most-read stories in the last 24 hours."
                  tone="gold"
                  Icon={Star}
                />
              </div>
            </motion.div>

            {/* ── Right sidebar ── */}
            <motion.aside
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.08, ease: "easeOut" }}
              className="space-y-5"
            >
              {/* Live games card */}
              {liveGames.length > 0 && (
                <Panel tone="red" className="p-5">
                  <TonePill tone="red">Live Now</TonePill>
                  <div className="mt-4 space-y-3">
                    {liveGames.slice(0, 3).map((game) => (
                      <div
                        key={game.game_id}
                        className="rounded-[12px] border border-[#BC0000]/20 bg-[#BC0000]/10 p-4"
                      >
                        <div className="flex items-start justify-between">
                          <span className="text-sm font-medium text-white/80">{game.away_team}</span>
                          <span className="text-lg font-bold">{game.away_score}</span>
                        </div>
                        <div className="flex items-start justify-between">
                          <span className="text-sm font-medium text-white/80">{game.home_team}</span>
                          <span className="text-lg font-bold">{game.home_score}</span>
                        </div>
                        <p className="mt-2 text-[13px] text-white/50">
                          {game.period} {game.clock && `\u00B7 ${game.clock}`}
                        </p>
                      </div>
                    ))}
                  </div>
                </Panel>
              )}

              {/* Trending / top articles sidebar */}
              <Panel tone="cyan" className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <TonePill tone="cyan">Top Stories</TonePill>
                    <h2 className="mt-4 text-[24px] font-medium leading-[1.05] tracking-[-0.04em]">
                      Most read right now
                    </h2>
                  </div>
                  <div className="rounded-full border border-[#00D4FF]/20 bg-[#00D4FF]/10 px-4 py-2 text-sm text-[#00D4FF]">
                    Live
                  </div>
                </div>

                <div className="mt-5 space-y-3">
                  {trending.slice(0, 5).map((article, i) => (
                    <Link
                      key={article.id}
                      href={articleHref(article)}
                      className="flex items-start gap-3 rounded-[12px] border border-white/10 bg-white/[0.03] p-4 transition duration-200 hover:-translate-y-0.5 hover:border-[#00D4FF]/20"
                    >
                      <span className="mt-0.5 text-sm font-bold text-[#00D4FF]">{i + 1}</span>
                      <div className="min-w-0 flex-1">
                        <p className="text-[16px] font-medium leading-[1.35] text-white/88">
                          {article.title}
                        </p>
                        <p className="mt-1 text-[13px] text-white/50">
                          {getTeamFromSlug(getCategorySlug(article))} \u00B7 {formatViews(article.views)} views
                        </p>
                      </div>
                      {article.featured_image && (
                        <Image
                          src={article.featured_image}
                          alt=""
                          width={56}
                          height={56}
                          className="h-14 w-14 shrink-0 rounded-[8px] object-cover"
                        />
                      )}
                    </Link>
                  ))}
                  {trending.length === 0 && (
                    <div className="min-h-[120px] rounded-[12px] border border-white/10 bg-white/[0.03] p-4">
                      <p className="text-sm text-white/40 animate-pulse">Loading trending stories...</p>
                    </div>
                  )}
                </div>
              </Panel>

              {/* Active poll */}
              {polls.length > 0 && (
                <Panel tone="neutral" className="p-5">
                  <TonePill tone="neutral">Live Poll</TonePill>
                  <h3 className="mt-4 text-[20px] font-medium leading-[1.2] tracking-[-0.03em]">
                    {polls[0].question}
                  </h3>
                  <div className="mt-4 space-y-2">
                    {polls[0].options?.map((opt) => {
                      const totalVotes = polls[0].options.reduce((s, o) => s + (o.vote_count || 0), 0)
                      const pct = totalVotes > 0 ? Math.round((opt.vote_count / totalVotes) * 100) : 0
                      return (
                        <div key={opt.id} className="rounded-[10px] border border-white/10 bg-white/[0.03] p-3">
                          <div className="flex items-start justify-between text-sm">
                            <span className="text-white/80">{opt.option_text}</span>
                            <span className="font-medium text-[#00D4FF]">{pct}%</span>
                          </div>
                          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
                            <div
                              className="h-full rounded-full bg-[#00D4FF]"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  <p className="mt-3 text-[13px] text-white/45">
                    {polls[0].options?.reduce((s, o) => s + (o.vote_count || 0), 0).toLocaleString()} votes
                  </p>
                </Panel>
              )}

              {/* Scout prompts sidebar */}
              <Panel tone="cyan" className="p-5">
                <TonePill tone="cyan">Scout Stack</TonePill>
                <h3 className="mt-4 text-[22px] font-medium tracking-[-0.04em]">
                  Quick questions
                </h3>
                <div className="mt-4 space-y-3">
                  {scoutPrompts.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => {
                        setQuery(item)
                        router.push(`/ask-ai?q=${encodeURIComponent(item)}`)
                      }}
                      className="flex w-full items-start justify-between gap-3 rounded-[12px] border border-[#00D4FF]/20 bg-[#00D4FF]/10 p-4 text-left transition duration-200 ease-out hover:-translate-y-0.5"
                    >
                      <span className="text-[16px] leading-[1.45] text-white/88">{item}</span>
                      <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-[#00D4FF]" />
                    </button>
                  ))}
                </div>
              </Panel>
            </motion.aside>
          </div>
        </section>

        {/* ── FILTER BAR ── */}
        <section className="sticky top-0 z-40 border-y border-white/10 bg-[#0F141B]/84 backdrop-blur-xl">
          <div className={`${SHELL} flex flex-col gap-4 py-4 xl:flex-row xl:items-center xl:justify-between`}>
            <div className="flex items-center gap-3 overflow-x-auto">
              <p className="shrink-0 text-sm text-white/50">Discover</p>
              {filters.map((filter) => (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setActiveFilter(filter)}
                  className={`h-10 shrink-0 rounded-full px-4 text-sm transition duration-200 ease-out ${
                    activeFilter === filter
                      ? "text-[#0B0F14]"
                      : "border border-white/10 bg-white/[0.04] text-white/72 hover:border-[#00D4FF]/20 hover:bg-[#00D4FF]/10 hover:text-[#00D4FF]"
                  }`}
                  style={activeFilter === filter ? { backgroundColor: "#00D4FF", color: "#0B0F14" } : undefined}
                >
                  {filter}
                </button>
              ))}
            </div>
            <p className="text-sm text-white/60">
              {filteredArticles.length} stories
            </p>
          </div>
        </section>

        {/* ── FEED SECTION ── */}
        <section className="px-4 py-10 md:px-8">
          <div className={`${SHELL} ${FEED_GRID}`}>
            {/* Main feed */}
            <div className={CARD_STACK}>
              {filteredArticles.length === 0 && (
                <FeedCardShell>
                  <p className="text-center text-white/50">No stories found for this filter.</p>
                </FeedCardShell>
              )}

              {filteredArticles.slice(0, 20).map((article, index) => (
                <motion.article
                  key={article.id}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.38, delay: index * 0.03, ease: "easeOut" }}
                >
                  <ArticleFeedCard article={article} isSeeded={isSeeded} />
                </motion.article>
              ))}

              {filteredArticles.length > 20 && (
                <FeedCardShell>
                  <TonePill tone="neutral">More Stories</TonePill>
                  <p className="mt-4 text-[18px] leading-[1.55] text-white/72">
                    {filteredArticles.length - 20} more stories available.
                  </p>
                  <div className="mt-auto pt-5">
                    <Link
                      href="/"
                      className="inline-flex h-11 items-center gap-2 rounded-[14px] border border-white/10 bg-white/[0.04] px-5 text-sm text-white transition duration-200 ease-out hover:border-[#00D4FF]/20 hover:bg-[#00D4FF]/10 hover:text-[#00D4FF]"
                    >
                      View full feed
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </div>
                </FeedCardShell>
              )}
            </div>

            {/* Sticky watchlist sidebar */}
            <aside className="space-y-6 xl:sticky xl:top-[96px] xl:h-fit">
              <Panel tone="neutral" className="p-5">
                <TonePill tone="neutral">Watchlist</TonePill>
                <div className="mt-4 space-y-4">
                  {watchlist.map((item) => (
                    <Link
                      key={item.title}
                      href={item.href}
                      className="block rounded-[12px] border border-white/10 bg-white/[0.03] p-4 transition duration-200 hover:-translate-y-0.5 hover:border-white/20"
                    >
                      <p className="text-[13px] uppercase tracking-[0.16em] text-white/45">{item.label}</p>
                      <p className="mt-2 text-[18px] leading-[1.45] text-white/82">{item.title}</p>
                      <p className="mt-3 text-[13px] text-white/50">{item.meta}</p>
                    </Link>
                  ))}
                </div>
              </Panel>

              {/* Additional polls in sidebar */}
              {polls.length > 1 && (
                <Panel tone="gold" className="p-5">
                  <TonePill tone="gold">Fan Pulse</TonePill>
                  <h3 className="mt-4 text-[20px] font-medium tracking-[-0.04em]">
                    {polls[1].question}
                  </h3>
                  <div className="mt-4 space-y-2">
                    {polls[1].options?.slice(0, 4).map((opt) => {
                      const totalVotes = polls[1].options.reduce((s, o) => s + (o.vote_count || 0), 0)
                      const pct = totalVotes > 0 ? Math.round((opt.vote_count / totalVotes) * 100) : 0
                      return (
                        <div key={opt.id} className="flex items-start justify-between rounded-[10px] border border-[#D6B05E]/20 bg-[#D6B05E]/10 p-3 text-sm">
                          <span className="text-white/80">{opt.option_text}</span>
                          <span className="font-medium text-[#D6B05E]">{pct}%</span>
                        </div>
                      )
                    })}
                  </div>
                  <p className="mt-3 text-[13px] text-white/45">
                    {polls[1].options?.reduce((s, o) => s + (o.vote_count || 0), 0).toLocaleString()} votes
                  </p>
                </Panel>
              )}
            </aside>
          </div>
        </section>
      </main>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Shared UI primitives                                               */
/* ------------------------------------------------------------------ */

function Panel({
  children,
  tone = "neutral",
  className = "",
}: {
  children: React.ReactNode
  tone?: Tone
  className?: string
}) {
  const style = toneStyles[tone]
  return (
    <section
      className={`relative overflow-hidden rounded-[14px] border bg-[#0F141B]/88 backdrop-blur-md ${style.border} ${className}`}
      style={{ boxShadow: "0 18px 40px rgba(0,0,0,0.32)" }}
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: `radial-gradient(circle at top right, ${style.glow}, transparent 62%)` }}
      />
      <div className="relative">{children}</div>
    </section>
  )
}

function FeedCardShell({
  children,
  className = "",
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <article
      className={`relative min-h-[220px] overflow-hidden rounded-[14px] border border-white/10 bg-[#0F141B]/88 p-5 shadow-[0_18px_40px_rgba(0,0,0,0.32)] backdrop-blur-md ${className}`}
    >
      <div className="relative flex h-full flex-col">{children}</div>
    </article>
  )
}

function TonePill({ tone, children }: { tone: Tone; children: React.ReactNode }) {
  const style = toneStyles[tone]
  return (
    <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[13px] uppercase tracking-[0.16em] ${style.pill}`}>
      <span className={`h-2 w-2 rounded-full ${style.dot}`} />
      {children}
    </div>
  )
}

function HeroSignal({
  label,
  value,
  note,
  tone,
  Icon,
}: {
  label: string
  value: string
  note: string
  tone: Tone
  Icon: React.ComponentType<{ className?: string }>
}) {
  return (
    <Panel tone={tone} className="p-5">
      <div className="flex items-start justify-between gap-4">
        <p className="text-sm text-white/55">{label}</p>
        <Icon className={toneStyles[tone].accent + " h-4 w-4"} />
      </div>
      <p className="mt-3 text-[40px] font-bold leading-none tracking-[-0.05em]">{value}</p>
      <p className="mt-3 text-[18px] leading-[1.5] text-white/72">{note}</p>
    </Panel>
  )
}

/* ------------------------------------------------------------------ */
/*  Article Feed Card                                                  */
/* ------------------------------------------------------------------ */

function ArticleFeedCard({ article, isSeeded }: { article: FeedArticle; isSeeded?: boolean }) {
  const catSlug = getCategorySlug(article)
  const team = getTeamFromSlug(catSlug)
  const author = getAuthorName(article)
  const categoryName = getCategoryName(article)
  const href = articleHref(article)
  const timeAgo = formatRelativeTime(article.published_at)
  const views = formatViews(article.views)

  let tone: Tone = "neutral"
  if (catSlug.includes("bears")) tone = "red"
  else if (catSlug.includes("cubs") || catSlug.includes("bulls")) tone = "cyan"

  if (article.importance_score && article.importance_score >= 80) tone = "gold"

  const Wrapper = isSeeded ? "div" : Link
  const wrapperProps = isSeeded ? {} : { href }

  return (
    <Wrapper {...(wrapperProps as any)} className="block">
      <FeedCardShell className={toneStyles[tone].border}>
        {/* Tone glow */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: `radial-gradient(circle at top right, ${toneStyles[tone].glow}, transparent 62%)` }}
        />

        <div className="relative flex h-full flex-col">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <div className="mb-4 flex items-center gap-3">
                <TonePill tone={tone}>{categoryName}</TonePill>
                {article.importance_score && article.importance_score >= 70 && (
                  <span className="text-[13px] text-[#D6B05E]">
                    <Sparkles className="inline h-3.5 w-3.5" /> Featured
                  </span>
                )}
              </div>
              <h3 className="text-[24px] font-medium leading-[1.08] tracking-[-0.04em] text-[#FAFAFB]">
                {article.title}
              </h3>
            </div>
            {article.featured_image && (
              <Image
                src={article.featured_image}
                alt=""
                width={120}
                height={80}
                className="h-20 w-[120px] shrink-0 rounded-[10px] object-cover"
              />
            )}
          </div>

          {article.excerpt && (
            <p className="mt-4 text-[18px] leading-[1.6] text-white/75">
              {article.excerpt.length > 200
                ? article.excerpt.slice(0, 200) + "..."
                : article.excerpt}
            </p>
          )}

          <div className="mt-auto pt-5">
            <p className="text-[13px] text-white/50">
              {author} \u00B7 {team} \u00B7 {timeAgo}
              {article.views && article.views > 0 ? ` \u00B7 ${views} views` : ""}
            </p>
          </div>
        </div>
      </FeedCardShell>
    </Wrapper>
  )
}
