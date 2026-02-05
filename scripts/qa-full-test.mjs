#!/usr/bin/env node
/**
 * SportsMockery Full QA Test Suite
 * Tests all major user-facing features before production launch
 *
 * Run: node scripts/qa-full-test.mjs
 */

const BASE_URL = process.env.BASE_URL || 'https://test.sportsmockery.com'

const now = new Date()
console.log('╔════════════════════════════════════════════════════════════════════════════╗')
console.log('║              SPORTSMOCKERY FULL QA TEST SUITE                              ║')
console.log('║                              ' + now.toISOString().split('T')[0] + '                                  ║')
console.log('╚════════════════════════════════════════════════════════════════════════════╝')
console.log(`\nTesting against: ${BASE_URL}\n`)

const results = {
  pages: [],
  apis: [],
  features: []
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

async function testPage(name, path, expectedStatus = 200) {
  try {
    const start = Date.now()
    const response = await fetch(`${BASE_URL}${path}`, {
      headers: { 'User-Agent': 'SM-QA-Test/1.0' }
    })
    const duration = Date.now() - start
    const passed = response.status === expectedStatus

    results.pages.push({
      name,
      path,
      status: response.status,
      duration,
      passed,
      error: passed ? null : `Expected ${expectedStatus}, got ${response.status}`
    })

    return { passed, status: response.status, duration }
  } catch (error) {
    results.pages.push({
      name,
      path,
      status: 'ERROR',
      duration: 0,
      passed: false,
      error: error.message
    })
    return { passed: false, status: 'ERROR', error: error.message }
  }
}

async function testAPI(name, path, method = 'GET', body = null) {
  try {
    const start = Date.now()
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'SM-QA-Test/1.0'
      }
    }
    if (body) options.body = JSON.stringify(body)

    const response = await fetch(`${BASE_URL}${path}`, options)
    const duration = Date.now() - start
    const passed = response.status >= 200 && response.status < 400

    let data = null
    try {
      data = await response.json()
    } catch (e) {
      // Non-JSON response
    }

    results.apis.push({
      name,
      path,
      method,
      status: response.status,
      duration,
      passed,
      hasData: data !== null
    })

    return { passed, status: response.status, duration, data }
  } catch (error) {
    results.apis.push({
      name,
      path,
      method,
      status: 'ERROR',
      duration: 0,
      passed: false,
      error: error.message
    })
    return { passed: false, status: 'ERROR', error: error.message }
  }
}

// ============================================================================
// 1. CORE PAGES TEST
// ============================================================================
console.log('\n══════════════════════════════════════════════════════════════════════════════')
console.log('                         1. CORE PAGES TEST')
console.log('══════════════════════════════════════════════════════════════════════════════\n')

const corePages = [
  ['Homepage', '/'],
  ['About', '/about'],
  ['Contact', '/contact'],
  ['Privacy', '/privacy'],
  ['Pricing', '/pricing'],
  ['Search', '/search'],
  ['Authors', '/authors'],
  ['Polls', '/polls'],
]

for (const [name, path] of corePages) {
  const result = await testPage(name, path)
  const icon = result.passed ? '✅' : '❌'
  const time = result.duration ? `(${result.duration}ms)` : ''
  console.log(`   ${icon} ${name}: ${result.status} ${time}`)
}

// ============================================================================
// 2. TEAM PAGES TEST (Hub Pages Only - Full test in test-all-team-pages.mjs)
// ============================================================================
console.log('\n══════════════════════════════════════════════════════════════════════════════')
console.log('                         2. TEAM PAGES TEST')
console.log('══════════════════════════════════════════════════════════════════════════════\n')

const teams = [
  ['Chicago Bears', '/chicago-bears'],
  ['Chicago Bulls', '/chicago-bulls'],
  ['Chicago Cubs', '/chicago-cubs'],
  ['Chicago White Sox', '/chicago-white-sox'],
  ['Chicago Blackhawks', '/chicago-blackhawks'],
]

const teamSubpages = ['roster', 'schedule', 'scores', 'stats', 'players']

for (const [name, basePath] of teams) {
  console.log(`\n   ${name}:`)

  // Test hub page
  const hubResult = await testPage(`${name} Hub`, basePath)
  console.log(`      ${hubResult.passed ? '✅' : '❌'} Hub: ${hubResult.status} (${hubResult.duration}ms)`)

  // Test subpages
  for (const subpage of teamSubpages) {
    const result = await testPage(`${name} ${subpage}`, `${basePath}/${subpage}`)
    console.log(`      ${result.passed ? '✅' : '❌'} ${subpage}: ${result.status} (${result.duration}ms)`)
  }
}

// ============================================================================
// 3. FEATURE PAGES TEST
// ============================================================================
console.log('\n══════════════════════════════════════════════════════════════════════════════')
console.log('                         3. FEATURE PAGES TEST')
console.log('══════════════════════════════════════════════════════════════════════════════\n')

const featurePages = [
  ['Scout AI', '/scout-ai'],
  ['GM Trade Simulator', '/gm'],
  ['Mock Draft', '/mock-draft'],
  ['Fan Chat', '/fan-chat'],
  ['Feed', '/feed'],
  ['Players Search', '/players'],
]

for (const [name, path] of featurePages) {
  const result = await testPage(name, path)
  const icon = result.passed ? '✅' : '❌'
  console.log(`   ${icon} ${name}: ${result.status} (${result.duration}ms)`)
}

// ============================================================================
// 4. API ENDPOINTS TEST
// ============================================================================
console.log('\n══════════════════════════════════════════════════════════════════════════════')
console.log('                         4. API ENDPOINTS TEST')
console.log('══════════════════════════════════════════════════════════════════════════════\n')

// Feed & Content APIs
console.log('\n   Feed & Content:')
await testAPI('Feed', '/api/feed').then(r => console.log(`      ${r.passed ? '✅' : '❌'} Feed: ${r.status} (${r.duration}ms)`))
await testAPI('Homepage', '/api/homepage').then(r => console.log(`      ${r.passed ? '✅' : '❌'} Homepage: ${r.status} (${r.duration}ms)`))

// Team Data APIs
console.log('\n   Team Data:')
const teamAPIs = [
  ['Bears Roster', '/api/bears/roster'],
  ['Bulls Roster', '/api/bulls/roster'],
  ['Cubs Roster', '/api/cubs/roster'],
  ['White Sox Roster', '/api/whitesox/roster'],
  ['Blackhawks Roster', '/api/blackhawks/roster'],
]

for (const [name, path] of teamAPIs) {
  const result = await testAPI(name, path)
  console.log(`      ${result.passed ? '✅' : '❌'} ${name}: ${result.status} (${result.duration}ms)`)
}

// GM APIs
console.log('\n   GM Trade Simulator:')
await testAPI('GM Teams', '/api/gm/teams').then(r => console.log(`      ${r.passed ? '✅' : '❌'} Teams: ${r.status} (${r.duration}ms)`))
await testAPI('GM Leaderboard', '/api/gm/leaderboard').then(r => console.log(`      ${r.passed ? '✅' : '❌'} Leaderboard: ${r.status} (${r.duration}ms)`))

// Live Games API
console.log('\n   Live Games:')
await testAPI('Live Games', '/api/live-games').then(r => console.log(`      ${r.passed ? '✅' : '❌'} Live Games: ${r.status} (${r.duration}ms)`))

// ============================================================================
// 5. AUTHENTICATION FLOW TEST
// ============================================================================
console.log('\n══════════════════════════════════════════════════════════════════════════════')
console.log('                         5. AUTHENTICATION FLOW TEST')
console.log('══════════════════════════════════════════════════════════════════════════════\n')

const authPages = [
  ['Signup Page', '/signup'],
  ['Login Page', '/login'],
  ['Forgot Password', '/forgot-password'],
  ['Reset Password', '/reset-password'],
  ['Profile (unauth)', '/profile'], // Should redirect or show login
]

for (const [name, path] of authPages) {
  const result = await testPage(name, path)
  // 200 or 302/307 redirect is acceptable
  const passed = result.status === 200 || result.status === 302 || result.status === 307
  console.log(`   ${passed ? '✅' : '❌'} ${name}: ${result.status} (${result.duration}ms)`)
}

// ============================================================================
// 6. ADMIN PAGES TEST (Expect redirects for unauth)
// ============================================================================
console.log('\n══════════════════════════════════════════════════════════════════════════════')
console.log('                         6. ADMIN PAGES TEST (Unauth)')
console.log('══════════════════════════════════════════════════════════════════════════════\n')

const adminPages = [
  ['Admin Dashboard', '/admin'],
  ['Admin Posts', '/admin/posts'],
  ['Admin Users', '/admin/users'],
  ['Admin Media', '/admin/media'],
  ['Admin Settings', '/admin/settings'],
]

for (const [name, path] of adminPages) {
  const result = await testPage(name, path)
  // Should either redirect (302/307) or show unauthorized (401/403) or render a page (200)
  const passed = [200, 302, 307, 401, 403].includes(result.status)
  console.log(`   ${passed ? '✅' : '❌'} ${name}: ${result.status} (${result.duration}ms)`)
}

// ============================================================================
// 7. PERFORMANCE BENCHMARKS
// ============================================================================
console.log('\n══════════════════════════════════════════════════════════════════════════════')
console.log('                         7. PERFORMANCE BENCHMARKS')
console.log('══════════════════════════════════════════════════════════════════════════════\n')

const criticalPages = [
  ['Homepage', '/', 3000],
  ['Bears Hub', '/chicago-bears', 2000],
  ['Scout AI', '/scout-ai', 2000],
  ['GM Simulator', '/gm', 3000],
]

for (const [name, path, maxTime] of criticalPages) {
  const start = Date.now()
  await fetch(`${BASE_URL}${path}`, { headers: { 'User-Agent': 'SM-QA-Test/1.0' } })
  const duration = Date.now() - start
  const passed = duration < maxTime
  console.log(`   ${passed ? '✅' : '⚠️'} ${name}: ${duration}ms (target: <${maxTime}ms)`)
}

// ============================================================================
// 8. ERROR HANDLING TEST
// ============================================================================
console.log('\n══════════════════════════════════════════════════════════════════════════════')
console.log('                         8. ERROR HANDLING TEST')
console.log('══════════════════════════════════════════════════════════════════════════════\n')

// 404 Test
const notFoundResult = await testPage('404 Page', '/this-page-does-not-exist-12345', 404)
console.log(`   ${notFoundResult.passed ? '✅' : '❌'} 404 Page: ${notFoundResult.status}`)

// Invalid API calls
const invalidAPI = await testAPI('Invalid API', '/api/nonexistent-endpoint')
const invalidAPIPassed = invalidAPI.status === 404
console.log(`   ${invalidAPIPassed ? '✅' : '❌'} Invalid API returns 404: ${invalidAPI.status}`)

// ============================================================================
// FINAL SUMMARY
// ============================================================================
console.log('\n\n╔════════════════════════════════════════════════════════════════════════════╗')
console.log('║                              FINAL SUMMARY                                 ║')
console.log('╚════════════════════════════════════════════════════════════════════════════╝')

const pagesPassed = results.pages.filter(p => p.passed).length
const pagesTotal = results.pages.length
const apisPassed = results.apis.filter(a => a.passed).length
const apisTotal = results.apis.length

console.log(`\n📊 RESULTS:`)
console.log(`   Pages: ${pagesPassed}/${pagesTotal} passed`)
console.log(`   APIs:  ${apisPassed}/${apisTotal} passed`)

// Calculate average response times
const avgPageTime = results.pages.reduce((sum, p) => sum + (p.duration || 0), 0) / results.pages.length
const avgAPITime = results.apis.reduce((sum, a) => sum + (a.duration || 0), 0) / results.apis.length

console.log(`\n⏱️  PERFORMANCE:`)
console.log(`   Avg page load: ${Math.round(avgPageTime)}ms`)
console.log(`   Avg API response: ${Math.round(avgAPITime)}ms`)

// List failures
const failures = [
  ...results.pages.filter(p => !p.passed).map(p => `Page: ${p.name} (${p.path}) - ${p.status}`),
  ...results.apis.filter(a => !a.passed).map(a => `API: ${a.name} (${a.path}) - ${a.status}`),
]

if (failures.length > 0) {
  console.log(`\n❌ FAILURES (${failures.length}):`)
  failures.forEach(f => console.log(`   - ${f}`))
} else {
  console.log('\n✅ ALL TESTS PASSED!')
}

// Overall status
const overallPassed = (pagesPassed === pagesTotal) && (apisPassed === apisTotal)
console.log(`\n🎯 OVERALL: ${overallPassed ? '✅ READY FOR LAUNCH' : '❌ ISSUES NEED ATTENTION'}`)

// Exit with appropriate code
process.exit(overallPassed ? 0 : 1)
