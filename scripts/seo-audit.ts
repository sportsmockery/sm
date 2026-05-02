/**
 * SEO audit — runs against STAGING_HOST (default test.sportsmockery.com).
 *
 * Steps:
 *   1. Fetch /sitemap_index.xml and child sitemaps; build URL list.
 *   2. Sample top 100 URLs; assert canonical, title, meta description, schema.
 *   3. Grep src/{app,components} for hardcoded www. or test. references —
 *      either leaks ranking equity from the apex once production ships.
 *
 * Writes audit/report.md with the issue list. Exits non-zero only when
 * config is broken; broken-link checking belongs to the lychee-action in
 * .github/workflows/seo-audit.yml (rate-limited per-IP, slow locally).
 *
 * Usage:
 *   npx tsx scripts/seo-audit.ts
 *   STAGING_HOST=https://staging.example.com npx tsx scripts/seo-audit.ts
 */

import { mkdirSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { execSync } from 'node:child_process'

const STAGING_HOST = (process.env.STAGING_HOST || 'https://test.sportsmockery.com').replace(/\/$/, '')
const SAMPLE_LIMIT = 100

interface Issue {
  url: string
  problem: string
}

const issues: Issue[] = []
const repoRoot = resolve(__dirname, '..')

function log(line: string) {
  console.log(line)
}

async function fetchText(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'sm-seo-audit/1.0' } })
    if (!res.ok) {
      issues.push({ url, problem: `HTTP ${res.status}` })
      return null
    }
    return await res.text()
  } catch (err) {
    issues.push({ url, problem: `fetch failed: ${(err as Error).message}` })
    return null
  }
}

function extractLocs(xml: string): string[] {
  const out: string[] = []
  const re = /<loc>([^<]+)<\/loc>/g
  let m: RegExpExecArray | null
  while ((m = re.exec(xml)) !== null) {
    out.push(m[1].trim())
  }
  return out
}

async function gatherSitemapUrls(): Promise<string[]> {
  // Try /sitemap_index.xml (post-cutover stack) first; fall back to legacy
  // /sitemap.xml so the audit works in both pre- and post-cutover states.
  log(`1/4 Fetching ${STAGING_HOST}/sitemap_index.xml…`)
  const indexXml = await fetchText(`${STAGING_HOST}/sitemap_index.xml`)
  const isXml = indexXml && indexXml.trim().startsWith('<?xml')

  if (isXml) {
    const childSitemaps = extractLocs(indexXml!)
    log(`   index → ${childSitemaps.length} child sitemap(s)`)
    const allUrls: string[] = []
    for (const childUrl of childSitemaps) {
      const childXml = await fetchText(childUrl)
      if (!childXml) continue
      const locs = extractLocs(childXml)
      log(`   ${childUrl.replace(STAGING_HOST, '')} → ${locs.length} URLs`)
      allUrls.push(...locs)
    }
    return rewriteToHost(allUrls)
  }

  log(`   sitemap_index.xml not yet served; falling back to /sitemap.xml`)
  const legacyXml = await fetchText(`${STAGING_HOST}/sitemap.xml`)
  if (!legacyXml || !legacyXml.trim().startsWith('<?xml')) {
    issues.push({ url: '/sitemap.xml', problem: 'no usable sitemap (neither index nor legacy)' })
    return []
  }
  return rewriteToHost(extractLocs(legacyXml))
}

function rewriteToHost(urls: string[]): string[] {
  const apexHost = 'https://sportsmockery.com'
  return urls.map((u) => (u.startsWith(apexHost) ? STAGING_HOST + u.slice(apexHost.length) : u))
}

async function auditUrl(url: string): Promise<void> {
  const html = await fetchText(url)
  if (!html) return

  const canonicalMatch = html.match(/<link[^>]+rel=["']canonical["'][^>]*href=["']([^"']+)["']/i)
  if (!canonicalMatch) {
    issues.push({ url, problem: 'missing canonical' })
  } else {
    const href = canonicalMatch[1]
    try {
      const u = new URL(href)
      if (u.host !== 'sportsmockery.com') {
        issues.push({ url, problem: `canonical host is ${u.host} (expected sportsmockery.com)` })
      }
    } catch {
      issues.push({ url, problem: `canonical href unparseable: ${href}` })
    }
  }

  if (!/<title>[^<]{20,}<\/title>/i.test(html)) {
    issues.push({ url, problem: 'missing or thin <title> (<20 chars)' })
  }

  if (!/<meta[^>]+name=["']description["'][^>]+content=["'][^"']{50,}["']/i.test(html)) {
    issues.push({ url, problem: 'missing or thin meta description (<50 chars)' })
  }

  const looksLikeArticle = /\/[^/]+\/[^/?#]+$/.test(new URL(url).pathname)
  if (looksLikeArticle && !html.includes('"@type":"NewsArticle"')) {
    issues.push({ url, problem: 'article URL missing NewsArticle JSON-LD' })
  }

  if (looksLikeArticle && !html.includes('"@type":"BreadcrumbList"')) {
    issues.push({ url, problem: 'article URL missing BreadcrumbList JSON-LD' })
  }
}

/**
 * CLS guard: every JSX <img in src/ must have width+height (or be inside an
 * aspect-ratio container — we check for the attributes only).  Regex-only img
 * references (content-utils, hooks) and eslint-disable lines are skipped.
 */
function grepImgMissingDimensions(): void {
  log(`3.5/4 Scanning JSX <img> tags for missing width/height…`)
  try {
    // Find all <img in .tsx/.jsx files, excluding test/regex-only contexts
    const out = execSync(
      `grep -rn --include='*.tsx' --include='*.jsx' '<img' src/ || true`,
      { cwd: repoRoot, encoding: 'utf8' }
    )
    const lines = out.split('\n').filter(Boolean)
    for (const line of lines) {
      // Skip eslint-disable comments, regex patterns, template literals used for HTML strings
      if (/eslint-disable|RegExp|\.match\(|\.test\(|\.replace\(|`<img/.test(line)) continue
      // Only care about JSX img tags (lowercase <img with props)
      if (!/<img\s/.test(line)) continue
      // Check for width AND height attributes
      const hasWidth = /\bwidth[={]/.test(line)
      const hasHeight = /\bheight[={]/.test(line)
      if (!hasWidth || !hasHeight) {
        const fileLine = line.split(':').slice(0, 2).join(':')
        issues.push({ url: fileLine, problem: '<img> missing explicit width/height (CLS risk)' })
      }
    }
  } catch {
    // grep returns 1 when no match
  }
}

/**
 * Files allowed to contain the www. origin — centralised WP constant only.
 * Add paths here (relative to repo root) if a legitimate exception arises.
 */
const WWW_DENYLIST_EXCEPTIONS = ['src/lib/wordpress.ts']

function grepHardcodedHosts(): void {
  log(`3/4 Scanning src for hardcoded host leaks…`)
  // www. is the legacy WordPress host — leaking it on apex sends crawlers in a redirect loop.
  // test. is the staging host — leaking it post-launch sends users to staging.
  const patterns = ['https://www.sportsmockery.com', 'https://test.sportsmockery.com']
  for (const pattern of patterns) {
    try {
      const out = execSync(
        `grep -rn --include='*.ts' --include='*.tsx' "${pattern}" src/ || true`,
        { cwd: repoRoot, encoding: 'utf8' }
      )
      const lines = out.split('\n').filter(Boolean)
      // Allow next.config.ts redirect-source patterns and denylisted files
      const real = lines.filter((l) => {
        if (l.includes('next.config')) return false
        return !WWW_DENYLIST_EXCEPTIONS.some((ex) => l.startsWith(ex))
      })
      if (real.length > 0) {
        for (const line of real) {
          issues.push({ url: line.split(':').slice(0, 2).join(':'), problem: `hardcoded ${pattern}` })
        }
      }
    } catch {
      // grep returns 1 when no match — fine
    }
  }
}

async function main() {
  const urls = await gatherSitemapUrls()
  log(`2/4 Sampling first ${Math.min(urls.length, SAMPLE_LIMIT)} URLs for canonical/title/schema…`)

  const sample = urls.slice(0, SAMPLE_LIMIT)
  for (let i = 0; i < sample.length; i += 5) {
    const batch = sample.slice(i, i + 5)
    await Promise.all(batch.map(auditUrl))
  }

  grepHardcodedHosts()
  grepImgMissingDimensions()

  log(`4/4 Writing audit/report.md`)
  const auditDir = resolve(repoRoot, 'audit')
  mkdirSync(auditDir, { recursive: true })

  const grouped: Record<string, Issue[]> = {}
  for (const issue of issues) {
    grouped[issue.problem] = grouped[issue.problem] ?? []
    grouped[issue.problem].push(issue)
  }

  const lines: string[] = [
    `# SEO Audit ${new Date().toISOString()}`,
    '',
    `**Host:** ${STAGING_HOST}`,
    `**URLs scanned:** ${sample.length} (of ${urls.length} in sitemaps)`,
    `**Issues:** ${issues.length}`,
    '',
  ]

  if (issues.length === 0) {
    lines.push('No issues. ✓')
  } else {
    for (const [problem, list] of Object.entries(grouped)) {
      lines.push(`## ${problem} (${list.length})`)
      for (const i of list.slice(0, 30)) {
        lines.push(`- ${i.url}`)
      }
      if (list.length > 30) lines.push(`- … (${list.length - 30} more)`)
      lines.push('')
    }
  }

  writeFileSync(resolve(auditDir, 'report.md'), lines.join('\n') + '\n')
  log(`Done. ${issues.length} issue(s). See audit/report.md`)

  // Exit non-zero on hardcoded host leaks or CLS violations (build gate).
  const hostLeaks = issues.filter((i) => i.problem.startsWith('hardcoded'))
  const clsViolations = issues.filter((i) => i.problem.includes('CLS risk'))
  if (hostLeaks.length > 0 || clsViolations.length > 0) process.exit(1)
}

main().catch((err) => {
  console.error('Fatal error:', err)
  process.exit(1)
})
