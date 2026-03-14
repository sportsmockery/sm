import 'server-only'

const FEED_CHANNELS = [
  { handle: '@PinwheelsandIvyPodcast', name: 'Pinwheels & Ivy', team: 'Cubs', teamColor: '#0e3386' },
  { handle: '@untoldchicago', name: 'Untold Chicago Stories', team: 'Chicago Sports', teamColor: '#0B0F14' },
]

const MAX_PER_CHANNEL = 5

interface YouTubeFeedVideo {
  videoId: string
  title: string
  description: string
  publishedAt: string
  thumbnailUrl: string
  channelName: string
  team: string
  teamColor: string
  isShort: boolean
  duration: string
}

function parseDuration(duration: string): number {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
  if (!match) return 0
  return parseInt(match[1] || '0') * 3600 + parseInt(match[2] || '0') * 60 + parseInt(match[3] || '0')
}

function formatDuration(duration: string): string {
  const secs = parseDuration(duration)
  const m = Math.floor(secs / 60)
  const s = secs % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

async function fetchChannelFeedVideos(
  handle: string,
  channelName: string,
  team: string,
  teamColor: string,
  apiKey: string
): Promise<YouTubeFeedVideo[]> {
  try {
    const channelsUrl = new URL('https://www.googleapis.com/youtube/v3/channels')
    channelsUrl.searchParams.set('part', 'contentDetails')
    channelsUrl.searchParams.set('forHandle', handle)
    channelsUrl.searchParams.set('key', apiKey)

    const channelsRes = await fetch(channelsUrl.toString(), { next: { revalidate: 900 } })
    if (!channelsRes.ok) return []

    const channelsJson = await channelsRes.json()
    const uploadsPlaylistId = channelsJson.items?.[0]?.contentDetails?.relatedPlaylists?.uploads
    if (!uploadsPlaylistId) return []

    const playlistUrl = new URL('https://www.googleapis.com/youtube/v3/playlistItems')
    playlistUrl.searchParams.set('part', 'snippet,contentDetails')
    playlistUrl.searchParams.set('playlistId', uploadsPlaylistId)
    playlistUrl.searchParams.set('maxResults', String(MAX_PER_CHANNEL * 2))
    playlistUrl.searchParams.set('key', apiKey)

    const playlistRes = await fetch(playlistUrl.toString(), { next: { revalidate: 900 } })
    if (!playlistRes.ok) return []

    const playlistJson = await playlistRes.json()
    const items = Array.isArray(playlistJson.items) ? playlistJson.items : []
    const videoIds = items.map((item: any) => item.contentDetails?.videoId).filter(Boolean)
    if (videoIds.length === 0) return []

    const videosUrl = new URL('https://www.googleapis.com/youtube/v3/videos')
    videosUrl.searchParams.set('part', 'contentDetails,snippet')
    videosUrl.searchParams.set('id', videoIds.join(','))
    videosUrl.searchParams.set('key', apiKey)

    const videosRes = await fetch(videosUrl.toString(), { next: { revalidate: 900 } })
    if (!videosRes.ok) return []

    const videosJson = await videosRes.json()
    const videoItems = Array.isArray(videosJson.items) ? videosJson.items : []

    return videoItems.slice(0, MAX_PER_CHANNEL).map((item: any) => {
      const snippet = item.snippet ?? {}
      const contentDetails = item.contentDetails ?? {}
      const thumbs = snippet.thumbnails ?? {}
      const thumb = thumbs.high ?? thumbs.medium ?? thumbs.default ?? {}
      const dur = String(contentDetails.duration ?? '')
      const durationSecs = parseDuration(dur)

      return {
        videoId: String(item.id ?? ''),
        title: String(snippet.title ?? ''),
        description: String(snippet.description ?? ''),
        publishedAt: String(snippet.publishedAt ?? ''),
        thumbnailUrl: String(thumb.url ?? ''),
        channelName,
        team,
        teamColor,
        isShort: durationSecs > 0 && durationSecs < 60,
        duration: formatDuration(dur),
      }
    })
  } catch (err) {
    console.error(`[YouTubeFeed] Error fetching ${handle}:`, err)
    return []
  }
}

export async function getYouTubeFeedVideos(): Promise<YouTubeFeedVideo[]> {
  const apiKey = process.env.YOUTUBE_API_KEY
  if (!apiKey) return []

  const results = await Promise.all(
    FEED_CHANNELS.map(ch => fetchChannelFeedVideos(ch.handle, ch.name, ch.team, ch.teamColor, apiKey))
  )

  const allVideos = results.flat()
  allVideos.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
  return allVideos
}

export type { YouTubeFeedVideo }
