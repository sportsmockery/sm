import { NextRequest, NextResponse } from 'next/server'
import { getGMAuthUser } from '@/lib/gm-auth'
import { datalabAdmin } from '@/lib/supabase-datalab'

export const dynamic = 'force-dynamic'

const DATALAB_URL = 'https://datalab.sportsmockery.com'

export type ExportFormat = 'json' | 'csv' | 'pdf'

interface ExportRequest {
  trade_ids: string[]
  format: ExportFormat
}

export async function POST(request: NextRequest) {
  try {
    const user = await getGMAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const body: ExportRequest = await request.json()

    if (!body.trade_ids || body.trade_ids.length === 0) {
      return NextResponse.json({ error: 'No trades specified' }, { status: 400 })
    }

    if (!body.format || !['json', 'csv', 'pdf'].includes(body.format)) {
      return NextResponse.json({ error: 'Invalid format' }, { status: 400 })
    }

    // Try Data Lab for PDF export
    if (body.format === 'pdf') {
      try {
        const res = await fetch(`${DATALAB_URL}/api/gm/export`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Source': 'sportsmockery.com',
            'X-User-Id': user.id,
          },
          body: JSON.stringify(body),
        })

        if (res.ok) {
          const data = await res.json()
          return NextResponse.json(data)
        }
      } catch {
        // Fall through to local implementation
      }
    }

    // Fetch trades from database
    const { data: trades, error } = await datalabAdmin
      .from('gm_trades')
      .select('*')
      .in('id', body.trade_ids)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) throw error

    if (!trades || trades.length === 0) {
      return NextResponse.json({ error: 'No trades found' }, { status: 404 })
    }

    // Format based on request
    switch (body.format) {
      case 'json':
        return NextResponse.json({
          export_type: 'json',
          generated_at: new Date().toISOString(),
          trade_count: trades.length,
          data: trades.map(t => ({
            id: t.id,
            chicago_team: t.chicago_team,
            trade_partner: t.trade_partner,
            players_sent: t.players_sent,
            players_received: t.players_received,
            draft_picks_sent: t.draft_picks_sent,
            draft_picks_received: t.draft_picks_received,
            grade: t.grade,
            status: t.status,
            is_dangerous: t.is_dangerous,
            grade_reasoning: t.grade_reasoning,
            trade_summary: t.trade_summary,
            improvement_score: t.improvement_score,
            breakdown: {
              talent_balance: t.talent_balance,
              contract_value: t.contract_value,
              team_fit: t.team_fit,
              future_assets: t.future_assets,
            },
            created_at: t.created_at,
          })),
        })

      case 'csv':
        const headers = [
          'Trade ID',
          'Date',
          'Chicago Team',
          'Trade Partner',
          'Players Sent',
          'Players Received',
          'Grade',
          'Status',
          'Dangerous',
          'Talent Balance',
          'Contract Value',
          'Team Fit',
          'Future Assets',
          'Reasoning',
        ]

        const rows = trades.map(t => [
          t.id,
          new Date(t.created_at).toISOString().split('T')[0],
          t.chicago_team,
          t.trade_partner,
          (t.players_sent || []).map((p: any) => p.name).join('; '),
          (t.players_received || []).map((p: any) => p.name).join('; '),
          t.grade,
          t.status,
          t.is_dangerous ? 'Yes' : 'No',
          t.talent_balance ? Math.round(t.talent_balance * 100) : '',
          t.contract_value ? Math.round(t.contract_value * 100) : '',
          t.team_fit ? Math.round(t.team_fit * 100) : '',
          t.future_assets ? Math.round(t.future_assets * 100) : '',
          `"${(t.grade_reasoning || '').replace(/"/g, '""')}"`,
        ])

        const csvContent = [
          headers.join(','),
          ...rows.map(r => r.join(',')),
        ].join('\n')

        return NextResponse.json({
          export_type: 'csv',
          generated_at: new Date().toISOString(),
          trade_count: trades.length,
          content: csvContent,
          filename: `gm-trades-export-${new Date().toISOString().split('T')[0]}.csv`,
        })

      case 'pdf':
        // Generate a simple HTML representation that can be printed to PDF
        const htmlContent = generatePDFHTML(trades)
        return NextResponse.json({
          export_type: 'pdf',
          generated_at: new Date().toISOString(),
          trade_count: trades.length,
          html_content: htmlContent,
          filename: `gm-trades-export-${new Date().toISOString().split('T')[0]}.pdf`,
        })

      default:
        return NextResponse.json({ error: 'Invalid format' }, { status: 400 })
    }
  } catch (error) {
    console.error('GM export error:', error)
    return NextResponse.json({ error: 'Failed to export trades' }, { status: 500 })
  }
}

function generatePDFHTML(trades: any[]): string {
  const tradeCards = trades.map(t => {
    const gradeColor = t.grade >= 75 ? '#22c55e' : t.grade >= 50 ? '#eab308' : '#ef4444'
    return `
      <div style="border: 1px solid #e5e7eb; border-radius: 12px; padding: 20px; margin-bottom: 20px; page-break-inside: avoid;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
          <div>
            <div style="font-size: 18px; font-weight: 700;">${t.chicago_team} ↔ ${t.trade_partner}</div>
            <div style="font-size: 12px; color: #6b7280;">${new Date(t.created_at).toLocaleDateString()}</div>
          </div>
          <div style="text-align: center;">
            <div style="font-size: 36px; font-weight: 900; color: ${gradeColor};">${t.grade}</div>
            <div style="font-size: 11px; padding: 2px 12px; border-radius: 12px; background-color: ${t.status === 'accepted' ? '#22c55e20' : '#ef444420'}; color: ${t.status === 'accepted' ? '#22c55e' : '#ef4444'}; font-weight: 700; text-transform: uppercase;">
              ${t.status}
            </div>
          </div>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 16px;">
          <div>
            <div style="font-size: 12px; font-weight: 700; color: #6b7280; margin-bottom: 8px; text-transform: uppercase;">Sent</div>
            <ul style="margin: 0; padding-left: 16px;">
              ${(t.players_sent || []).map((p: any) => `<li>${p.name} (${p.position})</li>`).join('')}
            </ul>
          </div>
          <div>
            <div style="font-size: 12px; font-weight: 700; color: #6b7280; margin-bottom: 8px; text-transform: uppercase;">Received</div>
            <ul style="margin: 0; padding-left: 16px;">
              ${(t.players_received || []).map((p: any) => `<li>${p.name} (${p.position})</li>`).join('')}
            </ul>
          </div>
        </div>
        <div style="font-size: 13px; color: #374151; line-height: 1.6; padding: 12px; background-color: #f9fafb; border-radius: 8px;">
          ${t.grade_reasoning || ''}
        </div>
      </div>
    `
  }).join('')

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>GM Trade Export</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 800px; margin: 0 auto; padding: 40px 20px; }
        h1 { font-size: 24px; margin-bottom: 8px; }
        .subtitle { color: #6b7280; font-size: 14px; margin-bottom: 32px; }
      </style>
    </head>
    <body>
      <h1>GM Trade History</h1>
      <div class="subtitle">Exported on ${new Date().toLocaleDateString()} • ${trades.length} trade${trades.length !== 1 ? 's' : ''}</div>
      ${tradeCards}
    </body>
    </html>
  `
}
