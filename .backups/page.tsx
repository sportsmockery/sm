import OracleScoresBar from '@/components/scores/OracleScoresBar'
import HeroSection from '@/components/home/HeroSection'
import HeadlineStack from '@/components/headlines/HeadlineStack'
import ArticleGrid from '@/components/home/ArticleGrid'
import TrendingSidebar from '@/components/home/TrendingSidebar'
import UpcomingGames from '@/components/home/UpcomingGames'
import TeamSection from '@/components/home/TeamSection'
import NewsletterCTA from '@/components/home/NewsletterCTA'
import {
  exampleScores,
  exampleHeadlines,
  exampleFeaturedArticle,
  exampleTrendingArticles,
  exampleUpcomingGames,
  exampleLatestArticles,
} from '@/data/exampleData'

export const revalidate = 60

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      {/* Scores Bar - Sticky at top, only scrolling element */}
      <div className="sticky top-0 z-40">
        <OracleScoresBar scores={exampleScores} />
      </div>

      {/* Hero Section - Single large featured article */}
      <HeroSection article={exampleFeaturedArticle} />

      {/* Main Content Area */}
      <main className="mx-auto max-w-[1280px] px-5 py-8 md:px-10">
        {/* Two-column layout: 70% Main / 30% Sidebar */}
        <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
          {/* Left Column - Main Content */}
          <div className="space-y-10">
            {/* Top Stories Section */}
            <section>
              <SectionHeading>Top Stories</SectionHeading>
              <HeadlineStack headlines={exampleHeadlines.slice(0, 5)} />
            </section>

            {/* Latest News Section */}
            <section>
              <SectionHeading>Latest News</SectionHeading>
              <ArticleGrid articles={exampleLatestArticles} columns={2} />
            </section>
          </div>

          {/* Right Column - Sidebar */}
          <aside className="space-y-6">
            {/* Upcoming Games Widget */}
            <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
              <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-zinc-900 dark:text-white">
                Upcoming Games
              </h3>
              <UpcomingGames games={exampleUpcomingGames} compact />
            </div>

            {/* Trending Articles */}
            <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
              <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-zinc-900 dark:text-white">
                Trending
              </h3>
              <TrendingSidebar articles={exampleTrendingArticles.slice(0, 5)} compact />
            </div>

            {/* Newsletter CTA */}
            <NewsletterCTA />
          </aside>
        </div>

        {/* Divider */}
        <hr className="my-12 border-zinc-200 dark:border-zinc-800" />

        {/* Team Section - Horizontal row */}
        <TeamSection />
      </main>
    </div>
  )
}

// Clean section heading component
function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-5 flex items-center gap-3 border-b-2 border-[#8B0000] pb-2">
      <h2 className="text-lg font-bold uppercase tracking-tight text-zinc-900 dark:text-white">
        {children}
      </h2>
    </div>
  )
}
