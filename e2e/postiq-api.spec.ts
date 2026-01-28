import { test, expect } from '@playwright/test'
import { TEAMS, TEAM_CATEGORIES, SAMPLE_ARTICLES, BASE_URL, Team } from './shared'

/**
 * PostIQ API Deep Validation Tests
 *
 * Tests every PostIQ function for every team at the API level,
 * plus chart CRUD, poll CRUD, and full create-publish workflows.
 * No browser auth required — all fetch-based.
 */

async function apiCall(action: string, extra: Record<string, unknown> = {}) {
  const article = extra.content ? extra : SAMPLE_ARTICLES.Bears
  const start = Date.now()
  const res = await fetch(`${BASE_URL}/api/admin/ai`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action,
      title: (extra.title as string) || SAMPLE_ARTICLES.Bears.title,
      content: (extra.content as string) || SAMPLE_ARTICLES.Bears.content,
      category: (extra.category as string) || 'Chicago Bears',
      team: (extra.team as string) || 'bears',
      ...extra,
    }),
  })
  const elapsed = Date.now() - start
  const data = await res.json()
  return { status: res.status, data, elapsed }
}

// ======== HEADLINES ========

test.describe('Headlines - per team', () => {
  for (const team of TEAMS) {
    test(`${team} - returns valid headlines array`, async () => {
      const { status, data } = await apiCall('headlines', {
        team: team.toLowerCase().replace(' ', ''),
        title: SAMPLE_ARTICLES[team].title,
        content: SAMPLE_ARTICLES[team].content,
        category: TEAM_CATEGORIES[team],
      })
      expect(status).toBe(200)
      expect(data.headlines).toBeDefined()
      expect(Array.isArray(data.headlines)).toBe(true)
      expect(data.headlines.length).toBeGreaterThanOrEqual(3)
      for (const h of data.headlines) {
        expect(typeof h).toBe('string')
        expect(h.length).toBeGreaterThan(10)
      }
    })
  }

  test('team selector override works (Bears article + Bulls team)', async () => {
    const { status, data } = await apiCall('headlines', { team: 'Bulls' })
    expect(status).toBe(200)
    expect(data.headlines.length).toBeGreaterThanOrEqual(3)
    for (const h of data.headlines) {
      expect(typeof h).toBe('string')
      expect(h.length).toBeGreaterThan(10)
    }
  })
})

// ======== IDEAS ========

test.describe('Ideas - per team', () => {
  for (const team of TEAMS) {
    test(`${team} - returns structured ideas`, async () => {
      const { status, data } = await apiCall('ideas', {
        team: team.toLowerCase().replace(' ', ''),
        category: TEAM_CATEGORIES[team],
      })
      expect(status).toBe(200)
      expect(Array.isArray(data.ideas)).toBe(true)
      expect(data.ideas.length).toBeGreaterThanOrEqual(3)
      for (const idea of data.ideas) {
        expect(idea.headline).toBeDefined()
        expect(typeof idea.headline).toBe('string')
        expect(idea.headline.length).toBeGreaterThan(5)
      }
    })
  }
})

// ======== SEO ========

test.describe('SEO', () => {
  test('seo - returns complete SEO object', async () => {
    const { status, data } = await apiCall('seo')
    expect(status).toBe(200)
    expect(data.seoTitle).toBeDefined()
    expect(typeof data.seoTitle).toBe('string')
    expect(data.seoTitle.length).toBeGreaterThan(10)
    expect(data.seoTitle.length).toBeLessThanOrEqual(80)
    expect(data.metaDescription).toBeDefined()
    expect(data.metaDescription.length).toBeGreaterThan(20)
  })

  test('generate_seo - returns complete SEO object', async () => {
    const { status, data } = await apiCall('generate_seo')
    expect(status).toBe(200)
    expect(data.seoTitle).toBeDefined()
    expect(data.metaDescription).toBeDefined()
  })

  for (const team of TEAMS) {
    test(`seo - ${team} article`, async () => {
      const { status, data } = await apiCall('seo', {
        title: SAMPLE_ARTICLES[team].title,
        content: SAMPLE_ARTICLES[team].content,
        category: TEAM_CATEGORIES[team],
        team: team.toLowerCase().replace(' ', ''),
      })
      expect(status).toBe(200)
      expect(data.seoTitle).toBeDefined()
      expect(data.metaDescription).toBeDefined()
    })
  }
})

// ======== GRAMMAR ========

test.describe('Grammar', () => {
  test('returns corrected content and issues', async () => {
    const { status, data } = await apiCall('grammar')
    expect(status).toBe(200)
    expect(data.correctedContent).toBeDefined()
    expect(typeof data.correctedContent).toBe('string')
    expect(data.correctedContent.length).toBeGreaterThan(100)
    if (data.issues) {
      expect(Array.isArray(data.issues)).toBe(true)
    }
  })

  for (const team of TEAMS) {
    test(`grammar - ${team} article`, async () => {
      const { status, data } = await apiCall('grammar', {
        content: SAMPLE_ARTICLES[team].content,
      })
      expect(status).toBe(200)
      expect(data.correctedContent).toBeDefined()
      expect(data.correctedContent.length).toBeGreaterThan(50)
    })
  }
})

// ======== EXCERPT ========

test.describe('Excerpt', () => {
  test('returns 2-3 sentence summary', async () => {
    const { status, data } = await apiCall('excerpt')
    expect(status).toBe(200)
    expect(data.excerpt).toBeDefined()
    expect(typeof data.excerpt).toBe('string')
    expect(data.excerpt.length).toBeGreaterThan(30)
    expect(data.excerpt.length).toBeLessThanOrEqual(500)
  })

  for (const team of TEAMS) {
    test(`excerpt - ${team} article`, async () => {
      const { status, data } = await apiCall('excerpt', {
        title: SAMPLE_ARTICLES[team].title,
        content: SAMPLE_ARTICLES[team].content,
      })
      expect(status).toBe(200)
      expect(data.excerpt).toBeDefined()
      expect(data.excerpt.length).toBeGreaterThan(30)
    })
  }
})

// ======== ANALYZE CHART ========

test.describe('Analyze Chart', () => {
  test('returns chart data array', async () => {
    const { status, data } = await apiCall('analyze_chart')
    expect(status).toBe(200)
    // analyze_chart returns an array of {label, value} directly
    expect(Array.isArray(data)).toBe(true)
    if (data.length > 0) {
      for (const d of data) {
        expect(d.label).toBeDefined()
        expect(typeof d.value).toBe('number')
      }
    }
  })

  for (const team of TEAMS) {
    test(`analyze_chart - ${team}`, async () => {
      const { status, data } = await apiCall('analyze_chart', {
        title: SAMPLE_ARTICLES[team].title,
        content: SAMPLE_ARTICLES[team].content,
        category: TEAM_CATEGORIES[team],
      })
      expect(status).toBe(200)
      // Returns array or object — just verify 200
      expect(data).toBeDefined()
    })
  }
})

// ======== GENERATE CHART ========

test.describe('Generate Chart', () => {
  for (const team of TEAMS) {
    test(`${team} - generates chart with valid structure`, async () => {
      const { status, data } = await apiCall('generate_chart', {
        title: SAMPLE_ARTICLES[team].title,
        content: SAMPLE_ARTICLES[team].content,
        category: TEAM_CATEGORIES[team],
        team: team.toLowerCase().replace(' ', ''),
      })
      expect(status).toBe(200)
      expect(data.success).toBeDefined()
      if (data.success) {
        expect(data.chartId).toBeDefined()
        expect(data.shortcode).toMatch(/\[chart:.+\]/)
        expect(['bar', 'line', 'pie', 'player-comparison', 'team-stats']).toContain(data.chartType)
        expect(data.chartTitle).toBeDefined()
        if (data.updatedContent) {
          expect(data.updatedContent).toContain('[chart:')
        }

        // Verify chart exists in DB
        const chartRes = await fetch(`${BASE_URL}/api/charts/${data.chartId}`)
        expect(chartRes.status).toBe(200)
        const chartData = await chartRes.json()
        expect(chartData.data.length).toBeGreaterThan(0)

        // Cleanup
        await fetch(`${BASE_URL}/api/charts/${data.chartId}`, { method: 'DELETE' })
      }
    })
  }
})

// ======== GENERATE POLL ========

test.describe('Generate Poll', () => {
  for (const team of TEAMS) {
    test(`${team} - generates poll with valid structure`, async () => {
      const { status, data } = await apiCall('generate_poll', {
        title: SAMPLE_ARTICLES[team].title,
        content: SAMPLE_ARTICLES[team].content,
        category: TEAM_CATEGORIES[team],
        team: team.toLowerCase().replace(' ', ''),
      })
      expect(status).toBe(200)
      expect(data.success).toBeDefined()
      if (data.success) {
        expect(data.pollId).toBeDefined()
        expect(data.shortcode).toMatch(/\[poll:.+\]/)
        expect(data.question).toBeDefined()
        expect(data.question.length).toBeGreaterThan(10)
        if (data.options) {
          expect(Array.isArray(data.options)).toBe(true)
          expect(data.options.length).toBeGreaterThanOrEqual(2)
        }

        // Verify poll exists
        const pollRes = await fetch(`${BASE_URL}/api/polls/${data.pollId}/results`)
        expect(pollRes.status).toBe(200)
        const pollData = await pollRes.json()
        const pollResults = pollData.results || pollData
        const pollOptions = pollResults.options || pollResults.poll?.options
        expect(pollOptions.length).toBeGreaterThanOrEqual(2)

        // Cleanup
        await fetch(`${BASE_URL}/api/polls/${data.pollId}`, { method: 'DELETE' })
      }
    })
  }
})

// ======== CHART CRUD + CUSTOMIZATION ========

test.describe('Chart CRUD + Customization', () => {
  let chartId: string

  test('create bar chart', async () => {
    const res = await fetch(`${BASE_URL}/api/charts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'bar',
        title: 'E2E: Bears Passing Yards',
        size: 'medium',
        colors: { scheme: 'team', team: 'bears' },
        data: [
          { label: 'Week 1', value: 285 },
          { label: 'Week 2', value: 312 },
          { label: 'Week 3', value: 198 },
          { label: 'Week 4', value: 345 },
          { label: 'Week 5', value: 267 },
        ],
      }),
    })
    expect([200, 201]).toContain(res.status)
    const data = await res.json()
    expect(data.id).toBeDefined()
    expect(data.shortcode).toMatch(/\[chart:.+\]/)
    expect(data.chart_type).toBe('bar')
    chartId = data.id
  })

  test('fetch chart by ID', async () => {
    test.skip(!chartId, 'No chart created')
    const res = await fetch(`${BASE_URL}/api/charts/${chartId}`)
    expect(res.status).toBe(200)
    const data = await res.json()
    // GET /api/charts/[id] returns chart fields directly (no id field)
    expect(data.title).toBeDefined()
    expect(data.data.length).toBe(5)
  })

  test('change chart type to line + custom colors', async () => {
    test.skip(!chartId, 'No chart')
    const res = await fetch(`${BASE_URL}/api/charts/${chartId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'line',
        title: 'E2E: Bears Passing Yards (Line)',
        size: 'large',
        colors: { scheme: 'custom', custom: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'] },
        data: [
          { label: 'Week 1', value: 285 },
          { label: 'Week 2', value: 312 },
          { label: 'Week 3', value: 198 },
          { label: 'Week 4', value: 345 },
          { label: 'Week 5', value: 267 },
        ],
      }),
    })
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.chart_type).toBe('line')
    expect(data.config.size).toBe('large')
  })

  test('change chart type to pie', async () => {
    test.skip(!chartId, 'No chart')
    const res = await fetch(`${BASE_URL}/api/charts/${chartId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'pie',
        title: 'E2E: Bears Passing Distribution',
        size: 'medium',
        colors: { scheme: 'team', team: 'bears' },
        data: [
          { label: 'Week 1', value: 285 },
          { label: 'Week 2', value: 312 },
          { label: 'Week 3', value: 198 },
          { label: 'Week 4', value: 345 },
          { label: 'Week 5', value: 267 },
        ],
      }),
    })
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.chart_type).toBe('pie')
  })

  for (const teamKey of ['bears', 'bulls', 'cubs', 'whitesox', 'blackhawks'] as const) {
    test(`change colors to ${teamKey} theme`, async () => {
      test.skip(!chartId, 'No chart')
      const res = await fetch(`${BASE_URL}/api/charts/${chartId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'bar',
          title: `E2E: ${teamKey} themed`,
          size: 'medium',
          colors: { scheme: 'team', team: teamKey },
          data: [{ label: 'A', value: 10 }, { label: 'B', value: 20 }],
        }),
      })
      expect(res.status).toBe(200)
      const data = await res.json()
      expect(data.config.colors.team).toBe(teamKey)
    })
  }

  test('delete chart', async () => {
    test.skip(!chartId, 'No chart')
    const res = await fetch(`${BASE_URL}/api/charts/${chartId}`, { method: 'DELETE' })
    expect(res.status).toBe(200)
  })
})

// ======== POLL CRUD + VOTING ========

test.describe('Poll CRUD + Voting', () => {
  let pollId: string

  test('create poll', async () => {
    const res = await fetch(`${BASE_URL}/api/polls`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'E2E Test Poll',
        question: 'Which Chicago team wins a title first?',
        poll_type: 'single',
        team_theme: 'bears',
        options: [
          { option_text: 'Bears' },
          { option_text: 'Bulls' },
          { option_text: 'Blackhawks' },
          { option_text: 'Cubs' },
          { option_text: 'White Sox' },
        ],
      }),
    })
    expect([200, 201]).toContain(res.status)
    const data = await res.json()
    expect(data.poll.id).toBeDefined()
    expect(data.shortcode).toMatch(/\[poll:.+\]/)
    expect(data.poll.options.length).toBe(5)
    pollId = data.poll.id
  })

  test('fetch poll results', async () => {
    test.skip(!pollId, 'No poll')
    const res = await fetch(`${BASE_URL}/api/polls/${pollId}/results`)
    expect(res.status).toBe(200)
    const data = await res.json()
    // Results are wrapped in {results: {poll, options, ...}} or {poll, options}
    const results = data.results || data
    const options = results.options || results.poll?.options
    expect(options).toBeDefined()
    expect(options.length).toBe(5)
  })

  test('vote on poll', async () => {
    test.skip(!pollId, 'No poll')
    const pollRes = await fetch(`${BASE_URL}/api/polls/${pollId}/results`)
    const pollData = await pollRes.json()
    const results = pollData.results || pollData
    const options = results.options || results.poll?.options
    const firstOptionId = options[0].id

    const res = await fetch(`${BASE_URL}/api/polls/${pollId}/vote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        option_ids: [firstOptionId],
        anonymous_id: `e2e-${Date.now()}`,
      }),
    })
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.success).toBe(true)
  })

  test('verify vote counted', async () => {
    test.skip(!pollId, 'No poll')
    const res = await fetch(`${BASE_URL}/api/polls/${pollId}/results`)
    const data = await res.json()
    const results = data.results || data
    const totalVotes = results.total_votes ?? results.poll?.total_votes ?? 0
    expect(totalVotes).toBeGreaterThanOrEqual(1)
  })

  test('delete poll', async () => {
    test.skip(!pollId, 'No poll')
    const res = await fetch(`${BASE_URL}/api/polls/${pollId}`, { method: 'DELETE' })
    expect([200, 204]).toContain(res.status)
  })
})

// ======== FULL WORKFLOW: per-team create chart+poll, embed in post, publish ========

test.describe('Full Publish Workflow - per team', () => {
  for (const team of TEAMS) {
    // KNOWN BUG: POST /api/admin/posts returns 500 when called directly via API
    // (works via the UI because the UI sends additional form context)
    test(`${team} - chart+poll+publish cycle`, async () => {
      const article = SAMPLE_ARTICLES[team]
      const teamKey = team.toLowerCase().replace(' ', '')

      // 1. Generate chart
      const chartRes = await apiCall('generate_chart', {
        title: article.title,
        content: article.content,
        category: TEAM_CATEGORIES[team],
        team: teamKey,
      })
      let content = chartRes.data.success ? chartRes.data.updatedContent : article.content

      // 2. Generate poll
      const pollRes = await apiCall('generate_poll', {
        title: article.title,
        content,
        category: TEAM_CATEGORIES[team],
        team: teamKey,
      })
      if (pollRes.data.success && pollRes.data.updatedContent) {
        content = pollRes.data.updatedContent
      }

      // Verify shortcodes present
      if (chartRes.data.success) expect(content).toContain('[chart:')
      if (pollRes.data.success) expect(content).toContain('[poll:')

      // 3. Create published post
      const testSlug = `e2e-test-${teamKey}-full-${Date.now()}`
      const postRes = await fetch(`${BASE_URL}/api/admin/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: article.title,
          slug: testSlug,
          content,
          status: 'published',
          category_id: null,
          author_id: null,
          excerpt: null,
          featured_image: null,
          seo_title: null,
          seo_description: null,
          social_caption: null,
        }),
      })
      const postData = await postRes.json()
      // BUG DETECTION: If 500, log the error for diagnosis
      if (postRes.status === 500) {
        console.error(`[BUG] POST /api/admin/posts returned 500:`, JSON.stringify(postData))
      }
      expect([200, 201]).toContain(postRes.status)
      expect(postData.id).toBeDefined()

      // 4. Verify post content has shortcodes
      if (chartRes.data.success || pollRes.data.success) {
        expect(postData.content || content).toMatch(/\[(chart|poll):.+\]/)
      }

      // Cleanup
      if (chartRes.data.success && chartRes.data.chartId) {
        await fetch(`${BASE_URL}/api/charts/${chartRes.data.chartId}`, { method: 'DELETE' })
      }
      if (pollRes.data.success && pollRes.data.pollId) {
        await fetch(`${BASE_URL}/api/polls/${pollRes.data.pollId}`, { method: 'DELETE' })
      }
    })
  }
})

// ======== CONSISTENCY - run each action 5 additional times ========

test.describe('Consistency runs', () => {
  for (const action of ['headlines', 'seo', 'grammar', 'excerpt', 'generate_chart', 'generate_poll'] as const) {
    for (let i = 1; i <= 5; i++) {
      test(`${action} - run ${i}`, async () => {
        const { status } = await apiCall(action)
        expect(status).toBe(200)
      })
    }
  }
})
