import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import AchievementBadge from '@/components/AchievementBadge'

export const metadata: Metadata = {
  title: 'Your Profile - Sports Mockery',
  description: 'View your Sports Mockery profile, badges, saved articles, and reading history.',
}

// Mock user data - in a real app this would come from auth/database
const mockUser = {
  id: '1',
  name: 'Chicago Fan',
  email: 'fan@example.com',
  avatar: null,
  memberSince: 'January 2024',
  favoriteTeam: 'Bears',
  stats: {
    articlesRead: 156,
    commentsPosted: 23,
    votescast: 47,
    streak: 12,
  },
}

const achievements = [
  {
    id: '1',
    name: 'Early Adopter',
    description: 'Joined Sports Mockery in its first year',
    icon: 'star' as const,
    rarity: 'rare' as const,
    earned: true,
    earnedAt: 'Jan 2024',
  },
  {
    id: '2',
    name: 'Die Hard Fan',
    description: 'Read 100+ articles',
    icon: 'fire' as const,
    rarity: 'epic' as const,
    earned: true,
    earnedAt: 'Mar 2024',
  },
  {
    id: '3',
    name: 'Voice of the People',
    description: 'Cast 50 votes in Fan Senate',
    icon: 'trophy' as const,
    rarity: 'rare' as const,
    earned: false,
    progress: 94,
  },
  {
    id: '4',
    name: 'Streak Master',
    description: 'Visit for 30 consecutive days',
    icon: 'lightning' as const,
    rarity: 'legendary' as const,
    earned: false,
    progress: 40,
  },
  {
    id: '5',
    name: 'Commentator',
    description: 'Post your first comment',
    icon: 'medal' as const,
    rarity: 'common' as const,
    earned: true,
    earnedAt: 'Feb 2024',
  },
  {
    id: '6',
    name: 'True Fan',
    description: 'Complete your fan profile',
    icon: 'heart' as const,
    rarity: 'common' as const,
    earned: true,
    earnedAt: 'Jan 2024',
  },
]

const savedArticles = [
  {
    id: '1',
    title: 'Bears Trade Deadline: What to Expect',
    category: 'Bears',
    categorySlug: 'bears',
    slug: 'bears-trade-deadline-expectations',
    savedAt: '2 days ago',
  },
  {
    id: '2',
    title: 'Bulls Rotation Changes Making Impact',
    category: 'Bulls',
    categorySlug: 'bulls',
    slug: 'bulls-rotation-changes-impact',
    savedAt: '5 days ago',
  },
  {
    id: '3',
    title: 'Cubs Pitching Staff Analysis',
    category: 'Cubs',
    categorySlug: 'cubs',
    slug: 'cubs-pitching-analysis',
    savedAt: '1 week ago',
  },
]

const readingHistory = [
  {
    id: '1',
    title: 'Breaking: Bears Sign Free Agent',
    category: 'Bears',
    categorySlug: 'bears',
    slug: 'bears-free-agent-signing',
    readAt: 'Today',
  },
  {
    id: '2',
    title: 'Bulls vs Celtics Recap',
    category: 'Bulls',
    categorySlug: 'bulls',
    slug: 'bulls-celtics-recap',
    readAt: 'Yesterday',
  },
  {
    id: '3',
    title: 'Cubs Spring Training Preview',
    category: 'Cubs',
    categorySlug: 'cubs',
    slug: 'cubs-spring-training',
    readAt: '2 days ago',
  },
  {
    id: '4',
    title: 'White Sox Rebuild Update',
    category: 'White Sox',
    categorySlug: 'white-sox',
    slug: 'white-sox-rebuild-update',
    readAt: '3 days ago',
  },
]

export default function ProfilePage() {
  const earnedCount = achievements.filter(a => a.earned).length

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Profile Header */}
      <section className="relative overflow-hidden border-b border-zinc-800 py-12 lg:py-16">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(139,0,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(139,0,0,0.03)_1px,transparent_1px)] bg-[size:48px_48px]" />
        <div className="absolute left-1/4 top-0 h-64 w-64 rounded-full bg-[#8B0000]/10 blur-[100px]" />

        <div className="relative mx-auto max-w-6xl px-4">
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
            {/* Avatar */}
            <div className="relative">
              {mockUser.avatar ? (
                <Image
                  src={mockUser.avatar}
                  alt={mockUser.name}
                  width={120}
                  height={120}
                  className="rounded-full ring-4 ring-[#8B0000]/30"
                />
              ) : (
                <div className="flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-[#8B0000] to-[#FF0000] text-4xl font-bold text-white ring-4 ring-[#8B0000]/30">
                  {mockUser.name.charAt(0)}
                </div>
              )}

              {/* Streak badge */}
              <div className="absolute -bottom-2 -right-2 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-orange-500 text-sm font-bold text-white shadow-lg">
                {mockUser.stats.streak}
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 text-center sm:text-left">
              <h1 className="mb-1 text-2xl font-black text-white sm:text-3xl">
                {mockUser.name}
              </h1>
              <p className="mb-4 text-zinc-500">Member since {mockUser.memberSince}</p>

              {/* Favorite team badge */}
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#C83200]/20 px-4 py-2">
                <span className="h-2 w-2 rounded-full bg-[#C83200]" />
                <span className="text-sm font-semibold text-[#C83200]">
                  {mockUser.favoriteTeam} Fan
                </span>
              </div>

              {/* Stats */}
              <div className="flex flex-wrap justify-center gap-6 sm:justify-start">
                <div>
                  <div className="text-2xl font-black text-white">{mockUser.stats.articlesRead}</div>
                  <div className="text-xs text-zinc-500">Articles Read</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-white">{mockUser.stats.commentsPosted}</div>
                  <div className="text-xs text-zinc-500">Comments</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-white">{mockUser.stats.votescast}</div>
                  <div className="text-xs text-zinc-500">Votes Cast</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-amber-400">{mockUser.stats.streak} days</div>
                  <div className="text-xs text-zinc-500">Current Streak</div>
                </div>
              </div>
            </div>

            {/* Settings link */}
            <Link
              href="/profile/settings"
              className="inline-flex items-center gap-2 rounded-xl bg-white/5 px-4 py-2 text-sm font-semibold text-zinc-400 transition-colors hover:bg-white/10 hover:text-white"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Settings
            </Link>
          </div>
        </div>
      </section>

      {/* Achievements */}
      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-8 w-1.5 rounded-full bg-gradient-to-b from-amber-500 to-orange-500" />
            <h2 className="text-2xl font-black uppercase tracking-tight text-white">
              Achievements
            </h2>
          </div>
          <span className="rounded-full bg-amber-500/20 px-3 py-1 text-sm font-semibold text-amber-400">
            {earnedCount}/{achievements.length} Earned
          </span>
        </div>

        <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-6">
          {achievements.map((achievement) => (
            <div key={achievement.id} className="flex flex-col items-center gap-2">
              <AchievementBadge achievement={achievement} size="lg" showProgress />
              <span className={`text-xs font-medium ${achievement.earned ? 'text-white' : 'text-zinc-600'}`}>
                {achievement.name}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Two column layout */}
      <div className="mx-auto max-w-6xl px-4 pb-16">
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Saved Articles */}
          <section>
            <div className="mb-6 flex items-center gap-4">
              <div className="h-8 w-1.5 rounded-full bg-gradient-to-b from-[#8B0000] to-[#FF0000]" />
              <h2 className="text-xl font-black uppercase tracking-tight text-white">
                Saved Articles
              </h2>
            </div>

            {savedArticles.length > 0 ? (
              <div className="space-y-3">
                {savedArticles.map((article) => (
                  <Link
                    key={article.id}
                    href={`/${article.categorySlug}/${article.slug}`}
                    className="group flex items-start justify-between rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 transition-all hover:border-zinc-700 hover:bg-zinc-900"
                  >
                    <div className="flex-1">
                      <span className="mb-1 inline-block rounded bg-[#8B0000]/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#8B0000]">
                        {article.category}
                      </span>
                      <h3 className="font-semibold text-white transition-colors group-hover:text-[#FF0000]">
                        {article.title}
                      </h3>
                    </div>
                    <span className="ml-4 text-xs text-zinc-500">{article.savedAt}</span>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-8 text-center">
                <svg className="mx-auto mb-4 h-12 w-12 text-zinc-700" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
                </svg>
                <p className="text-zinc-500">No saved articles yet</p>
              </div>
            )}
          </section>

          {/* Reading History */}
          <section>
            <div className="mb-6 flex items-center gap-4">
              <div className="h-8 w-1.5 rounded-full bg-gradient-to-b from-zinc-500 to-zinc-700" />
              <h2 className="text-xl font-black uppercase tracking-tight text-white">
                Reading History
              </h2>
            </div>

            <div className="space-y-3">
              {readingHistory.map((article) => (
                <Link
                  key={article.id}
                  href={`/${article.categorySlug}/${article.slug}`}
                  className="group flex items-start justify-between rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 transition-all hover:border-zinc-700 hover:bg-zinc-900"
                >
                  <div className="flex-1">
                    <span className="mb-1 inline-block text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                      {article.category}
                    </span>
                    <h3 className="font-semibold text-white transition-colors group-hover:text-[#FF0000]">
                      {article.title}
                    </h3>
                  </div>
                  <span className="ml-4 text-xs text-zinc-500">{article.readAt}</span>
                </Link>
              ))}
            </div>

            <button className="mt-4 w-full rounded-xl bg-white/5 py-3 text-sm font-semibold text-zinc-400 transition-colors hover:bg-white/10 hover:text-white">
              View Full History
            </button>
          </section>
        </div>
      </div>

      {/* Back link */}
      <div className="mx-auto max-w-6xl px-4 pb-16">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-zinc-500 transition-colors hover:text-white"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Back to Home
        </Link>
      </div>
    </div>
  )
}
