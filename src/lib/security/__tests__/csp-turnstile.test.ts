// Run with: npx tsx --test src/lib/security/__tests__/csp-turnstile.test.ts
//
// Asserts the CSP header allows Cloudflare Turnstile to load its script
// and inject its iframe. If `https://challenges.cloudflare.com` is missing
// from either `script-src` or `frame-src`, the widget renders blank and
// auth submissions break.

import { test } from 'node:test'
import { strict as assert } from 'node:assert'
import { buildCspHeader } from '../csp'

test('script-src allows challenges.cloudflare.com', () => {
  const { headerValue } = buildCspHeader('test-nonce')
  const scriptSrc = headerValue
    .split(';')
    .map((d) => d.trim())
    .find((d) => d.startsWith('script-src'))
  assert.ok(scriptSrc, 'script-src directive missing')
  assert.match(scriptSrc!, /https:\/\/challenges\.cloudflare\.com/)
})

test('frame-src allows challenges.cloudflare.com', () => {
  const { headerValue } = buildCspHeader('test-nonce')
  const frameSrc = headerValue
    .split(';')
    .map((d) => d.trim())
    .find((d) => d.startsWith('frame-src'))
  assert.ok(frameSrc, 'frame-src directive missing')
  assert.match(frameSrc!, /https:\/\/challenges\.cloudflare\.com/)
})

test('script-src still keeps strict-dynamic + nonce so Next.js loads', () => {
  const { headerValue } = buildCspHeader('abc123')
  const scriptSrc = headerValue
    .split(';')
    .map((d) => d.trim())
    .find((d) => d.startsWith('script-src'))!
  assert.match(scriptSrc, /'strict-dynamic'/)
  assert.match(scriptSrc, /'nonce-abc123'/)
})
