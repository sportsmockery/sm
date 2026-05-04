#!/usr/bin/env node
// Re-fetch the upstream disposable-email-domains list and regenerate
// src/lib/security/data/disposable-email-domains.{txt,ts}.
//
// Usage:  node scripts/refresh-disposable-domains.mjs
//
// The runtime cron at /api/cron/refresh-disposable-domains updates the
// in-memory list without touching disk; this script is for refreshing
// the *bundled* snapshot before a deploy.

import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = path.resolve(__dirname, '..')

const UPSTREAM =
  'https://raw.githubusercontent.com/disposable-email-domains/disposable-email-domains/main/disposable_email_blocklist.conf'

const TXT_PATH = path.join(REPO_ROOT, 'src/lib/security/data/disposable-email-domains.txt')
const TS_PATH = path.join(REPO_ROOT, 'src/lib/security/data/disposable-email-domains.ts')

async function main() {
  console.log('Fetching', UPSTREAM)
  const res = await fetch(UPSTREAM)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const raw = await res.text()

  const domains = Array.from(
    new Set(
      raw
        .split(/\r?\n/)
        .map((s) => s.trim().toLowerCase())
        .filter((s) => s && !s.startsWith('#')),
    ),
  ).sort()

  if (domains.length < 1000) {
    throw new Error(`Suspiciously small list (${domains.length}) — refusing to write`)
  }

  await fs.writeFile(TXT_PATH, domains.join('\n') + '\n', 'utf8')

  const tsBody = `// AUTO-GENERATED — do not edit by hand.
// Source: https://github.com/disposable-email-domains/disposable-email-domains
// Refresh script: scripts/refresh-disposable-domains.mjs (also via /api/cron/refresh-disposable-domains)

export const DISPOSABLE_EMAIL_DOMAINS: readonly string[] = Object.freeze([
${domains.map((d) => `  ${JSON.stringify(d)},`).join('\n')}
])
`
  await fs.writeFile(TS_PATH, tsBody, 'utf8')

  console.log(`Wrote ${domains.length} domains to ${TXT_PATH} and ${TS_PATH}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
