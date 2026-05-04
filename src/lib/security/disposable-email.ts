// Disposable / temporary email domain blocker.
//
// The bundled list at ./data/disposable-email-domains.ts is generated
// from the upstream maintained list at
// https://github.com/disposable-email-domains/disposable-email-domains
// (re-run scripts/refresh-disposable-domains.mjs to update). It ships
// with the build so signups never depend on a live fetch.
//
// /api/cron/refresh-disposable-domains can swap in a fresh upstream
// snapshot at runtime via setDisposableDomains() — failures fall back
// to the bundled list silently.

import { DISPOSABLE_EMAIL_DOMAINS } from './data/disposable-email-domains'

const BUNDLED_DOMAINS: ReadonlySet<string> = new Set(DISPOSABLE_EMAIL_DOMAINS)

let runtimeDomains: ReadonlySet<string> | null = null

export function setDisposableDomains(list: Iterable<string>): number {
  const set = new Set<string>()
  for (const raw of list) {
    const trimmed = String(raw).trim().toLowerCase()
    if (!trimmed || trimmed.startsWith('#')) continue
    set.add(trimmed)
  }
  // Refuse a suspiciously small list — almost always a partial fetch
  // and would silently let disposable signups through.
  if (set.size < 1000) return 0
  runtimeDomains = set
  return set.size
}

export function getDisposableDomains(): ReadonlySet<string> {
  return runtimeDomains ?? BUNDLED_DOMAINS
}

export function getDisposableDomainCount(): number {
  return getDisposableDomains().size
}

// Loose RFC-5322 shape: localpart@domain. Just enough to extract a
// domain and reject obvious garbage — Supabase validates downstream.
const EMAIL_SHAPE = /^[^\s@]+@([^\s@]+\.[^\s@]+)$/

export function isValidEmail(email: unknown): boolean {
  if (typeof email !== 'string') return false
  const trimmed = email.trim()
  if (trimmed.length === 0 || trimmed.length > 254) return false
  return EMAIL_SHAPE.test(trimmed)
}

export function extractDomain(email: string): string | null {
  if (typeof email !== 'string') return null
  const match = email.trim().toLowerCase().match(EMAIL_SHAPE)
  return match ? match[1] : null
}

// Returns true if the email's domain (or any parent domain) is on the
// disposable list. Subdomain matching ensures `foo.mailinator.com` is
// caught by an entry for `mailinator.com`.
export function isDisposableEmail(email: string): boolean {
  const domain = extractDomain(email)
  if (!domain) return false

  const list = getDisposableDomains()
  if (list.has(domain)) return true

  const labels = domain.split('.')
  for (let i = 1; i < labels.length - 1; i++) {
    const parent = labels.slice(i).join('.')
    if (list.has(parent)) return true
  }
  return false
}

export const DISPOSABLE_EMAIL_ERROR =
  "This email provider isn't supported. Please use a permanent email address."
