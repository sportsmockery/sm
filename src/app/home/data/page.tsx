'use client'

import { useState } from 'react'
import Link from 'next/link'

const TEAM_TABS = [
  { name: 'Bears', logo: 'https://a.espncdn.com/i/teamlogos/nfl/500/chi.png' },
  { name: 'Bulls', logo: 'https://a.espncdn.com/i/teamlogos/nba/500/chi.png' },
  { name: 'Cubs', logo: 'https://a.espncdn.com/i/teamlogos/mlb/500/chc.png' },
  { name: 'White Sox', logo: 'https://a.espncdn.com/i/teamlogos/mlb/500/chw.png' },
  { name: 'Blackhawks', logo: 'https://a.espncdn.com/i/teamlogos/nhl/500/chi.png' },
]

const TEAM_DATA: Record<string, {
  stats: { value: string; label: string }[];
  bars: { label: string; value: number; display: string }[];
  leaders: { name: string; stat: string; headshot: string }[];
  games: { vs: string; logo: string; score: string; date: string }[];
}> = {
  Bears: {
    stats: [
      { value: '11-6', label: 'Record' },
      { value: '378', label: 'Points Scored' },
      { value: '287', label: 'Points Allowed' },
      { value: '#4', label: 'NFC Rank' },
    ],
    bars: [
      { label: 'Passing', value: 72, display: '4,102 yds' },
      { label: 'Rushing', value: 58, display: '1,845 yds' },
      { label: 'Defense', value: 81, display: '287 PA' },
      { label: 'Turnovers', value: 65, display: '+12' },
    ],
    leaders: [
      { name: 'Caleb Williams', stat: '4,102 YDS | 29 TD', headshot: 'https://a.espncdn.com/i/headshots/nfl/players/full/4432577.png' },
      { name: 'D\'Andre Swift', stat: '1,036 YDS | 8 TD', headshot: 'https://a.espncdn.com/i/headshots/nfl/players/full/4035538.png' },
      { name: 'DJ Moore', stat: '1,198 YDS | 10 TD', headshot: 'https://a.espncdn.com/i/headshots/nfl/players/full/3116406.png' },
      { name: 'Montez Sweat', stat: '12.5 SACKS', headshot: 'https://a.espncdn.com/i/headshots/nfl/players/full/3128429.png' },
    ],
    games: [
      { vs: 'Packers', logo: 'https://a.espncdn.com/i/teamlogos/nfl/500/gb.png', score: 'W 24-17', date: 'Week 18' },
      { vs: 'Lions', logo: 'https://a.espncdn.com/i/teamlogos/nfl/500/det.png', score: 'L 20-27', date: 'Week 17' },
      { vs: 'Vikings', logo: 'https://a.espncdn.com/i/teamlogos/nfl/500/min.png', score: 'W 31-21', date: 'Week 16' },
    ],
  },
  Bulls: {
    stats: [
      { value: '23-22', label: 'Record' },
      { value: '108.4', label: 'PPG' },
      { value: '109.2', label: 'OPP PPG' },
      { value: '#7', label: 'East Rank' },
    ],
    bars: [
      { label: 'FG%', value: 47, display: '47.2%' },
      { label: '3PT%', value: 36, display: '36.1%' },
      { label: 'FT%', value: 79, display: '79.4%' },
      { label: 'Rebounds', value: 62, display: '44.8 RPG' },
    ],
    leaders: [
      { name: 'Zach LaVine', stat: '22.4 PPG | 4.8 APG', headshot: 'https://a.espncdn.com/i/headshots/nba/players/full/3064514.png' },
      { name: 'Nikola Vucevic', stat: '18.2 PPG | 10.4 RPG', headshot: 'https://a.espncdn.com/i/headshots/nba/players/full/2596210.png' },
      { name: 'Coby White', stat: '17.8 PPG | 5.1 APG', headshot: 'https://a.espncdn.com/i/headshots/nba/players/full/4395725.png' },
      { name: 'Patrick Williams', stat: '12.4 PPG | 4.8 RPG', headshot: 'https://a.espncdn.com/i/headshots/nba/players/full/4683634.png' },
    ],
    games: [
      { vs: 'Celtics', logo: 'https://a.espncdn.com/i/teamlogos/nba/500/bos.png', score: 'L 98-112', date: 'Jan 25' },
      { vs: 'Knicks', logo: 'https://a.espncdn.com/i/teamlogos/nba/500/ny.png', score: 'W 108-102', date: 'Jan 23' },
      { vs: 'Bucks', logo: 'https://a.espncdn.com/i/teamlogos/nba/500/mil.png', score: 'W 114-109', date: 'Jan 21' },
    ],
  },
  Cubs: {
    stats: [
      { value: '92-70', label: 'Record' },
      { value: '.264', label: 'Team AVG' },
      { value: '3.82', label: 'Team ERA' },
      { value: '#2', label: 'NL Central' },
    ],
    bars: [
      { label: 'Batting', value: 72, display: '.264 AVG' },
      { label: 'Pitching', value: 68, display: '3.82 ERA' },
      { label: 'Fielding', value: 75, display: '.984 PCT' },
      { label: 'Home Runs', value: 64, display: '198 HR' },
    ],
    leaders: [
      { name: 'Ian Happ', stat: '.278 AVG | 25 HR | 82 RBI', headshot: 'https://a.espncdn.com/i/headshots/mlb/players/full/33386.png' },
      { name: 'Nico Hoerner', stat: '.283 AVG | 12 HR | 58 RBI', headshot: 'https://a.espncdn.com/i/headshots/mlb/players/full/40598.png' },
      { name: 'Justin Steele', stat: '14-8 | 3.12 ERA', headshot: 'https://a.espncdn.com/i/headshots/mlb/players/full/41276.png' },
      { name: 'Seiya Suzuki', stat: '.271 AVG | 22 HR | 76 RBI', headshot: 'https://a.espncdn.com/i/headshots/mlb/players/full/42165.png' },
    ],
    games: [
      { vs: 'Cardinals', logo: 'https://a.espncdn.com/i/teamlogos/mlb/500/stl.png', score: 'W 5-3', date: 'Sep 29' },
      { vs: 'Brewers', logo: 'https://a.espncdn.com/i/teamlogos/mlb/500/mil.png', score: 'L 2-4', date: 'Sep 28' },
      { vs: 'Reds', logo: 'https://a.espncdn.com/i/teamlogos/mlb/500/cin.png', score: 'W 7-1', date: 'Sep 27' },
    ],
  },
  'White Sox': {
    stats: [
      { value: '60-102', label: 'Record' },
      { value: '.231', label: 'Team AVG' },
      { value: '4.78', label: 'Team ERA' },
      { value: '#5', label: 'AL Central' },
    ],
    bars: [
      { label: 'Batting', value: 38, display: '.231 AVG' },
      { label: 'Pitching', value: 32, display: '4.78 ERA' },
      { label: 'Fielding', value: 55, display: '.979 PCT' },
      { label: 'Home Runs', value: 42, display: '142 HR' },
    ],
    leaders: [
      { name: 'Luis Robert Jr.', stat: '.264 AVG | 18 HR | 56 RBI', headshot: 'https://a.espncdn.com/i/headshots/mlb/players/full/40623.png' },
      { name: 'Andrew Vaughn', stat: '.248 AVG | 14 HR | 52 RBI', headshot: 'https://a.espncdn.com/i/headshots/mlb/players/full/42406.png' },
      { name: 'Garrett Crochet', stat: '6-12 | 3.58 ERA', headshot: 'https://a.espncdn.com/i/headshots/mlb/players/full/42396.png' },
      { name: 'Eloy Jimenez', stat: '.242 AVG | 12 HR | 44 RBI', headshot: 'https://a.espncdn.com/i/headshots/mlb/players/full/32555.png' },
    ],
    games: [
      { vs: 'Tigers', logo: 'https://a.espncdn.com/i/teamlogos/mlb/500/det.png', score: 'L 1-5', date: 'Sep 29' },
      { vs: 'Twins', logo: 'https://a.espncdn.com/i/teamlogos/mlb/500/min.png', score: 'L 3-8', date: 'Sep 28' },
      { vs: 'Royals', logo: 'https://a.espncdn.com/i/teamlogos/mlb/500/kc.png', score: 'W 4-2', date: 'Sep 27' },
    ],
  },
  Blackhawks: {
    stats: [
      { value: '21-22-8', label: 'Record' },
      { value: '2.65', label: 'GPG' },
      { value: '3.12', label: 'GA/G' },
      { value: '#6', label: 'Central' },
    ],
    bars: [
      { label: 'Goals/G', value: 52, display: '2.65' },
      { label: 'PP%', value: 21, display: '21.2%' },
      { label: 'PK%', value: 78, display: '78.4%' },
      { label: 'Shots/G', value: 59, display: '30.8' },
    ],
    leaders: [
      { name: 'Connor Bedard', stat: '22 G | 38 A | 60 PTS', headshot: 'https://a.espncdn.com/i/headshots/nhl/players/full/5113261.png' },
      { name: 'Taylor Hall', stat: '14 G | 22 A | 36 PTS', headshot: 'https://a.espncdn.com/i/headshots/nhl/players/full/5474.png' },
      { name: 'Philipp Kurashev', stat: '12 G | 18 A | 30 PTS', headshot: 'https://a.espncdn.com/i/headshots/nhl/players/full/4565232.png' },
      { name: 'Seth Jones', stat: '8 G | 24 A | 32 PTS', headshot: 'https://a.espncdn.com/i/headshots/nhl/players/full/3904173.png' },
    ],
    games: [
      { vs: 'Red Wings', logo: 'https://a.espncdn.com/i/teamlogos/nhl/500/det.png', score: 'W 4-2', date: 'Jan 24' },
      { vs: 'Blues', logo: 'https://a.espncdn.com/i/teamlogos/nhl/500/stl.png', score: 'L 1-3', date: 'Jan 22' },
      { vs: 'Predators', logo: 'https://a.espncdn.com/i/teamlogos/nhl/500/nsh.png', score: 'W 5-3', date: 'Jan 20' },
    ],
  },
}

export default function DataPage() {
  const [activeTeam, setActiveTeam] = useState('Bears')
  const data = TEAM_DATA[activeTeam]

  return (
    <>
      {/* Hero */}
      <section className="hm-page-hero">
        <div className="hm-page-hero-bg" />
        <div className="hm-scan-line" />
        <div className="hm-hero-content hm-fade-in" style={{ position: 'relative', zIndex: 2 }}>
          <span className="hm-tag" style={{ marginBottom: 24 }}>Analytics</span>
          <h1><span className="hm-gradient-text">Data Cosmos</span></h1>
          <p>Interactive stats, animated charts, rosters, schedules, and box scores for all five Chicago teams — beautifully visualized.</p>
        </div>
      </section>

      {/* Content */}
      <div className="hm-container" style={{ paddingBottom: 120 }}>
        {/* Team Tabs */}
        <div className="hm-team-tabs">
          {TEAM_TABS.map((t) => (
            <button
              key={t.name}
              className={`hm-team-tab ${activeTeam === t.name ? 'hm-team-tab-active' : ''}`}
              onClick={() => setActiveTeam(t.name)}
            >
              <img src={t.logo} alt={t.name} width={20} height={20} style={{ borderRadius: '50%' }} />
              {t.name}
            </button>
          ))}
        </div>

        {/* Stat Cards */}
        <div className="hm-stat-cards">
          {data.stats.map((s) => (
            <div key={s.label} className="hm-stat-card">
              <div className="hm-stat-value">{s.value}</div>
              <div className="hm-stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className="hm-chart-row">
          <div className="hm-chart-card">
            <h3>Performance Breakdown</h3>
            <div className="hm-bar-chart">
              {data.bars.map((b) => (
                <div key={b.label} className="hm-bar-row">
                  <div className="hm-bar-label">{b.label}</div>
                  <div className="hm-bar-track">
                    <div className="hm-bar-fill" style={{ width: `${b.value}%` }} />
                  </div>
                  <div className="hm-bar-value">{b.display}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="hm-chart-card">
            <h3>Team Radar</h3>
            <div className="hm-radar-placeholder">
              <svg width="200" height="200" viewBox="0 0 200 200" style={{ opacity: 0.3 }}>
                <polygon points="100,20 180,80 160,170 40,170 20,80" fill="none" stroke="rgba(188,0,0,0.3)" strokeWidth="1" />
                <polygon points="100,40 160,80 145,155 55,155 40,80" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                <polygon points="100,60 140,85 130,140 70,140 60,85" fill="rgba(188,0,0,0.1)" stroke="#ff4444" strokeWidth="1.5" />
              </svg>
            </div>
          </div>
        </div>

        {/* Leaderboard */}
        <div className="hm-leaderboard">
          <h3>Player Leaders</h3>
          {data.leaders.map((p, i) => (
            <div key={p.name} className="hm-leaderboard-row">
              <span style={{ width: 24, fontSize: 14, fontWeight: 700, color: i === 0 ? '#ff4444' : '#55556a' }}>
                {i + 1}
              </span>
              <img src={p.headshot} alt={p.name} className="hm-player-headshot" width={40} height={40} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>{p.name}</div>
                <div style={{ fontSize: 12, color: '#8a8a9a' }}>{p.stat}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Schedule */}
        <div style={{ marginBottom: 48 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: '#fff', marginBottom: 20 }}>Recent Games</h3>
          <div className="hm-schedule-grid">
            {data.games.map((g) => (
              <div key={g.date} className="hm-game-card">
                <div className="hm-game-teams">
                  <img src={TEAM_TABS.find(t => t.name === activeTeam)!.logo} alt={activeTeam} width={28} height={28} />
                  <span className="hm-game-vs">vs</span>
                  <img src={g.logo} alt={g.vs} width={28} height={28} />
                </div>
                <div style={{ fontSize: 16, fontWeight: 700, color: g.score.startsWith('W') ? '#22c55e' : '#ff4444' }}>
                  {g.score}
                </div>
                <div style={{ fontSize: 12, color: '#55556a', marginTop: 4 }}>{g.date}</div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div style={{ textAlign: 'center' }}>
          <Link href="/datahub" className="hm-btn-primary">
            Explore Full Data Hub &rarr;
          </Link>
        </div>
      </div>
    </>
  )
}
