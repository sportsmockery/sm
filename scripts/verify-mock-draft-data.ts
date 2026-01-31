/**
 * Mock Draft Data Verification Script
 *
 * Run with: npx ts-node scripts/verify-mock-draft-data.ts
 *
 * Verifies that all prospect data from Datalab is correctly accessible.
 */

import { createClient } from '@supabase/supabase-js'

// Datalab Supabase credentials
const DATALAB_URL = process.env.DATALAB_SUPABASE_URL || 'https://siwoqfzzcxmngnseyzpv.supabase.co'
const DATALAB_KEY = process.env.DATALAB_SUPABASE_SERVICE_KEY || ''

if (!DATALAB_KEY) {
  console.error('Missing DATALAB_SUPABASE_SERVICE_KEY environment variable')
  process.exit(1)
}

const supabase = createClient(DATALAB_URL, DATALAB_KEY)

interface VerificationResult {
  sport: string
  expected: { count: number; top1: string }
  actual: { count: number; top1: string; top3: string[] }
  passed: boolean
}

async function verifyProspects(): Promise<void> {
  console.log('\n========================================')
  console.log('  Mock Draft Data Verification')
  console.log('========================================\n')

  const expectations = [
    { league: 'NFL', minCount: 224, top1: 'Travis Hunter' },
    { league: 'NBA', minCount: 60, top1: 'Cooper Flagg' },
    { league: 'NHL', minCount: 224, top1: 'James Hagens' },
    { league: 'MLB', minCount: 200, top1: null }, // MLB top pick varies
  ]

  const results: VerificationResult[] = []

  for (const exp of expectations) {
    const { data, error } = await supabase
      .from('draft_prospects')
      .select('name, position, school_team, big_board_rank')
      .eq('league', exp.league)
      .eq('draft_year', 2026)
      .order('big_board_rank', { ascending: true })
      .limit(10)

    if (error) {
      console.error(`Error fetching ${exp.league}:`, error.message)
      results.push({
        sport: exp.league,
        expected: { count: exp.minCount, top1: exp.top1 || 'N/A' },
        actual: { count: 0, top1: 'ERROR', top3: [] },
        passed: false,
      })
      continue
    }

    const { count } = await supabase
      .from('draft_prospects')
      .select('*', { count: 'exact', head: true })
      .eq('league', exp.league)
      .eq('draft_year', 2026)

    const top1Name = data?.[0]?.name || 'NONE'
    const top3 = data?.slice(0, 3).map(p => `${p.big_board_rank}. ${p.name} (${p.position})`) || []

    const countPassed = (count || 0) >= exp.minCount
    const top1Passed = !exp.top1 || top1Name === exp.top1

    results.push({
      sport: exp.league,
      expected: { count: exp.minCount, top1: exp.top1 || 'N/A' },
      actual: { count: count || 0, top1: top1Name, top3 },
      passed: countPassed && top1Passed,
    })
  }

  // Print results
  console.log('VERIFICATION RESULTS:')
  console.log('----------------------------------------\n')

  for (const r of results) {
    const status = r.passed ? '✅ PASS' : '❌ FAIL'
    console.log(`${r.sport}: ${status}`)
    console.log(`  Count: ${r.actual.count} (expected: ${r.expected.count}+)`)
    console.log(`  Top 1: ${r.actual.top1} (expected: ${r.expected.top1})`)
    console.log(`  Top 3:`)
    r.actual.top3.forEach(p => console.log(`    - ${p}`))
    console.log()
  }

  // Summary
  const passed = results.filter(r => r.passed).length
  const total = results.length
  console.log('----------------------------------------')
  console.log(`SUMMARY: ${passed}/${total} sports passed`)
  console.log('----------------------------------------\n')

  if (passed < total) {
    process.exit(1)
  }
}

verifyProspects().catch(console.error)
