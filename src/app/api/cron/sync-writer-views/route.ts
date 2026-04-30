import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'
import { calculatePay } from '@/lib/payment-formula'

export const maxDuration = 60
export const dynamic = 'force-dynamic'

const WP_SMED = 'https://www.sportsmockery.com/wp-json/smed/v1'

export async function GET(request: Request) {
  // Verify cron authorization (required)
  const authHeader = request.headers.get('authorization')
  if (!process.env.CRON_SECRET || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Determine the period: sync data for today's current month-to-date
  // On the 1st of the month, also backfills the previous month if missing
  const now = new Date()
  const periodStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1)
  const startStr = periodStart.toISOString().split('T')[0]
  const endStr = periodEnd.toISOString().split('T')[0]

  let syncStatus: 'success' | 'failed' | 'partial' = 'success'
  let errorMessage: string | null = null
  let writersSynced = 0
  let totalViewsSynced = 0

  try {
    // 1. Fetch writer payment data from sportsmockery.com
    const res = await fetch(
      `${WP_SMED}/writer-payments?start=${startStr}&end=${endStr}`,
      { cache: 'no-store' }
    )

    if (!res.ok) {
      throw new Error(`WP API returned ${res.status}: ${res.statusText}`)
    }

    const data = await res.json()

    if (data.error) {
      throw new Error(`WP API error: ${data.error.message || JSON.stringify(data.error)}`)
    }

    const writers: Array<{
      author_id: string
      display_name: string
      total_posts: number
      total_views: number
    }> = data.writers || []

    if (writers.length === 0) {
      syncStatus = 'partial'
      errorMessage = 'No writers returned from WP API — period may have no published posts yet'
    }

    // 2. Fetch active payment formulas from Supabase
    const { data: formulas, error: formulaErr } = await supabaseAdmin
      .from('writer_payment_formulas')
      .select('*')
      .eq('is_active', true)

    if (formulaErr) {
      throw new Error(`Failed to fetch formulas: ${formulaErr.message}`)
    }

    const formulaMap = new Map(
      (formulas || []).map((f: any) => [f.writer_name.toLowerCase(), f])
    )

    // 2b. Auto-create stub formula rows for any new writer that has no formula yet,
    // so they show up in the admin dashboard's Formulas panel and can be edited via UI.
    const writersMissingFormula = writers.filter(
      w => !formulaMap.has(w.display_name.toLowerCase())
    )
    if (writersMissingFormula.length > 0) {
      // Skip writers that already have any formula row (active or not) to avoid duplicates
      const { data: existingRows } = await supabaseAdmin
        .from('writer_payment_formulas')
        .select('writer_name')
        .in('writer_name', writersMissingFormula.map(w => w.display_name))
      const alreadyHasRow = new Set(
        (existingRows || []).map((r: any) => String(r.writer_name).toLowerCase())
      )
      const stubs = writersMissingFormula
        .filter(w => !alreadyHasRow.has(w.display_name.toLowerCase()))
        .map(w => ({
          writer_name: w.display_name,
          writer_id: w.author_id,
          formula_code: '0',
          formula_description: 'Not configured — edit in dashboard',
          is_active: true,
        }))
      if (stubs.length > 0) {
        const { data: inserted, error: insertErr } = await supabaseAdmin
          .from('writer_payment_formulas')
          .insert(stubs)
          .select()
        if (insertErr) {
          console.error('[sync-writer-views] Stub formula insert failed:', insertErr)
        } else {
          for (const f of inserted || []) {
            formulaMap.set(String((f as any).writer_name).toLowerCase(), f)
          }
        }
      }
    }

    // 3. Calculate payments and upsert
    const paymentRows = writers.map(w => {
      const formula = formulaMap.get(w.display_name.toLowerCase()) as any
      const pay = formula
        ? calculatePay(formula.formula_code, w.total_posts, w.total_views)
        : 0

      return {
        writer_name: w.display_name,
        writer_id: w.author_id,
        period_start: startStr,
        period_end: endStr,
        total_posts: w.total_posts,
        total_views: w.total_views,
        calculated_pay: pay,
        formula_name: formula?.formula_description || null,
        status: 'pending' as const,
        synced_at: new Date().toISOString(),
      }
    })

    // Also add fixed-salary writers who may not have posts
    for (const [, formula] of formulaMap) {
      const f = formula as any
      const alreadyIncluded = paymentRows.some(
        r => r.writer_name.toLowerCase() === f.writer_name.toLowerCase()
      )
      if (!alreadyIncluded) {
        const pay = calculatePay(f.formula_code, 0, 0)
        if (pay > 0) {
          paymentRows.push({
            writer_name: f.writer_name,
            writer_id: f.writer_id || null,
            period_start: startStr,
            period_end: endStr,
            total_posts: 0,
            total_views: 0,
            calculated_pay: pay,
            formula_name: f.formula_description,
            status: 'pending',
            synced_at: new Date().toISOString(),
          })
        }
      }
    }

    // 4. Upsert payment records (update if already synced for this period)
    for (const row of paymentRows) {
      const { error: upsertErr } = await supabaseAdmin
        .from('writer_payments')
        .upsert(row, { onConflict: 'writer_name,period_start,period_end' })

      if (upsertErr) {
        console.error(`[sync-writer-views] Upsert error for ${row.writer_name}:`, upsertErr)
        syncStatus = 'partial'
        errorMessage = `Partial sync — failed to upsert ${row.writer_name}: ${upsertErr.message}`
      } else {
        writersSynced++
        totalViewsSynced += row.total_views
      }
    }

    // 5. Log the sync
    await supabaseAdmin.from('writer_payment_syncs').insert({
      period_start: startStr,
      period_end: endStr,
      status: syncStatus,
      error_message: errorMessage,
      writers_synced: writersSynced,
      total_views_synced: totalViewsSynced,
    })

    return NextResponse.json({
      ok: true,
      status: syncStatus,
      period: { start: startStr, end: endStr },
      writers_synced: writersSynced,
      total_views_synced: totalViewsSynced,
      error: errorMessage,
    })
  } catch (err: any) {
    const msg = err?.message || String(err)
    console.error('[sync-writer-views] Fatal error:', msg)

    // Log the failure
    try {
      await supabaseAdmin.from('writer_payment_syncs').insert({
        period_start: startStr,
        period_end: endStr,
        status: 'failed',
        error_message: msg,
        writers_synced: 0,
        total_views_synced: 0,
      })
    } catch { /* don't let logging failure mask the real error */ }

    return NextResponse.json({ ok: false, error: msg }, { status: 500 })
  }
}
