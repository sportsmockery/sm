// lib/getPinwheelsAndIvyVideos.ts
import 'server-only';
import { ShowVideo } from './youtubeTypes';

const PI_HANDLE = '@PinwheelsandIvyPodcast';
const MAX_RESULTS = 20; // Fetch more to filter out shorts
const DISPLAY_COUNT = 5; // 1 latest + 4 previous

interface VideoDetails {
  videoId: string;
  title: string;
  description: string;
  publishedAt: string;
  thumbnailUrl: string;
  duration: string;
  isLiveStream: boolean;
}

// Parse ISO 8601 duration to seconds
function parseDuration(duration: string): number {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  const hours = parseInt(match[1] || '0', 10);
  const minutes = parseInt(match[2] || '0', 10);
  const seconds = parseInt(match[3] || '0', 10);
  return hours * 3600 + minutes * 60 + seconds;
}

export async function getPinwheelsAndIvyVideos(): Promise<{
  latestVideo: ShowVideo | null;
  previousVideos: ShowVideo[];
}> {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    console.error('Missing YOUTUBE_API_KEY env var');
    return { latestVideo: null, previousVideos: [] };
  }

  // 1) Resolve uploads playlist ID
  const channelsUrl = new URL('https://www.googleapis.com/youtube/v3/channels');
  channelsUrl.searchParams.set('part', 'snippet,contentDetails');
  channelsUrl.searchParams.set('forHandle', PI_HANDLE);
  channelsUrl.searchParams.set('key', apiKey);

  const channelsRes = await fetch(channelsUrl.toString(), {
    next: { revalidate: 900 },
  });

  if (!channelsRes.ok) {
    console.error('Error fetching channels', await channelsRes.text());
    return { latestVideo: null, previousVideos: [] };
  }

  const channelsJson = await channelsRes.json();
  const uploadsPlaylistId =
    channelsJson.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;

  if (!uploadsPlaylistId) {
    console.error('No uploads playlist ID found for Pinwheels and Ivy');
    return { latestVideo: null, previousVideos: [] };
  }

  // 2) Fetch videos from uploads playlist
  const playlistUrl = new URL(
    'https://www.googleapis.com/youtube/v3/playlistItems'
  );
  playlistUrl.searchParams.set('part', 'snippet,contentDetails');
  playlistUrl.searchParams.set('playlistId', uploadsPlaylistId);
  playlistUrl.searchParams.set('maxResults', String(MAX_RESULTS));
  playlistUrl.searchParams.set('key', apiKey);

  const playlistRes = await fetch(playlistUrl.toString(), {
    next: { revalidate: 900 },
  });

  if (!playlistRes.ok) {
    console.error('Error fetching playlistItems', await playlistRes.text());
    return { latestVideo: null, previousVideos: [] };
  }

  const playlistJson = await playlistRes.json();
  const items = Array.isArray(playlistJson.items) ? playlistJson.items : [];

  // Extract video IDs
  const videoIds = items
    .map((item: any) => item.contentDetails?.videoId)
    .filter(Boolean);

  if (videoIds.length === 0) {
    return { latestVideo: null, previousVideos: [] };
  }

  // 3) Get video details (duration, live streaming info)
  const videosUrl = new URL('https://www.googleapis.com/youtube/v3/videos');
  videosUrl.searchParams.set('part', 'contentDetails,liveStreamingDetails,snippet');
  videosUrl.searchParams.set('id', videoIds.join(','));
  videosUrl.searchParams.set('key', apiKey);

  const videosRes = await fetch(videosUrl.toString(), {
    next: { revalidate: 900 },
  });

  if (!videosRes.ok) {
    console.error('Error fetching video details', await videosRes.text());
    return { latestVideo: null, previousVideos: [] };
  }

  const videosJson = await videosRes.json();
  const videoItems = Array.isArray(videosJson.items) ? videosJson.items : [];

  // 4) Map and filter videos
  const videoDetails: VideoDetails[] = videoItems.map((item: any) => {
    const snippet = item.snippet ?? {};
    const contentDetails = item.contentDetails ?? {};
    const liveStreamingDetails = item.liveStreamingDetails;
    const thumbs = snippet.thumbnails ?? {};
    const thumbMedium = thumbs.medium ?? thumbs.default ?? {};

    return {
      videoId: String(item.id ?? ''),
      title: String(snippet.title ?? ''),
      description: String(snippet.description ?? ''),
      publishedAt: String(snippet.publishedAt ?? ''),
      thumbnailUrl: String(thumbMedium.url ?? ''),
      duration: String(contentDetails.duration ?? ''),
      isLiveStream: !!liveStreamingDetails,
    };
  });

  // 5) Filter out shorts (videos under 60 seconds)
  const filteredVideos = videoDetails.filter((video) => {
    const durationSeconds = parseDuration(video.duration);
    // Filter out shorts (typically under 60 seconds)
    return durationSeconds >= 60;
  });

  // 6) Sort by publish date (most recent first)
  // Both past live streams and regular videos are sorted together by date
  filteredVideos.sort((a, b) => {
    return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
  });

  // 7) Convert to ShowVideo format and limit to display count
  const videos: ShowVideo[] = filteredVideos
    .slice(0, DISPLAY_COUNT)
    .map((v) => ({
      videoId: v.videoId,
      title: v.title,
      description: v.description,
      publishedAt: v.publishedAt,
      thumbnailUrl: v.thumbnailUrl,
    }));

  const latestVideo = videos[0] ?? null;
  const previousVideos = videos.slice(1, 5); // 4 previous videos

  return { latestVideo, previousVideos };
}
