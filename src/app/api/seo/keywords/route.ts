import { NextResponse } from 'next/server'

const SEMRUSH_API = 'https://api.semrush.com'
const DOMAIN = 'sportsmockery.com'
const COMPETITORS = ['beargoggleson.com', 'windycitygridiron.com', 'bleachernation.com']

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
    // Fetch top organic keywords + keyword gap vs competitors in parallel
    const [keywordsRes, ...gapResponses] = await Promise.allSettled([
      fetch(
        `${SEMRUSH_API}/?type=domain_organic&key=${key}&export_columns=Ph,Po,Pp,Pd,Nq,Cp,Ur,Tr,Tc,Co,Nr&domain=${DOMAIN}&database=us&display_limit=50&display_sort=tr_desc`,
        { next: { revalidate: 86400 } },
      ),
      ...COMPETITORS.map(comp =>
        fetch(
          `${SEMRUSH_API}/?type=domain_organic_organic&key=${key}&export_columns=Dn,Cr,Np,Or,Ot,Oc,Ad&domain=${DOMAIN}&target=${comp}&database=us&display_limit=5`,
          { next: { revalidate: 86400 } },
        ),
      ),
    ])

    // Parse organic keywords
    let keywords: any[] = []
    if (keywordsRes.status === 'fulfilled' && keywordsRes.value.ok) {
      const rows = parseSemrushCSV(await keywordsRes.value.text())
      keywords = rows.map(r => ({
        keyword: r['Keyword'] || '',
        position: parseInt(r['Position'] || '0'),
        previousPosition: parseInt(r['Previous Position'] || '0'),
        searchVolume: parseInt(r['Search Volume'] || '0'),
        cpc: parseFloat(r['CPC'] || '0'),
        url: r['Url'] || '',
        trafficPct: parseFloat(r['Traffic (%)'] || '0'),
        competition: parseFloat(r['Competition'] || '0'),
        numberOfResults: parseInt(r['Number of Results'] || '0'),
      }))
    }

    // Parse keyword gap data per competitor
    const keywordGaps: { competitor: string; commonKeywords: number; data: any[] }[] = COMPETITORS.map((comp) => {
      return { competitor: comp, commonKeywords: 0, data: [] }
    })

    // For keyword gap, use a separate approach - common keywords between domains
    // The domain_organic_organic endpoint returns competitor-level data, not keyword-level gap
    // We include the competitor comparison data from the gap responses
    for (let i = 0; i < gapResponses.length; i++) {
      const res = gapResponses[i]
      if (res.status === 'fulfilled' && res.value.ok) {
        try {
          const rows = parseSemrushCSV(await res.value.text())
          if (rows.length > 0) {
            keywordGaps[i] = {
              competitor: COMPETITORS[i],
              commonKeywords: parseInt(rows[0]['Common Keywords'] || '0'),
              data: rows.map(r => ({
                domain: r['Domain'] || '',
                relevance: parseFloat(r['Competitor Relevance'] || '0'),
                commonKeywords: parseInt(r['Common Keywords'] || '0'),
                organicKeywords: parseInt(r['Organic Keywords'] || '0'),
                organicTraffic: parseInt(r['Organic Traffic'] || '0'),
              })),
            }
          }
        } catch {
          // Keep default empty gap
        }
      }
    }

    return NextResponse.json({
      keywords,
      keywordGaps,
      domain: DOMAIN,
      fetchedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error('[SEO Keywords] Error:', error)
    return NextResponse.json({ error: 'Failed to fetch keyword data' }, { status: 500 })
  }
}
