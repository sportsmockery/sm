// lib/getSouthsideBehaviorEmbeds.ts
import 'server-only';
import { TikTokEmbed } from './tiktokTypes';

// Curated list of original TikTok posts from @southsidebehavior (NOT replies, duets, or stitches)
// Each entry includes the URL and publish date (newest first)
const SOUTHSIDE_TIKTOKS: { url: string; publishedAt: string }[] = [
  // Add TikTok URLs here in order of newest to oldest
  // Only include original posts, not replies/duets/stitches
  { url: 'https://www.tiktok.com/@southsidebehavior/video/7461227606248296750', publishedAt: '2025-01-19' },
  { url: 'https://www.tiktok.com/@southsidebehavior/video/7460863033246653742', publishedAt: '2025-01-18' },
  { url: 'https://www.tiktok.com/@southsidebehavior/video/7460138422355661099', publishedAt: '2025-01-16' },
  { url: 'https://www.tiktok.com/@southsidebehavior/video/7459413988485523755', publishedAt: '2025-01-14' },
  { url: 'https://www.tiktok.com/@southsidebehavior/video/7458689413338488107', publishedAt: '2025-01-12' },
  { url: 'https://www.tiktok.com/@southsidebehavior/video/7457964838787150123', publishedAt: '2025-01-10' },
  { url: 'https://www.tiktok.com/@southsidebehavior/video/7457240263568940330', publishedAt: '2025-01-08' },
  { url: 'https://www.tiktok.com/@southsidebehavior/video/7456515688346214698', publishedAt: '2025-01-06' },
  { url: 'https://www.tiktok.com/@southsidebehavior/video/7455791113178144042', publishedAt: '2025-01-04' },
  { url: 'https://www.tiktok.com/@southsidebehavior/video/7455066538030993706', publishedAt: '2025-01-02' },
  { url: 'https://www.tiktok.com/@southsidebehavior/video/7454341963571580203', publishedAt: '2024-12-31' },
  { url: 'https://www.tiktok.com/@southsidebehavior/video/7453617388440923435', publishedAt: '2024-12-29' },
];

const DISPLAY_COUNT = 12; // 1 featured + 11 in grid

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
