import { NextRequest, NextResponse } from 'next/server'

/**
 * POST /api/social/facebook
 *
 * Posts to the Sports Mockery Facebook Page using the Pages API.
 * The `message` field contains the caption text (no URL).
 * The `link` field contains the article URL which Facebook uses to build a card
 * with the featured image, headline, and description from OG tags.
 *
 * Required env vars:
 * - FB_PAGE_ID: The Facebook Page ID
 * - FB_PAGE_ACCESS_TOKEN: Long-lived Page Access Token
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

    const pageId = process.env.FB_PAGE_ID
    const accessToken = process.env.FB_PAGE_ACCESS_TOKEN

    if (!pageId || !accessToken) {
      console.error('[Facebook] Missing FB_PAGE_ID or FB_PAGE_ACCESS_TOKEN')
      return NextResponse.json(
        { error: 'Facebook not configured' },
        { status: 500 }
      )
    }

    // Post to Facebook Pages API
    // - message: text above the card (NO URL included)
    // - link: article URL -> Facebook builds card from OG tags
    const fbRes = await fetch(
      `https://graph.facebook.com/v24.0/${pageId}/feed`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: caption,
          link: url,
          published: true,
          access_token: accessToken,
        }),
      }
    )

    const data = await fbRes.json()

    if (!fbRes.ok) {
      console.error('[Facebook] Post error:', data)
      return NextResponse.json(
        { error: 'Facebook post failed', details: data },
        { status: 500 }
      )
    }

    console.log('[Facebook] Posted successfully:', data)
    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('[Facebook] Error:', error)
    return NextResponse.json(
      { error: 'Failed to post to Facebook', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
