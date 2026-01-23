// lib/getSouthsideBehaviorEmbeds.ts
import 'server-only';
import { TikTokEmbed } from './tiktokTypes';

const TIKTOK_PROFILE_URL = 'https://www.tiktok.com/@southsidebehavior';
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
const DISPLAY_COUNT = 12;

interface ScrapedVideo {
  videoId: string;
  title: string;
  thumbnailUrl: string;
  publishedAt: string;
}

/**
 * Scrapes TikTok profile page to extract video data
 */
async function scrapeTikTokProfile(): Promise<ScrapedVideo[]> {
  try {
    console.log('[TikTok] Fetching profile page...');

    const response = await fetch(TIKTOK_PROFILE_URL, {
      headers: {
        'User-Agent': USER_AGENT,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
      next: { revalidate: 1800 }, // Cache for 30 minutes
    });

    if (!response.ok) {
      console.error('[TikTok] Failed to fetch profile:', response.status);
      return [];
    }

    const html = await response.text();

    // Try to find embedded JSON data
    const dataMatch = html.match(/<script id="__UNIVERSAL_DATA_FOR_REHYDRATION__"[^>]*>([^<]+)<\/script>/);

    if (dataMatch) {
      const videos = parseUniversalData(dataMatch[1]);
      if (videos.length > 0) return videos;
    }

    // Try alternative SIGI_STATE pattern
    const sigiMatch = html.match(/<script id="SIGI_STATE"[^>]*>([^<]+)<\/script>/);
    if (sigiMatch) {
      const videos = parseSigiState(sigiMatch[1]);
      if (videos.length > 0) return videos;
    }

    // Fallback: extract video IDs from HTML
    return extractVideoIdsFromHtml(html);
  } catch (error) {
    console.error('[TikTok] Scrape error:', error);
    return [];
  }
}

function parseUniversalData(jsonString: string): ScrapedVideo[] {
  try {
    const data = JSON.parse(jsonString);
    const videos: ScrapedVideo[] = [];

    // Navigate TikTok's data structure
    const userDetail = data?.['__DEFAULT_SCOPE__']?.['webapp.user-detail'];
    const itemList = userDetail?.itemList || [];

    for (const item of itemList) {
      if (!item?.id) continue;

      // Skip replies, duets, stitches
      if (item.duetInfo || item.stitchInfo || item.replyInfo) continue;

      videos.push({
        videoId: String(item.id),
        title: item.desc || '',
        thumbnailUrl: item.video?.cover || item.video?.dynamicCover || '',
        publishedAt: item.createTime
          ? new Date(Number(item.createTime) * 1000).toISOString()
          : new Date().toISOString(),
      });
    }

    console.log(`[TikTok] Parsed ${videos.length} videos from universal data`);
    return videos.slice(0, DISPLAY_COUNT);
  } catch (error) {
    console.error('[TikTok] Parse error:', error);
    return [];
  }
}

function parseSigiState(jsonString: string): ScrapedVideo[] {
  try {
    const data = JSON.parse(jsonString);
    const videos: ScrapedVideo[] = [];

    const itemModule = data?.ItemModule || {};

    for (const [id, item] of Object.entries(itemModule)) {
      const video = item as any;
      if (!video || typeof video !== 'object') continue;

      // Skip replies, duets, stitches
      if (video.duetInfo || video.stitchInfo) continue;

      videos.push({
        videoId: String(id),
        title: video.desc || '',
        thumbnailUrl: video.video?.cover || '',
        publishedAt: video.createTime
          ? new Date(Number(video.createTime) * 1000).toISOString()
          : new Date().toISOString(),
      });
    }

    console.log(`[TikTok] Parsed ${videos.length} videos from SIGI state`);
    return videos.slice(0, DISPLAY_COUNT);
  } catch (error) {
    console.error('[TikTok] SIGI parse error:', error);
    return [];
  }
}

function extractVideoIdsFromHtml(html: string): ScrapedVideo[] {
  // Fallback: extract video IDs using regex
  const videoIdPattern = /@southsidebehavior\/video\/(\d+)/g;
  const matches = html.matchAll(videoIdPattern);
  const videoIds = new Set<string>();

  for (const match of matches) {
    videoIds.add(match[1]);
  }

  const videos = Array.from(videoIds).slice(0, DISPLAY_COUNT).map((id) => ({
    videoId: id,
    title: '',
    thumbnailUrl: '',
    publishedAt: new Date().toISOString(),
  }));

  console.log(`[TikTok] Extracted ${videos.length} video IDs from HTML`);
  return videos;
}

/**
 * Fetches oEmbed data for a video
 */
async function fetchOEmbed(video: ScrapedVideo): Promise<TikTokEmbed | null> {
  try {
    const url = `https://www.tiktok.com/@southsidebehavior/video/${video.videoId}`;
    const oembedUrl = `https://www.tiktok.com/oembed?url=${encodeURIComponent(url)}`;

    const res = await fetch(oembedUrl, {
      next: { revalidate: 1800 }, // 30 minutes
    });

    if (!res.ok) {
      console.error('[TikTok] oEmbed error for', video.videoId, res.status);
      return null;
    }

    const data = await res.json();

    return {
      url,
      html: String(data.html ?? ''),
      thumbnailUrl: data.thumbnail_url || video.thumbnailUrl,
      title: data.title || video.title,
      publishedAt: video.publishedAt,
    };
  } catch (error) {
    console.error('[TikTok] oEmbed fetch failed:', video.videoId, error);
    return null;
  }
}

export async function getSouthsideBehaviorEmbeds(): Promise<{
  latestEmbed: TikTokEmbed | null;
  previousEmbeds: TikTokEmbed[];
}> {
  // Scrape TikTok profile for video IDs
  const scrapedVideos = await scrapeTikTokProfile();

  if (scrapedVideos.length === 0) {
    console.log('[TikTok] No videos scraped, returning empty');
    return { latestEmbed: null, previousEmbeds: [] };
  }

  // Fetch oEmbed data for each video
  const embedPromises = scrapedVideos.map(fetchOEmbed);
  const results = await Promise.all(embedPromises);

  // Filter out failed fetches
  const embeds = results.filter((embed): embed is TikTokEmbed => embed !== null);

  // Sort by publish date descending (newest first)
  embeds.sort((a, b) =>
    new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );

  const latestEmbed = embeds[0] ?? null;
  const previousEmbeds = embeds.slice(1);

  console.log(`[TikTok] Returning ${embeds.length} embeds`);
  return { latestEmbed, previousEmbeds };
}
