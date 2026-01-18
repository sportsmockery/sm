import { NextRequest, NextResponse } from 'next/server'

interface GiphyGif {
  id: string
  images: {
    fixed_width: {
      url: string
      width: string
      height: string
    }
    original: {
      url: string
    }
  }
}

interface TenorGif {
  id: string
  media_formats: {
    tinygif: {
      url: string
      dims: [number, number]
    }
    gif: {
      url: string
    }
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50)

    if (!query) {
      return NextResponse.json({ error: 'Query required' }, { status: 400 })
    }

    // Try Tenor first (if API key exists)
    const tenorKey = process.env.TENOR_API_KEY
    if (tenorKey) {
      try {
        const tenorRes = await fetch(
          `https://tenor.googleapis.com/v2/search?q=${encodeURIComponent(query)}&key=${tenorKey}&limit=${limit}&media_filter=tinygif,gif`
        )

        if (tenorRes.ok) {
          const data = await tenorRes.json()
          const gifs = (data.results || []).map((gif: TenorGif) => ({
            id: gif.id,
            url: gif.media_formats.gif?.url || gif.media_formats.tinygif?.url,
            preview: gif.media_formats.tinygif?.url,
            width: gif.media_formats.tinygif?.dims?.[0] || 200,
            height: gif.media_formats.tinygif?.dims?.[1] || 200,
          }))

          return NextResponse.json({ gifs, source: 'tenor' })
        }
      } catch (e) {
        console.error('Tenor API error:', e)
      }
    }

    // Try GIPHY if Tenor fails or no key
    const giphyKey = process.env.GIPHY_API_KEY
    if (giphyKey) {
      try {
        const giphyRes = await fetch(
          `https://api.giphy.com/v1/gifs/search?api_key=${giphyKey}&q=${encodeURIComponent(query)}&limit=${limit}&rating=pg-13`
        )

        if (giphyRes.ok) {
          const data = await giphyRes.json()
          const gifs = (data.data || []).map((gif: GiphyGif) => ({
            id: gif.id,
            url: gif.images.original.url,
            preview: gif.images.fixed_width.url,
            width: parseInt(gif.images.fixed_width.width),
            height: parseInt(gif.images.fixed_width.height),
          }))

          return NextResponse.json({ gifs, source: 'giphy' })
        }
      } catch (e) {
        console.error('GIPHY API error:', e)
      }
    }

    // Fallback: Return sports-related placeholder GIFs
    const fallbackGifs = getSportsFallbackGifs(query)
    return NextResponse.json({ gifs: fallbackGifs, source: 'fallback' })
  } catch (error) {
    console.error('GIF search error:', error)
    return NextResponse.json({ error: 'Failed to search GIFs' }, { status: 500 })
  }
}

function getSportsFallbackGifs(query: string): { id: string; url: string; preview: string; width: number; height: number }[] {
  // Popular sports-related GIFs from GIPHY's public library
  const sportsGifs = [
    { id: 'touchdown', url: 'https://media.giphy.com/media/3o7aCVYGR1gUvJh9BK/giphy.gif', preview: 'https://media.giphy.com/media/3o7aCVYGR1gUvJh9BK/200w.gif' },
    { id: 'celebration', url: 'https://media.giphy.com/media/kyLYXonQYYfwYDIeZl/giphy.gif', preview: 'https://media.giphy.com/media/kyLYXonQYYfwYDIeZl/200w.gif' },
    { id: 'cheer', url: 'https://media.giphy.com/media/3oEdv4hwWTzBhWvaU0/giphy.gif', preview: 'https://media.giphy.com/media/3oEdv4hwWTzBhWvaU0/200w.gif' },
    { id: 'yes', url: 'https://media.giphy.com/media/StKiS6x698JAl9d6cx/giphy.gif', preview: 'https://media.giphy.com/media/StKiS6x698JAl9d6cx/200w.gif' },
    { id: 'no', url: 'https://media.giphy.com/media/JYZ397GsFrFtu/giphy.gif', preview: 'https://media.giphy.com/media/JYZ397GsFrFtu/200w.gif' },
    { id: 'sad', url: 'https://media.giphy.com/media/d2lcHJTG5Tscg/giphy.gif', preview: 'https://media.giphy.com/media/d2lcHJTG5Tscg/200w.gif' },
    { id: 'excited', url: 'https://media.giphy.com/media/5VKbvrjxpVJCM/giphy.gif', preview: 'https://media.giphy.com/media/5VKbvrjxpVJCM/200w.gif' },
    { id: 'facepalm', url: 'https://media.giphy.com/media/3o7TKrn3lT1pYNBRaE/giphy.gif', preview: 'https://media.giphy.com/media/3o7TKrn3lT1pYNBRaE/200w.gif' },
  ]

  return sportsGifs.map(gif => ({
    ...gif,
    width: 200,
    height: 200,
  }))
}
