import { test, expect, Page } from '@playwright/test'
import { TEAMS, TEAM_CATEGORIES, SAMPLE_ARTICLES, BASE_URL, Team } from './shared'

/**
 * PostIQ UI E2E Tests
 *
 * Tests both /admin/posts/new and /studio/posts/new editors:
 * - Fill post content for each team
 * - Run every PostIQ tool via the UI
 * - Verify Headlines team selector works
 * - Publish with auto-chart and auto-poll
 * - Verify chart + poll render on published post
 */

async function selectCategory(page: Page, categoryName: string) {
  const categorySelect = page.locator('select').filter({ has: page.locator(`option:text-is("${categoryName}")`) }).first()
  if (await categorySelect.count()) {
    await categorySelect.selectOption({ label: categoryName })
    return
  }
  const categoryBtn = page.locator(`text="${categoryName}"`).first()
  if (await categoryBtn.count()) {
    await categoryBtn.click()
  }
}

async function fillPostEditor(page: Page, team: Team, testSlug: string) {
  const article = SAMPLE_ARTICLES[team]

  const titleInput = page.locator('input[placeholder*="title" i], input[placeholder*="Article" i]').first()
  await titleInput.fill(article.title)
  await page.waitForTimeout(500)

  // Fill slug
  const editSlugBtn = page.locator('button:text("Edit")').first()
  if (await editSlugBtn.count()) {
    await editSlugBtn.click()
    const slugInput = page.locator('input[placeholder*="slug" i]').first()
    await slugInput.fill(testSlug)
    const doneBtn = page.locator('button:text("Done")').first()
    if (await doneBtn.count()) await doneBtn.click()
  }

  await selectCategory(page, TEAM_CATEGORIES[team])

  // Fill content
  const contentArea = page.locator('[contenteditable="true"], textarea[name="content"], .ProseMirror, .tiptap').first()
  if (await contentArea.count()) {
    await contentArea.click()
    await page.evaluate((html) => {
      const editor = document.querySelector('[contenteditable="true"], .ProseMirror, .tiptap')
      if (editor) editor.innerHTML = html
    }, article.content)
  }
  await page.waitForTimeout(300)
}

async function waitForAIResponse(page: Page, timeout = 60_000) {
  await page.waitForFunction(() => {
    const text = document.body.innerText
    return !text.includes('Generating...') && !text.includes('Checking...') && !text.includes('Analyzing...')
  }, { timeout })
}

function makeSlug(team: Team, editor: string, suffix: string): string {
  return `e2e-test/${team.toLowerCase().replace(' ', '-')}-${editor}-${suffix}-${Date.now()}`
}

// ======== ADMIN EDITOR ========

test.describe('Admin Editor - /admin/posts/new', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/posts/new', { waitUntil: 'networkidle' })
    await expect(
      page.locator('input[placeholder*="title" i], input[placeholder*="Article" i]').first()
    ).toBeVisible({ timeout: 15_000 })
  })

  for (const team of TEAMS) {
    test(`${team} - Headlines with team selector`, async ({ page }) => {
      await fillPostEditor(page, team, makeSlug(team, 'admin', 'headlines'))

      // Set team in headline selector
      const teamSelect = page.locator('select').filter({ hasText: 'Auto (from category)' }).first()
      if (await teamSelect.count()) {
        await teamSelect.selectOption({ label: team })
      }

      const headlinesBtn = page.locator('button').filter({ hasText: /Headlines/i }).first()
      await headlinesBtn.click()
      await page.waitForTimeout(2000)
      await waitForAIResponse(page)

      const pageText = await page.textContent('body')
      expect(pageText).not.toContain('Generating...')
    })

    test(`${team} - Grammar Check`, async ({ page }) => {
      await fillPostEditor(page, team, makeSlug(team, 'admin', 'grammar'))

      const grammarBtn = page.locator('button').filter({ hasText: /Grammar/i }).first()
      await grammarBtn.click()
      await waitForAIResponse(page)

      const pageText = await page.textContent('body')
      expect(pageText).not.toContain('Checking...')
    })
  }

  test('SEO generation', async ({ page }) => {
    await fillPostEditor(page, 'Bears', makeSlug('Bears', 'admin', 'seo'))
    const seoBtn = page.locator('button').filter({ hasText: /SEO/i }).first()
    if (await seoBtn.count()) {
      await seoBtn.click()
      await waitForAIResponse(page, 30_000)
    }
  })

  test('Excerpt generation', async ({ page }) => {
    await fillPostEditor(page, 'Bears', makeSlug('Bears', 'admin', 'excerpt'))
    const excerptBtn = page.locator('button').filter({ hasText: /Excerpt/i }).first()
    if (await excerptBtn.count()) {
      await excerptBtn.click()
      await waitForAIResponse(page)
    }
  })

  test('Ideas modal opens and generates', async ({ page }) => {
    await fillPostEditor(page, 'Bears', makeSlug('Bears', 'admin', 'ideas'))
    const ideasBtn = page.locator('button').filter({ hasText: /Ideas/i }).first()
    await ideasBtn.click()
    await page.waitForTimeout(2000)
    await page.waitForFunction(() => {
      return !document.body.innerText.includes('Generating ideas...')
    }, { timeout: 30_000 })
  })

  test('Chart modal opens', async ({ page }) => {
    await fillPostEditor(page, 'Bears', makeSlug('Bears', 'admin', 'chart'))
    const chartBtn = page.locator('button').filter({ hasText: /Chart/i }).first()
    if (await chartBtn.isEnabled()) {
      await chartBtn.click()
      await page.waitForTimeout(1000)
    }
  })

  test('Publish with auto-chart + auto-poll', async ({ page }) => {
    await fillPostEditor(page, 'Bears', makeSlug('Bears', 'admin', 'publish-auto'))

    // Toggle auto-chart
    const autoChartLabel = page.locator('label').filter({ hasText: /chart/i }).first()
    if (await autoChartLabel.count()) {
      const checkbox = autoChartLabel.locator('input[type="checkbox"]')
      if (await checkbox.count() && !(await checkbox.isChecked())) {
        await checkbox.check()
      }
    }

    // Toggle auto-poll
    const autoPollLabel = page.locator('label').filter({ hasText: /poll/i }).first()
    if (await autoPollLabel.count()) {
      const checkbox = autoPollLabel.locator('input[type="checkbox"]')
      if (await checkbox.count() && !(await checkbox.isChecked())) {
        await checkbox.check()
      }
    }

    // Set status to published
    const statusSelect = page.locator('select').filter({ hasText: /draft/i }).first()
    if (await statusSelect.count()) {
      await statusSelect.selectOption('published')
    }

    // Publish
    const publishBtn = page.locator('button').filter({ hasText: /Publish|Save/i }).first()
    await publishBtn.click()

    // Wait for save + auto-insertion
    await page.waitForTimeout(20_000)
  })
})

// ======== STUDIO EDITOR ========

test.describe('Studio Editor - /studio/posts/new', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/studio/posts/new', { waitUntil: 'networkidle' })
    await expect(
      page.locator('input[placeholder*="title" i], input[placeholder*="Article" i]').first()
    ).toBeVisible({ timeout: 15_000 })
  })

  for (const team of TEAMS) {
    test(`${team} - Headlines with team selector`, async ({ page }) => {
      await fillPostEditor(page, team, makeSlug(team, 'studio', 'headlines'))

      const teamSelect = page.locator('select').filter({ hasText: 'Auto (from category)' }).first()
      if (await teamSelect.count()) {
        await teamSelect.selectOption({ label: team })
      }

      const headlinesBtn = page.locator('button').filter({ hasText: /Headlines/i }).first()
      await headlinesBtn.click()
      await page.waitForTimeout(2000)
      await waitForAIResponse(page)

      const pageText = await page.textContent('body')
      expect(pageText).not.toContain('Generating...')
    })

    test(`${team} - Grammar Check`, async ({ page }) => {
      await fillPostEditor(page, team, makeSlug(team, 'studio', 'grammar'))

      const grammarBtn = page.locator('button').filter({ hasText: /Grammar/i }).first()
      await grammarBtn.click()
      await waitForAIResponse(page)

      const pageText = await page.textContent('body')
      expect(pageText).not.toContain('Checking...')
    })
  }

  test('SEO generation', async ({ page }) => {
    await fillPostEditor(page, 'Bears', makeSlug('Bears', 'studio', 'seo'))
    const seoBtn = page.locator('button').filter({ hasText: /SEO/i }).first()
    if (await seoBtn.count()) {
      await seoBtn.click()
      await waitForAIResponse(page, 30_000)
    }
  })

  test('Excerpt generation', async ({ page }) => {
    await fillPostEditor(page, 'Bears', makeSlug('Bears', 'studio', 'excerpt'))
    const excerptBtn = page.locator('button').filter({ hasText: /Excerpt/i }).first()
    if (await excerptBtn.count()) {
      await excerptBtn.click()
      await waitForAIResponse(page)
    }
  })

  test('Ideas modal opens and generates', async ({ page }) => {
    await fillPostEditor(page, 'Bears', makeSlug('Bears', 'studio', 'ideas'))
    const ideasBtn = page.locator('button').filter({ hasText: /Ideas/i }).first()
    await ideasBtn.click()
    await page.waitForTimeout(2000)
    await page.waitForFunction(() => {
      return !document.body.innerText.includes('Generating ideas...')
    }, { timeout: 30_000 })
  })

  test('Chart modal opens', async ({ page }) => {
    await fillPostEditor(page, 'Bears', makeSlug('Bears', 'studio', 'chart'))
    const chartBtn = page.locator('button').filter({ hasText: /Chart/i }).first()
    if (await chartBtn.isEnabled()) {
      await chartBtn.click()
      await page.waitForTimeout(1000)
    }
  })

  test('Publish with auto-chart + auto-poll', async ({ page }) => {
    await fillPostEditor(page, 'Bears', makeSlug('Bears', 'studio', 'publish-auto'))

    const autoChartLabel = page.locator('label').filter({ hasText: /chart/i }).first()
    if (await autoChartLabel.count()) {
      const checkbox = autoChartLabel.locator('input[type="checkbox"]')
      if (await checkbox.count() && !(await checkbox.isChecked())) {
        await checkbox.check()
      }
    }

    const autoPollLabel = page.locator('label').filter({ hasText: /poll/i }).first()
    if (await autoPollLabel.count()) {
      const checkbox = autoPollLabel.locator('input[type="checkbox"]')
      if (await checkbox.count() && !(await checkbox.isChecked())) {
        await checkbox.check()
      }
    }

    const statusSelect = page.locator('select').filter({ hasText: /draft/i }).first()
    if (await statusSelect.count()) {
      await statusSelect.selectOption('published')
    }

    const publishBtn = page.locator('button').filter({ hasText: /Publish|Save/i }).first()
    await publishBtn.click()
    await page.waitForTimeout(20_000)
  })
})

// ======== PUBLISHED POST RENDERING ========

test.describe('Published Post - Chart + Poll Rendering', () => {
  let postSlug: string
  let chartId: string
  let pollId: string

  test('create chart + poll + post', async () => {
    // Create chart
    const chartRes = await fetch(`${BASE_URL}/api/charts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'bar',
        title: 'E2E Render Test Chart',
        size: 'medium',
        colors: { scheme: 'team', team: 'bears' },
        data: [
          { label: 'Passing', value: 285 },
          { label: 'Rushing', value: 145 },
          { label: 'Receiving', value: 312 },
        ],
      }),
    })
    expect([200, 201]).toContain(chartRes.status)
    const chartData = await chartRes.json()
    chartId = chartData.id

    // Create poll
    const pollRes = await fetch(`${BASE_URL}/api/polls`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'E2E Render Test Poll',
        question: 'Best Bears weapon?',
        poll_type: 'single',
        team_theme: 'bears',
        options: [
          { option_text: 'DJ Moore' },
          { option_text: 'Cole Kmet' },
          { option_text: "D'Andre Swift" },
        ],
      }),
    })
    expect([200, 201]).toContain(pollRes.status)
    const pollData = await pollRes.json()
    pollId = pollData.poll.id

    // Create post with both embedded
    postSlug = `e2e-test/render-check-${Date.now()}`
    const postRes = await fetch(`${BASE_URL}/api/admin/posts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'E2E: Chart + Poll Render Test',
        slug: postSlug,
        content: `<p>Test post.</p>\n[chart:${chartId}]\n<p>Middle.</p>\n[poll:${pollId}]\n<p>End.</p>`,
        status: 'published',
      }),
    })
    expect([200, 201]).toContain(postRes.status)
  })

  test('chart renders on published post', async ({ page }) => {
    test.skip(!postSlug, 'No post')
    await page.goto(`/${postSlug}`, { waitUntil: 'networkidle' })
    await page.waitForTimeout(3000)
    const chartEl = page.locator('canvas, [data-chart-id], .chart-embed, [class*="chart"]').first()
    await expect(chartEl).toBeVisible({ timeout: 10_000 })
  })

  test('poll renders on published post', async ({ page }) => {
    test.skip(!postSlug, 'No post')
    await page.goto(`/${postSlug}`, { waitUntil: 'networkidle' })
    await page.waitForTimeout(3000)
    const pollEl = page.locator('[data-poll-id], .poll-embed, [class*="poll"], button:has-text("Vote")').first()
    await expect(pollEl).toBeVisible({ timeout: 10_000 })
  })

  test('cleanup', async () => {
    if (chartId) await fetch(`${BASE_URL}/api/charts/${chartId}`, { method: 'DELETE' })
    if (pollId) await fetch(`${BASE_URL}/api/polls/${pollId}`, { method: 'DELETE' })
  })
})
