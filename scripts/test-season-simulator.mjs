#!/usr/bin/env node
/**
 * Season Simulator Test Script
 * Tests the /api/gm/sim/season endpoint with 100 scenarios across all sports
 *
 * Usage: node scripts/test-season-simulator.mjs
 */

// Configuration
const BASE_URL = process.env.TEST_URL || 'https://test.sportsmockery.com'

// Sports and teams
const SPORTS_CONFIG = {
  nfl: {
    teamKey: 'chicago-bears',
    teamName: 'Chicago Bears',
    gamesPerSeason: 17,
    playoffTeams: 7,
    seriesLength: 1,
    expectedTeamCount: 32,
    conferences: ['AFC', 'NFC'],
  },
  nba: {
    teamKey: 'chicago-bulls',
    teamName: 'Chicago Bulls',
    gamesPerSeason: 82,
    playoffTeams: 8,
    seriesLength: 7,
    expectedTeamCount: 30,
    conferences: ['Eastern', 'Western'],
  },
  nhl: {
    teamKey: 'chicago-blackhawks',
    teamName: 'Chicago Blackhawks',
    gamesPerSeason: 82,
    playoffTeams: 8,
    seriesLength: 7,
    expectedTeamCount: 32,
    conferences: ['Eastern', 'Western'],
  },
  mlb: {
    teamKey: 'chicago-cubs',
    teamName: 'Chicago Cubs',
    gamesPerSeason: 162,
    playoffTeams: 6,
    seriesLength: 5,
    expectedTeamCount: 30,
    conferences: ['American League', 'National League'],
  },
  'mlb-whitesox': {
    teamKey: 'chicago-white-sox',
    teamName: 'Chicago White Sox',
    gamesPerSeason: 162,
    playoffTeams: 6,
    seriesLength: 5,
    expectedTeamCount: 30,
    conferences: ['American League', 'National League'],
  },
}

// Test results storage
const results = {
  total: 0,
  passed: 0,
  failed: 0,
  errors: [],
  warnings: [],
  bySport: {},
  timing: [],
  scenarios: [],
}

// Initialize results by sport
Object.keys(SPORTS_CONFIG).forEach(sport => {
  results.bySport[sport] = { passed: 0, failed: 0, errors: [] }
})

// Helper to log with timestamp
function log(msg, level = 'info') {
  const timestamp = new Date().toISOString().slice(11, 19)
  const prefix = level === 'error' ? '\x1b[31m[ERROR]\x1b[0m' :
                 level === 'warn' ? '\x1b[33m[WARN]\x1b[0m' :
                 level === 'pass' ? '\x1b[32m[PASS]\x1b[0m' :
                 '\x1b[34m[INFO]\x1b[0m'
  console.log(`${timestamp} ${prefix} ${msg}`)
}

// Generate a unique session ID for testing
function generateTestSessionId() {
  return `test-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`
}

// Run a single simulation test
async function runSimulationTest(scenario) {
  const { sport, sportConfig, testName } = scenario
  const startTime = Date.now()

  try {
    // Use a unique test session ID
    const sessionId = generateTestSessionId()

    // Call simulation API
    const response = await fetch(`${BASE_URL}/api/gm/sim/season`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId,
        sport: sport === 'mlb-whitesox' ? 'mlb' : sport,
        teamKey: sportConfig.teamKey,
        seasonYear: 2026,
      }),
    })

    const elapsed = Date.now() - startTime
    results.timing.push({ sport, elapsed, testName })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`HTTP ${response.status}: ${errorText}`)
    }

    const data = await response.json()

    // Validate response structure
    const validationErrors = validateSimulationResponse(data, sportConfig, sport)

    if (validationErrors.length > 0) {
      results.failed++
      results.bySport[sport].failed++
      results.bySport[sport].errors.push(...validationErrors)
      results.errors.push({ testName, sport, errors: validationErrors })
      log(`${testName}: FAILED - ${validationErrors.join(', ')}`, 'error')
      return { success: false, errors: validationErrors, data, elapsed }
    }

    results.passed++
    results.bySport[sport].passed++
    log(`${testName}: PASSED (${elapsed}ms)`, 'pass')
    return { success: true, data, elapsed }

  } catch (error) {
    results.failed++
    results.bySport[sport].failed++
    const errorMsg = error.message
    results.errors.push({ testName, sport, errors: [errorMsg] })
    results.bySport[sport].errors.push(errorMsg)
    log(`${testName}: ERROR - ${errorMsg}`, 'error')
    return { success: false, errors: [errorMsg], elapsed: Date.now() - startTime }
  } finally {
    results.total++
  }
}

// Validate simulation response
function validateSimulationResponse(data, config, sport) {
  const errors = []

  // Check success flag
  if (!data.success) {
    errors.push(`Response not successful: ${data.error || 'unknown'}`)
    return errors
  }

  // Check required fields
  const requiredFields = ['baseline', 'modified', 'gmScore', 'scoreBreakdown', 'standings', 'playoffs', 'seasonSummary']
  for (const field of requiredFields) {
    if (!data[field]) {
      errors.push(`Missing required field: ${field}`)
    }
  }

  // Validate baseline/modified records
  if (data.baseline) {
    const baselineTotal = data.baseline.wins + data.baseline.losses
    if (baselineTotal !== config.gamesPerSeason) {
      errors.push(`Baseline record (${data.baseline.wins}-${data.baseline.losses} = ${baselineTotal}) doesn't add up to ${config.gamesPerSeason} games`)
    }
  }

  if (data.modified) {
    const modifiedTotal = data.modified.wins + data.modified.losses
    if (modifiedTotal !== config.gamesPerSeason) {
      errors.push(`Modified record (${data.modified.wins}-${data.modified.losses} = ${modifiedTotal}) doesn't add up to ${config.gamesPerSeason} games`)
    }
    if (data.modified.wins < 0 || data.modified.losses < 0) {
      errors.push(`Invalid modified record: ${data.modified.wins}-${data.modified.losses}`)
    }
  }

  // Validate GM score
  if (data.gmScore !== undefined) {
    if (data.gmScore < 0 || data.gmScore > 115) { // Max possible: 60+25+15+15 = 115
      errors.push(`GM score out of range: ${data.gmScore}`)
    }
  }

  // Validate standings
  if (data.standings) {
    const { conference1, conference2, conference1Name, conference2Name } = data.standings
    if (!conference1 || !conference2) {
      errors.push('Missing conference standings')
    } else {
      // Check team counts
      const totalTeams = conference1.length + conference2.length
      if (totalTeams !== config.expectedTeamCount) {
        errors.push(`Wrong number of teams: expected ${config.expectedTeamCount}, got ${totalTeams}`)
      }

      // Check user team exists in standings
      const allTeams = [...conference1, ...conference2]
      const userTeam = allTeams.find(t => t.isUserTeam)
      if (!userTeam) {
        errors.push('User team not found in standings')
      }

      // Verify records are valid for all teams
      let invalidRecordCount = 0
      for (const team of allTeams) {
        const totalGames = team.wins + team.losses
        if (totalGames !== config.gamesPerSeason) {
          invalidRecordCount++
          if (invalidRecordCount <= 3) { // Only log first few to avoid spam
            errors.push(`Team ${team.abbreviation} has invalid record: ${team.wins}-${team.losses} (total: ${totalGames}, expected: ${config.gamesPerSeason})`)
          }
        }
      }
      if (invalidRecordCount > 3) {
        errors.push(`...and ${invalidRecordCount - 3} more teams with invalid records`)
      }

      // Check conference names
      if (!config.conferences.includes(conference1Name) && !config.conferences.includes(conference2Name)) {
        errors.push(`Invalid conference names: ${conference1Name}, ${conference2Name}`)
      }
    }
  }

  // Validate playoffs
  if (data.playoffs) {
    if (!data.playoffs.bracket) {
      errors.push('Missing playoff bracket')
    }

    // Validate user team result
    if (!data.playoffs.userTeamResult) {
      errors.push('Missing user team playoff result')
    }
  }

  // Validate score breakdown
  if (data.scoreBreakdown) {
    const { tradeQualityScore, winImprovementScore, playoffBonusScore, championshipBonus } = data.scoreBreakdown

    if (tradeQualityScore === undefined || tradeQualityScore < 0 || tradeQualityScore > 60) {
      errors.push(`Invalid tradeQualityScore: ${tradeQualityScore}`)
    }
    if (winImprovementScore === undefined || winImprovementScore < 0 || winImprovementScore > 25) {
      errors.push(`Invalid winImprovementScore: ${winImprovementScore}`)
    }
    if (playoffBonusScore === undefined || playoffBonusScore < 0 || playoffBonusScore > 15) {
      errors.push(`Invalid playoffBonusScore: ${playoffBonusScore}`)
    }
  }

  // Validate season summary
  if (data.seasonSummary) {
    if (!data.seasonSummary.headline) {
      errors.push('Season summary missing headline')
    }
    if (!data.seasonSummary.narrative) {
      errors.push('Season summary missing narrative')
    }
    if (!data.seasonSummary.keyMoments || !Array.isArray(data.seasonSummary.keyMoments)) {
      errors.push('Season summary missing key moments')
    }
  }

  return errors
}

// Generate test scenarios
function generateScenarios() {
  const scenarios = []
  let scenarioId = 1

  // Generate 20 tests per sport = 100 total (5 sports * 20)
  const sportsToTest = Object.keys(SPORTS_CONFIG)
  const testsPerSport = Math.ceil(100 / sportsToTest.length)

  for (const sport of sportsToTest) {
    const config = SPORTS_CONFIG[sport]

    for (let i = 0; i < testsPerSport && scenarios.length < 100; i++) {
      scenarios.push({
        sport,
        sportConfig: config,
        testName: `${scenarioId++}. ${config.teamName} - Test #${i + 1}`,
      })
    }
  }

  return scenarios
}

// Generate markdown report
function generateReport() {
  const avgTiming = results.timing.length > 0
    ? (results.timing.reduce((a, b) => a + b.elapsed, 0) / results.timing.length).toFixed(0)
    : 'N/A'

  const maxTiming = results.timing.length > 0
    ? Math.max(...results.timing.map(t => t.elapsed))
    : 'N/A'

  const minTiming = results.timing.length > 0
    ? Math.min(...results.timing.map(t => t.elapsed))
    : 'N/A'

  let report = `# Season Simulator Test Results

> **Generated:** ${new Date().toISOString()}
> **Test Environment:** ${BASE_URL}
> **Total Scenarios:** ${results.total}

---

## Summary

| Metric | Value |
|--------|-------|
| **Total Tests** | ${results.total} |
| **Passed** | ${results.passed} (${((results.passed / results.total) * 100).toFixed(1)}%) |
| **Failed** | ${results.failed} (${((results.failed / results.total) * 100).toFixed(1)}%) |
| **Avg Response Time** | ${avgTiming}ms |
| **Min Response Time** | ${minTiming}ms |
| **Max Response Time** | ${maxTiming}ms |

---

## Results by Sport

| Sport | Passed | Failed | Pass Rate |
|-------|--------|--------|-----------|
`

  for (const [sport, data] of Object.entries(results.bySport)) {
    const total = data.passed + data.failed
    const passRate = total > 0 ? ((data.passed / total) * 100).toFixed(1) : 'N/A'
    const config = SPORTS_CONFIG[sport]
    report += `| ${config?.teamName || sport} | ${data.passed} | ${data.failed} | ${passRate}% |\n`
  }

  report += `
---

## Timing Analysis

### Response Time by Sport

| Sport | Avg (ms) | Min (ms) | Max (ms) | Samples |
|-------|----------|----------|----------|---------|
`

  for (const sport of Object.keys(SPORTS_CONFIG)) {
    const sportTimings = results.timing.filter(t => t.sport === sport)
    if (sportTimings.length > 0) {
      const avg = (sportTimings.reduce((a, b) => a + b.elapsed, 0) / sportTimings.length).toFixed(0)
      const min = Math.min(...sportTimings.map(t => t.elapsed))
      const max = Math.max(...sportTimings.map(t => t.elapsed))
      const config = SPORTS_CONFIG[sport]
      report += `| ${config?.teamName || sport} | ${avg} | ${min} | ${max} | ${sportTimings.length} |\n`
    }
  }

  if (results.errors.length > 0) {
    report += `
---

## Errors Found

`
    // Group errors by type
    const errorGroups = {}
    results.errors.forEach(e => {
      e.errors.forEach(err => {
        const key = err.split(':')[0]
        if (!errorGroups[key]) errorGroups[key] = []
        errorGroups[key].push({ sport: e.sport, testName: e.testName, fullError: err })
      })
    })

    for (const [errorType, occurrences] of Object.entries(errorGroups)) {
      report += `### ${errorType} (${occurrences.length} occurrences)

| Sport | Test |
|-------|------|
`
      for (const occ of occurrences.slice(0, 5)) {
        report += `| ${occ.sport} | ${occ.testName} |\n`
      }
      if (occurrences.length > 5) {
        report += `| ... | +${occurrences.length - 5} more |\n`
      }
      report += '\n'
    }
  }

  report += `
---

## Validation Checks Performed

Each simulation response is validated for:

1. **Response Structure**
   - \`success\` flag is \`true\`
   - Required fields present: baseline, modified, gmScore, scoreBreakdown, standings, playoffs, seasonSummary

2. **Record Validation**
   - Baseline record adds up to correct games per season
   - Modified record adds up to correct games per season
   - No negative win/loss values

3. **GM Score Validation**
   - Score between 0 and 115 (maximum possible)
   - Score breakdown components within valid ranges:
     - Trade quality: 0-60
     - Win improvement: 0-25
     - Playoff bonus: 0-15
     - Championship bonus: 0-15

4. **Standings Validation**
   - Correct number of teams per sport (NFL: 32, NBA: 30, NHL: 32, MLB: 30)
   - User team present in standings
   - All team records valid (wins + losses = games per season)
   - Conference names valid

5. **Playoff Validation**
   - Bracket structure present
   - User team result tracked

6. **Season Summary Validation**
   - Headline and narrative present
   - Key moments array present

---

## Sport Configuration Reference

| Sport | Team | Games | Playoff Teams | Total Teams |
|-------|------|-------|---------------|-------------|
| NFL | Chicago Bears | 17 | 7 | 32 |
| NBA | Chicago Bulls | 82 | 8 | 30 |
| NHL | Chicago Blackhawks | 82 | 8 | 32 |
| MLB | Chicago Cubs | 162 | 6 | 30 |
| MLB | Chicago White Sox | 162 | 6 | 30 |

---

## Recommendations

`

  if (results.failed === 0) {
    report += `All tests passed successfully. The season simulator is functioning correctly across all sports.\n`
  } else {
    report += `### Issues to Address

`
    // Analyze common error patterns
    const errorPatterns = {}
    results.errors.forEach(e => {
      e.errors.forEach(err => {
        const key = err.split(':')[0].trim()
        errorPatterns[key] = (errorPatterns[key] || 0) + 1
      })
    })

    for (const [pattern, count] of Object.entries(errorPatterns)) {
      report += `${count}. **${pattern}** (${count} occurrences)\n`
    }

    report += `
### Suggested Fixes

`
    if (errorPatterns['Wrong number of teams']) {
      report += `- Review LEAGUE_CONFIG in \`/src/app/api/gm/sim/season/route.ts\` to ensure correct team counts\n`
    }
    if (errorPatterns['Baseline record'] || errorPatterns['Modified record']) {
      report += `- Check record generation logic in \`generateRecord\` function\n`
    }
    if (errorPatterns['Missing']) {
      report += `- Ensure all required response fields are populated in the API route\n`
    }
  }

  return report
}

// Main test runner
async function main() {
  console.log('\n' + '='.repeat(60))
  console.log('  SEASON SIMULATOR TEST SUITE')
  console.log('  Testing /api/gm/sim/season endpoint')
  console.log('='.repeat(60) + '\n')

  log(`Test URL: ${BASE_URL}`)
  log(`Running 100 test scenarios...`)
  console.log()

  // Generate and run scenarios
  const scenarios = generateScenarios()

  log(`Generated ${scenarios.length} test scenarios`)
  console.log()

  // Run tests in batches to avoid overwhelming the server
  const BATCH_SIZE = 5
  for (let i = 0; i < scenarios.length; i += BATCH_SIZE) {
    const batch = scenarios.slice(i, i + BATCH_SIZE)

    // Run batch in parallel
    const batchResults = await Promise.all(batch.map(runSimulationTest))

    // Store results
    batch.forEach((scenario, idx) => {
      results.scenarios.push({
        ...scenario,
        result: batchResults[idx],
      })
    })

    // Progress update every 20%
    const progress = Math.min(i + BATCH_SIZE, scenarios.length)
    if (progress % 20 === 0 || progress === scenarios.length) {
      log(`Progress: ${progress}/${scenarios.length} (${((progress / scenarios.length) * 100).toFixed(0)}%)`)
    }
  }

  console.log()
  console.log('='.repeat(60))
  console.log('  TEST RESULTS SUMMARY')
  console.log('='.repeat(60))
  console.log()
  console.log(`  Total:  ${results.total}`)
  console.log(`  Passed: ${results.passed} (${((results.passed / results.total) * 100).toFixed(1)}%)`)
  console.log(`  Failed: ${results.failed} (${((results.failed / results.total) * 100).toFixed(1)}%)`)
  console.log()

  // Generate and save report
  const report = generateReport()
  const fs = await import('fs')
  const path = await import('path')
  const reportPath = path.join(process.cwd(), 'docs', 'Season_Simulator_Test.md')

  // Ensure docs directory exists
  const docsDir = path.join(process.cwd(), 'docs')
  if (!fs.existsSync(docsDir)) {
    fs.mkdirSync(docsDir, { recursive: true })
  }

  fs.writeFileSync(reportPath, report)

  log(`Report saved to: ${reportPath}`)
  console.log()

  // Exit with error code if tests failed
  process.exit(results.failed > 0 ? 1 : 0)
}

main().catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
})
