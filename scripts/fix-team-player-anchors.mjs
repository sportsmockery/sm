#!/usr/bin/env node
/**
 * fix-team-player-anchors.mjs
 *
 * Sweeps published posts and rewrites any anchor whose visible text matches
 * a Chicago team or active-roster player full name to point at the canonical
 * hub or player page URL.
 *
 *   - Chicago Bears  → https://test.sportsmockery.com/chicago-bears
 *   - Caleb Williams → https://test.sportsmockery.com/chicago-bears/players/caleb-williams
 *   - … same shape for all 5 teams.
 *
 * Idempotent. Anchors whose href already matches the canonical URL are left
 * alone.
 *
 * Usage:
 *   node scripts/fix-team-player-anchors.mjs [--limit=100] [--dry-run]
 */

import fs from 'node:fs'
import path from 'node:path'
import { createClient } from '@supabase/supabase-js'

// ---------------- env loader ----------------

const ENV_PATH = path.join(process.cwd(), '.env.local')
if (fs.existsSync(ENV_PATH)) {
  for (const line of fs.readFileSync(ENV_PATH, 'utf8').split('\n')) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/)
    if (!m) continue
    let v = m[2]
    if (v.startsWith('"') && v.endsWith('"')) v = v.slice(1, -1)
    if (!process.env[m[1]]) process.env[m[1]] = v
  }
}

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const [k, v] = a.replace(/^--/, '').split('=')
    return [k, v ?? true]
  })
)
const LIMIT = Number(args.limit ?? 100)
const DRY_RUN = !!args['dry-run']
const BASE = 'https://test.sportsmockery.com'

// ---------------- supabase clients ----------------

const sm = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://izwhcuccuwvlqqhpprbb.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml6d2hjdWNjdXd2bHFxaHBwcmJiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Nzk1MTQwNSwiZXhwIjoyMDgzNTI3NDA1fQ.a6eJZOaq8vI18giqTWU951cWBp6LzfXmf6pkPhCQUxc'
)
const dl = createClient(
  process.env.DATALAB_SUPABASE_URL || 'https://siwoqfzzcxmngnseyzpv.supabase.co',
  process.env.DATALAB_SUPABASE_SERVICE_ROLE_KEY ||
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpd29xZnp6Y3htbmduc2V5enB2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzY0OTQ4MCwiZXhwIjoyMDgzMjI1NDgwfQ.5-dQVO_B3F-mnljmLEcvhIS_Ag1C85X-Gl2u44rkR8I'
)

// ---------------- dictionary ----------------

function slugifyName(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

const TEAMS = [
  { fullName: 'Chicago Bears', slug: 'chicago-bears', table: 'bears_players', filter: ['is_active', true] },
  // Bulls: is_current_bulls is currently all false; auto-linker uses status='active'.
  { fullName: 'Chicago Bulls', slug: 'chicago-bulls', table: 'bulls_players', filter: ['status', 'active'] },
  { fullName: 'Chicago Blackhawks', slug: 'chicago-blackhawks', table: 'blackhawks_players', filter: ['is_active', true] },
  { fullName: 'Chicago Cubs', slug: 'chicago-cubs', table: 'cubs_players', filter: ['is_active', true] },
  { fullName: 'Chicago White Sox', slug: 'chicago-white-sox', table: 'whitesox_players', filter: ['is_active', true] },
]

// dict: lowercase full name → { canonicalUrl, displayName, kind: 'team'|'player' }
const dict = new Map()
for (const t of TEAMS) {
  dict.set(t.fullName.toLowerCase(), {
    canonicalUrl: `${BASE}/${t.slug}`,
    displayName: t.fullName,
    kind: 'team',
  })
}

console.log('Loading active rosters from DataLab...')
for (const t of TEAMS) {
  const { data, error } = await dl
    .from(t.table)
    .select('name, first_name, last_name, display_name')
    .eq(t.filter[0], t.filter[1])
  if (error) {
    console.error(`  ${t.table} failed: ${error.message}`)
    continue
  }
  let added = 0
  for (const row of data || []) {
    const name =
      row.display_name ||
      row.name ||
      (row.first_name && row.last_name ? `${row.first_name} ${row.last_name}` : null)
    if (!name || !/\s/.test(name)) continue // skip single-token names
    const lower = name.toLowerCase().trim()
    if (dict.has(lower)) continue // first team wins (matches DataLab linker)
    dict.set(lower, {
      canonicalUrl: `${BASE}/${t.slug}/players/${slugifyName(name)}`,
      displayName: name,
      kind: 'player',
    })
    added++
  }
  console.log(`  ${t.table}: ${added} active players`)
}
console.log(`Dictionary: ${dict.size} entries (${TEAMS.length} teams + active players)\n`)

// ---------------- block helpers ----------------

const BLOCK_OPEN = '<!-- SM_BLOCKS -->'
const BLOCK_CLOSE = '<!-- /SM_BLOCKS -->'

function isBlockContent(c) {
  return typeof c === 'string' && c.trimStart().startsWith(BLOCK_OPEN)
}
function parseDoc(c) {
  if (!isBlockContent(c)) return null
  try {
    return JSON.parse(c.replace(BLOCK_OPEN, '').replace(BLOCK_CLOSE, '').trim())
  } catch {
    return null
  }
}
function serializeDoc(d) {
  return `${BLOCK_OPEN}${JSON.stringify(d)}${BLOCK_CLOSE}`
}

// Strip nested tags inside an anchor and decode the few entities we care about.
function visibleText(html) {
  return html
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim()
}

// Rewrite mis-targeted anchors in a single HTML string. Returns
// { html, changed: number, fixes: [{name, oldHref, newHref}] }.
function fixAnchors(html) {
  if (!html || !html.includes('<a')) return { html, changed: 0, fixes: [] }

  const fixes = []
  const ANCHOR_RE = /<a\b([^>]*)>([\s\S]*?)<\/a>/gi
  let changed = 0

  const out = html.replace(ANCHOR_RE, (full, attrs, inner) => {
    const text = visibleText(inner)
    const lookup = dict.get(text.toLowerCase())
    if (!lookup) return full

    const hrefMatch = attrs.match(/\bhref\s*=\s*"([^"]*)"/i) || attrs.match(/\bhref\s*=\s*'([^']*)'/i)
    const currentHref = hrefMatch ? hrefMatch[1] : ''

    // Treat apex+test as equivalent so we don't churn already-correct links.
    const normalize = (h) =>
      h
        .replace(/^https?:\/\/(www\.)?sportsmockery\.com/, BASE)
        .replace(/\/$/, '')
    if (normalize(currentHref) === normalize(lookup.canonicalUrl)) return full

    let newAttrs
    if (hrefMatch) {
      newAttrs = attrs.replace(/\bhref\s*=\s*("[^"]*"|'[^']*')/i, `href="${lookup.canonicalUrl}"`)
    } else {
      newAttrs = ` href="${lookup.canonicalUrl}"${attrs}`
    }
    changed++
    fixes.push({ name: lookup.displayName, oldHref: currentHref, newHref: lookup.canonicalUrl })
    return `<a${newAttrs}>${inner}</a>`
  })

  return { html: out, changed, fixes }
}

// ---------------- post sweep ----------------

const { data: posts, error } = await sm
  .from('sm_posts')
  .select('id, title, slug, content')
  .eq('status', 'published')
  .order('published_at', { ascending: false, nullsFirst: false })
  .limit(LIMIT)

if (error) {
  console.error('FATAL: post query failed:', error.message)
  process.exit(1)
}
if (!posts?.length) {
  console.log('No published posts found.')
  process.exit(0)
}

console.log(`Loaded ${posts.length} posts. Scanning...\n`)

let updated = 0
let unchanged = 0
let failed = 0
let totalFixes = 0
const failures = []
const sampleFixes = []

for (let i = 0; i < posts.length; i++) {
  const p = posts[i]
  const label = `[${i + 1}/${posts.length}] ${p.id} "${(p.title || '').slice(0, 60)}"`
  const c = p.content || ''
  if (!c.trim()) {
    unchanged++
    continue
  }

  let newContent = c
  let fixesInPost = 0
  const collected = []

  if (isBlockContent(c)) {
    const doc = parseDoc(c)
    if (!doc?.blocks?.length) {
      unchanged++
      console.log(`${label} — no blocks`)
      continue
    }
    const blocks = doc.blocks.map((block) => {
      if (!block?.data) return block
      const next = { ...block, data: { ...block.data } }
      for (const field of ['html', 'text', 'insight']) {
        const v = next.data[field]
        if (typeof v !== 'string' || !v.includes('<a')) continue
        const r = fixAnchors(v)
        if (r.changed > 0) {
          next.data[field] = r.html
          fixesInPost += r.changed
          collected.push(...r.fixes)
        }
      }
      return next
    })
    if (fixesInPost === 0) {
      unchanged++
      console.log(`${label} — unchanged`)
      continue
    }
    newContent = serializeDoc({ ...doc, blocks })
  } else {
    const r = fixAnchors(c)
    fixesInPost = r.changed
    collected.push(...r.fixes)
    if (fixesInPost === 0) {
      unchanged++
      console.log(`${label} — unchanged`)
      continue
    }
    newContent = r.html
  }

  totalFixes += fixesInPost
  if (sampleFixes.length < 8) sampleFixes.push({ postId: p.id, fixes: collected.slice(0, 3) })

  if (DRY_RUN) {
    console.log(`${label} — would fix ${fixesInPost} anchor(s) [dry-run]`)
    continue
  }

  const { error: upErr } = await sm
    .from('sm_posts')
    .update({ content: newContent, updated_at: new Date().toISOString() })
    .eq('id', p.id)
  if (upErr) {
    failed++
    failures.push({ id: p.id, slug: p.slug, error: upErr.message })
    console.log(`${label} — DB UPDATE FAILED: ${upErr.message}`)
    continue
  }

  updated++
  console.log(`${label} — fixed ${fixesInPost} anchor(s)`)
}

console.log('\n────────────── SUMMARY ──────────────')
console.log(`Scanned:   ${posts.length}`)
console.log(`Updated:   ${updated}${DRY_RUN ? ' (dry-run, nothing written)' : ''}`)
console.log(`Unchanged: ${unchanged}`)
console.log(`Failed:    ${failed}`)
console.log(`Total anchors rewritten: ${totalFixes}`)

if (sampleFixes.length) {
  console.log('\nSample rewrites:')
  for (const s of sampleFixes) {
    for (const f of s.fixes) {
      console.log(`  post ${s.postId}: "${f.name}"`)
      console.log(`    old: ${f.oldHref}`)
      console.log(`    new: ${f.newHref}`)
    }
  }
}
if (failures.length) {
  console.log('\nFailures:')
  for (const f of failures) console.log(`  ${f.id} ${f.slug} — ${f.error}`)
}
