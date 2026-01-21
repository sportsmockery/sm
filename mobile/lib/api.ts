/**
 * Sports Mockery API Client
 *
 * This client fetches ALL data from the website APIs.
 * The mobile app is a thin client - no local content storage.
 * When the website is updated, the app gets fresh data on next fetch.
 */

import { API_BASE_URL } from './config'

// Types matching the website's API responses
export interface Author {
  id: number
  display_name: string
  avatar_url?: string
}

export interface Category {
  slug: string
  name: string
}

export interface Post {
  id: number
  title: string
  slug: string
  excerpt: string | null
  featured_image: string | null
  published_at: string
  views: number
  importance_score: number
  author: Author
  category: Category
  final_score?: number
}

export interface FeedResponse {
  featured: Post | null
  topHeadlines: Post[]
  latestNews: Post[]
  teamSections: Record<string, Post[]>
  trending: Post[]
  meta: {
    total: number
    viewedCount: number
    isAuthenticated: boolean
  }
}

export interface ArticleContent {
  id: number
  title: string
  slug: string
  content_html: string
  excerpt: string | null
  featured_image: string | null
  published_at: string
  views: number
  author: Author
  category: Category
  seo_title?: string
  seo_description?: string
  related_posts?: Post[]
}

export interface ChatMessage {
  id: string
  room_id: string
  user_id: string
  content: string
  content_type: 'text' | 'gif'
  gif_url?: string
  created_at: string
  user: {
    id: string
    username: string
    avatar_url?: string
    badge?: string
  }
}

export interface AskAIResponse {
  response: string
  source: string
  team?: string
  teamDisplayName?: string
  sport?: string
  suggestions?: string[]
  relatedArticles?: Post[]
}

export interface MobileConfig {
  ads: {
    enabled: boolean
    admob: {
      enabled: boolean
      ios_banner_id?: string
      ios_interstitial_id?: string
      android_banner_id?: string
      android_interstitial_id?: string
      interstitial_frequency: number // Show every N articles
    }
    custom: {
      enabled: boolean
      placements: {
        feed_top?: string    // Custom HTML/JS for feed top
        feed_inline?: string // Custom HTML/JS between articles
        article_top?: string
        article_bottom?: string
      }
    }
  }
  features: {
    fan_chat_enabled: boolean
    ask_ai_enabled: boolean
    push_notifications_enabled: boolean
    dark_mode_enabled: boolean
  }
  force_update?: {
    required: boolean
    min_version: string
    message: string
    store_url: string
  }
}

export interface Poll {
  id: string
  question: string
  options: { id: string; text: string; votes: number }[]
  total_votes: number
  user_voted?: string // Option ID user voted for
  expires_at?: string
}

class ApiClient {
  private baseUrl: string
  private authToken: string | null = null

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }

  setAuthToken(token: string | null) {
    this.authToken = token
  }

  private async fetch<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Client': 'sportsmockery-mobile',
      ...(options.headers as Record<string, string>),
    }

    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`
    }

    const response = await fetch(url, {
      ...options,
      headers,
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }))
      throw new Error(error.error || `API error: ${response.status}`)
    }

    return response.json()
  }

  // ============================================
  // FEED & ARTICLES - Syncs with website content
  // ============================================

  /**
   * Get personalized feed
   * Returns fresh content from the website
   */
  async getFeed(options?: {
    viewedIds?: number[]
    teamPreferences?: string[]
  }): Promise<FeedResponse> {
    if (options?.viewedIds || options?.teamPreferences) {
      return this.fetch<FeedResponse>('/api/feed', {
        method: 'POST',
        body: JSON.stringify({
          viewed_ids: options.viewedIds || [],
          team_preferences: options.teamPreferences || [],
        }),
      })
    }
    return this.fetch<FeedResponse>('/api/feed')
  }

  /**
   * Get full article content by ID
   * Always fetches fresh from website
   */
  async getArticle(articleId: number): Promise<ArticleContent> {
    const response = await this.fetch<{ post: any }>(`/api/posts/${articleId}`)
    const post = response.post

    // Transform to ArticleContent format
    return {
      id: post.id,
      title: post.title,
      slug: post.slug,
      content_html: post.content || '',
      excerpt: post.excerpt,
      featured_image: post.featured_image,
      published_at: post.published_at,
      views: post.views || 0,
      author: post.author || { id: 0, display_name: 'Staff' },
      category: post.category || { slug: 'news', name: 'News' },
      seo_title: post.seo_title,
      seo_description: post.seo_description,
      related_posts: [],
    }
  }

  /**
   * Get articles by category/team
   */
  async getTeamArticles(
    teamSlug: string,
    options?: { page?: number; limit?: number }
  ): Promise<{ posts: Post[]; hasMore: boolean }> {
    const params = new URLSearchParams()
    if (options?.page) params.set('page', options.page.toString())
    if (options?.limit) params.set('limit', options.limit.toString())

    return this.fetch(`/api/team/${teamSlug}?${params}`)
  }

  /**
   * Record article view (for analytics and personalization)
   */
  async recordView(postId: number): Promise<void> {
    await this.fetch(`/api/views/${postId}`, { method: 'POST' })
  }

  // ============================================
  // FAN CHAT - Real-time via Supabase
  // ============================================

  /**
   * Get chat messages for a room
   */
  async getChatMessages(
    roomId: string,
    options?: { before?: string; limit?: number }
  ): Promise<{ messages: ChatMessage[]; hasMore: boolean }> {
    const params = new URLSearchParams({ roomId })
    if (options?.before) params.set('before', options.before)
    if (options?.limit) params.set('limit', options.limit.toString())

    return this.fetch(`/api/chat/messages?${params}`)
  }

  /**
   * Send a chat message
   */
  async sendChatMessage(
    roomId: string,
    content: string,
    options?: { contentType?: 'text' | 'gif'; gifUrl?: string; replyToId?: string }
  ): Promise<{ success: boolean; message: ChatMessage }> {
    return this.fetch('/api/chat/messages', {
      method: 'POST',
      body: JSON.stringify({
        roomId,
        content,
        contentType: options?.contentType || 'text',
        gifUrl: options?.gifUrl,
        replyToId: options?.replyToId,
      }),
    })
  }

  // ============================================
  // ASK AI - Proxied through website
  // ============================================

  /**
   * Ask the Mockery AI a question
   */
  async askAI(query: string): Promise<AskAIResponse> {
    return this.fetch('/api/ask-ai', {
      method: 'POST',
      body: JSON.stringify({ query }),
    })
  }

  // ============================================
  // POLLS
  // ============================================

  /**
   * Get a poll by ID
   */
  async getPoll(pollId: string): Promise<Poll> {
    return this.fetch(`/api/polls/${pollId}`)
  }

  /**
   * Vote on a poll
   */
  async votePoll(pollId: string, optionId: string): Promise<Poll> {
    return this.fetch(`/api/polls/${pollId}/vote`, {
      method: 'POST',
      body: JSON.stringify({ optionId }),
    })
  }

  // ============================================
  // MOBILE CONFIG - Ad settings, feature flags
  // ============================================

  /**
   * Get mobile app configuration
   * Includes ad settings controlled from admin panel
   */
  async getMobileConfig(): Promise<MobileConfig> {
    return this.fetch('/api/mobile/config')
  }

  // ============================================
  // TEAM DATA - Rosters, schedules, stats
  // ============================================

  /**
   * Get Bears roster
   */
  async getBearsRoster(): Promise<any> {
    return this.fetch('/api/bears/roster')
  }

  /**
   * Get Bears schedule
   */
  async getBearsSchedule(): Promise<any> {
    return this.fetch('/api/bears/schedule')
  }

  /**
   * Get Bears stats
   */
  async getBearsStats(): Promise<any> {
    return this.fetch('/api/bears/stats')
  }

  // ============================================
  // SEARCH
  // ============================================

  /**
   * Search articles
   */
  async search(query: string, options?: { team?: string; limit?: number }): Promise<Post[]> {
    const params = new URLSearchParams({ q: query })
    if (options?.team) params.set('team', options.team)
    if (options?.limit) params.set('limit', options.limit.toString())

    const response = await this.fetch<{ results: Post[] }>(`/api/search?${params}`)
    return response.results
  }

  // ============================================
  // AUDIO
  // ============================================

  /**
   * Get audio URL for an article
   */
  getAudioUrl(slug: string, voice: string = 'will'): string {
    return `${this.baseUrl}/api/audio/${slug}?voice=${voice}`
  }

  /**
   * Get next article for audio playlist
   */
  async getNextAudioArticle(
    currentArticleId: number,
    mode: 'team' | 'recent',
    team?: string
  ): Promise<{ id: number; title: string; slug: string; team?: string } | null> {
    const params = new URLSearchParams({
      articleId: currentArticleId.toString(),
      mode,
    })
    if (team) params.set('team', team)

    try {
      const response = await this.fetch<{
        article: { id: number; title: string; slug: string; team?: string } | null
      }>(`/api/audio/next?${params}`)
      return response.article
    } catch (err) {
      console.error('Failed to get next audio article:', err)
      return null
    }
  }

  /**
   * Get first article for audio playlist
   */
  async getFirstAudioArticle(
    mode: 'team' | 'recent',
    team?: string
  ): Promise<{ id: number; title: string; slug: string; team?: string } | null> {
    try {
      if (mode === 'team' && team) {
        // Get first article from team
        const response = await this.getTeamArticles(team, { limit: 1 })
        if (response.posts && response.posts.length > 0) {
          const post = response.posts[0]
          return { id: post.id, title: post.title, slug: post.slug, team }
        }
      } else {
        // Get first recent article
        const response = await this.getFeed()
        if (response.latestNews && response.latestNews.length > 0) {
          const post = response.latestNews[0]
          return { id: post.id, title: post.title, slug: post.slug }
        }
      }
      return null
    } catch (err) {
      console.error('Failed to get first audio article:', err)
      return null
    }
  }
}

// Export singleton instance
export const api = new ApiClient(API_BASE_URL)

// Export class for testing
export { ApiClient }
