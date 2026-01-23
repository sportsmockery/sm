'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import RichTextEditor from '@/components/admin/PostEditor/RichTextEditor'
import { CategorySelect, AuthorSelect } from '@/components/admin/PostEditor/SearchableSelect'

interface Category {
  id: string
  name: string
}

interface Author {
  id: string
  display_name: string
}

interface StudioPostEditorProps {
  post?: {
    id?: string
    title: string
    slug: string
    content: string
    excerpt: string | null
    featured_image: string | null
    status: string
    category_id: string | null
    author_id: string | null
    seo_title: string | null
    seo_description: string | null
    seo_keywords?: string | null
    scheduled_at?: string | null
  }
  categories: Category[]
  authors: Author[]
  currentUserId?: string
}

export default function StudioPostEditor({
  post,
  categories,
  authors,
  currentUserId,
}: StudioPostEditorProps) {
  const router = useRouter()
  const isEditing = !!post?.id
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true)
  const [seoExpanded, setSeoExpanded] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)

  const [formData, setFormData] = useState({
    title: post?.title || '',
    slug: post?.slug || '',
    content: post?.content || '',
    excerpt: post?.excerpt || '',
    featured_image: post?.featured_image || '',
    status: post?.status || 'draft',
    category_id: post?.category_id || '',
    author_id: post?.author_id || currentUserId || '',
    seo_title: post?.seo_title || '',
    seo_description: post?.seo_description || '',
    seo_keywords: post?.seo_keywords || '',
    scheduled_at: post?.scheduled_at || null,
  })

  // Auto-generate slug from title
  useEffect(() => {
    if (!isEditing && formData.title && !formData.slug) {
      const slug = formData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
      setFormData(prev => ({ ...prev, slug }))
    }
  }, [formData.title, formData.slug, isEditing])

  const wordCount = formData.content.replace(/<[^>]*>/g, ' ').split(/\s+/).filter(w => w).length

  const categoryOptions = categories.map((cat) => ({
    value: cat.id,
    label: cat.name,
  }))

  const authorOptions = authors.map((author) => ({
    value: author.id,
    label: author.display_name,
  }))

  const updateField = useCallback((field: string, value: string | null) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }, [])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingImage(true)
    try {
      const formDataUpload = new FormData()
      formDataUpload.append('file', file)

      const response = await fetch('/api/admin/media', {
        method: 'POST',
        body: formDataUpload,
      })

      if (response.ok) {
        const data = await response.json()
        updateField('featured_image', data.url)
      }
    } catch (err) {
      console.error('Upload error:', err)
    } finally {
      setUploadingImage(false)
    }
  }

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      setError('Title is required')
      return
    }

    setSaving(true)
    setError('')

    try {
      const endpoint = isEditing ? `/api/posts/${post?.id}` : '/api/admin/posts'

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          category_id: formData.category_id || null,
          author_id: formData.author_id || null,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to save post')
      }

      const data = await response.json()
      router.push(`/studio/posts`)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setSaving(false)
    }
  }

  // Keyboard shortcut for save
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault()
        handleSubmit()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [formData])

  return (
    <div className="fixed inset-0 flex flex-col bg-[var(--bg-primary)]">
      {/* Header - below red line from layout */}
      <header className="flex-shrink-0 flex h-12 items-center justify-between border-b border-[var(--border-default)] bg-[var(--bg-secondary)] px-4">
        <div className="flex items-center gap-3">
          <Link
            href="/studio/posts"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--text-muted)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] transition-colors"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
          </Link>
          <nav className="flex items-center gap-1 text-sm text-[var(--text-muted)]">
            <span>Studio</span>
            <span>/</span>
            <span>Posts</span>
            <span>/</span>
            <span className="text-[var(--text-primary)]">{isEditing ? 'Edit' : 'New'}</span>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-[var(--text-muted)]">{wordCount} words</span>

          <select
            value={formData.status}
            onChange={(e) => updateField('status', e.target.value)}
            className="h-8 rounded-lg border border-[var(--border-default)] bg-[var(--bg-tertiary)] px-2 text-sm text-[var(--text-primary)] focus:border-[var(--accent-red)] focus:outline-none"
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="scheduled">Scheduled</option>
          </select>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving}
            className="inline-flex h-8 items-center gap-2 rounded-lg px-4 text-sm font-medium transition-colors bg-[#bc0000] text-white dark:bg-white dark:text-[#bc0000] disabled:opacity-50"
          >
            {saving ? 'Saving...' : isEditing ? 'Update' : 'Publish'}
          </button>
        </div>
      </header>

      {/* Main Content Area - fills remaining space */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - collapsible */}
        <aside
          className={`flex-shrink-0 border-r border-[var(--border-default)] bg-[var(--bg-secondary)] transition-all duration-300 overflow-y-auto ${
            sidebarCollapsed ? 'w-0' : 'w-64'
          }`}
        >
          {!sidebarCollapsed && (
            <div className="p-4 space-y-4">
              {/* Status */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-[var(--text-muted)]">Status</label>
                <div className="grid grid-cols-3 gap-1">
                  {['draft', 'published', 'scheduled'].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => updateField('status', s)}
                      className={`rounded-lg border px-2 py-1.5 text-xs font-medium transition-all ${
                        formData.status === s
                          ? 'border-[var(--accent-red)] bg-[var(--accent-red-muted)] text-[var(--accent-red)]'
                          : 'border-[var(--border-default)] text-[var(--text-secondary)] hover:border-[var(--text-muted)]'
                      }`}
                    >
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Schedule */}
              {formData.status === 'scheduled' && (
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-[var(--text-muted)]">Schedule Date</label>
                  <input
                    type="datetime-local"
                    value={formData.scheduled_at || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, scheduled_at: e.target.value || null }))}
                    className="w-full rounded-lg border border-[var(--border-default)] bg-[var(--bg-tertiary)] px-3 py-2 text-sm text-[var(--text-primary)] focus:border-[var(--accent-red)] focus:outline-none"
                  />
                </div>
              )}

              {/* Author */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-[var(--text-muted)]">Author</label>
                <AuthorSelect
                  options={authorOptions}
                  value={formData.author_id}
                  onChange={(value) => updateField('author_id', value)}
                  placeholder="Select author..."
                />
              </div>

              {/* Category */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-[var(--text-muted)]">Category</label>
                <CategorySelect
                  options={categoryOptions}
                  value={formData.category_id}
                  onChange={(value) => updateField('category_id', value)}
                  placeholder="Select category..."
                />
              </div>

              {/* Featured Image */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-[var(--text-muted)]">Featured Image</label>
                {formData.featured_image ? (
                  <div className="group relative aspect-video overflow-hidden rounded-lg bg-[var(--bg-tertiary)]">
                    <Image
                      src={formData.featured_image}
                      alt="Featured"
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                      <div className="flex h-full items-center justify-center gap-2">
                        <label className="cursor-pointer rounded bg-white px-2 py-1 text-xs font-medium text-zinc-900 hover:bg-zinc-100">
                          Change
                          <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                        </label>
                        <button
                          type="button"
                          onClick={() => updateField('featured_image', '')}
                          className="rounded bg-red-500 px-2 py-1 text-xs font-medium text-white hover:bg-red-600"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-[var(--border-default)] bg-[var(--bg-tertiary)] py-4 hover:border-[var(--accent-red)] transition-colors">
                    {uploadingImage ? (
                      <svg className="h-5 w-5 animate-spin text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                    ) : (
                      <>
                        <svg className="h-5 w-5 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                        </svg>
                        <p className="mt-1 text-xs text-[var(--text-muted)]">Add image</p>
                      </>
                    )}
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                )}
              </div>

              {/* Excerpt */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-[var(--text-muted)]">Excerpt</label>
                <textarea
                  value={formData.excerpt}
                  onChange={(e) => updateField('excerpt', e.target.value)}
                  rows={3}
                  placeholder="Brief summary..."
                  className="w-full resize-none rounded-lg border border-[var(--border-default)] bg-[var(--bg-tertiary)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:border-[var(--accent-red)] focus:outline-none"
                />
              </div>
            </div>
          )}
        </aside>

        {/* Sidebar Toggle */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="flex-shrink-0 w-6 flex items-center justify-center border-r border-[var(--border-default)] bg-[var(--bg-tertiary)] hover:bg-[var(--bg-hover)] transition-colors"
        >
          <svg
            className={`h-4 w-4 text-[var(--text-muted)] transition-transform ${sidebarCollapsed ? '' : 'rotate-180'}`}
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </button>

        {/* Main Editor Column */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-6 py-6">
            {/* Error Display */}
            {error && (
              <div className="mb-4 flex items-center gap-3 rounded-lg border border-red-500/30 bg-red-500/10 p-3">
                <svg className="h-5 w-5 flex-shrink-0 text-red-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
                <p className="text-sm text-red-500">{error}</p>
                <button onClick={() => setError('')} className="ml-auto text-red-500 hover:opacity-70">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}

            {/* Title Input */}
            <input
              type="text"
              value={formData.title}
              onChange={(e) => updateField('title', e.target.value)}
              placeholder="Article title..."
              className="mb-2 w-full border-0 bg-transparent p-0 text-3xl font-bold text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-0"
            />

            {/* Slug */}
            <div className="mb-6 flex items-center gap-1 text-sm text-[var(--text-muted)]">
              <span>sportsmockery.com/</span>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => updateField('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
                placeholder="article-slug"
                className="flex-1 border-0 bg-transparent p-0 text-[var(--text-secondary)] focus:outline-none focus:ring-0"
              />
            </div>

            {/* Content Editor */}
            <div className="rounded-lg border border-[var(--border-default)] bg-white dark:bg-gray-900 overflow-hidden">
              <RichTextEditor
                content={formData.content}
                onChange={(content) => updateField('content', content)}
                placeholder="Start writing your article..."
              />
            </div>

            {/* SEO Section - Below Content */}
            <div className="mt-6 rounded-lg border border-[var(--border-default)] bg-[var(--bg-card)]">
              <button
                type="button"
                onClick={() => setSeoExpanded(!seoExpanded)}
                className="flex w-full items-center justify-between px-4 py-3 text-left"
              >
                <span className="text-sm font-medium text-[var(--text-primary)]">SEO Settings</span>
                <svg
                  className={`h-4 w-4 text-[var(--text-muted)] transition-transform ${seoExpanded ? 'rotate-180' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </button>

              {seoExpanded && (
                <div className="border-t border-[var(--border-default)] p-4 space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-[var(--text-muted)]">SEO Title</label>
                      <input
                        type="text"
                        value={formData.seo_title}
                        onChange={(e) => updateField('seo_title', e.target.value)}
                        placeholder={formData.title || 'SEO title...'}
                        className="w-full rounded-lg border border-[var(--border-default)] bg-[var(--bg-tertiary)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:border-[var(--accent-red)] focus:outline-none"
                      />
                      <p className={`mt-1 text-xs ${(formData.seo_title || formData.title).length > 60 ? 'text-amber-500' : 'text-[var(--text-muted)]'}`}>
                        {(formData.seo_title || formData.title).length}/60
                      </p>
                    </div>

                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-[var(--text-muted)]">Keywords</label>
                      <input
                        type="text"
                        value={formData.seo_keywords}
                        onChange={(e) => updateField('seo_keywords', e.target.value)}
                        placeholder="keyword1, keyword2..."
                        className="w-full rounded-lg border border-[var(--border-default)] bg-[var(--bg-tertiary)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:border-[var(--accent-red)] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-[var(--text-muted)]">Meta Description</label>
                    <textarea
                      value={formData.seo_description}
                      onChange={(e) => updateField('seo_description', e.target.value)}
                      rows={2}
                      placeholder="Description for search results..."
                      className="w-full resize-none rounded-lg border border-[var(--border-default)] bg-[var(--bg-tertiary)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:border-[var(--accent-red)] focus:outline-none"
                    />
                    <p className={`mt-1 text-xs ${(formData.seo_description || '').length > 160 ? 'text-amber-500' : 'text-[var(--text-muted)]'}`}>
                      {(formData.seo_description || '').length}/160
                    </p>
                  </div>

                  {/* Google Preview */}
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-[var(--text-muted)]">Search Preview</label>
                    <div className="rounded-lg border border-[var(--border-default)] bg-white dark:bg-gray-900 p-3">
                      <p className="truncate text-sm text-blue-600 hover:underline">
                        {formData.seo_title || formData.title || 'Page Title'}
                      </p>
                      <p className="truncate text-xs text-emerald-700 dark:text-emerald-500">
                        sportsmockery.com/{formData.slug || 'article-slug'}
                      </p>
                      <p className="mt-1 line-clamp-2 text-xs text-gray-600 dark:text-gray-400">
                        {formData.seo_description || formData.excerpt || 'Meta description will appear here...'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
