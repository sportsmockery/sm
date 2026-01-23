import { NextRequest, NextResponse } from 'next/server'
import { TwitterApi, ApiResponseError } from 'twitter-api-v2'

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

    // Log which credentials are present (not values)
    console.log('[X] Credentials check:', {
      X_API_KEY: !!apiKey,
      X_API_SECRET: !!apiSecret,
      X_ACCESS_TOKEN: !!accessToken,
      X_ACCESS_TOKEN_SECRET: !!accessTokenSecret,
    })

    if (!apiKey || !apiSecret || !accessToken || !accessTokenSecret) {
      const missing = []
      if (!apiKey) missing.push('X_API_KEY')
      if (!apiSecret) missing.push('X_API_SECRET')
      if (!accessToken) missing.push('X_ACCESS_TOKEN')
      if (!accessTokenSecret) missing.push('X_ACCESS_TOKEN_SECRET')
      console.error('[X] Missing OAuth 1.0a credentials:', missing)
      return NextResponse.json(
        { error: 'X/Twitter not configured', missing },
        { status: 500 }
      )
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

    // Extract detailed error info from twitter-api-v2
    if (error instanceof ApiResponseError) {
      const details = {
        code: error.code,
        message: error.message,
        data: error.data,
        errors: error.errors,
        rateLimit: error.rateLimit,
      }
      console.error('[X] API Response Error details:', JSON.stringify(details, null, 2))
      return NextResponse.json({ error: 'X post failed', details }, { status: 500 })
    }

    return NextResponse.json(
      {
        error: 'X post failed',
        details: error instanceof Error ? { message: error.message } : error,
      },
      { status: 500 }
    )
  }
}
