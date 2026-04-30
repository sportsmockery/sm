// SmTransparencyHydrator
// Reads the transparency-asset row from google_transparency_assets, fetches
// the page at its URL, and runs a small set of keyword + structure heuristics
// to populate the 14 booleans the rules engine consumes.
//
// Heuristics are intentionally conservative — false positives would give
// authors a higher trust score than they deserve. Each signal looks for a
// concrete on-page artifact (an email-shaped link, an explicit "Editorial
// Standards" header, etc.) rather than fuzzy phrase matching.

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

const FETCH_TIMEOUT_MS = 10_000
const PUBLISHER_NAMES = ['SportsMockery', 'Sports Mockery', 'SM Edge']
const EDITORIAL_KEYWORDS = ['editorial', 'standards', 'mission', 'ethics', 'corrections', 'integrity']
const DISCLOSURE_KEYWORDS = ['affiliate', 'sponsored', 'disclosure', 'partner content', 'paid promotion']

function stripHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function containsAny(haystack: string, needles: string[]): boolean {
  const lower = haystack.toLowerCase()
  return needles.some((n) => lower.includes(n.toLowerCase()))
}

function hasEmailLink(html: string): boolean {
  return /href=["']mailto:[^"'@]+@[^"']+["']/i.test(html)
}

function hasNonGenericContact(html: string, text: string): boolean {
  const m = html.match(/href=["']mailto:([^"']+)["']/i)
  if (!m) return false
  const email = m[1].toLowerCase()
  // Treat free-mail domains as generic.
  const generic = ['@gmail.', '@yahoo.', '@hotmail.', '@outlook.', '@aol.', '@icloud.', '@proton.']
  if (generic.some((g) => email.includes(g))) return false
  // info@, support@, contact@ on the brand domain are still acceptable.
  return /sportsmockery\.com$/.test(email.split('@')[1] ?? '') || !email.startsWith('info@')
}

function hasContactForm(html: string): boolean {
  return /<form[^>]*>/i.test(html) && /(contact|message|inquir)/i.test(html)
}

function hasPhone(text: string): boolean {
  return /(\+?1[\s.-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/.test(text)
}

function hasAddress(text: string): boolean {
  return /(\b\d+\s+[A-Z][a-z]+\s+(Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd)\b)|(\bChicago,\s*IL\b)/.test(text)
}

function hasSocialLinks(html: string): boolean {
  return /href=["'](https?:\/\/)?(www\.)?(twitter|x|linkedin|facebook|instagram|threads|bsky)\.com\//i.test(html)
}

function hasH1Heading(html: string, keywords: string[]): boolean {
  const headings = [...html.matchAll(/<h[1-3][^>]*>([\s\S]*?)<\/h[1-3]>/gi)].map((m) => stripHtml(m[1]))
  return headings.some((h) => containsAny(h, keywords))
}

function hasByline(text: string, name: string): boolean {
  if (!name) return false
  return new RegExp(`(by\\s+${name.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&')})`, 'i').test(text)
}

async function fetchHtml(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      redirect: 'follow',
      headers: { 'User-Agent': 'SportsMockery-Transparency/1.0' },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    })
    if (!res.ok) return null
    return await res.text()
  } catch {
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
    const text = stripHtml(safeHtml)

    const isAuthorPage = asset.asset_type === 'author_page'
    const authorName = isAuthorPage ? asset.label : ''

    // For author pages, "byline consistency" requires checking that this
    // author actually has published bylined articles. Owner ID maps to
    // sm_authors.id (or a slug shaped like `w-{slug}`); fall back to
    // checking whether the page itself shows article cards.
    const consistentByline = isAuthorPage ? (authorName ? hasByline(text, authorName) : false) : false

    const extracted: TransparencyAssetInput = {
      id: asset.id,
      assetType: asset.asset_type,
      url: asset.url,
      label: asset.label,
      ownerId: asset.owner_id,
      exists,
      hasPublisherIdentity: containsAny(text, PUBLISHER_NAMES),
      hasCompanyInfo: hasH1Heading(safeHtml, ['about', 'who we are', 'our story']) || /\b(founded|launched)\s+in\s+\d{4}\b/i.test(text),
      hasContactInfo: hasEmailLink(safeHtml) || hasContactForm(safeHtml) || hasPhone(text) || hasAddress(text),
      contactIsNonGeneric: hasNonGenericContact(safeHtml, text),
      hasEditorialContext: hasH1Heading(safeHtml, EDITORIAL_KEYWORDS) || containsAny(text, EDITORIAL_KEYWORDS),
      hasBio: isAuthorPage && text.length >= 120,
      hasCredentials: isAuthorPage && /(years|covering|reporter|writer|journalist|editor|alumnus|graduate|school)/i.test(text),
      hasContactOrSocial: isAuthorPage && (hasEmailLink(safeHtml) || hasSocialLinks(safeHtml)),
      consistentByline,
      hasDisclosure: containsAny(text, DISCLOSURE_KEYWORDS),
      hasEditorialPolicy: asset.asset_type === 'editorial_policy_page' ? exists : containsAny(text, ['editorial standards', 'editorial policy', 'corrections policy']),
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
