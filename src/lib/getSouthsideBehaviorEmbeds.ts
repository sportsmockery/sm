// lib/getSouthsideBehaviorEmbeds.ts
import 'server-only';
import { TikTokEmbed } from './tiktokTypes';

/**
 * TikTok blocks server-side scraping, so we use curated video URLs.
 *
 * To update this list:
 * 1. Go to https://www.tiktok.com/@southsidebehavior
 * 2. Click on original videos (NOT replies/duets/stitches)
 * 3. Copy URL from browser address bar
 * 4. Add to list below with publish date
 */
const SOUTHSIDE_TIKTOKS: { url: string; publishedAt: string }[] = [
  // Original posts from @southsidebehavior - newest first
  { url: 'https://www.tiktok.com/@southsidebehavior/video/7127779450061704490', publishedAt: '2022-08-05' },
  { url: 'https://www.tiktok.com/@southsidebehavior/video/7122292861890055466', publishedAt: '2022-07-21' },
];

const DISPLAY_COUNT = 12;

async function fetchOEmbed(
  url: string,
  publishedAt: string
): Promise<TikTokEmbed | null> {
  try {
    const oembedUrl = `https://www.tiktok.com/oembed?url=${encodeURIComponent(url)}`;

    const res = await fetch(oembedUrl, {
      next: { revalidate: 1800 }, // 30 minutes
    });

    if (!res.ok) {
      console.error('[TikTok] oEmbed error', url, res.status);
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
    console.error('[TikTok] oEmbed fetch failed', url, error);
    return null;
  }
}

export async function getSouthsideBehaviorEmbeds(): Promise<{
  latestEmbed: TikTokEmbed | null;
  previousEmbeds: TikTokEmbed[];
}> {
  const videosToFetch = SOUTHSIDE_TIKTOKS.slice(0, DISPLAY_COUNT);

  const results = await Promise.all(
    videosToFetch.map(({ url, publishedAt }) => fetchOEmbed(url, publishedAt))
  );

  const embeds = results.filter((embed): embed is TikTokEmbed => embed !== null);

  // Sort by publish date descending
  embeds.sort((a, b) =>
    new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );

  const latestEmbed = embeds[0] ?? null;
  const previousEmbeds = embeds.slice(1);

  return { latestEmbed, previousEmbeds };
}
