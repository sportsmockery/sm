'use client'

import { useState, useEffect } from 'react'
import { Montserrat } from 'next/font/google'

const montserrat = Montserrat({ subsets: ['latin'], weight: ['700'] })

// Chicago sports content creators by sport
const CHICAGO_CHANNELS_BY_SPORT: Record<string, ChannelInfo[]> = {
  nfl: [
    {
      id: 'chgo-bears',
      name: 'CHGO Bears',
      channelId: 'UCBnl8_rsGBNfaJJl8_8dz3A',
      description: 'Daily Bears analysis, breakdowns & discussion',
      url: 'https://www.youtube.com/@CHGOBears',
      color: '#0B162A',
    },
    {
      id: 'bears-barroom',
      name: 'Bears Barroom',
      channelId: 'UCaX5xKkJJrQGNF3-1G1pLJQ',
      description: 'Bears podcast with passionate fan perspective',
      url: 'https://www.youtube.com/@BearsBarroom',
      color: '#C83200',
    },
    {
      id: 'da-windy-city',
      name: 'Da Windy City',
      channelId: 'UC8_PEqXXDSPp_CyKhTdKKBw',
      description: 'Bears film breakdowns & insider analysis',
      url: 'https://www.youtube.com/@DaWindyCity',
      color: '#0B162A',
    },
    {
      id: 'under-center',
      name: 'Under Center',
      channelId: 'UCqhmhykAu1ai3qzpNxPKMdw',
      description: 'NBC Sports Chicago Bears coverage',
      url: 'https://www.youtube.com/@NBCSportsChicago',
      color: '#003DA5',
    },
  ],
  nba: [
    {
      id: 'chgo-bulls',
      name: 'CHGO Bulls',
      channelId: 'UC9GwFqxlWMW5sYoB5b2qFkw',
      description: 'Daily Bulls analysis & discussion',
      url: 'https://www.youtube.com/@CHGOBulls',
      color: '#CE1141',
    },
    {
      id: 'bulls-talk',
      name: 'Bulls Talk Podcast',
      channelId: 'UCqhmhykAu1ai3qzpNxPKMdw',
      description: 'NBC Sports Chicago Bulls coverage',
      url: 'https://www.youtube.com/@NBCSportsChicago',
      color: '#CE1141',
    },
    {
      id: 'locked-on-bulls',
      name: 'Locked On Bulls',
      channelId: 'UCHx2i3M5M5nqVsyh8YsXhug',
      description: 'Daily Bulls podcast & analysis',
      url: 'https://www.youtube.com/@LockedOnBulls',
      color: '#000000',
    },
  ],
  nhl: [
    {
      id: 'chgo-blackhawks',
      name: 'CHGO Blackhawks',
      channelId: 'UCVw2NU9U5MFXH8iN0qj5Q_A',
      description: 'Daily Blackhawks analysis & discussion',
      url: 'https://www.youtube.com/@CHGOBlackhawks',
      color: '#CF0A2C',
    },
    {
      id: 'committed-indians',
      name: 'Committed Indians',
      channelId: 'UCyf8VXvLQMxtQrxrxZZR_Qg',
      description: 'Blackhawks fan podcast & content',
      url: 'https://www.youtube.com/@committedindians',
      color: '#000000',
    },
    {
      id: 'blackhawks-talk',
      name: 'Blackhawks Talk',
      channelId: 'UCqhmhykAu1ai3qzpNxPKMdw',
      description: 'NBC Sports Chicago Blackhawks coverage',
      url: 'https://www.youtube.com/@NBCSportsChicago',
      color: '#CF0A2C',
    },
  ],
  mlb: [
    {
      id: 'chgo-cubs',
      name: 'CHGO Cubs',
      channelId: 'UCt5aRrp9sLRnSxQGYXdJVew',
      description: 'Daily Cubs analysis & discussion',
      url: 'https://www.youtube.com/@CHGOCubs',
      color: '#0E3386',
    },
    {
      id: 'chgo-white-sox',
      name: 'CHGO White Sox',
      channelId: 'UCzYEX3Vfq3hpKHJVMN3Wc6g',
      description: 'Daily White Sox analysis & discussion',
      url: 'https://www.youtube.com/@CHGOWhiteSox',
      color: '#27251F',
    },
    {
      id: 'sox-machine',
      name: 'Sox Machine',
      channelId: 'UC0jMKjq_y-Jy8p5wFxrhZmw',
      description: 'White Sox coverage & analysis',
      url: 'https://www.youtube.com/@SoxMachine',
      color: '#27251F',
    },
    {
      id: 'cubs-insider',
      name: 'Cubs Insider',
      channelId: 'UCBt8ZVVfOxLKXvGPJgWNKpA',
      description: 'Cubs news, analysis & fan content',
      url: 'https://www.youtube.com/@CubsInsider',
      color: '#0E3386',
    },
  ],
}

interface ChannelInfo {
  id: string
  name: string
  channelId: string
  description: string
  url: string
  color: string
}

interface VideoHighlight {
  videoId: string
  title: string
  description: string
  thumbnail: string
  publishedAt: string
  channelTitle: string
  channelId: string
}

interface GameHighlightsProps {
  gameId: string
  homeTeam: string
  awayTeam: string
  gameDate: string
  week: number
  sport?: 'nfl' | 'nba' | 'nhl' | 'mlb'
  team?: 'bears' | 'bulls' | 'blackhawks' | 'cubs' | 'whitesox'
  className?: string
}

/**
 * Chicago Sports Video Hub
 *
 * Features content from local Chicago sports creators instead of copyrighted league footage.
 * Helps grow the Chicago sports content community while providing value to users.
 */
export default function GameHighlights({
  gameId,
  homeTeam,
  awayTeam,
  gameDate,
  week,
  sport = 'nfl',
  team,
  className = '',
}: GameHighlightsProps) {
  const [videos, setVideos] = useState<VideoHighlight[]>([])
  const [loading, setLoading] = useState(true)
  const [activeVideo, setActiveVideo] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Get channels for this sport, filtered by team if MLB
  const channels = getChannelsForTeam(sport, team)

  useEffect(() => {
    const fetchHighlights = async () => {
      try {
        setLoading(true)
        const res = await fetch('/api/highlights/chicago-channels', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            gameId,
            homeTeam,
            awayTeam,
            gameDate,
            week,
            sport,
            channels: channels.map(c => c.channelId),
          }),
        })

        const data = await res.json()

        if (data.videos && data.videos.length > 0) {
          setVideos(data.videos)
          setActiveVideo(data.videos[0].videoId)
        }
      } catch (err) {
        console.error('Failed to fetch highlights:', err)
        setError('Unable to load videos')
      } finally {
        setLoading(false)
      }
    }

    fetchHighlights()
  }, [gameId, homeTeam, awayTeam, gameDate, week, sport])

  const activeVideoData = videos.find(v => v.videoId === activeVideo)
  const activeChannel = activeVideoData
    ? channels.find(c => c.channelId === activeVideoData.channelId)
    : null

  const sportLabel = getSportLabel(sport)
  const teamColor = getTeamColor(sport, team)

  return (
    <div className={`bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl overflow-hidden ${className}`}>
      {/* Header */}
      <div className="px-4 py-3 border-b border-[var(--border-subtle)]" style={{ backgroundColor: teamColor }}>
        <h3 className={`text-white text-lg flex items-center gap-2 ${montserrat.className}`}>
          <span>🎬</span> Chicago Sports Coverage
        </h3>
        <p className="text-white/60 text-xs mt-1">From local creators who live & breathe Chicago {sportLabel}</p>
      </div>

      {loading ? (
        <div className="p-8 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: teamColor, borderTopColor: 'transparent' }} />
          <span className="ml-3 text-[var(--text-muted)]">Loading videos...</span>
        </div>
      ) : error || videos.length === 0 ? (
        <>
          {/* Show featured channels when no specific game videos found */}
          <div className="p-4">
            <p className="text-sm text-[var(--text-muted)] mb-4">
              Check out these Chicago sports channels for coverage:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {channels.map((channel) => (
                <a
                  key={channel.id}
                  href={channel.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-xl bg-[var(--bg-tertiary)] hover:bg-[var(--bg-hover)] transition-colors group"
                >
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg"
                    style={{ backgroundColor: channel.color }}
                  >
                    {channel.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-[var(--text-primary)] group-hover:opacity-80 transition-colors">
                      {channel.name}
                    </div>
                    <div className="text-xs text-[var(--text-muted)] line-clamp-1">
                      {channel.description}
                    </div>
                  </div>
                  <svg className="w-5 h-5 text-[var(--text-muted)] group-hover:opacity-80 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              ))}
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Main Video Player */}
          {activeVideo && (
            <div className="relative">
              <div className="aspect-video bg-black">
                <iframe
                  src={`https://www.youtube.com/embed/${activeVideo}?rel=0&modestbranding=1`}
                  title={activeVideoData?.title || 'Chicago Sports Coverage'}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                />
              </div>
            </div>
          )}

          {/* Video Info & Channel Attribution */}
          {activeVideoData && (
            <div className="px-4 py-3 border-b border-[var(--border-subtle)]">
              <h4 className="font-semibold text-[var(--text-primary)] line-clamp-2">
                {activeVideoData.title}
              </h4>
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-2">
                  {activeChannel && (
                    <a
                      href={activeChannel.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                    >
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                        style={{ backgroundColor: activeChannel.color }}
                      >
                        {activeChannel.name.charAt(0)}
                      </div>
                      <span className="text-sm font-medium text-[var(--text-secondary)]">
                        {activeChannel.name}
                      </span>
                    </a>
                  )}
                  <span className="text-xs text-[var(--text-muted)]">
                    • {formatDate(activeVideoData.publishedAt)}
                  </span>
                </div>
                <a
                  href={`https://www.youtube.com/watch?v=${activeVideo}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-[var(--text-muted)] hover:opacity-80 flex items-center gap-1"
                >
                  Watch on YouTube
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            </div>
          )}

          {/* Video Thumbnails (if multiple) */}
          {videos.length > 1 && (
            <div className="p-3 border-b border-[var(--border-subtle)]">
              <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider mb-2">More Coverage</p>
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                {videos.map((video) => {
                  const channel = channels.find(c => c.channelId === video.channelId)
                  return (
                    <button
                      key={video.videoId}
                      onClick={() => setActiveVideo(video.videoId)}
                      className={`flex-shrink-0 relative rounded-lg overflow-hidden transition-all ${
                        activeVideo === video.videoId
                          ? 'ring-2 scale-105'
                          : 'opacity-70 hover:opacity-100'
                      }`}
                      style={{ '--tw-ring-color': activeVideo === video.videoId ? teamColor : undefined } as React.CSSProperties}
                    >
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        className="w-32 h-20 object-cover"
                      />
                      {channel && (
                        <div
                          className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded text-[8px] font-bold text-white"
                          style={{ backgroundColor: channel.color }}
                        >
                          {channel.name.split(' ')[0]}
                        </div>
                      )}
                      {activeVideo === video.videoId && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                          <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Support Local Creators Banner */}
          <div className="px-4 py-3" style={{ background: `linear-gradient(to right, ${teamColor}, ${teamColor}cc)` }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white text-xs font-semibold">Support Chicago Sports Creators</p>
                <p className="text-white/60 text-[10px]">Subscribe to these channels for more great content</p>
              </div>
              <div className="flex gap-1">
                {channels.slice(0, 3).map((channel) => (
                  <a
                    key={channel.id}
                    href={channel.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold hover:scale-110 transition-transform"
                    style={{ backgroundColor: channel.color }}
                    title={channel.name}
                  >
                    {channel.name.charAt(0)}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

/**
 * Get channels for a specific sport and team
 */
function getChannelsForTeam(sport: string, team?: string): ChannelInfo[] {
  const sportChannels = CHICAGO_CHANNELS_BY_SPORT[sport] || CHICAGO_CHANNELS_BY_SPORT.nfl

  // For MLB, filter to show only relevant team channels
  if (sport === 'mlb' && team) {
    if (team === 'cubs') {
      return sportChannels.filter(c => c.id.includes('cubs') || c.id.includes('chgo-cubs'))
    }
    if (team === 'whitesox') {
      return sportChannels.filter(c => c.id.includes('sox') || c.id.includes('chgo-white'))
    }
  }

  return sportChannels
}

/**
 * Get sport label for display
 */
function getSportLabel(sport: string): string {
  switch (sport) {
    case 'nfl': return 'football'
    case 'nba': return 'basketball'
    case 'nhl': return 'hockey'
    case 'mlb': return 'baseball'
    default: return 'sports'
  }
}

/**
 * Get team primary color
 */
function getTeamColor(sport: string, team?: string): string {
  if (team === 'bears') return '#0B162A'
  if (team === 'bulls') return '#CE1141'
  if (team === 'blackhawks') return '#CF0A2C'
  if (team === 'cubs') return '#0E3386'
  if (team === 'whitesox') return '#27251F'

  switch (sport) {
    case 'nfl': return '#0B162A'
    case 'nba': return '#CE1141'
    case 'nhl': return '#CF0A2C'
    case 'mlb': return '#0E3386'
    default: return '#0B162A'
  }
}

/**
 * Format date for display
 */
function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}
