import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const DATALAB_URL = process.env.DATALAB_URL || 'https://datalab.sportsmockery.com'

/**
 * POST /api/gm/sim/season
 * Proxy to datalab's season simulation endpoint
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { sessionId, sport, teamKey, seasonYear } = body

    // Validate required fields
    if (!sessionId || !sport || !teamKey) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: sessionId, sport, teamKey' },
        { status: 400 }
      )
    }

    // Call datalab API
    const datalabResponse = await fetch(`${DATALAB_URL}/api/gm/sim/season`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sessionId,
        sport,
        teamKey,
        seasonYear: seasonYear || 2026,
      }),
    })

    if (!datalabResponse.ok) {
      const errorText = await datalabResponse.text()
      console.error('[Simulation API] Datalab error:', errorText)
      return NextResponse.json(
        { success: false, error: 'Simulation failed' },
        { status: datalabResponse.status }
      )
    }

    const data = await datalabResponse.json()
    return NextResponse.json(data)

  } catch (error) {
    console.error('[Simulation API] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
