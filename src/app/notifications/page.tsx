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
  message?: {
    id: string
    content: string
    content_type: string
    created_at: string
    user?: {
      display_name: string
      avatar_url?: string
      badge?: string
    }
  }
  room?: {
    team_slug: string
    team_name: string
    team_color: string
  }
  from_user?: {
    display_name: string
    avatar_url?: string
    badge?: string
  }
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
        if (response.status === 401) {
          router.push('/login?redirect=/notifications')
          return
        }
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

  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  const markAsRead = async (notificationId: string) => {
    try {
      await fetch('/api/chat/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId }),
      })

      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (err) {
      console.error('Failed to mark as read:', err)
    }
  }

  const markAllAsRead = async () => {
    try {
      await fetch('/api/chat/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAllRead: true }),
      })

      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
      setUnreadCount(0)
    } catch (err) {
      console.error('Failed to mark all as read:', err)
    }
  }

  const handleNotificationClick = (notification: Notification) => {
    // Mark as read
    if (!notification.is_read) {
      markAsRead(notification.id)
    }

    // Navigate to chat with message highlight
    // Use the Bears chat page with highlight parameter
    // The chat page will scroll to and highlight the mentioned message
    const messageId = notification.message_id
    router.push(`/chat?highlight=${messageId}`)
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
    <div className="notifications-page">
      <div className="notifications-container">
        {/* Header */}
        <div className="notifications-header">
          <div className="notifications-header__left">
            <h1 className="notifications-title">Notifications</h1>
            {unreadCount > 0 && (
              <span className="notifications-badge">{unreadCount}</span>
            )}
          </div>
          <div className="notifications-header__actions">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="notifications-btn notifications-btn--text"
              >
                Mark all read
              </button>
            )}
          </div>
        </div>

        {/* Filter tabs */}
        <div className="notifications-tabs">
          <button
            className={`notifications-tab ${filter === 'all' ? 'notifications-tab--active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All
          </button>
          <button
            className={`notifications-tab ${filter === 'unread' ? 'notifications-tab--active' : ''}`}
            onClick={() => setFilter('unread')}
          >
            Unread {unreadCount > 0 && `(${unreadCount})`}
          </button>
        </div>

        {/* Content */}
        <div className="notifications-content">
          {loading ? (
            <div className="notifications-loading">
              <div className="notifications-spinner" />
              <span>Loading notifications...</span>
            </div>
          ) : error ? (
            <div className="notifications-error">
              <p>{error}</p>
              <button onClick={fetchNotifications} className="notifications-btn">
                Try again
              </button>
            </div>
          ) : notifications.length === 0 ? (
            <div className="notifications-empty">
              <svg className="notifications-empty__icon" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              <p className="notifications-empty__title">No notifications yet</p>
              <p className="notifications-empty__sub">
                When someone @mentions you in chat, you&apos;ll see it here.
              </p>
              <Link href="/fan-chat" className="notifications-btn notifications-btn--primary">
                Go to Fan Chat
              </Link>
            </div>
          ) : (
            <div className="notifications-list">
              {notifications.map((notification) => {
                const teamColors = TEAM_COLORS[notification.room?.team_slug || 'bears'] || TEAM_COLORS.bears
                const badgeStyle = getBadgeStyle(notification.from_user?.badge)

                return (
                  <button
                    key={notification.id}
                    className={`notification-item ${!notification.is_read ? 'notification-item--unread' : ''}`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    {/* Unread indicator */}
                    {!notification.is_read && (
                      <div className="notification-item__unread" style={{ background: teamColors.accent }} />
                    )}

                    {/* Avatar */}
                    <div className="notification-item__avatar">
                      {notification.from_user?.avatar_url ? (
                        <img src={notification.from_user.avatar_url} alt="" />
                      ) : (
                        <span>{notification.from_user?.display_name?.charAt(0).toUpperCase() || '?'}</span>
                      )}
                    </div>

                    {/* Content */}
                    <div className="notification-item__content">
                      <div className="notification-item__header">
                        <span className="notification-item__name">
                          {notification.from_user?.display_name || 'Someone'}
                        </span>
                        {badgeStyle && (
                          <span
                            className="notification-item__badge"
                            style={{ background: badgeStyle.bg, color: badgeStyle.color }}
                          >
                            {notification.from_user?.badge?.replace('_', ' ')}
                          </span>
                        )}
                        <span className="notification-item__action">mentioned you</span>
                      </div>
                      <p className="notification-item__preview">
                        {notification.content_preview || notification.message?.content || ''}
                      </p>
                      <div className="notification-item__meta">
                        <span
                          className="notification-item__team"
                          style={{ background: teamColors.primary }}
                        >
                          {notification.room?.team_name || 'Chat'}
                        </span>
                        <span className="notification-item__time">
                          {formatTime(notification.created_at)}
                        </span>
                      </div>
                    </div>

                    {/* Arrow */}
                    <svg className="notification-item__arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 18l6-6-6-6" />
                    </svg>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .notifications-page {
          min-height: 100vh;
          background: var(--bg-main, #0a0a0f);
          padding: 24px;
        }

        .notifications-container {
          max-width: 640px;
          margin: 0 auto;
        }

        .notifications-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 20px;
        }

        .notifications-header__left {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .notifications-title {
          font-size: 1.75rem;
          font-weight: 700;
          color: var(--text-main, #fff);
          margin: 0;
        }

        .notifications-badge {
          background: #ef4444;
          color: white;
          font-size: 0.75rem;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: 12px;
        }

        .notifications-btn {
          padding: 8px 16px;
          background: var(--bg-card, #1a1a2e);
          border: 1px solid var(--border-subtle, #333);
          border-radius: 8px;
          color: var(--text-main, #fff);
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.15s;
        }

        .notifications-btn:hover {
          background: var(--bg-hover, #252538);
        }

        .notifications-btn--primary {
          background: var(--accent, #3b82f6);
          border-color: var(--accent, #3b82f6);
        }

        .notifications-btn--primary:hover {
          background: var(--accent-hover, #2563eb);
        }

        .notifications-btn--text {
          background: transparent;
          border: none;
          color: var(--accent, #3b82f6);
        }

        .notifications-btn--text:hover {
          text-decoration: underline;
        }

        .notifications-tabs {
          display: flex;
          gap: 4px;
          padding: 4px;
          background: var(--bg-card, #1a1a2e);
          border-radius: 12px;
          margin-bottom: 16px;
        }

        .notifications-tab {
          flex: 1;
          padding: 10px 16px;
          background: transparent;
          border: none;
          border-radius: 8px;
          color: var(--text-subtle, #888);
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.15s;
        }

        .notifications-tab:hover {
          color: var(--text-main, #fff);
        }

        .notifications-tab--active {
          background: var(--bg-hover, #252538);
          color: var(--text-main, #fff);
        }

        .notifications-content {
          background: var(--bg-card, #1a1a2e);
          border: 1px solid var(--border-subtle, #333);
          border-radius: 16px;
          overflow: hidden;
        }

        .notifications-loading,
        .notifications-error,
        .notifications-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 12px;
          padding: 48px 24px;
          text-align: center;
        }

        .notifications-spinner {
          width: 32px;
          height: 32px;
          border: 3px solid var(--border-subtle, #333);
          border-top-color: var(--accent, #3b82f6);
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .notifications-empty__icon {
          color: var(--text-subtle, #888);
          opacity: 0.5;
        }

        .notifications-empty__title {
          font-size: 1.1rem;
          font-weight: 600;
          color: var(--text-main, #fff);
          margin: 0;
        }

        .notifications-empty__sub {
          font-size: 0.875rem;
          color: var(--text-subtle, #888);
          margin: 0;
        }

        .notifications-list {
          display: flex;
          flex-direction: column;
        }

        .notification-item {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 16px;
          background: transparent;
          border: none;
          border-bottom: 1px solid var(--border-subtle, #222);
          cursor: pointer;
          text-align: left;
          width: 100%;
          transition: background 0.15s;
          position: relative;
        }

        .notification-item:last-child {
          border-bottom: none;
        }

        .notification-item:hover {
          background: var(--bg-hover, #1f1f2f);
        }

        .notification-item--unread {
          background: rgba(59, 130, 246, 0.05);
        }

        .notification-item__unread {
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 3px;
        }

        .notification-item__avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: var(--accent, #3b82f6);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          flex-shrink: 0;
        }

        .notification-item__avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .notification-item__avatar span {
          color: white;
          font-weight: 600;
          font-size: 1rem;
        }

        .notification-item__content {
          flex: 1;
          min-width: 0;
        }

        .notification-item__header {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-wrap: wrap;
          margin-bottom: 4px;
        }

        .notification-item__name {
          font-weight: 600;
          color: var(--text-main, #fff);
        }

        .notification-item__badge {
          font-size: 0.6rem;
          font-weight: 600;
          padding: 2px 5px;
          border-radius: 4px;
          text-transform: uppercase;
        }

        .notification-item__action {
          color: var(--text-subtle, #888);
          font-size: 0.875rem;
        }

        .notification-item__preview {
          font-size: 0.875rem;
          color: var(--text-subtle, #aaa);
          margin: 0 0 8px 0;
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }

        .notification-item__meta {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .notification-item__team {
          font-size: 0.7rem;
          font-weight: 600;
          padding: 2px 8px;
          border-radius: 4px;
          color: white;
        }

        .notification-item__time {
          font-size: 0.75rem;
          color: var(--text-subtle, #888);
        }

        .notification-item__arrow {
          color: var(--text-subtle, #888);
          flex-shrink: 0;
          margin-top: 12px;
        }

        /* Light mode */
        @media (prefers-color-scheme: light) {
          .notifications-page {
            --bg-main: #f3f4f6;
            --bg-card: #fff;
            --bg-hover: #f9fafb;
            --border-subtle: #e5e7eb;
            --text-main: #111;
            --text-subtle: #666;
          }
        }

        @media (max-width: 640px) {
          .notifications-page {
            padding: 16px;
          }

          .notifications-title {
            font-size: 1.5rem;
          }

          .notification-item {
            padding: 14px 12px;
          }
        }
      `}</style>
    </div>
  )
}
