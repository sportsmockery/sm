const DATALAB_URL = process.env.DATALAB_API_URL || 'https://datalab.sportsmockery.com'

/**
 * Trigger EDGE insight generation for an article.
 * Call once on article publish (CMS webhook, admin save handler, etc.).
 * This is a fire-and-forget operation — insights are generated async (~5s)
 * and cached in the edge_insights table for fast reads on page load.
 */
export async function generateEdgeInsights(article: {
  id: string | number
  title: string
  content: string
  team?: string
}) {
  try {
    const res = await fetch(`${DATALAB_URL}/api/edge-insights/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        article_id: String(article.id),
        title: article.title,
        content: article.content.slice(0, 8000),
        team: article.team,
      }),
    })
    return res.json()
  } catch (err) {
    console.error('Failed to generate EDGE insights:', err)
    return null
  }
}
