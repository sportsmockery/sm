import { NextRequest, NextResponse } from 'next/server'
import { TwitterApi } from 'twitter-api-v2'

/**
 * POST /api/social/x
 *
 * Posts to X (Twitter) using the X API v2 with OAuth 1.0a User Context.
 * The tweet text includes the caption followed by the URL.
 * X will render a link card using the OG/Twitter tags from the article page.
 *
 * Required env vars:
 * - X_API_KEY: Consumer API Key
 * - X_API_SECRET: Consumer API Secret
 * - X_ACCESS_TOKEN: User Access Token
 * - X_ACCESS_TOKEN_SECRET: User Access Token Secret
 */
export async function POST(request: NextRequest) {
  try {
    const { url, caption } = (await request.json()) as {
      url?: string
      caption?: string
    }

    if (!url || !caption) {
      return NextResponse.json({ error: 'URL and caption are required' }, { status: 400 })
    }

    const apiKey = process.env.X_API_KEY
    const apiSecret = process.env.X_API_SECRET
    const accessToken = process.env.X_ACCESS_TOKEN
    const accessTokenSecret = process.env.X_ACCESS_TOKEN_SECRET

    if (!apiKey || !apiSecret || !accessToken || !accessTokenSecret) {
      console.error('[X] Missing OAuth 1.0a credentials')
      return NextResponse.json({ error: 'X/Twitter not configured' }, { status: 500 })
    }

    // Tweet text: caption + URL.
    // X will shorten the URL and generate a link card from the page metadata.
    const tweetText = `${caption}\n\n${url}`

    const client = new TwitterApi({
      appKey: apiKey,
      appSecret: apiSecret,
      accessToken,
      accessSecret: accessTokenSecret,
    })

    const { data } = await client.v2.tweet(tweetText)

    console.log('[X] Posted successfully:', data)
    return NextResponse.json({ success: true, data })
  } catch (error: unknown) {
    console.error('[X] Error:', error)
    return NextResponse.json(
      {
        error: 'X post failed',
        details: error instanceof Error ? { message: error.message } : error,
      },
      { status: 500 }
    )
  }
}
