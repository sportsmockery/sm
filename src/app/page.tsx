import { fetchHomepageData } from '@/lib/homepage-data'
import {
  InfoDeck,
  FeaturedShell,
  LatestStream,
  SeasonalFocus,
  EvergreenClassics,
} from '@/components/home'
import '@/components/homepage/homepagev3.css'

/**
 * SportsMockery Homepage - SSR Chicago Tonight Layout
 *
 * GUARANTEE: This page always renders full content on the server.
 * Uses fetchHomepageData which never throws and always returns data.
 *
 * Layout:
 * 1. Above-the-fold Info Deck (two columns)
 *    - Primary story (left, larger)
 *    - Top 10 Headlines (right)
 * 2. Chicago Front Page (6 featured slots)
 * 3. Latest Stream (15 items, reverse chronological)
 * 4. Seasonal Focus (up to 3 in-season teams)
 * 5. Chicago Classics (4 evergreen pieces)
 *
 * The homepage automatically adjusts focus based on current sports seasons:
 * - NFL (Bears): September through February
 * - NBA (Bulls): October through June
 * - NHL (Blackhawks): October through June
 * - MLB (Cubs/White Sox): April through October
 */
export default async function HomePage() {
  // SSR data fetch - guaranteed to return valid data with fallbacks
  const data = await fetchHomepageData()

  return (
    <main className="sm-homepage">
      {/* Above the fold: Info Deck */}
      <InfoDeck
        primaryStory={data.primaryStory}
        supportStories={data.supportStories}
        headlines={data.headlines}
      />

      {/* Chicago Front Page: 6 Featured */}
      <FeaturedShell posts={data.featureSlots} />

      {/* Latest from Chicago */}
      <LatestStream posts={data.latestPosts} />

      {/* In Season Right Now */}
      <SeasonalFocus teams={data.seasonalTeams} />

      {/* Chicago Classics */}
      <EvergreenClassics posts={data.evergreenPosts} />
    </main>
  )
}
