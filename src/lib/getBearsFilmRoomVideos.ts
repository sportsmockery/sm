// lib/getBearsFilmRoomVideos.ts
import 'server-only';
import { ShowVideo } from './youtubeTypes';

const BFR_HANDLE = '@bearsfilmroom';
const MAX_RESULTS = 5;

export async function getBearsFilmRoomVideos(): Promise<{
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
  channelsUrl.searchParams.set('forHandle', BFR_HANDLE);
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
    console.error('No uploads playlist ID found for Bears Film Room');
    return { latestVideo: null, previousVideos: [] };
  }

  // 2) Fetch latest 5 videos from uploads playlist
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

  const videos: ShowVideo[] = items.map((item: any) => {
    const snippet = item.snippet ?? {};
    const contentDetails = item.contentDetails ?? {};
    const thumbs = snippet.thumbnails ?? {};
    const thumbMedium = thumbs.medium ?? thumbs.default ?? {};

    return {
      videoId: String(contentDetails.videoId ?? ''),
      title: String(snippet.title ?? ''),
      description: String(snippet.description ?? ''),
      publishedAt: String(snippet.publishedAt ?? ''),
      thumbnailUrl: String(thumbMedium.url ?? ''),
    };
  }).filter((v: ShowVideo) => v.videoId);

  const latestVideo = videos[0] ?? null;
  const previousVideos = videos.slice(1);

  return { latestVideo, previousVideos };
}
