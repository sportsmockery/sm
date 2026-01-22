// lib/getSouthsideBehaviorEmbeds.ts
import 'server-only';
import { TikTokEmbed } from './tiktokTypes';

// TODO: Replace the last 2 placeholder URLs with real TikTok URLs from @southsidebehavior
const SOUTHSIDE_TIKTOK_URLS: string[] = [
  'https://www.tiktok.com/@southsidebehavior/video/7133745668773940523',
  'https://www.tiktok.com/@southsidebehavior/video/7127779450061704490',
  'https://www.tiktok.com/@southsidebehavior/video/7122292861890055466',
  'https://www.tiktok.com/@southsidebehavior/video/PLACEHOLDER_URL_4',
  'https://www.tiktok.com/@southsidebehavior/video/PLACEHOLDER_URL_5',
];

async function fetchOEmbed(url: string): Promise<TikTokEmbed | null> {
  const oembedUrl = new URL('https://www.tiktok.com/oembed');
  oembedUrl.searchParams.set('url', url);

  const res = await fetch(oembedUrl.toString(), {
    next: { revalidate: 900 }, // 15 minutes
  });

  if (!res.ok) {
    console.error('TikTok oEmbed error', url, await res.text());
    return null;
  }

  const data = await res.json();

  return {
    url,
    html: String(data.html ?? ''),
    thumbnailUrl: String(data.thumbnail_url ?? ''),
    title: String(data.title ?? ''),
  };
}

export async function getSouthsideBehaviorEmbeds(): Promise<{
  latestEmbed: TikTokEmbed | null;
  previousEmbeds: TikTokEmbed[];
}> {
  const embeds: TikTokEmbed[] = [];

  for (const url of SOUTHSIDE_TIKTOK_URLS) {
    const embed = await fetchOEmbed(url);
    if (embed) embeds.push(embed);
  }

  const latestEmbed = embeds[0] ?? null;
  const previousEmbeds = embeds.slice(1);

  return { latestEmbed, previousEmbeds };
}
