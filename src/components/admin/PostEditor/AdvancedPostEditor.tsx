'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import RichTextEditor, { RichTextEditorRef } from './RichTextEditor'
import { CategorySelect, AuthorSelect } from './SearchableSelect'
import { ChartBuilderModal, ChartConfig, AISuggestion, ChartType } from '@/components/admin/ChartBuilder'
import { PostIQChartGenerator } from '@/components/postiq'

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
  social_caption?: string | null
  social_posted_at?: string | null
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
  const [aiLoading, setAiLoading] = useState<string | null>(null)
  const [showTeamPicker, setShowTeamPicker] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [headlines, setHeadlines] = useState<string[]>([])
  const [ideas, setIdeas] = useState<ArticleIdea[]>([])
  const [showIdeasModal, setShowIdeasModal] = useState(false)
  const [selectedIdea, setSelectedIdea] = useState<ArticleIdea | null>(null)
  const [loadingIdeas, setLoadingIdeas] = useState(false)

  // Sidebar states
  const [leftSidebarCollapsed, setLeftSidebarCollapsed] = useState(false)
  const [rightSidebarCollapsed, setRightSidebarCollapsed] = useState(false)

  // Slug editing state
  const [slugEditable, setSlugEditable] = useState(false)
  const contentEditorRef = useRef<RichTextEditorRef>(null)

  // SEO states
  const [seoExpanded, setSeoExpanded] = useState(false)
  const [seoGenerated, setSeoGenerated] = useState(false)
  const [generatingSEO, setGeneratingSEO] = useState(false)

  // Preview mode
  const [showPreview, setShowPreview] = useState(false)

  // Push notification states
  const [sendPushNotification, setSendPushNotification] = useState(false)
  const [pushTitle, setPushTitle] = useState('')
  const [pushMessage, setPushMessage] = useState('')

  // Social media posting states (transient - not persisted directly)
  const [postToSocial, setPostToSocial] = useState(false)
  const [socialCaption, setSocialCaption] = useState(post?.social_caption || '')
  const socialAlreadyPosted = !!post?.social_posted_at

  // Auto-insert content states (PostIQ features)
  const [autoInsertChart, setAutoInsertChart] = useState(false)
  const [autoAddPoll, setAutoAddPoll] = useState(false)
  const [autoInsertingContent, setAutoInsertingContent] = useState<string | null>(null)

  // Refs for auto-AI tracking
  const autoAiTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Form state
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
  const [initialChartConfig, setInitialChartConfig] = useState<Partial<ChartConfig> | null>(null)
  const [chartAiSuggestion, setChartAiSuggestion] = useState<AISuggestion | null>(null)
  const [selectedParagraph, setSelectedParagraph] = useState(1)
  const [paragraphOptions, setParagraphOptions] = useState<string[]>([])
  const [highlightMode, setHighlightMode] = useState(false)
  const [highlightedText, setHighlightedText] = useState('')

  // Extract paragraphs from content for the dropdown
  const extractParagraphs = useCallback((html: string) => {
    const parser = new DOMParser()
    const doc = parser.parseFromString(html, 'text/html')
    const paragraphs = doc.querySelectorAll('p')
    return Array.from(paragraphs).map((p) => {
      const text = p.textContent || ''
      return text.length > 60 ? text.slice(0, 60) + '...' : text
    }).filter(t => t.trim().length > 0)
  }, [])

  // Category name to URL prefix mapping
  const categorySlugMap: Record<string, string> = {
    'Chicago Bears News & Rumors': 'chicago-bears',
    'Chicago Bulls News & Rumors': 'chicago-bulls',
    'Chicago Cubs News & Rumors': 'chicago-cubs',
    'Chicago White Sox News & Rumors': 'chicago-white-sox',
    'Chicago Blackhawks News & Rumors': 'chicago-blackhawks',
  }

  // Get category prefix for slug
  const getCategoryPrefix = (categoryId: string): string => {
    const category = categories.find(c => c.id === categoryId)
    if (category) {
      return categorySlugMap[category.name] || ''
    }
    return ''
  }

  // Generate slug from title with category prefix
  const generateSlug = useCallback((title: string, categoryId: string): string => {
    const titleSlug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
    const prefix = getCategoryPrefix(categoryId)
    return prefix ? `${prefix}/${titleSlug}` : titleSlug
  }, [categories])

  // Auto-generate slug from title and category
  useEffect(() => {
    if (!isEditing && formData.title && !slugEditable) {
      const newSlug = generateSlug(formData.title, formData.category_id)
      setFormData(prev => ({ ...prev, slug: newSlug }))
    }
  }, [formData.title, formData.category_id, isEditing, slugEditable, generateSlug])

  // Update slug when category changes (if not manually edited)
  useEffect(() => {
    if (!isEditing && formData.title && formData.category_id && !slugEditable) {
      const newSlug = generateSlug(formData.title, formData.category_id)
      setFormData(prev => ({ ...prev, slug: newSlug }))
    }
  }, [formData.category_id])

  // Auto-populate push title when checkbox is enabled and title changes
  useEffect(() => {
    if (sendPushNotification && formData.title && !pushTitle) {
      setPushTitle(formData.title.slice(0, 65))
    }
  }, [sendPushNotification, formData.title, pushTitle])

  // Word count calculation
  const wordCount = formData.content.replace(/<[^>]*>/g, ' ').split(/\s+/).filter(w => w).length

  // Auto-generate SEO fields when content reaches 150+ words
  useEffect(() => {
    if (autoAiTimerRef.current) {
      clearTimeout(autoAiTimerRef.current)
    }

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
      }, 2000)
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
  // Extract team key from category name
  const getTeamFromCategory = (categoryName?: string): string | undefined => {
    if (!categoryName) return undefined
    const teamMap: Record<string, string> = {
      'Chicago Bears': 'bears',
      'Bears': 'bears',
      'Chicago Bulls': 'bulls',
      'Bulls': 'bulls',
      'Chicago Cubs': 'cubs',
      'Cubs': 'cubs',
      'Chicago White Sox': 'whitesox',
      'White Sox': 'whitesox',
      'Chicago Blackhawks': 'blackhawks',
      'Blackhawks': 'blackhawks',
    }
    return teamMap[categoryName]
  }

  const runAI = async (action: string) => {
    setAiLoading(action)
    try {
      const categoryName = categories.find(c => c.id === formData.category_id)?.name
      const team = getTeamFromCategory(categoryName)
      const response = await fetch('/api/admin/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          title: formData.title,
          content: formData.content,
          category: categoryName,
          team,
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
  const generateIdeas = async (teamOverride?: string) => {
    setLoadingIdeas(true)
    setSelectedIdea(null)
    const categoryName = categories.find(c => c.id === formData.category_id)?.name || 'Chicago Sports'
    const team = teamOverride || getTeamFromCategory(categoryName)
    try {
      const response = await fetch('/api/admin/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'ideas',
          category: categoryName,
          team,
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

  // Open PostIQ Chart Modal with AI analysis
  const openChartModal = async (contentOverride?: string) => {
    const contentToAnalyze = contentOverride || formData.content

    if (contentToAnalyze.length < 200) {
      alert('Please add more content before generating a chart (minimum 200 characters)')
      return
    }

    const paragraphs = extractParagraphs(formData.content)
    setParagraphOptions(paragraphs)
    setSelectedParagraph(1)

    const categoryName = categories.find(c => c.id === formData.category_id)?.name
    const team = getTeamFromCategory(categoryName) || 'bears'

    // Reset states
    setChartAiSuggestion(null)
    setInitialChartConfig(null)
    setShowChartModal(true)
    setChartLoading(true)

    // Fetch AI suggestion to pre-populate
    try {
      const response = await fetch('/api/admin/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'analyze_chart',
          title: formData.title,
          content: contentToAnalyze,
          category: categoryName,
          team,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        if (data.shouldCreateChart && data.data?.length >= 2) {
          // Store AI suggestion for display in modal
          setChartAiSuggestion({
            reasoning: data.reasoning || 'Found chartable data in your article',
            chartTitle: data.chartTitle || '',
            chartType: (data.chartType || 'bar') as ChartType,
            data: data.data,
            paragraphIndex: data.paragraphIndex || 1,
          })
          // Set initial config for the chart
          setInitialChartConfig({
            type: (data.chartType || 'bar') as 'bar' | 'line' | 'pie' | 'player-comparison' | 'team-stats',
            title: data.chartTitle || '',
            size: 'medium',
            colors: { scheme: 'team', team: team as 'bears' | 'bulls' | 'cubs' | 'whitesox' | 'blackhawks' },
            data: data.data,
            dataSource: 'manual',
          })
          setSelectedParagraph(data.paragraphIndex || 1)
        }
      }
    } catch (err) {
      console.error('Chart analysis error:', err)
    } finally {
      setChartLoading(false)
    }
  }

  // Handle highlight mode for chart data selection
  const handleHighlightData = () => {
    setHighlightMode(true)
    setHighlightedText('')
  }

  // Process highlighted text and regenerate chart
  const handleUseHighlightedData = async () => {
    if (!highlightedText.trim()) {
      alert('Please select some text in your article first')
      return
    }
    setHighlightMode(false)
    // Analyze just the highlighted text
    await openChartModal(highlightedText)
  }

  // Cancel highlight mode
  const cancelHighlightMode = () => {
    setHighlightMode(false)
    setHighlightedText('')
  }

  // Handle text selection in content editor during highlight mode
  const handleContentSelection = () => {
    if (!highlightMode) return
    const selection = window.getSelection()
    if (selection && selection.toString().trim()) {
      setHighlightedText(selection.toString())
    }
  }

  // Handle chart insertion from ChartBuilderModal
  const handleChartInsert = async (config: ChartConfig) => {
    try {
      const chartResponse = await fetch('/api/charts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: config.type,
          title: config.title,
          size: config.size,
          colors: config.colors,
          data: config.data,
          dataSource: config.dataSource,
          dataLabQuery: config.dataLabQuery,
        }),
      })

      if (chartResponse.ok) {
        const chartData = await chartResponse.json()
        const shortcode = `[chart:${chartData.id}]`
        const updatedContent = insertShortcodeAfterParagraph(formData.content, shortcode, selectedParagraph)
        setFormData(prev => ({ ...prev, content: updatedContent }))
        setShowChartModal(false)
        setInitialChartConfig(null)
      } else {
        alert('Failed to create chart. Please try again.')
      }
    } catch (err) {
      console.error('Chart insertion error:', err)
      alert('Failed to create chart. Please try again.')
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

  // Handle image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file')
      setTimeout(() => setError(''), 3000)
      return
    }

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('Image too large (max 10MB)')
      setTimeout(() => setError(''), 3000)
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
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to upload image')
        setTimeout(() => setError(''), 3000)
        console.error('Upload failed:', errorData)
      }
    } catch (err) {
      setError('Failed to upload image. Please try again.')
      setTimeout(() => setError(''), 3000)
      console.error('Upload error:', err)
    } finally {
      setUploadingImage(false)
    }
  }

  // Submit form
  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      setError('Title is required')
      setTimeout(() => setError(''), 3000)
      return
    }

    setSaving(true)
    setError('')

    // Track the content that may be modified by auto-insert features
    let contentToSave = formData.content

    try {
      // Auto-insert chart if enabled and publishing
      if (autoInsertChart && formData.status === 'published' && formData.content.length >= 200) {
        setAutoInsertingContent('chart')
        const categoryName = categories.find(c => c.id === formData.category_id)?.name
        const team = getTeamFromCategory(categoryName)
        try {
          const chartResponse = await fetch('/api/admin/ai', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'generate_chart',
              title: formData.title,
              content: contentToSave,
              category: categoryName,
              team,
            }),
          })
          if (chartResponse.ok) {
            const chartData = await chartResponse.json()
            if (chartData.success && chartData.updatedContent) {
              contentToSave = chartData.updatedContent
              console.log('Auto-inserted chart:', chartData.chartId)
            }
          }
        } catch (chartErr) {
          console.error('Auto-insert chart error:', chartErr)
        }
      }

      // Auto-add poll if enabled and publishing
      // Store generated poll ID for post-save linking
      let generatedPollId: string | null = null
      if (autoAddPoll && formData.status === 'published' && formData.content.length >= 200) {
        setAutoInsertingContent('poll')
        const pollCategoryName = categories.find(c => c.id === formData.category_id)?.name
        const pollTeam = getTeamFromCategory(pollCategoryName)
        try {
          const pollResponse = await fetch('/api/admin/ai', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'poll',
              title: formData.title,
              content: contentToSave,
              category: pollCategoryName,
              team: pollTeam,
              // Pass postId if editing an existing post
              postId: isEditing ? post?.id : undefined,
            }),
          })
          if (pollResponse.ok) {
            const pollData = await pollResponse.json()
            if (pollData.success && pollData.updatedContent) {
              contentToSave = pollData.updatedContent
              generatedPollId = pollData.pollId
              console.log('Auto-added poll:', pollData.pollId, 'confidence:', pollData.confidence)
            }
          }
        } catch (pollErr) {
          console.error('Auto-add poll error:', pollErr)
        }
      }

      setAutoInsertingContent(null)

      const endpoint = isEditing ? `/api/posts/${post?.id}` : '/api/admin/posts'

      // Include social_caption in the payload if postToSocial is checked
      const payload = {
        ...formData,
        content: contentToSave, // Use potentially modified content
        category_id: formData.category_id || null,
        author_id: formData.author_id || null,
        social_caption: postToSocial ? socialCaption : (post?.social_caption || null),
        post_to_social: postToSocial && !socialAlreadyPosted && socialCaption.trim(),
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to save post')
      }

      const data = await response.json()
      const savedPost = data.post || data

      // Send push notification if checkbox is checked and post is published
      if (sendPushNotification && formData.status === 'published' && pushTitle.trim() && pushMessage.trim()) {
        try {
          const categorySlug = categories.find(c => c.id === formData.category_id)?.slug || null
          await fetch('/api/admin/notifications/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              title: pushTitle.trim(),
              body: pushMessage.trim(),
              articleId: savedPost.id,
              articleSlug: formData.slug,
              categorySlug,
            }),
          })
        } catch (pushErr) {
          console.error('Failed to send push notification:', pushErr)
        }
      }

      // Link generated poll to post if this was a new post
      if (generatedPollId && !isEditing && savedPost.id) {
        try {
          await fetch('/api/admin/polls/link', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              postId: savedPost.id,
              pollId: generatedPollId,
              position: 'after_content',
              isAutoGenerated: true,
            }),
          })
          console.log('Linked poll to new post:', savedPost.id)
        } catch (linkErr) {
          console.error('Failed to link poll to post:', linkErr)
        }
      }

      // Post to social media if conditions are met
      // Conditions: checkbox checked, not already posted, caption provided, status is published
      const shouldPostToSocial =
        postToSocial &&
        !socialAlreadyPosted &&
        socialCaption.trim() &&
        formData.status === 'published'

      if (shouldPostToSocial) {
        const articleUrl = `https://test.sportsmockery.com/${formData.slug}`
        const caption = socialCaption.trim()

        // Post to Facebook
        try {
          await fetch('/api/social/facebook', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: articleUrl, caption }),
          })
        } catch (fbErr) {
          console.error('Failed to post to Facebook:', fbErr)
        }

        // Post to X (Twitter)
        try {
          await fetch('/api/social/x', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: articleUrl, caption }),
          })
        } catch (xErr) {
          console.error('Failed to post to X:', xErr)
        }

        // Mark as social posted (update the post)
        try {
          await fetch(`/api/posts/${savedPost.id}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ...formData,
              social_posted_at: new Date().toISOString(),
            }),
          })
        } catch (updateErr) {
          console.error('Failed to update social_posted_at:', updateErr)
        }
      }

      router.push(`/admin/posts/${savedPost.id}`)
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

  // Open ideas modal
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
    <div className="fixed top-[92px] left-0 right-0 bottom-0 z-[35] flex flex-col bg-[var(--bg-primary)] mt-2">
      {/* Top Header Bar - minimal, below the red line */}
      <header className="flex-shrink-0 flex h-12 items-center justify-between border-b border-[var(--border-default)] bg-[var(--bg-secondary)] px-4">
        {/* Left: Expand arrow (when collapsed) + Breadcrumb */}
        <div className="flex items-center gap-3">
          {leftSidebarCollapsed && (
            <button
              type="button"
              onClick={() => setLeftSidebarCollapsed(false)}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--text-muted)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] transition-colors"
              title="Show sidebar"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          )}
          <nav className="flex items-center gap-1.5 text-sm">
            <Link href="/admin" className="text-[var(--text-muted)] hover:text-[var(--text-primary)]">Dashboard</Link>
            <span className="text-[var(--text-muted)]">/</span>
            <Link href="/admin/posts" className="text-[var(--text-muted)] hover:text-[var(--text-primary)]">Posts</Link>
            <span className="text-[var(--text-muted)]">/</span>
            <span className="text-[var(--text-primary)] font-medium">{isEditing ? 'Edit' : 'New'}</span>
          </nav>
        </div>

        {/* Right: Word count + Status + Save */}
        <div className="flex items-center gap-3">
          <span className="hidden sm:inline text-xs text-[var(--text-muted)]">{wordCount} words</span>

          <button
            type="button"
            onClick={() => setShowPreview(true)}
            disabled={!formData.title || !formData.content}
            className="h-8 rounded-lg border border-[var(--border-default)] bg-[var(--bg-tertiary)] px-3 text-sm text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors disabled:opacity-50 flex items-center gap-1.5"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.64 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.64 0-8.573-3.007-9.963-7.178z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Preview
          </button>

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
            onClick={() => setRightSidebarCollapsed(!rightSidebarCollapsed)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--text-muted)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] transition-colors lg:hidden"
            title="Toggle settings"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
            </svg>
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving}
            className="inline-flex h-8 items-center gap-2 rounded-lg px-4 text-sm font-medium transition-colors disabled:opacity-50"
            style={{
              backgroundColor: '#bc0000',
              color: '#ffffff',
            }}
          >
            {saving ? 'Saving...' : isEditing ? 'Update' : 'Publish'}
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Collapsible Navigation */}
        {!leftSidebarCollapsed && (
          <aside className="flex-shrink-0 w-60 border-r border-[var(--border-default)] bg-[var(--bg-secondary)] flex flex-col">
            {/* Sidebar Header with Collapse Button */}
            <div className="flex h-12 items-center justify-between border-b border-[var(--border-default)] px-4">
              <span className="text-sm font-semibold text-[var(--text-primary)]">Navigation</span>
              <button
                type="button"
                onClick={() => setLeftSidebarCollapsed(true)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--text-muted)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] transition-colors"
                title="Collapse sidebar"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <nav className="space-y-1">
              <Link
                href="/admin"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                </svg>
                Dashboard
              </Link>
              <Link
                href="/admin/posts"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-[var(--accent-red)] bg-[var(--accent-red-muted)]"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
                Posts
              </Link>
              <Link
                href="/admin/media"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                </svg>
                Media
              </Link>
            </nav>

            {/* AI Tools in Sidebar */}
            <div className="mt-6 pt-6 border-t border-[var(--border-default)]">
              <p className="px-3 mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">PostIQ Tools</p>
              <div className="space-y-1">
                <button
                  type="button"
                  onClick={() => runAI('grammar')}
                  disabled={aiLoading === 'grammar' || !formData.content}
                  className="w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] disabled:opacity-50"
                >
                  <svg className="h-5 w-5 text-purple-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {aiLoading === 'grammar' ? 'Checking...' : 'Grammar Check'}
                </button>
                <button
                  type="button"
                  onClick={() => runAI('headlines')}
                  disabled={aiLoading === 'headlines' || !formData.title || !formData.content}
                  className="w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] disabled:opacity-50"
                >
                  <svg className="h-5 w-5 text-purple-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" />
                  </svg>
                  {aiLoading === 'headlines' ? 'Generating...' : 'Headlines'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowTeamPicker(true)}
                  className="w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"
                >
                  <span className="text-lg">💡</span>
                  Generate Ideas
                </button>
                <button
                  type="button"
                  onClick={() => openChartModal()}
                  disabled={formData.content.length < 200}
                  className="w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] disabled:opacity-50"
                >
                  <svg className="h-5 w-5 text-purple-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                  </svg>
                  Add Chart
                </button>
              </div>
            </div>
            </div>
          </aside>
        )}

        {/* Main Editor Column - responsive width */}
        <main className="flex-1 overflow-y-auto">
          <div className={`mx-auto px-6 py-6 ${leftSidebarCollapsed ? 'max-w-5xl' : 'max-w-4xl'}`}>
            {/* Error - inline, dismisses automatically */}
            {error && (
              <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-500">
                {error}
              </div>
            )}

            {/* Title Input - large and prominent */}
            <input
              type="text"
              value={formData.title}
              onChange={(e) => updateField('title', e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Tab' && !e.shiftKey) {
                  e.preventDefault()
                  contentEditorRef.current?.focus()
                }
              }}
              placeholder="Article title..."
              tabIndex={1}
              className="mb-2 w-full border-0 bg-transparent p-0 text-3xl font-bold text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-0"
            />

            {/* Slug/URL */}
            <div className="mb-6 flex items-center gap-2 text-sm text-[var(--text-muted)]">
              <span className="flex-shrink-0">sportsmockery.com/</span>
              {slugEditable ? (
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => updateField('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-/]/g, '-'))}
                  placeholder="category/article-slug"
                  className="flex-1 border-0 bg-transparent p-0 text-[var(--text-secondary)] focus:outline-none focus:ring-0"
                  autoFocus
                />
              ) : (
                <span className="flex-1 text-[var(--text-secondary)] truncate">
                  {formData.slug || 'category/article-slug'}
                </span>
              )}
              <button
                type="button"
                onClick={() => setSlugEditable(!slugEditable)}
                className="flex-shrink-0 px-2 py-1 text-xs font-medium rounded border border-[var(--border-default)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--text-muted)] transition-colors"
              >
                {slugEditable ? 'Done' : 'Edit'}
              </button>
            </div>

            {/* Alternative Headlines */}
            {headlines.length > 0 && (
              <div className="mb-6 rounded-lg border border-purple-500/30 bg-purple-500/5 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-wide text-purple-500">Alternative Headlines</p>
                  <button type="button" onClick={() => setHeadlines([])} className="text-[var(--text-muted)] hover:text-[var(--text-primary)]">
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

            {/* Content Editor - extends to fill space */}
            <div
              className={`mb-6 overflow-hidden rounded-lg border bg-white dark:bg-gray-900 ${
                highlightMode
                  ? 'border-purple-500 ring-2 ring-purple-500/20'
                  : 'border-[var(--border-default)]'
              }`}
              onMouseUp={handleContentSelection}
            >
              {highlightMode && (
                <div className="bg-purple-500/10 border-b border-purple-500/30 px-4 py-2 text-sm text-purple-600 dark:text-purple-400 flex items-center gap-2">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Select the text containing data you want to chart
                </div>
              )}
              <RichTextEditor
                ref={contentEditorRef}
                content={formData.content}
                onChange={(content) => updateField('content', content)}
                placeholder="Start writing your article..."
              />
            </div>

            {/* SEO Section - Below Content */}
            <div className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-card)]">
              <button
                type="button"
                onClick={() => setSeoExpanded(!seoExpanded)}
                className="flex w-full items-center justify-between px-4 py-3 text-left"
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-[var(--text-primary)]">SEO Settings</span>
                  {generatingSEO && (
                    <svg className="h-4 w-4 animate-spin text-purple-500" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  )}
                  {seoGenerated && !generatingSEO && (
                    <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-medium text-emerald-500">Auto-generated</span>
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
                  <svg
                    className={`h-4 w-4 text-[var(--text-muted)] transition-transform ${seoExpanded ? 'rotate-180' : ''}`}
                    fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </div>
              </button>

              {seoExpanded && (
                <div className="border-t border-[var(--border-default)] p-4 space-y-4">
                  {wordCount < 150 && !seoGenerated && (
                    <p className="rounded-lg bg-amber-500/10 px-3 py-2 text-xs text-amber-600 dark:text-amber-400">
                      SEO fields will auto-generate when content reaches 150+ words ({wordCount}/150)
                    </p>
                  )}

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

                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-[var(--text-muted)]">Excerpt</label>
                    <textarea
                      value={formData.excerpt}
                      onChange={(e) => updateField('excerpt', e.target.value)}
                      rows={2}
                      placeholder="Brief summary for article cards..."
                      className="w-full resize-none rounded-lg border border-[var(--border-default)] bg-[var(--bg-tertiary)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:border-[var(--accent-red)] focus:outline-none"
                    />
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

        {/* Right Sidebar - Settings Only */}
        <aside
          className={`flex-shrink-0 border-l border-[var(--border-default)] bg-[var(--bg-secondary)] transition-all duration-300 overflow-hidden ${
            rightSidebarCollapsed ? 'w-0 lg:w-0' : 'w-72'
          } hidden lg:block`}
        >
          <div className="h-full overflow-y-auto p-4">
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">Settings</h3>

            <div className="space-y-4">
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

              {/* Push Notification */}
              <div className="border-t border-[var(--border-default)] pt-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={sendPushNotification}
                    onChange={(e) => {
                      setSendPushNotification(e.target.checked)
                      if (e.target.checked && formData.title && !pushTitle) {
                        setPushTitle(formData.title.slice(0, 65))
                      }
                    }}
                    className="h-4 w-4 rounded border-[var(--border-default)] text-[var(--accent-red)] focus:ring-[var(--accent-red)]"
                  />
                  <span className="text-sm font-medium text-[var(--text-primary)]">Send Push Notification</span>
                </label>
                <p className="mt-1 text-xs text-[var(--text-muted)] ml-6">SM App push notification will be sent upon publishing</p>

                {sendPushNotification && (
                  <div className="mt-4 space-y-4">
                    {/* Push Title */}
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-[var(--text-muted)]">Push Title</label>
                      <input
                        type="text"
                        value={pushTitle}
                        onChange={(e) => setPushTitle(e.target.value.slice(0, 65))}
                        placeholder="Breaking News: ..."
                        maxLength={65}
                        className="w-full rounded-lg border border-[var(--border-default)] bg-[var(--bg-tertiary)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:border-[var(--accent-red)] focus:outline-none"
                      />
                      <p className={`mt-1 text-xs text-right ${pushTitle.length >= 60 ? 'text-amber-500' : 'text-[var(--text-muted)]'}`}>
                        {pushTitle.length}/65
                      </p>
                    </div>

                    {/* Push Message */}
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-[var(--text-muted)]">Push Message</label>
                      <textarea
                        value={pushMessage}
                        onChange={(e) => setPushMessage(e.target.value.slice(0, 240))}
                        placeholder="Tap to read the full story..."
                        maxLength={240}
                        rows={3}
                        className="w-full resize-none rounded-lg border border-[var(--border-default)] bg-[var(--bg-tertiary)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:border-[var(--accent-red)] focus:outline-none"
                      />
                      <p className={`mt-1 text-xs text-right ${pushMessage.length >= 220 ? 'text-amber-500' : 'text-[var(--text-muted)]'}`}>
                        {pushMessage.length}/240
                      </p>
                    </div>

                    {/* Push Preview */}
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-[var(--text-muted)]">Preview</label>
                      <div className="rounded-xl bg-white p-3 shadow-lg dark:bg-gray-800">
                        <div className="flex items-start gap-3">
                          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-[#bc0000]">
                            <span className="text-xs font-bold text-white">SM</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">Sports Mockery</span>
                              <span className="text-[10px] text-gray-400">now</span>
                            </div>
                            <p className="mt-0.5 truncate text-sm font-semibold text-gray-900 dark:text-white">
                              {pushTitle || 'Notification Title'}
                            </p>
                            <p className="line-clamp-2 text-xs text-gray-600 dark:text-gray-300">
                              {pushMessage || 'Your notification message will appear here...'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Social Media Posting */}
              <div className="border-t border-[var(--border-default)] pt-4">
                <label className={`flex items-center gap-2 ${socialAlreadyPosted ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}>
                  <input
                    type="checkbox"
                    checked={postToSocial}
                    onChange={(e) => setPostToSocial(e.target.checked)}
                    disabled={socialAlreadyPosted}
                    className="h-4 w-4 rounded border-[var(--border-default)] text-[var(--accent-red)] focus:ring-[var(--accent-red)] disabled:opacity-50"
                  />
                  <span className="text-sm font-medium text-[var(--text-primary)]">Post to Social Media</span>
                </label>
                {socialAlreadyPosted ? (
                  <p className="mt-1 text-xs text-amber-600 dark:text-amber-400 ml-6">
                    Already posted to social media. Auto-posting disabled to avoid duplicates.
                  </p>
                ) : (
                  <p className="mt-1 text-xs text-[var(--text-muted)] ml-6">Post to Facebook and X when publishing</p>
                )}

                {postToSocial && !socialAlreadyPosted && (
                  <div className="mt-4 space-y-4">
                    {/* Social Caption */}
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-[var(--text-muted)]">Social Post Text</label>
                      <textarea
                        value={socialCaption}
                        onChange={(e) => setSocialCaption(e.target.value)}
                        placeholder="Write your social media caption..."
                        rows={3}
                        className="w-full resize-none rounded-lg border border-[var(--border-default)] bg-[var(--bg-tertiary)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:border-[var(--accent-red)] focus:outline-none"
                      />
                      <p className="mt-1 text-xs text-[var(--text-muted)]">
                        This text appears above the article card on Facebook and X. The link card with image and headline is generated automatically.
                      </p>
                    </div>

                    {/* X (Twitter) Preview */}
                    <div>
                      <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-[var(--text-muted)]">
                        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                        </svg>
                        X Preview
                      </label>
                      <div className="rounded-xl border border-[var(--border-default)] bg-white dark:bg-black overflow-hidden">
                        <div className="p-3">
                          <div className="flex gap-3">
                            <Image src="/sm-logo-preview.png" alt="Sports Mockery" width={40} height={40} className="flex-shrink-0 h-10 w-10 rounded-full bg-white p-1" />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1">
                                <span className="font-bold text-sm text-gray-900 dark:text-white">Sports Mockery</span>
                                <svg className="h-4 w-4 text-[#1d9bf0]" viewBox="0 0 24 24" fill="currentColor">
                                  <path d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.71-3.998-3.818-3.998-.47 0-.92.084-1.336.25C14.818 2.415 13.51 1.5 12 1.5s-2.816.917-3.437 2.25c-.415-.165-.866-.25-1.336-.25-2.11 0-3.818 1.79-3.818 4 0 .494.083.964.237 1.4-1.272.65-2.147 2.018-2.147 3.6 0 1.495.782 2.798 1.942 3.486-.02.17-.032.34-.032.514 0 2.21 1.708 4 3.818 4 .47 0 .92-.086 1.335-.25.62 1.334 1.926 2.25 3.437 2.25 1.512 0 2.818-.916 3.437-2.25.415.163.865.248 1.336.248 2.11 0 3.818-1.79 3.818-4 0-.174-.012-.344-.033-.513 1.158-.687 1.943-1.99 1.943-3.484zm-6.616-3.334l-4.334 6.5c-.145.217-.382.334-.625.334-.143 0-.288-.04-.416-.126l-.115-.094-2.415-2.415c-.293-.293-.293-.768 0-1.06s.768-.294 1.06 0l1.77 1.767 3.825-5.74c.23-.345.696-.436 1.04-.207.346.23.44.696.21 1.04z" />
                                </svg>
                                <span className="text-sm text-gray-500">@SportsMockery · now</span>
                              </div>
                              <p className="mt-1 text-sm text-gray-900 dark:text-white whitespace-pre-wrap">
                                {socialCaption || 'Your post text will appear here...'}
                              </p>
                              {/* X Link Card */}
                              <div className="mt-3 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                                {formData.featured_image ? (
                                  <div className="relative aspect-[1.91/1] bg-gray-100 dark:bg-gray-800">
                                    <Image src={formData.featured_image} alt="Article preview" fill className="object-cover" />
                                  </div>
                                ) : (
                                  <div className="aspect-[1.91/1] bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                                    <span className="text-xs text-gray-400">Featured image</span>
                                  </div>
                                )}
                                <div className="p-3 bg-white dark:bg-gray-900">
                                  <p className="text-xs text-gray-500">sportsmockery.com</p>
                                  <p className="font-medium text-sm text-gray-900 dark:text-white truncate">{formData.title || 'Article Title'}</p>
                                  <p className="text-xs text-gray-500 line-clamp-2">{formData.excerpt || formData.seo_description || 'Article description...'}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Facebook Preview */}
                    <div>
                      <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-[var(--text-muted)]">
                        <svg className="h-3.5 w-3.5 text-[#1877f2]" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                        </svg>
                        Facebook Preview
                      </label>
                      <div className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#242526] overflow-hidden">
                        <div className="p-3">
                          <div className="flex gap-2">
                            <Image src="/sm-logo-preview.png" alt="Sports Mockery" width={40} height={40} className="flex-shrink-0 h-10 w-10 rounded-full bg-white p-1" />
                            <div>
                              <p className="font-semibold text-sm text-gray-900 dark:text-white">Sports Mockery</p>
                              <p className="text-xs text-gray-500">Just now · <svg className="inline h-3 w-3" fill="currentColor" viewBox="0 0 16 16"><path d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8zm7.5-6.923c-.67.204-1.335.82-1.887 1.855A7.97 7.97 0 0 0 5.145 4H7.5V1.077zM4.09 4a9.267 9.267 0 0 1 .64-1.539 6.7 6.7 0 0 1 .597-.933A7.025 7.025 0 0 0 2.255 4H4.09zm-.582 3.5c.03-.877.138-1.718.312-2.5H1.674a6.958 6.958 0 0 0-.656 2.5h2.49zM4.847 5a12.5 12.5 0 0 0-.338 2.5H7.5V5H4.847zM8.5 5v2.5h2.99a12.495 12.495 0 0 0-.337-2.5H8.5zM4.51 8.5a12.5 12.5 0 0 0 .337 2.5H7.5V8.5H4.51zm3.99 0V11h2.653c.187-.765.306-1.608.338-2.5H8.5zM5.145 12c.138.386.295.744.468 1.068.552 1.035 1.218 1.65 1.887 1.855V12H5.145zm.182 2.472a6.696 6.696 0 0 1-.597-.933A9.268 9.268 0 0 1 4.09 12H2.255a7.024 7.024 0 0 0 3.072 2.472zM3.82 11a13.652 13.652 0 0 1-.312-2.5h-2.49c.062.89.291 1.733.656 2.5H3.82zm6.853 3.472A7.024 7.024 0 0 0 13.745 12H11.91a9.27 9.27 0 0 1-.64 1.539 6.688 6.688 0 0 1-.597.933zM8.5 12v2.923c.67-.204 1.335-.82 1.887-1.855.173-.324.33-.682.468-1.068H8.5zm3.68-1h2.146c.365-.767.594-1.61.656-2.5h-2.49a13.65 13.65 0 0 1-.312 2.5zm2.802-3.5a6.959 6.959 0 0 0-.656-2.5H12.18c.174.782.282 1.623.312 2.5h2.49zM11.27 2.461c.247.464.462.98.64 1.539h1.835a7.024 7.024 0 0 0-3.072-2.472c.218.284.418.598.597.933zM10.855 4a7.966 7.966 0 0 0-.468-1.068C9.835 1.897 9.17 1.282 8.5 1.077V4h2.355z"/></svg></p>
                            </div>
                          </div>
                          <p className="mt-3 text-sm text-gray-900 dark:text-[#e4e6eb]">
                            {socialCaption || 'Your post text will appear here...'}
                          </p>
                        </div>
                        {/* Facebook Link Card */}
                        <div className="border-t border-gray-200 dark:border-gray-700">
                          {formData.featured_image ? (
                            <div className="relative aspect-[1.91/1] bg-gray-100 dark:bg-gray-800">
                              <Image src={formData.featured_image} alt="Article preview" fill className="object-cover" />
                            </div>
                          ) : (
                            <div className="aspect-[1.91/1] bg-gray-100 dark:bg-[#3a3b3c] flex items-center justify-center">
                              <span className="text-xs text-gray-400">Featured image</span>
                            </div>
                          )}
                          <div className="p-3 bg-[#f0f2f5] dark:bg-[#3a3b3c]">
                            <p className="text-xs uppercase text-gray-500 dark:text-gray-400">sportsmockery.com</p>
                            <p className="font-semibold text-sm text-gray-900 dark:text-[#e4e6eb] truncate">{formData.title || 'Article Title'}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">{formData.excerpt || formData.seo_description || 'Article description...'}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {socialAlreadyPosted && post?.social_caption && (
                  <div className="mt-4">
                    <label className="mb-1.5 block text-xs font-medium text-[var(--text-muted)]">Posted Caption</label>
                    <div className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-tertiary)] px-3 py-2 text-sm text-[var(--text-muted)]">
                      {post.social_caption}
                    </div>
                  </div>
                )}
              </div>

              {/* PostIQ Auto-Insert Features */}
              <div className="border-t border-[var(--border-default)] pt-4">
                <div className="flex items-center gap-2 mb-3">
                  <svg className="w-4 h-4 text-[var(--accent-red)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">PostIQ Auto-Insert</span>
                </div>

                {/* Auto-Insert Chart */}
                <label className="flex items-start gap-2 cursor-pointer mb-3">
                  <input
                    type="checkbox"
                    checked={autoInsertChart}
                    onChange={(e) => setAutoInsertChart(e.target.checked)}
                    className="h-4 w-4 mt-0.5 rounded border-[var(--border-default)] text-[var(--accent-red)] focus:ring-[var(--accent-red)]"
                  />
                  <div>
                    <span className="text-sm font-medium text-[var(--text-primary)]">Insert Chart</span>
                    <p className="text-xs text-[var(--text-muted)]">
                      PostIQ will analyze content and add a relevant chart when publishing
                    </p>
                  </div>
                </label>

                {/* Auto-Add Poll */}
                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoAddPoll}
                    onChange={(e) => setAutoAddPoll(e.target.checked)}
                    className="h-4 w-4 mt-0.5 rounded border-[var(--border-default)] text-[var(--accent-red)] focus:ring-[var(--accent-red)]"
                  />
                  <div>
                    <span className="text-sm font-medium text-[var(--text-primary)]">Add Poll</span>
                    <p className="text-xs text-[var(--text-muted)]">
                      PostIQ will create a fan engagement poll based on article content
                    </p>
                  </div>
                </label>

                {autoInsertingContent && (
                  <div className="mt-3 flex items-center gap-2 text-xs text-[var(--accent-red)]">
                    <div className="h-3 w-3 border-2 border-[var(--accent-red)] border-t-transparent rounded-full animate-spin" />
                    <span>PostIQ is generating {autoInsertingContent}...</span>
                  </div>
                )}
              </div>

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
                  <div className="relative">
                    <input
                      type="file"
                      id="featured-image-upload"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-[var(--border-default)] bg-[var(--bg-tertiary)] py-4 hover:border-[var(--accent-red)] transition-colors">
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
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* PostIQ Tools */}
            <div className="mt-6 pt-6 border-t border-[var(--border-default)]">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-purple-500">PostIQ Tools</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => runAI('headlines')}
                  disabled={aiLoading === 'headlines' || !formData.title || !formData.content}
                  className="flex flex-col items-center justify-center gap-1 rounded-lg border border-[var(--border-default)] bg-[var(--bg-tertiary)] p-3 text-[var(--text-secondary)] hover:border-purple-500 hover:bg-purple-500/5 transition-colors disabled:opacity-50"
                >
                  <svg className="h-5 w-5 text-purple-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" />
                  </svg>
                  <span className="text-xs font-medium">{aiLoading === 'headlines' ? 'Loading...' : 'Headlines'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => runAI('grammar')}
                  disabled={aiLoading === 'grammar' || !formData.content}
                  className="flex flex-col items-center justify-center gap-1 rounded-lg border border-[var(--border-default)] bg-[var(--bg-tertiary)] p-3 text-[var(--text-secondary)] hover:border-purple-500 hover:bg-purple-500/5 transition-colors disabled:opacity-50"
                >
                  <svg className="h-5 w-5 text-purple-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-xs font-medium">{aiLoading === 'grammar' ? 'Checking...' : 'Grammar'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowTeamPicker(true)}
                  className="flex flex-col items-center justify-center gap-1 rounded-lg border border-[var(--border-default)] bg-[var(--bg-tertiary)] p-3 text-[var(--text-secondary)] hover:border-purple-500 hover:bg-purple-500/5 transition-colors"
                >
                  <span className="text-lg">💡</span>
                  <span className="text-xs font-medium">Ideas</span>
                </button>
                <button
                  type="button"
                  onClick={() => openChartModal()}
                  disabled={formData.content.length < 200}
                  className="flex flex-col items-center justify-center gap-1 rounded-lg border border-[var(--border-default)] bg-[var(--bg-tertiary)] p-3 text-[var(--text-secondary)] hover:border-purple-500 hover:bg-purple-500/5 transition-colors disabled:opacity-50"
                >
                  <svg className="h-5 w-5 text-purple-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                  </svg>
                  <span className="text-xs font-medium">Add Chart</span>
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="mt-6 pt-6 border-t border-[var(--border-default)]">
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

            {/* Keyboard Shortcut */}
            <div className="mt-4 text-center">
              <p className="text-xs text-[var(--text-muted)]">
                <kbd className="rounded bg-[var(--bg-primary)] px-1.5 py-0.5 font-mono text-[var(--text-secondary)]">⌘S</kbd> to save
              </p>
            </div>
          </div>
        </aside>
      </div>

      {/* Ideas Modal */}
      {showIdeasModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-lg overflow-hidden rounded-xl bg-white shadow-2xl dark:bg-[#1c1c1f]">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-700">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">💡 Article Ideas</h3>
              <button type="button" onClick={() => setShowIdeasModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
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
            <div className="flex items-center gap-3 border-t border-gray-200 bg-gray-50 px-6 py-4 dark:border-gray-700 dark:bg-gray-800/50">
              <button type="button" onClick={() => generateIdeas()} disabled={loadingIdeas} className="text-sm font-medium text-purple-500 hover:text-purple-400 disabled:opacity-50">
                ↻ Generate More
              </button>
              <div className="flex-1" />
              <button type="button" onClick={() => setShowIdeasModal(false)} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
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

      {/* Team Picker Modal for Ideas */}
      {showTeamPicker && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-sm overflow-hidden rounded-xl bg-white shadow-2xl dark:bg-[#1c1c1f]">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-700">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Generate Ideas</h3>
              <button type="button" onClick={() => setShowTeamPicker(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4 space-y-2">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Select a team to generate article ideas for:</p>
              {[
                { value: '', label: 'Auto-detect from category', icon: '🎯' },
                { value: 'Bears', label: 'Chicago Bears', icon: '🐻' },
                { value: 'Bulls', label: 'Chicago Bulls', icon: '🐂' },
                { value: 'Blackhawks', label: 'Chicago Blackhawks', icon: '🏒' },
                { value: 'Cubs', label: 'Chicago Cubs', icon: '🐻' },
                { value: 'White Sox', label: 'Chicago White Sox', icon: '⚾' },
              ].map((team) => (
                <button
                  key={team.value || 'auto'}
                  type="button"
                  onClick={() => {
                    setShowTeamPicker(false)
                    generateIdeas(team.value || undefined)
                  }}
                  className="w-full flex items-center gap-3 rounded-lg border-2 border-gray-200 px-4 py-3 text-left transition-all hover:border-purple-400 hover:bg-purple-50 dark:border-gray-700 dark:hover:border-purple-500 dark:hover:bg-purple-500/10"
                >
                  <span className="text-xl">{team.icon}</span>
                  <span className="font-medium text-gray-900 dark:text-white">{team.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Highlight Mode Floating Toolbar */}
      {highlightMode && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[70] flex items-center gap-3 rounded-full bg-purple-600 px-6 py-3 shadow-2xl">
          <svg className="h-5 w-5 text-white animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
          <span className="text-white font-medium">
            {highlightedText ? `Selected: "${highlightedText.slice(0, 30)}${highlightedText.length > 30 ? '...' : ''}"` : 'Select data in your article...'}
          </span>
          {highlightedText && (
            <button
              onClick={handleUseHighlightedData}
              className="ml-2 rounded-full bg-white px-4 py-1.5 text-sm font-semibold text-purple-600 hover:bg-purple-50 transition-colors"
            >
              Use This Data
            </button>
          )}
          <button
            onClick={cancelHighlightMode}
            className="ml-2 rounded-full p-1.5 text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Chart Builder Modal with Live Preview */}
      {showChartModal && (
        <ChartBuilderModal
          isOpen={showChartModal}
          onClose={() => {
            setShowChartModal(false)
            setInitialChartConfig(null)
            setChartAiSuggestion(null)
          }}
          onInsert={handleChartInsert}
          onHighlightData={handleHighlightData}
          initialConfig={initialChartConfig || undefined}
          aiSuggestion={chartAiSuggestion}
          isLoading={chartLoading}
          team={getTeamFromCategory(categories.find(c => c.id === formData.category_id)?.name) || 'bears'}
        />
      )}

      {/* PostIQ Real-Time Chart Generator - detects chartable data as you type */}
      {!showChartModal && !highlightMode && !showPreview && (
        <PostIQChartGenerator
          content={formData.content}
          title={formData.title}
          category={categories.find(c => c.id === formData.category_id)?.name}
          team={getTeamFromCategory(categories.find(c => c.id === formData.category_id)?.name) || 'bears'}
          debounceMs={1500}
          minContentLength={300}
          showIndicator={true}
          indicatorPosition="bottom-right"
          onChartInsert={(chartId, shortcode, updatedContent) => {
            setFormData(prev => ({ ...prev, content: updatedContent }))
          }}
        />
      )}

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-zinc-900">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-zinc-700">
              <div className="flex items-center gap-3">
                <svg className="h-5 w-5 text-purple-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.64 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.64 0-8.573-3.007-9.963-7.178z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Article Preview</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowPreview(false)}
                className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-zinc-800 dark:hover:text-gray-200"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Preview Content */}
            <div className="overflow-y-auto max-h-[calc(90vh-80px)] p-8">
              {/* Category Badge */}
              {formData.category_id && (
                <span className="inline-block rounded-full bg-[#bc0000] px-3 py-1 text-xs font-medium text-white mb-4">
                  {categories.find(c => c.id === formData.category_id)?.name || 'Uncategorized'}
                </span>
              )}

              {/* Featured Image */}
              {formData.featured_image && (
                <div className="relative aspect-video w-full overflow-hidden rounded-xl mb-6">
                  <Image
                    src={formData.featured_image}
                    alt={formData.title}
                    fill
                    className="object-cover"
                  />
                </div>
              )}

              {/* Title */}
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                {formData.title || 'Untitled Article'}
              </h1>

              {/* Meta */}
              <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-6 pb-6 border-b border-gray-200 dark:border-zinc-700">
                <span>{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                <span>•</span>
                <span>{Math.ceil(wordCount / 200)} min read</span>
              </div>

              {/* Excerpt */}
              {formData.excerpt && (
                <p className="text-lg text-gray-600 dark:text-gray-300 italic mb-6">
                  {formData.excerpt}
                </p>
              )}

              {/* Content */}
              <div
                className="prose prose-lg max-w-none dark:prose-invert prose-headings:font-bold prose-p:text-gray-700 dark:prose-p:text-gray-300"
                dangerouslySetInnerHTML={{ __html: formData.content || '<p class="text-gray-400">No content yet...</p>' }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
