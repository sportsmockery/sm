'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import RichTextEditor from './RichTextEditor'
import { CategorySelect, AuthorSelect } from './SearchableSelect'
import VoiceToText from './VoiceToText'

interface Category {
  id: string
  name: string
  slug?: string
  icon?: string
}

interface Author {
  id: string
  display_name: string
  avatar?: string
}

interface Post {
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
  published_at?: string | null
  scheduled_at?: string | null
}

interface ArticleIdea {
  headline: string
  angle: string
  type: string
}

interface AdvancedPostEditorProps {
  post?: Post
  categories: Category[]
  authors: Author[]
  currentUserId?: string
}

export default function AdvancedPostEditor({
  post,
  categories,
  authors,
  currentUserId,
}: AdvancedPostEditorProps) {
  const router = useRouter()
  const isEditing = !!post?.id
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [showVoice, setShowVoice] = useState(false)
  const [aiLoading, setAiLoading] = useState<string | null>(null)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [headlines, setHeadlines] = useState<string[]>([])
  const [ideas, setIdeas] = useState<ArticleIdea[]>([])
  const [showIdeasModal, setShowIdeasModal] = useState(false)
  const [selectedIdea, setSelectedIdea] = useState<ArticleIdea | null>(null)
  const [loadingIdeas, setLoadingIdeas] = useState(false)
  const [showSidebar, setShowSidebar] = useState(true)
  const [settingsExpanded, setSettingsExpanded] = useState(true)
  const [seoExpanded, setSeoExpanded] = useState(true)
  const [seoGenerated, setSeoGenerated] = useState(false)
  const [generatingSEO, setGeneratingSEO] = useState(false)

  // Refs for auto-AI tracking
  const lastAutoSeoWordCount = useRef(0)
  const autoAiTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Form state - default author to current user
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

  // PostIQ Chart Modal State
  const [showChartModal, setShowChartModal] = useState(false)
  const [chartLoading, setChartLoading] = useState(false)
  const [chartSuggestion, setChartSuggestion] = useState<{
    chartType: string
    chartTitle: string
    data: { label: string; value: number }[]
    paragraphIndex: number
    reasoning: string
  } | null>(null)
  const [selectedChartType, setSelectedChartType] = useState('bar')
  const [selectedParagraph, setSelectedParagraph] = useState(1)
  const [customChartTitle, setCustomChartTitle] = useState('')
  const [paragraphOptions, setParagraphOptions] = useState<string[]>([])

  // Extract paragraphs from content for the dropdown
  const extractParagraphs = useCallback((html: string) => {
    const parser = new DOMParser()
    const doc = parser.parseFromString(html, 'text/html')
    const paragraphs = doc.querySelectorAll('p')
    return Array.from(paragraphs).map((p, i) => {
      const text = p.textContent || ''
      return text.length > 60 ? text.slice(0, 60) + '...' : text
    }).filter(t => t.trim().length > 0)
  }, [])

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

  // Word count calculation
  const wordCount = formData.content.replace(/<[^>]*>/g, ' ').split(/\s+/).filter(w => w).length

  // Auto-generate SEO fields when content reaches 150+ words
  useEffect(() => {
    if (autoAiTimerRef.current) {
      clearTimeout(autoAiTimerRef.current)
    }

    // Only auto-generate if content is substantial and SEO hasn't been generated yet
    const shouldAutoGenerate = wordCount >= 150 &&
      !seoGenerated &&
      !formData.seo_title &&
      !formData.seo_description &&
      !formData.excerpt

    if (shouldAutoGenerate) {
      autoAiTimerRef.current = setTimeout(async () => {
        setGeneratingSEO(true)
        try {
          const response = await fetch('/api/admin/ai', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'generate_seo',
              title: formData.title,
              content: formData.content,
              category: categories.find(c => c.id === formData.category_id)?.name,
            }),
          })
          if (response.ok) {
            const data = await response.json()
            setFormData(prev => ({
              ...prev,
              seo_title: prev.seo_title || data.seoTitle || '',
              seo_description: prev.seo_description || data.metaDescription || '',
              seo_keywords: prev.seo_keywords || data.keywords || '',
              excerpt: prev.excerpt || data.excerpt || '',
            }))
            setSeoGenerated(true)
          }
        } catch (err) {
          console.error('Auto-SEO generation error:', err)
        }
        setGeneratingSEO(false)
      }, 2000) // 2 second debounce
    }

    return () => {
      if (autoAiTimerRef.current) {
        clearTimeout(autoAiTimerRef.current)
      }
    }
  }, [wordCount, formData.content, formData.title, formData.category_id, formData.seo_title, formData.seo_description, formData.excerpt, seoGenerated, categories])

  // Transform categories and authors for react-select
  const categoryOptions = categories.map((cat) => ({
    value: cat.id,
    label: cat.name,
    icon: cat.icon,
  }))

  const authorOptions = authors.map((author) => ({
    value: author.id,
    label: author.display_name,
    avatar: author.avatar,
  }))

  // Update form field
  const updateField = useCallback((field: string, value: string | null) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }, [])

  // AI Actions
  const runAI = async (action: string) => {
    setAiLoading(action)
    try {
      const response = await fetch('/api/admin/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          title: formData.title,
          content: formData.content,
          category: categories.find(c => c.id === formData.category_id)?.name,
        }),
      })
      if (response.ok) {
        const data = await response.json()
        if ((action === 'seo' || action === 'generate_seo') && data.seoTitle) {
          setFormData(prev => ({
            ...prev,
            seo_title: data.seoTitle,
            seo_description: data.metaDescription || '',
            seo_keywords: data.keywords || '',
            excerpt: data.excerpt || prev.excerpt,
          }))
          setSeoGenerated(true)
        } else if (action === 'excerpt' && data.excerpt) {
          updateField('excerpt', data.excerpt)
        } else if (action === 'grammar' && data.correctedContent) {
          updateField('content', data.correctedContent)
        } else if (action === 'headlines' && data.headlines) {
          setHeadlines(data.headlines)
        } else if (action === 'ideas' && data.ideas) {
          setIdeas(data.ideas)
        }
      }
    } catch (err) {
      console.error('AI error:', err)
    } finally {
      setAiLoading(null)
    }
  }

  // Generate article ideas
  const generateIdeas = async () => {
    setLoadingIdeas(true)
    setSelectedIdea(null)
    try {
      const response = await fetch('/api/admin/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'ideas',
          category: categories.find(c => c.id === formData.category_id)?.name || 'Chicago Sports',
        }),
      })
      if (response.ok) {
        const data = await response.json()
        if (data.ideas) {
          setIdeas(data.ideas)
        }
      }
    } catch (err) {
      console.error('Ideas generation error:', err)
    } finally {
      setLoadingIdeas(false)
    }
  }

  // Regenerate SEO manually
  const regenerateSEO = async () => {
    setSeoGenerated(false)
    setGeneratingSEO(true)
    try {
      const response = await fetch('/api/admin/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate_seo',
          title: formData.title,
          content: formData.content,
          category: categories.find(c => c.id === formData.category_id)?.name,
        }),
      })
      if (response.ok) {
        const data = await response.json()
        setFormData(prev => ({
          ...prev,
          seo_title: data.seoTitle || '',
          seo_description: data.metaDescription || '',
          seo_keywords: data.keywords || '',
          excerpt: data.excerpt || '',
        }))
        setSeoGenerated(true)
      }
    } catch (err) {
      console.error('SEO regeneration error:', err)
    }
    setGeneratingSEO(false)
  }

  // Open PostIQ Chart Modal and analyze content
  const openChartModal = async () => {
    if (formData.content.length < 200) {
      alert('Please add more content before generating a chart (minimum 200 characters)')
      return
    }

    setShowChartModal(true)
    setChartLoading(true)
    setChartSuggestion(null)

    // Extract paragraphs for the dropdown
    const paragraphs = extractParagraphs(formData.content)
    setParagraphOptions(paragraphs)

    try {
      const response = await fetch('/api/admin/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'analyze_chart',
          title: formData.title,
          content: formData.content,
          category: categories.find(c => c.id === formData.category_id)?.name,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        if (data.shouldCreateChart && data.data?.length >= 2) {
          setChartSuggestion(data)
          setSelectedChartType(data.chartType || 'bar')
          setSelectedParagraph(data.paragraphIndex || 1)
          setCustomChartTitle(data.chartTitle || '')
        } else {
          setChartSuggestion(null)
        }
      }
    } catch (err) {
      console.error('Chart analysis error:', err)
    } finally {
      setChartLoading(false)
    }
  }

  // Regenerate chart suggestion
  const regenerateChartSuggestion = async () => {
    setChartLoading(true)
    try {
      const response = await fetch('/api/admin/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'analyze_chart',
          title: formData.title,
          content: formData.content,
          category: categories.find(c => c.id === formData.category_id)?.name,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        if (data.shouldCreateChart && data.data?.length >= 2) {
          setChartSuggestion(data)
          setSelectedChartType(data.chartType || 'bar')
          setSelectedParagraph(data.paragraphIndex || 1)
          setCustomChartTitle(data.chartTitle || '')
        }
      }
    } catch (err) {
      console.error('Chart regeneration error:', err)
    } finally {
      setChartLoading(false)
    }
  }

  // Insert chart into content
  const insertChart = async () => {
    if (!chartSuggestion) return

    setChartLoading(true)
    try {
      // Determine team from category
      const teamMap: Record<string, string> = {
        'Chicago Bears': 'bears', 'Bears': 'bears',
        'Chicago Bulls': 'bulls', 'Bulls': 'bulls',
        'Chicago Cubs': 'cubs', 'Cubs': 'cubs',
        'Chicago White Sox': 'whitesox', 'White Sox': 'whitesox',
        'Chicago Blackhawks': 'blackhawks', 'Blackhawks': 'blackhawks',
      }
      const categoryName = categories.find(c => c.id === formData.category_id)?.name || ''
      const team = teamMap[categoryName] || 'bears'

      // Create chart via API
      const chartResponse = await fetch('/api/charts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: selectedChartType,
          title: customChartTitle || chartSuggestion.chartTitle,
          size: 'medium',
          colors: { scheme: 'team', team },
          data: chartSuggestion.data,
          dataSource: 'manual',
        }),
      })

      if (chartResponse.ok) {
        const chartData = await chartResponse.json()
        const shortcode = `[chart:${chartData.id}]`

        // Insert shortcode after selected paragraph
        const updatedContent = insertShortcodeAfterParagraph(
          formData.content,
          shortcode,
          selectedParagraph
        )

        setFormData(prev => ({ ...prev, content: updatedContent }))
        setShowChartModal(false)
        setChartSuggestion(null)
      }
    } catch (err) {
      console.error('Chart insertion error:', err)
      alert('Failed to create chart. Please try again.')
    } finally {
      setChartLoading(false)
    }
  }

  // Helper to insert shortcode after paragraph
  const insertShortcodeAfterParagraph = (html: string, shortcode: string, paragraphIndex: number): string => {
    const closingTagRegex = /<\/p>/gi
    let match
    let count = 0
    let insertPosition = -1

    while ((match = closingTagRegex.exec(html)) !== null) {
      count++
      if (count === paragraphIndex) {
        insertPosition = match.index + match[0].length
        break
      }
    }

    if (insertPosition > 0) {
      const chartBlock = `\n<div class="chart-embed my-6">${shortcode}</div>\n`
      return html.slice(0, insertPosition) + chartBlock + html.slice(insertPosition)
    }

    return html + `\n<div class="chart-embed my-6">${shortcode}</div>`
  }

  // Handle voice transcript
  const handleVoiceTranscript = useCallback((text: string) => {
    setFormData((prev) => ({
      ...prev,
      content: prev.content + (prev.content ? '\n\n' : '') + `<p>${text}</p>`,
    }))
  }, [])

  // Handle image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }

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

  // Submit form
  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      setError('Title is required')
      return
    }

    setSaving(true)
    setError('')

    try {
      const endpoint = isEditing ? `/api/posts/${post.id}` : '/api/admin/posts'

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
      router.push(`/admin/posts/${data.id}`)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setSaving(false)
    }
  }

  // Use idea from modal
  const useSelectedIdea = () => {
    if (selectedIdea) {
      setFormData(prev => ({ ...prev, title: selectedIdea.headline }))
      setShowIdeasModal(false)
      setSelectedIdea(null)
    }
  }

  // Open ideas modal and generate ideas
  const openIdeasModal = () => {
    setShowIdeasModal(true)
    if (ideas.length === 0) {
      generateIdeas()
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
    <div className="bg-[var(--bg-primary)]">
      {/* Fixed Header - reduced height */}
      <header className="sticky left-0 right-0 top-0 z-40 border-b border-[var(--border-default)] bg-[var(--bg-secondary)]/95 backdrop-blur-sm">
        <div className="flex h-14 items-center justify-between px-4 lg:px-6">
          {/* Left: Back & Title */}
          <div className="flex items-center gap-4">
            <Link
              href="/admin/posts"
              className="flex h-9 w-9 items-center justify-center rounded-lg text-[var(--text-muted)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] transition-colors"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
            </Link>
            <div className="hidden sm:block">
              <h1 className="text-sm font-semibold text-[var(--text-primary)]">
                {isEditing ? 'Edit Post' : 'New Post'}
              </h1>
              <p className="text-xs text-[var(--text-muted)]">
                {wordCount} words · {Math.ceil(wordCount / 200)} min read
              </p>
            </div>
          </div>

          {/* Center: AI Tools Bar */}
          <div className="hidden items-center gap-1 rounded-lg bg-[var(--bg-tertiary)] p-1 md:flex">
            <button
              type="button"
              onClick={() => runAI('grammar')}
              disabled={aiLoading === 'grammar' || !formData.content}
              className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] disabled:opacity-50 transition-colors"
              title="Grammar Check"
            >
              <svg className="h-4 w-4 text-purple-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {aiLoading === 'grammar' ? 'Checking...' : 'Grammar Check'}
            </button>
            <div className="h-4 w-px bg-[var(--border-default)]" />
            <button
              type="button"
              onClick={() => runAI('headlines')}
              disabled={aiLoading === 'headlines' || !formData.title}
              className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] disabled:opacity-50 transition-colors"
              title="Generate Headlines"
            >
              <svg className="h-4 w-4 text-purple-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" />
              </svg>
              {aiLoading === 'headlines' ? 'Generating...' : 'Headlines'}
            </button>
            <div className="h-4 w-px bg-[var(--border-default)]" />
            <button
              type="button"
              onClick={() => setShowVoice(!showVoice)}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                showVoice
                  ? 'bg-purple-500/10 text-purple-500'
                  : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]'
              }`}
              title="Voice Input"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
              </svg>
              Voice
            </button>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowSidebar(!showSidebar)}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-[var(--text-muted)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] transition-colors lg:hidden"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
              </svg>
            </button>

            <select
              value={formData.status}
              onChange={(e) => updateField('status', e.target.value)}
              className="hidden h-9 rounded-lg border border-[var(--border-default)] bg-[var(--bg-tertiary)] px-3 text-sm text-[var(--text-primary)] focus:border-[var(--accent-red)] focus:outline-none sm:block"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="scheduled">Scheduled</option>
            </select>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={saving}
              className="inline-flex h-9 items-center gap-2 rounded-lg bg-[var(--accent-red)] px-4 text-sm font-medium text-white hover:bg-[var(--accent-red-hover)] disabled:opacity-50 transition-colors"
            >
              {saving ? (
                <>
                  <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Saving...
                </>
              ) : (
                <>
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  {isEditing ? 'Update' : 'Publish'}
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area - no extra top padding */}
      <div className="flex">
        {/* Editor Column */}
        <div className={`flex-1 overflow-auto transition-all ${showSidebar ? 'lg:mr-72' : ''}`}>
          {error && (
            <div className="mx-4 mt-4 flex items-center gap-3 rounded-lg border border-[var(--error)] bg-[var(--error-muted)] p-4 lg:mx-auto lg:max-w-4xl">
              <svg className="h-5 w-5 flex-shrink-0 text-[var(--error)]" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
              <p className="text-sm text-[var(--error)]">{error}</p>
              <button onClick={() => setError('')} className="ml-auto text-[var(--error)] hover:opacity-70">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}

          <div className="mx-auto w-full max-w-4xl px-4 py-4 lg:px-6">
            {/* Title Input */}
            <input
              type="text"
              value={formData.title}
              onChange={(e) => updateField('title', e.target.value)}
              placeholder="Article title..."
              className="mb-3 w-full border-0 bg-transparent p-0 text-3xl font-bold text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-0 lg:text-4xl"
            />

            {/* Slug row with Generate Ideas button */}
            <div className="mb-6 flex items-center gap-4">
              <div className="flex flex-1 items-center gap-1 text-sm text-[var(--text-muted)]">
                <span>sportsmockery.com/</span>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => updateField('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
                  placeholder="article-slug"
                  className="flex-1 border-0 bg-transparent p-0 text-[var(--text-secondary)] focus:outline-none focus:ring-0"
                />
              </div>

              {/* Generate Ideas - styled like other AI options */}
              <button
                type="button"
                onClick={openIdeasModal}
                className="flex items-center gap-2 text-purple-500 hover:text-purple-400 transition-colors"
              >
                <span>💡</span>
                <span className="text-sm font-medium">Generate Ideas</span>
              </button>
            </div>

            {/* Alternative Headlines (shown when generated) */}
            {headlines.length > 0 && (
              <div className="mb-6 rounded-lg border border-purple-500/30 bg-purple-500/5 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-wide text-purple-500">Alternative Headlines</p>
                  <button
                    type="button"
                    onClick={() => setHeadlines([])}
                    className="text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="space-y-2">
                  {headlines.map((h, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => { updateField('title', h); setHeadlines([]) }}
                      className="w-full rounded-lg bg-white/50 dark:bg-gray-800/50 px-3 py-2 text-left text-sm text-[var(--text-secondary)] hover:bg-purple-500/10 hover:text-purple-500 transition-colors"
                    >
                      {h}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Voice Recording Panel */}
            {showVoice && (
              <div className="mb-6 rounded-xl border border-purple-500/30 bg-purple-500/5 p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="flex items-center gap-2 text-sm font-semibold text-purple-500">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
                    </svg>
                    Voice to Text
                  </h3>
                  <button
                    type="button"
                    onClick={() => setShowVoice(false)}
                    className="text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <VoiceToText
                  onTranscript={handleVoiceTranscript}
                  onPolishedTranscript={(t) => updateField('content', t)}
                />
              </div>
            )}

            {/* Content Editor - light background, full width */}
            <div className="mb-6 overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
              <RichTextEditor
                content={formData.content}
                onChange={(content) => updateField('content', content)}
                placeholder="Start writing your article..."
              />
            </div>
          </div>
        </div>

        {/* Right Sidebar - Stacked Panels (NO TABS) */}
        <aside className={`fixed bottom-0 right-0 top-14 w-72 transform border-l border-[var(--border-default)] bg-[var(--bg-secondary)] transition-transform ${showSidebar ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="h-full overflow-y-auto pb-16">
            {/* SETTINGS PANEL */}
            <div className="border-b border-[var(--border-default)]">
              <button
                type="button"
                onClick={() => setSettingsExpanded(!settingsExpanded)}
                className="flex w-full items-center justify-between px-4 py-3 text-left"
              >
                <span className="text-xs font-semibold uppercase tracking-wide text-[var(--text-primary)]">Settings</span>
                <svg className={`h-4 w-4 text-[var(--text-muted)] transition-transform ${settingsExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </button>

              {settingsExpanded && (
                <div className="space-y-4 px-4 pb-4">
                  {/* Status */}
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-[var(--text-muted)]">Status</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { value: 'draft', label: 'Draft' },
                        { value: 'published', label: 'Published' },
                        { value: 'scheduled', label: 'Scheduled' },
                      ].map(({ value, label }) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => updateField('status', value)}
                          className={`rounded-lg border px-2 py-1.5 text-xs font-medium transition-all ${
                            formData.status === value
                              ? 'border-[var(--accent-red)] bg-[var(--accent-red-muted)] text-[var(--accent-red)]'
                              : 'border-[var(--border-default)] text-[var(--text-secondary)] hover:border-[var(--text-muted)]'
                          }`}
                        >
                          {label}
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
                        className="w-full rounded-lg border border-[var(--border-default)] bg-gray-50 dark:bg-gray-800 px-3 py-2 text-sm text-[var(--text-primary)] focus:border-[var(--accent-red)] focus:outline-none"
                      />
                    </div>
                  )}

                  {/* Author - defaults to logged in user */}
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

                  {/* Featured Image - MOVED HERE */}
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
                      <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-[var(--border-default)] bg-gray-50 dark:bg-gray-800 py-6 hover:border-[var(--accent-red)] transition-colors">
                        {uploadingImage ? (
                          <svg className="h-6 w-6 animate-spin text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                        ) : (
                          <>
                            <svg className="mb-2 h-6 w-6 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                            </svg>
                            <p className="text-xs font-medium text-[var(--text-secondary)]">Add image</p>
                          </>
                        )}
                        <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                      </label>
                    )}
                  </div>

                  {/* PostIQ: Add Chart To Post */}
                  <div className="rounded-lg border border-purple-500/30 bg-purple-500/5 p-3">
                    <button
                      type="button"
                      onClick={openChartModal}
                      disabled={formData.content.length < 200}
                      className="w-full flex items-center gap-2 text-left disabled:opacity-50"
                    >
                      <svg className="h-5 w-5 text-purple-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                      </svg>
                      <div className="flex-1">
                        <span className="text-sm font-medium text-purple-600 dark:text-purple-400">PostIQ: Add Chart To Post</span>
                        <p className="mt-0.5 text-xs text-[var(--text-muted)]">
                          AI will analyze content and suggest a chart to insert.
                        </p>
                      </div>
                      <svg className="h-4 w-4 text-purple-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* SEO PANEL */}
            <div className="border-b border-[var(--border-default)]">
              <button
                type="button"
                onClick={() => setSeoExpanded(!seoExpanded)}
                className="flex w-full items-center justify-between px-4 py-3 text-left"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wide text-[var(--text-primary)]">SEO</span>
                  {generatingSEO && (
                    <svg className="h-3 w-3 animate-spin text-purple-500" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  )}
                  {seoGenerated && !generatingSEO && (
                    <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-medium text-emerald-500">Auto</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {seoGenerated && (
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); regenerateSEO() }}
                      className="text-xs text-purple-500 hover:text-purple-400"
                    >
                      ↻ Regenerate
                    </button>
                  )}
                  <svg className={`h-4 w-4 text-[var(--text-muted)] transition-transform ${seoExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </div>
              </button>

              {seoExpanded && (
                <div className="space-y-4 px-4 pb-4">
                  {/* Auto-generate indicator */}
                  {wordCount < 150 && !seoGenerated && (
                    <p className="rounded-lg bg-amber-500/10 px-3 py-2 text-xs text-amber-600 dark:text-amber-400">
                      SEO fields will auto-generate when content reaches 150+ words ({wordCount}/150)
                    </p>
                  )}

                  {/* SEO Title */}
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-[var(--text-muted)]">SEO Title</label>
                    <input
                      type="text"
                      value={formData.seo_title}
                      onChange={(e) => updateField('seo_title', e.target.value)}
                      placeholder={formData.title || 'SEO title...'}
                      className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-2 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:border-[var(--accent-red)] focus:outline-none"
                    />
                    <p className={`mt-1 text-xs ${(formData.seo_title || formData.title).length > 60 ? 'text-amber-500' : 'text-[var(--text-muted)]'}`}>
                      {(formData.seo_title || formData.title).length}/60
                    </p>
                  </div>

                  {/* Meta Description */}
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-[var(--text-muted)]">Meta Description</label>
                    <textarea
                      value={formData.seo_description}
                      onChange={(e) => updateField('seo_description', e.target.value)}
                      rows={3}
                      placeholder="Description for search results..."
                      className="w-full resize-none rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-2 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:border-[var(--accent-red)] focus:outline-none"
                    />
                    <p className={`mt-1 text-xs ${(formData.seo_description || '').length > 160 ? 'text-amber-500' : 'text-[var(--text-muted)]'}`}>
                      {(formData.seo_description || '').length}/160
                    </p>
                  </div>

                  {/* Keywords */}
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-[var(--text-muted)]">Keywords</label>
                    <input
                      type="text"
                      value={formData.seo_keywords}
                      onChange={(e) => updateField('seo_keywords', e.target.value)}
                      placeholder="keyword1, keyword2, keyword3..."
                      className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-2 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:border-[var(--accent-red)] focus:outline-none"
                    />
                  </div>

                  {/* Excerpt - MOVED HERE */}
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-[var(--text-muted)]">Excerpt</label>
                    <textarea
                      value={formData.excerpt}
                      onChange={(e) => updateField('excerpt', e.target.value)}
                      rows={3}
                      placeholder="Brief summary for article cards..."
                      className="w-full resize-none rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-2 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:border-[var(--accent-red)] focus:outline-none"
                    />
                  </div>

                  {/* Google Preview */}
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-[var(--text-muted)]">Search Preview</label>
                    <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-3">
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

            {/* Analytics Quick Stats */}
            <div className="px-4 py-4">
              <div className="grid grid-cols-3 gap-2">
                <div className="rounded-lg bg-[var(--bg-tertiary)] p-2 text-center">
                  <p className="text-lg font-bold text-[var(--text-primary)]">{wordCount}</p>
                  <p className="text-[10px] text-[var(--text-muted)]">Words</p>
                </div>
                <div className="rounded-lg bg-[var(--bg-tertiary)] p-2 text-center">
                  <p className="text-lg font-bold text-[var(--text-primary)]">{Math.ceil(wordCount / 200)}</p>
                  <p className="text-[10px] text-[var(--text-muted)]">Min Read</p>
                </div>
                <div className="rounded-lg bg-[var(--bg-tertiary)] p-2 text-center">
                  <p className="text-lg font-bold text-[var(--text-primary)]">{formData.content.split(/<\/p>/i).length - 1 || 0}</p>
                  <p className="text-[10px] text-[var(--text-muted)]">Paragraphs</p>
                </div>
              </div>
            </div>
          </div>

          {/* Keyboard Shortcut Hint */}
          <div className="absolute bottom-0 left-0 right-0 border-t border-[var(--border-default)] bg-[var(--bg-tertiary)] px-4 py-2">
            <p className="text-center text-xs text-[var(--text-muted)]">
              <kbd className="rounded bg-[var(--bg-primary)] px-1.5 py-0.5 font-mono text-[var(--text-secondary)]">⌘S</kbd> to save
            </p>
          </div>
        </aside>
      </div>

      {/* Ideas Popup Modal */}
      {showIdeasModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-lg overflow-hidden rounded-xl bg-white shadow-2xl dark:bg-[#1c1c1f]">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-700">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                💡 Article Ideas
              </h3>
              <button
                type="button"
                onClick={() => setShowIdeasModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Ideas List */}
            <div className="max-h-80 space-y-3 overflow-y-auto p-6">
              {loadingIdeas ? (
                <div className="py-8 text-center">
                  <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-purple-500 border-t-transparent" />
                  <p className="mt-3 text-gray-500 dark:text-gray-400">Generating ideas...</p>
                </div>
              ) : ideas.length > 0 ? (
                ideas.map((idea, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setSelectedIdea(idea)}
                    className={`w-full rounded-lg border-2 p-4 text-left transition-all ${
                      selectedIdea === idea
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-500/10'
                        : 'border-gray-200 hover:border-purple-300 dark:border-gray-700'
                    }`}
                  >
                    <p className="font-medium text-gray-900 dark:text-white">{idea.headline}</p>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{idea.angle}</p>
                    <span className="mt-2 inline-block rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                      {idea.type}
                    </span>
                  </button>
                ))
              ) : (
                <p className="py-8 text-center text-gray-500">Click "Generate More" to get article ideas</p>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center gap-3 border-t border-gray-200 bg-gray-50 px-6 py-4 dark:border-gray-700 dark:bg-gray-800/50">
              <button
                type="button"
                onClick={generateIdeas}
                disabled={loadingIdeas}
                className="text-sm font-medium text-purple-500 hover:text-purple-400 disabled:opacity-50"
              >
                ↻ Generate More
              </button>
              <div className="flex-1" />
              <button
                type="button"
                onClick={() => setShowIdeasModal(false)}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={useSelectedIdea}
                disabled={!selectedIdea}
                className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Use Selected
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PostIQ Chart Modal */}
      {showChartModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-2xl overflow-hidden rounded-xl bg-white shadow-2xl dark:bg-[#1c1c1f]">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10">
                  <svg className="h-5 w-5 text-purple-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">PostIQ: Add Chart</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">AI-suggested chart based on your content</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowChartModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="max-h-[60vh] overflow-y-auto p-6">
              {chartLoading ? (
                <div className="py-12 text-center">
                  <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-purple-500 border-t-transparent" />
                  <p className="mt-4 text-gray-500 dark:text-gray-400">Analyzing your article for chart data...</p>
                </div>
              ) : chartSuggestion ? (
                <div className="space-y-6">
                  {/* AI Reasoning */}
                  <div className="rounded-lg bg-purple-50 p-4 dark:bg-purple-900/20">
                    <p className="text-sm text-purple-700 dark:text-purple-300">
                      <span className="font-semibold">AI Analysis:</span> {chartSuggestion.reasoning}
                    </p>
                  </div>

                  {/* Chart Title */}
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Chart Title</label>
                    <input
                      type="text"
                      value={customChartTitle}
                      onChange={(e) => setCustomChartTitle(e.target.value)}
                      placeholder={chartSuggestion.chartTitle}
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-purple-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                    />
                  </div>

                  {/* Chart Type Selector */}
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Chart Type</label>
                    <div className="grid grid-cols-5 gap-2">
                      {[
                        { type: 'bar', label: 'Bar', icon: 'M3 13h4v8H3zM9 9h4v12H9zM15 5h4v16h-4z' },
                        { type: 'line', label: 'Line', icon: 'M3 17l6-6 4 4 8-8' },
                        { type: 'pie', label: 'Pie', icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8v8l8 0c0 4.41-3.59 8-8 8z' },
                        { type: 'player-comparison', label: 'Players', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
                        { type: 'team-stats', label: 'Team', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
                      ].map(({ type, label, icon }) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setSelectedChartType(type)}
                          className={`flex flex-col items-center gap-1 rounded-lg border-2 p-3 transition-all ${
                            selectedChartType === type
                              ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                              : 'border-gray-200 hover:border-purple-300 dark:border-gray-700'
                          }`}
                        >
                          <svg className={`h-6 w-6 ${selectedChartType === type ? 'text-purple-500' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
                          </svg>
                          <span className={`text-xs font-medium ${selectedChartType === type ? 'text-purple-600 dark:text-purple-400' : 'text-gray-500'}`}>{label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Data Preview */}
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Chart Data</label>
                    <div className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50 dark:bg-gray-800">
                          <tr>
                            <th className="px-4 py-2 text-left font-medium text-gray-600 dark:text-gray-400">Label</th>
                            <th className="px-4 py-2 text-right font-medium text-gray-600 dark:text-gray-400">Value</th>
                          </tr>
                        </thead>
                        <tbody>
                          {chartSuggestion.data.map((item, i) => (
                            <tr key={i} className="border-t border-gray-100 dark:border-gray-700">
                              <td className="px-4 py-2 text-gray-900 dark:text-white">{item.label}</td>
                              <td className="px-4 py-2 text-right font-mono text-gray-600 dark:text-gray-400">{item.value}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Paragraph Selector */}
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Insert After Paragraph</label>
                    <select
                      value={selectedParagraph}
                      onChange={(e) => setSelectedParagraph(parseInt(e.target.value))}
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-purple-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                    >
                      {paragraphOptions.map((text, i) => (
                        <option key={i} value={i + 1}>
                          Paragraph {i + 1}: {text}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              ) : (
                <div className="py-12 text-center">
                  <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                  </svg>
                  <p className="mt-4 text-gray-500 dark:text-gray-400">No chartable data found in this article.</p>
                  <p className="mt-1 text-sm text-gray-400">Try adding statistics, comparisons, or rankings to your content.</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center gap-3 border-t border-gray-200 bg-gray-50 px-6 py-4 dark:border-gray-700 dark:bg-gray-800/50">
              {chartSuggestion && (
                <button
                  type="button"
                  onClick={regenerateChartSuggestion}
                  disabled={chartLoading}
                  className="text-sm font-medium text-purple-500 hover:text-purple-400 disabled:opacity-50"
                >
                  ↻ Regenerate
                </button>
              )}
              <div className="flex-1" />
              <button
                type="button"
                onClick={() => setShowChartModal(false)}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={insertChart}
                disabled={!chartSuggestion || chartLoading}
                className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {chartLoading ? 'Creating...' : 'Insert Chart'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
