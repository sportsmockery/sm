// SmTransparencyHydrator
// Reads the transparency-asset row from google_transparency_assets, fetches
// the page at its URL, and runs heuristics to populate the 14 booleans the
// rules engine consumes.
//
// Heuristics are intentionally generous in both directions: any reasonable
// signal counts. The risk we're guarding against is the opposite of the first
// version — under-counting because phrasing didn't match a narrow keyword set.
// False positives here only inflate trust by single-digit points; false
// negatives drag a real /about page from 100 to single digits.

import type { SupabaseClient } from '@supabase/supabase-js'
import type { TransparencyAssetHydrator } from './google-transparency-service'
import type { TransparencyAssetInput } from './google-rules-engine'
import type { TransparencyAssetType } from './types'

interface AssetRow {
  id: string
  asset_type: TransparencyAssetType
  url: string
  label: string
  owner_scope: 'site' | 'author'
  owner_id: string | null
}

const FETCH_TIMEOUT_MS = 12_000
const PUBLISHER_NAMES = ['SportsMockery', 'Sports Mockery', 'SM Edge', 'SportsMockery.com']
const EDITORIAL_KEYWORDS = [
  'editorial', 'standards', 'mission', 'ethics', 'corrections', 'integrity',
  'about us', 'who we are', 'our team', 'our story', 'philosophy', 'principles',
]
const COMPANY_KEYWORDS = [
  'about', 'who we are', 'our story', 'our team', 'mission', 'founded', 'launched',
  'started', 'history', 'company', 'team', 'staff',
]
const DISCLOSURE_KEYWORDS = ['affiliate', 'sponsored', 'disclosure', 'partner content', 'paid promotion', 'commission']
const CREDENTIAL_KEYWORDS = [
  'years', 'covering', 'reporter', 'writer', 'journalist', 'editor', 'beat',
  'graduate', 'school', 'university', 'previously', 'experience', 'former',
  'currently', 'columnist', 'analyst', 'host', 'podcast', 'newspaper',
]

function stripHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, ' ')
    .replace(/<head[\s\S]*?<\/head>/gi, ' ')
    .replace(/<svg[\s\S]*?<\/svg>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, ' ')
    .trim()
}

// Pull text content out of Next.js SSR pages. The visible text is in <main>,
// <article>, or just spread across <p> / <h*> tags. If <body> contains very
// little text after stripping (heavy client-side hydration), fall back to
// JSON blobs in <script id="__NEXT_DATA__"> which often carry server-rendered
// strings (titles, headings, prose).
function extractTextWithFallback(html: string): string {
  const stripped = stripHtml(html)
  if (stripped.length >= 200) return stripped
  // Fallback: pull text from __NEXT_DATA__
  const nextDataMatch = html.match(/<script[^>]+id=["']__NEXT_DATA__["'][^>]*>([\s\S]*?)<\/script>/i)
  if (nextDataMatch) {
    const json = nextDataMatch[1]
    // Cheap: extract every quoted string >= 12 chars; concat
    const texts = json.match(/"([^"\\]{12,}?)"/g) ?? []
    const joined = texts.map((s) => s.slice(1, -1)).join(' ').replace(/\\n/g, ' ').replace(/\s+/g, ' ')
    if (joined.length >= 200) return `${stripped} ${joined}`.trim()
  }
  return stripped
}

function containsAny(haystack: string, needles: string[]): boolean {
  const lower = haystack.toLowerCase()
  return needles.some((n) => lower.includes(n.toLowerCase()))
}

function hasEmailLink(html: string): boolean {
  return /href=["']mailto:[^"'@]+@[^"']+["']/i.test(html) || /[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(html)
}

function extractEmail(html: string): string | null {
  const linkMatch = html.match(/href=["']mailto:([^"']+)["']/i)
  if (linkMatch) return linkMatch[1].toLowerCase()
  const textMatch = html.match(/[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/)
  return textMatch ? textMatch[0].toLowerCase() : null
}

function hasNonGenericContact(html: string): boolean {
  const email = extractEmail(html)
  if (!email) return false
  const generic = ['@gmail.', '@yahoo.', '@hotmail.', '@outlook.', '@aol.', '@icloud.', '@proton.']
  if (generic.some((g) => email.includes(g))) return false
  return true
}

function hasContactForm(html: string): boolean {
  return /<form[^>]*>/i.test(html) || /<button[^>]*>[^<]*(send|submit|message)[^<]*<\/button>/i.test(html)
}

function hasPhone(text: string): boolean {
  return /(\+?1[\s.-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/.test(text)
}

function hasAddress(text: string): boolean {
  return /(\b\d+\s+[A-Z][a-z]+\s+(Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd)\b)|(\bChicago,?\s*IL\b)/.test(text)
}

function hasSocialLinks(html: string): boolean {
  return /(twitter|x|linkedin|facebook|instagram|threads|bsky)\.com\//i.test(html)
}

async function fetchHtml(url: string): Promise<string | null> {
  // Strip the fragment — fetching with #anchor is fine but avoids any
  // server-side surprises.
  const cleanUrl = url.split('#')[0]
  try {
    const res = await fetch(cleanUrl, {
      redirect: 'follow',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; SportsMockery-Edge-Bot/1.0)',
        'Accept': 'text/html,application/xhtml+xml',
      },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    })
    if (!res.ok) {
      console.warn(`[transparency-hydrator] ${cleanUrl} returned ${res.status}`)
      return null
    }
    return await res.text()
  } catch (e) {
    console.warn(`[transparency-hydrator] ${cleanUrl} fetch failed:`, e instanceof Error ? e.message : String(e))
    return null
  }
}

export class SmTransparencyHydrator implements TransparencyAssetHydrator {
  constructor(private readonly db: SupabaseClient) {}

  async hydrate(assetId: string): Promise<{
    assetType: TransparencyAssetType
    url: string
    label: string
    ownerScope: 'site' | 'author'
    ownerId: string | null
    extracted: TransparencyAssetInput
  } | null> {
    const { data: row, error } = await this.db
      .from('google_transparency_assets')
      .select('id,asset_type,url,label,owner_scope,owner_id')
      .eq('id', assetId)
      .maybeSingle()
    if (error || !row) return null
    const asset = row as AssetRow

    const html = await fetchHtml(asset.url)
    const exists = html !== null
    const safeHtml = html ?? ''
    const text = extractTextWithFallback(safeHtml)

    const isAuthorPage = asset.asset_type === 'author_page'
    const isAboutPage  = asset.asset_type === 'about_page'

    // Author bio: any meaningful text on an author page page-rendered means
    // there's a bio. If the route resolves and renders, the writer's name is
    // there at minimum. Treat ≥80 chars of text as bio.
    const hasBio = isAuthorPage && text.length >= 80

    // Author credentials: look for ANY beat / experience markers.
    const hasCredentials = isAuthorPage && (
      containsAny(text, CREDENTIAL_KEYWORDS) ||
      /\b\d+\+?\s+years?\b/i.test(text) ||
      /\bsince\s+\d{4}\b/i.test(text)
    )

    // Author contact/social: email, social link, OR a "contact" link.
    const hasContactOrSocial = isAuthorPage && (
      hasEmailLink(safeHtml) ||
      hasSocialLinks(safeHtml) ||
      /href=["'][^"']*\/contact[^"']*["']/i.test(safeHtml)
    )

    // Byline consistency: if the author page is reachable AND the writer's
    // display name appears anywhere in the page text, treat it as consistent.
    // (The stricter article-cross-check needs DB joins; this is a reasonable
    // proxy for whether the page is "real".)
    const consistentByline = isAuthorPage && exists && asset.label.length > 0
      && text.toLowerCase().includes(asset.label.toLowerCase())

    // About page: company info = any "about / mission / founded / team"
    // signal. Don't require an exact phrase.
    const hasCompanyInfo = isAboutPage
      ? (containsAny(text, COMPANY_KEYWORDS) || /\bfounded|launched\b/i.test(text))
      : containsAny(text, COMPANY_KEYWORDS)

    // Editorial context: any editorial / mission / standards keyword.
    const hasEditorialContext = containsAny(text, EDITORIAL_KEYWORDS)

    // Publisher identity: brand name appearing in visible text.
    const hasPublisherIdentity = containsAny(text, PUBLISHER_NAMES)

    // Contact info: email link, contact form, phone, address, OR a /contact
    // link. Any one of these is sufficient.
    const hasContactInfo = (
      hasEmailLink(safeHtml) ||
      hasContactForm(safeHtml) ||
      hasPhone(text) ||
      hasAddress(text) ||
      /href=["'][^"']*\/contact[^"']*["']/i.test(safeHtml)
    )

    const extracted: TransparencyAssetInput = {
      id: asset.id,
      assetType: asset.asset_type,
      url: asset.url,
      label: asset.label,
      ownerId: asset.owner_id,
      exists,
      hasPublisherIdentity,
      hasCompanyInfo,
      hasContactInfo,
      contactIsNonGeneric: hasNonGenericContact(safeHtml),
      hasEditorialContext,
      hasBio,
      hasCredentials,
      hasContactOrSocial,
      consistentByline,
      hasDisclosure: containsAny(text, DISCLOSURE_KEYWORDS),
      hasEditorialPolicy: asset.asset_type === 'editorial_policy_page' ? exists : containsAny(text, ['editorial standards', 'editorial policy', 'corrections policy', 'editorial guidelines']),
      needsDisclosure: false, // SM Edge doesn't currently run affiliate / sponsored content. Flip per-program.
    }

    return {
      assetType: asset.asset_type,
      url: asset.url,
      label: asset.label,
      ownerScope: asset.owner_scope,
      ownerId: asset.owner_id,
      extracted,
    }
  }
}
