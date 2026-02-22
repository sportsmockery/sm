// lib/getVisionTheaterVideos.ts
import 'server-only'
import { ShowVideo } from './youtubeTypes'

const MAX_RESULTS = 20
const DISPLAY_COUNT = 15

export interface VisionTheaterVideo extends ShowVideo {
  channelSlug: string
  channelName: string
  isShort: boolean
}

export interface VisionTheaterChannel {
  slug: string
  name: string
  videos: VisionTheaterVideo[]
}

export interface VisionTheaterData {
  channels: VisionTheaterChannel[]
  allVideos: VisionTheaterVideo[]
}

const CHANNELS = [
  { slug: 'bears-film-room', name: 'Bears Film Room', handle: '@bearsfilmroom' },
  { slug: 'pinwheels-and-ivy', name: 'Pinwheels & Ivy', handle: '@PinwheelsandIvyPodcast' },
  { slug: 'untold-chicago', name: 'Untold Chicago Stories', handle: '@untoldchicagostories' },
] as const

// Parse ISO 8601 duration to seconds
function parseDuration(duration: string): number {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
  if (!match) return 0
  const hours = parseInt(match[1] || '0', 10)
  const minutes = parseInt(match[2] || '0', 10)
  const seconds = parseInt(match[3] || '0', 10)
  return hours * 3600 + minutes * 60 + seconds
}

interface VideoDetails {
  videoId: string
  title: string
  description: string
  publishedAt: string
  thumbnailUrl: string
  duration: string
  isLiveStream: boolean
}

async function fetchChannelVideos(
  handle: string,
  apiKey: string,
  channelSlug: string,
  channelName: string
): Promise<VisionTheaterVideo[]> {
  // 1) Resolve uploads playlist ID
  const channelsUrl = new URL('https://www.googleapis.com/youtube/v3/channels')
  channelsUrl.searchParams.set('part', 'snippet,contentDetails')
  channelsUrl.searchParams.set('forHandle', handle)
  channelsUrl.searchParams.set('key', apiKey)

  const channelsRes = await fetch(channelsUrl.toString(), {
    next: { revalidate: 900 },
  })

  if (!channelsRes.ok) {
    console.error(`[VisionTheater] Error fetching channel ${handle}:`, await channelsRes.text())
    return []
  }

  const channelsJson = await channelsRes.json()
  const uploadsPlaylistId =
    channelsJson.items?.[0]?.contentDetails?.relatedPlaylists?.uploads

  if (!uploadsPlaylistId) {
    console.error(`[VisionTheater] No uploads playlist for ${handle}`)
    return []
  }

  // 2) Fetch videos from uploads playlist
  const playlistUrl = new URL('https://www.googleapis.com/youtube/v3/playlistItems')
  playlistUrl.searchParams.set('part', 'snippet,contentDetails')
  playlistUrl.searchParams.set('playlistId', uploadsPlaylistId)
  playlistUrl.searchParams.set('maxResults', String(MAX_RESULTS))
  playlistUrl.searchParams.set('key', apiKey)

  const playlistRes = await fetch(playlistUrl.toString(), {
    next: { revalidate: 900 },
  })

  if (!playlistRes.ok) {
    console.error(`[VisionTheater] Error fetching playlist for ${handle}:`, await playlistRes.text())
    return []
  }

  const playlistJson = await playlistRes.json()
  const items = Array.isArray(playlistJson.items) ? playlistJson.items : []

  // Extract video IDs
  const videoIds = items
    .map((item: any) => item.contentDetails?.videoId)
    .filter(Boolean)

  if (videoIds.length === 0) return []

  // 3) Get video details (duration, live streaming info)
  const videosUrl = new URL('https://www.googleapis.com/youtube/v3/videos')
  videosUrl.searchParams.set('part', 'contentDetails,liveStreamingDetails,snippet')
  videosUrl.searchParams.set('id', videoIds.join(','))
  videosUrl.searchParams.set('key', apiKey)

  const videosRes = await fetch(videosUrl.toString(), {
    next: { revalidate: 900 },
  })

  if (!videosRes.ok) {
    console.error(`[VisionTheater] Error fetching video details for ${handle}:`, await videosRes.text())
    return []
  }

  const videosJson = await videosRes.json()
  const videoItems = Array.isArray(videosJson.items) ? videosJson.items : []

  // 4) Map and filter videos
  const videoDetails: VideoDetails[] = videoItems.map((item: any) => {
    const snippet = item.snippet ?? {}
    const contentDetails = item.contentDetails ?? {}
    const liveStreamingDetails = item.liveStreamingDetails
    const thumbs = snippet.thumbnails ?? {}
    const thumbHigh = thumbs.high ?? thumbs.medium ?? thumbs.default ?? {}

    return {
      videoId: String(item.id ?? ''),
      title: String(snippet.title ?? ''),
      description: String(snippet.description ?? ''),
      publishedAt: String(snippet.publishedAt ?? ''),
      thumbnailUrl: String(thumbHigh.url ?? ''),
      duration: String(contentDetails.duration ?? ''),
      isLiveStream: !!liveStreamingDetails,
    }
  })

  // 5) Tag shorts (under 60 seconds) instead of filtering them out
  const taggedVideos = videoDetails.map((video) => {
    const durationSeconds = parseDuration(video.duration)
    return { ...video, isShort: durationSeconds < 60 && durationSeconds > 0 }
  })

  // 6) Sort: full videos first (by date), then shorts (by date)
  taggedVideos.sort((a, b) => {
    if (a.isShort !== b.isShort) return a.isShort ? 1 : -1
    return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  })

  // 7) Convert to VisionTheaterVideo format
  return taggedVideos.slice(0, DISPLAY_COUNT + 10).map((v) => ({
    videoId: v.videoId,
    title: v.title,
    description: v.description,
    publishedAt: v.publishedAt,
    thumbnailUrl: v.thumbnailUrl,
    channelSlug: channelSlug,
    channelName: channelName,
    isShort: v.isShort,
  }))
}

export async function getVisionTheaterVideos(): Promise<VisionTheaterData> {
  const apiKey = process.env.YOUTUBE_API_KEY
  if (!apiKey) {
    console.error('[VisionTheater] Missing YOUTUBE_API_KEY env var')
    return { channels: [], allVideos: [] }
  }

  // Fetch all channels in parallel
  const results = await Promise.allSettled(
    CHANNELS.map((ch) => fetchChannelVideos(ch.handle, apiKey, ch.slug, ch.name))
  )

  const channels: VisionTheaterChannel[] = CHANNELS.map((ch, i) => {
    const result = results[i]
    const videos = result.status === 'fulfilled' ? result.value : []
    return { slug: ch.slug, name: ch.name, videos }
  })

  // Merge all videos and sort by date
  const allVideos = channels
    .flatMap((ch) => ch.videos)
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())

  return { channels, allVideos }
}
