import { NextRequest, NextResponse } from 'next/server'
import { datalabAdmin } from '@/lib/supabase-datalab'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    if (!datalabAdmin) {
      return NextResponse.json({ error: 'DataLab not configured' }, { status: 500 })
    }

    // Fetch predictions from DataLab
    const { data: predictions, error: predictionsError } = await datalabAdmin
      .from('Twitter_viral_predictions')
      .select('*')
      .order('created_at', { ascending: false })
      .order('rank', { ascending: true })
      .limit(50)

    if (predictionsError) {
      console.error('Error fetching predictions:', predictionsError)
      return NextResponse.json({ error: predictionsError.message }, { status: 500 })
    }

    // Fetch error log from DataLab
    const { data: errors, error: errorsError } = await datalabAdmin
      .from('Twitter_cron_error_log')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(20)

    if (errorsError) {
      console.error('Error fetching error log:', errorsError)
      // Don't fail the whole request if error log fails
    }

    return NextResponse.json({
      predictions: predictions || [],
      errors: errors || [],
    })
  } catch (error) {
    console.error('Twitter posts API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Update a prediction (caption, status, etc.)
export async function PATCH(request: NextRequest) {
  try {
    if (!datalabAdmin) {
      return NextResponse.json({ error: 'DataLab not configured' }, { status: 500 })
    }

    const body = await request.json()
    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json({ error: 'Missing prediction ID' }, { status: 400 })
    }

    const { data, error } = await datalabAdmin
      .from('Twitter_viral_predictions')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating prediction:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ prediction: data })
  } catch (error) {
    console.error('Twitter posts PATCH error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
