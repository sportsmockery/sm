'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useAuth } from '@/contexts/AuthContext'
import AchievementBadge from '@/components/AchievementBadge'
import { FavoriteTeamsSelector } from '@/components/personalization'
import { TeamSlug } from '@/lib/types'
import DisqusConnection from '@/components/auth/DisqusConnection'
import SocialConnectionsManager from '@/components/auth/SocialConnectionsManager'
import DisqusPromptModal from '@/components/auth/DisqusPromptModal'

// Mock data for stats - in a real app this would come from database
const mockStats = {
  favoriteTeam: 'Bears',
  articlesRead: 156,
  commentsPosted: 23,
  votescast: 47,
  streak: 12,
}

// Format date to "Month Year" format
function formatMemberSince(dateString?: string): string {
  if (!dateString) return 'Recently'
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
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
  const { user, loading, isAuthenticated, refreshUser } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)

  // States for editing
  const [isEditingName, setIsEditingName] = useState(false)
  const [editedName, setEditedName] = useState('')
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [isSavingName, setIsSavingName] = useState(false)
  const [isSavingAvatar, setIsSavingAvatar] = useState(false)

  // Settings states
  const [settings, setSettings] = useState({
    breakingNews: true,
    teamUpdates: true,
    weeklyDigest: false,
    predictionResults: true,
    darkMode: true,
    reducedMotion: false,
    compactMode: false,
    showProfile: true,
    showActivity: false,
    allowAnalytics: true,
    favoriteTeams: ['bears'] as TeamSlug[],
  })

  // Settings section expanded states
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    favorites: true,
    connections: false,
    notifications: false,
    display: false,
    privacy: false,
    account: false,
  })

  // Initialize edited name when user data loads
  useEffect(() => {
    if (user?.name) {
      setEditedName(user.name)
    }
  }, [user?.name])

  const handleToggle = (key: keyof typeof settings) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  const handleFavoriteTeamsChange = (teams: TeamSlug[]) => {
    setSettings(prev => ({
      ...prev,
      favoriteTeams: teams,
    }))
  }

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  const handleAvatarClick = () => {
    fileInputRef.current?.click()
  }

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be less than 5MB')
      return
    }

    // Create preview immediately
    const reader = new FileReader()
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string)
    }
    reader.readAsDataURL(file)

    // Upload to server
    setIsSavingAvatar(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/user/avatar', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload avatar')
      }

      // Update the preview with the actual URL from server
      setAvatarPreview(data.avatarUrl)

      // Refresh the auth context to update the Header avatar
      await refreshUser()
    } catch (error) {
      console.error('Avatar upload failed:', error)
      alert(error instanceof Error ? error.message : 'Failed to upload avatar')
      setAvatarPreview(null)
    } finally {
      setIsSavingAvatar(false)
    }
  }

  const handleNameEdit = () => {
    setIsEditingName(true)
  }

  const handleNameSave = async () => {
    if (!editedName.trim()) return

    setIsSavingName(true)
    // TODO: Save to server
    setTimeout(() => {
      setIsSavingName(false)
      setIsEditingName(false)
    }, 1000)
  }

  const handleNameCancel = () => {
    setEditedName(user?.name || '')
    setIsEditingName(false)
  }

  const earnedCount = achievements.filter(a => a.earned).length

  // Get display values
  const displayName = user?.name || 'Sports Fan'
  const displayAvatar = avatarPreview || user?.avatar
  const displayEmail = user?.email || ''

  // Determine if viewing own profile (for now, always true since we're on /profile)
  const isOwnProfile = isAuthenticated

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#8B0000]"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Profile Header */}
      <section className="relative overflow-hidden border-b border-zinc-800 py-8 sm:py-12 lg:py-16">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(139,0,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(139,0,0,0.03)_1px,transparent_1px)] bg-[size:48px_48px]" />
        <div className="absolute left-1/4 top-0 h-64 w-64 rounded-full bg-[#8B0000]/10 blur-[100px]" />

        <div className="relative mx-auto max-w-6xl px-4">
          <div className="flex flex-col items-center gap-4 sm:gap-6 sm:flex-row sm:items-start">
            {/* Avatar - Clickable for upload */}
            <div className="relative group">
              <button
                onClick={handleAvatarClick}
                className="relative block focus:outline-none focus:ring-2 focus:ring-[#8B0000] focus:ring-offset-2 focus:ring-offset-zinc-950 rounded-full"
                aria-label="Change profile picture"
              >
                {displayAvatar ? (
                  <Image
                    src={displayAvatar}
                    alt={displayName}
                    width={120}
                    height={120}
                    className="h-24 w-24 sm:h-28 sm:w-28 rounded-full ring-4 ring-[#8B0000]/30 object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="flex h-24 w-24 sm:h-28 sm:w-28 items-center justify-center rounded-full bg-gradient-to-br from-[#8B0000] to-[#FF0000] text-3xl sm:text-4xl font-bold text-white ring-4 ring-[#8B0000]/30">
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                )}

                {/* Upload overlay */}
                <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity">
                  {isSavingAvatar ? (
                    <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-white"></div>
                  ) : (
                    <svg className="h-6 w-6 sm:h-8 sm:w-8 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
                    </svg>
                  )}
                </div>
              </button>

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />

              {/* Streak badge */}
              <div className="absolute -bottom-1 -right-1 sm:-bottom-2 sm:-right-2 flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-orange-500 text-xs sm:text-sm font-bold text-white shadow-lg">
                {mockStats.streak}
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 text-center sm:text-left min-w-0">
              {/* Username with edit */}
              <div className="mb-1 flex items-center justify-center sm:justify-start gap-2">
                {isEditingName ? (
                  <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-start">
                    <input
                      type="text"
                      value={editedName}
                      onChange={(e) => setEditedName(e.target.value)}
                      className="bg-zinc-800 border border-zinc-600 rounded-lg px-3 py-1.5 text-xl sm:text-2xl font-black text-white focus:outline-none focus:ring-2 focus:ring-[#8B0000] w-full max-w-[200px] sm:max-w-none sm:w-auto"
                      autoFocus
                    />
                    <div className="flex gap-1">
                      <button
                        onClick={handleNameSave}
                        disabled={isSavingName}
                        className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors disabled:opacity-50"
                      >
                        {isSavingName ? (
                          <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-emerald-400"></div>
                        ) : (
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                          </svg>
                        )}
                      </button>
                      <button
                        onClick={handleNameCancel}
                        className="p-1.5 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                      >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <h1 className="text-2xl sm:text-3xl font-black text-white truncate">
                      {displayName}
                    </h1>
                    {isOwnProfile && (
                      <button
                        onClick={handleNameEdit}
                        className="p-1.5 rounded-lg bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white transition-colors flex-shrink-0"
                        aria-label="Edit username"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                        </svg>
                      </button>
                    )}
                  </>
                )}
              </div>

              <p className="mb-3 sm:mb-4 text-zinc-500 text-sm sm:text-base">Member since {formatMemberSince(user?.createdAt)}</p>

              {/* Favorite team badge */}
              <div className="mb-3 sm:mb-4 inline-flex items-center gap-2 rounded-full bg-[#C83200]/20 px-3 sm:px-4 py-1.5 sm:py-2">
                <span className="h-2 w-2 rounded-full bg-[#C83200]" />
                <span className="text-xs sm:text-sm font-semibold text-[#C83200]">
                  {mockStats.favoriteTeam} Fan
                </span>
              </div>

              {/* Stats */}
              <div className="flex flex-wrap justify-center gap-4 sm:gap-6 sm:justify-start">
                <div>
                  <div className="text-xl sm:text-2xl font-black text-white">{mockStats.articlesRead}</div>
                  <div className="text-[10px] sm:text-xs text-zinc-500">Articles Read</div>
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-black text-white">{mockStats.commentsPosted}</div>
                  <div className="text-[10px] sm:text-xs text-zinc-500">Comments</div>
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-black text-white">{mockStats.votescast}</div>
                  <div className="text-[10px] sm:text-xs text-zinc-500">Votes Cast</div>
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-black text-amber-400">{mockStats.streak} days</div>
                  <div className="text-[10px] sm:text-xs text-zinc-500">Current Streak</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Achievements */}
      <section className="mx-auto max-w-6xl px-4 py-8 sm:py-12">
        <div className="mb-6 sm:mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="h-6 sm:h-8 w-1 sm:w-1.5 rounded-full bg-gradient-to-b from-amber-500 to-orange-500" />
            <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white">
              Achievements
            </h2>
          </div>
          <span className="rounded-full bg-amber-500/20 px-2 sm:px-3 py-0.5 sm:py-1 text-xs sm:text-sm font-semibold text-amber-400">
            {earnedCount}/{achievements.length} Earned
          </span>
        </div>

        <div className="grid grid-cols-3 gap-3 sm:gap-4 sm:grid-cols-4 md:grid-cols-6">
          {achievements.map((achievement) => (
            <div key={achievement.id} className="flex flex-col items-center gap-1 sm:gap-2">
              <AchievementBadge achievement={achievement} size="lg" showProgress />
              <span className={`text-[10px] sm:text-xs font-medium text-center ${achievement.earned ? 'text-white' : 'text-zinc-600'}`}>
                {achievement.name}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Two column layout - Articles and History */}
      <div className="mx-auto max-w-6xl px-4 pb-8 sm:pb-12">
        <div className="grid gap-6 sm:gap-8 lg:grid-cols-2">
          {/* Saved Articles */}
          <section>
            <div className="mb-4 sm:mb-6 flex items-center gap-3 sm:gap-4">
              <div className="h-6 sm:h-8 w-1 sm:w-1.5 rounded-full bg-gradient-to-b from-[#8B0000] to-[#FF0000]" />
              <h2 className="text-lg sm:text-xl font-black uppercase tracking-tight text-white">
                Saved Articles
              </h2>
            </div>

            {savedArticles.length > 0 ? (
              <div className="space-y-2 sm:space-y-3">
                {savedArticles.map((article) => (
                  <Link
                    key={article.id}
                    href={`/${article.categorySlug}/${article.slug}`}
                    className="group flex items-start justify-between rounded-xl border border-zinc-800 bg-zinc-900/50 p-3 sm:p-4 transition-all hover:border-zinc-700 hover:bg-zinc-900"
                  >
                    <div className="flex-1 min-w-0">
                      <span className="mb-1 inline-block rounded bg-[#8B0000]/20 px-1.5 sm:px-2 py-0.5 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-[#8B0000]">
                        {article.category}
                      </span>
                      <h3 className="font-semibold text-sm sm:text-base text-white transition-colors group-hover:text-[#FF0000] line-clamp-2">
                        {article.title}
                      </h3>
                    </div>
                    <span className="ml-3 sm:ml-4 text-[10px] sm:text-xs text-zinc-500 flex-shrink-0">{article.savedAt}</span>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 sm:p-8 text-center">
                <svg className="mx-auto mb-4 h-10 w-10 sm:h-12 sm:w-12 text-zinc-700" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
                </svg>
                <p className="text-zinc-500 text-sm">No saved articles yet</p>
              </div>
            )}
          </section>

          {/* Reading History */}
          <section>
            <div className="mb-4 sm:mb-6 flex items-center gap-3 sm:gap-4">
              <div className="h-6 sm:h-8 w-1 sm:w-1.5 rounded-full bg-gradient-to-b from-zinc-500 to-zinc-700" />
              <h2 className="text-lg sm:text-xl font-black uppercase tracking-tight text-white">
                Reading History
              </h2>
            </div>

            <div className="space-y-2 sm:space-y-3">
              {readingHistory.map((article) => (
                <Link
                  key={article.id}
                  href={`/${article.categorySlug}/${article.slug}`}
                  className="group flex items-start justify-between rounded-xl border border-zinc-800 bg-zinc-900/50 p-3 sm:p-4 transition-all hover:border-zinc-700 hover:bg-zinc-900"
                >
                  <div className="flex-1 min-w-0">
                    <span className="mb-1 inline-block text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                      {article.category}
                    </span>
                    <h3 className="font-semibold text-sm sm:text-base text-white transition-colors group-hover:text-[#FF0000] line-clamp-2">
                      {article.title}
                    </h3>
                  </div>
                  <span className="ml-3 sm:ml-4 text-[10px] sm:text-xs text-zinc-500 flex-shrink-0">{article.readAt}</span>
                </Link>
              ))}
            </div>

            <button className="mt-3 sm:mt-4 w-full rounded-xl bg-white/5 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold text-zinc-400 transition-colors hover:bg-white/10 hover:text-white">
              View Full History
            </button>
          </section>
        </div>
      </div>

      {/* Settings Section - Only visible to profile owner */}
      {isOwnProfile && (
        <section className="mx-auto max-w-6xl px-4 pb-12 sm:pb-16">
          <div className="mb-6 sm:mb-8 flex items-center gap-3 sm:gap-4">
            <div className="h-6 sm:h-8 w-1 sm:w-1.5 rounded-full bg-gradient-to-b from-purple-500 to-purple-700" />
            <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white">
              Settings
            </h2>
          </div>

          <div className="space-y-4">
            {/* Favorite Teams */}
            <CollapsibleSection
              title="Favorite Teams"
              description="Select your favorite Chicago teams for personalized content"
              icon={
                <svg className="h-5 w-5 text-[#C83803]" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                </svg>
              }
              iconBgColor="#C83803"
              isExpanded={expandedSections.favorites}
              onToggle={() => toggleSection('favorites')}
            >
              <FavoriteTeamsSelector
                initialTeams={settings.favoriteTeams}
                onChange={handleFavoriteTeamsChange}
                maxSelections={5}
              />
            </CollapsibleSection>

            {/* Notifications */}
            <CollapsibleSection
              title="Notifications"
              description="Choose what updates you receive"
              icon={
                <svg className="h-5 w-5 text-[#8B0000]" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                </svg>
              }
              iconBgColor="#8B0000"
              isExpanded={expandedSections.notifications}
              onToggle={() => toggleSection('notifications')}
            >
              <div className="space-y-4">
                <ToggleSetting
                  label="Breaking News Alerts"
                  description="Get notified about major breaking stories"
                  enabled={settings.breakingNews}
                  onChange={() => handleToggle('breakingNews')}
                />
                <ToggleSetting
                  label="Team Updates"
                  description="Updates about your favorite team"
                  enabled={settings.teamUpdates}
                  onChange={() => handleToggle('teamUpdates')}
                />
                <ToggleSetting
                  label="Weekly Digest"
                  description="Summary of the week's top stories"
                  enabled={settings.weeklyDigest}
                  onChange={() => handleToggle('weeklyDigest')}
                />
                <ToggleSetting
                  label="Prediction Results"
                  description="When SM Prophecy predictions are resolved"
                  enabled={settings.predictionResults}
                  onChange={() => handleToggle('predictionResults')}
                />
              </div>
            </CollapsibleSection>

            {/* Display */}
            <CollapsibleSection
              title="Display"
              description="Customize your viewing experience"
              icon={
                <svg className="h-5 w-5 text-purple-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" />
                </svg>
              }
              iconBgColor="#a855f7"
              isExpanded={expandedSections.display}
              onToggle={() => toggleSection('display')}
            >
              <div className="space-y-4">
                <ToggleSetting
                  label="Dark Mode"
                  description="Use dark theme throughout the site"
                  enabled={settings.darkMode}
                  onChange={() => handleToggle('darkMode')}
                />
                <ToggleSetting
                  label="Reduced Motion"
                  description="Minimize animations for accessibility"
                  enabled={settings.reducedMotion}
                  onChange={() => handleToggle('reducedMotion')}
                />
                <ToggleSetting
                  label="Compact Mode"
                  description="Denser layout with smaller elements"
                  enabled={settings.compactMode}
                  onChange={() => handleToggle('compactMode')}
                />
              </div>
            </CollapsibleSection>

            {/* Privacy */}
            <CollapsibleSection
              title="Privacy"
              description="Control your data and visibility"
              icon={
                <svg className="h-5 w-5 text-emerald-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                </svg>
              }
              iconBgColor="#10b981"
              isExpanded={expandedSections.privacy}
              onToggle={() => toggleSection('privacy')}
            >
              <div className="space-y-4">
                <ToggleSetting
                  label="Public Profile"
                  description="Allow others to see your profile"
                  enabled={settings.showProfile}
                  onChange={() => handleToggle('showProfile')}
                />
                <ToggleSetting
                  label="Activity Visibility"
                  description="Show your reading activity on profile"
                  enabled={settings.showActivity}
                  onChange={() => handleToggle('showActivity')}
                />
                <ToggleSetting
                  label="Analytics"
                  description="Help improve SM with anonymous usage data"
                  enabled={settings.allowAnalytics}
                  onChange={() => handleToggle('allowAnalytics')}
                />
              </div>
            </CollapsibleSection>

            {/* Connected Accounts */}
            <CollapsibleSection
              title="Connected Accounts"
              description="Manage your social login connections"
              icon={
                <svg className="h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
                </svg>
              }
              iconBgColor="#3b82f6"
              isExpanded={expandedSections.connections}
              onToggle={() => toggleSection('connections')}
            >
              <div className="space-y-6">
                <SocialConnectionsManager compact />

                <div className="border-t border-zinc-800 pt-6">
                  <DisqusConnection compact />
                </div>
              </div>
            </CollapsibleSection>

            {/* Account */}
            <CollapsibleSection
              title="Account"
              description="Manage your account settings"
              icon={
                <svg className="h-5 w-5 text-zinc-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
              }
              iconBgColor="#71717a"
              isExpanded={expandedSections.account}
              onToggle={() => toggleSection('account')}
            >
              <div className="space-y-3">
                <button className="flex w-full items-center justify-between rounded-xl bg-white/5 p-3 sm:p-4 text-left transition-colors hover:bg-white/10">
                  <div>
                    <p className="font-medium text-white text-sm sm:text-base">Change Password</p>
                    <p className="text-[10px] sm:text-xs text-zinc-500">Update your account password</p>
                  </div>
                  <svg className="h-5 w-5 text-zinc-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                </button>

                <button className="flex w-full items-center justify-between rounded-xl bg-white/5 p-3 sm:p-4 text-left transition-colors hover:bg-white/10">
                  <div>
                    <p className="font-medium text-white text-sm sm:text-base">Export Data</p>
                    <p className="text-[10px] sm:text-xs text-zinc-500">Download all your data</p>
                  </div>
                  <svg className="h-5 w-5 text-zinc-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                </button>

                <button className="flex w-full items-center justify-between rounded-xl bg-red-500/10 p-3 sm:p-4 text-left transition-colors hover:bg-red-500/20">
                  <div>
                    <p className="font-medium text-red-400 text-sm sm:text-base">Delete Account</p>
                    <p className="text-[10px] sm:text-xs text-red-400/60">Permanently delete your account and data</p>
                  </div>
                  <svg className="h-5 w-5 text-red-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                </button>
              </div>
            </CollapsibleSection>
          </div>
        </section>
      )}

      {/* Back link */}
      <div className="mx-auto max-w-6xl px-4 pb-12 sm:pb-16">
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

      {/* Disqus Prompt Modal - Shows when user hasn't connected Disqus */}
      <DisqusPromptModal />
    </div>
  )
}

// Collapsible section component
function CollapsibleSection({
  title,
  description,
  icon,
  iconBgColor,
  isExpanded,
  onToggle,
  children,
}: {
  title: string
  description: string
  icon: React.ReactNode
  iconBgColor: string
  isExpanded: boolean
  onToggle: () => void
  children: React.ReactNode
}) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 sm:p-6 hover:bg-zinc-800/30 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div
            className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl"
            style={{ backgroundColor: `${iconBgColor}20` }}
          >
            {icon}
          </div>
          <div className="text-left">
            <h3 className="font-bold text-white text-sm sm:text-base">{title}</h3>
            <p className="text-[10px] sm:text-xs text-zinc-500">{description}</p>
          </div>
        </div>
        <svg
          className={`h-5 w-5 text-zinc-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      {isExpanded && (
        <div className="px-4 pb-4 sm:px-6 sm:pb-6 border-t border-zinc-800">
          <div className="pt-4 sm:pt-6">
            {children}
          </div>
        </div>
      )}
    </div>
  )
}

// Toggle setting component
function ToggleSetting({
  label,
  description,
  enabled,
  onChange,
}: {
  label: string
  description: string
  enabled: boolean
  onChange: () => void
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="min-w-0">
        <p className="font-medium text-white text-sm sm:text-base">{label}</p>
        <p className="text-[10px] sm:text-xs text-zinc-500">{description}</p>
      </div>
      <button
        onClick={onChange}
        className={`relative h-6 w-11 rounded-full transition-colors flex-shrink-0 ${
          enabled ? 'bg-[#8B0000]' : 'bg-zinc-700'
        }`}
      >
        <span
          className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
            enabled ? 'translate-x-5' : ''
          }`}
        />
      </button>
    </div>
  )
}
