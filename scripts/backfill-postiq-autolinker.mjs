#!/usr/bin/env node
/**
 * backfill-postiq-autolinker.mjs
 *
 * One-time backfill: runs the PostIQ auto-linker over the most recent N
 * published posts on test.sportsmockery.com. Safe to re-run (the linker is
 * idempotent — already-linked text inside <a> tags is skipped).
 *
 * Usage:
 *   node scripts/backfill-postiq-autolinker.mjs [--limit=100] [--dry-run]
 *
 * Env (read from .env.local):
 *   POSTIQ_INTERNAL_KEY — must match the DataLab secret.
 *   POSTIQ_BASE_URL     — defaults to https://datalab.sportsmockery.com.
 */

import fs from 'node:fs'
import path from 'node:path'
import { createClient } from '@supabase/supabase-js'

// ---------------- env loader ----------------

const ENV_PATH = path.join(process.cwd(), '.env.local')
if (fs.existsSync(ENV_PATH)) {
  const text = fs.readFileSync(ENV_PATH, 'utf8')
  for (const line of text.split('\n')) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/)
    if (!m) continue
    let value = m[2]
    if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1)
    if (!process.env[m[1]]) process.env[m[1]] = value
  }
}

const POSTIQ_BASE_URL =
  process.env.POSTIQ_BASE_URL || process.env.DATALAB_API_URL || 'https://datalab.sportsmockery.com'
const POSTIQ_KEY = process.env.POSTIQ_INTERNAL_KEY

if (!POSTIQ_KEY) {
  console.error('FATAL: POSTIQ_INTERNAL_KEY missing from .env.local')
  process.exit(1)
}

// ---------------- args ----------------

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const [k, v] = a.replace(/^--/, '').split('=')
    return [k, v ?? true]
  })
)
const LIMIT = Number(args.limit ?? 100)
const DRY_RUN = !!args['dry-run']

console.log(`PostIQ auto-link backfill: limit=${LIMIT}, dry-run=${DRY_RUN}`)
console.log(`Endpoint: ${POSTIQ_BASE_URL}/api/v2/postiq/suggest\n`)

// ---------------- supabase ----------------
// Same SM main DB the .env.local pulls from. Service role to bypass RLS.

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
    'https://izwhcuccuwvlqqhpprbb.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml6d2hjdWNjdXd2bHFxaHBwcmJiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Nzk1MTQwNSwiZXhwIjoyMDgzNTI3NDA1fQ.a6eJZOaq8vI18giqTWU951cWBp6LzfXmf6pkPhCQUxc'
)

// ---------------- block helpers (mirrors src/lib/postiq/auto-link.ts) ----------------

const BLOCK_OPEN = '<!-- SM_BLOCKS -->'
const BLOCK_CLOSE = '<!-- /SM_BLOCKS -->'
const SENTINEL = (i) => `<!--SM_AL_${i}-->`

function isBlockContent(content) {
  return typeof content === 'string' && content.trimStart().startsWith(BLOCK_OPEN)
}
function parseDocument(content) {
  if (!isBlockContent(content)) return null
  try {
    const json = content.replace(BLOCK_OPEN, '').replace(BLOCK_CLOSE, '').trim()
    return JSON.parse(json)
  } catch {
    return null
  }
}
function serializeDocument(doc) {
  return `${BLOCK_OPEN}${JSON.stringify(doc)}${BLOCK_CLOSE}`
}

function textFieldsForBlock(block) {
  switch (block.type) {
    case 'paragraph':
    case 'analysis':
    case 'tldr':
    case 'key-facts':
    case 'why-it-matters':
    case 'whats-next':
      return block.data?.html ? [{ field: 'html', value: block.data.html }] : []
    case 'heading':
      return block.data?.text ? [{ field: 'text', value: block.data.text }] : []
    case 'scout-insight':
      return block.data?.insight ? [{ field: 'insight', value: block.data.insight }] : []
    case 'hot-take':
    case 'update':
      return block.data?.text ? [{ field: 'text', value: block.data.text }] : []
    default:
      return []
  }
}

function splitBySentinels(joined, count) {
  const out = []
  for (let i = 0; i < count; i++) {
    const start = joined.indexOf(SENTINEL(i))
    if (start === -1) return null
    const after = start + SENTINEL(i).length
    const next = i + 1 < count ? joined.indexOf(SENTINEL(i + 1), after) : joined.length
    if (next === -1) return null
    out.push(joined.slice(after, next))
  }
  return out
}

// ---------------- linker call ----------------

async function callLinker(html, postId) {
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), 15_000)
  try {
    const res = await fetch(`${POSTIQ_BASE_URL}/api/v2/postiq/suggest`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-postiq-internal-key': POSTIQ_KEY,
      },
      body: JSON.stringify({
        task: 'auto-link',
        articleContent: html,
        user_id: `backfill:${postId}`,
        linkClass: 'post-internal-link',
        openInNewTab: false,
      }),
      signal: ctrl.signal,
    })
    if (!res.ok) {
      const txt = await res.text().catch(() => '')
      return { ok: false, status: res.status, error: txt.slice(0, 200) }
    }
    const data = await res.json()
    return {
      ok: true,
      linkedHtml: typeof data.linkedHtml === 'string' ? data.linkedHtml : html,
      linkCount: typeof data.linkCount === 'number' ? data.linkCount : 0,
    }
  } catch (err) {
    return { ok: false, error: String(err) }
  } finally {
    clearTimeout(timer)
  }
}

async function autoLinkContent(content, postId) {
  if (!content) return { content, linkCount: 0, changed: false }

  if (!isBlockContent(content)) {
    const r = await callLinker(content, postId)
    if (!r.ok) return { content, linkCount: 0, changed: false, error: r.error }
    return {
      content: r.linkedHtml,
      linkCount: r.linkCount,
      changed: r.linkedHtml !== content,
    }
  }

  const doc = parseDocument(content)
  if (!doc?.blocks?.length) return { content, linkCount: 0, changed: false }

  const targets = []
  doc.blocks.forEach((block, idx) => {
    for (const f of textFieldsForBlock(block)) {
      targets.push({ blockIdx: idx, field: f.field, value: f.value })
    }
  })
  if (targets.length === 0) return { content, linkCount: 0, changed: false }

  const joined = targets.map((t, i) => `${SENTINEL(i)}${t.value}`).join('')
  const r = await callLinker(joined, postId)
  if (!r.ok) return { content, linkCount: 0, changed: false, error: r.error }
  if (r.linkedHtml === joined) {
    return { content, linkCount: 0, changed: false }
  }

  const pieces = splitBySentinels(r.linkedHtml, targets.length)
  if (!pieces) {
    return {
      content,
      linkCount: 0,
      changed: false,
      error: 'sentinel split mismatch',
    }
  }

  const blocks = doc.blocks.map((block, idx) => {
    const updates = targets
      .map((t, i) => ({ ...t, linked: pieces[i] }))
      .filter((t) => t.blockIdx === idx && t.linked !== t.value)
    if (updates.length === 0) return block
    const next = { ...block, data: { ...block.data } }
    for (const u of updates) next.data[u.field] = u.linked
    return next
  })

  return {
    content: serializeDocument({ ...doc, blocks }),
    linkCount: r.linkCount,
    changed: true,
  }
}

// ---------------- main ----------------

async function main() {
  const { data: posts, error } = await supabase
    .from('sm_posts')
    .select('id, title, slug, content, published_at')
    .eq('status', 'published')
    .order('published_at', { ascending: false, nullsFirst: false })
    .limit(LIMIT)

  if (error) {
    console.error('FATAL: post query failed:', error.message)
    process.exit(1)
  }
  if (!posts?.length) {
    console.log('No published posts found.')
    return
  }

  console.log(`Loaded ${posts.length} posts. Starting...\n`)

  let scanned = 0
  let updated = 0
  let unchanged = 0
  let failed = 0
  let totalLinks = 0
  const failures = []

  for (const post of posts) {
    scanned++
    const label = `[${scanned}/${posts.length}] ${post.id} "${(post.title || '').slice(0, 60)}"`
    if (!post.content || !post.content.trim()) {
      console.log(`${label} — empty content, skip`)
      continue
    }

    const result = await autoLinkContent(post.content, post.id)
    if (result.error) {
      failed++
      failures.push({ id: post.id, slug: post.slug, error: result.error })
      console.log(`${label} — ERROR: ${result.error}`)
      continue
    }

    if (!result.changed) {
      unchanged++
      console.log(`${label} — unchanged (linker found nothing to link)`)
      continue
    }

    totalLinks += result.linkCount
    if (DRY_RUN) {
      console.log(`${label} — would insert ${result.linkCount} link(s) [dry-run]`)
      continue
    }

    const { error: upErr } = await supabase
      .from('sm_posts')
      .update({ content: result.content, updated_at: new Date().toISOString() })
      .eq('id', post.id)

    if (upErr) {
      failed++
      failures.push({ id: post.id, slug: post.slug, error: upErr.message })
      console.log(`${label} — DB UPDATE FAILED: ${upErr.message}`)
      continue
    }

    updated++
    console.log(`${label} — patched, ${result.linkCount} link(s)`)
    // small throttle to avoid hammering DataLab
    await new Promise((r) => setTimeout(r, 150))
  }

  console.log('\n────────────── SUMMARY ──────────────')
  console.log(`Scanned:   ${scanned}`)
  console.log(`Updated:   ${updated}${DRY_RUN ? ' (dry-run, nothing written)' : ''}`)
  console.log(`Unchanged: ${unchanged}`)
  console.log(`Failed:    ${failed}`)
  console.log(`Total links inserted: ${totalLinks}`)
  if (failures.length) {
    console.log('\nFailures:')
    for (const f of failures) console.log(`  ${f.id}  ${f.slug}  — ${f.error}`)
  }
}

main().catch((err) => {
  console.error('FATAL:', err)
  process.exit(1)
})
