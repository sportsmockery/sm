import { fetchHomepageData } from '@/lib/homepage-data'
import { getMockUpcomingGames } from '@/lib/upcoming-games'
import {
  ChicagoLive,
  FanControlCenter,
  HomepageTeamBar,
  InfoDeck,
  FeaturedShell,
  LatestStream,
  SeasonalFocus,
  EvergreenClassics,
} from '@/components/home'
import '@/components/homepage/homepagev3.css'

/**
 * SportsMockery Homepage - V10 Design System
 *
 * GUARANTEE: This page always renders full content on the server.
 * Uses fetchHomepageData which never throws and always returns data.
 *
 * V10 Layout:
 * 1. Homepage Team Bar (in-season teams: last game, next game)
 * 2. Trending Right Now / Info Deck
 * 3. Chicago Front Page (6 featured slots)
 * 4. Latest Stream (15 items, reverse chronological)
 * 5. Chicago Live (hero story + upcoming games)
 * 6. Chicago Fan Control Center (Fan Chat + Ask AI)
 * 7. Seasonal Focus (up to 3 in-season teams)
 * 8. Chicago Classics (4 evergreen pieces)
 */
export default async function HomePage() {
  // SSR data fetch - guaranteed to return valid data with fallbacks
  const data = await fetchHomepageData()

  // Get upcoming games (use mock data for now)
  const upcomingGames = getMockUpcomingGames()

  // Transform primary story for ChicagoLive component
  const heroStory = data.primaryStory ? {
    id: typeof data.primaryStory.id === 'string' ? parseInt(data.primaryStory.id) : data.primaryStory.id,
    title: data.primaryStory.title,
    slug: data.primaryStory.slug,
    excerpt: data.primaryStory.excerpt,
    featured_image: data.primaryStory.featured_image,
    published_at: data.primaryStory.published_at,
    category: data.primaryStory.category,
  } : null

  return (
    <main className="sm-homepage">
      {/* In-Season Teams Bar - Shows Bulls, Blackhawks now; adds other teams when their seasons start */}
      <HomepageTeamBar />

      {/* Trending / Headlines */}
      <InfoDeck
        primaryStory={data.primaryStory}
        supportStories={data.supportStories}
        headlines={data.headlines}
      />

      {/* Chicago Front Page: 6 Featured */}
      <FeaturedShell posts={data.featureSlots} />

      {/* Latest from Chicago */}
      <LatestStream posts={data.latestPosts} />

      {/* Chicago Live - Hero + Upcoming Games (moved lower) */}
      <ChicagoLive
        heroStory={heroStory}
        upcomingGames={upcomingGames}
      />

      {/* Fan Control Center - Chat + AI (moved lower) */}
      <FanControlCenter />

      {/* In Season Right Now */}
      <SeasonalFocus teams={data.seasonalTeams} />

      {/* Chicago Classics */}
      <EvergreenClassics posts={data.evergreenPosts} />
    </main>
  )
}
