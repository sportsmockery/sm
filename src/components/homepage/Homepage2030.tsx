'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'

/**
 * 2030 Chicago Sports Blog Homepage
 *
 * This component implements the exact structure specified for the homepage
 * below the header. It contains 6 sections in strict order:
 *
 * 1. Hero Region - Visual mood setter
 * 2. Top Headlines - ESPN-style text box with mixed logic
 * 3. Featured Shell - Curated front page (not recency-driven)
 * 4. Latest Stream - Reverse chronological posts
 * 5. Seasonal Focus - Currently active teams
 * 6. Evergreen Safety Net - Classic pieces that never expire
 */

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface Article {
  id: string
  slug: string
  title: string
  excerpt?: string
  featured_image?: string
  published_at: string
  team: TeamName
  category_slug: string
  author?: {
    name: string
    slug: string
    avatar_url?: string
  }
  // CMS flags
  editor_pick?: boolean
  pinned_slot?: number // 1-6 for featured shell
  is_evergreen?: boolean
  // Engagement metrics
  engagement_score?: number
  time_on_page_avg?: number
  shares_30d?: number
  lifetime_engagement?: number
}

type TeamName = 'BEARS' | 'BULLS' | 'BLACKHAWKS' | 'CUBS' | 'WHITE SOX'

type HeadlineSource =
  | 'LATEST_GLOBAL'
  | 'EDITOR_PICK'
  | 'SEASON_ACTIVE'
  | 'EVERGREEN_TOP'
  | 'PERSONALIZED_OR_BALANCE'

interface HeadlineRow {
  article: Article
  source: HeadlineSource
}

interface SeasonalTeam {
  team: TeamName
  mainStory: Article
  additionalLinks: Article[]
}

interface HomepageData {
  heroMain: Article | null
  heroSide1: Article | null
  heroSide2: Article | null
  headlines: HeadlineRow[]
  featuredSlots: (Article | null)[]
  latestStream: Article[]
  seasonalFocus: SeasonalTeam[]
  evergreen: Article[]
  userPreferredTeam?: TeamName
}

// ============================================================================
// TEAM CONFIGURATION
// ============================================================================

const TEAM_CONFIG: Record<TeamName, { color: string; darkColor: string; slug: string }> = {
  'BEARS': { color: '#0B162A', darkColor: '#C83803', slug: 'chicago-bears' },
  'BULLS': { color: '#CE1141', darkColor: '#CE1141', slug: 'chicago-bulls' },
  'BLACKHAWKS': { color: '#CF0A2C', darkColor: '#CF0A2C', slug: 'chicago-blackhawks' },
  'CUBS': { color: '#0E3386', darkColor: '#CC3433', slug: 'chicago-cubs' },
  'WHITE SOX': { color: '#27251F', darkColor: '#C4CED4', slug: 'chicago-white-sox' },
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

interface Homepage2030Props {
  initialData?: HomepageData
}

export default function Homepage2030({ initialData }: Homepage2030Props) {
  const [data, setData] = useState<HomepageData | null>(initialData || null)
  const [isLoading, setIsLoading] = useState(!initialData)

  useEffect(() => {
    if (!initialData) {
      // HOOK: Fetch homepage data from API
      // Implementation: GET /api/homepage with user preferences from cookies
      fetch('/api/homepage')
        .then(res => res.json())
        .then(setData)
        .catch(console.error)
        .finally(() => setIsLoading(false))
    }
  }, [initialData])

  if (isLoading) {
    return <HomepageSkeleton />
  }

  return (
    <main className="sm-main">
      {/*
        All 6 sections rendered in exact order as specified.
        Each section is self-contained with its own population logic hooks.
      */}

      {/* SECTION 1: Hero Region */}
      <HeroRegion
        heroMain={data?.heroMain}
        heroSide1={data?.heroSide1}
        heroSide2={data?.heroSide2}
      />

      {/* SECTION 2: Top Headlines */}
      <TopHeadlines
        headlines={data?.headlines || []}
      />

      {/* SECTION 3: Featured Shell */}
      <FeaturedShell
        slots={data?.featuredSlots || []}
      />

      {/* SECTION 4: Latest Stream */}
      <LatestStream
        articles={data?.latestStream || []}
        userPreferredTeam={data?.userPreferredTeam}
      />

      {/* SECTION 5: Seasonal Focus */}
      <SeasonalFocus
        teams={data?.seasonalFocus || []}
      />

      {/* SECTION 6: Evergreen Safety Net */}
      <EvergreenSafetyNet
        articles={data?.evergreen || []}
      />
    </main>
  )
}

// ============================================================================
// SECTION 1: HERO REGION
// ============================================================================

interface HeroRegionProps {
  heroMain?: Article | null
  heroSide1?: Article | null
  heroSide2?: Article | null
}

function HeroRegion({ heroMain, heroSide1, heroSide2 }: HeroRegionProps) {
  return (
    <section id="hero-region" className="sm-section sm-hero-region">
      <div className="sm-container">
        <header className="sm-section-header">
          <h2>Chicago Tonight</h2>
          <p>The city&apos;s sports mood, at a glance.</p>
        </header>
        <div className="sm-hero-grid">
          {/* Left: big hero */}
          <article className="sm-hero-main" data-slot="hero-main">
            {/*
              HOOK: Hero main slot population
              This slot is purely visual - data is populated by parent component.
              No ordering logic implemented here.
            */}
            {heroMain ? (
              <HeroCard article={heroMain} size="large" />
            ) : (
              <HeroPlaceholder size="large" />
            )}
          </article>

          {/* Right: 2 stacked smaller promos */}
          <article className="sm-hero-side" data-slot="hero-side-1">
            {heroSide1 ? (
              <HeroCard article={heroSide1} size="medium" />
            ) : (
              <HeroPlaceholder size="medium" />
            )}
          </article>
          <article className="sm-hero-side" data-slot="hero-side-2">
            {heroSide2 ? (
              <HeroCard article={heroSide2} size="medium" />
            ) : (
              <HeroPlaceholder size="medium" />
            )}
          </article>
        </div>
      </div>
    </section>
  )
}

function HeroCard({ article, size }: { article: Article; size: 'large' | 'medium' }) {
  const teamConfig = TEAM_CONFIG[article.team]

  return (
    <Link
      href={`/${article.category_slug}/${article.slug}`}
      className={`sm-hero-card sm-hero-card-${size} group`}
    >
      <div className="sm-hero-card-image">
        {article.featured_image && (
          <Image
            src={article.featured_image}
            alt={article.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes={size === 'large' ? '(max-width: 768px) 100vw, 66vw' : '(max-width: 768px) 100vw, 33vw'}
          />
        )}
        <div className="sm-hero-card-overlay" />
      </div>
      <div className="sm-hero-card-content">
        <span
          className="sm-hero-tag"
          style={{ backgroundColor: teamConfig.color }}
        >
          {article.team}
        </span>
        <h3 className={`sm-hero-title ${size === 'large' ? 'text-2xl md:text-4xl' : 'text-lg md:text-xl'}`}>
          {article.title}
        </h3>
        {size === 'large' && article.excerpt && (
          <p className="sm-hero-excerpt">{article.excerpt}</p>
        )}
      </div>
    </Link>
  )
}

function HeroPlaceholder({ size }: { size: 'large' | 'medium' }) {
  return (
    <div className={`sm-hero-placeholder sm-hero-placeholder-${size}`}>
      <div className="sm-hero-placeholder-content">
        <span className="sm-hero-placeholder-tag" />
        <span className="sm-hero-placeholder-title" />
        {size === 'large' && <span className="sm-hero-placeholder-excerpt" />}
      </div>
    </div>
  )
}

// ============================================================================
// SECTION 2: TOP HEADLINES
// ============================================================================

interface TopHeadlinesProps {
  headlines: HeadlineRow[]
}

function TopHeadlines({ headlines }: TopHeadlinesProps) {
  return (
    <section id="top-headlines" className="sm-section sm-top-headlines">
      <div className="sm-container">
        <header className="sm-section-header">
          <h2>Top Headlines</h2>
          <p>Not just the newest — the most Chicago.</p>
        </header>
        <div className="sm-headlines-box">
          <ol className="sm-headlines-list">
            {/*
              POPULATION LOGIC FOR THE 10 ROWS (NO DEVIATION):

              Row 1–3: LATEST_GLOBAL
                - Strictly the 3 most recent articles across ALL teams
                - Reverse chronological order

              Row 4–6: EDITOR_PICK
                - 3 editor-picked "must-see" stories
                - Flagged in CMS as editor_pick=true

              Row 7–8: SEASON_ACTIVE
                - 2 stories from currently ACTIVE season teams
                - During NFL season: 1 Bears + 1 non-Bears from any other active league
                - Outside NFL season: no forced Bears; 2 from currently playing leagues

              Row 9: EVERGREEN_TOP
                - 1 evergreen story with highest 30-day engagement
                - Based on time on page or shares

              Row 10: PERSONALIZED_OR_BALANCE
                - If user has team preference: latest article from that team
                - If no preference: latest article from any team NOT already in rows 1–9
            */}
            {headlines.length === 10 ? (
              headlines.map((row, index) => (
                <HeadlineRow key={row.article.id} row={row} index={index + 1} />
              ))
            ) : (
              // Fallback: render placeholder rows if data is incomplete
              Array.from({ length: 10 }).map((_, i) => (
                <li key={i} className="sm-headline-row sm-headline-row-placeholder">
                  <span className="sm-headline-tag-placeholder" />
                  <span className="sm-headline-link-placeholder" />
                </li>
              ))
            )}
          </ol>
        </div>
      </div>
    </section>
  )
}

function HeadlineRow({ row, index }: { row: HeadlineRow; index: number }) {
  const { article, source } = row
  const teamConfig = TEAM_CONFIG[article.team]
  const tagClass = `sm-headline-tag-${article.team.toLowerCase().replace(' ', '-')}`

  return (
    <li className="sm-headline-row" data-source={source} data-row={index}>
      <span
        className={`sm-headline-tag ${tagClass}`}
        style={{
          '--tag-color': teamConfig.color,
          '--tag-dark-color': teamConfig.darkColor,
        } as React.CSSProperties}
      >
        {article.team}
      </span>
      <Link
        href={`/${article.category_slug}/${article.slug}`}
        className="sm-headline-link"
      >
        {article.title}
      </Link>
    </li>
  )
}

// ============================================================================
// SECTION 3: FEATURED SHELL
// ============================================================================

interface FeaturedShellProps {
  slots: (Article | null)[]
}

function FeaturedShell({ slots }: FeaturedShellProps) {
  // Ensure we always have exactly 6 slots
  const normalizedSlots = [...slots]
  while (normalizedSlots.length < 6) {
    normalizedSlots.push(null)
  }

  return (
    <section id="featured-shell" className="sm-section sm-featured-shell">
      <div className="sm-container">
        <header className="sm-section-header">
          <h2>Chicago Front Page</h2>
          <p>The stories that still matter after the final whistle.</p>
        </header>
        <div className="sm-featured-grid">
          {/*
            POPULATION PRIORITY RULES FOR FEATURES (APPLY IN THIS ORDER):

            For each slot FEATURE_1 to FEATURE_6:

            1) If an article is manually pinned to that slot in CMS, use it.
               Check: article.pinned_slot === slotNumber

            2) Else, choose from a SEASON-AWARE POOL:
               - During NFL season: At least 2 of 6 slots must be Bears
               - When Bears are out of season: At least 2 of 6 slots must be
                 from currently active teams (Bulls, Blackhawks, Cubs, White Sox)

            3) Within that pool, select the story with:
               - High engagement (time on page, shares)
               - AND published within the last 90 days

            4) If still no candidate, use EVERGREEN:
               - Classic features with no hard expiration
               - article.is_evergreen === true

            5) This shell must NEVER leave a slot empty.
               If absolutely no article exists, duplicate highest-engagement
               evergreen piece (last resort).
          */}

          {/* Slot 1: Large feature tile (dominant) */}
          <article className="sm-featured-slot sm-featured-slot-1" data-slot="FEATURE_1">
            {normalizedSlots[0] ? (
              <FeaturedCard article={normalizedSlots[0]} variant="large" />
            ) : (
              <FeaturedPlaceholder variant="large" />
            )}
          </article>

          {/* Slots 2–3: Medium horizontal tiles */}
          <article className="sm-featured-slot sm-featured-slot-2" data-slot="FEATURE_2">
            {normalizedSlots[1] ? (
              <FeaturedCard article={normalizedSlots[1]} variant="medium" />
            ) : (
              <FeaturedPlaceholder variant="medium" />
            )}
          </article>
          <article className="sm-featured-slot sm-featured-slot-3" data-slot="FEATURE_3">
            {normalizedSlots[2] ? (
              <FeaturedCard article={normalizedSlots[2]} variant="medium" />
            ) : (
              <FeaturedPlaceholder variant="medium" />
            )}
          </article>

          {/* Slots 4–6: Smaller cards */}
          <article className="sm-featured-slot sm-featured-slot-4" data-slot="FEATURE_4">
            {normalizedSlots[3] ? (
              <FeaturedCard article={normalizedSlots[3]} variant="small" />
            ) : (
              <FeaturedPlaceholder variant="small" />
            )}
          </article>
          <article className="sm-featured-slot sm-featured-slot-5" data-slot="FEATURE_5">
            {normalizedSlots[4] ? (
              <FeaturedCard article={normalizedSlots[4]} variant="small" />
            ) : (
              <FeaturedPlaceholder variant="small" />
            )}
          </article>
          <article className="sm-featured-slot sm-featured-slot-6" data-slot="FEATURE_6">
            {normalizedSlots[5] ? (
              <FeaturedCard article={normalizedSlots[5]} variant="small" />
            ) : (
              <FeaturedPlaceholder variant="small" />
            )}
          </article>
        </div>
      </div>
    </section>
  )
}

function FeaturedCard({ article, variant }: { article: Article; variant: 'large' | 'medium' | 'small' }) {
  const teamConfig = TEAM_CONFIG[article.team]

  return (
    <Link
      href={`/${article.category_slug}/${article.slug}`}
      className={`sm-featured-card sm-featured-card-${variant} group`}
    >
      <div className="sm-featured-card-image">
        {article.featured_image && (
          <Image
            src={article.featured_image}
            alt={article.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes={
              variant === 'large'
                ? '(max-width: 768px) 100vw, 50vw'
                : variant === 'medium'
                ? '(max-width: 768px) 100vw, 33vw'
                : '(max-width: 768px) 50vw, 25vw'
            }
          />
        )}
        <div className="sm-featured-card-overlay" />
      </div>
      <div className="sm-featured-card-content">
        <span
          className="sm-featured-tag"
          style={{ backgroundColor: teamConfig.color }}
        >
          {article.team}
        </span>
        <h3 className={`sm-featured-title ${
          variant === 'large'
            ? 'text-xl md:text-2xl lg:text-3xl'
            : variant === 'medium'
            ? 'text-lg md:text-xl'
            : 'text-base md:text-lg'
        }`}>
          {article.title}
        </h3>
        {variant === 'large' && article.excerpt && (
          <p className="sm-featured-excerpt line-clamp-2">{article.excerpt}</p>
        )}
      </div>
    </Link>
  )
}

function FeaturedPlaceholder({ variant }: { variant: 'large' | 'medium' | 'small' }) {
  return (
    <div className={`sm-featured-placeholder sm-featured-placeholder-${variant}`}>
      <div className="sm-featured-placeholder-content">
        <span className="sm-featured-placeholder-tag" />
        <span className="sm-featured-placeholder-title" />
        {variant === 'large' && <span className="sm-featured-placeholder-excerpt" />}
      </div>
    </div>
  )
}

// ============================================================================
// SECTION 4: LATEST STREAM
// ============================================================================

interface LatestStreamProps {
  articles: Article[]
  userPreferredTeam?: TeamName
}

function LatestStream({ articles, userPreferredTeam }: LatestStreamProps) {
  // Calculate time categories for backfill labeling
  const now = new Date()
  const threeDaysAgo = new Date(now.getTime() - 72 * 60 * 60 * 1000)
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

  const categorizeAge = (publishedAt: string): 'recent' | 'last_week' | 'older' => {
    const date = new Date(publishedAt)
    if (date >= threeDaysAgo) return 'recent'
    if (date >= oneWeekAgo) return 'last_week'
    return 'older'
  }

  return (
    <section id="latest-stream" className="sm-section sm-latest-stream">
      <div className="sm-container">
        <header className="sm-section-header">
          <h2>Latest From Chicago</h2>
          <p>Every new post, in order. No favorites played.</p>
        </header>
        <div className="sm-latest-list">
          {/*
            POPULATION RULES:

            1) Show up to 15 items, strictly newest to oldest.

            2) If fewer than 5 new posts exist in the last 72 hours:
               - Still show a full list by backfilling with slightly older posts
               - Backfill posts must be labeled: "From last week" or "From last month"

            3) Do NOT allow this section to influence hero, headlines, or
               featured shell ordering.

            4) For RETURNING visitors with known preferred team:
               - Visually highlight posts from the preferred team
               - Use subtle border or team color tag
               - Do NOT reorder the list
          */}
          {articles.slice(0, 15).map((article, index) => {
            const age = categorizeAge(article.published_at)
            const isPreferred = userPreferredTeam && article.team === userPreferredTeam

            return (
              <LatestStreamItem
                key={article.id}
                article={article}
                age={age}
                isPreferred={isPreferred}
                index={index}
              />
            )
          })}

          {articles.length === 0 && (
            // Placeholder for empty state
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="sm-latest-item sm-latest-item-placeholder">
                <div className="sm-latest-item-image-placeholder" />
                <div className="sm-latest-item-content-placeholder">
                  <span className="sm-latest-item-tag-placeholder" />
                  <span className="sm-latest-item-title-placeholder" />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  )
}

function LatestStreamItem({
  article,
  age,
  isPreferred,
  index
}: {
  article: Article
  age: 'recent' | 'last_week' | 'older'
  isPreferred?: boolean
  index: number
}) {
  const teamConfig = TEAM_CONFIG[article.team]
  const ageLabel = age === 'last_week' ? 'From last week' : age === 'older' ? 'From last month' : null

  return (
    <article
      className={`sm-latest-item ${isPreferred ? 'sm-latest-item-preferred' : ''}`}
      style={isPreferred ? {
        '--preferred-color': teamConfig.color,
        '--preferred-dark-color': teamConfig.darkColor,
      } as React.CSSProperties : undefined}
      data-index={index}
    >
      <Link
        href={`/${article.category_slug}/${article.slug}`}
        className="sm-latest-item-link group"
      >
        <div className="sm-latest-item-image">
          {article.featured_image && (
            <Image
              src={article.featured_image}
              alt={article.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="120px"
            />
          )}
        </div>
        <div className="sm-latest-item-content">
          <div className="sm-latest-item-meta">
            <span
              className="sm-latest-tag"
              style={{ backgroundColor: teamConfig.color }}
            >
              {article.team}
            </span>
            <time className="sm-latest-time" dateTime={article.published_at}>
              {formatRelativeTime(article.published_at)}
            </time>
            {ageLabel && (
              <span className="sm-latest-age-label">{ageLabel}</span>
            )}
          </div>
          <h3 className="sm-latest-title group-hover:text-[var(--accent-primary)]">
            {article.title}
          </h3>
        </div>
      </Link>
    </article>
  )
}

// ============================================================================
// SECTION 5: SEASONAL FOCUS
// ============================================================================

interface SeasonalFocusProps {
  teams: SeasonalTeam[]
}

function SeasonalFocus({ teams }: SeasonalFocusProps) {
  return (
    <section id="seasonal-focus" className="sm-section sm-seasonal-focus">
      <div className="sm-container">
        <header className="sm-section-header">
          <h2>In Season Right Now</h2>
          <p>Who&apos;s playing for your attention this month.</p>
        </header>
        <div className="sm-seasonal-grid">
          {/*
            POPULATION RULES:

            1) Determine active leagues by date:
               - If date falls within NFL regular or playoff season: NFL/Bears is active
               - Likewise for NBA/Bulls, NHL/Blackhawks, MLB/Cubs/White Sox

            2) For up to 3 active teams:
               - Create one main highlight card per team (latest big story)
               - Beneath that card, add 2 text links to additional recent stories

            3) When Bears are out of season:
               - Bears do NOT get a card in this band
               - Bulls/Blackhawks/Cubs/White Sox take over, depending on season

            Season date ranges (approximate):
            - NFL: September through February (Super Bowl)
            - NBA: October through June (Finals)
            - NHL: October through June (Stanley Cup)
            - MLB: April through October (World Series)
          */}
          {teams.slice(0, 3).map((team) => (
            <SeasonalTeamCard key={team.team} team={team} />
          ))}

          {teams.length === 0 && (
            // Off-season placeholder
            <div className="sm-seasonal-empty">
              <p>Check back soon — the next season is right around the corner.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

function SeasonalTeamCard({ team }: { team: SeasonalTeam }) {
  const teamConfig = TEAM_CONFIG[team.team]

  return (
    <div className="sm-seasonal-team">
      {/* Main highlight card */}
      <Link
        href={`/${team.mainStory.category_slug}/${team.mainStory.slug}`}
        className="sm-seasonal-main group"
      >
        <div className="sm-seasonal-main-image">
          {team.mainStory.featured_image && (
            <Image
              src={team.mainStory.featured_image}
              alt={team.mainStory.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, 33vw"
            />
          )}
          <div className="sm-seasonal-main-overlay" />
        </div>
        <div className="sm-seasonal-main-content">
          <span
            className="sm-seasonal-tag"
            style={{ backgroundColor: teamConfig.color }}
          >
            {team.team}
          </span>
          <h3 className="sm-seasonal-main-title">{team.mainStory.title}</h3>
        </div>
      </Link>

      {/* 2 additional text links */}
      <ul className="sm-seasonal-links">
        {team.additionalLinks.slice(0, 2).map((article) => (
          <li key={article.id} className="sm-seasonal-link-item">
            <Link
              href={`/${article.category_slug}/${article.slug}`}
              className="sm-seasonal-link"
            >
              {article.title}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

// ============================================================================
// SECTION 6: EVERGREEN SAFETY NET
// ============================================================================

interface EvergreenSafetyNetProps {
  articles: Article[]
}

function EvergreenSafetyNet({ articles }: EvergreenSafetyNetProps) {
  // Ensure exactly 4 articles
  const normalizedArticles = articles.slice(0, 4)

  return (
    <section id="evergreen-safety-net" className="sm-section sm-evergreen">
      <div className="sm-container">
        <header className="sm-section-header">
          <h2>Chicago Classics</h2>
          <p>Pieces that still hit, no matter the score.</p>
        </header>
        <div className="sm-evergreen-grid">
          {/*
            POPULATION RULES:

            1) Always show EXACTLY 4 evergreen articles.

            2) Selection criteria (in order):
               a) Must still be contextually relevant (no outdated rosters or dead links)
               b) Highest lifetime engagement
               c) Prefer a mix across teams:
                  - 1 Bears
                  - 1 Bulls/Blackhawks
                  - 1 Cubs/White Sox
                  - 1 "citywide" or multi-team story

            3) If a category is missing, fill with any high-engagement evergreen
               instead of leaving a slot blank.

            This section guarantees the homepage is NEVER thin or empty,
            especially for first-time or off-season visits.
          */}
          {normalizedArticles.map((article, index) => (
            <EvergreenCard key={article.id} article={article} index={index} />
          ))}

          {normalizedArticles.length < 4 && (
            // Placeholder cards for missing slots
            Array.from({ length: 4 - normalizedArticles.length }).map((_, i) => (
              <div key={`placeholder-${i}`} className="sm-evergreen-card sm-evergreen-card-placeholder">
                <div className="sm-evergreen-placeholder-image" />
                <div className="sm-evergreen-placeholder-content">
                  <span className="sm-evergreen-placeholder-tag" />
                  <span className="sm-evergreen-placeholder-title" />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  )
}

function EvergreenCard({ article, index }: { article: Article; index: number }) {
  const teamConfig = TEAM_CONFIG[article.team]

  return (
    <article className="sm-evergreen-card" data-slot={index + 1}>
      <Link
        href={`/${article.category_slug}/${article.slug}`}
        className="sm-evergreen-link group"
      >
        <div className="sm-evergreen-image">
          {article.featured_image && (
            <Image
              src={article.featured_image}
              alt={article.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, 25vw"
            />
          )}
          <div className="sm-evergreen-overlay" />
        </div>
        <div className="sm-evergreen-content">
          <span
            className="sm-evergreen-tag"
            style={{ backgroundColor: teamConfig.color }}
          >
            {article.team}
          </span>
          <h3 className="sm-evergreen-title">{article.title}</h3>
          <span className="sm-evergreen-classic-badge">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            Classic
          </span>
        </div>
      </Link>
    </article>
  )
}

// ============================================================================
// LOADING SKELETON
// ============================================================================

function HomepageSkeleton() {
  return (
    <main className="sm-main sm-main-loading">
      <section className="sm-section sm-hero-region">
        <div className="sm-container">
          <header className="sm-section-header">
            <div className="sm-skeleton sm-skeleton-title" />
            <div className="sm-skeleton sm-skeleton-subtitle" />
          </header>
          <div className="sm-hero-grid">
            <div className="sm-hero-main sm-skeleton-block" />
            <div className="sm-hero-side sm-skeleton-block" />
            <div className="sm-hero-side sm-skeleton-block" />
          </div>
        </div>
      </section>
      {/* Additional skeleton sections... */}
    </main>
  )
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
