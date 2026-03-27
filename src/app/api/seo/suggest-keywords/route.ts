import { NextResponse } from 'next/server'

const SEMRUSH_API = 'https://api.semrush.com'

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

export async function GET(request: Request) {
  const key = process.env.SEMRUSH_API_KEY
  if (!key) {
    return NextResponse.json({ error: 'SEMrush API key not configured' }, { status: 500 })
  }

  const { searchParams } = new URL(request.url)
  const topic = searchParams.get('topic')
  if (!topic) {
    return NextResponse.json({ error: 'Missing required "topic" parameter' }, { status: 400 })
  }

  try {
    // Fetch phrase match + related keywords in parallel
    const [phraseRes, relatedRes] = await Promise.allSettled([
      fetch(
        `${SEMRUSH_API}/?type=phrase_match&key=${key}&export_columns=Ph,Nq,Cp,Co,Nr,Td&phrase=${encodeURIComponent(topic)}&database=us&display_limit=20&display_sort=nq_desc`,
        { next: { revalidate: 3600 } },
      ),
      fetch(
        `${SEMRUSH_API}/?type=phrase_related&key=${key}&export_columns=Ph,Nq,Cp,Co,Nr,Td&phrase=${encodeURIComponent(topic)}&database=us&display_limit=20&display_sort=nq_desc`,
        { next: { revalidate: 3600 } },
      ),
    ])

    // Parse phrase match keywords
    let phraseMatch: any[] = []
    if (phraseRes.status === 'fulfilled' && phraseRes.value.ok) {
      const rows = parseSemrushCSV(await phraseRes.value.text())
      phraseMatch = rows.map(r => ({
        keyword: r['Keyword'] || '',
        searchVolume: parseInt(r['Search Volume'] || '0'),
        cpc: parseFloat(r['CPC'] || '0'),
        competition: parseFloat(r['Competition'] || '0'),
        numberOfResults: parseInt(r['Number of Results'] || '0'),
        trend: r['Trend'] || '',
      }))
    }

    // Parse related keywords
    let related: any[] = []
    if (relatedRes.status === 'fulfilled' && relatedRes.value.ok) {
      const rows = parseSemrushCSV(await relatedRes.value.text())
      related = rows.map(r => ({
        keyword: r['Keyword'] || '',
        searchVolume: parseInt(r['Search Volume'] || '0'),
        cpc: parseFloat(r['CPC'] || '0'),
        competition: parseFloat(r['Competition'] || '0'),
        numberOfResults: parseInt(r['Number of Results'] || '0'),
        trend: r['Trend'] || '',
      }))
    }

    // Combine and deduplicate, sorted by search volume
    const seen = new Set<string>()
    const suggestions = [...phraseMatch, ...related]
      .filter(k => {
        if (seen.has(k.keyword)) return false
        seen.add(k.keyword)
        return true
      })
      .sort((a, b) => b.searchVolume - a.searchVolume)
      .slice(0, 30)

    return NextResponse.json({
      topic,
      suggestions,
      phraseMatchCount: phraseMatch.length,
      relatedCount: related.length,
      fetchedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error('[SEO Suggest Keywords] Error:', error)
    return NextResponse.json({ error: 'Failed to fetch keyword suggestions' }, { status: 500 })
  }
}
