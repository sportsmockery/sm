'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useAuth } from '@/contexts/AuthContext'
import AchievementBadge from '@/components/AchievementBadge'
import { FavoriteTeamsSelector } from '@/components/personalization'
import { TeamSlug } from '@/lib/types'

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
  { id: '1', name: 'Early Adopter', description: 'Joined Sports Mockery in its first year', icon: 'star' as const, rarity: 'rare' as const, earned: true, earnedAt: 'Jan 2024' },
  { id: '2', name: 'Die Hard Fan', description: 'Read 100+ articles', icon: 'fire' as const, rarity: 'epic' as const, earned: true, earnedAt: 'Mar 2024' },
  { id: '3', name: 'Voice of the People', description: 'Cast 50 votes in Fan Senate', icon: 'trophy' as const, rarity: 'rare' as const, earned: false, progress: 94 },
  { id: '4', name: 'Streak Master', description: 'Visit for 30 consecutive days', icon: 'lightning' as const, rarity: 'legendary' as const, earned: false, progress: 40 },
  { id: '5', name: 'Commentator', description: 'Post your first comment', icon: 'medal' as const, rarity: 'common' as const, earned: true, earnedAt: 'Feb 2024' },
  { id: '6', name: 'True Fan', description: 'Complete your fan profile', icon: 'heart' as const, rarity: 'common' as const, earned: true, earnedAt: 'Jan 2024' },
]

const savedArticles = [
  { id: '1', title: 'Bears Trade Deadline: What to Expect', category: 'Bears', categorySlug: 'bears', slug: 'bears-trade-deadline-expectations', savedAt: '2 days ago' },
  { id: '2', title: 'Bulls Rotation Changes Making Impact', category: 'Bulls', categorySlug: 'bulls', slug: 'bulls-rotation-changes-impact', savedAt: '5 days ago' },
  { id: '3', title: 'Cubs Pitching Staff Analysis', category: 'Cubs', categorySlug: 'cubs', slug: 'cubs-pitching-analysis', savedAt: '1 week ago' },
]

const readingHistory = [
  { id: '1', title: 'Breaking: Bears Sign Free Agent', category: 'Bears', categorySlug: 'bears', slug: 'bears-free-agent-signing', readAt: 'Today' },
  { id: '2', title: 'Bulls vs Celtics Recap', category: 'Bulls', categorySlug: 'bulls', slug: 'bulls-celtics-recap', readAt: 'Yesterday' },
  { id: '3', title: 'Cubs Spring Training Preview', category: 'Cubs', categorySlug: 'cubs', slug: 'cubs-spring-training', readAt: '2 days ago' },
  { id: '4', title: 'White Sox Rebuild Update', category: 'White Sox', categorySlug: 'white-sox', slug: 'white-sox-rebuild-update', readAt: '3 days ago' },
]

export default function ProfilePage() {
  const { user, loading, isAuthenticated, refreshUser } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [isEditingName, setIsEditingName] = useState(false)
  const [editedName, setEditedName] = useState('')
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [isSavingName, setIsSavingName] = useState(false)
  const [isSavingAvatar, setIsSavingAvatar] = useState(false)

  const [settings, setSettings] = useState({
    breakingNews: true, teamUpdates: true, weeklyDigest: false, predictionResults: true,
    darkMode: true, reducedMotion: false, compactMode: false,
    showProfile: true, showActivity: false, allowAnalytics: true,
    favoriteTeams: ['bears'] as TeamSlug[],
  })

  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    favorites: true, notifications: false, display: false, privacy: false, account: false,
  })

  useEffect(() => {
    if (user?.name) setEditedName(user.name)
  }, [user?.name])

  const handleToggle = (key: keyof typeof settings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const handleFavoriteTeamsChange = (teams: TeamSlug[]) => {
    setSettings(prev => ({ ...prev, favoriteTeams: teams }))
  }

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }))
  }

  const handleAvatarClick = () => { fileInputRef.current?.click() }

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { alert('Image must be less than 5MB'); return }

    const reader = new FileReader()
    reader.onloadend = () => { setAvatarPreview(reader.result as string) }
    reader.readAsDataURL(file)

    setIsSavingAvatar(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const response = await fetch('/api/user/avatar', { method: 'POST', body: formData })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Failed to upload avatar')
      setAvatarPreview(data.avatarUrl)
      await refreshUser()
    } catch (error) {
      console.error('Avatar upload failed:', error)
      alert(error instanceof Error ? error.message : 'Failed to upload avatar')
      setAvatarPreview(null)
    } finally {
      setIsSavingAvatar(false)
    }
  }

  const handleNameEdit = () => { setIsEditingName(true) }

  const handleNameSave = async () => {
    if (!editedName.trim()) return
    setIsSavingName(true)
    setTimeout(() => { setIsSavingName(false); setIsEditingName(false) }, 1000)
  }

  const handleNameCancel = () => { setEditedName(user?.name || ''); setIsEditingName(false) }

  const earnedCount = achievements.filter(a => a.earned).length
  const displayName = user?.name || 'Sports Fan'
  const displayAvatar = avatarPreview || user?.avatar
  const isOwnProfile = isAuthenticated

  if (loading) {
    return (
      <div className="sm-hero-bg" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 48, height: 48, border: '3px solid var(--sm-border)', borderTopColor: '#bc0000', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      </div>
    )
  }

  return (
    <div className="sm-hero-bg" style={{ minHeight: '100vh' }}>
      <div className="sm-grid-overlay" />

      {/* Profile Header */}
      <section style={{ position: 'relative', padding: '32px 0 40px', borderBottom: '1px solid var(--sm-border)' }}>
        <div style={{ position: 'relative', maxWidth: '1200px', margin: '0 auto', padding: '0 16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            {/* Avatar */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={handleAvatarClick}
                style={{ position: 'relative', display: 'block', border: 'none', background: 'none', cursor: 'pointer', borderRadius: '50%' }}
                aria-label="Change profile picture"
              >
                {displayAvatar ? (
                  <Image
                    src={displayAvatar}
                    alt={displayName}
                    width={80}
                    height={80}
                    style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover', boxShadow: '0 0 0 4px rgba(188,0,0,0.3)' }}
                    unoptimized
                  />
                ) : (
                  <div style={{
                    width: 80, height: 80, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'linear-gradient(135deg, #bc0000, #ff4444)', color: '#fff', fontSize: '32px', fontWeight: 700,
                    boxShadow: '0 0 0 4px rgba(188,0,0,0.3)',
                  }}>
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                )}
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarChange} style={{ display: 'none' }} />
              <div style={{
                position: 'absolute', bottom: -4, right: -4, width: 32, height: 32, borderRadius: '50%',
                background: 'linear-gradient(135deg, #f59e0b, #f97316)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '12px', fontWeight: 700, color: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
              }}>
                {mockStats.streak}
              </div>
            </div>

            {/* Info */}
            <div style={{ textAlign: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '4px' }}>
                {isEditingName ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
                    <input
                      type="text"
                      value={editedName}
                      onChange={(e) => setEditedName(e.target.value)}
                      className="sm-input"
                      style={{ maxWidth: 200, padding: '8px 12px', fontSize: '18px' }}
                      autoFocus
                    />
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button onClick={handleNameSave} disabled={isSavingName} style={{ padding: '6px', borderRadius: '8px', background: 'rgba(16,185,129,0.2)', color: '#10b981', border: 'none', cursor: 'pointer' }}>
                        <svg style={{ width: 20, height: 20 }} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                      </button>
                      <button onClick={handleNameCancel} style={{ padding: '6px', borderRadius: '8px', background: 'rgba(239,68,68,0.2)', color: '#ef4444', border: 'none', cursor: 'pointer' }}>
                        <svg style={{ width: 20, height: 20 }} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <h1 style={{
                      fontSize: '28px', fontWeight: 900, color: 'var(--sm-text)',
                      fontFamily: "Barlow, var(--font-heading), sans-serif",
                    }}>
                      {displayName}
                    </h1>
                    {isOwnProfile && (
                      <button onClick={handleNameEdit} style={{ padding: '6px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', color: 'var(--sm-text-muted)', border: 'none', cursor: 'pointer' }} aria-label="Edit username">
                        <svg style={{ width: 16, height: 16 }} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                        </svg>
                      </button>
                    )}
                  </>
                )}
              </div>
              <p style={{ fontSize: '14px', color: 'var(--sm-text-muted)', marginBottom: '12px' }}>
                Member since {formatMemberSince(user?.createdAt)}
              </p>
              <span className="sm-tag">{mockStats.favoriteTeam} Fan</span>
            </div>

            {/* Stats row */}
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '24px', marginTop: '8px' }}>
              {[
                { value: mockStats.articlesRead, label: 'Articles Read' },
                { value: mockStats.commentsPosted, label: 'Comments' },
                { value: mockStats.votescast, label: 'Votes Cast' },
              ].map(s => (
                <div key={s.label} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '24px', fontWeight: 900, color: 'var(--sm-text)' }}>{s.value}</div>
                  <div style={{ fontSize: '11px', color: 'var(--sm-text-muted)' }}>{s.label}</div>
                </div>
              ))}
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: 900, color: '#f59e0b' }}>{mockStats.streak} days</div>
                <div style={{ fontSize: '11px', color: 'var(--sm-text-muted)' }}>Current Streak</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Achievements */}
      <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <h2 style={{
            fontSize: '22px', fontWeight: 900, letterSpacing: '-0.5px', textTransform: 'uppercase', color: 'var(--sm-text)',
            fontFamily: "Barlow, var(--font-heading), sans-serif",
          }}>
            Achievements
          </h2>
          <span className="sm-tag">{earnedCount}/{achievements.length} Earned</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '16px' }}>
          {achievements.map((achievement) => (
            <div key={achievement.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              <AchievementBadge achievement={achievement} size="lg" showProgress />
              <span style={{ fontSize: '11px', fontWeight: 500, textAlign: 'center', color: achievement.earned ? 'var(--sm-text)' : 'var(--sm-text-dim)' }}>
                {achievement.name}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Two column layout */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 16px 40px' }}>
        <div style={{ display: 'grid', gap: '32px', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))' }}>
          {/* Saved Articles */}
          <section>
            <h2 style={{
              fontSize: '20px', fontWeight: 900, letterSpacing: '-0.5px', textTransform: 'uppercase',
              color: 'var(--sm-text)', marginBottom: '16px',
              fontFamily: "Barlow, var(--font-heading), sans-serif",
            }}>
              Saved Articles
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {savedArticles.map((article) => (
                <Link
                  key={article.id}
                  href={`/${article.categorySlug}/${article.slug}`}
                  className="glass-card glass-card-sm"
                  style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '16px', textDecoration: 'none' }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <span className="sm-tag" style={{ fontSize: '10px', marginBottom: '4px' }}>{article.category}</span>
                    <h3 style={{ fontWeight: 600, fontSize: '14px', color: 'var(--sm-text)', lineHeight: 1.4 }}>{article.title}</h3>
                  </div>
                  <span style={{ marginLeft: '16px', fontSize: '11px', color: 'var(--sm-text-muted)', flexShrink: 0 }}>{article.savedAt}</span>
                </Link>
              ))}
            </div>
          </section>

          {/* Reading History */}
          <section>
            <h2 style={{
              fontSize: '20px', fontWeight: 900, letterSpacing: '-0.5px', textTransform: 'uppercase',
              color: 'var(--sm-text)', marginBottom: '16px',
              fontFamily: "Barlow, var(--font-heading), sans-serif",
            }}>
              Reading History
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {readingHistory.map((article) => (
                <Link
                  key={article.id}
                  href={`/${article.categorySlug}/${article.slug}`}
                  className="glass-card glass-card-sm"
                  style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '16px', textDecoration: 'none' }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--sm-text-muted)' }}>{article.category}</span>
                    <h3 style={{ fontWeight: 600, fontSize: '14px', color: 'var(--sm-text)', lineHeight: 1.4 }}>{article.title}</h3>
                  </div>
                  <span style={{ marginLeft: '16px', fontSize: '11px', color: 'var(--sm-text-muted)', flexShrink: 0 }}>{article.readAt}</span>
                </Link>
              ))}
            </div>
            <button className="btn-secondary btn-full" style={{ marginTop: '12px' }}>
              View Full History
            </button>
          </section>
        </div>
      </div>

      {/* Settings Section */}
      {isOwnProfile && (
        <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 16px 64px' }}>
          <h2 style={{
            fontSize: '22px', fontWeight: 900, letterSpacing: '-0.5px', textTransform: 'uppercase',
            color: 'var(--sm-text)', marginBottom: '24px',
            fontFamily: "Barlow, var(--font-heading), sans-serif",
          }}>
            Settings
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <CollapsibleSection title="Favorite Teams" description="Select your favorite Chicago teams" iconBgColor="#C83803" isExpanded={expandedSections.favorites} onToggle={() => toggleSection('favorites')}>
              <FavoriteTeamsSelector initialTeams={settings.favoriteTeams} onChange={handleFavoriteTeamsChange} maxSelections={5} />
            </CollapsibleSection>

            <CollapsibleSection title="Notifications" description="Choose what updates you receive" iconBgColor="#bc0000" isExpanded={expandedSections.notifications} onToggle={() => toggleSection('notifications')}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <ToggleSetting label="Breaking News Alerts" description="Get notified about major breaking stories" enabled={settings.breakingNews} onChange={() => handleToggle('breakingNews')} />
                <ToggleSetting label="Team Updates" description="Updates about your favorite team" enabled={settings.teamUpdates} onChange={() => handleToggle('teamUpdates')} />
                <ToggleSetting label="Weekly Digest" description="Summary of the week's top stories" enabled={settings.weeklyDigest} onChange={() => handleToggle('weeklyDigest')} />
                <ToggleSetting label="Prediction Results" description="When SM Prophecy predictions are resolved" enabled={settings.predictionResults} onChange={() => handleToggle('predictionResults')} />
              </div>
            </CollapsibleSection>

            <CollapsibleSection title="Display" description="Customize your viewing experience" iconBgColor="#a855f7" isExpanded={expandedSections.display} onToggle={() => toggleSection('display')}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <ToggleSetting label="Dark Mode" description="Use dark theme throughout the site" enabled={settings.darkMode} onChange={() => handleToggle('darkMode')} />
                <ToggleSetting label="Reduced Motion" description="Minimize animations for accessibility" enabled={settings.reducedMotion} onChange={() => handleToggle('reducedMotion')} />
                <ToggleSetting label="Compact Mode" description="Denser layout with smaller elements" enabled={settings.compactMode} onChange={() => handleToggle('compactMode')} />
              </div>
            </CollapsibleSection>

            <CollapsibleSection title="Privacy" description="Control your data and visibility" iconBgColor="#10b981" isExpanded={expandedSections.privacy} onToggle={() => toggleSection('privacy')}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <ToggleSetting label="Public Profile" description="Allow others to see your profile" enabled={settings.showProfile} onChange={() => handleToggle('showProfile')} />
                <ToggleSetting label="Activity Visibility" description="Show your reading activity on profile" enabled={settings.showActivity} onChange={() => handleToggle('showActivity')} />
                <ToggleSetting label="Analytics" description="Help improve SM with anonymous usage data" enabled={settings.allowAnalytics} onChange={() => handleToggle('allowAnalytics')} />
              </div>
            </CollapsibleSection>

            <CollapsibleSection title="Account" description="Manage your account settings" iconBgColor="#71717a" isExpanded={expandedSections.account} onToggle={() => toggleSection('account')}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <button className="glass-card glass-card-sm" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', border: 'none', cursor: 'pointer', textAlign: 'left', width: '100%' }}>
                  <div>
                    <p style={{ fontWeight: 500, fontSize: '14px', color: 'var(--sm-text)' }}>Change Password</p>
                    <p style={{ fontSize: '12px', color: 'var(--sm-text-muted)' }}>Update your account password</p>
                  </div>
                  <svg style={{ width: 20, height: 20, color: 'var(--sm-text-muted)', flexShrink: 0 }} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                </button>

                <button className="glass-card glass-card-sm" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', border: 'none', cursor: 'pointer', textAlign: 'left', width: '100%' }}>
                  <div>
                    <p style={{ fontWeight: 500, fontSize: '14px', color: 'var(--sm-text)' }}>Export Data</p>
                    <p style={{ fontSize: '12px', color: 'var(--sm-text-muted)' }}>Download all your data</p>
                  </div>
                  <svg style={{ width: 20, height: 20, color: 'var(--sm-text-muted)', flexShrink: 0 }} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                </button>

                <button style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px',
                  borderRadius: 'var(--sm-radius-md)', border: 'none', cursor: 'pointer', textAlign: 'left', width: '100%',
                  background: 'rgba(239,68,68,0.1)',
                }}>
                  <div>
                    <p style={{ fontWeight: 500, fontSize: '14px', color: '#ef4444' }}>Delete Account</p>
                    <p style={{ fontSize: '12px', color: 'rgba(239,68,68,0.6)' }}>Permanently delete your account and data</p>
                  </div>
                  <svg style={{ width: 20, height: 20, color: '#ef4444', flexShrink: 0 }} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                </button>
              </div>
            </CollapsibleSection>
          </div>
        </section>
      )}

      {/* Back link */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 16px 64px', position: 'relative' }}>
        <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: 'var(--sm-text-muted)', textDecoration: 'none' }}>
          <svg style={{ width: 16, height: 16 }} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Back to Home
        </Link>
      </div>
    </div>
  )
}

function CollapsibleSection({ title, description, iconBgColor, isExpanded, onToggle, children }: {
  title: string; description: string; iconBgColor: string; isExpanded: boolean; onToggle: () => void; children: React.ReactNode;
}) {
  return (
    <div className="glass-card glass-card-static" style={{ padding: 0, overflow: 'hidden' }}>
      <button onClick={onToggle} style={{
        width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '20px 24px', background: 'transparent', border: 'none', cursor: 'pointer',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: 40, height: 40, borderRadius: 'var(--sm-radius-md)', background: `${iconBgColor}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: 20, height: 20, borderRadius: '50%', background: iconBgColor }} />
          </div>
          <div style={{ textAlign: 'left' }}>
            <h3 style={{ fontWeight: 700, fontSize: '15px', color: 'var(--sm-text)' }}>{title}</h3>
            <p style={{ fontSize: '12px', color: 'var(--sm-text-muted)' }}>{description}</p>
          </div>
        </div>
        <svg style={{ width: 20, height: 20, color: 'var(--sm-text-muted)', transform: isExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>
      {isExpanded && (
        <div style={{ padding: '0 24px 24px', borderTop: '1px solid var(--sm-border)' }}>
          <div style={{ paddingTop: '20px' }}>{children}</div>
        </div>
      )}
    </div>
  )
}

function ToggleSetting({ label, description, enabled, onChange }: { label: string; description: string; enabled: boolean; onChange: () => void; }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
      <div style={{ minWidth: 0 }}>
        <p style={{ fontWeight: 500, fontSize: '14px', color: 'var(--sm-text)' }}>{label}</p>
        <p style={{ fontSize: '12px', color: 'var(--sm-text-muted)' }}>{description}</p>
      </div>
      <button
        onClick={onChange}
        style={{
          position: 'relative', width: 44, height: 24, borderRadius: '9999px', border: 'none', cursor: 'pointer', flexShrink: 0,
          background: enabled ? '#bc0000' : 'var(--sm-surface)', transition: 'background 0.2s',
        }}
      >
        <span style={{
          position: 'absolute', top: 2, left: enabled ? 22 : 2, width: 20, height: 20, borderRadius: '50%',
          background: '#fff', transition: 'left 0.2s',
        }} />
      </button>
    </div>
  )
}
