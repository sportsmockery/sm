#!/usr/bin/env node
/**
 * PostIQ Comprehensive Test Script
 * Tests all PostIQ AI functions against /api/admin/ai
 * Outputs results to /docs/PostIQ_Test/results.md
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const BASE_URL = process.env.TEST_URL || 'https://test.sportsmockery.com'

const SAMPLE_TITLE = 'Bears Draft Strategy: Why Chicago Should Trade Up for a Top Wide Receiver'
const SAMPLE_CONTENT = `The Chicago Bears enter the 2026 NFL Draft with significant needs on offense. After a promising 2025 season that saw Caleb Williams develop into a franchise quarterback, the front office must now surround him with elite weapons. The Bears currently hold the 18th overall pick, but moving up could land them one of the top three receivers in this class. Trading future draft capital is always risky, but the window to maximize Williams' rookie contract is closing. Chicago's receiving corps ranked 24th in yards after catch last season, and adding a dynamic playmaker could transform this offense. The question isn't whether the Bears need a receiver — it's how aggressive they should be to get one. GM Ryan Poles has shown willingness to make bold moves, and this draft could define the Bears' trajectory for years to come. With cap space available and a young core in place, investing draft picks for immediate impact makes strategic sense. The Bears faithful deserve a team that goes all-in when the opportunity presents itself.`

const TEAMS = ['Bears', 'Bulls', 'Blackhawks', 'Cubs', 'White Sox']

const results = {}

async function callAPI(action, params = {}) {
  const start = Date.now()
  try {
    const body = { action, title: SAMPLE_TITLE, content: SAMPLE_CONTENT, category: 'Chicago Bears', ...params }
    const res = await fetch(`${BASE_URL}/api/admin/ai`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const elapsed = Date.now() - start
    if (!res.ok) {
      return { success: false, status: res.status, elapsed, error: `HTTP ${res.status}` }
    }
    const data = await res.json()
    return { success: true, status: res.status, elapsed, data }
  } catch (err) {
    return { success: false, status: 0, elapsed: Date.now() - start, error: err.message }
  }
}

function summarizeResponse(action, result) {
  if (!result.success) return result.error
  const d = result.data
  if (action === 'headlines') return `${(d.headlines || []).length} headlines`
  if (action === 'seo' || action === 'generate_seo') return d.seoTitle ? `SEO title: "${d.seoTitle.slice(0, 40)}..."` : 'No SEO data'
  if (action === 'ideas') return `${(d.ideas || []).length} ideas`
  if (action === 'grammar') return d.correctedContent ? `Corrected (${d.issues?.length || 0} issues)` : 'No corrections'
  if (action === 'excerpt') return d.excerpt ? `"${d.excerpt.slice(0, 50)}..."` : 'No excerpt'
  if (action === 'generate_chart') return d.chartData ? 'Chart generated' : 'No chart'
  if (action === 'generate_poll') return d.poll ? 'Poll generated' : (d.question ? 'Poll generated' : 'No poll')
  if (action === 'analyze_chart') return d.analysis ? `"${d.analysis.slice(0, 50)}..."` : 'No analysis'
  return JSON.stringify(d).slice(0, 60)
}

async function testAction(action, runs, extraParams = {}) {
  console.log(`Testing ${action} (${runs} runs)...`)
  const actionResults = []
  for (let i = 0; i < runs; i++) {
    const result = await callAPI(action, extraParams)
    actionResults.push({
      run: i + 1,
      params: Object.keys(extraParams).length ? JSON.stringify(extraParams) : '(default)',
      success: result.success,
      summary: summarizeResponse(action, result),
      elapsed: result.elapsed,
    })
    console.log(`  Run ${i + 1}: ${result.success ? 'OK' : 'FAIL'} (${result.elapsed}ms)`)
    // Small delay to avoid rate limiting
    await new Promise(r => setTimeout(r, 500))
  }
  return actionResults
}

async function main() {
  console.log(`\nPostIQ Test Suite - ${BASE_URL}\n${'='.repeat(50)}\n`)

  // Headlines: test with each team + auto (total 11 runs)
  results.headlines = []
  // Auto (no team override)
  results.headlines.push(...await testAction('headlines', 2))
  // Each team
  for (const team of TEAMS) {
    results.headlines.push(...await testAction('headlines', 2, { team }))
  }

  // SEO
  results.seo = await testAction('seo', 5)
  results.generate_seo = await testAction('generate_seo', 5)

  // Ideas with different teams
  results.ideas = []
  for (const team of TEAMS.slice(0, 3)) {
    results.ideas.push(...await testAction('ideas', 2, { team, category: `Chicago ${team}` }))
  }
  results.ideas.push(...await testAction('ideas', 4))

  // Grammar
  results.grammar = await testAction('grammar', 10)

  // Excerpt
  results.excerpt = await testAction('excerpt', 10)

  // Generate chart
  results.generate_chart = await testAction('generate_chart', 10)

  // Generate poll
  results.generate_poll = await testAction('generate_poll', 10)

  // Analyze chart
  results.analyze_chart = await testAction('analyze_chart', 10)

  // Write results
  let md = `# PostIQ Test Results\n\n`
  md += `**Date:** ${new Date().toISOString()}\n`
  md += `**Target:** ${BASE_URL}\n\n`

  for (const [action, runs] of Object.entries(results)) {
    const successes = runs.filter(r => r.success).length
    const avgTime = runs.length ? Math.round(runs.reduce((s, r) => s + r.elapsed, 0) / runs.length) : 0
    md += `## ${action}\n\n`
    md += `**Success Rate:** ${successes}/${runs.length} (${runs.length ? Math.round(100 * successes / runs.length) : 0}%)\n`
    md += `**Avg Response Time:** ${avgTime}ms\n\n`
    md += `| Run | Params | Result | Summary | Time (ms) |\n`
    md += `|-----|--------|--------|---------|----------|\n`
    for (const r of runs) {
      md += `| ${r.run} | ${r.params} | ${r.success ? 'OK' : 'FAIL'} | ${r.summary} | ${r.elapsed} |\n`
    }
    md += `\n`
  }

  // Overall summary
  const allRuns = Object.values(results).flat()
  const totalSuccess = allRuns.filter(r => r.success).length
  md += `## Overall Summary\n\n`
  md += `- **Total Tests:** ${allRuns.length}\n`
  md += `- **Successes:** ${totalSuccess}\n`
  md += `- **Failures:** ${allRuns.length - totalSuccess}\n`
  md += `- **Success Rate:** ${Math.round(100 * totalSuccess / allRuns.length)}%\n`
  md += `- **Avg Response Time:** ${Math.round(allRuns.reduce((s, r) => s + r.elapsed, 0) / allRuns.length)}ms\n`

  const outPath = path.resolve(__dirname, '../docs/PostIQ_Test/results.md')
  fs.writeFileSync(outPath, md)
  console.log(`\nResults written to ${outPath}`)
}

main().catch(console.error)
