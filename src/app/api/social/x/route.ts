import { NextRequest, NextResponse } from 'next/server'

/**
 * POST /api/social/x
 *
 * Posts to X (Twitter) using the X API v2 with a bearer token.
 * The tweet text includes the caption followed by the URL.
 * X will render a link card using the OG/Twitter tags from the article page.
 *
 * Required env var:
 * - X_BEARER_TOKEN: X Bearer Token (app-only OAuth2)
 */
export async function POST(request: NextRequest) {
  try {
    const { url, caption } = (await request.json()) as {
      url?: string
      caption?: string
    }

    if (!url || !caption) {
      return NextResponse.json(
        { error: 'URL and caption are required' },
        { status: 400 }
      )
    }

    const bearerToken = process.env.X_BEARER_TOKEN

    if (!bearerToken) {
      console.error('[X] Missing bearer token')
      return NextResponse.json(
        { error: 'X/Twitter not configured' },
        { status: 500 }
      )
    }

    // Tweet text: caption + URL.
    // X will shorten the URL and generate a link card from the page metadata.
    const text = `${caption}\n\n${url}`

    const xRes = await fetch('https://api.x.com/2/tweets', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${bearerToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    })

    const data = await xRes.json()

    if (!xRes.ok) {
      console.error('[X] Post error:', data)
      return NextResponse.json(
        { error: 'X post failed', details: data },
        { status: 500 }
      )
    }

    console.log('[X] Posted successfully:', data)
    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    console.error('[X] Error:', error)
    return NextResponse.json(
      {
        error: 'Failed to post to X',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
