// =============================================================================
// DEV-ONLY MOCK — Static fixture for offline frontend development
// =============================================================================
// This file is ONLY imported when:
//   1. DASHBOARD_USE_MOCK=true, or
//   2. DataLab Supabase is unreachable
//
// It produces a contract-compliant DashboardIntelligenceResponse so the
// frontend components can render without a live backend.
//
// DELETE this file once the dashboard_intelligence_snapshot table is
// reliably populated and you no longer need local-only development.
// =============================================================================

import type { DashboardIntelligenceResponse } from '@/components/dashboard/types'

export function buildDevMock(): DashboardIntelligenceResponse {
  const now = new Date()
  const timestamp = now.toISOString()
  const centralTime = now.toLocaleString('en-US', {
    timeZone: 'America/Chicago',
    month: 'short', day: 'numeric', year: 'numeric',
    hour: 'numeric', minute: '2-digit', hour12: true,
  }) + ' CT'

  return {
    meta: {
      timestamp,
      timestamp_central: centralTime,
      refresh_interval: 300,
      version: '1.0.0',
      schema_version: '1',
      data_freshness: {
        scores: new Date(now.getTime() - 15000).toISOString(),
        injuries: new Date(now.getTime() - 7200000).toISOString(),
        standings: new Date(now.getTime() - 3600000).toISOString(),
        player_stats: new Date(now.getTime() - 14400000).toISOString(),
        advanced_metrics: new Date(now.getTime() - 21600000).toISOString(),
      },
      request_id: `req_mock_${Date.now().toString(36)}`,
      cache_hit: false,
      live_mode: false,
    },

    city: {
      record: { wins: 49, losses: 50, win_pct: 0.495 },
      teams_active: 4,
      teams_above_500: 1,
      mood: {
        label: 'Mixed Signals',
        emoji: '\ud83d\ude10',
        score: 42,
        direction: 'flat',
      },
      summary: 'The Bulls are fighting for a play-in spot while the Blackhawks continue to build around young talent. Spring training is underway for both MLB clubs, with the Cubs looking to build on last year\'s playoff push.',
      hottest_team: 'chi_bulls',
      coldest_team: 'chi_blackhawks',
      biggest_change: 'chi_bulls',
      next_event: {
        team: 'chi_bulls',
        team_name: 'Bulls',
        opponent: 'Cleveland Cavaliers',
        datetime: new Date(now.getTime() + 86400000).toISOString(),
        datetime_display: 'Tomorrow, 7:00 PM CT',
        venue: 'United Center',
        home: true,
        importance_score: 78,
      },
    },

    teams: [
      {
        team_key: 'chi_bears',
        team_name: 'Chicago Bears',
        sport: 'NFL',
        league: 'NFL',
        logo_url: '/team-logos/bears.svg',
        color_primary: '#0B162A',
        color_secondary: '#C83200',
        season: '2025',
        in_season: false,
        record: {
          wins: 11, losses: 6, otl: null,
          win_pct: 0.647, games_played: 17, games_remaining: 0,
          record_display: '11-6',
        },
        recent: {
          last_5: '3-2', last_10: '6-4',
          streak: { type: 'W', count: 1, display: 'W1' },
          trend_direction: 'flat', trend_magnitude: 'mild',
        },
        status: {
          phase: 'offseason',
          is_live: false,
          next_game: {
            game_id: 'nfl_2026_bears_wk1',
            opponent: 'TBD',
            opponent_key: 'tbd',
            datetime: '2026-09-10T17:00:00Z',
            datetime_display: 'Sep 2026',
            home: true,
            venue: 'Soldier Field',
            importance_score: 0,
            importance_label: 'Offseason',
          },
        },
        performance: {
          offense: { rating: 4.2, rating_display: '4.2', rank: 14, rank_display: '14th', trend: 'flat', trend_delta: 0 },
          defense: { rating: -2.8, rating_display: '-2.8', rank: 8, rank_display: '8th', trend: 'flat', trend_delta: 0 },
        },
        intelligence: {
          momentum_score: 45, pressure_index: 38, collapse_risk: 12,
          availability_score: 95, consistency_score: 62,
          intelligence_tier: 'yellow',
        },
        health: {
          injuries_total: 0, key_players_out: [], key_players_questionable: [],
          availability_tier: 'healthy', availability_label: 'Full Roster',
        },
        insight: {
          headline: 'Bears Eye Draft Capital After Playoff Push',
          summary: 'Chicago finished 11-6 and made the playoffs for the first time in years. Free agency and the 2026 NFL Draft are the focus as the team builds around Caleb Williams.',
        },
        units: {
          offense: { label: 'Passing Attack', rating: 4.2, rank: 14, trend: 'flat', key_contributors: ['Caleb Williams', 'Rome Odunze'] },
          defense: { label: 'Pass Rush', rating: -2.8, rank: 8, trend: 'flat', key_contributors: ['Montez Sweat', 'Gervon Dexter'] },
        },
        leaders: {
          top_performers: [
            { player_id: 'caleb_williams_chi', name: 'Caleb Williams', position: 'QB', stat_line: '3,841 YDS / 27 TD', trend: 'up', performance_score: 76 },
          ],
          struggling_players: [],
        },
      },
      {
        team_key: 'chi_bulls',
        team_name: 'Chicago Bulls',
        sport: 'NBA',
        league: 'NBA',
        logo_url: '/team-logos/bulls.svg',
        color_primary: '#CE1141',
        color_secondary: '#000000',
        season: '2025-26',
        in_season: true,
        record: {
          wins: 28, losses: 27, otl: null,
          win_pct: 0.509, games_played: 55, games_remaining: 27,
          record_display: '28-27',
        },
        recent: {
          last_5: '3-2', last_10: '6-4',
          streak: { type: 'W', count: 2, display: 'W2' },
          trend_direction: 'up', trend_magnitude: 'moderate',
        },
        status: {
          phase: 'regular_season',
          is_live: false,
          next_game: {
            game_id: 'nba_2026_chi_vs_cle_0319',
            opponent: 'Cleveland Cavaliers',
            opponent_key: 'cle_cavaliers',
            datetime: new Date(now.getTime() + 86400000).toISOString(),
            datetime_display: 'Tomorrow, 7:00 PM CT',
            home: true,
            venue: 'United Center',
            importance_score: 78,
            importance_label: 'High',
          },
        },
        performance: {
          offense: { rating: 112.8, rating_display: '112.8', rank: 14, rank_display: '14th', trend: 'up', trend_delta: 1.9 },
          defense: { rating: 113.1, rating_display: '113.1', rank: 18, rank_display: '18th', trend: 'flat', trend_delta: -0.2 },
        },
        intelligence: {
          momentum_score: 62, pressure_index: 58, collapse_risk: 34,
          availability_score: 79, consistency_score: 48,
          intelligence_tier: 'yellow',
        },
        health: {
          injuries_total: 3,
          key_players_out: ['Lonzo Ball'],
          key_players_questionable: ['Zach LaVine'],
          availability_tier: 'caution',
          availability_label: '1 Key Player Out',
        },
        insight: {
          headline: 'Bulls Clinging to Play-In Spot',
          summary: 'At 28-27, Chicago sits 9th in the East and needs to hold serve down the stretch. Coby White has elevated his play, but inconsistency on defense remains the Achilles heel.',
        },
        units: {
          offense: { label: 'Halfcourt Scoring', rating: 112.8, rank: 14, trend: 'up', key_contributors: ['Coby White', 'Zach LaVine'] },
          defense: { label: 'Perimeter Defense', rating: 113.1, rank: 18, trend: 'flat', key_contributors: ['Ayo Dosunmu', 'Patrick Williams'] },
        },
        leaders: {
          top_performers: [
            { player_id: 'coby_white_chi', name: 'Coby White', position: 'PG', stat_line: '21.4 PPG / 5.8 APG', trend: 'up', performance_score: 74 },
            { player_id: 'nikola_vucevic_chi', name: 'Nikola Vucevic', position: 'C', stat_line: '17.2 PPG / 10.1 RPG', trend: 'flat', performance_score: 65 },
          ],
          struggling_players: [
            { player_id: 'patrick_williams_chi', name: 'Patrick Williams', position: 'PF', stat_line: '9.8 PPG / 4.2 RPG', trend: 'down', performance_score: 38, note: 'Inconsistent shooting stretch' },
          ],
        },
      },
      {
        team_key: 'chi_blackhawks',
        team_name: 'Chicago Blackhawks',
        sport: 'NHL',
        league: 'NHL',
        logo_url: '/team-logos/blackhawks.svg',
        color_primary: '#CF0A2C',
        color_secondary: '#000000',
        season: '2025-26',
        in_season: true,
        record: {
          wins: 25, losses: 30, otl: 9,
          win_pct: 0.461, games_played: 64, games_remaining: 18,
          record_display: '25-30-9',
        },
        recent: {
          last_5: '2-3', last_10: '4-5-1',
          streak: { type: 'L', count: 2, display: 'L2' },
          trend_direction: 'down', trend_magnitude: 'moderate',
        },
        status: {
          phase: 'regular_season',
          is_live: false,
          next_game: {
            game_id: 'nhl_2026_chi_vs_stl_0320',
            opponent: 'St. Louis Blues',
            opponent_key: 'stl_blues',
            datetime: new Date(now.getTime() + 172800000).toISOString(),
            datetime_display: 'Thu, 7:30 PM CT',
            home: false,
            venue: 'Enterprise Center',
            importance_score: 52,
            importance_label: 'Standard',
          },
        },
        performance: {
          offense: { rating: 48.2, rating_display: '48.2%', rank: 22, rank_display: '22nd', trend: 'down', trend_delta: -1.4 },
          defense: { rating: 51.8, rating_display: '51.8%', rank: 20, rank_display: '20th', trend: 'flat', trend_delta: 0.3 },
        },
        intelligence: {
          momentum_score: 31, pressure_index: 22, collapse_risk: 28,
          availability_score: 85, consistency_score: 39,
          intelligence_tier: 'yellow',
        },
        health: {
          injuries_total: 2,
          key_players_out: [],
          key_players_questionable: ['Taylor Hall'],
          availability_tier: 'caution',
          availability_label: '1 Questionable',
        },
        insight: {
          headline: 'Bedard Shines in Rebuild Year',
          summary: 'The Blackhawks are out of playoff contention but Connor Bedard continues to develop. The focus shifts to draft lottery positioning and developing the young core.',
        },
        units: {
          offense: { label: 'Power Play', rating: 22.1, rank: 16, trend: 'down', key_contributors: ['Connor Bedard', 'Tyler Bertuzzi'] },
          defense: { label: 'Penalty Kill', rating: 78.4, rank: 21, trend: 'flat', key_contributors: ['Seth Jones', 'Connor Murphy'] },
        },
        leaders: {
          top_performers: [
            { player_id: 'connor_bedard_chi', name: 'Connor Bedard', position: 'C', stat_line: '24G / 38A / 62P', trend: 'up', performance_score: 82 },
          ],
          struggling_players: [
            { player_id: 'taylor_hall_chi', name: 'Taylor Hall', position: 'LW', stat_line: '8G / 14A / 22P', trend: 'down', performance_score: 29, note: 'Questionable — lower body' },
          ],
        },
      },
      {
        team_key: 'chi_cubs',
        team_name: 'Chicago Cubs',
        sport: 'MLB',
        league: 'MLB',
        logo_url: '/team-logos/cubs.svg',
        color_primary: '#0E3386',
        color_secondary: '#CC3433',
        season: '2026',
        in_season: true,
        record: {
          wins: 12, losses: 8, otl: null,
          win_pct: 0.600, games_played: 20, games_remaining: 0,
          record_display: '12-8',
        },
        recent: {
          last_5: '4-1', last_10: '7-3',
          streak: { type: 'W', count: 3, display: 'W3' },
          trend_direction: 'up', trend_magnitude: 'moderate',
        },
        status: {
          phase: 'preseason',
          is_live: false,
          next_game: {
            game_id: 'mlb_2026_st_chi_vs_sf_0319',
            opponent: 'San Francisco Giants',
            opponent_key: 'sf_giants',
            datetime: new Date(now.getTime() + 43200000).toISOString(),
            datetime_display: 'Tomorrow, 3:05 PM CT',
            home: true,
            venue: 'Sloan Park',
            importance_score: 15,
            importance_label: 'Spring Training',
          },
        },
        performance: {
          offense: { rating: 108, rating_display: '108', rank: 0, rank_display: 'N/A', trend: 'flat', trend_delta: 0 },
          defense: { rating: 3.42, rating_display: '3.42', rank: 0, rank_display: 'N/A', trend: 'flat', trend_delta: 0 },
        },
        intelligence: {
          momentum_score: 55, pressure_index: 42, collapse_risk: 15,
          availability_score: 92, consistency_score: 60,
          intelligence_tier: 'green',
        },
        health: {
          injuries_total: 1,
          key_players_out: [],
          key_players_questionable: [],
          availability_tier: 'healthy',
          availability_label: 'Mostly Healthy',
        },
        insight: {
          headline: 'Cubs Spring Training Looks Promising',
          summary: 'After a 92-70 season and a Wild Card exit, the Cubs have bolstered the rotation and look sharp in camp. Expectations are high for a deep October run in 2026.',
        },
        units: {
          offense: { label: 'Lineup Power', rating: 108, rank: 0, trend: 'flat', key_contributors: ['Ian Happ', 'Seiya Suzuki'] },
          defense: { label: 'Starting Rotation', rating: 3.42, rank: 0, trend: 'flat', key_contributors: ['Shota Imanaga', 'Justin Steele'] },
        },
        leaders: {
          top_performers: [
            { player_id: 'ian_happ_chi', name: 'Ian Happ', position: 'LF', stat_line: '.342 AVG / 3 HR (ST)', trend: 'up', performance_score: 70 },
          ],
          struggling_players: [],
        },
      },
      {
        team_key: 'chi_whitesox',
        team_name: 'Chicago White Sox',
        sport: 'MLB',
        league: 'MLB',
        logo_url: '/team-logos/whitesox.svg',
        color_primary: '#27251F',
        color_secondary: '#C4CED4',
        season: '2026',
        in_season: true,
        record: {
          wins: 7, losses: 14, otl: null,
          win_pct: 0.333, games_played: 21, games_remaining: 0,
          record_display: '7-14',
        },
        recent: {
          last_5: '1-4', last_10: '3-7',
          streak: { type: 'L', count: 4, display: 'L4' },
          trend_direction: 'down', trend_magnitude: 'strong',
        },
        status: {
          phase: 'preseason',
          is_live: false,
          next_game: {
            game_id: 'mlb_2026_st_cws_vs_ari_0319',
            opponent: 'Arizona Diamondbacks',
            opponent_key: 'ari_diamondbacks',
            datetime: new Date(now.getTime() + 50400000).toISOString(),
            datetime_display: 'Tomorrow, 3:10 PM CT',
            home: false,
            venue: 'Salt River Fields',
            importance_score: 8,
            importance_label: 'Spring Training',
          },
        },
        performance: {
          offense: { rating: 82, rating_display: '82', rank: 0, rank_display: 'N/A', trend: 'down', trend_delta: -5.2 },
          defense: { rating: 5.91, rating_display: '5.91', rank: 0, rank_display: 'N/A', trend: 'down', trend_delta: 1.4 },
        },
        intelligence: {
          momentum_score: 18, pressure_index: 15, collapse_risk: 42,
          availability_score: 88, consistency_score: 28,
          intelligence_tier: 'red',
        },
        health: {
          injuries_total: 2,
          key_players_out: [],
          key_players_questionable: ['Garrett Crochet'],
          availability_tier: 'caution',
          availability_label: '1 Questionable',
        },
        insight: {
          headline: 'White Sox Rebuild Continues with Low Expectations',
          summary: 'Coming off a 60-102 season, the White Sox are deep in a rebuild. Spring training results are poor but player development is the real focus for 2026.',
        },
        units: {
          offense: { label: 'Run Production', rating: 82, rank: 0, trend: 'down', key_contributors: ['Andrew Vaughn', 'Colson Montgomery'] },
          defense: { label: 'Starting Rotation', rating: 5.91, rank: 0, trend: 'down', key_contributors: ['Garrett Crochet', 'Davis Martin'] },
        },
        leaders: {
          top_performers: [
            { player_id: 'colson_montgomery_chi', name: 'Colson Montgomery', position: 'SS', stat_line: '.298 AVG / 2 HR (ST)', trend: 'up', performance_score: 58 },
          ],
          struggling_players: [
            { player_id: 'andrew_vaughn_chi', name: 'Andrew Vaughn', position: '1B', stat_line: '.185 AVG / 0 HR (ST)', trend: 'down', performance_score: 22 },
          ],
        },
      },
    ],

    live: {
      is_active: false,
      game_count: 0,
      games: [],
    },

    trends: {
      risers: [
        {
          team: 'chi_bulls', team_name: 'Chicago Bulls',
          metric: 'momentum_score', metric_label: 'Momentum',
          previous_value: 48, current_value: 62,
          change_value: 14, change_pct: 29.2, period: '7d',
          summary: 'Bulls have won 5 of their last 7 and are back in play-in contention.',
        },
        {
          team: 'chi_cubs', team_name: 'Chicago Cubs',
          metric: 'consistency_score', metric_label: 'Consistency',
          previous_value: 45, current_value: 60,
          change_value: 15, change_pct: 33.3, period: '7d',
          summary: 'Cubs pitching has been sharp throughout spring training, building optimism.',
        },
      ],
      fallers: [
        {
          team: 'chi_blackhawks', team_name: 'Chicago Blackhawks',
          metric: 'momentum_score', metric_label: 'Momentum',
          previous_value: 44, current_value: 31,
          change_value: -13, change_pct: -29.5, period: '7d',
          summary: 'Blackhawks have dropped 4 of their last 6 as the season winds down.',
        },
        {
          team: 'chi_whitesox', team_name: 'Chicago White Sox',
          metric: 'consistency_score', metric_label: 'Consistency',
          previous_value: 41, current_value: 28,
          change_value: -13, change_pct: -31.7, period: '7d',
          summary: 'White Sox spring training has been wildly inconsistent with blowout losses mixed in.',
        },
      ],
      streaks: [
        {
          team: 'chi_cubs', team_name: 'Chicago Cubs',
          metric: 'win_streak', metric_label: 'Win Streak',
          streak_value: 3, streak_type: 'W',
          summary: 'Cubs on a 3-game spring training win streak.',
        },
        {
          team: 'chi_whitesox', team_name: 'Chicago White Sox',
          metric: 'loss_streak', metric_label: 'Loss Streak',
          streak_value: 4, streak_type: 'L',
          summary: 'White Sox have lost 4 straight spring training games.',
        },
      ],
      injuries: [
        {
          team: 'chi_bulls', team_name: 'Chicago Bulls',
          player: 'Lonzo Ball', player_id: 'lonzo_ball_chi',
          status: 'out', impact: 'high',
          availability_score_delta: -12,
          summary: 'Lonzo Ball remains out for the season, limiting backcourt depth.',
        },
        {
          team: 'chi_blackhawks', team_name: 'Chicago Blackhawks',
          player: 'Taylor Hall', player_id: 'taylor_hall_chi',
          status: 'questionable', impact: 'medium',
          availability_score_delta: -6,
          summary: 'Taylor Hall questionable with lower-body injury. Day-to-day.',
        },
        {
          team: 'chi_bulls', team_name: 'Chicago Bulls',
          player: 'Zach LaVine', player_id: 'zach_lavine_chi',
          status: 'questionable', impact: 'high',
          availability_score_delta: -9,
          summary: 'LaVine questionable for tomorrow\'s matchup with Cleveland.',
        },
      ],
      volatility: [
        {
          team: 'chi_whitesox', team_name: 'Chicago White Sox',
          metric: 'consistency_score', metric_label: 'Consistency',
          volatility_score: 82,
          summary: 'White Sox results have been wildly unpredictable, even by spring training standards.',
        },
        {
          team: 'chi_bulls', team_name: 'Chicago Bulls',
          metric: 'consistency_score', metric_label: 'Consistency',
          volatility_score: 64,
          summary: 'Bulls alternate between dominant wins and head-scratching losses.',
        },
      ],
    },

    leaders: {
      players: {
        top: [
          {
            player_id: 'connor_bedard_chi', name: 'Connor Bedard',
            team: 'chi_blackhawks', team_name: 'Blackhawks', sport: 'NHL', position: 'C',
            headshot_url: '/players/bedard.jpg',
            primary_stat: '62 PTS',
            secondary_stats: ['24 G', '38 A', '+4'],
            performance_score: 82, trend: 'up',
            headline: 'Bedard emerging as franchise cornerstone',
          },
          {
            player_id: 'coby_white_chi', name: 'Coby White',
            team: 'chi_bulls', team_name: 'Bulls', sport: 'NBA', position: 'PG',
            headshot_url: '/players/coby_white.jpg',
            primary_stat: '21.4 PPG',
            secondary_stats: ['5.8 APG', '43.1 FG%'],
            performance_score: 74, trend: 'up',
            headline: 'White anchoring Bulls\' play-in push',
          },
          {
            player_id: 'caleb_williams_chi', name: 'Caleb Williams',
            team: 'chi_bears', team_name: 'Bears', sport: 'NFL', position: 'QB',
            headshot_url: '/players/caleb_williams.jpg',
            primary_stat: '3,841 YDS',
            secondary_stats: ['27 TD', '11 INT', '92.4 RTG'],
            performance_score: 76, trend: 'up',
            headline: 'Williams led Bears back to playoffs in Year 2',
          },
        ],
        struggling: [
          {
            player_id: 'andrew_vaughn_chi', name: 'Andrew Vaughn',
            team: 'chi_whitesox', team_name: 'White Sox', sport: 'MLB', position: '1B',
            headshot_url: '/players/vaughn.jpg',
            primary_stat: '.185 AVG',
            secondary_stats: ['0 HR', '3 RBI (ST)'],
            performance_score: 22, trend: 'down',
            headline: 'Vaughn struggling mightily in spring camp',
          },
          {
            player_id: 'patrick_williams_chi', name: 'Patrick Williams',
            team: 'chi_bulls', team_name: 'Bulls', sport: 'NBA', position: 'PF',
            headshot_url: '/players/p_williams.jpg',
            primary_stat: '9.8 PPG',
            secondary_stats: ['4.2 RPG', '39.1 FG%'],
            performance_score: 38, trend: 'down',
            headline: 'Williams\' inconsistency hurting Bulls depth',
          },
        ],
      },
      units: {
        best: [
          {
            team: 'chi_bears', team_name: 'Bears', sport: 'NFL',
            unit_label: 'Pass Rush',
            rating: -2.8, rank: 8, rank_display: '8th in NFL',
            trend: 'flat',
            summary: 'Bears defense finished as a top-10 unit in 2025, anchored by Montez Sweat.',
          },
          {
            team: 'chi_bulls', team_name: 'Bulls', sport: 'NBA',
            unit_label: 'Halfcourt Offense',
            rating: 112.8, rank: 14, rank_display: '14th in NBA',
            trend: 'up',
            summary: 'Bulls\' halfcourt scoring has improved with White\'s increased playmaking role.',
          },
        ],
        worst: [
          {
            team: 'chi_whitesox', team_name: 'White Sox', sport: 'MLB',
            unit_label: 'Starting Rotation',
            rating: 5.91, rank: 0, rank_display: 'N/A (ST)',
            trend: 'down',
            summary: 'White Sox starters have been hit hard in spring training with a 5.91 ERA.',
          },
          {
            team: 'chi_blackhawks', team_name: 'Blackhawks', sport: 'NHL',
            unit_label: 'Penalty Kill',
            rating: 78.4, rank: 21, rank_display: '21st in NHL',
            trend: 'flat',
            summary: 'Blackhawks PK unit continues to be a liability, allowing too many power play goals.',
          },
        ],
      },
    },
  }
}
