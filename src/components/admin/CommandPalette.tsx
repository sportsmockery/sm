'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { createPortal } from 'react-dom'

interface CommandItem {
  id: string
  title: string
  description?: string
  icon?: React.ReactNode
  shortcut?: string
  action: () => void
  category: 'navigation' | 'action' | 'recent'
}

const icons = {
  dashboard: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6z" />
    </svg>
  ),
  posts: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
  ),
  newPost: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  ),
  categories: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75" />
    </svg>
  ),
  authors: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0" />
    </svg>
  ),
  media: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909" />
    </svg>
  ),
  charts: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75z" />
    </svg>
  ),
  ai: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
    </svg>
  ),
  analytics: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 14.25v2.25m3-4.5v4.5m3-6.75v6.75m3-9v9M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z" />
    </svg>
  ),
  settings: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
    </svg>
  ),
  users: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
    </svg>
  ),
  site: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
    </svg>
  ),
}

export default function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const router = useRouter()

  const commands: CommandItem[] = useMemo(() => [
    // Actions
    {
      id: 'new-post',
      title: 'Create New Post',
      description: 'Start writing a new article',
      icon: icons.newPost,
      shortcut: '⌘N',
      category: 'action',
      action: () => router.push('/admin/posts/new'),
    },
    {
      id: 'new-chart',
      title: 'Create New Chart',
      description: 'Build a data visualization',
      icon: icons.charts,
      category: 'action',
      action: () => router.push('/admin/charts/new'),
    },
    {
      id: 'upload-media',
      title: 'Upload Media',
      description: 'Add images or files',
      icon: icons.media,
      category: 'action',
      action: () => router.push('/admin/media'),
    },
    // Navigation
    {
      id: 'nav-dashboard',
      title: 'Go to Dashboard',
      icon: icons.dashboard,
      category: 'navigation',
      action: () => router.push('/admin'),
    },
    {
      id: 'nav-posts',
      title: 'Go to Posts',
      icon: icons.posts,
      category: 'navigation',
      action: () => router.push('/admin/posts'),
    },
    {
      id: 'nav-categories',
      title: 'Go to Categories',
      icon: icons.categories,
      category: 'navigation',
      action: () => router.push('/admin/categories'),
    },
    {
      id: 'nav-authors',
      title: 'Go to Authors',
      icon: icons.authors,
      category: 'navigation',
      action: () => router.push('/admin/authors'),
    },
    {
      id: 'nav-media',
      title: 'Go to Media Library',
      icon: icons.media,
      category: 'navigation',
      action: () => router.push('/admin/media'),
    },
    {
      id: 'nav-charts',
      title: 'Go to Charts',
      icon: icons.charts,
      category: 'navigation',
      action: () => router.push('/admin/charts'),
    },
    {
      id: 'nav-ai',
      title: 'Go to AI Assistant',
      icon: icons.ai,
      category: 'navigation',
      action: () => router.push('/admin/ai'),
    },
    {
      id: 'nav-analytics',
      title: 'Go to Analytics',
      icon: icons.analytics,
      category: 'navigation',
      action: () => router.push('/admin/analytics'),
    },
    {
      id: 'nav-settings',
      title: 'Go to Settings',
      icon: icons.settings,
      category: 'navigation',
      action: () => router.push('/admin/settings'),
    },
    {
      id: 'nav-users',
      title: 'Go to Users',
      icon: icons.users,
      category: 'navigation',
      action: () => router.push('/admin/users'),
    },
    {
      id: 'view-site',
      title: 'View Site',
      description: 'Open the public site',
      icon: icons.site,
      category: 'action',
      action: () => window.open('/', '_blank'),
    },
  ], [router])

  const filteredCommands = useMemo(() => {
    if (!query) return commands
    const lowerQuery = query.toLowerCase()
    return commands.filter(
      (cmd) =>
        cmd.title.toLowerCase().includes(lowerQuery) ||
        cmd.description?.toLowerCase().includes(lowerQuery)
    )
  }, [commands, query])

  const groupedCommands = useMemo(() => {
    const groups: { [key: string]: CommandItem[] } = {
      action: [],
      navigation: [],
      recent: [],
    }
    filteredCommands.forEach((cmd) => {
      groups[cmd.category].push(cmd)
    })
    return groups
  }, [filteredCommands])

  // Keyboard shortcut to open
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsOpen((prev) => !prev)
      }
      if (e.key === 'Escape') {
        setIsOpen(false)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Navigation within palette
  const handleKeyNavigation = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex((prev) => (prev + 1) % filteredCommands.length)
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % filteredCommands.length)
      } else if (e.key === 'Enter') {
        e.preventDefault()
        const command = filteredCommands[selectedIndex]
        if (command) {
          command.action()
          setIsOpen(false)
          setQuery('')
        }
      }
    },
    [filteredCommands, selectedIndex]
  )

  // Reset selection when query changes
  useEffect(() => {
    setSelectedIndex(0)
  }, [query])

  const handleClose = () => {
    setIsOpen(false)
    setQuery('')
    setSelectedIndex(0)
  }

  if (!isOpen) return null

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="fixed left-1/2 top-[20%] z-50 w-full max-w-xl -translate-x-1/2 animate-in fade-in slide-in-from-top-4 duration-200">
        <div className="overflow-hidden rounded-xl border border-[var(--border-default)] bg-[var(--bg-secondary)] shadow-2xl">
          {/* Search Input */}
          <div className="flex items-center gap-3 border-b border-[var(--border-default)] px-4">
            <svg
              className="h-5 w-5 text-[var(--text-muted)]"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
              />
            </svg>
            <input
              type="text"
              placeholder="Search commands..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyNavigation}
              className="flex-1 bg-transparent py-4 text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none"
              autoFocus
            />
            <kbd className="hidden rounded bg-[var(--bg-tertiary)] px-2 py-1 text-xs text-[var(--text-muted)] sm:inline-block">
              ESC
            </kbd>
          </div>

          {/* Results */}
          <div className="max-h-80 overflow-y-auto p-2">
            {filteredCommands.length === 0 ? (
              <div className="py-8 text-center text-sm text-[var(--text-muted)]">
                No commands found
              </div>
            ) : (
              <>
                {/* Actions */}
                {groupedCommands.action.length > 0 && (
                  <div className="mb-2">
                    <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                      Actions
                    </p>
                    {groupedCommands.action.map((cmd, i) => {
                      const globalIndex = filteredCommands.indexOf(cmd)
                      return (
                        <CommandRow
                          key={cmd.id}
                          command={cmd}
                          isSelected={globalIndex === selectedIndex}
                          onSelect={() => {
                            cmd.action()
                            handleClose()
                          }}
                          onHover={() => setSelectedIndex(globalIndex)}
                        />
                      )
                    })}
                  </div>
                )}

                {/* Navigation */}
                {groupedCommands.navigation.length > 0 && (
                  <div className="mb-2">
                    <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                      Navigation
                    </p>
                    {groupedCommands.navigation.map((cmd) => {
                      const globalIndex = filteredCommands.indexOf(cmd)
                      return (
                        <CommandRow
                          key={cmd.id}
                          command={cmd}
                          isSelected={globalIndex === selectedIndex}
                          onSelect={() => {
                            cmd.action()
                            handleClose()
                          }}
                          onHover={() => setSelectedIndex(globalIndex)}
                        />
                      )
                    })}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between border-t border-[var(--border-default)] px-4 py-2 text-xs text-[var(--text-muted)]">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <kbd className="rounded bg-[var(--bg-tertiary)] px-1.5 py-0.5">↑↓</kbd>
                Navigate
              </span>
              <span className="flex items-center gap-1">
                <kbd className="rounded bg-[var(--bg-tertiary)] px-1.5 py-0.5">↵</kbd>
                Select
              </span>
            </div>
            <span className="flex items-center gap-1">
              <kbd className="rounded bg-[var(--bg-tertiary)] px-1.5 py-0.5">⌘K</kbd>
              to open
            </span>
          </div>
        </div>
      </div>
    </>,
    document.body
  )
}

function CommandRow({
  command,
  isSelected,
  onSelect,
  onHover,
}: {
  command: CommandItem
  isSelected: boolean
  onSelect: () => void
  onHover: () => void
}) {
  return (
    <button
      onClick={onSelect}
      onMouseEnter={onHover}
      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors ${
        isSelected
          ? 'bg-[var(--accent-red-glow)] text-[var(--accent-red)]'
          : 'text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'
      }`}
    >
      <div className={isSelected ? 'text-[var(--accent-red)]' : 'text-[var(--text-muted)]'}>
        {command.icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{command.title}</p>
        {command.description && (
          <p className="text-xs text-[var(--text-muted)] truncate">{command.description}</p>
        )}
      </div>
      {command.shortcut && (
        <kbd className="hidden rounded bg-[var(--bg-tertiary)] px-2 py-1 text-xs text-[var(--text-muted)] sm:inline-block">
          {command.shortcut}
        </kbd>
      )}
    </button>
  )
}

// Hook to trigger command palette from anywhere
export function useCommandPalette() {
  const [isOpen, setIsOpen] = useState(false)

  const open = useCallback(() => setIsOpen(true), [])
  const close = useCallback(() => setIsOpen(false), [])
  const toggle = useCallback(() => setIsOpen((prev) => !prev), [])

  return { isOpen, open, close, toggle }
}
