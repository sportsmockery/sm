/**
 * Chat Moderation System
 * Pre-publish content filtering for SportsMockery Team Chat
 */

export interface ModerationResult {
  approved: boolean
  action: 'approve' | 'block' | 'shadow_block' | 'warn' | 'ban'
  score: number
  flags: string[]
  message?: string
  banDuration?: number // hours
}

interface ModerationConfig {
  enableProfanityFilter: boolean
  enableHateSpeechFilter: boolean
  enableViolenceFilter: boolean
  enableSpamFilter: boolean
  enableLinkFilter: boolean
  enableBypassDetection: boolean
  sportsContextAware: boolean
}

const DEFAULT_CONFIG: ModerationConfig = {
  enableProfanityFilter: true,
  enableHateSpeechFilter: true,
  enableViolenceFilter: true,
  enableSpamFilter: true,
  enableLinkFilter: true,
  enableBypassDetection: true,
  sportsContextAware: true,
}

// Toxicity score weights
const SEVERITY_WEIGHTS: Record<string, number> = {
  hate_speech: 0.15,
  violence: 0.15,
  nudity_sex: 0.10,
  harassment: 0.10,
  gambling: 0.08,
  drugs_alcohol: 0.08,
  profanity: 0.05,
  evasion: 0.05,
  spam: 0.03,
  sales: 0.03,
  links: 0.02,
}

// Whitelisted sports domains
const WHITELISTED_DOMAINS = [
  'espn.com', 'bleacherreport.com', 'si.com', 'cbssports.com',
  'nbcsports.com', 'foxsports.com', 'theathletic.com',
  'nfl.com', 'mlb.com', 'nba.com', 'nhl.com', 'mls.com',
  'chicagobears.com', 'mlb.com/cubs', 'mlb.com/whitesox',
  'nba.com/bulls', 'nhl.com/blackhawks',
  'pro-football-reference.com', 'baseball-reference.com',
  'basketball-reference.com', 'hockey-reference.com',
  'sportsmockery.com',
]

// Flagged but allowed social domains
const FLAGGED_DOMAINS = ['twitter.com', 'x.com', 'youtube.com', 'youtu.be']

// Sports context phrases that are allowed
const SPORTS_CONTEXT_ALLOWED = [
  'killed it', 'murdered that defense', 'destroyed them',
  'crushed the competition', 'they choked', 'total bust',
  "he's washed", 'she\'s washed', 'sucks', 'trash',
  'FTP', 'beat down', 'slaughtered', 'annihilated',
  'dominant', 'blew them out', 'owned',
]

// Critical patterns - immediate ban
const CRITICAL_PATTERNS: { pattern: RegExp; category: string }[] = [
  // Racial slurs
  { pattern: /\bn[i1!l][g9][g9][e3][r]?s?\b/gi, category: 'hate_speech' },
  { pattern: /\bk[i1!][k]+[e3]s?\b/gi, category: 'hate_speech' },
  { pattern: /\bsp[i1!][c]+s?\b/gi, category: 'hate_speech' },
  { pattern: /\bch[i1!]n[k]+s?\b/gi, category: 'hate_speech' },
  { pattern: /\bw[e3]tb[a@]cks?\b/gi, category: 'hate_speech' },

  // LGBTQ+ slurs
  { pattern: /\bf[a@][g9][g9]?[o0]?t?s?\b/gi, category: 'hate_speech' },
  { pattern: /\bd[y]?k[e3]s?\b/gi, category: 'hate_speech' },
  { pattern: /\btr[a@]nn(y|ie)s?\b/gi, category: 'hate_speech' },

  // Death threats
  { pattern: /\b(i('ll|m\s+going\s+to)|gonna)\s+(kill|murder|shoot|stab)\s+(you|u)\b/gi, category: 'violence' },
  { pattern: /\bkys\b/gi, category: 'violence' },
  { pattern: /\bkill\s+yourself\b/gi, category: 'violence' },

  // Sexual harassment
  { pattern: /\b(send|show)\s*(me\s*)?(nudes?|pics?|tits?|d[i1!]ck)\b/gi, category: 'nudity_sex' },
]

// High severity patterns - block
const HIGH_SEVERITY_PATTERNS: { pattern: RegExp; category: string }[] = [
  // Profanity
  { pattern: /\bf+[u*]+[c*]+[k*]+/gi, category: 'profanity' },
  { pattern: /\bc+[u*]+n+[t*]+/gi, category: 'profanity' },
  { pattern: /\bsh[i1!]+t+/gi, category: 'profanity' },
  { pattern: /\ba+ss+h[o0]+le/gi, category: 'profanity' },
  { pattern: /\bb[i1!]+tch/gi, category: 'profanity' },

  // Sexual content
  { pattern: /\b(porn|xxx|onlyfans|fansly)\b/gi, category: 'nudity_sex' },
  { pattern: /\b(cock|dick|pussy|tits?|boobs?)\b/gi, category: 'nudity_sex' },

  // Gambling
  { pattern: /\b(draftkings|fanduel|betmgm|caesars\s*sports|bet365)\b/gi, category: 'gambling' },
  { pattern: /\b(place\s+your\s+bets?|betting\s+odds?|free\s+picks?)\b/gi, category: 'gambling' },

  // Drugs
  { pattern: /\b(cocaine|heroin|meth|fentanyl|molly|ecstasy)\b/gi, category: 'drugs_alcohol' },
  { pattern: /\b(buy|sell)\s+(weed|pot|drugs?)\b/gi, category: 'drugs_alcohol' },
]

// Medium severity patterns - shadow block
const MEDIUM_SEVERITY_PATTERNS: { pattern: RegExp; category: string }[] = [
  // Spam
  { pattern: /\b(crypto|nft|bitcoin|eth|solana)\s*(giveaway|airdrop|free)\b/gi, category: 'spam' },
  { pattern: /\b(dm\s+me|message\s+me)\s*(for|to)\s*(make\s+money|earn)\b/gi, category: 'spam' },

  // Sales
  { pattern: /\b(buy\s+now|limited\s+time|discount\s+code|promo\s+code)\b/gi, category: 'sales' },
  { pattern: /\b(click\s+here|check\s+out\s+my|link\s+in\s+bio)\b/gi, category: 'sales' },

  // Mild profanity (depends on context)
  { pattern: /\bdamn(ed)?\b/gi, category: 'mild_profanity' },
  { pattern: /\bhell\b/gi, category: 'mild_profanity' },
  { pattern: /\bcrap\b/gi, category: 'mild_profanity' },
]

/**
 * Normalize text to detect bypass attempts
 */
function normalizeText(text: string): string {
  let normalized = text.toLowerCase()

  // Unicode/homoglyph normalization
  const homoglyphs: Record<string, string> = {
    '0': 'o', '1': 'i', '3': 'e', '4': 'a', '5': 's',
    '7': 't', '8': 'b', '9': 'g', '@': 'a', '$': 's',
    '!': 'i', '*': '', '.': '', '_': '', '-': '',
    '\u0430': 'a', '\u0435': 'e', '\u043e': 'o', // Cyrillic
    '\uff41': 'a', '\uff45': 'e', '\uff4f': 'o', // Fullwidth
  }

  for (const [char, replacement] of Object.entries(homoglyphs)) {
    normalized = normalized.split(char).join(replacement)
  }

  // Remove zero-width characters
  normalized = normalized.replace(/[\u200B-\u200D\uFEFF]/g, '')

  // Remove zalgo/combining characters
  normalized = normalized.replace(/[\u0300-\u036f]/g, '')

  // Collapse repeated characters
  normalized = normalized.replace(/(.)\1{2,}/g, '$1$1')

  // Remove spaces between letters (f u c k -> fuck)
  normalized = normalized.replace(/\b(\w)\s+(\w)\s+(\w)\s+(\w)\b/g, '$1$2$3$4')
  normalized = normalized.replace(/\b(\w)\s+(\w)\s+(\w)\b/g, '$1$2$3')

  return normalized
}

/**
 * Check if text contains sports context that should allow otherwise flagged words
 */
function hasSportsContext(text: string): boolean {
  const lower = text.toLowerCase()
  return SPORTS_CONTEXT_ALLOWED.some(phrase => lower.includes(phrase.toLowerCase()))
}

/**
 * Extract and validate links in text
 */
function checkLinks(text: string): { hasLinks: boolean; blockedLinks: boolean; flaggedLinks: string[] } {
  const urlRegex = /(https?:\/\/[^\s]+)/gi
  const links = text.match(urlRegex) || []

  if (links.length === 0) {
    return { hasLinks: false, blockedLinks: false, flaggedLinks: [] }
  }

  const flaggedLinks: string[] = []
  let blockedLinks = false

  for (const link of links) {
    try {
      const url = new URL(link)
      const domain = url.hostname.replace('www.', '')

      const isWhitelisted = WHITELISTED_DOMAINS.some(d =>
        domain === d || domain.endsWith('.' + d)
      )

      const isFlagged = FLAGGED_DOMAINS.some(d =>
        domain === d || domain.endsWith('.' + d)
      )

      if (!isWhitelisted && !isFlagged) {
        blockedLinks = true
      }

      if (isFlagged) {
        flaggedLinks.push(domain)
      }
    } catch {
      // Invalid URL - block it
      blockedLinks = true
    }
  }

  return { hasLinks: true, blockedLinks, flaggedLinks }
}

/**
 * Main moderation function
 */
export function moderateMessage(
  content: string,
  config: Partial<ModerationConfig> = {}
): ModerationResult {
  const cfg = { ...DEFAULT_CONFIG, ...config }
  const flags: string[] = []
  let score = 0
  let action: ModerationResult['action'] = 'approve'
  let banDuration: number | undefined

  // Empty content check
  if (!content || content.trim().length === 0) {
    return { approved: false, action: 'block', score: 0, flags: ['empty'], message: 'Message cannot be empty' }
  }

  // Length check
  if (content.length > 1000) {
    return { approved: false, action: 'block', score: 0, flags: ['too_long'], message: 'Message too long (max 1000 characters)' }
  }

  // Normalize text for bypass detection
  const normalized = cfg.enableBypassDetection ? normalizeText(content) : content.toLowerCase()
  const hasSports = cfg.sportsContextAware ? hasSportsContext(content) : false

  // Check critical patterns (immediate ban)
  if (cfg.enableHateSpeechFilter || cfg.enableViolenceFilter) {
    for (const { pattern, category } of CRITICAL_PATTERNS) {
      if (pattern.test(normalized) || pattern.test(content)) {
        flags.push(category)
        score += SEVERITY_WEIGHTS[category] || 0.15
        action = 'ban'
        banDuration = 24
      }
    }
  }

  // If already banned, return early
  if (action === 'ban') {
    return {
      approved: false,
      action,
      score: Math.min(score, 1),
      flags,
      message: `Message blocked: ${flags[0]}`,
      banDuration,
    }
  }

  // Check high severity patterns (block)
  if (cfg.enableProfanityFilter) {
    for (const { pattern, category } of HIGH_SEVERITY_PATTERNS) {
      if (pattern.test(normalized) || pattern.test(content)) {
        // Skip if sports context allows it
        if (hasSports && category === 'mild_profanity') continue

        flags.push(category)
        score += SEVERITY_WEIGHTS[category] || 0.05
        action = 'block'
      }
    }
  }

  // Check medium severity patterns (shadow block)
  if (cfg.enableSpamFilter) {
    for (const { pattern, category } of MEDIUM_SEVERITY_PATTERNS) {
      if (pattern.test(normalized) || pattern.test(content)) {
        if (category === 'mild_profanity' && hasSports) continue

        flags.push(category)
        score += SEVERITY_WEIGHTS[category] || 0.03
        if (action === 'approve') action = 'shadow_block'
      }
    }
  }

  // Check links
  if (cfg.enableLinkFilter) {
    const linkResult = checkLinks(content)
    if (linkResult.blockedLinks) {
      flags.push('unauthorized_link')
      score += SEVERITY_WEIGHTS.links
      if (action === 'approve') action = 'block'
    }
    if (linkResult.flaggedLinks.length > 0) {
      flags.push('flagged_link')
    }
  }

  // Check for all caps abuse
  const upperRatio = (content.match(/[A-Z]/g) || []).length / content.length
  if (content.length > 10 && upperRatio > 0.7) {
    flags.push('all_caps')
    score += 0.02
    if (action === 'approve') action = 'warn'
  }

  // Bypass detection scoring
  if (cfg.enableBypassDetection && normalized !== content.toLowerCase()) {
    // Likely attempted bypass
    flags.push('possible_evasion')
    score += SEVERITY_WEIGHTS.evasion
  }

  const approved = action === 'approve' || action === 'warn'

  return {
    approved,
    action,
    score: Math.min(score, 1),
    flags,
    message: approved ? undefined : `Message blocked: ${flags[0] || 'content violation'}`,
    banDuration,
  }
}

/**
 * Rate limiting check
 */
export interface RateLimitResult {
  allowed: boolean
  reason?: string
  cooldownSeconds?: number
}

export function checkRateLimit(
  messagesInLastMinute: number,
  messagesInLastHour: number,
  lastMessageContent?: string,
  currentContent?: string,
  isNewUser?: boolean
): RateLimitResult {
  // Messages per minute limit
  if (messagesInLastMinute >= 10) {
    return { allowed: false, reason: 'Too many messages. Please wait.', cooldownSeconds: 60 }
  }

  // Messages per hour limit
  if (messagesInLastHour >= 100) {
    return { allowed: false, reason: 'Hourly message limit reached.', cooldownSeconds: 300 }
  }

  // Duplicate message check
  if (lastMessageContent && currentContent && lastMessageContent === currentContent) {
    return { allowed: false, reason: 'Duplicate message detected.', cooldownSeconds: 30 }
  }

  // Similar message check (80% similarity)
  if (lastMessageContent && currentContent) {
    const similarity = calculateSimilarity(lastMessageContent, currentContent)
    if (similarity > 0.8) {
      return { allowed: false, reason: 'Please write a different message.', cooldownSeconds: 15 }
    }
  }

  // New user cooldown
  if (isNewUser && messagesInLastMinute >= 2) {
    return { allowed: false, reason: 'New users must wait between messages.', cooldownSeconds: 5 }
  }

  return { allowed: true }
}

/**
 * Calculate string similarity (Jaccard)
 */
function calculateSimilarity(a: string, b: string): number {
  const setA = new Set(a.toLowerCase().split(/\s+/))
  const setB = new Set(b.toLowerCase().split(/\s+/))

  const intersection = new Set([...setA].filter(x => setB.has(x)))
  const union = new Set([...setA, ...setB])

  return intersection.size / union.size
}
