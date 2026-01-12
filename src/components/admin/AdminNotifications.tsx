'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'

export interface AdminNotification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info' | 'post' | 'comment' | 'user'
  title: string
  message: string
  timestamp: Date
  read: boolean
  link?: string
  actionLabel?: string
}

// Sample notifications for demo
const sampleNotifications: AdminNotification[] = [
  {
    id: '1',
    type: 'post',
    title: 'New Post Published',
    message: '"Bears Mock Draft 2026" is now live',
    timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 min ago
    read: false,
    link: '/admin/posts/1',
  },
  {
    id: '2',
    type: 'success',
    title: 'Backup Complete',
    message: 'Database backup finished successfully',
    timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 min ago
    read: false,
  },
  {
    id: '3',
    type: 'warning',
    title: 'Low Disk Space',
    message: 'Media storage is at 85% capacity',
    timestamp: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
    read: false,
    link: '/admin/media',
    actionLabel: 'View Media',
  },
  {
    id: '4',
    type: 'comment',
    title: 'New Comments',
    message: '12 new comments awaiting moderation',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    read: true,
  },
  {
    id: '5',
    type: 'user',
    title: 'New User Signup',
    message: 'john@example.com registered',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3), // 3 hours ago
    read: true,
    link: '/admin/users',
  },
  {
    id: '6',
    type: 'info',
    title: 'System Update',
    message: 'Next.js 16.2 is available',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    read: true,
  },
]

function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000)

  if (seconds < 60) return 'Just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`
  return date.toLocaleDateString()
}

function getNotificationIcon(type: AdminNotification['type']) {
  switch (type) {
    case 'success':
      return (
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500/10">
          <svg className="h-5 w-5 text-emerald-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      )
    case 'error':
      return (
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-red-500/10">
          <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
        </div>
      )
    case 'warning':
      return (
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-500/10">
          <svg className="h-5 w-5 text-amber-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
        </div>
      )
    case 'info':
      return (
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-500/10">
          <svg className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
          </svg>
        </div>
      )
    case 'post':
      return (
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-violet-500/10">
          <svg className="h-5 w-5 text-violet-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
          </svg>
        </div>
      )
    case 'comment':
      return (
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-cyan-500/10">
          <svg className="h-5 w-5 text-cyan-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
          </svg>
        </div>
      )
    case 'user':
      return (
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-pink-500/10">
          <svg className="h-5 w-5 text-pink-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
          </svg>
        </div>
      )
    default:
      return (
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--bg-tertiary)]">
          <svg className="h-5 w-5 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
          </svg>
        </div>
      )
  }
}

interface AdminNotificationsProps {
  className?: string
}

export default function AdminNotifications({ className }: AdminNotificationsProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState<AdminNotification[]>(sampleNotifications)
  const [filter, setFilter] = useState<'all' | 'unread'>('all')
  const dropdownRef = useRef<HTMLDivElement>(null)

  const unreadCount = notifications.filter(n => !n.read).length
  const filteredNotifications = filter === 'unread'
    ? notifications.filter(n => !n.read)
    : notifications

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Close on Escape
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') setIsOpen(false)
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [])

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    )
  }

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  const dismissNotification = (id: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const clearAll = () => {
    setNotifications([])
  }

  return (
    <div ref={dropdownRef} className={`relative ${className || ''}`}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex h-10 w-10 items-center justify-center rounded-lg text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--accent-red)] text-[10px] font-bold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 top-full z-50 mt-2 w-96 overflow-hidden rounded-xl border border-[var(--border-default)] bg-[var(--bg-card)] shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[var(--border-default)] bg-[var(--bg-tertiary)] px-4 py-3">
            <div className="flex items-center gap-3">
              <h3 className="font-semibold text-[var(--text-primary)]">Notifications</h3>
              {unreadCount > 0 && (
                <span className="rounded-full bg-[var(--accent-red)] px-2 py-0.5 text-xs font-medium text-white">
                  {unreadCount} new
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {/* Filter buttons */}
              <button
                onClick={() => setFilter('all')}
                className={`rounded-md px-2 py-1 text-xs font-medium transition-colors ${
                  filter === 'all'
                    ? 'bg-[var(--bg-hover)] text-[var(--text-primary)]'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('unread')}
                className={`rounded-md px-2 py-1 text-xs font-medium transition-colors ${
                  filter === 'unread'
                    ? 'bg-[var(--bg-hover)] text-[var(--text-primary)]'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                }`}
              >
                Unread
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {filteredNotifications.length > 0 ? (
              filteredNotifications.map((notification) => {
                const content = (
                  <div
                    className={`group relative flex gap-3 border-b border-[var(--border-subtle)] px-4 py-3 transition-colors hover:bg-[var(--bg-hover)] ${
                      !notification.read ? 'bg-[var(--accent-red)]/5' : ''
                    }`}
                    onClick={() => markAsRead(notification.id)}
                  >
                    {getNotificationIcon(notification.type)}

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-sm font-medium ${!notification.read ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}>
                          {notification.title}
                        </p>
                        <button
                          onClick={(e) => dismissNotification(notification.id, e)}
                          className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded opacity-0 transition-opacity hover:bg-[var(--bg-tertiary)] group-hover:opacity-100"
                          aria-label="Dismiss notification"
                        >
                          <svg className="h-3.5 w-3.5 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                      <p className="mt-0.5 text-sm text-[var(--text-muted)]">
                        {notification.message}
                      </p>
                      <div className="mt-1.5 flex items-center gap-2">
                        <span className="text-xs text-[var(--text-muted)]">
                          {formatTimeAgo(notification.timestamp)}
                        </span>
                        {notification.actionLabel && (
                          <>
                            <span className="text-[var(--text-muted)]">·</span>
                            <span className="text-xs font-medium text-[var(--accent-red)]">
                              {notification.actionLabel}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {!notification.read && (
                      <div className="absolute right-4 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-[var(--accent-red)]" />
                    )}
                  </div>
                )

                return notification.link ? (
                  <Link
                    key={notification.id}
                    href={notification.link}
                    onClick={() => {
                      markAsRead(notification.id)
                      setIsOpen(false)
                    }}
                    className="block"
                  >
                    {content}
                  </Link>
                ) : (
                  <div key={notification.id}>{content}</div>
                )
              })
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--bg-tertiary)]">
                  <svg className="h-6 w-6 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                  </svg>
                </div>
                <p className="mt-3 text-sm font-medium text-[var(--text-primary)]">
                  {filter === 'unread' ? 'No unread notifications' : 'No notifications'}
                </p>
                <p className="mt-1 text-xs text-[var(--text-muted)]">
                  {filter === 'unread' ? 'You\'re all caught up!' : 'You\'re all caught up!'}
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="flex items-center justify-between border-t border-[var(--border-default)] bg-[var(--bg-tertiary)] px-4 py-2">
              <button
                onClick={markAllAsRead}
                disabled={unreadCount === 0}
                className="text-xs font-medium text-[var(--accent-red)] transition-colors hover:text-[var(--accent-red-hover)] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Mark all as read
              </button>
              <button
                onClick={clearAll}
                className="text-xs font-medium text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)]"
              >
                Clear all
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
