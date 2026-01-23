import { NextRequest, NextResponse } from 'next/server'

/**
 * POST /api/social/x
 *
 * Posts to X (Twitter) using the X API v2.
 * The tweet text includes the caption followed by the URL.
 * X will render a link card using the OG tags from the article page.
 *
 * Required env vars:
 * - X_API_KEY: X API Key (Consumer Key)
 * - X_API_SECRET: X API Secret (Consumer Secret)
 * - X_ACCESS_TOKEN: X Access Token
 * - X_ACCESS_TOKEN_SECRET: X Access Token Secret
 * - X_BEARER_TOKEN: X Bearer Token (for v2 API)
 */
export async function POST(request: NextRequest) {
  try {
    const { url, caption } = await request.json()

    if (!url || !caption) {
      return NextResponse.json(
        { error: 'URL and caption are required' },
        { status: 400 }
      )
    }

    const bearerToken = process.env.X_BEARER_TOKEN
    const apiKey = process.env.X_API_KEY
    const apiSecret = process.env.X_API_SECRET
    const accessToken = process.env.X_ACCESS_TOKEN
    const accessTokenSecret = process.env.X_ACCESS_TOKEN_SECRET

    // Check for OAuth 1.0a credentials (required for posting)
    if (!apiKey || !apiSecret || !accessToken || !accessTokenSecret) {
      console.error('[X/Twitter] Missing API credentials')
      return NextResponse.json(
        { error: 'X/Twitter not configured' },
        { status: 500 }
      )
    }

    // X API v2 requires OAuth 1.0a for posting tweets
    // We need to use oauth-1.0a library for signing requests
    // For simplicity, we'll use the v2 API with OAuth 2.0 App-Only if available,
    // but tweet creation requires user context (OAuth 1.0a)

    // Import oauth-1.0a for signing (if available)
    // For now, return a not-implemented response if OAuth 1.0a signing isn't set up
    // You can integrate a library like 'oauth-1.0a' or 'twitter-api-v2' for full support

    // Using twitter-api-v2 client approach (simplified)
    // In production, install: npm install twitter-api-v2

    try {
      // Dynamic import to handle cases where the library isn't installed
      const { TwitterApi } = await import('twitter-api-v2')

      const client = new TwitterApi({
        appKey: apiKey,
        appSecret: apiSecret,
        accessToken: accessToken,
        accessSecret: accessTokenSecret,
      })

      // Post tweet with caption + URL
      // X will automatically generate a card from the URL's OG tags
      const tweetText = `${caption}\n\n${url}`

      const { data } = await client.v2.tweet(tweetText)

      console.log('[X/Twitter] Posted successfully:', data)
      return NextResponse.json({ success: true, data })
    } catch (twitterError) {
      // If twitter-api-v2 isn't installed, try basic fetch approach
      console.error('[X/Twitter] Twitter client error:', twitterError)

      // Fallback: Log that X posting requires the twitter-api-v2 package
      return NextResponse.json(
        {
          error: 'X posting requires twitter-api-v2 package',
          message: 'Install with: npm install twitter-api-v2',
          details: twitterError instanceof Error ? twitterError.message : 'Unknown error'
        },
        { status: 501 }
      )
    }
  } catch (error) {
    console.error('[X/Twitter] Error:', error)
    return NextResponse.json(
      { error: 'Failed to post to X', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
