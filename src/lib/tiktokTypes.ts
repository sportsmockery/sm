// lib/tiktokTypes.ts
export type TikTokEmbed = {
  url: string;        // Original TikTok URL
  html: string;       // TikTok oEmbed HTML
  thumbnailUrl: string;
  title: string;
  publishedAt: string; // ISO date string
};
