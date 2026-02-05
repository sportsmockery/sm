# Season Simulator Test Results

> **Generated:** 2026-02-05T03:42:12.427Z
> **Test Environment:** https://test.sportsmockery.com
> **Total Scenarios:** 100

---

## Summary

| Metric | Value |
|--------|-------|
| **Total Tests** | 100 |
| **Passed** | 100 (100.0%) |
| **Failed** | 0 (0.0%) |
| **Avg Response Time** | 235ms |
| **Min Response Time** | 157ms |
| **Max Response Time** | 1309ms |

---

## Results by Sport

| Sport | Passed | Failed | Pass Rate |
|-------|--------|--------|-----------|
| Chicago Bears | 20 | 0 | 100.0% |
| Chicago Bulls | 20 | 0 | 100.0% |
| Chicago Blackhawks | 20 | 0 | 100.0% |
| Chicago Cubs | 20 | 0 | 100.0% |
| Chicago White Sox | 20 | 0 | 100.0% |

---

## Timing Analysis

### Response Time by Sport

| Sport | Avg (ms) | Min (ms) | Max (ms) | Samples |
|-------|----------|----------|----------|---------|
| Chicago Bears | 362 | 174 | 1309 | 20 |
| Chicago Bulls | 203 | 180 | 264 | 20 |
| Chicago Blackhawks | 196 | 176 | 227 | 20 |
| Chicago Cubs | 210 | 173 | 351 | 20 |
| Chicago White Sox | 202 | 157 | 260 | 20 |

---

## Validation Checks Performed

Each simulation response is validated for:

1. **Response Structure**
   - `success` flag is `true`
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

All tests passed successfully. The season simulator is functioning correctly across all sports.
