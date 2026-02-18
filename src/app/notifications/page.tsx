'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Notification {
  id: string
  type: string
  message_id: string
  room_id: string
  content_preview: string
  is_read: boolean
  created_at: string
  read_at?: string
  message?: { id: string; content: string; content_type: string; created_at: string; user?: { display_name: string; avatar_url?: string; badge?: string } }
  room?: { team_slug: string; team_name: string; team_color: string }
  from_user?: { display_name: string; avatar_url?: string; badge?: string }
}

const TEAM_COLORS: Record<string, { primary: string; accent: string }> = {
  bears: { primary: '#0B162A', accent: '#C83803' },
  cubs: { primary: '#0E3386', accent: '#CC3433' },
  bulls: { primary: '#CE1141', accent: '#000000' },
  'white-sox': { primary: '#27251F', accent: '#C4CED4' },
  blackhawks: { primary: '#CF0A2C', accent: '#000000' },
  fire: { primary: '#7B1113', accent: '#A0D3E8' },
  sky: { primary: '#5091CD', accent: '#FFC72C' },
}

export default function NotificationsPage() {
  const router = useRouter()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'unread'>('all')

  const fetchNotifications = useCallback(async () => {
    try {
      const params = new URLSearchParams()
      if (filter === 'unread') params.set('unread', 'true')
      params.set('limit', '50')
      const response = await fetch(`/api/chat/notifications?${params}`)
      const data = await response.json()
      if (data.error) {
        if (response.status === 401) { router.push('/login?redirect=/notifications'); return }
        throw new Error(data.error)
      }
      setNotifications(data.notifications)
      setUnreadCount(data.unreadCount)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load notifications')
    } finally {
      setLoading(false)
    }
  }, [filter, router])

  useEffect(() => { fetchNotifications() }, [fetchNotifications])

  const markAsRead = async (notificationId: string) => {
    try {
      await fetch('/api/chat/notifications', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ notificationId }) })
      setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n))
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (err) { console.error('Failed to mark as read:', err) }
  }

  const markAllAsRead = async () => {
    try {
      await fetch('/api/chat/notifications', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ markAllRead: true }) })
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
      setUnreadCount(0)
    } catch (err) { console.error('Failed to mark all as read:', err) }
  }

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.is_read) markAsRead(notification.id)
    router.push(`/chat?highlight=${notification.message_id}`)
  }

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr)
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

  const getBadgeStyle = (badge?: string) => {
    const styles: Record<string, { bg: string; color: string }> = {
      staff: { bg: '#7c3aed', color: 'white' },
      moderator: { bg: '#059669', color: 'white' },
      verified: { bg: '#3b82f6', color: 'white' },
      og_fan: { bg: '#f59e0b', color: '#111' },
      contributor: { bg: '#ec4899', color: 'white' },
    }
    return styles[badge || ''] || null
  }

  return (
    <div className="sm-hero-bg" style={{ minHeight: '100vh', padding: '24px' }}>
      <div className="sm-grid-overlay" />
      <div style={{ position: 'relative', maxWidth: '640px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <h1 style={{
              fontSize: '28px', fontWeight: 700, color: 'var(--sm-text)', margin: 0,
              fontFamily: "'Space Grotesk', var(--font-heading), sans-serif",
            }}>
              Notifications
            </h1>
            {unreadCount > 0 && (
              <span style={{ background: '#ef4444', color: '#fff', fontSize: '12px', fontWeight: 700, padding: '2px 8px', borderRadius: '12px' }}>
                {unreadCount}
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <button onClick={markAllAsRead} style={{ background: 'none', border: 'none', color: '#bc0000', fontSize: '14px', fontWeight: 500, cursor: 'pointer' }}>
              Mark all read
            </button>
          )}
        </div>

        {/* Filter tabs */}
        <div className="glass-card glass-card-static" style={{ display: 'flex', gap: '4px', padding: '4px', marginBottom: '16px' }}>
          {(['all', 'unread'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                flex: 1, padding: '10px 16px', borderRadius: 'var(--sm-radius-md)', border: 'none', cursor: 'pointer',
                fontSize: '14px', fontWeight: 500, transition: 'all 0.15s',
                background: filter === f ? 'var(--sm-surface)' : 'transparent',
                color: filter === f ? 'var(--sm-text)' : 'var(--sm-text-muted)',
              }}
            >
              {f === 'all' ? 'All' : `Unread${unreadCount > 0 ? ` (${unreadCount})` : ''}`}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="glass-card glass-card-static" style={{ padding: 0, overflow: 'hidden' }}>
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px', padding: '48px 24px' }}>
              <div style={{ width: 32, height: 32, border: '3px solid var(--sm-border)', borderTopColor: '#bc0000', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              <span style={{ color: 'var(--sm-text-muted)', fontSize: '14px' }}>Loading notifications...</span>
            </div>
          ) : error ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', padding: '48px 24px', textAlign: 'center' }}>
              <p style={{ color: 'var(--sm-text-muted)' }}>{error}</p>
              <button onClick={fetchNotifications} className="btn-secondary btn-sm">Try again</button>
            </div>
          ) : notifications.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', padding: '48px 24px', textAlign: 'center' }}>
              <svg style={{ width: 48, height: 48, color: 'var(--sm-text-muted)', opacity: 0.5 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              <p style={{ fontSize: '17px', fontWeight: 600, color: 'var(--sm-text)', margin: 0 }}>No notifications yet</p>
              <p style={{ fontSize: '14px', color: 'var(--sm-text-muted)', margin: 0 }}>
                When someone @mentions you in chat, you&apos;ll see it here.
              </p>
              <Link href="/fan-chat" className="btn-primary btn-sm" style={{ marginTop: '8px' }}>
                Go to Fan Chat
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {notifications.map((notification) => {
                const teamColors = TEAM_COLORS[notification.room?.team_slug || 'bears'] || TEAM_COLORS.bears
                const badgeStyle = getBadgeStyle(notification.from_user?.badge)

                return (
                  <button
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    style={{
                      display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '16px',
                      background: !notification.is_read ? 'rgba(188,0,0,0.03)' : 'transparent',
                      border: 'none', borderBottom: '1px solid var(--sm-border)', cursor: 'pointer',
                      textAlign: 'left', width: '100%', position: 'relative', transition: 'background 0.15s',
                    }}
                  >
                    {/* Unread indicator */}
                    {!notification.is_read && (
                      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, background: teamColors.accent }} />
                    )}

                    {/* Avatar */}
                    <div style={{
                      width: 40, height: 40, borderRadius: '50%', background: '#bc0000',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0,
                    }}>
                      {notification.from_user?.avatar_url ? (
                        <img src={notification.from_user.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <span style={{ color: '#fff', fontWeight: 600, fontSize: '16px' }}>
                          {notification.from_user?.display_name?.charAt(0).toUpperCase() || '?'}
                        </span>
                      )}
                    </div>

                    {/* Content */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginBottom: '4px' }}>
                        <span style={{ fontWeight: 600, color: 'var(--sm-text)', fontSize: '14px' }}>
                          {notification.from_user?.display_name || 'Someone'}
                        </span>
                        {badgeStyle && (
                          <span style={{ fontSize: '10px', fontWeight: 600, padding: '2px 5px', borderRadius: '4px', textTransform: 'uppercase', background: badgeStyle.bg, color: badgeStyle.color }}>
                            {notification.from_user?.badge?.replace('_', ' ')}
                          </span>
                        )}
                        <span style={{ color: 'var(--sm-text-muted)', fontSize: '14px' }}>mentioned you</span>
                      </div>
                      <p style={{
                        fontSize: '14px', color: 'var(--sm-text-muted)', margin: '0 0 8px',
                        overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box',
                        WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                      }}>
                        {notification.content_preview || notification.message?.content || ''}
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '4px', color: '#fff', background: teamColors.primary }}>
                          {notification.room?.team_name || 'Chat'}
                        </span>
                        <span style={{ fontSize: '12px', color: 'var(--sm-text-muted)' }}>
                          {formatTime(notification.created_at)}
                        </span>
                      </div>
                    </div>

                    <svg style={{ width: 16, height: 16, color: 'var(--sm-text-muted)', flexShrink: 0, marginTop: 12 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 18l6-6-6-6" />
                    </svg>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
