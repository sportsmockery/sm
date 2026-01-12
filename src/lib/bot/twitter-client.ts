/**
 * Twitter/X API Client for SportsMockery Bot
 *
 * Uses Twitter API v2 for community monitoring and posting
 */

import type { XTweet, XUser, XSearchResponse } from './types'

// =============================================================================
// CLIENT CONFIGURATION
// =============================================================================

interface TwitterClientConfig {
  apiKey: string
  apiSecret: string
  accessToken: string
  accessTokenSecret: string
  bearerToken: string
}

// OAuth 1.0a signature generation for user-context requests
async function generateOAuthSignature(
  method: string,
  url: string,
  params: Record<string, string>,
  config: TwitterClientConfig
): Promise<string> {
  const timestamp = Math.floor(Date.now() / 1000).toString()
  const nonce = crypto.randomUUID().replace(/-/g, '')

  const oauthParams: Record<string, string> = {
    oauth_consumer_key: config.apiKey,
    oauth_nonce: nonce,
    oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp: timestamp,
    oauth_token: config.accessToken,
    oauth_version: '1.0',
  }

  // Combine all params for signature base
  const allParams = { ...params, ...oauthParams }
  const sortedKeys = Object.keys(allParams).sort()
  const paramString = sortedKeys
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(allParams[key])}`)
    .join('&')

  const signatureBase = [
    method.toUpperCase(),
    encodeURIComponent(url),
    encodeURIComponent(paramString),
  ].join('&')

  const signingKey = `${encodeURIComponent(config.apiSecret)}&${encodeURIComponent(config.accessTokenSecret)}`

  // Use Web Crypto API for HMAC-SHA1
  const encoder = new TextEncoder()
  const keyData = encoder.encode(signingKey)
  const msgData = encoder.encode(signatureBase)

  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-1' },
    false,
    ['sign']
  )

  const signature = await crypto.subtle.sign('HMAC', cryptoKey, msgData)
  const signatureBase64 = btoa(String.fromCharCode(...new Uint8Array(signature)))

  // Build OAuth header
  const oauthWithSignature: Record<string, string> = {
    ...oauthParams,
    oauth_signature: signatureBase64,
  }

  const headerString = Object.keys(oauthWithSignature)
    .sort()
    .map(key => `${encodeURIComponent(key)}="${encodeURIComponent(oauthWithSignature[key])}"`)
    .join(', ')

  return `OAuth ${headerString}`
}

// =============================================================================
// TWITTER CLIENT CLASS
// =============================================================================

export class TwitterClient {
  private config: TwitterClientConfig
  private baseUrl = 'https://api.twitter.com/2'

  constructor() {
    this.config = {
      apiKey: process.env.TWITTER_API_KEY || '',
      apiSecret: process.env.TWITTER_API_SECRET || '',
      accessToken: process.env.TWITTER_ACCESS_TOKEN || '',
      accessTokenSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET || '',
      bearerToken: process.env.TWITTER_BEARER_TOKEN || '',
    }

    if (!this.config.bearerToken) {
      console.warn('Twitter bearer token not configured')
    }
  }

  /**
   * Check if client is properly configured
   */
  isConfigured(): boolean {
    return !!(
      this.config.apiKey &&
      this.config.apiSecret &&
      this.config.accessToken &&
      this.config.accessTokenSecret &&
      this.config.bearerToken
    )
  }

  /**
   * Make authenticated request with bearer token (app-only)
   */
  private async bearerRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`

    const response = await fetch(url, {
      ...options,
      headers: {
        Authorization: `Bearer ${this.config.bearerToken}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Twitter API error: ${response.status} - ${error}`)
    }

    return response.json()
  }

  /**
   * Make authenticated request with OAuth 1.0a (user context)
   */
  private async oauthRequest<T>(
    method: string,
    endpoint: string,
    body?: Record<string, unknown>
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`

    const authHeader = await generateOAuthSignature(
      method,
      url,
      {},
      this.config
    )

    const response = await fetch(url, {
      method,
      headers: {
        Authorization: authHeader,
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Twitter API error: ${response.status} - ${error}`)
    }

    return response.json()
  }

  // ===========================================================================
  // SEARCH & MONITORING
  // ===========================================================================

  /**
   * Search recent tweets
   */
  async searchRecentTweets(
    query: string,
    options: {
      max_results?: number
      since_id?: string
      until_id?: string
      start_time?: string
      end_time?: string
    } = {}
  ): Promise<XSearchResponse> {
    const params = new URLSearchParams({
      query,
      max_results: (options.max_results || 10).toString(),
      'tweet.fields': 'created_at,public_metrics,conversation_id,in_reply_to_user_id,referenced_tweets,author_id',
      'user.fields': 'name,username,description,public_metrics',
      expansions: 'author_id,referenced_tweets.id',
    })

    if (options.since_id) params.set('since_id', options.since_id)
    if (options.until_id) params.set('until_id', options.until_id)
    if (options.start_time) params.set('start_time', options.start_time)
    if (options.end_time) params.set('end_time', options.end_time)

    return this.bearerRequest<XSearchResponse>(
      `/tweets/search/recent?${params.toString()}`
    )
  }

  /**
   * Search tweets in a specific community
   * Note: Community search requires specific query format
   */
  async searchCommunityTweets(
    communityId: string,
    options: {
      max_results?: number
      since_id?: string
    } = {}
  ): Promise<XSearchResponse> {
    // Community tweets can be searched using conversation context
    // Note: This is a simplified approach - full community API may require additional access
    const query = `conversation_id:${communityId} -is:retweet`
    return this.searchRecentTweets(query, options)
  }

  /**
   * Get mentions of our account
   */
  async getMentions(
    userId: string,
    options: {
      max_results?: number
      since_id?: string
    } = {}
  ): Promise<XSearchResponse> {
    const params = new URLSearchParams({
      max_results: (options.max_results || 10).toString(),
      'tweet.fields': 'created_at,public_metrics,conversation_id,in_reply_to_user_id,referenced_tweets,author_id',
      expansions: 'author_id',
    })

    if (options.since_id) params.set('since_id', options.since_id)

    return this.bearerRequest<XSearchResponse>(
      `/users/${userId}/mentions?${params.toString()}`
    )
  }

  /**
   * Search for team-related tweets
   */
  async searchTeamTweets(
    teamName: string,
    keywords: string[] = [],
    options: {
      max_results?: number
      since_id?: string
    } = {}
  ): Promise<XSearchResponse> {
    // Build query with team name and optional keywords
    const keywordPart = keywords.length > 0
      ? ` (${keywords.join(' OR ')})`
      : ''
    const query = `(${teamName}${keywordPart}) -is:retweet lang:en`

    return this.searchRecentTweets(query, options)
  }

  // ===========================================================================
  // POSTING & REPLYING
  // ===========================================================================

  /**
   * Post a new tweet
   */
  async postTweet(text: string): Promise<{ data: { id: string; text: string } }> {
    return this.oauthRequest<{ data: { id: string; text: string } }>(
      'POST',
      '/tweets',
      { text }
    )
  }

  /**
   * Reply to a tweet
   */
  async replyToTweet(
    text: string,
    replyToTweetId: string
  ): Promise<{ data: { id: string; text: string } }> {
    return this.oauthRequest<{ data: { id: string; text: string } }>(
      'POST',
      '/tweets',
      {
        text,
        reply: {
          in_reply_to_tweet_id: replyToTweetId,
        },
      }
    )
  }

  /**
   * Quote tweet
   */
  async quoteTweet(
    text: string,
    quoteTweetId: string
  ): Promise<{ data: { id: string; text: string } }> {
    return this.oauthRequest<{ data: { id: string; text: string } }>(
      'POST',
      '/tweets',
      {
        text,
        quote_tweet_id: quoteTweetId,
      }
    )
  }

  /**
   * Delete a tweet
   */
  async deleteTweet(tweetId: string): Promise<{ data: { deleted: boolean } }> {
    return this.oauthRequest<{ data: { deleted: boolean } }>(
      'DELETE',
      `/tweets/${tweetId}`
    )
  }

  // ===========================================================================
  // USER OPERATIONS
  // ===========================================================================

  /**
   * Get user by username
   */
  async getUserByUsername(username: string): Promise<{ data: XUser }> {
    return this.bearerRequest<{ data: XUser }>(
      `/users/by/username/${username}?user.fields=description,public_metrics`
    )
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: string): Promise<{ data: XUser }> {
    return this.bearerRequest<{ data: XUser }>(
      `/users/${userId}?user.fields=description,public_metrics`
    )
  }

  /**
   * Get authenticated user info
   */
  async getMe(): Promise<{ data: XUser }> {
    return this.bearerRequest<{ data: XUser }>(
      '/users/me?user.fields=description,public_metrics'
    )
  }

  // ===========================================================================
  // TWEET LOOKUP
  // ===========================================================================

  /**
   * Get a single tweet by ID
   */
  async getTweet(tweetId: string): Promise<{ data: XTweet }> {
    return this.bearerRequest<{ data: XTweet }>(
      `/tweets/${tweetId}?tweet.fields=created_at,public_metrics,conversation_id,author_id&expansions=author_id`
    )
  }

  /**
   * Get multiple tweets by IDs
   */
  async getTweets(tweetIds: string[]): Promise<{ data: XTweet[] }> {
    const ids = tweetIds.join(',')
    return this.bearerRequest<{ data: XTweet[] }>(
      `/tweets?ids=${ids}&tweet.fields=created_at,public_metrics,conversation_id,author_id&expansions=author_id`
    )
  }

  /**
   * Get replies to a tweet
   */
  async getTweetReplies(
    conversationId: string,
    options: { max_results?: number } = {}
  ): Promise<XSearchResponse> {
    const query = `conversation_id:${conversationId} is:reply`
    return this.searchRecentTweets(query, options)
  }

  // ===========================================================================
  // RATE LIMIT HELPERS
  // ===========================================================================

  /**
   * Add delay between API calls
   */
  async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * Random delay within range (for human-like behavior)
   */
  async randomDelay(minMs: number, maxMs: number): Promise<void> {
    const ms = Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs
    return this.delay(ms)
  }
}

// =============================================================================
// SINGLETON EXPORT
// =============================================================================

let twitterClientInstance: TwitterClient | null = null

export function getTwitterClient(): TwitterClient {
  if (!twitterClientInstance) {
    twitterClientInstance = new TwitterClient()
  }
  return twitterClientInstance
}

export default TwitterClient
