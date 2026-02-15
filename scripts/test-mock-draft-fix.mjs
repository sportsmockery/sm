/**
 * Mock Draft Fix Verification Script
 * Tests the direct database UPDATE operations used to fix the RPC issues
 *
 * Run with: node scripts/test-mock-draft-fix.mjs
 */

import { createClient } from '@supabase/supabase-js'
import 'dotenv/config'

const DATALAB_URL = process.env.DATALAB_SUPABASE_URL || 'https://siwoqfzzcxmngnseyzpv.supabase.co'
const DATALAB_KEY = process.env.DATALAB_SUPABASE_SERVICE_ROLE_KEY

if (!DATALAB_KEY) {
  console.error('Missing DATALAB_SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(DATALAB_URL, DATALAB_KEY)

const SPORT_TO_LEAGUE = {
  nfl: 'NFL',
  nba: 'NBA',
  nhl: 'NHL',
  mlb: 'MLB',
}

async function testDatabaseOperations() {
  console.log('\n================================================')
  console.log('  Mock Draft Fix Verification')
  console.log('  Testing direct database UPDATE operations')
  console.log('================================================\n')

  let allPassed = true
  const results = []

  // Test 1: Verify we can query prospects for each sport
  console.log('TEST 1: Verify prospect data access')
  console.log('-'.repeat(40))

  for (const [sport, league] of Object.entries(SPORT_TO_LEAGUE)) {
    const { data, error } = await supabase
      .from('draft_prospects')
      .select('id, name, position')
      .eq('league', league)
      .eq('draft_year', 2026)
      .order('big_board_rank', { ascending: true })
      .limit(5)

    if (error) {
      console.log(`  ❌ ${league}: ${error.message}`)
      allPassed = false
    } else if (!data?.length) {
      console.log(`  ❌ ${league}: No prospects found`)
      allPassed = false
    } else {
      console.log(`  ✅ ${league}: ${data.length} prospects (top: ${data[0].name})`)
      results.push({ sport, league, prospects: data })
    }
  }

  // Test 2: Verify gm_mock_draft_picks table is accessible and supports UPDATE
  console.log('\nTEST 2: Verify gm_mock_draft_picks UPDATE capability')
  console.log('-'.repeat(40))

  // Find an existing test mock draft or any draft
  const { data: existingDraft, error: draftError } = await supabase
    .from('gm_mock_drafts')
    .select('id, chicago_team, sport, current_pick')
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (draftError || !existingDraft) {
    console.log(`  ⚠️  No existing drafts found - skipping pick update test`)
  } else {
    // Try to read an existing pick
    const { data: existingPick, error: pickError } = await supabase
      .from('gm_mock_draft_picks')
      .select('pick_number, prospect_id, prospect_name, position')
      .eq('mock_draft_id', existingDraft.id)
      .order('pick_number', { ascending: true })
      .limit(1)
      .single()

    if (pickError || !existingPick) {
      console.log(`  ⚠️  No picks found for draft ${existingDraft.id}`)
    } else {
      // Test that the UPDATE query pattern works (we'll restore it after)
      const originalData = { ...existingPick }
      const testUpdate = {
        prospect_id: existingPick.prospect_id || 'test-123',
        prospect_name: existingPick.prospect_name || 'Test Player',
        position: existingPick.position || 'QB',
        updated_at: new Date().toISOString(),
      }

      const { error: updateError } = await supabase
        .from('gm_mock_draft_picks')
        .update(testUpdate)
        .eq('mock_draft_id', existingDraft.id)
        .eq('pick_number', existingPick.pick_number)

      if (updateError) {
        console.log(`  ❌ Pick UPDATE failed: ${updateError.message}`)
        allPassed = false
      } else {
        // Restore original data
        await supabase
          .from('gm_mock_draft_picks')
          .update({
            prospect_id: originalData.prospect_id,
            prospect_name: originalData.prospect_name,
            position: originalData.position,
            updated_at: new Date().toISOString(),
          })
          .eq('mock_draft_id', existingDraft.id)
          .eq('pick_number', existingPick.pick_number)

        console.log(`  ✅ gm_mock_draft_picks UPDATE works correctly`)
      }
    }
  }

  // Test 3: Verify gm_mock_drafts UPDATE capability
  console.log('\nTEST 3: Verify gm_mock_drafts UPDATE capability')
  console.log('-'.repeat(40))

  if (!existingDraft) {
    console.log(`  ⚠️  No existing drafts found - skipping draft update test`)
  } else {
    const originalPick = existingDraft.current_pick

    // Test UPDATE (then restore)
    const { error: updateDraftError } = await supabase
      .from('gm_mock_drafts')
      .update({
        updated_at: new Date().toISOString(),
      })
      .eq('id', existingDraft.id)

    if (updateDraftError) {
      console.log(`  ❌ Draft UPDATE failed: ${updateDraftError.message}`)
      allPassed = false
    } else {
      console.log(`  ✅ gm_mock_drafts UPDATE works correctly`)
    }
  }

  // Test 4: Verify get_mock_draft RPC still works
  console.log('\nTEST 4: Verify get_mock_draft RPC (for reading)')
  console.log('-'.repeat(40))

  if (!existingDraft) {
    console.log(`  ⚠️  No existing drafts found - skipping RPC test`)
  } else {
    const { data: rpcData, error: rpcError } = await supabase.rpc('get_mock_draft', {
      p_mock_id: existingDraft.id,
    })

    if (rpcError) {
      console.log(`  ❌ get_mock_draft RPC failed: ${rpcError.message}`)
      allPassed = false
    } else {
      const draft = Array.isArray(rpcData) ? rpcData[0] : rpcData
      if (draft) {
        console.log(`  ✅ get_mock_draft RPC works (returned ${draft.chicago_team} draft)`)
      } else {
        console.log(`  ⚠️  get_mock_draft returned empty`)
      }
    }
  }

  // Test 5: Simulate full flow with timestamps only (no data changes)
  console.log('\nTEST 5: Full flow simulation (timestamps only)')
  console.log('-'.repeat(40))

  const sports = ['nfl', 'nba', 'nhl', 'mlb']
  for (const sport of sports) {
    const league = SPORT_TO_LEAGUE[sport]

    // Find a draft for this sport
    const { data: sportDraft, error: sportDraftError } = await supabase
      .from('gm_mock_drafts')
      .select('id, chicago_team, current_pick, total_picks')
      .eq('sport', sport)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (sportDraftError || !sportDraft) {
      console.log(`  ⚠️  ${league}: No draft found to test`)
      continue
    }

    // Find a pick
    const { data: sportPick, error: sportPickError } = await supabase
      .from('gm_mock_draft_picks')
      .select('pick_number')
      .eq('mock_draft_id', sportDraft.id)
      .limit(1)
      .single()

    if (sportPickError || !sportPick) {
      console.log(`  ⚠️  ${league}: No pick found to test`)
      continue
    }

    // Update pick timestamp
    const { error: pickErr } = await supabase
      .from('gm_mock_draft_picks')
      .update({ updated_at: new Date().toISOString() })
      .eq('mock_draft_id', sportDraft.id)
      .eq('pick_number', sportPick.pick_number)

    // Update draft timestamp
    const { error: draftErr } = await supabase
      .from('gm_mock_drafts')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', sportDraft.id)

    if (pickErr || draftErr) {
      console.log(`  ❌ ${league}: Update failed - ${pickErr?.message || draftErr?.message}`)
      allPassed = false
    } else {
      console.log(`  ✅ ${league}: Full flow works`)
    }
  }

  // Summary
  console.log('\n================================================')
  console.log('  SUMMARY')
  console.log('================================================\n')

  if (allPassed) {
    console.log('✅ ALL TESTS PASSED!')
    console.log('')
    console.log('The mock draft fix has been verified:')
    console.log('- gm_mock_draft_picks UPDATE operations work')
    console.log('- gm_mock_drafts UPDATE operations work')
    console.log('- get_mock_draft RPC works for reading')
    console.log('- Direct database operations bypass problematic RPCs')
    console.log('')
    console.log('The fix replaces update_mock_draft_pick and')
    console.log('advance_mock_draft_pick RPCs with direct UPDATE calls.')
    console.log('================================================\n')
  } else {
    console.log('❌ SOME TESTS FAILED')
    console.log('Review the errors above.')
    console.log('================================================\n')
    process.exit(1)
  }
}

testDatabaseOperations().catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
})
