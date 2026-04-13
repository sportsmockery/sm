'use client'

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'

// ─── Types ─────────────────────────────────────────────────
type TaskStatus = 'undetermined' | 'complete' | 'problem'

interface TaskResult {
  status: TaskStatus
  tester: string
  notes: string
  updatedAt: string
}

interface TaskDef {
  id: string
  label: string
  route?: string
  priority?: 'critical' | 'high' | 'medium' | 'low'
}

interface Section {
  id: string
  title: string
  icon: string
  tasks: TaskDef[]
}

// ─── Storage key ───────────────────────────────────────────
const STORAGE_KEY = 'sm-qa-results'
const TESTER_KEY = 'sm-qa-tester'

// ─── All test sections + tasks ─────────────────────────────
const SECTIONS: Section[] = [
  {
    id: 'homepage',
    title: '1. Homepage & Feed',
    icon: '🏠',
    tasks: [
      { id: 'hp-hero-loads', label: 'Hero section renders at 100vh on initial load', route: '/', priority: 'critical' },
      { id: 'hp-hero-scroll', label: 'Feed is NOT visible until user scrolls past hero', route: '/' },
      { id: 'hp-stars-anim', label: 'Chicago stars background animation plays (62 stars desktop, 37 mobile)', route: '/' },
      { id: 'hp-stars-reduced', label: 'Stars respect prefers-reduced-motion: reduce', route: '/' },
      { id: 'hp-scout-input', label: 'Scout AI prompt input is visible and functional in hero', route: '/' },
      { id: 'hp-blitz-logo', label: 'Blitz logo (/blitz_logo.svg) visible top-left, not dominant', route: '/' },
      { id: 'hp-feed-infinite', label: 'Infinite feed loads and scrolls with article cards', route: '/', priority: 'critical' },
      { id: 'hp-feed-cards-render', label: 'Editorial cards render with team accent left borders', route: '/' },
      { id: 'hp-insight-blocks', label: 'Scout insight blocks display with cyan border', route: '/' },
      { id: 'hp-sidebar', label: 'Trending sidebar loads with team leaderboards', route: '/' },
      { id: 'hp-hero-games', label: 'Hero games carousel shows upcoming/live Chicago games', route: '/' },
      { id: 'hp-game-times-ct', label: 'Game times display in Central Time with CT suffix', route: '/' },
      { id: 'hp-no-completed-hero', label: 'Completed games do NOT appear in hero', route: '/' },
      { id: 'hp-theme-toggle', label: 'Theme toggle switches between light and dark mode', route: '/' },
      { id: 'hp-dark-mode', label: 'Dark mode renders correctly (backgrounds, text, cards)', route: '/' },
      { id: 'hp-light-mode', label: 'Light mode renders correctly', route: '/' },
      { id: 'hp-color-palette', label: 'Only brand colors used: Black #0B0F14, White #FAFAFB, Red #BC0000, Cyan #00D4FF, Gold #D6B05E', route: '/' },
      { id: 'hp-font', label: 'Space Grotesk is the only font (no other families)', route: '/' },
      { id: 'hp-min-text', label: 'No text smaller than 13px', route: '/' },
      { id: 'hp-feed-page', label: '/feed page loads with infinite scroll', route: '/feed' },
      { id: 'hp-home-page', label: '/home alternative homepage loads', route: '/home' },
      { id: 'hp-api-feed', label: 'GET /api/feed returns valid articles', priority: 'critical' },
      { id: 'hp-api-hero-games', label: 'GET /api/hero-games returns upcoming games only', priority: 'critical' },
      { id: 'hp-api-river', label: 'GET /api/river returns feed cards' },
    ],
  },
  {
    id: 'team-bears',
    title: '2a. Chicago Bears',
    icon: '🐻',
    tasks: [
      { id: 'bears-hub', label: 'Bears hub page loads with roster highlights, upcoming game, stats sidebar', route: '/chicago-bears', priority: 'critical' },
      { id: 'bears-record', label: 'Season record shows correctly (11-6, season 2025)', route: '/chicago-bears' },
      { id: 'bears-roster', label: 'Roster page loads with correct player count (≈52 from contracts)', route: '/chicago-bears/roster', priority: 'critical' },
      { id: 'bears-roster-headshots', label: 'Player headshots load from ESPN CDN', route: '/chicago-bears/roster' },
      { id: 'bears-players', label: 'Players list page loads with position filters', route: '/chicago-bears/players' },
      { id: 'bears-player-detail', label: 'Individual player page loads with stats, contract info', route: '/chicago-bears/players/[slug]', priority: 'high' },
      { id: 'bears-schedule', label: 'Schedule shows 17 regular season games', route: '/chicago-bears/schedule', priority: 'critical' },
      { id: 'bears-schedule-times', label: 'Game times in Central Time (CT suffix)', route: '/chicago-bears/schedule' },
      { id: 'bears-scores', label: 'Scores page loads with game results', route: '/chicago-bears/scores' },
      { id: 'bears-stats', label: 'Stats page shows leaderboards: Pass Yds, Rush Yds, Rec Yds, Tackles, Sacks', route: '/chicago-bears/stats', priority: 'critical' },
      { id: 'bears-stats-dual', label: 'Stats use nullish coalescing for dual column names (passing_yards ?? passing_yds)', route: '/chicago-bears/stats' },
      { id: 'bears-cap', label: 'Cap tracker loads with $303.45M ceiling, season 2026', route: '/chicago-bears/cap-tracker', priority: 'high' },
      { id: 'bears-depth', label: 'Depth chart page loads with positions', route: '/chicago-bears/depth-chart' },
      { id: 'bears-draft', label: 'Draft tracker page loads', route: '/chicago-bears/draft-tracker' },
      { id: 'bears-rumors', label: 'Trade rumors page loads', route: '/chicago-bears/trade-rumors' },
      { id: 'bears-game-center', label: 'Game center page loads with past/upcoming', route: '/chicago-bears/game-center' },
      { id: 'bears-live', label: 'Live game page loads (or shows no live game message)', route: '/chicago-bears/live' },
      { id: 'bears-sidebar-stats', label: 'Sidebar stat leaders match main stats page', route: '/chicago-bears' },
    ],
  },
  {
    id: 'team-bulls',
    title: '2b. Chicago Bulls',
    icon: '🐂',
    tasks: [
      { id: 'bulls-hub', label: 'Bulls hub page loads', route: '/chicago-bulls', priority: 'critical' },
      { id: 'bulls-record', label: 'Season record shows correctly (23-22, season 2026)', route: '/chicago-bulls' },
      { id: 'bulls-roster', label: 'Roster loads (~15 from contracts, uses is_current_bulls filter)', route: '/chicago-bulls/roster', priority: 'critical' },
      { id: 'bulls-players', label: 'Players list loads (uses espn_player_id NOT espn_id)', route: '/chicago-bulls/players' },
      { id: 'bulls-player-detail', label: 'Individual player detail loads', route: '/chicago-bulls/players/[slug]' },
      { id: 'bulls-schedule', label: 'Schedule shows 82 games', route: '/chicago-bulls/schedule', priority: 'critical' },
      { id: 'bulls-scores', label: 'Scores page loads', route: '/chicago-bulls/scores' },
      { id: 'bulls-stats', label: 'Stats show PTS, PPG, RPG, SPG, BPG leaderboards', route: '/chicago-bulls/stats', priority: 'critical' },
      { id: 'bulls-stats-cols', label: 'Stats use correct columns: field_goal_pct (NOT fg_pct), three_point_pct, free_throw_pct', route: '/chicago-bulls/stats' },
      { id: 'bulls-cap', label: 'Cap tracker loads with $154.647M ceiling', route: '/chicago-bulls/cap-tracker' },
      { id: 'bulls-depth', label: 'Depth chart loads', route: '/chicago-bulls/depth-chart' },
      { id: 'bulls-draft', label: 'Draft tracker loads', route: '/chicago-bulls/draft-tracker' },
      { id: 'bulls-rumors', label: 'Trade rumors loads', route: '/chicago-bulls/trade-rumors' },
      { id: 'bulls-game-center', label: 'Game center loads', route: '/chicago-bulls/game-center' },
      { id: 'bulls-live', label: 'Live game page loads', route: '/chicago-bulls/live' },
    ],
  },
  {
    id: 'team-cubs',
    title: '2c. Chicago Cubs',
    icon: '⚾',
    tasks: [
      { id: 'cubs-hub', label: 'Cubs hub page loads', route: '/chicago-cubs', priority: 'critical' },
      { id: 'cubs-record', label: 'Season record correct (92-70, season 2025)', route: '/chicago-cubs' },
      { id: 'cubs-roster', label: 'Roster loads (~40 from contracts)', route: '/chicago-cubs/roster', priority: 'critical' },
      { id: 'cubs-players', label: 'Players list loads', route: '/chicago-cubs/players' },
      { id: 'cubs-schedule', label: 'Schedule shows 162 games', route: '/chicago-cubs/schedule', priority: 'critical' },
      { id: 'cubs-scores', label: 'Scores page loads', route: '/chicago-cubs/scores' },
      { id: 'cubs-stats', label: 'Stats show AVG, HR, OBP, RBI, AB (min 50 AB for rates)', route: '/chicago-cubs/stats', priority: 'critical' },
      { id: 'cubs-stats-cols', label: 'Stats use correct columns: batting_average, era, ops (NOT aliases)', route: '/chicago-cubs/stats' },
      { id: 'cubs-cap', label: 'Cap tracker loads with $241M CBT threshold', route: '/chicago-cubs/cap-tracker' },
      { id: 'cubs-pitchers', label: 'Schedule shows probable pitchers for upcoming games', route: '/chicago-cubs/schedule' },
      { id: 'cubs-depth', label: 'Depth chart loads', route: '/chicago-cubs/depth-chart' },
      { id: 'cubs-draft', label: 'Draft tracker loads', route: '/chicago-cubs/draft-tracker' },
      { id: 'cubs-rumors', label: 'Trade rumors loads', route: '/chicago-cubs/trade-rumors' },
      { id: 'cubs-game-center', label: 'Game center loads', route: '/chicago-cubs/game-center' },
      { id: 'cubs-live', label: 'Live game page loads', route: '/chicago-cubs/live' },
    ],
  },
  {
    id: 'team-blackhawks',
    title: '2d. Chicago Blackhawks',
    icon: '🏒',
    tasks: [
      { id: 'hawks-hub', label: 'Blackhawks hub page loads', route: '/chicago-blackhawks', priority: 'critical' },
      { id: 'hawks-record', label: 'Season record correct (21-22-8, season 2026)', route: '/chicago-blackhawks' },
      { id: 'hawks-roster', label: 'Roster loads (~23 from contracts)', route: '/chicago-blackhawks/roster', priority: 'critical' },
      { id: 'hawks-players', label: 'Players list loads', route: '/chicago-blackhawks/players' },
      { id: 'hawks-schedule', label: 'Schedule shows 82 games', route: '/chicago-blackhawks/schedule', priority: 'critical' },
      { id: 'hawks-scores', label: 'Scores page loads', route: '/chicago-blackhawks/scores' },
      { id: 'hawks-stats', label: 'Stats show Goals, Assists, Points, SV% leaderboards', route: '/chicago-blackhawks/stats', priority: 'critical' },
      { id: 'hawks-stats-otl', label: 'OT Loss uses is_overtime = true (NOT separate OTL column)', route: '/chicago-blackhawks/stats' },
      { id: 'hawks-cap', label: 'Cap tracker loads with $95.5M ceiling', route: '/chicago-blackhawks/cap-tracker' },
      { id: 'hawks-depth', label: 'Depth chart loads', route: '/chicago-blackhawks/depth-chart' },
      { id: 'hawks-draft', label: 'Draft tracker loads', route: '/chicago-blackhawks/draft-tracker' },
      { id: 'hawks-rumors', label: 'Trade rumors loads', route: '/chicago-blackhawks/trade-rumors' },
      { id: 'hawks-game-center', label: 'Game center loads', route: '/chicago-blackhawks/game-center' },
      { id: 'hawks-live', label: 'Live game page loads', route: '/chicago-blackhawks/live' },
    ],
  },
  {
    id: 'team-whitesox',
    title: '2e. Chicago White Sox',
    icon: '⚾',
    tasks: [
      { id: 'sox-hub', label: 'White Sox hub page loads', route: '/chicago-white-sox', priority: 'critical' },
      { id: 'sox-record', label: 'Season record correct (60-102, season 2025)', route: '/chicago-white-sox' },
      { id: 'sox-roster', label: 'Roster loads (~40 from contracts)', route: '/chicago-white-sox/roster', priority: 'critical' },
      { id: 'sox-players', label: 'Players list loads', route: '/chicago-white-sox/players' },
      { id: 'sox-schedule', label: 'Schedule shows 162 games', route: '/chicago-white-sox/schedule', priority: 'critical' },
      { id: 'sox-scores', label: 'Scores page loads', route: '/chicago-white-sox/scores' },
      { id: 'sox-stats', label: 'Stats show AVG, HR, OBP, RBI, AB leaderboards', route: '/chicago-white-sox/stats', priority: 'critical' },
      { id: 'sox-cap', label: 'Cap tracker loads with $241M CBT threshold', route: '/chicago-white-sox/cap-tracker' },
      { id: 'sox-depth', label: 'Depth chart loads', route: '/chicago-white-sox/depth-chart' },
      { id: 'sox-draft', label: 'Draft tracker loads', route: '/chicago-white-sox/draft-tracker' },
      { id: 'sox-rumors', label: 'Trade rumors loads', route: '/chicago-white-sox/trade-rumors' },
      { id: 'sox-game-center', label: 'Game center loads', route: '/chicago-white-sox/game-center' },
      { id: 'sox-live', label: 'Live game page loads', route: '/chicago-white-sox/live' },
    ],
  },
  {
    id: 'scout-ai',
    title: '3. Scout AI',
    icon: '🤖',
    tasks: [
      { id: 'scout-page', label: 'Scout AI page loads', route: '/scout-ai', priority: 'critical' },
      { id: 'scout-query', label: 'Can submit a question and receive AI response', route: '/scout-ai', priority: 'critical' },
      { id: 'scout-session', label: 'Session persists across multiple queries (same sessionId)', route: '/scout-ai' },
      { id: 'scout-chart', label: 'Chart visualization renders for stat comparison queries', route: '/scout-ai' },
      { id: 'scout-bonus', label: 'Bonus insights display correctly', route: '/scout-ai' },
      { id: 'scout-history-guest', label: 'Query history saves to localStorage for guests', route: '/scout-ai' },
      { id: 'scout-history-user', label: 'Query history saves to Supabase for logged-in users', route: '/scout-ai' },
      { id: 'scout-prompts', label: 'Suggested prompts appear and rotate', route: '/scout-ai' },
      { id: 'scout-premium', label: 'Premium-only messaging appears for non-subscribers', route: '/scout-ai' },
      { id: 'scout-timeout', label: 'Timeout handling shows error after 30s', route: '/scout-ai' },
      { id: 'scout-markdown', label: 'Markdown renders correctly (bold, italic, lists)', route: '/scout-ai' },
      { id: 'scout-mobile', label: 'Mobile: full-screen responsive layout', route: '/scout-ai' },
      { id: 'scout-api', label: 'POST /api/ask-ai returns valid response', priority: 'critical' },
    ],
  },
  {
    id: 'gm',
    title: '4. GM Trade Simulator',
    icon: '💼',
    tasks: [
      { id: 'gm-page', label: 'GM page loads', route: '/gm', priority: 'critical' },
      { id: 'gm-auth', label: 'Requires login (redirects if not authenticated)', route: '/gm', priority: 'critical' },
      { id: 'gm-team-select', label: 'Can select any of 5 Chicago teams', route: '/gm' },
      { id: 'gm-roster-load', label: 'Roster loads from contracts table for selected team', route: '/gm', priority: 'critical' },
      { id: 'gm-roster-filter', label: 'Can filter roster by position', route: '/gm' },
      { id: 'gm-trade-board', label: '2-team trade board renders with add/remove players', route: '/gm', priority: 'critical' },
      { id: 'gm-3team', label: '3-team trade layout loads', route: '/gm' },
      { id: 'gm-salary-validate', label: 'Salary cap validation blocks trades over cap', route: '/gm', priority: 'critical' },
      { id: 'gm-grade', label: 'Grade endpoint returns 0-100 score with breakdown', route: '/gm', priority: 'critical' },
      { id: 'gm-grade-dangerous', label: 'Dangerous flag appears for grades 70-90', route: '/gm' },
      { id: 'gm-untouchable', label: 'Untouchable players (Caleb Williams, Connor Bedard) always grade 0', route: '/gm', priority: 'high' },
      { id: 'gm-rate-limit', label: 'Rate limit kicks in at 10/min (429 error)', route: '/gm' },
      { id: 'gm-sim', label: 'Season simulation returns projectedRecord from DataLab', route: '/gm', priority: 'high' },
      { id: 'gm-sim-fallback', label: 'Simulation falls back to V1 if DataLab V3 unavailable', route: '/gm' },
      { id: 'gm-history', label: 'Trade history persists in session', route: '/gm' },
      { id: 'gm-share', label: 'Shared trade code generates valid URL', route: '/gm' },
      { id: 'gm-share-load', label: 'Shared trade URL pre-fills trade board', route: '/gm/share/[code]' },
      { id: 'gm-picks', label: 'Draft pick trading (year/round/condition) works', route: '/gm' },
      { id: 'gm-prospects', label: 'Prospect data loads (~200 per league)', route: '/gm' },
      { id: 'gm-analytics', label: 'GM analytics page loads', route: '/gm/analytics' },
      { id: 'gm-leaderboard', label: 'Leaderboard loads with user rankings', route: '/leaderboard' },
      { id: 'gm-my-score', label: 'My GM Score page shows personal stats', route: '/my-gm-score' },
      { id: 'gm-mobile', label: 'Mobile: trade board usable on small screen', route: '/gm' },
    ],
  },
  {
    id: 'mock-draft',
    title: '5. Mock Draft',
    icon: '📋',
    tasks: [
      { id: 'md-page', label: 'Mock draft page loads', route: '/mock-draft', priority: 'critical' },
      { id: 'md-eligibility', label: 'Only eligible teams shown (offseason teams only)', route: '/mock-draft', priority: 'critical' },
      { id: 'md-bears-eligible', label: 'Bears eligible (offseason)', route: '/mock-draft' },
      { id: 'md-cubs-eligible', label: 'Cubs eligible (offseason)', route: '/mock-draft' },
      { id: 'md-sox-eligible', label: 'White Sox eligible (offseason)', route: '/mock-draft' },
      { id: 'md-bulls-blocked', label: 'Bulls NOT eligible (in-season)', route: '/mock-draft' },
      { id: 'md-hawks-blocked', label: 'Blackhawks NOT eligible (in-season)', route: '/mock-draft' },
      { id: 'md-auto-select', label: 'Auto-selects when only 1 eligible team', route: '/mock-draft' },
      { id: 'md-picks', label: 'Can make draft picks for selected team', route: '/mock-draft', priority: 'critical' },
      { id: 'md-auto-advance', label: 'Auto-advance skips empty slots', route: '/mock-draft' },
      { id: 'md-grade', label: 'Each pick receives a grade', route: '/mock-draft' },
      { id: 'md-share', label: 'Share code generates valid URL', route: '/mock-draft' },
      { id: 'md-share-load', label: 'Shared draft URL pre-fills board', route: '/mock-draft/share/[mockId]' },
      { id: 'md-no-override', label: 'Frontend does NOT override DataLab eligibility', route: '/mock-draft', priority: 'critical' },
    ],
  },
  {
    id: 'fan-chat',
    title: '6. Fan Chat',
    icon: '💬',
    tasks: [
      { id: 'chat-page', label: 'Fan chat page loads', route: '/fan-chat', priority: 'critical' },
      { id: 'chat-channels', label: '5 team channels load (Bears Den, Bulls Nation, etc.)', route: '/fan-chat', priority: 'critical' },
      { id: 'chat-switch', label: 'Channel switching loads message history', route: '/fan-chat' },
      { id: 'chat-send', label: 'Can send message to channel', route: '/fan-chat', priority: 'critical' },
      { id: 'chat-ai', label: 'AI responds with team personality', route: '/fan-chat' },
      { id: 'chat-realtime', label: 'Realtime updates show new messages without refresh', route: '/fan-chat', priority: 'high' },
      { id: 'chat-online', label: 'Online count shows active users per channel', route: '/fan-chat' },
      { id: 'chat-names', label: 'Display names and badges render', route: '/fan-chat' },
      { id: 'chat-timestamps', label: 'Message timestamps accurate', route: '/fan-chat' },
      { id: 'chat-avatars', label: 'User avatars load', route: '/fan-chat' },
      { id: 'chat-mobile', label: 'Mobile: chat UI responsive', route: '/fan-chat' },
    ],
  },
  {
    id: 'live-games',
    title: '7. Live Games',
    icon: '🔴',
    tasks: [
      { id: 'live-page', label: 'Live games page loads', route: '/live', priority: 'critical' },
      { id: 'live-scores', label: 'Scores display and update (10s polling during live)', route: '/live', priority: 'critical' },
      { id: 'live-ct', label: 'Game times in Central Time with CT suffix', route: '/live' },
      { id: 'live-detail', label: 'Game detail page loads with full stats', route: '/live/[sport]/[gameId]', priority: 'critical' },
      { id: 'live-pbp', label: 'Play-by-play updates in realtime', route: '/live/[sport]/[gameId]' },
      { id: 'live-linescore', label: 'Linescore renders correctly (MLB innings, NBA quarters, etc.)', route: '/live/[sport]/[gameId]' },
      { id: 'live-player-stats', label: 'Player stats display in live view', route: '/live/[sport]/[gameId]' },
      { id: 'live-team-stats', label: 'Team stats comparison renders', route: '/live/[sport]/[gameId]' },
      { id: 'live-logos', label: 'Home/away team logos load correctly', route: '/live' },
      { id: 'live-pre-game', label: 'Pre-game view shows probable pitchers (MLB)', route: '/live' },
      { id: 'live-post-game', label: 'Post-game view shows final score', route: '/live' },
      { id: 'live-game-center', label: 'Game center shows all past/upcoming games', route: '/game-center' },
      { id: 'live-api', label: 'GET /api/live-games returns current games', priority: 'critical' },
      { id: 'live-api-detail', label: 'GET /api/live-games/[gameId] returns full game data', priority: 'critical' },
      { id: 'live-mobile', label: 'Mobile: scores readable on small screens', route: '/live' },
    ],
  },
  {
    id: 'owner',
    title: '8. Owner Pages',
    icon: '👔',
    tasks: [
      { id: 'owner-list', label: 'All 5 team ownership grades load', route: '/owner', priority: 'high' },
      { id: 'owner-grades', label: 'Grades display correctly (overall, spend, results, sentiment, loyalty tax)', route: '/owner' },
      { id: 'owner-vote', label: 'Can vote agree/disagree on grade (logged in)', route: '/owner' },
      { id: 'owner-detail', label: 'Individual team owner detail loads', route: '/owner/[team]' },
      { id: 'owner-scout', label: 'Scout commentary displays', route: '/owner/[team]' },
      { id: 'owner-timeline', label: 'Grade timeline chart renders (Recharts)', route: '/owner/[team]' },
      { id: 'owner-comments', label: 'Comments load and display', route: '/owner/[team]' },
      { id: 'owner-mobile', label: 'Mobile responsive', route: '/owner' },
    ],
  },
  {
    id: 'articles',
    title: '9. Articles & Content',
    icon: '📰',
    tasks: [
      { id: 'article-loads', label: 'Article detail page loads with all blocks', route: '/[category]/[slug]', priority: 'critical' },
      { id: 'article-header', label: 'Headline, featured image, byline render', route: '/[category]/[slug]' },
      { id: 'article-html', label: 'HTML in blocks renders correctly (bold, italic, links) via dangerouslySetInnerHTML', route: '/[category]/[slug]', priority: 'critical' },
      { id: 'article-read-time', label: 'Read time calculates correctly', route: '/[category]/[slug]' },
      { id: 'article-views', label: 'Views increment on page load', route: '/[category]/[slug]' },
      { id: 'article-insight', label: 'Scout insight block shows with cyan border', route: '/[category]/[slug]' },
      { id: 'article-chart', label: 'Chart block renders with data', route: '/[category]/[slug]' },
      { id: 'article-poll', label: 'Poll voting works within article', route: '/[category]/[slug]' },
      { id: 'article-debate', label: 'Debate shows Pro (cyan) / Con (red) with votes', route: '/[category]/[slug]' },
      { id: 'article-related', label: 'Related articles load (3-5 suggestions)', route: '/[category]/[slug]' },
      { id: 'article-share', label: 'Share buttons present (X, Facebook)', route: '/[category]/[slug]' },
      { id: 'article-author', label: 'Author profile links to author page', route: '/[category]/[slug]' },
      { id: 'article-category', label: 'Category pages paginate correctly', route: '/[category]' },
      { id: 'article-datahub', label: 'DataHub pages load analytics', route: '/[category]/datahub' },
      { id: 'article-mobile', label: 'Mobile: text readable, images scale', route: '/[category]/[slug]' },
      { id: 'article-dark', label: 'Dark mode: text contrast sufficient', route: '/[category]/[slug]' },
    ],
  },
  {
    id: 'players',
    title: '10. Player Pages',
    icon: '🏃',
    tasks: [
      { id: 'players-list', label: 'Players search page loads', route: '/players', priority: 'high' },
      { id: 'players-detail', label: 'Individual player page loads with info', route: '/players/[playerId]' },
      { id: 'players-headshot', label: 'Headshots display', route: '/players/[playerId]' },
      { id: 'players-stats', label: 'Season stats accurate (check vs league leaders)', route: '/players/[playerId]/stats' },
      { id: 'players-gamelog', label: 'Game log shows all games (full season)', route: '/players/[playerId]/game-log' },
      { id: 'players-contract', label: 'Contract info matches cap tracker', route: '/players/[playerId]' },
      { id: 'players-opponent', label: 'Stats filtered correctly (is_opponent = false)', route: '/players/[playerId]' },
      { id: 'players-search', label: 'Search player by name works', route: '/players' },
      { id: 'players-mobile', label: 'Mobile: stats table responsive/scrollable', route: '/players/[playerId]' },
    ],
  },
  {
    id: 'polls',
    title: '11. Polls',
    icon: '📊',
    tasks: [
      { id: 'polls-list', label: 'Active polls load on /polls', route: '/polls', priority: 'high' },
      { id: 'polls-vote', label: 'Can vote on poll', route: '/polls' },
      { id: 'polls-results', label: 'Results update after vote', route: '/polls/[id]/results' },
      { id: 'polls-hidden', label: 'Results hidden if show_results = false until voted', route: '/polls' },
      { id: 'polls-timer', label: 'Timer shows time remaining for active polls', route: '/polls' },
      { id: 'polls-closed', label: 'Closed polls show disabled voting', route: '/polls' },
      { id: 'polls-embed', label: 'Embed iframe works', route: '/polls/embed/[id]' },
      { id: 'polls-create', label: 'Can create new poll (authenticated)', route: '/polls/new' },
      { id: 'polls-edit', label: 'Can edit poll (authenticated)', route: '/polls/[id]/edit' },
      { id: 'polls-mobile', label: 'Mobile: poll voting responsive', route: '/polls' },
    ],
  },
  {
    id: 'studio',
    title: '12. Studio (Creator Tools)',
    icon: '🎬',
    tasks: [
      { id: 'studio-dash', label: 'Studio dashboard loads', route: '/studio', priority: 'high' },
      { id: 'studio-auth', label: 'Requires authentication', route: '/studio' },
      { id: 'studio-posts', label: 'Posts list loads', route: '/studio/posts' },
      { id: 'studio-new-post', label: 'Can create new post with blocks', route: '/studio/posts/new', priority: 'high' },
      { id: 'studio-draft', label: 'Draft saves without publishing', route: '/studio/posts/new' },
      { id: 'studio-publish', label: 'Published post appears on site', route: '/studio/posts/new' },
      { id: 'studio-edit', label: 'Can edit existing post', route: '/studio/posts/[id]/edit' },
      { id: 'studio-preview', label: 'Preview shows final rendering', route: '/studio/posts/new' },
      { id: 'studio-seo', label: 'SEO fields save (meta title, description)', route: '/studio/posts/new' },
      { id: 'studio-charts', label: 'Charts page loads', route: '/studio/charts' },
      { id: 'studio-chart-new', label: 'Can create new chart', route: '/studio/charts/new' },
      { id: 'studio-polls', label: 'Polls management loads', route: '/studio/polls' },
      { id: 'studio-media', label: 'Media library loads with uploads', route: '/studio/media' },
      { id: 'studio-media-upload', label: 'Can upload images', route: '/studio/media' },
    ],
  },
  {
    id: 'auth',
    title: '13. Authentication',
    icon: '🔐',
    tasks: [
      { id: 'auth-signup-email', label: 'Signup with email/password works', route: '/signup', priority: 'critical' },
      { id: 'auth-signup-google', label: 'Signup with Google OAuth', route: '/signup' },
      { id: 'auth-signup-github', label: 'Signup with GitHub OAuth', route: '/signup' },
      { id: 'auth-signup-x', label: 'Signup with X (Twitter) OAuth', route: '/signup' },
      { id: 'auth-login-email', label: 'Login with email/password', route: '/login', priority: 'critical' },
      { id: 'auth-login-oauth', label: 'Login with OAuth providers', route: '/login' },
      { id: 'auth-session', label: 'Session persists across page refresh', route: '/', priority: 'critical' },
      { id: 'auth-logout', label: 'Logout clears session', route: '/' },
      { id: 'auth-forgot', label: 'Forgot password sends email', route: '/forgot-password' },
      { id: 'auth-reset', label: 'Reset password flow works', route: '/reset-password' },
      { id: 'auth-callback', label: 'OAuth callbacks redirect correctly', route: '/api/auth/callback' },
      { id: 'auth-no-multi-client', label: 'No "Multiple GoTrueClient" warnings in console', route: '/', priority: 'critical' },
      { id: 'auth-mobile', label: 'Mobile: auth forms responsive', route: '/login' },
    ],
  },
  {
    id: 'profile',
    title: '14. User Profile & Settings',
    icon: '👤',
    tasks: [
      { id: 'profile-load', label: 'Profile page loads', route: '/profile', priority: 'high' },
      { id: 'profile-name', label: 'Can update display name', route: '/profile' },
      { id: 'profile-avatar', label: 'Can upload avatar (renders after upload)', route: '/profile' },
      { id: 'profile-team', label: 'Favorite team selection saves', route: '/profile' },
      { id: 'profile-prefs', label: 'Preferences persist across login sessions', route: '/profile' },
      { id: 'profile-notifs', label: 'Notification toggles work', route: '/profile' },
      { id: 'profile-sub', label: 'Subscription status displays correctly', route: '/profile' },
      { id: 'profile-activity', label: 'Activity history loads (trades, drafts, votes)', route: '/profile' },
      { id: 'notifs-page', label: 'Notifications page loads', route: '/notifications' },
      { id: 'notifs-read', label: 'Can mark notifications as read', route: '/notifications' },
    ],
  },
  {
    id: 'subscription',
    title: '15. Subscription & Pricing',
    icon: '💳',
    tasks: [
      { id: 'pricing-page', label: 'Pricing page loads with plans', route: '/pricing', priority: 'critical' },
      { id: 'pricing-compare', label: 'Feature comparison table visible', route: '/pricing' },
      { id: 'pricing-checkout', label: 'Checkout button triggers Stripe', route: '/pricing', priority: 'critical' },
      { id: 'pricing-stripe', label: 'Stripe modal opens with payment form', route: '/pricing' },
      { id: 'pricing-success', label: 'Success page after payment', route: '/subscription/success' },
      { id: 'pricing-status', label: 'Subscription status accurate after purchase', route: '/profile' },
      { id: 'pricing-gates', label: 'Feature gates work (ask_ai locked for free users)', route: '/scout-ai', priority: 'critical' },
      { id: 'pricing-cancel', label: 'Can cancel subscription via billing portal', route: '/profile' },
      { id: 'pricing-webhook', label: 'Stripe webhook processes events (subscription.created/deleted)', priority: 'high' },
    ],
  },
  {
    id: 'admin',
    title: '16. Admin — Dashboard & Posts',
    icon: '⚙️',
    tasks: [
      { id: 'admin-auth', label: 'Admin redirects to login if not authenticated', route: '/admin', priority: 'critical' },
      { id: 'admin-dash', label: 'Dashboard loads with stats (posts, views, writers, categories)', route: '/admin', priority: 'critical' },
      { id: 'admin-views-chart', label: 'Views chart shows 7-day data', route: '/admin' },
      { id: 'admin-recent', label: 'Recent posts list shows 5 latest', route: '/admin' },
      { id: 'admin-posts-list', label: 'Posts list loads with filter/sort/search', route: '/admin/posts', priority: 'critical' },
      { id: 'admin-post-create', label: 'Can create new post with block editor', route: '/admin/posts/new', priority: 'critical' },
      { id: 'admin-post-blocks', label: 'Block editor adds paragraph, heading, image, chart, poll blocks', route: '/admin/posts/new' },
      { id: 'admin-post-html', label: 'Block HTML renders correctly in editor', route: '/admin/posts/new' },
      { id: 'admin-post-image', label: 'Featured image uploads and displays', route: '/admin/posts/new' },
      { id: 'admin-post-category', label: 'Category selection works', route: '/admin/posts/new' },
      { id: 'admin-post-tags', label: 'Tags save/load correctly', route: '/admin/posts/new' },
      { id: 'admin-post-publish', label: 'Publish saves to DB and shows on site', route: '/admin/posts/new', priority: 'critical' },
      { id: 'admin-post-draft', label: 'Draft saves without publishing', route: '/admin/posts/new' },
      { id: 'admin-post-schedule', label: 'Scheduled post publishes at set time', route: '/admin/posts/new' },
      { id: 'admin-post-edit', label: 'Can edit published post', route: '/admin/posts/[id]/edit' },
      { id: 'admin-post-delete', label: 'Can delete post', route: '/admin/posts' },
      { id: 'admin-post-view', label: 'View post detail in admin', route: '/admin/posts/[id]' },
    ],
  },
  {
    id: 'admin-content',
    title: '17. Admin — Charts, Polls, Media',
    icon: '📊',
    tasks: [
      { id: 'admin-charts', label: 'Charts list loads', route: '/admin/charts' },
      { id: 'admin-chart-create', label: 'Can create chart with type selection and data', route: '/admin/charts/new' },
      { id: 'admin-chart-render', label: 'Chart renders with preview', route: '/admin/charts/new' },
      { id: 'admin-chart-edit', label: 'Can edit chart', route: '/admin/charts/[id]/edit' },
      { id: 'admin-chart-delete', label: 'Can delete chart', route: '/admin/charts' },
      { id: 'admin-polls', label: 'Polls list loads', route: '/admin/polls' },
      { id: 'admin-poll-create', label: 'Can create poll with options', route: '/admin/polls' },
      { id: 'admin-poll-results', label: 'Poll results display', route: '/admin/polls/[id]' },
      { id: 'admin-poll-delete', label: 'Can delete poll', route: '/admin/polls' },
      { id: 'admin-media', label: 'Media library loads', route: '/admin/media' },
      { id: 'admin-media-upload', label: 'Can upload images/media', route: '/admin/media' },
      { id: 'admin-media-delete', label: 'Can delete media', route: '/admin/media' },
      { id: 'admin-media-search', label: 'Media search/filter works', route: '/admin/media' },
    ],
  },
  {
    id: 'admin-users',
    title: '18. Admin — Users, Writers, Categories, Tags',
    icon: '👥',
    tasks: [
      { id: 'admin-users', label: 'Users list shows all users', route: '/admin/users', priority: 'high' },
      { id: 'admin-user-role', label: 'Can change user role', route: '/admin/users' },
      { id: 'admin-user-password', label: 'Can reset user password', route: '/admin/users' },
      { id: 'admin-user-detail', label: 'User detail page loads', route: '/admin/users/[id]' },
      { id: 'admin-writers', label: 'Writers list loads with analytics', route: '/admin/writers' },
      { id: 'admin-categories', label: 'Categories CRUD works', route: '/admin/categories' },
      { id: 'admin-tags', label: 'Tags CRUD works', route: '/admin/tags' },
    ],
  },
  {
    id: 'admin-tools',
    title: '19. Admin — Settings, SEO, Analytics, Tools',
    icon: '🔧',
    tasks: [
      { id: 'admin-settings', label: 'Settings form saves', route: '/admin/settings' },
      { id: 'admin-seo', label: 'SEO audit tools work', route: '/admin/seo' },
      { id: 'admin-analytics', label: 'Analytics show views/authors/traffic', route: '/admin/analytics' },
      { id: 'admin-subscriptions', label: 'Subscriptions list shows SM+ users', route: '/admin/subscriptions' },
      { id: 'admin-ads', label: 'Ads settings save', route: '/admin/ads' },
      { id: 'admin-freestar', label: 'Freestar revenue displays', route: '/admin/freestar' },
      { id: 'admin-ai-log', label: 'AI logging shows Scout errors', route: '/admin/ai-logging' },
      { id: 'admin-pages', label: 'Pages CRUD works', route: '/admin/pages' },
      { id: 'admin-page-edit', label: 'Can edit individual page', route: '/admin/pages/[slug]' },
      { id: 'admin-postiq', label: 'PostIQ generates headlines and SEO suggestions', route: '/admin/postiq' },
      { id: 'admin-feed-scoring', label: 'Feed scoring visibility toggles work', route: '/admin/feed-scoring' },
      { id: 'admin-gm-errors', label: 'GM errors display', route: '/admin/gm-errors' },
      { id: 'admin-leaderboard', label: 'Leaderboard config works', route: '/admin/leaderboard' },
      { id: 'admin-hub', label: 'Hub editor works', route: '/admin/hub' },
      { id: 'admin-team-sync', label: 'Team pages sync triggers', route: '/admin/team-pages-sync' },
      { id: 'admin-exec', label: 'Executive dashboard loads with metrics', route: '/admin/exec-dashboard' },
      { id: 'admin-notifs', label: 'Notification compose and send works', route: '/admin/notifications' },
      { id: 'admin-notif-history', label: 'Notification history loads', route: '/admin/notifications' },
      { id: 'admin-user-gm', label: 'User GM scoring leaderboard loads', route: '/admin/user-gm-scoring' },
    ],
  },
  {
    id: 'audio-video',
    title: '20. Audio & Video',
    icon: '🎧',
    tasks: [
      { id: 'audio-page', label: 'Audio page loads', route: '/audio' },
      { id: 'audio-play', label: 'Audio files load and play', route: '/audio' },
      { id: 'audio-controls', label: 'Playback controls work (play, pause, skip)', route: '/audio' },
      { id: 'audio-speed', label: 'Speed control works (0.75x, 1x, 1.25x, 1.5x)', route: '/audio' },
      { id: 'audio-advance', label: 'Auto-advance to next article', route: '/audio' },
      { id: 'audio-mini', label: 'Mini player persists during navigation', route: '/' },
      { id: 'video-film-room', label: 'Bears Film Room loads', route: '/bears-film-room' },
      { id: 'video-pi', label: 'Pinwheels & Ivy page loads', route: '/pinwheels-and-ivy' },
      { id: 'video-untold', label: 'Untold Chicago Stories loads', route: '/untold-chicago-stories' },
      { id: 'video-southside', label: 'Southside Behavior loads', route: '/southside-behavior' },
    ],
  },
  {
    id: 'seo-static',
    title: '21. SEO & Static Pages',
    icon: '🌐',
    tasks: [
      { id: 'seo-about', label: 'About page loads', route: '/about' },
      { id: 'seo-contact', label: 'Contact page loads', route: '/contact' },
      { id: 'seo-privacy', label: 'Privacy page loads', route: '/privacy' },
      { id: 'seo-terms', label: 'Terms page loads', route: '/terms' },
      { id: 'seo-governance', label: 'Governance page loads', route: '/governance' },
      { id: 'seo-training', label: 'Training page loads', route: '/training' },
      { id: 'seo-sitemap', label: 'Sitemap.xml generates', route: '/sitemap.xml' },
      { id: 'seo-robots', label: 'robots.txt accessible', route: '/robots.txt' },
      { id: 'seo-rss', label: 'RSS feed valid XML', route: '/api/rss' },
      { id: 'seo-og', label: 'OG meta tags present on article pages' },
      { id: 'seo-canonical', label: 'Canonical URLs set correctly' },
      { id: 'seo-jsonld', label: 'JSON-LD structured data for articles' },
      { id: 'seo-authors', label: 'Authors page loads', route: '/authors' },
      { id: 'seo-author-detail', label: 'Individual author page loads', route: '/author/[id]' },
      { id: 'seo-tag', label: 'Tag pages load', route: '/tag/[slug]' },
    ],
  },
  {
    id: 'search-nav',
    title: '22. Search & Navigation',
    icon: '🔍',
    tasks: [
      { id: 'search-page', label: 'Search page loads', route: '/search', priority: 'high' },
      { id: 'search-query', label: 'Search returns results for valid query', route: '/search' },
      { id: 'search-filter-team', label: 'Search filters by team', route: '/search' },
      { id: 'search-no-results', label: 'No results message shows for invalid query', route: '/search' },
      { id: 'search-links', label: 'Search results link to correct pages', route: '/search' },
      { id: 'nav-logo', label: 'Header logo links to home', route: '/' },
      { id: 'nav-links', label: 'Nav links work (Teams, Scout, GM, Chat, Pricing)', route: '/' },
      { id: 'nav-auth-status', label: 'Auth status displays correctly in header', route: '/' },
      { id: 'nav-mobile-menu', label: 'Mobile hamburger menu opens and navigates', route: '/' },
      { id: 'nav-footer', label: 'Footer links work (About, Contact, Privacy, Terms)', route: '/' },
      { id: 'nav-social', label: 'Footer social icons link correctly', route: '/' },
      { id: 'nav-sidebar', label: 'Sidebar layout renders correctly', route: '/' },
      { id: 'nav-bottom-mobile', label: 'Mobile bottom nav functional', route: '/' },
      { id: 'nav-live-strip', label: 'Live strip shows game scores', route: '/' },
    ],
  },
  {
    id: 'mobile',
    title: '23. Mobile & Responsive',
    icon: '📱',
    tasks: [
      { id: 'mob-feed', label: 'Feed cards stack vertically on mobile', route: '/', priority: 'critical' },
      { id: 'mob-hero', label: 'Hero 100vh height on mobile', route: '/' },
      { id: 'mob-roster', label: 'Team roster table scrollable horizontally', route: '/chicago-bears/roster' },
      { id: 'mob-player', label: 'Player detail readable on small screen', route: '/chicago-bears/players/[slug]' },
      { id: 'mob-forms', label: 'Forms responsive (login, signup, contact)', route: '/login' },
      { id: 'mob-gm', label: 'GM trade board accessible on mobile', route: '/gm' },
      { id: 'mob-audio', label: 'Audio player functional on mobile', route: '/audio' },
      { id: 'mob-admin', label: 'Admin pages usable on tablet', route: '/admin' },
      { id: 'mob-tap-targets', label: 'All tap targets minimum 44px', route: '/' },
      { id: 'mob-no-h-scroll', label: 'No horizontal scrolling on any page', route: '/' },
      { id: 'mob-images', label: 'Images load progressively, LCP < 2.5s', route: '/' },
      { id: 'mob-cls', label: 'No layout shift (CLS < 0.1)', route: '/' },
      { id: 'mob-keyboard', label: 'Keyboard navigation works (tab through form)', route: '/' },
    ],
  },
  {
    id: 'performance',
    title: '24. Performance & Security',
    icon: '⚡',
    tasks: [
      { id: 'perf-lighthouse', label: 'Lighthouse score > 80 on homepage', route: '/', priority: 'critical' },
      { id: 'perf-api-feed', label: 'GET /api/feed response < 500ms', priority: 'high' },
      { id: 'perf-api-live', label: 'GET /api/live-games response < 500ms', priority: 'high' },
      { id: 'perf-images', label: 'All images optimized (next/image, AVIF/WebP)', route: '/' },
      { id: 'perf-no-console-errors', label: 'No console errors on any page', route: '/', priority: 'critical' },
      { id: 'perf-no-gotrue', label: 'No "Multiple GoTrueClient" warnings', route: '/', priority: 'critical' },
      { id: 'perf-ssl', label: 'SSL certificate valid (https)', priority: 'critical' },
      { id: 'perf-404', label: '404 page renders for invalid routes', route: '/nonexistent-page' },
      { id: 'perf-cron-sync', label: 'Cron: /api/cron/sync-teams runs hourly', priority: 'high' },
      { id: 'perf-cron-health', label: 'Cron: /api/cron/team-pages-health runs hourly', priority: 'high' },
      { id: 'perf-cron-scout', label: 'Cron: /api/cron/cleanup-scout-history runs daily', priority: 'medium' },
      { id: 'perf-admin-auth', label: 'Admin APIs return 401 for unauthenticated requests', priority: 'critical' },
      { id: 'perf-rate-limit', label: 'Rate limiting works on GM grade endpoint', priority: 'high' },
      { id: 'perf-xss', label: 'No XSS vulnerabilities in user inputs', priority: 'critical' },
    ],
  },
  {
    id: 'launch',
    title: '25. Deployment & Launch Readiness',
    icon: '🚀',
    tasks: [
      { id: 'launch-prod', label: 'All critical pages work on test.sportsmockery.com', priority: 'critical' },
      { id: 'launch-sitemap', label: 'Sitemap.xml generated and valid', priority: 'high' },
      { id: 'launch-robots', label: 'robots.txt allows crawling', priority: 'high' },
      { id: 'launch-stripe', label: 'Stripe production keys configured', priority: 'critical' },
      { id: 'launch-email', label: 'Email service configured and sending', priority: 'high' },
      { id: 'launch-datalab', label: 'DataLab API integration stable', priority: 'critical' },
      { id: 'launch-data-fresh', label: 'Team pages data is fresh (not stale)', priority: 'high' },
      { id: 'launch-no-test-data', label: 'No hardcoded test data in production', priority: 'critical' },
      { id: 'launch-roles', label: 'User roles correct (admin, writer, user)', priority: 'high' },
      { id: 'launch-backups', label: 'Database backups configured', priority: 'critical' },
      { id: 'launch-error-logging', label: 'Error logging active (scout_errors table)', priority: 'high' },
      { id: 'launch-analytics', label: 'Analytics tracking configured', priority: 'medium' },
    ],
  },
]

// ─── Compute total tasks ───────────────────────────────────
const TOTAL_TASKS = SECTIONS.reduce((sum, s) => sum + s.tasks.length, 0)

// ─── Status colors & labels ───────────────────────────────
const STATUS_CONFIG: Record<TaskStatus, { bg: string; border: string; text: string; label: string; icon: string }> = {
  undetermined: { bg: 'rgba(160,160,165,0.12)', border: 'rgba(160,160,165,0.25)', text: '#A0A0A5', label: 'Untested', icon: '○' },
  complete: { bg: 'rgba(0,230,118,0.12)', border: 'rgba(0,230,118,0.35)', text: '#00E676', label: 'Pass', icon: '✓' },
  problem: { bg: 'rgba(255,59,92,0.12)', border: 'rgba(255,59,92,0.35)', text: '#FF3B5C', label: 'Fail', icon: '✕' },
}

const PRIORITY_COLORS: Record<string, string> = {
  critical: '#FF3B5C',
  high: '#D6B05E',
  medium: '#00D4FF',
  low: '#A0A0A5',
}

// ─── Main Component ────────────────────────────────────────
export default function TestingDashboard() {
  const [results, setResults] = useState<Record<string, TaskResult>>({})
  const [tester, setTester] = useState('')
  const [filter, setFilter] = useState<'all' | TaskStatus>('all')
  const [search, setSearch] = useState('')
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})
  const [showTesters, setShowTesters] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  // Load from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) setResults(JSON.parse(saved))
      const savedTester = localStorage.getItem(TESTER_KEY)
      if (savedTester) setTester(savedTester)
    } catch {}
  }, [])

  // Save to localStorage
  useEffect(() => {
    if (Object.keys(results).length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(results))
    }
  }, [results])

  useEffect(() => {
    if (tester) localStorage.setItem(TESTER_KEY, tester)
  }, [tester])

  const setTaskStatus = useCallback((taskId: string, status: TaskStatus) => {
    setResults(prev => ({
      ...prev,
      [taskId]: {
        status,
        tester: tester || 'Anonymous',
        notes: prev[taskId]?.notes || '',
        updatedAt: new Date().toISOString(),
      },
    }))
  }, [tester])

  const setTaskNotes = useCallback((taskId: string, notes: string) => {
    setResults(prev => ({
      ...prev,
      [taskId]: {
        ...prev[taskId],
        status: prev[taskId]?.status || 'undetermined',
        tester: prev[taskId]?.tester || tester || 'Anonymous',
        notes,
        updatedAt: new Date().toISOString(),
      },
    }))
  }, [tester])

  const toggleCollapse = useCallback((sectionId: string) => {
    setCollapsed(prev => ({ ...prev, [sectionId]: !prev[sectionId] }))
  }, [])

  // Stats
  const stats = useMemo(() => {
    let complete = 0, problem = 0, undetermined = 0
    const testers = new Set<string>()
    SECTIONS.forEach(s => s.tasks.forEach(t => {
      const r = results[t.id]
      if (r?.status === 'complete') complete++
      else if (r?.status === 'problem') problem++
      else undetermined++
      if (r?.tester) testers.add(r.tester)
    }))
    return { complete, problem, undetermined, testers: Array.from(testers), total: TOTAL_TASKS }
  }, [results])

  const sectionStats = useCallback((section: Section) => {
    let complete = 0, problem = 0
    section.tasks.forEach(t => {
      const s = results[t.id]?.status
      if (s === 'complete') complete++
      else if (s === 'problem') problem++
    })
    return { complete, problem, total: section.tasks.length }
  }, [results])

  // Filter tasks
  const filteredSections = useMemo(() => {
    return SECTIONS.map(s => ({
      ...s,
      tasks: s.tasks.filter(t => {
        const status = results[t.id]?.status || 'undetermined'
        if (filter !== 'all' && status !== filter) return false
        if (search && !t.label.toLowerCase().includes(search.toLowerCase()) && !t.id.toLowerCase().includes(search.toLowerCase())) return false
        return true
      }),
    })).filter(s => s.tasks.length > 0)
  }, [results, filter, search])

  // Export / Import
  const exportResults = () => {
    const data = JSON.stringify({ results, exportedAt: new Date().toISOString(), tester }, null, 2)
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `sm-qa-results-${tester || 'team'}-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const importResults = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string)
        if (data.results) {
          // Merge: imported results override existing for the same task
          setResults(prev => ({ ...prev, ...data.results }))
        }
      } catch { alert('Invalid file format') }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const resetAll = () => {
    if (confirm('Reset ALL test results? This cannot be undone.')) {
      setResults({})
      localStorage.removeItem(STORAGE_KEY)
    }
  }

  const pct = stats.total > 0 ? Math.round((stats.complete / stats.total) * 100) : 0

  return (
    <div style={{ minHeight: '100vh', background: '#050508', color: '#F8F8F8', padding: '24px 16px 100px' }}>
      <div style={{ maxWidth: 960, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 4 }}>QA Testing Checklist</h1>
          <p style={{ color: '#A0A0A5', fontSize: 14 }}>SportsMockery — {TOTAL_TASKS} tasks across {SECTIONS.length} sections</p>
        </div>

        {/* Tester Identity */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap', alignItems: 'center' }}>
          <label style={{ fontSize: 14, color: '#A0A0A5' }}>Tester:</label>
          <input
            value={tester}
            onChange={e => setTester(e.target.value)}
            placeholder="Your name"
            style={{
              background: '#121216', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8,
              padding: '8px 12px', color: '#F8F8F8', fontSize: 14, width: 200,
            }}
          />
          {stats.testers.length > 0 && (
            <button onClick={() => setShowTesters(!showTesters)} style={{
              background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.3)', borderRadius: 8,
              padding: '8px 14px', color: '#00D4FF', fontSize: 13, cursor: 'pointer',
            }}>
              {stats.testers.length} tester{stats.testers.length > 1 ? 's' : ''} {showTesters ? '▲' : '▼'}
            </button>
          )}
        </div>

        {showTesters && stats.testers.length > 0 && (
          <div style={{ background: '#121216', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: 16, marginBottom: 24 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: '#00D4FF' }}>Active Testers</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {stats.testers.map(t => (
                <span key={t} style={{ background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.2)', borderRadius: 20, padding: '4px 12px', fontSize: 13 }}>{t}</span>
              ))}
            </div>
          </div>
        )}

        {/* Progress Overview */}
        <div style={{
          background: '#121216', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16,
          padding: 24, marginBottom: 24,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
            <h2 style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>Overall Progress — {pct}%</h2>
            <div style={{ display: 'flex', gap: 16, fontSize: 14 }}>
              <span style={{ color: '#00E676' }}>✓ {stats.complete} passed</span>
              <span style={{ color: '#FF3B5C' }}>✕ {stats.problem} failed</span>
              <span style={{ color: '#A0A0A5' }}>○ {stats.undetermined} untested</span>
            </div>
          </div>
          <div style={{ height: 8, background: 'rgba(255,255,255,0.06)', borderRadius: 4, overflow: 'hidden' }}>
            <div style={{ display: 'flex', height: '100%' }}>
              <div style={{ width: `${(stats.complete / stats.total) * 100}%`, background: '#00E676', transition: 'width 0.3s' }} />
              <div style={{ width: `${(stats.problem / stats.total) * 100}%`, background: '#FF3B5C', transition: 'width 0.3s' }} />
            </div>
          </div>
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
          {(['all', 'undetermined', 'complete', 'problem'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              background: filter === f ? 'rgba(0,212,255,0.15)' : 'rgba(255,255,255,0.04)',
              border: `1px solid ${filter === f ? 'rgba(0,212,255,0.4)' : 'rgba(255,255,255,0.08)'}`,
              borderRadius: 8, padding: '6px 14px', color: filter === f ? '#00D4FF' : '#A0A0A5',
              fontSize: 13, cursor: 'pointer', textTransform: 'capitalize',
            }}>
              {f === 'all' ? `All (${TOTAL_TASKS})` : `${STATUS_CONFIG[f].label} (${f === 'complete' ? stats.complete : f === 'problem' ? stats.problem : stats.undetermined})`}
            </button>
          ))}

          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search tasks..."
            style={{
              background: '#121216', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8,
              padding: '6px 12px', color: '#F8F8F8', fontSize: 13, flex: '1 1 200px', minWidth: 150,
            }}
          />

          <button onClick={exportResults} style={{
            background: 'rgba(214,176,94,0.1)', border: '1px solid rgba(214,176,94,0.3)', borderRadius: 8,
            padding: '6px 14px', color: '#D6B05E', fontSize: 13, cursor: 'pointer',
          }}>
            Export
          </button>
          <button onClick={() => fileRef.current?.click()} style={{
            background: 'rgba(214,176,94,0.1)', border: '1px solid rgba(214,176,94,0.3)', borderRadius: 8,
            padding: '6px 14px', color: '#D6B05E', fontSize: 13, cursor: 'pointer',
          }}>
            Import
          </button>
          <input ref={fileRef} type="file" accept=".json" onChange={importResults} style={{ display: 'none' }} />
          <button onClick={resetAll} style={{
            background: 'rgba(255,59,92,0.08)', border: '1px solid rgba(255,59,92,0.2)', borderRadius: 8,
            padding: '6px 14px', color: '#FF3B5C', fontSize: 13, cursor: 'pointer',
          }}>
            Reset
          </button>
        </div>

        {/* Sections */}
        {filteredSections.map(section => {
          const ss = sectionStats(section)
          const isCollapsed = collapsed[section.id]
          const sectionPct = ss.total > 0 ? Math.round((ss.complete / ss.total) * 100) : 0

          return (
            <div key={section.id} style={{
              background: '#121216', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14,
              marginBottom: 12, overflow: 'hidden',
            }}>
              {/* Section Header */}
              <button
                onClick={() => toggleCollapse(section.id)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '16px 20px', background: 'none', border: 'none', color: '#F8F8F8',
                  cursor: 'pointer', fontSize: 15, fontWeight: 600, textAlign: 'left',
                }}
              >
                <span>
                  <span style={{ marginRight: 8 }}>{section.icon}</span>
                  {section.title}
                  <span style={{ color: '#A0A0A5', fontWeight: 400, fontSize: 13, marginLeft: 8 }}>
                    ({ss.complete}/{ss.total})
                  </span>
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  {ss.problem > 0 && <span style={{ color: '#FF3B5C', fontSize: 12 }}>{ss.problem} fail</span>}
                  <span style={{ fontSize: 13, color: sectionPct === 100 ? '#00E676' : '#A0A0A5' }}>{sectionPct}%</span>
                  <span style={{ fontSize: 12, color: '#A0A0A5' }}>{isCollapsed ? '▶' : '▼'}</span>
                </span>
              </button>

              {/* Section Progress Bar */}
              <div style={{ height: 3, background: 'rgba(255,255,255,0.04)' }}>
                <div style={{ display: 'flex', height: '100%' }}>
                  <div style={{ width: `${(ss.complete / ss.total) * 100}%`, background: '#00E676', transition: 'width 0.3s' }} />
                  <div style={{ width: `${(ss.problem / ss.total) * 100}%`, background: '#FF3B5C', transition: 'width 0.3s' }} />
                </div>
              </div>

              {/* Tasks */}
              {!isCollapsed && (
                <div style={{ padding: '4px 0' }}>
                  {section.tasks.map(task => {
                    const result = results[task.id]
                    const status: TaskStatus = result?.status || 'undetermined'
                    const cfg = STATUS_CONFIG[status]

                    return (
                      <div key={task.id} style={{
                        display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 20px',
                        borderBottom: '1px solid rgba(255,255,255,0.03)',
                      }}>
                        {/* Status Buttons */}
                        <div style={{ display: 'flex', gap: 4, flexShrink: 0, paddingTop: 2 }}>
                          {(['complete', 'problem', 'undetermined'] as TaskStatus[]).map(s => (
                            <button
                              key={s}
                              onClick={() => setTaskStatus(task.id, s)}
                              title={STATUS_CONFIG[s].label}
                              style={{
                                width: 26, height: 26, borderRadius: 6, border: `1px solid ${status === s ? STATUS_CONFIG[s].border : 'rgba(255,255,255,0.08)'}`,
                                background: status === s ? STATUS_CONFIG[s].bg : 'transparent',
                                color: status === s ? STATUS_CONFIG[s].text : '#555',
                                cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontWeight: 700, transition: 'all 0.15s',
                              }}
                            >
                              {STATUS_CONFIG[s].icon}
                            </button>
                          ))}
                        </div>

                        {/* Task Content */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                            {task.priority && (
                              <span style={{
                                fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em',
                                color: PRIORITY_COLORS[task.priority], background: `${PRIORITY_COLORS[task.priority]}15`,
                                padding: '2px 6px', borderRadius: 4,
                              }}>
                                {task.priority}
                              </span>
                            )}
                            <span style={{ fontSize: 14, color: status === 'complete' ? '#00E676' : status === 'problem' ? '#FF3B5C' : '#F8F8F8' }}>
                              {task.label}
                            </span>
                            {task.route && (
                              <a
                                href={task.route.includes('[') ? '#' : task.route}
                                target={task.route.includes('[') ? undefined : '_blank'}
                                rel="noopener noreferrer"
                                onClick={e => { if (task.route?.includes('[')) e.preventDefault() }}
                                style={{ fontSize: 11, color: '#00D4FF', opacity: 0.6, textDecoration: 'none', whiteSpace: 'nowrap' }}
                              >
                                {task.route}
                              </a>
                            )}
                          </div>

                          {/* Notes + Tester */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                            <input
                              value={result?.notes || ''}
                              onChange={e => setTaskNotes(task.id, e.target.value)}
                              placeholder="Notes..."
                              style={{
                                flex: 1, background: 'transparent', border: 'none', borderBottom: '1px solid rgba(255,255,255,0.06)',
                                color: '#A0A0A5', fontSize: 12, padding: '2px 0', outline: 'none',
                              }}
                            />
                            {result?.tester && (
                              <span style={{ fontSize: 11, color: '#555', whiteSpace: 'nowrap' }}>
                                {result.tester}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}

        {filteredSections.length === 0 && (
          <div style={{ textAlign: 'center', padding: 60, color: '#A0A0A5' }}>
            No tasks match your filter.
          </div>
        )}
      </div>
    </div>
  )
}
