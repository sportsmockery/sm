import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

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
 * - X_ACCESS_SECRET: User Access Token Secret
 */

function percentEncode(str: string): string {
  return encodeURIComponent(str).replace(/[!'()*]/g, (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`)
}

function generateNonce(): string {
  return crypto.randomBytes(16).toString('hex')
}

function generateOAuthSignature(
  method: string,
  url: string,
  params: Record<string, string>,
  consumerSecret: string,
  tokenSecret: string
): string {
  // Sort parameters alphabetically and encode
  const sortedParams = Object.keys(params)
    .sort()
    .map((key) => `${percentEncode(key)}=${percentEncode(params[key])}`)
    .join('&')

  // Create signature base string
  const signatureBase = `${method.toUpperCase()}&${percentEncode(url)}&${percentEncode(sortedParams)}`

  // Create signing key
  const signingKey = `${percentEncode(consumerSecret)}&${percentEncode(tokenSecret)}`

  // Generate HMAC-SHA1 signature
  const signature = crypto.createHmac('sha1', signingKey).update(signatureBase).digest('base64')

  return signature
}

function generateOAuthHeader(
  method: string,
  url: string,
  consumerKey: string,
  consumerSecret: string,
  accessToken: string,
  accessSecret: string
): string {
  const timestamp = Math.floor(Date.now() / 1000).toString()
  const nonce = generateNonce()

  const oauthParams: Record<string, string> = {
    oauth_consumer_key: consumerKey,
    oauth_nonce: nonce,
    oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp: timestamp,
    oauth_token: accessToken,
    oauth_version: '1.0',
  }

  // Generate signature
  const signature = generateOAuthSignature(method, url, oauthParams, consumerSecret, accessSecret)
  oauthParams.oauth_signature = signature

  // Build Authorization header
  const headerParams = Object.keys(oauthParams)
    .sort()
    .map((key) => `${percentEncode(key)}="${percentEncode(oauthParams[key])}"`)
    .join(', ')

  return `OAuth ${headerParams}`
}

export async function POST(request: NextRequest) {
  try {
    const { url, caption } = (await request.json()) as {
      url?: string
      caption?: string
    }

    if (!url || !caption) {
      return NextResponse.json({ error: 'URL and caption are required' }, { status: 400 })
    }

    const consumerKey = process.env.X_API_KEY
    const consumerSecret = process.env.X_API_SECRET
    const accessToken = process.env.X_ACCESS_TOKEN
    const accessSecret = process.env.X_ACCESS_SECRET

    if (!consumerKey || !consumerSecret || !accessToken || !accessSecret) {
      console.error('[X] Missing OAuth 1.0a credentials')
      return NextResponse.json({ error: 'X/Twitter not configured' }, { status: 500 })
    }

    // Tweet text: caption + URL.
    // X will shorten the URL and generate a link card from the page metadata.
    const text = `${caption}\n\n${url}`

    const apiUrl = 'https://api.twitter.com/2/tweets'
    const authHeader = generateOAuthHeader('POST', apiUrl, consumerKey, consumerSecret, accessToken, accessSecret)

    const xRes = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        Authorization: authHeader,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    })

    const data = await xRes.json()

    if (!xRes.ok) {
      console.error('[X] Post error:', data)
      return NextResponse.json({ error: 'X post failed', details: data }, { status: 500 })
    }

    console.log('[X] Posted successfully:', data)
    return NextResponse.json({ success: true, data })
  } catch (error: unknown) {
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
