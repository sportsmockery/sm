// lib/getSouthsideBehaviorEmbeds.ts
import 'server-only';
import { TikTokEmbed } from './tiktokTypes';

/**
 * MANUAL CURATION REQUIRED
 *
 * TikTok does not provide a public API to fetch user videos automatically.
 * To update this list:
 * 1. Go to https://www.tiktok.com/@southsidebehavior
 * 2. Click on videos you want to feature (only original posts, NOT replies/duets/stitches)
 * 3. Copy the URL from browser address bar
 * 4. Add to this list with the publish date
 *
 * Format: { url: 'https://www.tiktok.com/@southsidebehavior/video/VIDEO_ID', publishedAt: 'YYYY-MM-DD' }
 *
 * Keep list sorted by date (newest first). Add new videos at the top.
 */
const SOUTHSIDE_TIKTOKS: { url: string; publishedAt: string }[] = [
  // Original posts from @southsidebehavior (NOT replies, duets, or stitches)
  // Update this list periodically by visiting the TikTok profile
  { url: 'https://www.tiktok.com/@southsidebehavior/video/7127779450061704490', publishedAt: '2022-08-05' },
  { url: 'https://www.tiktok.com/@southsidebehavior/video/7122292861890055466', publishedAt: '2022-07-21' },
];

const DISPLAY_COUNT = 12; // 1 featured + up to 11 in grid

async function fetchOEmbed(
  url: string,
  publishedAt: string
): Promise<TikTokEmbed | null> {
  try {
    const oembedUrl = new URL('https://www.tiktok.com/oembed');
    oembedUrl.searchParams.set('url', url);

    const res = await fetch(oembedUrl.toString(), {
      next: { revalidate: 900 }, // 15 minutes
    });

    if (!res.ok) {
      console.error('TikTok oEmbed error', url, res.status);
      return null;
    }

    const data = await res.json();

    return {
      url,
      html: String(data.html ?? ''),
      thumbnailUrl: String(data.thumbnail_url ?? ''),
      title: String(data.title ?? ''),
      publishedAt,
    };
  } catch (error) {
    console.error('TikTok oEmbed fetch failed', url, error);
    return null;
  }
}

export async function getSouthsideBehaviorEmbeds(): Promise<{
  latestEmbed: TikTokEmbed | null;
  previousEmbeds: TikTokEmbed[];
}> {
  // Take only the videos we need
  const videosToFetch = SOUTHSIDE_TIKTOKS.slice(0, DISPLAY_COUNT);

  const results = await Promise.all(
    videosToFetch.map(({ url, publishedAt }) => fetchOEmbed(url, publishedAt))
  );

  // Filter out failed fetches
  const embeds = results.filter((embed): embed is TikTokEmbed => embed !== null);

  // Sort by publish date descending (newest first)
  embeds.sort((a, b) =>
    new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );

  const latestEmbed = embeds[0] ?? null;
  const previousEmbeds = embeds.slice(1);

  return { latestEmbed, previousEmbeds };
}
