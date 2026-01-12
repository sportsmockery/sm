/**
 * SportsMockery X Bot Module
 *
 * AI-powered bot for engaging with Chicago sports communities on X (Twitter)
 */

// Types
export * from './types'

// Twitter Client
export { TwitterClient, getTwitterClient } from './twitter-client'

// Claude Response Generator
export {
  generateResponse,
  generateReply,
  generateOriginalPost,
  generateArticlePromo,
  analyzeTweetForResponse,
} from './claude-generator'

// Bot Service (main orchestration)
export {
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
} from './bot-service'
