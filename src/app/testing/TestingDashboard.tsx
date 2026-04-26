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
      { id: 'hp-hero-loads', label: 'The big opening section fills the entire screen when the page first loads', route: '/', priority: 'critical' },
      { id: 'hp-hero-scroll', label: 'News articles are hidden until you scroll down past the opening section', route: '/' },
      { id: 'hp-stars-anim', label: 'Animated Chicago-style stars float gently in the background', route: '/' },
      { id: 'hp-stars-reduced', label: 'Animations stop if you have "reduce motion" turned on in your device settings', route: '/' },
      { id: 'hp-scout-input', label: 'The Scout AI search bar is visible and you can type in it', route: '/' },
      { id: 'hp-blitz-logo', label: 'Small Blitz logo appears in the top-left corner (not too large)', route: '/' },
      { id: 'hp-feed-infinite', label: 'Scrolling down loads more and more article cards (never-ending feed)', route: '/', priority: 'critical' },
      { id: 'hp-feed-cards-render', label: 'Article cards have a colored left border matching each team', route: '/' },
      { id: 'hp-insight-blocks', label: 'Scout AI insight boxes appear with a blue/cyan left border', route: '/' },
      { id: 'hp-sidebar', label: 'Sidebar on the right shows trending topics and team stat leaders', route: '/' },
      { id: 'hp-hero-games', label: 'Upcoming or live Chicago games appear in the opening section', route: '/' },
      { id: 'hp-game-times-ct', label: 'All game times show Central Time (e.g. "6:30 PM CT")', route: '/' },
      { id: 'hp-no-completed-hero', label: 'Games that are already over do NOT show in the opening section', route: '/' },
      { id: 'hp-theme-toggle', label: 'Clicking the sun/moon icon switches between light and dark mode', route: '/' },
      { id: 'hp-dark-mode', label: 'Dark mode looks good — text is readable, backgrounds are dark', route: '/' },
      { id: 'hp-light-mode', label: 'Light mode looks good — text is readable, backgrounds are light', route: '/' },
      { id: 'hp-color-palette', label: 'Site only uses brand colors: black, white, red, cyan blue, and gold — no random colors', route: '/' },
      { id: 'hp-font', label: 'All text uses the same font (Space Grotesk) — no mismatched fonts', route: '/' },
      { id: 'hp-min-text', label: 'No text anywhere is too tiny to read', route: '/' },
      { id: 'hp-feed-page', label: 'The /feed page loads and shows scrollable articles', route: '/feed' },
      { id: 'hp-home-page', label: 'The /home page loads without errors', route: '/home' },
      { id: 'hp-api-feed', label: 'Articles actually load on the homepage (not blank or stuck loading)', priority: 'critical' },
      { id: 'hp-api-hero-games', label: 'Only upcoming/live games appear in the hero — no past games', priority: 'critical' },
      { id: 'hp-api-river', label: 'Feed cards populate as you scroll (not empty)' },
    ],
  },
  {
    id: 'team-bears',
    title: '2a. Chicago Bears',
    icon: '🐻',
    tasks: [
      { id: 'bears-hub', label: 'Bears main page loads — shows key players, next game, and stats', route: '/chicago-bears', priority: 'critical' },
      { id: 'bears-record', label: 'Season record is correct: 11-6 (2025 season)', route: '/chicago-bears' },
      { id: 'bears-roster', label: 'Roster page shows about 52 players with photos', route: '/chicago-bears/roster', priority: 'critical' },
      { id: 'bears-roster-headshots', label: 'Player photos load (not broken image icons)', route: '/chicago-bears/roster' },
      { id: 'bears-players', label: 'Players page loads and you can filter by position (QB, WR, etc.)', route: '/chicago-bears/players' },
      { id: 'bears-player-detail', label: 'Clicking a player opens their page with stats and contract info', route: '/chicago-bears/players/[slug]', priority: 'high' },
      { id: 'bears-schedule', label: 'Schedule page shows all 17 regular season games with scores', route: '/chicago-bears/schedule', priority: 'critical' },
      { id: 'bears-schedule-times', label: 'Game times show Central Time (e.g. "7:00 PM CT")', route: '/chicago-bears/schedule' },
      { id: 'bears-scores', label: 'Scores page loads and shows game results', route: '/chicago-bears/scores' },
      { id: 'bears-stats', label: 'Stats page shows top players for Passing, Rushing, Receiving, Tackles, Sacks', route: '/chicago-bears/stats', priority: 'critical' },
      { id: 'bears-stats-dual', label: 'Stat numbers actually appear (not blank or zero for players who have stats)', route: '/chicago-bears/stats' },
      { id: 'bears-cap', label: 'Cap tracker shows salary info with a $303.45M salary cap', route: '/chicago-bears/cap-tracker', priority: 'high' },
      { id: 'bears-depth', label: 'Depth chart page loads and shows player positions', route: '/chicago-bears/depth-chart' },
      { id: 'bears-draft', label: 'Draft tracker page loads', route: '/chicago-bears/draft-tracker' },
      { id: 'bears-rumors', label: 'Trade rumors page loads', route: '/chicago-bears/trade-rumors' },
      { id: 'bears-game-center', label: 'Game center shows past results and upcoming games', route: '/chicago-bears/game-center' },
      { id: 'bears-live', label: 'Live game page loads (or shows "no game right now" message)', route: '/chicago-bears/live' },
      { id: 'bears-sidebar-stats', label: 'Stat leaders in the sidebar match the numbers on the Stats page', route: '/chicago-bears' },
    ],
  },
  {
    id: 'team-bulls',
    title: '2b. Chicago Bulls',
    icon: '🐂',
    tasks: [
      { id: 'bulls-hub', label: 'Bulls main page loads with team info', route: '/chicago-bulls', priority: 'critical' },
      { id: 'bulls-record', label: 'Season record is correct: 30-50 (2025-26 season)', route: '/chicago-bulls' },
      { id: 'bulls-roster', label: 'Roster page shows about 18 current players', route: '/chicago-bulls/roster', priority: 'critical' },
      { id: 'bulls-players', label: 'Players page loads with the full list', route: '/chicago-bulls/players' },
      { id: 'bulls-player-detail', label: 'Clicking a player opens their detail page', route: '/chicago-bulls/players/[slug]' },
      { id: 'bulls-schedule', label: 'Schedule page shows all 82 games', route: '/chicago-bulls/schedule', priority: 'critical' },
      { id: 'bulls-scores', label: 'Scores page loads with results', route: '/chicago-bulls/scores' },
      { id: 'bulls-stats', label: 'Stats page shows leaders for Points, Rebounds, Assists, Steals, Blocks', route: '/chicago-bulls/stats', priority: 'critical' },
      { id: 'bulls-stats-cols', label: 'Shooting percentages (FG%, 3PT%, FT%) display correctly — not blank', route: '/chicago-bulls/stats' },
      { id: 'bulls-cap', label: 'Cap tracker shows salary info with a $154.6M salary cap', route: '/chicago-bulls/cap-tracker' },
      { id: 'bulls-depth', label: 'Depth chart page loads', route: '/chicago-bulls/depth-chart' },
      { id: 'bulls-draft', label: 'Draft tracker page loads', route: '/chicago-bulls/draft-tracker' },
      { id: 'bulls-rumors', label: 'Trade rumors page loads', route: '/chicago-bulls/trade-rumors' },
      { id: 'bulls-game-center', label: 'Game center page loads', route: '/chicago-bulls/game-center' },
      { id: 'bulls-live', label: 'Live game page loads', route: '/chicago-bulls/live' },
    ],
  },
  {
    id: 'team-cubs',
    title: '2c. Chicago Cubs',
    icon: '⚾',
    tasks: [
      { id: 'cubs-hub', label: 'Cubs main page loads with team info', route: '/chicago-cubs', priority: 'critical' },
      { id: 'cubs-record', label: 'Season record is correct: 92-70 (2025 season)', route: '/chicago-cubs' },
      { id: 'cubs-roster', label: 'Roster page shows about 40 players', route: '/chicago-cubs/roster', priority: 'critical' },
      { id: 'cubs-players', label: 'Players page loads with the full list', route: '/chicago-cubs/players' },
      { id: 'cubs-schedule', label: 'Schedule page shows all 162 games', route: '/chicago-cubs/schedule', priority: 'critical' },
      { id: 'cubs-scores', label: 'Scores page loads with results', route: '/chicago-cubs/scores' },
      { id: 'cubs-stats', label: 'Stats page shows leaders for Batting Average, Home Runs, OBP, RBI', route: '/chicago-cubs/stats', priority: 'critical' },
      { id: 'cubs-stats-cols', label: 'Batting stats display real numbers — not blank or all zeros', route: '/chicago-cubs/stats' },
      { id: 'cubs-cap', label: 'Cap tracker shows salary info with a $244M luxury tax threshold', route: '/chicago-cubs/cap-tracker' },
      { id: 'cubs-pitchers', label: 'Upcoming games on the schedule show probable starting pitchers', route: '/chicago-cubs/schedule' },
      { id: 'cubs-depth', label: 'Depth chart page loads', route: '/chicago-cubs/depth-chart' },
      { id: 'cubs-draft', label: 'Draft tracker page loads', route: '/chicago-cubs/draft-tracker' },
      { id: 'cubs-rumors', label: 'Trade rumors page loads', route: '/chicago-cubs/trade-rumors' },
      { id: 'cubs-game-center', label: 'Game center page loads', route: '/chicago-cubs/game-center' },
      { id: 'cubs-live', label: 'Live game page loads', route: '/chicago-cubs/live' },
    ],
  },
  {
    id: 'team-blackhawks',
    title: '2d. Chicago Blackhawks',
    icon: '🏒',
    tasks: [
      { id: 'hawks-hub', label: 'Blackhawks main page loads with team info', route: '/chicago-blackhawks', priority: 'critical' },
      { id: 'hawks-record', label: 'Season record is correct: 28-38-14 (2025-26 season)', route: '/chicago-blackhawks' },
      { id: 'hawks-roster', label: 'Roster page shows about 23 players', route: '/chicago-blackhawks/roster', priority: 'critical' },
      { id: 'hawks-players', label: 'Players page loads with the full list', route: '/chicago-blackhawks/players' },
      { id: 'hawks-schedule', label: 'Schedule page shows all 82 games', route: '/chicago-blackhawks/schedule', priority: 'critical' },
      { id: 'hawks-scores', label: 'Scores page loads with results', route: '/chicago-blackhawks/scores' },
      { id: 'hawks-stats', label: 'Stats page shows leaders for Goals, Assists, Points, Save %', route: '/chicago-blackhawks/stats', priority: 'critical' },
      { id: 'hawks-stats-otl', label: 'Overtime losses are counted correctly in the record', route: '/chicago-blackhawks/stats' },
      { id: 'hawks-cap', label: 'Cap tracker shows salary info with a $95.5M salary cap', route: '/chicago-blackhawks/cap-tracker' },
      { id: 'hawks-depth', label: 'Depth chart page loads', route: '/chicago-blackhawks/depth-chart' },
      { id: 'hawks-draft', label: 'Draft tracker page loads', route: '/chicago-blackhawks/draft-tracker' },
      { id: 'hawks-rumors', label: 'Trade rumors page loads', route: '/chicago-blackhawks/trade-rumors' },
      { id: 'hawks-game-center', label: 'Game center page loads', route: '/chicago-blackhawks/game-center' },
      { id: 'hawks-live', label: 'Live game page loads', route: '/chicago-blackhawks/live' },
    ],
  },
  {
    id: 'team-whitesox',
    title: '2e. Chicago White Sox',
    icon: '⚾',
    tasks: [
      { id: 'sox-hub', label: 'White Sox main page loads with team info', route: '/chicago-white-sox', priority: 'critical' },
      { id: 'sox-record', label: 'Season record is correct: 60-102 (2025 season)', route: '/chicago-white-sox' },
      { id: 'sox-roster', label: 'Roster page shows about 40 players', route: '/chicago-white-sox/roster', priority: 'critical' },
      { id: 'sox-players', label: 'Players page loads with the full list', route: '/chicago-white-sox/players' },
      { id: 'sox-schedule', label: 'Schedule page shows all 162 games', route: '/chicago-white-sox/schedule', priority: 'critical' },
      { id: 'sox-scores', label: 'Scores page loads with results', route: '/chicago-white-sox/scores' },
      { id: 'sox-stats', label: 'Stats page shows leaders for Batting Average, Home Runs, OBP, RBI', route: '/chicago-white-sox/stats', priority: 'critical' },
      { id: 'sox-cap', label: 'Cap tracker shows salary info with a $244M luxury tax threshold', route: '/chicago-white-sox/cap-tracker' },
      { id: 'sox-depth', label: 'Depth chart page loads', route: '/chicago-white-sox/depth-chart' },
      { id: 'sox-draft', label: 'Draft tracker page loads', route: '/chicago-white-sox/draft-tracker' },
      { id: 'sox-rumors', label: 'Trade rumors page loads', route: '/chicago-white-sox/trade-rumors' },
      { id: 'sox-game-center', label: 'Game center page loads', route: '/chicago-white-sox/game-center' },
      { id: 'sox-live', label: 'Live game page loads', route: '/chicago-white-sox/live' },
    ],
  },
  {
    id: 'scout-ai',
    title: '3. Scout AI',
    icon: '🤖',
    tasks: [
      { id: 'scout-page', label: 'Scout AI page loads', route: '/scout-ai', priority: 'critical' },
      { id: 'scout-query', label: 'You can ask a question and get an AI answer back', route: '/scout-ai', priority: 'critical' },
      { id: 'scout-session', label: 'Follow-up questions remember what you asked before (context carries over)', route: '/scout-ai' },
      { id: 'scout-chart', label: 'Asking about stat comparisons shows a chart or graph', route: '/scout-ai' },
      { id: 'scout-bonus', label: 'Extra "bonus insight" tips appear below answers', route: '/scout-ai' },
      { id: 'scout-history-guest', label: 'Past questions show up in history even if you\'re not logged in', route: '/scout-ai' },
      { id: 'scout-history-user', label: 'Past questions show up in history when logged in', route: '/scout-ai' },
      { id: 'scout-prompts', label: 'Suggested question prompts appear and change over time', route: '/scout-ai' },
      { id: 'scout-premium', label: 'Free users see a message about upgrading for more access', route: '/scout-ai' },
      { id: 'scout-timeout', label: 'If the AI takes too long, an error message appears instead of hanging forever', route: '/scout-ai' },
      { id: 'scout-markdown', label: 'Answers look formatted (bold text, bullet lists, etc.) — not raw code', route: '/scout-ai' },
      { id: 'scout-mobile', label: 'Works well on phone — fills the screen, easy to type and read', route: '/scout-ai' },
      { id: 'scout-api', label: 'Answers actually come back (not stuck loading or showing errors)', priority: 'critical' },
    ],
  },
  {
    id: 'gm',
    title: '4. GM Trade Simulator',
    icon: '💼',
    tasks: [
      { id: 'gm-page', label: 'GM Trade Simulator page loads', route: '/gm', priority: 'critical' },
      { id: 'gm-auth', label: 'You must be logged in to use it (redirects to login if not)', route: '/gm', priority: 'critical' },
      { id: 'gm-team-select', label: 'You can pick any of the 5 Chicago teams', route: '/gm' },
      { id: 'gm-roster-load', label: 'The team roster loads with real player names and salaries', route: '/gm', priority: 'critical' },
      { id: 'gm-roster-filter', label: 'You can filter players by position (QB, WR, etc.)', route: '/gm' },
      { id: 'gm-trade-board', label: 'You can add and remove players from a 2-team trade board', route: '/gm', priority: 'critical' },
      { id: 'gm-3team', label: 'Three-team trade option works', route: '/gm' },
      { id: 'gm-salary-validate', label: 'Trades that go over the salary cap are blocked with a warning', route: '/gm', priority: 'critical' },
      { id: 'gm-grade', label: 'Clicking "Grade" gives a score from 0-100 with explanation', route: '/gm', priority: 'critical' },
      { id: 'gm-grade-dangerous', label: 'Risky trades (scored 70-90) show a "dangerous" warning', route: '/gm' },
      { id: 'gm-untouchable', label: 'Trading untouchable stars (Caleb Williams, Connor Bedard) always gets a 0 grade', route: '/gm', priority: 'high' },
      { id: 'gm-rate-limit', label: 'Spamming the grade button eventually shows a "slow down" message', route: '/gm' },
      { id: 'gm-sim', label: 'Season simulation runs and shows a projected record after trades', route: '/gm', priority: 'high' },
      { id: 'gm-sim-fallback', label: 'Season simulation still works even if the main system is slow', route: '/gm' },
      { id: 'gm-history', label: 'Your past trades are saved and visible during your session', route: '/gm' },
      { id: 'gm-share', label: 'Sharing a trade creates a link you can copy', route: '/gm' },
      { id: 'gm-share-load', label: 'Opening a shared trade link shows the trade already filled in', route: '/gm/share/[code]' },
      { id: 'gm-picks', label: 'You can trade draft picks (not just players)', route: '/gm' },
      { id: 'gm-prospects', label: 'Draft prospect names and info load correctly', route: '/gm' },
      { id: 'gm-analytics', label: 'GM analytics page loads', route: '/gm/analytics' },
      { id: 'gm-leaderboard', label: 'Leaderboard shows user rankings', route: '/leaderboard' },
      { id: 'gm-my-score', label: 'My GM Score page shows your personal trade stats', route: '/my-gm-score' },
      { id: 'gm-mobile', label: 'Trade board is usable on a phone screen', route: '/gm' },
    ],
  },
  {
    id: 'mock-draft',
    title: '5. Mock Draft',
    icon: '📋',
    tasks: [
      { id: 'md-page', label: 'Mock Draft page loads', route: '/mock-draft', priority: 'critical' },
      { id: 'md-eligibility', label: 'Only offseason teams are available to draft for', route: '/mock-draft', priority: 'critical' },
      { id: 'md-bears-eligible', label: 'Bears are available (they\'re in the offseason)', route: '/mock-draft' },
      { id: 'md-cubs-eligible', label: 'Cubs are available (they\'re in the offseason)', route: '/mock-draft' },
      { id: 'md-sox-eligible', label: 'White Sox are available (they\'re in the offseason)', route: '/mock-draft' },
      { id: 'md-bulls-blocked', label: 'Bulls are NOT available (their season is still going)', route: '/mock-draft' },
      { id: 'md-hawks-blocked', label: 'Blackhawks are NOT available (their season is still going)', route: '/mock-draft' },
      { id: 'md-auto-select', label: 'If only one team is eligible, it picks that team automatically', route: '/mock-draft' },
      { id: 'md-picks', label: 'You can select draft prospects for your team\'s picks', route: '/mock-draft', priority: 'critical' },
      { id: 'md-auto-advance', label: 'Other teams\' picks advance automatically', route: '/mock-draft' },
      { id: 'md-grade', label: 'Each draft pick gets a grade', route: '/mock-draft' },
      { id: 'md-share', label: 'You can share your mock draft via a link', route: '/mock-draft' },
      { id: 'md-share-load', label: 'Opening a shared mock draft link shows the picks already filled in', route: '/mock-draft/share/[mockId]' },
      { id: 'md-no-override', label: 'Team availability matches what the system says — no glitches showing wrong teams', route: '/mock-draft', priority: 'critical' },
    ],
  },
  {
    id: 'fan-chat',
    title: '6. Fan Chat',
    icon: '💬',
    tasks: [
      { id: 'chat-page', label: 'Fan Chat page loads', route: '/fan-chat', priority: 'critical' },
      { id: 'chat-channels', label: 'All 5 team chat rooms are visible (Bears Den, Bulls Nation, etc.)', route: '/fan-chat', priority: 'critical' },
      { id: 'chat-switch', label: 'Switching between team rooms shows past messages', route: '/fan-chat' },
      { id: 'chat-send', label: 'You can type and send a message', route: '/fan-chat', priority: 'critical' },
      { id: 'chat-ai', label: 'AI bot responds with personality matching the team', route: '/fan-chat' },
      { id: 'chat-realtime', label: 'New messages appear instantly without refreshing the page', route: '/fan-chat', priority: 'high' },
      { id: 'chat-online', label: 'Shows how many people are online in each room', route: '/fan-chat' },
      { id: 'chat-names', label: 'Usernames and badges show up next to messages', route: '/fan-chat' },
      { id: 'chat-timestamps', label: 'Message times look correct', route: '/fan-chat' },
      { id: 'chat-avatars', label: 'Profile pictures show next to messages', route: '/fan-chat' },
      { id: 'chat-mobile', label: 'Chat works well on a phone screen', route: '/fan-chat' },
    ],
  },
  {
    id: 'live-games',
    title: '7. Live Games',
    icon: '🔴',
    tasks: [
      { id: 'live-page', label: 'Live Games page loads', route: '/live', priority: 'critical' },
      { id: 'live-scores', label: 'Live scores update automatically during games (every 10 seconds)', route: '/live', priority: 'critical' },
      { id: 'live-ct', label: 'Game times show Central Time (e.g. "7:00 PM CT")', route: '/live' },
      { id: 'live-detail', label: 'Clicking a game opens a detail page with full stats', route: '/live/[sport]/[gameId]', priority: 'critical' },
      { id: 'live-pbp', label: 'Play-by-play updates appear in real time during live games', route: '/live/[sport]/[gameId]' },
      { id: 'live-linescore', label: 'Score-by-quarter (or by-inning for MLB) displays correctly', route: '/live/[sport]/[gameId]' },
      { id: 'live-player-stats', label: 'Individual player stats show during the game', route: '/live/[sport]/[gameId]' },
      { id: 'live-team-stats', label: 'Team stat comparison (home vs away) displays', route: '/live/[sport]/[gameId]' },
      { id: 'live-logos', label: 'Both teams\' logos display correctly', route: '/live' },
      { id: 'live-pre-game', label: 'Before the game starts, shows starting pitchers (MLB) or matchup info', route: '/live' },
      { id: 'live-post-game', label: 'After the game, shows the final score', route: '/live' },
      { id: 'live-game-center', label: 'Game Center page shows all past and upcoming games', route: '/game-center' },
      { id: 'live-api', label: 'Live scores actually load (not blank or stuck)', priority: 'critical' },
      { id: 'live-api-detail', label: 'Game detail pages show real data (not empty)', priority: 'critical' },
      { id: 'live-mobile', label: 'Scores are easy to read on a phone', route: '/live' },
    ],
  },
  {
    id: 'owner',
    title: '8. Owner Pages',
    icon: '👔',
    tasks: [
      { id: 'owner-list', label: 'All 5 team ownership grade cards load', route: '/owner', priority: 'high' },
      { id: 'owner-grades', label: 'Each grade category shows (Overall, Spending, Results, Fan Sentiment, Loyalty Tax)', route: '/owner' },
      { id: 'owner-vote', label: 'You can vote agree or disagree on a grade (when logged in)', route: '/owner' },
      { id: 'owner-detail', label: 'Clicking a team opens its detailed ownership page', route: '/owner/[team]' },
      { id: 'owner-scout', label: 'Scout AI commentary appears on the page', route: '/owner/[team]' },
      { id: 'owner-timeline', label: 'Grade history chart displays over time', route: '/owner/[team]' },
      { id: 'owner-comments', label: 'User comments load and display', route: '/owner/[team]' },
      { id: 'owner-mobile', label: 'Looks good on a phone', route: '/owner' },
    ],
  },
  {
    id: 'articles',
    title: '9. Articles & Content',
    icon: '📰',
    tasks: [
      { id: 'article-loads', label: 'Article pages load with all content sections visible', route: '/[category]/[slug]', priority: 'critical' },
      { id: 'article-header', label: 'Headline, main image, and author name all show up', route: '/[category]/[slug]' },
      { id: 'article-html', label: 'Text formatting looks right (bold, italic, links are clickable) — no raw code showing', route: '/[category]/[slug]', priority: 'critical' },
      { id: 'article-read-time', label: '"X min read" time shows near the top', route: '/[category]/[slug]' },
      { id: 'article-views', label: 'View count goes up when you open the article', route: '/[category]/[slug]' },
      { id: 'article-insight', label: 'Scout AI insight boxes appear with a blue/cyan border', route: '/[category]/[slug]' },
      { id: 'article-chart', label: 'Charts and graphs display inside articles', route: '/[category]/[slug]' },
      { id: 'article-poll', label: 'You can vote on polls embedded in articles', route: '/[category]/[slug]' },
      { id: 'article-debate', label: 'Debate sections show Pro (blue) and Con (red) sides with vote counts', route: '/[category]/[slug]' },
      { id: 'article-related', label: '3-5 related article suggestions appear at the bottom', route: '/[category]/[slug]' },
      { id: 'article-share', label: 'Share buttons for X and Facebook are visible', route: '/[category]/[slug]' },
      { id: 'article-author', label: 'Clicking the author name goes to their profile page', route: '/[category]/[slug]' },
      { id: 'article-category', label: 'Category pages (e.g. /bears) show multiple articles and paginate', route: '/[category]' },
      { id: 'article-datahub', label: 'DataHub analytics pages load', route: '/[category]/datahub' },
      { id: 'article-mobile', label: 'Articles are easy to read on a phone — text and images fit the screen', route: '/[category]/[slug]' },
      { id: 'article-dark', label: 'In dark mode, article text is still easy to read', route: '/[category]/[slug]' },
    ],
  },
  {
    id: 'players',
    title: '10. Player Pages',
    icon: '🏃',
    tasks: [
      { id: 'players-list', label: 'Players search page loads', route: '/players', priority: 'high' },
      { id: 'players-detail', label: 'Clicking a player opens their full page with bio and stats', route: '/players/[playerId]' },
      { id: 'players-headshot', label: 'Player photos display (not broken images)', route: '/players/[playerId]' },
      { id: 'players-stats', label: 'Season stats look accurate (spot-check a few well-known players)', route: '/players/[playerId]/stats' },
      { id: 'players-gamelog', label: 'Game log shows every game the player appeared in', route: '/players/[playerId]/game-log' },
      { id: 'players-contract', label: 'Contract/salary info appears and matches the cap tracker page', route: '/players/[playerId]' },
      { id: 'players-opponent', label: 'Stats only show the player\'s own performance (not opponent stats mixed in)', route: '/players/[playerId]' },
      { id: 'players-search', label: 'Searching by name finds the correct player', route: '/players' },
      { id: 'players-mobile', label: 'Stats table scrolls sideways on phone (not cut off)', route: '/players/[playerId]' },
    ],
  },
  {
    id: 'polls',
    title: '11. Polls',
    icon: '📊',
    tasks: [
      { id: 'polls-list', label: 'Polls page shows active polls', route: '/polls', priority: 'high' },
      { id: 'polls-vote', label: 'You can click to vote on a poll', route: '/polls' },
      { id: 'polls-results', label: 'Results update immediately after you vote', route: '/polls/[id]/results' },
      { id: 'polls-hidden', label: 'Some polls hide results until you\'ve voted', route: '/polls' },
      { id: 'polls-timer', label: 'Active polls show a countdown timer', route: '/polls' },
      { id: 'polls-closed', label: 'Expired polls show results but won\'t let you vote', route: '/polls' },
      { id: 'polls-embed', label: 'Embedded poll view works when shared on other sites', route: '/polls/embed/[id]' },
      { id: 'polls-create', label: 'You can create a new poll (when logged in)', route: '/polls/new' },
      { id: 'polls-edit', label: 'You can edit an existing poll (when logged in)', route: '/polls/[id]/edit' },
      { id: 'polls-mobile', label: 'Voting works smoothly on a phone', route: '/polls' },
    ],
  },
  {
    id: 'studio',
    title: '12. Studio (Creator Tools)',
    icon: '🎬',
    tasks: [
      { id: 'studio-dash', label: 'Studio dashboard loads', route: '/studio', priority: 'high' },
      { id: 'studio-auth', label: 'Must be logged in to access Studio', route: '/studio' },
      { id: 'studio-posts', label: 'List of your posts loads', route: '/studio/posts' },
      { id: 'studio-new-post', label: 'You can create a new post with content blocks', route: '/studio/posts/new', priority: 'high' },
      { id: 'studio-draft', label: 'You can save a draft without publishing it', route: '/studio/posts/new' },
      { id: 'studio-publish', label: 'Published post appears on the main site', route: '/studio/posts/new' },
      { id: 'studio-edit', label: 'You can edit an existing post', route: '/studio/posts/[id]/edit' },
      { id: 'studio-preview', label: 'Preview shows how the post will look when published', route: '/studio/posts/new' },
      { id: 'studio-seo', label: 'SEO title and description fields save correctly', route: '/studio/posts/new' },
      { id: 'studio-charts', label: 'Charts page loads', route: '/studio/charts' },
      { id: 'studio-chart-new', label: 'You can create a new chart', route: '/studio/charts/new' },
      { id: 'studio-polls', label: 'Polls management page loads', route: '/studio/polls' },
      { id: 'studio-media', label: 'Media library shows uploaded images', route: '/studio/media' },
      { id: 'studio-media-upload', label: 'You can upload new images', route: '/studio/media' },
    ],
  },
  {
    id: 'auth',
    title: '13. Authentication',
    icon: '🔐',
    tasks: [
      { id: 'auth-signup-email', label: 'You can sign up with email and password', route: '/signup', priority: 'critical' },
      { id: 'auth-signup-google', label: 'You can sign up with Google', route: '/signup' },
      { id: 'auth-signup-github', label: 'You can sign up with GitHub', route: '/signup' },
      { id: 'auth-signup-x', label: 'You can sign up with X (Twitter)', route: '/signup' },
      { id: 'auth-login-email', label: 'You can log in with email and password', route: '/login', priority: 'critical' },
      { id: 'auth-login-oauth', label: 'You can log in with Google/GitHub/X', route: '/login' },
      { id: 'auth-session', label: 'You stay logged in after refreshing the page', route: '/', priority: 'critical' },
      { id: 'auth-logout', label: 'Clicking logout signs you out completely', route: '/' },
      { id: 'auth-forgot', label: '"Forgot password" sends a reset email', route: '/forgot-password' },
      { id: 'auth-reset', label: 'Password reset link works and lets you set a new password', route: '/reset-password' },
      { id: 'auth-callback', label: 'After signing in with Google/X, you get redirected back to the site', route: '/api/auth/callback' },
      { id: 'auth-no-multi-client', label: 'No error warnings appear in the browser console on any page', route: '/', priority: 'critical' },
      { id: 'auth-mobile', label: 'Login and signup forms work well on a phone', route: '/login' },
    ],
  },
  {
    id: 'profile',
    title: '14. User Profile & Settings',
    icon: '👤',
    tasks: [
      { id: 'profile-load', label: 'Profile page loads', route: '/profile', priority: 'high' },
      { id: 'profile-name', label: 'You can change your display name', route: '/profile' },
      { id: 'profile-avatar', label: 'You can upload a profile picture and it shows up', route: '/profile' },
      { id: 'profile-team', label: 'Picking a favorite team saves correctly', route: '/profile' },
      { id: 'profile-prefs', label: 'Your preferences are still there after logging out and back in', route: '/profile' },
      { id: 'profile-notifs', label: 'Notification on/off toggles work', route: '/profile' },
      { id: 'profile-sub', label: 'Subscription status (free or premium) shows correctly', route: '/profile' },
      { id: 'profile-activity', label: 'Activity history shows your past trades, drafts, and votes', route: '/profile' },
      { id: 'notifs-page', label: 'Notifications page loads', route: '/notifications' },
      { id: 'notifs-read', label: 'You can mark notifications as read', route: '/notifications' },
    ],
  },
  {
    id: 'subscription',
    title: '15. Subscription & Pricing',
    icon: '💳',
    tasks: [
      { id: 'pricing-page', label: 'Pricing page loads and shows subscription plans', route: '/pricing', priority: 'critical' },
      { id: 'pricing-compare', label: 'Feature comparison table is visible (what you get with each plan)', route: '/pricing' },
      { id: 'pricing-checkout', label: 'Clicking a plan\'s button opens the payment form', route: '/pricing', priority: 'critical' },
      { id: 'pricing-stripe', label: 'Payment form appears where you can enter card info', route: '/pricing' },
      { id: 'pricing-success', label: 'After paying, you see a success/confirmation page', route: '/subscription/success' },
      { id: 'pricing-status', label: 'Your profile shows the correct subscription level after paying', route: '/profile' },
      { id: 'pricing-gates', label: 'Premium features are locked for free users (e.g. some Scout AI features)', route: '/scout-ai', priority: 'critical' },
      { id: 'pricing-cancel', label: 'You can cancel your subscription from your profile', route: '/profile' },
      { id: 'pricing-webhook', label: 'Subscription changes (new, canceled) update automatically', priority: 'high' },
    ],
  },
  {
    id: 'admin',
    title: '16. Admin — Dashboard & Posts',
    icon: '⚙️',
    tasks: [
      { id: 'admin-auth', label: 'Admin area requires login — redirects you if not signed in', route: '/admin', priority: 'critical' },
      { id: 'admin-dash', label: 'Dashboard shows overview stats (total posts, views, writers)', route: '/admin', priority: 'critical' },
      { id: 'admin-views-chart', label: 'Views chart shows the last 7 days of traffic', route: '/admin' },
      { id: 'admin-recent', label: 'Recent posts section shows the 5 newest articles', route: '/admin' },
      { id: 'admin-posts-list', label: 'Posts list loads and you can filter, sort, and search', route: '/admin/posts', priority: 'critical' },
      { id: 'admin-post-create', label: 'You can create a new post using the block editor', route: '/admin/posts/new', priority: 'critical' },
      { id: 'admin-post-blocks', label: 'You can add different block types (text, heading, image, chart, poll)', route: '/admin/posts/new' },
      { id: 'admin-post-html', label: 'Text formatting (bold, italic, links) displays correctly in the editor', route: '/admin/posts/new' },
      { id: 'admin-post-image', label: 'You can upload a featured image and it shows up', route: '/admin/posts/new' },
      { id: 'admin-post-category', label: 'You can select a category for the post', route: '/admin/posts/new' },
      { id: 'admin-post-tags', label: 'Tags save and reload correctly', route: '/admin/posts/new' },
      { id: 'admin-post-publish', label: 'Publishing a post makes it appear on the main site', route: '/admin/posts/new', priority: 'critical' },
      { id: 'admin-post-draft', label: 'Saving as draft keeps it unpublished', route: '/admin/posts/new' },
      { id: 'admin-post-schedule', label: 'Scheduling a post publishes it at the set time', route: '/admin/posts/new' },
      { id: 'admin-post-edit', label: 'You can edit an already-published post', route: '/admin/posts/[id]/edit' },
      { id: 'admin-post-delete', label: 'You can delete a post', route: '/admin/posts' },
      { id: 'admin-post-view', label: 'You can view post details in the admin panel', route: '/admin/posts/[id]' },
    ],
  },
  {
    id: 'admin-content',
    title: '17. Admin — Charts, Polls, Media',
    icon: '📊',
    tasks: [
      { id: 'admin-charts', label: 'Charts list loads', route: '/admin/charts' },
      { id: 'admin-chart-create', label: 'You can create a new chart by choosing a type and entering data', route: '/admin/charts/new' },
      { id: 'admin-chart-render', label: 'Chart preview shows what it will look like', route: '/admin/charts/new' },
      { id: 'admin-chart-edit', label: 'You can edit an existing chart', route: '/admin/charts/[id]/edit' },
      { id: 'admin-chart-delete', label: 'You can delete a chart', route: '/admin/charts' },
      { id: 'admin-polls', label: 'Polls list loads', route: '/admin/polls' },
      { id: 'admin-poll-create', label: 'You can create a poll with answer options', route: '/admin/polls' },
      { id: 'admin-poll-results', label: 'Poll results show vote counts', route: '/admin/polls/[id]' },
      { id: 'admin-poll-delete', label: 'You can delete a poll', route: '/admin/polls' },
      { id: 'admin-media', label: 'Media library shows all uploaded files', route: '/admin/media' },
      { id: 'admin-media-upload', label: 'You can upload new images', route: '/admin/media' },
      { id: 'admin-media-delete', label: 'You can delete uploaded files', route: '/admin/media' },
      { id: 'admin-media-search', label: 'Search and filter work in the media library', route: '/admin/media' },
    ],
  },
  {
    id: 'admin-users',
    title: '18. Admin — Users, Writers, Categories, Tags',
    icon: '👥',
    tasks: [
      { id: 'admin-users', label: 'Users list shows all registered users', route: '/admin/users', priority: 'high' },
      { id: 'admin-user-role', label: 'You can change a user\'s role (admin, writer, etc.)', route: '/admin/users' },
      { id: 'admin-user-password', label: 'You can reset a user\'s password', route: '/admin/users' },
      { id: 'admin-user-detail', label: 'Clicking a user opens their detail page', route: '/admin/users/[id]' },
      { id: 'admin-writers', label: 'Writers list loads with article counts', route: '/admin/writers' },
      { id: 'admin-categories', label: 'You can create, edit, and delete categories', route: '/admin/categories' },
      { id: 'admin-tags', label: 'You can create, edit, and delete tags', route: '/admin/tags' },
    ],
  },
  {
    id: 'admin-tools',
    title: '19. Admin — Settings, SEO, Analytics, Tools',
    icon: '🔧',
    tasks: [
      { id: 'admin-settings', label: 'Site settings save when you click Save', route: '/admin/settings' },
      { id: 'admin-seo', label: 'SEO audit tools page loads', route: '/admin/seo' },
      { id: 'admin-analytics', label: 'Analytics page shows traffic and author stats', route: '/admin/analytics' },
      { id: 'admin-subscriptions', label: 'Subscriptions list shows paid SM+ members', route: '/admin/subscriptions' },
      { id: 'admin-ads', label: 'Ad settings save', route: '/admin/ads' },
      { id: 'admin-freestar', label: 'Freestar ad revenue numbers display', route: '/admin/freestar' },
      { id: 'admin-ai-log', label: 'AI error log shows any Scout AI issues', route: '/admin/ai-logging' },
      { id: 'admin-pages', label: 'You can create, edit, and delete static pages', route: '/admin/pages' },
      { id: 'admin-page-edit', label: 'You can edit individual pages', route: '/admin/pages/[slug]' },
      { id: 'admin-postiq', label: 'PostIQ AI generates headline and SEO suggestions', route: '/admin/postiq' },
      { id: 'admin-feed-scoring', label: 'Feed scoring visibility toggles work', route: '/admin/feed-scoring' },
      { id: 'admin-gm-errors', label: 'GM error log shows trade simulator issues', route: '/admin/gm-errors' },
      { id: 'admin-leaderboard', label: 'Leaderboard settings page works', route: '/admin/leaderboard' },
      { id: 'admin-hub', label: 'Hub editor page works', route: '/admin/hub' },
      { id: 'admin-team-sync', label: 'Team pages sync button triggers a data refresh', route: '/admin/team-pages-sync' },
      { id: 'admin-exec', label: 'Executive dashboard shows key business metrics', route: '/admin/exec-dashboard' },
      { id: 'admin-notifs', label: 'You can compose and send notifications to users', route: '/admin/notifications' },
      { id: 'admin-notif-history', label: 'Past sent notifications show in history', route: '/admin/notifications' },
      { id: 'admin-user-gm', label: 'User GM scoring leaderboard loads', route: '/admin/user-gm-scoring' },
    ],
  },
  {
    id: 'audio-video',
    title: '20. Audio & Video',
    icon: '🎧',
    tasks: [
      { id: 'audio-page', label: 'Audio page loads', route: '/audio' },
      { id: 'audio-play', label: 'Audio files play when you press play', route: '/audio' },
      { id: 'audio-controls', label: 'Play, pause, and skip buttons work', route: '/audio' },
      { id: 'audio-speed', label: 'Speed control lets you change playback speed (0.75x, 1x, 1.5x)', route: '/audio' },
      { id: 'audio-advance', label: 'When one article finishes, the next one starts automatically', route: '/audio' },
      { id: 'audio-mini', label: 'Mini audio player stays visible as you browse other pages', route: '/' },
      { id: 'video-film-room', label: 'Bears Film Room page loads', route: '/bears-film-room' },
      { id: 'video-pi', label: 'Pinwheels & Ivy page loads', route: '/pinwheels-and-ivy' },
      { id: 'video-untold', label: 'Untold Chicago Stories page loads', route: '/untold-chicago-stories' },
      { id: 'video-southside', label: 'Southside Behavior page loads', route: '/southside-behavior' },
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
      { id: 'seo-sitemap', label: 'Sitemap page loads (for search engines)', route: '/sitemap.xml' },
      { id: 'seo-robots', label: 'Robots.txt page loads (for search engines)', route: '/robots.txt' },
      { id: 'seo-rss', label: 'RSS feed page loads', route: '/api/rss' },
      { id: 'seo-og', label: 'Sharing an article on social media shows a preview with title and image' },
      { id: 'seo-canonical', label: 'No duplicate page warnings in Google (advanced — skip if unsure)' },
      { id: 'seo-jsonld', label: 'Article pages include structured data (advanced — skip if unsure)' },
      { id: 'seo-authors', label: 'Authors listing page loads', route: '/authors' },
      { id: 'seo-author-detail', label: 'Individual author page loads with their articles', route: '/author/[id]' },
      { id: 'seo-tag', label: 'Tag pages load (e.g. clicking a tag shows related articles)', route: '/tag/[slug]' },
    ],
  },
  {
    id: 'search-nav',
    title: '22. Search & Navigation',
    icon: '🔍',
    tasks: [
      { id: 'search-page', label: 'Search page loads', route: '/search', priority: 'high' },
      { id: 'search-query', label: 'Searching for a topic returns matching articles', route: '/search' },
      { id: 'search-filter-team', label: 'You can filter search results by team', route: '/search' },
      { id: 'search-no-results', label: 'Searching for gibberish shows a "no results" message', route: '/search' },
      { id: 'search-links', label: 'Clicking a search result takes you to the right page', route: '/search' },
      { id: 'nav-logo', label: 'Clicking the site logo takes you to the homepage', route: '/' },
      { id: 'nav-links', label: 'Top menu links work (Teams, Scout, GM, Chat, Pricing)', route: '/' },
      { id: 'nav-auth-status', label: 'Header shows Login button (or your name if logged in)', route: '/' },
      { id: 'nav-mobile-menu', label: 'On phone: hamburger menu opens and all links work', route: '/' },
      { id: 'nav-footer', label: 'Footer links work (About, Contact, Privacy, Terms)', route: '/' },
      { id: 'nav-social', label: 'Social media icons in the footer link to the right accounts', route: '/' },
      { id: 'nav-sidebar', label: 'Sidebar on the right side displays correctly', route: '/' },
      { id: 'nav-bottom-mobile', label: 'On phone: bottom navigation bar works', route: '/' },
      { id: 'nav-live-strip', label: 'Live game scores strip appears at the top when games are on', route: '/' },
    ],
  },
  {
    id: 'mobile',
    title: '23. Mobile & Responsive',
    icon: '📱',
    tasks: [
      { id: 'mob-feed', label: 'On phone: articles stack in a single column (not side by side)', route: '/', priority: 'critical' },
      { id: 'mob-hero', label: 'On phone: the opening section fills the entire screen', route: '/' },
      { id: 'mob-roster', label: 'On phone: roster table scrolls sideways if it\'s too wide', route: '/chicago-bears/roster' },
      { id: 'mob-player', label: 'On phone: player pages are readable — nothing cut off', route: '/chicago-bears/players/[slug]' },
      { id: 'mob-forms', label: 'On phone: login, signup, and contact forms are easy to use', route: '/login' },
      { id: 'mob-gm', label: 'On phone: GM trade board is usable', route: '/gm' },
      { id: 'mob-audio', label: 'On phone: audio player works', route: '/audio' },
      { id: 'mob-admin', label: 'On tablet: admin pages are usable', route: '/admin' },
      { id: 'mob-tap-targets', label: 'On phone: all buttons and links are big enough to tap easily', route: '/' },
      { id: 'mob-no-h-scroll', label: 'On phone: no pages scroll sideways unexpectedly', route: '/' },
      { id: 'mob-images', label: 'Images load quickly and don\'t cause the page to jump around', route: '/' },
      { id: 'mob-cls', label: 'Page content doesn\'t shift or jump as it loads', route: '/' },
      { id: 'mob-keyboard', label: 'You can tab through form fields using a keyboard', route: '/' },
    ],
  },
  {
    id: 'performance',
    title: '24. Performance & Security',
    icon: '⚡',
    tasks: [
      { id: 'perf-lighthouse', label: 'Homepage loads fast (under 3 seconds on a normal connection)', route: '/', priority: 'critical' },
      { id: 'perf-api-feed', label: 'Feed articles load quickly (not stuck on a spinner)', priority: 'high' },
      { id: 'perf-api-live', label: 'Live scores load quickly', priority: 'high' },
      { id: 'perf-images', label: 'Images look sharp and load quickly (not blurry or slow)', route: '/' },
      { id: 'perf-no-console-errors', label: 'No red error messages in the browser console (press F12 to check)', route: '/', priority: 'critical' },
      { id: 'perf-no-gotrue', label: 'No yellow warning messages about "GoTrueClient" in the console', route: '/', priority: 'critical' },
      { id: 'perf-ssl', label: 'The site shows a lock icon in the browser address bar (secure connection)', priority: 'critical' },
      { id: 'perf-404', label: 'Visiting a fake URL shows a "page not found" message', route: '/nonexistent-page' },
      { id: 'perf-cron-sync', label: 'Team data refreshes automatically (check if stats are recent)', priority: 'high' },
      { id: 'perf-cron-health', label: 'Team pages health check runs (advanced — skip if unsure)', priority: 'high' },
      { id: 'perf-cron-scout', label: 'Old Scout AI history gets cleaned up (advanced — skip if unsure)', priority: 'medium' },
      { id: 'perf-admin-auth', label: 'Admin pages can\'t be accessed without logging in', priority: 'critical' },
      { id: 'perf-rate-limit', label: 'Spamming buttons eventually shows a "slow down" message', priority: 'high' },
      { id: 'perf-xss', label: 'Typing code/scripts into forms doesn\'t break the site', priority: 'critical' },
    ],
  },
  {
    id: 'launch',
    title: '25. Deployment & Launch Readiness',
    icon: '🚀',
    tasks: [
      { id: 'launch-prod', label: 'All major pages on test.sportsmockery.com work without errors', priority: 'critical' },
      { id: 'launch-sitemap', label: 'Sitemap page loads at /sitemap.xml', priority: 'high' },
      { id: 'launch-robots', label: 'Robots.txt page loads at /robots.txt', priority: 'high' },
      { id: 'launch-stripe', label: 'Payment system is connected and ready for real charges', priority: 'critical' },
      { id: 'launch-email', label: 'Emails actually send (password reset, notifications)', priority: 'high' },
      { id: 'launch-datalab', label: 'Team data is loading reliably (stats, schedules, rosters)', priority: 'critical' },
      { id: 'launch-data-fresh', label: 'Team data looks current — not weeks or months old', priority: 'high' },
      { id: 'launch-no-test-data', label: 'No fake/placeholder data visible on the live site', priority: 'critical' },
      { id: 'launch-roles', label: 'User roles work correctly (admins can access admin, regular users cannot)', priority: 'high' },
      { id: 'launch-backups', label: 'Database backups are set up (advanced — ask Chris)', priority: 'critical' },
      { id: 'launch-error-logging', label: 'Errors are being tracked and logged (advanced — ask Chris)', priority: 'high' },
      { id: 'launch-analytics', label: 'Site analytics/tracking is active', priority: 'medium' },
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
