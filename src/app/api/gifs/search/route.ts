/**
 * GIF SEARCH API
 * Proxies requests to Tenor/GIPHY API
 */

import { NextRequest, NextResponse } from 'next/server';

// Use Tenor API (free tier available)
const TENOR_API_KEY = process.env.TENOR_API_KEY || '';
const GIPHY_API_KEY = process.env.GIPHY_API_KEY || '';

interface TenorResult {
  id: string;
  media_formats: {
    gif: { url: string };
    tinygif: { url: string };
  };
}

interface GiphyResult {
  id: string;
  images: {
    original: { url: string };
    fixed_width: { url: string };
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    // Sanitize query - only allow safe sports-related searches
    const sanitizedQuery = sanitizeQuery(query);

    if (!sanitizedQuery) {
      return NextResponse.json({
        gifs: getSportsFallbackGifs(),
      });
    }

    // Try Tenor first
    if (TENOR_API_KEY) {
      const tenorGifs = await searchTenor(sanitizedQuery, limit);
      if (tenorGifs.length > 0) {
        return NextResponse.json({ gifs: tenorGifs, source: 'tenor' });
      }
    }

    // Try GIPHY
    if (GIPHY_API_KEY) {
      const giphyGifs = await searchGiphy(sanitizedQuery, limit);
      if (giphyGifs.length > 0) {
        return NextResponse.json({ gifs: giphyGifs, source: 'giphy' });
      }
    }

    // Fallback to curated sports GIFs
    return NextResponse.json({
      gifs: getSportsFallbackGifs(),
      source: 'fallback',
    });
  } catch (error) {
    console.error('GIF search error:', error);
    return NextResponse.json({
      gifs: getSportsFallbackGifs(),
      source: 'fallback',
      error: 'Search failed',
    });
  }
}

async function searchTenor(query: string, limit: number) {
  try {
    const url = new URL('https://tenor.googleapis.com/v2/search');
    url.searchParams.set('q', query);
    url.searchParams.set('key', TENOR_API_KEY);
    url.searchParams.set('limit', String(limit));
    url.searchParams.set('media_filter', 'gif,tinygif');
    url.searchParams.set('contentfilter', 'high'); // Strict content filter

    const response = await fetch(url.toString());
    if (!response.ok) return [];

    const data = await response.json();

    return (data.results || []).map((result: TenorResult) => ({
      id: result.id,
      url: result.media_formats.gif.url,
      preview: result.media_formats.tinygif.url,
    }));
  } catch (error) {
    console.error('Tenor API error:', error);
    return [];
  }
}

async function searchGiphy(query: string, limit: number) {
  try {
    const url = new URL('https://api.giphy.com/v1/gifs/search');
    url.searchParams.set('q', query);
    url.searchParams.set('api_key', GIPHY_API_KEY);
    url.searchParams.set('limit', String(limit));
    url.searchParams.set('rating', 'pg'); // Family-friendly only

    const response = await fetch(url.toString());
    if (!response.ok) return [];

    const data = await response.json();

    return (data.data || []).map((result: GiphyResult) => ({
      id: result.id,
      url: result.images.original.url,
      preview: result.images.fixed_width.url,
    }));
  } catch (error) {
    console.error('GIPHY API error:', error);
    return [];
  }
}

function sanitizeQuery(query: string): string {
  // Remove any potentially inappropriate terms
  const blockedTerms = [
    'nude', 'naked', 'sex', 'porn', 'xxx', 'nsfw', 'adult',
    'violence', 'death', 'kill', 'gore', 'blood',
    'drug', 'weed', 'cocaine', 'meth',
  ];

  let sanitized = query.toLowerCase().trim();

  for (const term of blockedTerms) {
    if (sanitized.includes(term)) {
      return ''; // Return empty if blocked term found
    }
  }

  // Limit length
  sanitized = sanitized.slice(0, 50);

  // Add sports context if query is generic
  const sportTerms = ['sports', 'nfl', 'nba', 'mlb', 'nhl', 'football', 'basketball', 'baseball', 'hockey', 'bears', 'bulls', 'cubs', 'sox', 'blackhawks'];
  const hasSportContext = sportTerms.some(term => sanitized.includes(term));

  if (!hasSportContext && sanitized.length < 10) {
    sanitized = `${sanitized} sports`;
  }

  return sanitized;
}

function getSportsFallbackGifs() {
  return [
    { id: '1', url: 'https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif', preview: 'https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/200w.gif' },
    { id: '2', url: 'https://media.giphy.com/media/3o7TKnO6Wve6502iJ2/giphy.gif', preview: 'https://media.giphy.com/media/3o7TKnO6Wve6502iJ2/200w.gif' },
    { id: '3', url: 'https://media.giphy.com/media/l0HlQ7LRalQqdWfao/giphy.gif', preview: 'https://media.giphy.com/media/l0HlQ7LRalQqdWfao/200w.gif' },
    { id: '4', url: 'https://media.giphy.com/media/26u4cqiYI30juCOGY/giphy.gif', preview: 'https://media.giphy.com/media/26u4cqiYI30juCOGY/200w.gif' },
    { id: '5', url: 'https://media.giphy.com/media/l3q2LH45XElELRzRm/giphy.gif', preview: 'https://media.giphy.com/media/l3q2LH45XElELRzRm/200w.gif' },
    { id: '6', url: 'https://media.giphy.com/media/3oEjHV0z8S7WM4MwnK/giphy.gif', preview: 'https://media.giphy.com/media/3oEjHV0z8S7WM4MwnK/200w.gif' },
  ];
}
