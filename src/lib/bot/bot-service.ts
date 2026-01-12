/**
 * Bot Service - Main orchestration for SportsMockery X Bot
 *
 * Handles monitoring, response generation, posting, and activity tracking
 */

import { supabaseAdmin } from '@/lib/supabase-server'
import { getTwitterClient } from './twitter-client'
import {
  generateReply,
  generateOriginalPost,
  generateArticlePromo,
  analyzeTweetForResponse,
} from './claude-generator'
import type {
  TeamSlug,
  BotConfig,
  BotStatus,
  MonitorResult,
  PostResult,
  BotResponse,
  MonitoredTweet,
  BotLogInsert,
  MonitoredTweetInsert,
  BotResponseInsert,
} from './types'
import { TEAM_SLUGS, TEAM_SHORT_NAMES, TEAM_DISPLAY_NAMES } from './types'

// =============================================================================
// LOGGING
// =============================================================================

async function log(entry: BotLogInsert): Promise<void> {
  try {
    await supabaseAdmin.from('sm_bot_logs').insert(entry)
  } catch (error) {
    console.error('Failed to write bot log:', error)
  }
}

// =============================================================================
// CONFIGURATION
// =============================================================================

/**
 * Get bot configuration for a team
 */
export async function getBotConfig(team_slug: TeamSlug): Promise<BotConfig | null> {
  const { data, error } = await supabaseAdmin
    .from('sm_bot_config')
    .select('*')
    .eq('team_slug', team_slug)
    .single()

  if (error) {
    await log({
      team_slug,
      log_level: 'error',
      action: 'get_config',
      message: error.message,
    })
    return null
  }

  return data as BotConfig
}

/**
 * Get all bot configurations
 */
export async function getAllBotConfigs(): Promise<BotConfig[]> {
  const { data, error } = await supabaseAdmin
    .from('sm_bot_config')
    .select('*')
    .order('team_slug')

  if (error) {
    await log({
      log_level: 'error',
      action: 'get_all_configs',
      message: error.message,
    })
    return []
  }

  return (data || []) as BotConfig[]
}

/**
 * Update bot configuration
 */
export async function updateBotConfig(
  team_slug: TeamSlug,
  updates: Partial<BotConfig>
): Promise<boolean> {
  const { error } = await supabaseAdmin
    .from('sm_bot_config')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('team_slug', team_slug)

  if (error) {
    await log({
      team_slug,
      log_level: 'error',
      action: 'update_config',
      message: error.message,
    })
    return false
  }

  await log({
    team_slug,
    log_level: 'info',
    action: 'update_config',
    message: 'Configuration updated',
    metadata: updates as Record<string, unknown>,
  })

  return true
}

// =============================================================================
// ACTIVITY TRACKING
// =============================================================================

/**
 * Check if bot can perform an action today
 */
export async function canPerformAction(
  team_slug: TeamSlug,
  is_reply: boolean = true
): Promise<boolean> {
  const config = await getBotConfig(team_slug)
  if (!config || !config.enabled) return false

  const { data: activity } = await supabaseAdmin
    .from('sm_bot_daily_activity')
    .select('*')
    .eq('team_slug', team_slug)
    .eq('activity_date', new Date().toISOString().split('T')[0])
    .single()

  if (!activity) return true // No activity yet today

  if (is_reply) {
    return activity.replies_sent < config.daily_reply_limit
  } else {
    return activity.original_posts < config.daily_post_limit
  }
}

/**
 * Record bot activity
 */
export async function recordActivity(
  team_slug: TeamSlug,
  is_reply: boolean,
  tokens_used: number = 0
): Promise<void> {
  const today = new Date().toISOString().split('T')[0]

  // Upsert daily activity
  const { error } = await supabaseAdmin.rpc('increment_bot_activity', {
    p_team_slug: team_slug,
    p_is_reply: is_reply,
    p_tokens: tokens_used,
  })

  if (error) {
    // Fallback to manual upsert if function doesn't exist
    const { data: existing } = await supabaseAdmin
      .from('sm_bot_daily_activity')
      .select('*')
      .eq('team_slug', team_slug)
      .eq('activity_date', today)
      .single()

    if (existing) {
      await supabaseAdmin
        .from('sm_bot_daily_activity')
        .update({
          replies_sent: existing.replies_sent + (is_reply ? 1 : 0),
          original_posts: existing.original_posts + (is_reply ? 0 : 1),
          total_tokens_used: existing.total_tokens_used + tokens_used,
        })
        .eq('id', existing.id)
    } else {
      await supabaseAdmin.from('sm_bot_daily_activity').insert({
        team_slug,
        activity_date: today,
        replies_sent: is_reply ? 1 : 0,
        original_posts: is_reply ? 0 : 1,
        total_tokens_used: tokens_used,
      })
    }
  }
}

// =============================================================================
// BOT STATUS
// =============================================================================

/**
 * Get current status for all teams or a specific team
 */
export async function getBotStatus(team_slug?: TeamSlug): Promise<BotStatus[]> {
  const configs = team_slug
    ? [await getBotConfig(team_slug)].filter(Boolean) as BotConfig[]
    : await getAllBotConfigs()

  const today = new Date().toISOString().split('T')[0]
  const statuses: BotStatus[] = []

  for (const config of configs) {
    // Get today's activity
    const { data: activity } = await supabaseAdmin
      .from('sm_bot_daily_activity')
      .select('*')
      .eq('team_slug', config.team_slug)
      .eq('activity_date', today)
      .single()

    // Get pending responses count
    const { count: pendingCount } = await supabaseAdmin
      .from('sm_bot_responses')
      .select('*', { count: 'exact', head: true })
      .eq('team_slug', config.team_slug)
      .eq('status', 'pending')

    const todayReplies = activity?.replies_sent || 0
    const todayPosts = activity?.original_posts || 0

    statuses.push({
      team_slug: config.team_slug as TeamSlug,
      enabled: config.enabled,
      community_id: config.community_id,
      today_replies: todayReplies,
      today_posts: todayPosts,
      daily_reply_limit: config.daily_reply_limit,
      daily_post_limit: config.daily_post_limit,
      can_reply: config.enabled && todayReplies < config.daily_reply_limit,
      can_post: config.enabled && todayPosts < config.daily_post_limit,
      pending_responses: pendingCount || 0,
    })
  }

  return statuses
}

// =============================================================================
// MONITORING
// =============================================================================

/**
 * Monitor X for tweets to engage with
 */
export async function monitorForEngagement(
  team_slug?: TeamSlug
): Promise<MonitorResult[]> {
  const teams = team_slug ? [team_slug] : TEAM_SLUGS
  const results: MonitorResult[] = []
  const twitter = getTwitterClient()

  if (!twitter.isConfigured()) {
    await log({
      log_level: 'error',
      action: 'monitor',
      message: 'Twitter client not configured',
    })
    return [{
      team_slug: teams[0],
      tweets_found: 0,
      tweets_processed: 0,
      replies_queued: 0,
      errors: ['Twitter client not configured'],
    }]
  }

  for (const team of teams) {
    const result: MonitorResult = {
      team_slug: team,
      tweets_found: 0,
      tweets_processed: 0,
      replies_queued: 0,
      errors: [],
    }

    try {
      const config = await getBotConfig(team)
      if (!config || !config.enabled) {
        result.errors.push(`Bot not enabled for ${team}`)
        results.push(result)
        continue
      }

      // Get keywords for this team
      const { data: keywords } = await supabaseAdmin
        .from('sm_bot_keywords')
        .select('keyword, priority_boost, is_negative')
        .or(`team_slug.eq.${team},team_slug.is.null`)

      const positiveKeywords = keywords
        ?.filter(k => !k.is_negative)
        .map(k => k.keyword) || []

      // Search for team-related tweets
      const searchResponse = await twitter.searchTeamTweets(
        TEAM_SHORT_NAMES[team],
        positiveKeywords.slice(0, 5), // Use top 5 keywords
        { max_results: 20 }
      )

      if (!searchResponse.data || searchResponse.data.length === 0) {
        result.errors.push('No tweets found')
        results.push(result)
        continue
      }

      result.tweets_found = searchResponse.data.length

      // Get blocked users
      const { data: blockedUsers } = await supabaseAdmin
        .from('sm_bot_blocked_users')
        .select('twitter_user_id')

      const blockedIds = new Set(blockedUsers?.map(u => u.twitter_user_id) || [])

      // Process each tweet
      for (const tweet of searchResponse.data) {
        // Skip if from blocked user
        if (blockedIds.has(tweet.author_id)) continue

        // Skip if already processed
        const { data: existing } = await supabaseAdmin
          .from('sm_bot_monitored_tweets')
          .select('id')
          .eq('tweet_id', tweet.id)
          .single()

        if (existing) continue

        // Analyze tweet for response potential
        const analysis = await analyzeTweetForResponse(tweet.text, team)

        // Calculate priority based on keywords
        let priority = analysis.priority
        for (const kw of keywords || []) {
          if (tweet.text.toLowerCase().includes(kw.keyword.toLowerCase())) {
            priority += kw.priority_boost
          }
        }
        priority = Math.max(0, Math.min(100, priority)) // Clamp to 0-100

        // Get author info
        const author = searchResponse.includes?.users?.find(
          u => u.id === tweet.author_id
        )

        // Store the monitored tweet
        const tweetInsert: MonitoredTweetInsert = {
          tweet_id: tweet.id,
          team_slug: team,
          author_username: author?.username,
          author_id: tweet.author_id,
          content: tweet.text,
          likes_count: tweet.public_metrics?.like_count || 0,
          reply_count: tweet.public_metrics?.reply_count || 0,
          retweet_count: tweet.public_metrics?.retweet_count || 0,
          reply_priority: priority,
          tweet_created_at: tweet.created_at,
        }

        const { error: insertError } = await supabaseAdmin
          .from('sm_bot_monitored_tweets')
          .insert({
            ...tweetInsert,
            should_reply: analysis.should_respond,
            processed: false,
          })

        if (insertError) {
          result.errors.push(`Failed to store tweet ${tweet.id}`)
          continue
        }

        result.tweets_processed++

        // If should respond and can respond, queue a response
        if (analysis.should_respond && (await canPerformAction(team, true))) {
          try {
            // Generate response
            const response = await generateReply(
              team,
              tweet.text,
              author?.username
            )

            // Store response for review/posting
            const responseInsert: BotResponseInsert = {
              team_slug: team,
              response_type: 'reply',
              content: response.content,
              in_reply_to_tweet_id: tweet.id,
              claude_model: response.model,
              prompt_used: response.prompt_used,
              tokens_used: response.tokens_used,
            }

            await supabaseAdmin.from('sm_bot_responses').insert(responseInsert)

            result.replies_queued++

            await log({
              team_slug: team,
              log_level: 'info',
              action: 'queue_reply',
              message: `Queued reply to tweet ${tweet.id}`,
              metadata: { priority, suggested_tone: analysis.suggested_tone },
            })
          } catch (genError) {
            result.errors.push(`Failed to generate reply for ${tweet.id}`)
          }
        }

        // Mark as processed
        await supabaseAdmin
          .from('sm_bot_monitored_tweets')
          .update({ processed: true, processed_at: new Date().toISOString() })
          .eq('tweet_id', tweet.id)

        // Small delay between processing
        await twitter.randomDelay(500, 1500)
      }

      // Update daily activity
      await supabaseAdmin
        .from('sm_bot_daily_activity')
        .upsert({
          team_slug: team,
          activity_date: new Date().toISOString().split('T')[0],
          tweets_monitored: result.tweets_processed,
        }, { onConflict: 'team_slug,activity_date' })

      await log({
        team_slug: team,
        log_level: 'info',
        action: 'monitor_complete',
        message: `Monitoring complete`,
        metadata: result as unknown as Record<string, unknown>,
      })

    } catch (error) {
      result.errors.push(error instanceof Error ? error.message : 'Unknown error')
      await log({
        team_slug: team,
        log_level: 'error',
        action: 'monitor',
        message: error instanceof Error ? error.message : 'Unknown error',
      })
    }

    results.push(result)
  }

  return results
}

// =============================================================================
// POSTING
// =============================================================================

/**
 * Post a pending response
 */
export async function postResponse(response_id: number): Promise<PostResult> {
  const twitter = getTwitterClient()

  if (!twitter.isConfigured()) {
    return { success: false, error: 'Twitter client not configured' }
  }

  // Get the response
  const { data: response, error } = await supabaseAdmin
    .from('sm_bot_responses')
    .select('*')
    .eq('id', response_id)
    .single()

  if (error || !response) {
    return { success: false, error: 'Response not found' }
  }

  const botResponse = response as BotResponse

  if (botResponse.status !== 'pending') {
    return { success: false, error: `Response is ${botResponse.status}, not pending` }
  }

  // Check if we can still post
  const is_reply = botResponse.response_type === 'reply'
  if (!(await canPerformAction(botResponse.team_slug, is_reply))) {
    return { success: false, error: 'Daily limit reached' }
  }

  // Get config for delay settings
  const config = await getBotConfig(botResponse.team_slug)
  if (config) {
    // Random delay for human-like behavior
    await twitter.randomDelay(
      config.min_delay_seconds * 1000,
      config.max_delay_seconds * 1000
    )
  }

  try {
    let result: { data: { id: string; text: string } }

    switch (botResponse.response_type) {
      case 'reply':
        if (!botResponse.in_reply_to_tweet_id) {
          return { success: false, error: 'No tweet to reply to' }
        }
        result = await twitter.replyToTweet(
          botResponse.content,
          botResponse.in_reply_to_tweet_id
        )
        break

      case 'original_post':
        result = await twitter.postTweet(botResponse.content)
        break

      case 'quote_tweet':
        if (!botResponse.in_reply_to_tweet_id) {
          return { success: false, error: 'No tweet to quote' }
        }
        result = await twitter.quoteTweet(
          botResponse.content,
          botResponse.in_reply_to_tweet_id
        )
        break

      default:
        return { success: false, error: 'Unknown response type' }
    }

    // Update response record
    await supabaseAdmin
      .from('sm_bot_responses')
      .update({
        status: 'posted',
        our_tweet_id: result.data.id,
        posted_at: new Date().toISOString(),
      })
      .eq('id', response_id)

    // Record activity
    await recordActivity(
      botResponse.team_slug,
      is_reply,
      botResponse.tokens_used || 0
    )

    await log({
      team_slug: botResponse.team_slug,
      log_level: 'info',
      action: 'post_response',
      message: `Posted ${botResponse.response_type}`,
      metadata: { response_id, tweet_id: result.data.id },
    })

    return {
      success: true,
      tweet_id: result.data.id,
      response_id,
    }

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'

    // Update response with error
    await supabaseAdmin
      .from('sm_bot_responses')
      .update({
        status: 'failed',
        error_message: errorMessage,
      })
      .eq('id', response_id)

    await log({
      team_slug: botResponse.team_slug,
      log_level: 'error',
      action: 'post_response',
      message: errorMessage,
      metadata: { response_id },
    })

    return { success: false, error: errorMessage }
  }
}

/**
 * Post all pending responses for a team
 */
export async function postPendingResponses(
  team_slug?: TeamSlug,
  limit: number = 5
): Promise<PostResult[]> {
  const query = supabaseAdmin
    .from('sm_bot_responses')
    .select('id, team_slug')
    .eq('status', 'pending')
    .order('created_at', { ascending: true })
    .limit(limit)

  if (team_slug) {
    query.eq('team_slug', team_slug)
  }

  const { data: responses } = await query

  if (!responses || responses.length === 0) {
    return []
  }

  const results: PostResult[] = []

  for (const response of responses) {
    const result = await postResponse(response.id)
    results.push(result)

    // Delay between posts
    const twitter = getTwitterClient()
    await twitter.randomDelay(30000, 120000) // 30s to 2min between posts
  }

  return results
}

// =============================================================================
// ARTICLE PROMOTION
// =============================================================================

/**
 * Generate and queue an article promotion post
 */
export async function queueArticlePromotion(
  team_slug: TeamSlug,
  article_id: number
): Promise<{ success: boolean; response_id?: number; error?: string }> {
  // Get the article
  const { data: article, error } = await supabaseAdmin
    .from('sm_posts')
    .select('id, title, excerpt, slug, category:sm_categories!category_id(slug)')
    .eq('id', article_id)
    .single()

  if (error || !article) {
    return { success: false, error: 'Article not found' }
  }

  // Check if we can post
  if (!(await canPerformAction(team_slug, false))) {
    return { success: false, error: 'Daily post limit reached' }
  }

  try {
    // category is returned as an array from the join, get the first element
    const categorySlug = Array.isArray(article.category)
      ? article.category[0]?.slug
      : (article.category as { slug?: string } | null)?.slug
    const articleUrl = `https://sportsmockery.com/${categorySlug || team_slug}/${article.slug}`

    const response = await generateArticlePromo(
      team_slug,
      article.title,
      article.excerpt || '',
      articleUrl
    )

    // Store for posting
    const { data: inserted, error: insertError } = await supabaseAdmin
      .from('sm_bot_responses')
      .insert({
        team_slug,
        response_type: 'original_post',
        content: response.content,
        claude_model: response.model,
        prompt_used: response.prompt_used,
        tokens_used: response.tokens_used,
        article_id,
      })
      .select('id')
      .single()

    if (insertError) {
      return { success: false, error: insertError.message }
    }

    await log({
      team_slug,
      log_level: 'info',
      action: 'queue_article_promo',
      message: `Queued article promotion for "${article.title}"`,
      metadata: { article_id, response_id: inserted?.id },
    })

    return { success: true, response_id: inserted?.id }

  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

// =============================================================================
// EXPORTS
// =============================================================================

export default {
  // Config
  getBotConfig,
  getAllBotConfigs,
  updateBotConfig,

  // Status
  getBotStatus,
  canPerformAction,
  recordActivity,

  // Monitoring
  monitorForEngagement,

  // Posting
  postResponse,
  postPendingResponses,
  queueArticlePromotion,
}
