import { NextResponse } from 'next/server'

const SEMRUSH_API = 'https://api.semrush.com'
const DOMAIN = 'sportsmockery.com'

function parseSemrushCSV(csv: string): Record<string, string>[] {
  const lines = csv.trim().split(/\r?\n/).filter(l => l.trim())
  if (lines.length < 2) return []
  const headers = lines[0].split(';')
  return lines.slice(1).map(line => {
    const vals = line.split(';')
    const obj: Record<string, string> = {}
    headers.forEach((h, i) => (obj[h] = vals[i] || ''))
    return obj
  })
}

export async function GET() {
  const key = process.env.SEMRUSH_API_KEY
  if (!key) {
    return NextResponse.json({ error: 'SEMrush API key not configured' }, { status: 500 })
  }

  try {
    const [overviewRes, keywordsRes, competitorsRes, historyRes] = await Promise.allSettled([
      // Domain overview
      fetch(
        `${SEMRUSH_API}/?type=domain_rank&key=${key}&export_columns=Db,Dn,Rk,Or,Ot,Oc,Ad,At,Ac&domain=${DOMAIN}&database=us`,
        { next: { revalidate: 3600 } },
      ),
      // Top organic keywords with position changes
      fetch(
        `${SEMRUSH_API}/?type=domain_organic&key=${key}&export_columns=Ph,Po,Pp,Pd,Nq,Cp,Ur,Tr,Tc,Co,Nr&domain=${DOMAIN}&database=us&display_limit=20&display_sort=tr_desc`,
        { next: { revalidate: 3600 } },
      ),
      // Organic competitors
      fetch(
        `${SEMRUSH_API}/?type=domain_organic_organic&key=${key}&export_columns=Dn,Cr,Np,Or,Ot,Oc,Ad&domain=${DOMAIN}&database=us&display_limit=10`,
        { next: { revalidate: 3600 } },
      ),
      // Domain rank history (last 12 data points)
      fetch(
        `${SEMRUSH_API}/?type=domain_rank_history&key=${key}&export_columns=Dt,Rk,Or,Ot,Oc,Ad,At,Ac&domain=${DOMAIN}&database=us&display_limit=12`,
        { next: { revalidate: 86400 } },
      ),
    ])

    // Parse domain overview
    let overview = null
    if (overviewRes.status === 'fulfilled' && overviewRes.value.ok) {
      const rows = parseSemrushCSV(await overviewRes.value.text())
      if (rows.length > 0) {
        const r = rows[0]
        overview = {
          rank: parseInt(r['Rank'] || '0'),
          organicKeywords: parseInt(r['Organic Keywords'] || '0'),
          organicTraffic: parseInt(r['Organic Traffic'] || '0'),
          organicCost: parseFloat(r['Organic Cost'] || '0'),
          adwordsKeywords: parseInt(r['Adwords Keywords'] || '0'),
          adwordsTraffic: parseInt(r['Adwords Traffic'] || '0'),
          adwordsCost: parseFloat(r['Adwords Cost'] || '0'),
        }
      }
    }

    // Parse keywords with position changes
    let keywords: any[] = []
    if (keywordsRes.status === 'fulfilled' && keywordsRes.value.ok) {
      const rows = parseSemrushCSV(await keywordsRes.value.text())
      keywords = rows.map(r => ({
        keyword: r['Keyword'] || '',
        position: parseInt(r['Position'] || '0'),
        previousPosition: parseInt(r['Previous Position'] || '0'),
        positionDiff: parseInt(r['Position Difference'] || '0'),
        searchVolume: parseInt(r['Search Volume'] || '0'),
        cpc: parseFloat(r['CPC'] || '0'),
        url: r['Url'] || '',
        trafficPct: parseFloat(r['Traffic (%)'] || '0'),
        competition: parseFloat(r['Competition'] || '0'),
      }))
    }

    // Parse competitors
    let competitors: any[] = []
    if (competitorsRes.status === 'fulfilled' && competitorsRes.value.ok) {
      const rows = parseSemrushCSV(await competitorsRes.value.text())
      competitors = rows.map(r => ({
        domain: r['Domain'] || '',
        relevance: parseFloat(r['Competitor Relevance'] || '0'),
        commonKeywords: parseInt(r['Common Keywords'] || '0'),
        organicKeywords: parseInt(r['Organic Keywords'] || '0'),
        organicTraffic: parseInt(r['Organic Traffic'] || '0'),
        organicCost: parseFloat(r['Organic Cost'] || '0'),
      }))
    }

    // Parse rank history
    let rankHistory: any[] = []
    if (historyRes.status === 'fulfilled' && historyRes.value.ok) {
      const rows = parseSemrushCSV(await historyRes.value.text())
      rankHistory = rows.map(r => ({
        date: r['Date'] || '',
        rank: parseInt(r['Rank'] || '0'),
        organicKeywords: parseInt(r['Organic Keywords'] || '0'),
        organicTraffic: parseInt(r['Organic Traffic'] || '0'),
        organicCost: parseFloat(r['Organic Cost'] || '0'),
      }))
    }

    // Calculate position changes summary
    const positionChanges = {
      improved: keywords.filter(k => {
        const diff = k.previousPosition - k.position
        return diff > 0
      }).length,
      declined: keywords.filter(k => {
        const diff = k.previousPosition - k.position
        return diff < 0
      }).length,
      unchanged: keywords.filter(k => k.previousPosition === k.position).length,
    }

    return NextResponse.json({
      overview,
      keywords,
      competitors,
      rankHistory,
      positionChanges,
      domain: DOMAIN,
      fetchedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error('[SEO Audit] Error:', error)
    return NextResponse.json({ error: 'Failed to fetch audit data' }, { status: 500 })
  }
}
