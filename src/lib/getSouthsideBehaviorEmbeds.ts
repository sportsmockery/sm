// lib/getSouthsideBehaviorEmbeds.ts
import 'server-only';
import { TikTokEmbed } from './tiktokTypes';

// Native TikTok posts from @southsidebehavior (NOT replies)
const SOUTHSIDE_TIKTOK_URLS: string[] = [
  // "Rebuilt for years to our championship window just for this" - Native post
  'https://www.tiktok.com/@southsidebehavior/video/7127779450061704490',
  // "I dont doubt he does all of this when he's not mic'd up" - Native post about All-Star mic'd up
  'https://www.tiktok.com/@southsidebehavior/video/7122292861890055466',
];

async function fetchOEmbed(url: string): Promise<TikTokEmbed | null> {
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
  const results = await Promise.all(
    SOUTHSIDE_TIKTOK_URLS.map(url => fetchOEmbed(url))
  );

  const embeds = results.filter((embed): embed is TikTokEmbed => embed !== null);

  const latestEmbed = embeds[0] ?? null;
  const previousEmbeds = embeds.slice(1);

  return { latestEmbed, previousEmbeds };
}
