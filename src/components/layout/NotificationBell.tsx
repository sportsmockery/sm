'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'

interface Notification {
  id: string
  title: string
  message: string
  time: string
  read: boolean
  type: 'breaking' | 'update' | 'score' | 'article'
}

const sampleNotifications: Notification[] = [
  {
    id: '1',
    title: 'Breaking News',
    message: 'Bears sign key free agent to multi-year deal',
    time: '5 minutes ago',
    read: false,
    type: 'breaking',
  },
  {
    id: '2',
    title: 'Score Update',
    message: 'Bulls defeat Bucks 112-108',
    time: '1 hour ago',
    read: false,
    type: 'score',
  },
  {
    id: '3',
    title: 'New Article',
    message: 'Cubs trade rumors: Latest updates',
    time: '3 hours ago',
    read: true,
    type: 'article',
  },
]

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState(sampleNotifications)
  const menuRef = useRef<HTMLDivElement>(null)

  const unreadCount = notifications.filter(n => !n.read).length

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const markAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })))
  }

  const getTypeIcon = (type: Notification['type']) => {
    switch (type) {
      case 'breaking':
        return (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
            <svg className="h-4 w-4 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          </div>
        )
      case 'score':
        return (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
            <svg className="h-4 w-4 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 002.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 012.916.52 6.003 6.003 0 01-5.395 4.972m0 0a6.726 6.726 0 01-2.749 1.35m0 0a6.772 6.772 0 01-3.044 0" />
            </svg>
          </div>
        )
      default:
        return (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
            <svg className="h-4 w-4 text-zinc-600 dark:text-zinc-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
          </div>
        )
    }
  }

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex h-10 w-10 items-center justify-center rounded-lg text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-[#8B0000] dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-[#FF6666]"
        aria-label="Notifications"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      <div
        className={`
          absolute right-0 top-full z-50 mt-1 w-80 origin-top-right overflow-hidden rounded-xl
          border border-zinc-200 bg-white shadow-lg
          transition-all duration-200 dark:border-zinc-800 dark:bg-zinc-900
          ${isOpen ? 'visible scale-100 opacity-100' : 'invisible scale-95 opacity-0'}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
          <span className="font-semibold text-zinc-900 dark:text-white">Notifications</span>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="text-sm text-[#8B0000] hover:underline dark:text-[#FF6666]"
            >
              Mark all read
            </button>
          )}
        </div>

        {/* Notifications list */}
        <div className="max-h-80 overflow-y-auto">
          {notifications.length > 0 ? (
            notifications.map((notification) => (
              <Link
                key={notification.id}
                href="#"
                onClick={() => setIsOpen(false)}
                className={`flex gap-3 border-b border-zinc-100 px-4 py-3 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800/50 ${
                  !notification.read ? 'bg-red-50/50 dark:bg-red-900/10' : ''
                }`}
              >
                {getTypeIcon(notification.type)}
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-zinc-900 dark:text-white">
                    {notification.title}
                  </p>
                  <p className="truncate text-sm text-zinc-600 dark:text-zinc-400">
                    {notification.message}
                  </p>
                  <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-500">
                    {notification.time}
                  </p>
                </div>
                {!notification.read && (
                  <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-red-500" />
                )}
              </Link>
            ))
          ) : (
            <div className="px-4 py-8 text-center text-zinc-500">
              No notifications
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-zinc-200 p-2 dark:border-zinc-800">
          <Link
            href="/notifications"
            onClick={() => setIsOpen(false)}
            className="block rounded-lg px-3 py-2 text-center text-sm font-medium text-[#8B0000] transition-colors hover:bg-[#8B0000]/10 dark:text-[#FF6666] dark:hover:bg-[#FF6666]/10"
          >
            View All Notifications
          </Link>
        </div>
      </div>
    </div>
  )
}
