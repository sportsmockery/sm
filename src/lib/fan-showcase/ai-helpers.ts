/**
 * Deterministic AI helper functions for Fan Showcase.
 * These are rule-based placeholders — no external AI APIs.
 * Designed to be replaceable by a real AI service later.
 */

import type { ContentType, Team, FanSubmission, FanCreator } from '@/types/fan-showcase'
import { TEAM_LABELS, TEAM_FULL_NAMES } from '@/types/fan-showcase'

// ── Non-Chicago flag detection ──────────────────────────────────────

const RIVAL_KEYWORDS = [
  // NFL rivals
  'packers', 'green bay', 'vikings', 'minnesota vikings', 'lions', 'detroit lions',
  // NBA rivals
  'celtics', 'boston celtics', 'lakers', 'los angeles lakers', 'miami heat', 'heat',
  'milwaukee bucks', 'bucks',
  // MLB rivals
  'yankees', 'new york yankees', 'cardinals', 'st. louis cardinals', 'st louis cardinals',
  'dodgers', 'los angeles dodgers', 'mets', 'new york mets',
  // NHL rivals
  'red wings', 'detroit red wings', 'blues', 'st. louis blues', 'st louis blues',
  'pistons', 'detroit pistons', 'predators', 'nashville predators',
]

const CHICAGO_KEYWORDS = [
  'chicago', 'bears', 'bulls', 'cubs', 'white sox', 'whitesox', 'blackhawks',
  'da bears', 'soldier field', 'wrigley', 'guaranteed rate', 'united center',
  'south side', 'north side', 'windy city', 'chi-town', 'chitown',
]

export function detectNonChicagoFlag(
  title: string,
  description: string | null,
  writtenTake: string | null,
  sourceUrl: string | null
): boolean {
  const text = [title, description, writtenTake, sourceUrl]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()

  const hasRival = RIVAL_KEYWORDS.some(k => text.includes(k))
  const hasChicago = CHICAGO_KEYWORDS.some(k => text.includes(k))

  // Flag if rival mentions exist without Chicago context
  return hasRival && !hasChicago
}

// ── Relevance scoring ───────────────────────────────────────────────

export function calculateRelevanceScore(
  data: {
    title: string
    description: string | null
    written_take: string | null
    source_url: string | null
    type: ContentType
    team: Team
  }
): { score: number; reason: string } {
  let score = 0
  const reasons: string[] = []

  const text = [data.title, data.description, data.written_take]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()

  // Team mention bonus (0-25)
  const teamLabel = TEAM_LABELS[data.team].toLowerCase()
  const teamFull = TEAM_FULL_NAMES[data.team].toLowerCase()
  if (text.includes(teamFull)) {
    score += 25
    reasons.push('Full team name mentioned')
  } else if (text.includes(teamLabel)) {
    score += 15
    reasons.push('Team name mentioned')
  }

  // Chicago mention bonus (0-15)
  if (text.includes('chicago')) {
    score += 15
    reasons.push('Chicago mentioned')
  }

  // Content completeness (0-25)
  if (data.description && data.description.length > 50) {
    score += 10
    reasons.push('Detailed description')
  }
  if (data.description && data.description.length > 200) {
    score += 5
    reasons.push('Extensive description')
  }
  if (data.type === 'take' && data.written_take && data.written_take.length > 200) {
    score += 10
    reasons.push('Substantial written take')
  }
  if (data.type === 'edit' && data.source_url) {
    score += 10
    reasons.push('Source URL provided')
  }

  // Keyword richness (0-20)
  const sportKeywords = [
    'game', 'season', 'playoff', 'draft', 'trade', 'roster', 'coach',
    'player', 'score', 'win', 'loss', 'highlight', 'play', 'defense',
    'offense', 'pitch', 'goal', 'assist', 'rebound', 'touchdown',
  ]
  const keywordHits = sportKeywords.filter(k => text.includes(k)).length
  const keywordScore = Math.min(20, keywordHits * 4)
  score += keywordScore
  if (keywordHits > 0) {
    reasons.push(`${keywordHits} sports keywords found`)
  }

  // Base score for submitting (15)
  score += 15
  reasons.push('Submission received')

  // Cap at 100
  score = Math.min(100, score)

  return { score, reason: reasons.join('; ') }
}

// ── Caption generation ──────────────────────────────────────────────

const CAPTION_TEMPLATES: Record<ContentType, string[][]> = {
  edit: [
    [
      '{team} fans are built different. Here\'s this week\'s standout edit.',
      'The creativity coming out of Chicago right now is unreal.',
      'This {team} edit just went straight to the top of the timeline.',
    ],
    [
      'Chicago doesn\'t sleep on content. Neither do {team} fans.',
      'When you love your team this much, you make edits like this.',
      'Another {team} fan just raised the bar.',
    ],
  ],
  art: [
    [
      '{fullTeam} fan art that belongs in a museum. Or at least a locker room.',
      'South Side, North Side — Chicago creativity hits different.',
      'This is what happens when {team} fans pick up a canvas.',
    ],
    [
      'Art from the heart of Chicago. {team} edition.',
      '{team} fans never miss a chance to turn passion into art.',
      'Fan art this good deserves a permanent spot at the arena.',
    ],
  ],
  take: [
    [
      'A {team} take so sharp it could cut glass. Chicago fans, weigh in.',
      'Bold take alert from the Chicago faithful.',
      'This {team} fan has thoughts. And they\'re not holding back.',
    ],
    [
      'Straight from the streets of Chicago — a {team} take worth reading.',
      'No filter, no fluff. Just a real {team} fan with a real take.',
      'This is the kind of analysis that makes Chicago sports conversation elite.',
    ],
  ],
  fantasy_win: [
    [
      'Another fantasy throne claimed by a Chicago {team} fan.',
      'Bragging rights earned. This {team} fan just dominated their league.',
      'Fantasy champion and a {team} fan? Double the swagger.',
    ],
    [
      'League winner. {team} fan. Chicago champion.',
      'Some fans just know ball. This {team} fantasy champ is proof.',
      'Trophies come in all forms. This one comes with a {team} logo.',
    ],
  ],
}

export function generateCaptions(
  type: ContentType,
  team: Team
): [string, string, string] {
  const teamLabel = TEAM_LABELS[team]
  const fullTeam = TEAM_FULL_NAMES[team]
  const templateGroups = CAPTION_TEMPLATES[type]

  // Pick from different template groups for variety
  const groupIdx = Math.floor(Math.random() * templateGroups.length)
  const templates = templateGroups[groupIdx]

  return templates.map(t =>
    t.replace(/\{team\}/g, teamLabel).replace(/\{fullTeam\}/g, fullTeam)
  ) as [string, string, string]
}

// ── Similar creators (deterministic recommendation) ─────────────────

export function scoreSimilarity(
  creator: FanCreator,
  target: FanCreator,
  creatorSubmissions: FanSubmission[],
  targetSubmissions: FanSubmission[]
): { score: number; reason: string } {
  if (creator.id === target.id) return { score: 0, reason: 'same creator' }

  let score = 0
  const reasons: string[] = []

  // Same team = strongest weight
  if (creator.primary_team === target.primary_team) {
    score += 50
    reasons.push('Same team')
  }

  // Same content focus = second weight
  if (creator.content_focus && creator.content_focus === target.content_focus) {
    score += 30
    reasons.push('Same content type')
  }

  // Overlapping submission types
  const creatorTypes = new Set(creatorSubmissions.map(s => s.type))
  const targetTypes = new Set(targetSubmissions.map(s => s.type))
  const overlap = [...creatorTypes].filter(t => targetTypes.has(t)).length
  if (overlap > 0) {
    score += overlap * 10
    reasons.push(`${overlap} shared content types`)
  }

  // Prioritize creators with approved featured items
  const hasApproved = creatorSubmissions.some(
    s => s.status === 'approved' || s.status === 'featured'
  )
  if (hasApproved) {
    score += 15
    reasons.push('Has approved work')
  }

  return { score, reason: reasons.join('; ') }
}

export function findSimilarCreators(
  targetCreator: FanCreator,
  targetSubmissions: FanSubmission[],
  allCreators: FanCreator[],
  allSubmissions: FanSubmission[],
  limit = 6
): Array<{ creator: FanCreator; score: number; reason: string }> {
  const submissionsByCreator = new Map<string, FanSubmission[]>()
  for (const sub of allSubmissions) {
    const existing = submissionsByCreator.get(sub.creator_id) || []
    existing.push(sub)
    submissionsByCreator.set(sub.creator_id, existing)
  }

  const scored = allCreators
    .filter(c => c.id !== targetCreator.id)
    .map(c => {
      const creatorSubs = submissionsByCreator.get(c.id) || []
      const { score, reason } = scoreSimilarity(c, targetCreator, creatorSubs, targetSubmissions)
      return { creator: c, score, reason }
    })
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score)

  return scored.slice(0, limit)
}
