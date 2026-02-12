/**
 * Test script for 3-team trade simulation
 * Inserts mock 3-team trade data and verifies both partners are affected
 */

import { createClient } from '@supabase/supabase-js'

const DATALAB_URL = process.env.DATALAB_SUPABASE_URL || 'https://siwoqfzzcxmngnseyzpv.supabase.co'
const DATALAB_KEY = process.env.DATALAB_SUPABASE_SERVICE_ROLE_KEY || process.env.DATALAB_SUPABASE_ANON_KEY

if (!DATALAB_KEY) {
  console.error('Missing DATALAB_SUPABASE_SERVICE_ROLE_KEY or DATALAB_SUPABASE_ANON_KEY')
  process.exit(1)
}

const supabase = createClient(DATALAB_URL, DATALAB_KEY)

// Generate UUIDs for testing
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

const TEST_SESSION_ID = generateUUID()
const TEST_USER_ID = '00000000-0000-0000-0000-000000000001' // Test user ID

async function createTestSession() {
  console.log('=== Creating Test Session ===')

  const sessionData = {
    id: TEST_SESSION_ID,
    user_id: TEST_USER_ID,
    user_email: 'test@test.com',
    chicago_team: 'bears',
    sport: 'nfl',
    session_name: 'Test 3-Team Trade Session',
    is_active: true,
    created_at: new Date().toISOString(),
  }

  const { data, error } = await supabase
    .from('gm_sessions')
    .insert(sessionData)
    .select()
    .single()

  if (error) {
    console.error('Failed to create session:', error)
    return null
  }

  console.log('Session created:', data.id)
  return data
}

async function insertTestTrade() {
  console.log('\n=== Inserting Test 3-Team Trade ===')
  console.log(`Session ID: ${TEST_SESSION_ID}`)

  // Create a 3-team trade: Bears trade to Packers AND Vikings
  const tradeData = {
    session_id: TEST_SESSION_ID,
    user_id: TEST_USER_ID,
    user_email: 'test@test.com',
    chicago_team: 'bears',
    sport: 'nfl',
    trade_partner: 'Green Bay Packers',  // Full name
    partner_team_key: 'gb',  // Packers (partner 1)
    partner_2: 'min',  // Vikings (partner 2)
    is_three_team: true,
    status: 'accepted',
    grade: 75,
    grade_reasoning: 'Test 3-team trade for simulation verification',
    players_sent: [
      { full_name: 'Test Player 1', position: 'WR', age: 26, stats: { receiving_yards: 800 } }
    ],
    players_received: [
      { full_name: 'Test Player 2', position: 'CB', age: 24, stats: { def_int: 4 } },
      { full_name: 'Test Player 3', position: 'LB', age: 25, stats: { def_tackles_total: 80 } }
    ],
    draft_picks_sent: [{ round: 3, year: 2026 }],
    draft_picks_received: [{ round: 2, year: 2026 }],
    created_at: new Date().toISOString(),
  }

  const { data, error } = await supabase
    .from('gm_trades')
    .insert(tradeData)
    .select()
    .single()

  if (error) {
    console.error('Failed to insert trade:', error)
    return null
  }

  console.log('Trade inserted:', data.id)
  return data
}

async function runSimulation() {
  console.log('\n=== Running Season Simulation ===')

  const response = await fetch('https://test.sportsmockery.com/api/gm/sim/season', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      teamKey: 'bears',
      sport: 'nfl',
      sessionId: TEST_SESSION_ID,
    }),
  })

  const result = await response.json()
  return result
}

async function cleanupTestData() {
  console.log('\n=== Cleaning Up Test Data ===')

  // Delete trade first (foreign key)
  const { error: tradeError } = await supabase
    .from('gm_trades')
    .delete()
    .eq('session_id', TEST_SESSION_ID)

  if (tradeError) {
    console.error('Failed to delete trade:', tradeError)
  } else {
    console.log('Test trade deleted')
  }

  // Then delete session
  const { error: sessionError } = await supabase
    .from('gm_sessions')
    .delete()
    .eq('id', TEST_SESSION_ID)

  if (sessionError) {
    console.error('Failed to delete session:', sessionError)
  } else {
    console.log('Test session deleted')
  }
}

async function main() {
  console.log('╔════════════════════════════════════════════════════════════╗')
  console.log('║        3-TEAM TRADE SIMULATION TEST                        ║')
  console.log('╚════════════════════════════════════════════════════════════╝\n')

  try {
    // Step 1: Create test session
    const session = await createTestSession()
    if (!session) {
      console.error('Failed to create test session')
      return
    }

    // Step 2: Insert test 3-team trade
    const trade = await insertTestTrade()
    if (!trade) {
      console.error('Failed to create test trade')
      return
    }

    // Step 3: Run simulation
    const simResult = await runSimulation()

    console.log('\n=== Simulation Results ===')
    console.log('Success:', simResult.success)
    console.log('Baseline:', JSON.stringify(simResult.baseline))
    console.log('Modified:', JSON.stringify(simResult.modified))
    console.log('GM Score:', simResult.gmScore)

    // Step 4: Check trade impact
    console.log('\n=== Trade Impact Analysis ===')
    if (simResult.tradeImpact) {
      console.log('Power Rating Delta:', simResult.tradeImpact.powerRatingDelta)
      console.log('Avg Trade Grade:', simResult.tradeImpact.avgTradeGrade)
      console.log('Trade Partner Deltas:', JSON.stringify(simResult.tradeImpact.tradePartnerDeltas, null, 2))

      // Verify both partners are affected
      const deltas = simResult.tradeImpact.tradePartnerDeltas || {}
      const hasPackers = 'GB' in deltas
      const hasVikings = 'MIN' in deltas

      console.log('\n=== 3-Team Trade Verification ===')
      console.log(`Packers (GB) affected: ${hasPackers ? '✅ YES' : '❌ NO'} ${hasPackers ? `(delta: ${deltas['GB']})` : ''}`)
      console.log(`Vikings (MIN) affected: ${hasVikings ? '✅ YES' : '❌ NO'} ${hasVikings ? `(delta: ${deltas['MIN']})` : ''}`)

      if (hasPackers && hasVikings) {
        console.log('\n🎉 SUCCESS: Both 3-team trade partners have standings adjustments!')
      } else {
        console.log('\n⚠️  WARNING: Not all trade partners were affected')
      }
    } else {
      console.log('No trade impact data in response')
    }

    // Step 4: Show standings for trade partners
    console.log('\n=== Trade Partner Standings ===')
    const allTeams = [...(simResult.standings?.conference1 || []), ...(simResult.standings?.conference2 || [])]
    const packers = allTeams.find((t: any) => t.teamKey === 'gb')
    const vikings = allTeams.find((t: any) => t.teamKey === 'min')
    const bears = allTeams.find((t: any) => t.teamKey === 'bears' || t.isUserTeam)

    if (bears) console.log(`Bears (user): ${bears.wins}-${bears.losses} | isTradePartner: ${bears.isTradePartner}`)
    if (packers) console.log(`Packers (partner 1): ${packers.wins}-${packers.losses} | isTradePartner: ${packers.isTradePartner}`)
    if (vikings) console.log(`Vikings (partner 2): ${vikings.wins}-${vikings.losses} | isTradePartner: ${vikings.isTradePartner}`)

  } finally {
    // Cleanup
    await cleanupTestData()
  }
}

main().catch(console.error)
