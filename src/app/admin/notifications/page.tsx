'use client'

import { useState, useEffect } from 'react'

interface Article {
  id: number
  title: string
  slug: string
  featured_image: string | null
  category: {
    id: number
    name: string
    slug: string
  } | null
  published_at: string
}

interface NotificationHistory {
  id: number
  title: string
  body: string
  article_id: number | null
  article_title: string | null
  sent_at: string
  sent_by: string
  recipient_count: number | null
}

export default function NotificationsPage() {
  const [articles, setArticles] = useState<Article[]>([])
  const [history, setHistory] = useState<NotificationHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  // Form state
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null)
  const [showArticlePicker, setShowArticlePicker] = useState(false)

  useEffect(() => {
    fetchArticles()
    fetchHistory()
  }, [])

  async function fetchArticles(search = '') {
    try {
      const params = new URLSearchParams({
        status: 'published',
        limit: '20',
      })
      if (search) params.set('search', search)

      const res = await fetch(`/api/admin/posts?${params}`)
      const data = await res.json()
      setArticles(data.posts || [])
    } catch (err) {
      console.error('Error fetching articles:', err)
    } finally {
      setLoading(false)
    }
  }

  async function fetchHistory() {
    try {
      const res = await fetch('/api/admin/notifications/history')
      if (res.ok) {
        const data = await res.json()
        setHistory(data.notifications || [])
      }
    } catch (err) {
      console.error('Error fetching notification history:', err)
    }
  }

  async function handleSearchArticles(query: string) {
    setSearchQuery(query)
    if (query.length >= 2) {
      await fetchArticles(query)
    } else if (query.length === 0) {
      await fetchArticles()
    }
  }

  async function handleSend() {
    if (!title.trim() || !body.trim()) {
      setError('Title and message are required')
      return
    }

    setSending(true)
    setError(null)
    setSent(false)

    try {
      const res = await fetch('/api/admin/notifications/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          body: body.trim(),
          articleId: selectedArticle?.id || null,
          articleSlug: selectedArticle?.slug || null,
          categorySlug: selectedArticle?.category?.slug || null,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to send notification')
      }

      setSent(true)
      setTitle('')
      setBody('')
      setSelectedArticle(null)
      fetchHistory()

      setTimeout(() => setSent(false), 5000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send notification')
    } finally {
      setSending(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Push Notifications</h1>
        <p className="mt-1 text-[var(--text-muted)]">
          Send push notifications to all app users
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
        {/* Compose Form */}
        <div className="space-y-6">
          <div className="overflow-hidden rounded-xl border border-[var(--border-default)] bg-[var(--bg-card)]">
            <div className="border-b border-[var(--border-default)] bg-[var(--bg-tertiary)] px-6 py-4">
              <h2 className="font-semibold text-[var(--text-primary)]">Compose Notification</h2>
              <p className="mt-0.5 text-sm text-[var(--text-muted)]">
                Create and send a push notification to all app users
              </p>
            </div>

            <div className="space-y-5 p-6">
              {/* Title */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[var(--text-secondary)]">
                  Notification Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={65}
                  className="w-full rounded-lg border border-[var(--border-default)] bg-[var(--bg-tertiary)] px-4 py-2.5 text-[var(--text-primary)] placeholder-[var(--text-muted)] transition-colors focus:border-[var(--accent-red)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-red)]"
                  placeholder="Breaking News: ..."
                />
                <p className="mt-1.5 text-xs text-[var(--text-muted)]">
                  {title.length}/65 characters
                </p>
              </div>

              {/* Body */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[var(--text-secondary)]">
                  Message <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  rows={3}
                  maxLength={240}
                  className="w-full resize-none rounded-lg border border-[var(--border-default)] bg-[var(--bg-tertiary)] px-4 py-2.5 text-[var(--text-primary)] placeholder-[var(--text-muted)] transition-colors focus:border-[var(--accent-red)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-red)]"
                  placeholder="Tap to read the full story..."
                />
                <p className="mt-1.5 text-xs text-[var(--text-muted)]">
                  {body.length}/240 characters
                </p>
              </div>

              {/* Link to Article */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[var(--text-secondary)]">
                  Link to Article (optional)
                </label>
                {selectedArticle ? (
                  <div className="flex items-center gap-3 rounded-lg border border-[var(--border-default)] bg-[var(--bg-tertiary)] p-3">
                    {selectedArticle.featured_image && (
                      <img
                        src={selectedArticle.featured_image}
                        alt=""
                        className="h-12 w-16 rounded object-cover"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-[var(--text-primary)] truncate">
                        {selectedArticle.title}
                      </p>
                      <p className="text-xs text-[var(--text-muted)]">
                        {selectedArticle.category?.name || 'Uncategorized'}
                      </p>
                    </div>
                    <button
                      onClick={() => setSelectedArticle(null)}
                      className="rounded-lg p-1.5 text-[var(--text-muted)] hover:bg-[var(--bg-hover)] hover:text-red-500"
                    >
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowArticlePicker(true)}
                    className="w-full rounded-lg border border-dashed border-[var(--border-default)] bg-[var(--bg-tertiary)] px-4 py-4 text-[var(--text-muted)] transition-colors hover:border-[var(--accent-red)] hover:text-[var(--text-primary)]"
                  >
                    <svg className="mx-auto h-6 w-6 mb-2" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
                    </svg>
                    Click to select an article
                  </button>
                )}
                <p className="mt-1.5 text-xs text-[var(--text-muted)]">
                  When tapped, the notification will open this article in the app
                </p>
              </div>

              {/* Error */}
              {error && (
                <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-500">
                  {error}
                </div>
              )}

              {/* Success */}
              {sent && (
                <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-4 py-3 text-sm text-emerald-500 flex items-center gap-2">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  Notification sent successfully!
                </div>
              )}

              {/* Send Button */}
              <div className="flex justify-end pt-2">
                <button
                  onClick={handleSend}
                  disabled={sending || !title.trim() || !body.trim()}
                  className="inline-flex items-center gap-2 rounded-lg bg-[var(--accent-red)] px-6 py-2.5 font-medium text-white transition-all hover:bg-[var(--accent-red-hover)] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {sending ? (
                    <>
                      <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Sending...
                    </>
                  ) : (
                    <>
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                      </svg>
                      Send Notification
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Notification Preview */}
          <div className="overflow-hidden rounded-xl border border-[var(--border-default)] bg-[var(--bg-card)]">
            <div className="border-b border-[var(--border-default)] bg-[var(--bg-tertiary)] px-6 py-4">
              <h2 className="font-semibold text-[var(--text-primary)]">Preview</h2>
              <p className="mt-0.5 text-sm text-[var(--text-muted)]">How it will appear on mobile</p>
            </div>
            <div className="p-6">
              <div className="mx-auto max-w-sm">
                {/* iOS-style notification */}
                <div className="rounded-2xl bg-white p-4 shadow-lg">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#bc0000]">
                      <span className="text-lg font-bold text-white">SM</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-medium text-gray-500">SPORTS MOCKERY</p>
                        <p className="text-xs text-gray-400">now</p>
                      </div>
                      <p className="mt-0.5 font-semibold text-gray-900 line-clamp-1">
                        {title || 'Notification Title'}
                      </p>
                      <p className="mt-0.5 text-sm text-gray-600 line-clamp-2">
                        {body || 'Your notification message will appear here...'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Notifications */}
        <div className="overflow-hidden rounded-xl border border-[var(--border-default)] bg-[var(--bg-card)] h-fit">
          <div className="border-b border-[var(--border-default)] bg-[var(--bg-tertiary)] px-6 py-4">
            <h2 className="font-semibold text-[var(--text-primary)]">Recent Notifications</h2>
            <p className="mt-0.5 text-sm text-[var(--text-muted)]">Last 10 sent</p>
          </div>
          <div className="divide-y divide-[var(--border-default)]">
            {history.length === 0 ? (
              <div className="px-6 py-8 text-center text-[var(--text-muted)]">
                No notifications sent yet
              </div>
            ) : (
              history.map((notification) => (
                <div key={notification.id} className="px-6 py-4">
                  <p className="font-medium text-[var(--text-primary)] line-clamp-1">
                    {notification.title}
                  </p>
                  <p className="mt-1 text-sm text-[var(--text-secondary)] line-clamp-2">
                    {notification.body}
                  </p>
                  <div className="mt-2 flex items-center gap-3 text-xs text-[var(--text-muted)]">
                    <span>{formatDate(notification.sent_at)}</span>
                    {notification.article_title && (
                      <span className="truncate">
                        Linked: {notification.article_title}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Article Picker Modal */}
      {showArticlePicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowArticlePicker(false)}
          />
          <div className="relative w-full max-w-2xl max-h-[80vh] overflow-hidden rounded-xl border border-[var(--border-default)] bg-[var(--bg-card)] shadow-2xl">
            <div className="border-b border-[var(--border-default)] bg-[var(--bg-tertiary)] px-6 py-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-[var(--text-primary)]">Select Article</h3>
                <button
                  onClick={() => setShowArticlePicker(false)}
                  className="rounded-lg p-1.5 text-[var(--text-muted)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="mt-3">
                <input
                  type="search"
                  placeholder="Search articles..."
                  value={searchQuery}
                  onChange={(e) => handleSearchArticles(e.target.value)}
                  className="w-full rounded-lg border border-[var(--border-default)] bg-[var(--bg-card)] px-4 py-2.5 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:border-[var(--accent-red)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-red)]"
                />
              </div>
            </div>
            <div className="max-h-[60vh] overflow-y-auto divide-y divide-[var(--border-default)]">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--accent-red)] border-t-transparent" />
                </div>
              ) : articles.length === 0 ? (
                <div className="py-12 text-center text-[var(--text-muted)]">
                  No articles found
                </div>
              ) : (
                articles.map((article) => (
                  <button
                    key={article.id}
                    onClick={() => {
                      setSelectedArticle(article)
                      setShowArticlePicker(false)
                    }}
                    className="flex w-full items-center gap-4 px-6 py-4 text-left transition-colors hover:bg-[var(--bg-hover)]"
                  >
                    {article.featured_image ? (
                      <img
                        src={article.featured_image}
                        alt=""
                        className="h-14 w-20 rounded object-cover"
                      />
                    ) : (
                      <div className="h-14 w-20 rounded bg-[var(--bg-tertiary)] flex items-center justify-center">
                        <svg className="h-6 w-6 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                        </svg>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-[var(--text-primary)] line-clamp-2">
                        {article.title}
                      </p>
                      <div className="mt-1 flex items-center gap-2 text-xs text-[var(--text-muted)]">
                        <span>{article.category?.name || 'Uncategorized'}</span>
                        <span>-</span>
                        <span>{formatDate(article.published_at)}</span>
                      </div>
                    </div>
                    <svg className="h-5 w-5 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
