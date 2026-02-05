# SportsMockery QA Testing Checklist

> **Last Updated:** February 5, 2026
> **Purpose:** Comprehensive pre-launch testing checklist for test.sportsmockery.com
> **Estimated Time:** 4-6 hours for full manual testing

---

## Table of Contents

1. [Testing Environment Setup](#1-testing-environment-setup)
2. [Authentication & User Flows](#2-authentication--user-flows)
3. [Homepage & Navigation](#3-homepage--navigation)
4. [Team Pages (30 Pages)](#4-team-pages-30-pages)
5. [Scout AI (Comprehensive)](#5-scout-ai-comprehensive)
6. [GM Trade Simulator](#6-gm-trade-simulator)
7. [Mock Draft](#7-mock-draft)
8. [Fan Chat](#8-fan-chat)
9. [Polls & Voting](#9-polls--voting)
10. [Content & Articles](#10-content--articles)
11. [User Profile & Preferences](#11-user-profile--preferences)
12. [Search Functionality](#12-search-functionality)
13. [Subscription & Payments](#13-subscription--payments)
14. [Admin Dashboard](#14-admin-dashboard) (includes PostIQ AI)
15. [Live Games & Real-Time](#15-live-games--real-time)
16. [Mobile & Responsive](#16-mobile--responsive)
17. [Performance & Load Testing](#17-performance--load-testing)
18. [Error Handling & Edge Cases](#18-error-handling--edge-cases)
19. [Cross-Browser Testing](#19-cross-browser-testing)
20. [Accessibility Testing](#20-accessibility-testing)
21. [Security Testing](#21-security-testing)
22. [Automated Test Scripts](#22-automated-test-scripts)
23. [Video Sections](#23-video-sections-bears-film-room--pinwheels--ivy)
24. [Internal Auto-Linking](#24-internal-auto-linking)
25. [Cron Jobs & Background Tasks](#25-cron-jobs--background-tasks)
26. [Audit Scripts & Logging](#26-audit-scripts--logging)
27. [Login, Redirects & Session Management](#27-login-redirects--session-management)
28. [Additional Admin Features](#28-additional-admin-features)

---

## 1. Testing Environment Setup

### Prerequisites
- [ ] Access to test.sportsmockery.com
- [ ] Test user accounts (regular user, SM+ subscriber, admin)
- [ ] Multiple browsers installed (Chrome, Firefox, Safari, Edge)
- [ ] Mobile devices or emulators (iOS, Android)
- [ ] Network throttling tools for slow connection testing
- [ ] Browser DevTools for network/console monitoring

### Test Accounts Needed
| Account Type | Email | Purpose |
|--------------|-------|---------|
| Guest | N/A | Anonymous browsing |
| Free User | test-free@example.com | Basic features |
| SM+ Subscriber | test-plus@example.com | Premium features |
| Admin | test-admin@example.com | Admin dashboard |

### Environment Checklist
- [ ] Clear browser cache and cookies before testing
- [ ] Disable ad blockers
- [ ] Enable browser console for error monitoring
- [ ] Document current date/time (affects season data)

---

## 2. Authentication & User Flows

### 2.1 Sign Up Flow
| Test Case | Steps | Expected Result | Pass/Fail | Notes |
|-----------|-------|-----------------|-----------|-------|
| Valid signup | Enter valid email, password, name | Account created, redirected to profile | | |
| Duplicate email | Use existing email | Error: "Email already registered" | | |
| Weak password | Use "123" as password | Error: Password too weak | | |
| Invalid email | Enter "notanemail" | Error: Invalid email format | | |
| Empty fields | Submit with empty fields | Validation errors shown | | |
| Email confirmation | Check email after signup | Confirmation email received | | |

### 2.2 Login Flow
| Test Case | Steps | Expected Result | Pass/Fail | Notes |
|-----------|-------|-----------------|-----------|-------|
| Valid login | Enter correct credentials | Logged in, redirected | | |
| Wrong password | Enter incorrect password | Error: Invalid credentials | | |
| Non-existent user | Enter unknown email | Error: Invalid credentials | | |
| Remember me | Check "remember me", close browser, reopen | Still logged in | | |
| Session timeout | Wait for session expiry | Redirected to login | | |

### 2.3 Password Reset
| Test Case | Steps | Expected Result | Pass/Fail | Notes |
|-----------|-------|-----------------|-----------|-------|
| Request reset | Click "Forgot Password", enter email | Reset email sent | | |
| Reset link works | Click link in email | Redirect to reset form | | |
| Set new password | Enter new password | Password updated, can login | | |
| Expired link | Use old reset link | Error: Link expired | | |

### 2.4 Logout
| Test Case | Steps | Expected Result | Pass/Fail | Notes |
|-----------|-------|-----------------|-----------|-------|
| Logout | Click logout | Session ended, redirected | | |
| Access protected route | Try /profile after logout | Redirected to login | | |

---

## 3. Homepage & Navigation

### 3.1 Homepage Content
| Test Case | Steps | Expected Result | Pass/Fail | Notes |
|-----------|-------|-----------------|-----------|-------|
| Page loads | Navigate to / | Homepage loads < 3 seconds | | |
| Editor picks display | Check above fold | Editor picks section visible | | |
| Trending posts | Scroll to trending | Trending articles displayed | | |
| Recent articles | Scroll to recent | Latest articles shown | | |
| Team filter (logged in) | With "eliminate others" enabled | Only favorite teams shown | | |
| Images load | Check all images | No broken images | | |

### 3.2 Header Navigation
| Test Case | Steps | Expected Result | Pass/Fail | Notes |
|-----------|-------|-----------------|-----------|-------|
| Logo link | Click logo | Returns to homepage | | |
| Team dropdown | Click Bears/Bulls/etc | Team page loads | | |
| Scout AI link | Click Scout AI | /scout-ai page loads | | |
| GM link | Click GM | /gm page loads | | |
| Fan Chat link | Click Fan Chat | /fan-chat page loads | | |
| Login button | Click Login (guest) | Login modal appears | | |
| Profile menu | Click avatar (logged in) | Dropdown with options | | |
| Search icon | Click search | Search modal/page opens | | |
| Theme toggle | Click theme switch | Dark/light mode toggles | | |

### 3.3 Footer Navigation
| Test Case | Steps | Expected Result | Pass/Fail | Notes |
|-----------|-------|-----------------|-----------|-------|
| About link | Click About | /about page loads | | |
| Contact link | Click Contact | /contact page loads | | |
| Privacy link | Click Privacy | /privacy page loads | | |
| Social links | Click Twitter/Facebook | Social pages open in new tab | | |

---

## 4. Team Pages (30 Pages)

### 4.0 Quick Health Check Script
Run this automated check first:
```bash
node scripts/test-all-team-pages.mjs
```

### 4.1 Chicago Bears

#### /chicago-bears (Hub)
| Test Case | Steps | Expected Result | Pass/Fail | Notes |
|-----------|-------|-----------------|-----------|-------|
| Page loads | Navigate to /chicago-bears | Page loads with team info | | |
| Current record | Check record display | Matches ESPN (should be 11-6 for 2025) | | |
| Quick links | Click roster/schedule/etc | Navigate to correct pages | | |
| Recent news | Check news section | Bears articles displayed | | |

#### /chicago-bears/roster
| Test Case | Steps | Expected Result | Pass/Fail | Notes |
|-----------|-------|-----------------|-----------|-------|
| Page loads | Navigate to page | Roster loads | | |
| Player count | Count displayed players | 53-81 players (roster + practice squad) | | |
| Position filter | Filter by position | Only that position shown | | |
| Player photos | Check headshots | Photos display (or placeholder) | | |
| Player click | Click a player | Navigate to player page | | |
| Search players | Type player name | Results filter in real-time | | |

#### /chicago-bears/schedule
| Test Case | Steps | Expected Result | Pass/Fail | Notes |
|-----------|-------|-----------------|-----------|-------|
| Page loads | Navigate to page | Schedule loads | | |
| Game count | Check total games | 17 regular season games | | |
| Completed games | Check past games | Show scores | | |
| Future games | Check upcoming | Show date/time/opponent | | |
| Bye week | Check bye display | Bye week indicated | | |

#### /chicago-bears/scores
| Test Case | Steps | Expected Result | Pass/Fail | Notes |
|-----------|-------|-----------------|-----------|-------|
| Page loads | Navigate to page | Scores page loads | | |
| Game selector | Dropdown shows games | All completed games listed | | |
| Select game | Choose a game | Box score loads | | |
| Player stats | Check stats table | Player stats displayed (not "No stats") | | |
| Quarter scores | Check linescore | All quarters shown | | |

#### /chicago-bears/stats
| Test Case | Steps | Expected Result | Pass/Fail | Notes |
|-----------|-------|-----------------|-----------|-------|
| Page loads | Navigate to page | Stats page loads | | |
| Team record | Check team record | Matches ESPN (11-6) | | |
| Leaderboards | Check stat leaders | Top players with stats | | |
| Passing leader | Check passing yards | Top passer shown | | |
| Rushing leader | Check rushing yards | Top rusher shown | | |
| Receiving leader | Check receiving yards | Top receiver shown | | |

#### /chicago-bears/players
| Test Case | Steps | Expected Result | Pass/Fail | Notes |
|-----------|-------|-----------------|-----------|-------|
| Page loads | Navigate to page | Players page loads | | |
| Player selector | Use dropdown/search | Can select player | | |
| Player profile | Select Caleb Williams | Profile shows bio, photo | | |
| Season stats | Check stats tab | 2025 season stats display | | |
| Game log | Check game log tab | Individual game stats | | |

---

### 4.2 Chicago Bulls

#### /chicago-bulls (Hub)
| Test Case | Steps | Expected Result | Pass/Fail | Notes |
|-----------|-------|-----------------|-----------|-------|
| Page loads | Navigate to /chicago-bulls | Page loads with team info | | |
| Current record | Check record display | Matches ESPN (should be ~23-22 for 2025-26) | | |
| Season value | Verify using 2026 | NBA uses ending year | | |

#### /chicago-bulls/roster
| Test Case | Steps | Expected Result | Pass/Fail | Notes |
|-----------|-------|-----------------|-----------|-------|
| Page loads | Navigate to page | Roster loads | | |
| Player count | Count displayed players | 15-20 players | | |
| Active filter | Check `is_current_bulls` | Only current Bulls shown | | |
| Player photos | Check headshots | Photos display | | |

#### /chicago-bulls/schedule
| Test Case | Steps | Expected Result | Pass/Fail | Notes |
|-----------|-------|-----------------|-----------|-------|
| Page loads | Navigate to page | Schedule loads | | |
| Game count | Check total games | 82 regular season games | | |
| Completed games | Check past games | Show scores | | |

#### /chicago-bulls/scores
| Test Case | Steps | Expected Result | Pass/Fail | Notes |
|-----------|-------|-----------------|-----------|-------|
| Page loads | Navigate to page | Scores page loads | | |
| Game selector | Dropdown shows games | All completed games listed | | |
| Box score | Select a game | Quarter scores, player stats | | |
| Player stats | Check stats table | Points, rebounds, assists, etc. | | |

#### /chicago-bulls/stats
| Test Case | Steps | Expected Result | Pass/Fail | Notes |
|-----------|-------|-----------------|-----------|-------|
| Page loads | Navigate to page | Stats page loads | | |
| Team stats | Check team averages | field_goal_pct, three_point_pct, etc. | | |
| Scoring leader | Check points leader | Top scorer shown | | |
| Rebounds leader | Check rebounds | Top rebounder shown | | |

#### /chicago-bulls/players
| Test Case | Steps | Expected Result | Pass/Fail | Notes |
|-----------|-------|-----------------|-----------|-------|
| Page loads | Navigate to page | Players page loads | | |
| Player profile | Select a player | Bio, photo, stats | | |
| Stats display | Check season stats | Not "No stats recorded" | | |

---

### 4.3 Chicago Blackhawks

#### /chicago-blackhawks (Hub)
| Test Case | Steps | Expected Result | Pass/Fail | Notes |
|-----------|-------|-----------------|-----------|-------|
| Page loads | Navigate to /chicago-blackhawks | Page loads | | |
| Current record | Check record display | Should show W-L-OTL format (21-22-8) | | |
| Season value | Verify using 2026 | NHL uses ending year | | |

#### /chicago-blackhawks/roster
| Test Case | Steps | Expected Result | Pass/Fail | Notes |
|-----------|-------|-----------------|-----------|-------|
| Page loads | Navigate to page | Roster loads | | |
| Player count | Count displayed players | 20-25 players | | |
| Position filter | Filter by position | Forwards/Defense/Goalies | | |

#### /chicago-blackhawks/schedule
| Test Case | Steps | Expected Result | Pass/Fail | Notes |
|-----------|-------|-----------------|-----------|-------|
| Page loads | Navigate to page | Schedule loads | | |
| Game count | Check total games | 82 regular season games | | |

#### /chicago-blackhawks/scores
| Test Case | Steps | Expected Result | Pass/Fail | Notes |
|-----------|-------|-----------------|-----------|-------|
| Page loads | Navigate to page | Scores page loads | | |
| Box score | Select a game | Period scores, player stats | | |
| Player stats | Check stats | Goals, assists, points, etc. | | |

#### /chicago-blackhawks/stats
| Test Case | Steps | Expected Result | Pass/Fail | Notes |
|-----------|-------|-----------------|-----------|-------|
| Page loads | Navigate to page | Stats page loads | | |
| OT losses | Check OTL count | Should show 8 for 21-22-8 record | | |
| Team stats | Check averages | power_play_pct, penalty_kill_pct | | |
| Points leader | Check leader | Top point scorer shown | | |

#### /chicago-blackhawks/players
| Test Case | Steps | Expected Result | Pass/Fail | Notes |
|-----------|-------|-----------------|-----------|-------|
| Page loads | Navigate to page | Players page loads | | |
| Select Connor Bedard | Choose Bedard | Full profile with stats | | |
| Stats accuracy | Compare to ESPN | Stats match official source | | |

---

### 4.4 Chicago Cubs

#### /chicago-cubs (Hub)
| Test Case | Steps | Expected Result | Pass/Fail | Notes |
|-----------|-------|-----------------|-----------|-------|
| Page loads | Navigate to /chicago-cubs | Page loads | | |
| Current record | Check record display | Should be 92-70 for 2025 | | |
| Season value | Verify using 2025 | MLB uses calendar year | | |

#### /chicago-cubs/roster
| Test Case | Steps | Expected Result | Pass/Fail | Notes |
|-----------|-------|-----------------|-----------|-------|
| Page loads | Navigate to page | Roster loads | | |
| Player count | Count displayed players | 26-45 players (NOT 200+) | | |
| Data status filter | Check filtering | Excludes needs_roster_review | | |

#### /chicago-cubs/schedule
| Test Case | Steps | Expected Result | Pass/Fail | Notes |
|-----------|-------|-----------------|-----------|-------|
| Page loads | Navigate to page | Schedule loads | | |
| Game count | Check total games | 162 regular season games | | |
| NOT zero games | Verify games display | Should NOT show "0 games" | | |

#### /chicago-cubs/scores
| Test Case | Steps | Expected Result | Pass/Fail | Notes |
|-----------|-------|-----------------|-----------|-------|
| Page loads | Navigate to page | Scores page loads | | |
| Box score | Select a game | Inning scores, player stats | | |
| Batting stats | Check table | AB, H, R, RBI, HR, etc. | | |
| Pitching stats | Check table | IP, H, R, ER, BB, K | | |

#### /chicago-cubs/stats
| Test Case | Steps | Expected Result | Pass/Fail | Notes |
|-----------|-------|-----------------|-----------|-------|
| Page loads | Navigate to page | Stats page loads | | |
| Team stats | Check team averages | batting_average, era, ops | | |
| Batting leader | Check BA leader | Top hitter shown | | |
| ERA leader | Check ERA leader | Top pitcher shown | | |

#### /chicago-cubs/players
| Test Case | Steps | Expected Result | Pass/Fail | Notes |
|-----------|-------|-----------------|-----------|-------|
| Page loads | Navigate to page | Players page loads | | |
| ESP ID join | Verify stats load | Uses espn_id for stats join | | |
| Player profile | Select a player | Bio, photo, stats | | |

---

### 4.5 Chicago White Sox

#### /chicago-white-sox (Hub)
| Test Case | Steps | Expected Result | Pass/Fail | Notes |
|-----------|-------|-----------------|-----------|-------|
| Page loads | Navigate to /chicago-white-sox | Page loads | | |
| Current record | Check record display | Should be 60-102 for 2025 | | |

#### /chicago-white-sox/roster
| Test Case | Steps | Expected Result | Pass/Fail | Notes |
|-----------|-------|-----------------|-----------|-------|
| Page loads | Navigate to page | Roster loads | | |
| Player count | Count displayed players | 26-45 players (NOT 200+) | | |
| NOT zero players | Verify roster displays | Should NOT show "0 players" | | |

#### /chicago-white-sox/schedule
| Test Case | Steps | Expected Result | Pass/Fail | Notes |
|-----------|-------|-----------------|-----------|-------|
| Page loads | Navigate to page | Schedule loads | | |
| Game count | Check total games | 162 regular season games | | |

#### /chicago-white-sox/scores
| Test Case | Steps | Expected Result | Pass/Fail | Notes |
|-----------|-------|-----------------|-----------|-------|
| Page loads | Navigate to page | Scores page loads | | |
| Box score | Select a game | Inning scores, player stats | | |

#### /chicago-white-sox/stats
| Test Case | Steps | Expected Result | Pass/Fail | Notes |
|-----------|-------|-----------------|-----------|-------|
| Page loads | Navigate to page | Stats page loads | | |
| Team stats | Check team averages | batting_average, era, ops | | |

#### /chicago-white-sox/players
| Test Case | Steps | Expected Result | Pass/Fail | Notes |
|-----------|-------|-----------------|-----------|-------|
| Page loads | Navigate to page | Players page loads | | |
| Player profile | Select a player | Bio, photo, stats | | |
| Stats accuracy | Compare to ESPN | Stats match official source | | |

---

## 5. Scout AI (Comprehensive)

### 5.1 Page Access & Interface
| Test Case | Steps | Expected Result | Pass/Fail | Notes |
|-----------|-------|-----------------|-----------|-------|
| Page loads | Navigate to /scout-ai | Chat interface loads < 2s | | |
| Scout branding | Check header | Scout AI logo at `/downloads/scout-v2.png` | | |
| Input field | Check input area | Text input with placeholder | | |
| Submit button | Check button | Enabled when text entered | | |
| Suggested prompts | Check below input | Clickable prompt suggestions | | |
| Click prompt | Click a suggestion | Prompt fills input field | | |

### 5.2 Basic Query Functionality
| Test Case | Steps | Expected Result | Pass/Fail | Notes |
|-----------|-------|-----------------|-----------|-------|
| Simple query | "Who is the Bears QB?" | Accurate response about Caleb Williams | | |
| Stats query | "Bears passing yards leader" | Returns correct stats | | |
| Team query | "Bulls current record" | Returns accurate record | | |
| Player query | "Connor Bedard stats" | Returns player stats | | |
| Comparison query | "Compare Bears vs Packers records" | Comparison table/text | | |
| Historical query | "Cubs 2016 World Series" | Historical info | | |
| Loading indicator | During query | Spinner/loading state shown | | |
| Response time | After query | < 10 seconds for response | | |

### 5.3 Response Quality (CRITICAL)
| Test Case | Steps | Expected Result | Pass/Fail | Notes |
|-----------|-------|-----------------|-----------|-------|
| No citation markers | Any query | Response has NO [1][2][3] markers | | |
| Accurate data | Stats queries | Data matches ESPN/official sources | | |
| Markdown rendering | Complex response | Proper markdown formatting | | |
| Player name handling | Misspelled name | AI handles typos gracefully | | |
| Team abbreviations | "CHI", "DAL" | Understands abbreviations | | |
| Natural language | Casual question | Understands informal queries | | |

### 5.4 Session Context Management
| Test Case | Steps | Expected Result | Pass/Fail | Notes |
|-----------|-------|-----------------|-----------|-------|
| Pronoun resolution | Ask about player, then "How many TDs does he have?" | Resolves "he" to mentioned player | | |
| Team context | Ask about Bears, then "their schedule" | Maintains Bears context | | |
| Season context | Ask about 2025 season, follow up | Maintains season context | | |
| Sport context | Ask NBA question, then "playoffs" | Knows it's NBA playoffs | | |
| Session ID | Check API call | sessionId passed between requests | | |
| Context object | Check response | sessionContext has player/team/season/sport | | |
| New conversation | Click "New Chat" | Context resets | | |
| Page refresh | Refresh browser | Session may persist (check behavior) | | |

### 5.5 Data Visualization & Charts
| Test Case | Steps | Expected Result | Pass/Fail | Notes |
|-----------|-------|-----------------|-----------|-------|
| Stats comparison | "Compare top 5 Bears receivers" | Chart may be generated | | |
| Season progression | "Bears win/loss by week" | Chart data returned | | |
| Chart rendering | When chartData present | Chart displays correctly | | |
| Chart interactivity | Hover/click chart | Tooltips/interactions work | | |
| No chart fallback | Query without chart data | Text response only | | |

### 5.6 Bonus Insights
| Test Case | Steps | Expected Result | Pass/Fail | Notes |
|-----------|-------|-----------------|-----------|-------|
| Bonus insight | Relevant queries | Additional insight section | | |
| Insight relevance | Check content | Related to query topic | | |
| Insight display | Check formatting | Visually distinct from main response | | |

### 5.7 Query History (Logged-in Users)
| Test Case | Steps | Expected Result | Pass/Fail | Notes |
|-----------|-------|-----------------|-----------|-------|
| Auto-save query | Make query while logged in | Query saved to history | | |
| View history | Check history panel | Previous queries listed | | |
| History order | Multiple queries | Most recent first | | |
| Click history item | Click previous query | Query re-submitted or displayed | | |
| Clear history | Click clear button | All history removed | | |
| 30-day retention | Old queries | Auto-deleted after 30 days | | |
| Guest history | Not logged in | Stored in localStorage | | |
| Guest limit | Many queries as guest | Max 100 queries stored | | |

### 5.8 Error Handling
| Test Case | Steps | Expected Result | Pass/Fail | Notes |
|-----------|-------|-----------------|-----------|-------|
| Empty query | Submit empty input | Validation prevents submission | | |
| Network error | Simulate offline | "Network error" message | | |
| API timeout | Very complex query | Timeout handled (< 30s wait) | | |
| Service unavailable | DataLab down | Graceful error message | | |
| Invalid response | Malformed JSON | Error logged, user sees message | | |
| Rate limiting | Many rapid queries | Appropriate rate limit message | | |

### 5.9 Error Logging (Backend Verification)
| Test Case | Steps | Expected Result | Pass/Fail | Notes |
|-----------|-------|-----------------|-----------|-------|
| Error logged | Trigger error | Entry in `scout_errors` table | | |
| Error type | Check log | Correct error_type (timeout/network/etc.) | | |
| Response time | Check log | response_time_ms recorded | | |
| User query | Check log | Original query stored | | |
| Session ID | Check log | Session ID included | | |

### 5.10 Sport-Specific Queries

#### Bears (NFL)
| Test Case | Steps | Expected Result | Pass/Fail | Notes |
|-----------|-------|-----------------|-----------|-------|
| QB stats | "Caleb Williams stats" | Passing yards, TDs, INTs | | |
| Team record | "Bears record" | Current season record (11-6 for 2025) | | |
| Schedule | "Bears next game" | Upcoming opponent/date | | |
| Roster | "Bears starting lineup" | Key players listed | | |

#### Bulls (NBA)
| Test Case | Steps | Expected Result | Pass/Fail | Notes |
|-----------|-------|-----------------|-----------|-------|
| Scoring leader | "Bulls leading scorer" | Correct player and PPG | | |
| Team record | "Bulls record" | Current season record | | |
| Season query | Uses 2026 | NBA ending year convention | | |

#### Blackhawks (NHL)
| Test Case | Steps | Expected Result | Pass/Fail | Notes |
|-----------|-------|-----------------|-----------|-------|
| Points leader | "Blackhawks points leader" | Bedard or current leader | | |
| Team record | "Blackhawks record" | W-L-OTL format (21-22-8) | | |
| OT losses | Ask about overtime | Correct OTL count | | |

#### Cubs (MLB)
| Test Case | Steps | Expected Result | Pass/Fail | Notes |
|-----------|-------|-----------------|-----------|-------|
| Batting leader | "Cubs batting average leader" | Correct player and BA | | |
| Team record | "Cubs record" | 92-70 for 2025 | | |
| Pitching stats | "Cubs ERA leader" | Correct pitcher | | |

#### White Sox (MLB)
| Test Case | Steps | Expected Result | Pass/Fail | Notes |
|-----------|-------|-----------------|-----------|-------|
| Team record | "White Sox record" | 60-102 for 2025 | | |
| Player stats | Ask about any Sox player | Accurate stats | | |

---

## 6. GM Trade Simulator

### 6.1 Basic Flow
| Test Case | Steps | Expected Result | Pass/Fail | Notes |
|-----------|-------|-----------------|-----------|-------|
| Page loads | Navigate to /gm | Trade simulator loads | | |
| Auth required | Access as guest | Redirect to login | | |
| Select user team | Choose Bears | Bears roster loads | | |
| Select opponent | Choose another team | Opponent roster loads | | |

### 6.2 Roster Display
| Test Case | Steps | Expected Result | Pass/Fail | Notes |
|-----------|-------|-----------------|-----------|-------|
| Player cards | Check roster | Player cards with photos | | |
| Player stats | Hover/click player | Season stats displayed | | |
| Position filter | Filter by position | Filtered results | | |
| Search player | Search by name | Results filter | | |

### 6.3 Trade Building
| Test Case | Steps | Expected Result | Pass/Fail | Notes |
|-----------|-------|-----------------|-----------|-------|
| Add player to trade | Select player | Player added to trade board | | |
| Remove player | Click remove | Player removed from trade | | |
| Add draft pick | Select draft pick | Pick added to trade | | |
| Salary cap display | Check cap info | Cap implications shown | | |
| Multi-player trade | Add 3+ players | All players displayed | | |

### 6.4 Trade Grading
| Test Case | Steps | Expected Result | Pass/Fail | Notes |
|-----------|-------|-----------------|-----------|-------|
| Submit trade | Click "Grade Trade" | Loading state, then grade | | |
| Grade reveal | Wait for response | Animated grade reveal | | |
| Grade breakdown | Check analysis | Detailed breakdown shown | | |
| Accept (75+) | Submit good trade | Grade 75+, marked accepted | | |
| Reject (< 75) | Submit bad trade | Grade < 75, marked rejected | | |
| Dangerous (75-90) | Submit risky trade | Flagged as dangerous | | |
| Untouchable | Trade Caleb Williams | Grade 0, trade blocked | | |
| Untouchable | Trade Connor Bedard | Grade 0, trade blocked | | |

### 6.5 Rate Limiting
| Test Case | Steps | Expected Result | Pass/Fail | Notes |
|-----------|-------|-----------------|-----------|-------|
| Rate limit | Submit 11 trades in 1 min | Rate limit message | | |

### 6.6 Trade History
| Test Case | Steps | Expected Result | Pass/Fail | Notes |
|-----------|-------|-----------------|-----------|-------|
| View history | Click history tab | Previous trades listed | | |
| Trade details | Click a trade | Full trade details | | |

### 6.7 Leaderboard
| Test Case | Steps | Expected Result | Pass/Fail | Notes |
|-----------|-------|-----------------|-----------|-------|
| View leaderboard | Click leaderboard | Rankings displayed | | |
| User ranking | Check own position | Position shown | | |

### 6.8 Sharing
| Test Case | Steps | Expected Result | Pass/Fail | Notes |
|-----------|-------|-----------------|-----------|-------|
| Share trade | Click share | Share URL generated | | |
| View shared | Open share URL | Trade displays correctly | | |

### 6.9 Preferences
| Test Case | Steps | Expected Result | Pass/Fail | Notes |
|-----------|-------|-----------------|-----------|-------|
| Open preferences | Click settings | Preferences modal | | |
| Risk tolerance | Change setting | Saved successfully | | |
| Favorite team | Change team | Saved successfully | | |

---

## 7. Mock Draft

### 7.1 Page Access & Authentication
| Test Case | Steps | Expected Result | Pass/Fail | Notes |
|-----------|-------|-----------------|-----------|-------|
| Page loads | Navigate to /mock-draft | Draft interface loads | | |
| Auth required | Access as guest | Redirect to login with `?next=/mock-draft` | | |
| Auth loading | During auth check | Loading spinner displayed | | |

### 7.2 Team Selection Screen
| Test Case | Steps | Expected Result | Pass/Fail | Notes |
|-----------|-------|-----------------|-----------|-------|
| Team grid displays | View selection screen | All 5 Chicago teams shown | | |
| Team logos | Check each team | Correct logo displays | | |
| Eligibility status | Check each team | Green "✓ Ready to draft" or red status | | |
| Ineligible team | Click ineligible team | Button disabled, cursor: not-allowed | | |
| Eligible team | Click eligible team | Draft starts, team selected | | |
| Days until draft | Check countdown | Shows days remaining (if applicable) | | |

### 7.3 Draft History Panel
| Test Case | Steps | Expected Result | Pass/Fail | Notes |
|-----------|-------|-----------------|-----------|-------|
| History loads | View right column | Past drafts listed | | |
| Empty history | New user | "No drafts yet" message | | |
| Draft card display | Check each draft | Logo, team name, year, pick count, date | | |
| Grade badge colors | Check grades | Green ≥80, Orange 60-79, Red <60 | | |
| Scrollable list | Many drafts | Scroll works (max 400px height) | | |

### 7.4 Active Draft - Draft Board
| Test Case | Steps | Expected Result | Pass/Fail | Notes |
|-----------|-------|-----------------|-----------|-------|
| Draft board displays | Start draft | Right column shows draft board | | |
| Pick counter | Check header | "Pick X of Y" accurate | | |
| Current pick highlight | View board | Current pick highlighted with border | | |
| User pick indicator | View board | User's picks show "YOU" badge | | |
| Completed picks | After selections | Shows prospect name next to pick | | |
| Sticky positioning | Scroll main area | Draft board stays visible | | |

### 7.5 Making Picks
| Test Case | Steps | Expected Result | Pass/Fail | Notes |
|-----------|-------|-----------------|-----------|-------|
| Current pick status | View status card | Shows "Your Pick: #X" | | |
| Prospect list loads | On user's turn | Prospects displayed with stats | | |
| Search prospects | Type in search | Results filter by name | | |
| Position filter | Select position | Results filter by position | | |
| Prospect card display | Check cards | Headshot, name, position, school, age, grade | | |
| Missing headshot | Prospect without photo | Initial avatar (first letter) | | |
| Draft button | Click "Draft" | Pick submitted, loading state | | |
| Pick submission | After click | Prospect disappears from list | | |
| Auto-advance | Not user's turn | "Auto-Advance →" button visible | | |
| Click auto-advance | Press button | Advances to next user pick | | |

### 7.6 Draft Completion & Grading
| Test Case | Steps | Expected Result | Pass/Fail | Notes |
|-----------|-------|-----------------|-----------|-------|
| Draft complete | All picks made | Status shows "Draft Complete!" | | |
| Your picks summary | After completion | All user picks listed | | |
| Get grade button | After completion | "Get Draft Grade" button visible | | |
| Grading state | Click grade | Loading state, "Grading..." text | | |
| Grade reveal modal | Grade complete | Modal opens with grade | | |
| Letter grade | Check modal | A/B/C/D/F with color coding | | |
| Numeric grade | Check modal | 0-100 score displayed | | |
| Analysis text | Check modal | Written analysis paragraph | | |
| Strengths list | Check modal | Green-headed list of strengths | | |
| Weaknesses list | Check modal | Red-headed list of weaknesses | | |
| Pick-by-pick grades | Check modal | Grid of individual pick grades | | |

### 7.7 Sharing & Shared Drafts
| Test Case | Steps | Expected Result | Pass/Fail | Notes |
|-----------|-------|-----------------|-----------|-------|
| Share button | After grading | Share button visible | | |
| Share URL generated | Click share | URL copied/displayed | | |
| View shared draft | Open /mock-draft/share/[id] | Draft displays publicly | | |
| Shared draft content | Check page | Team, grade, picks, analysis shown | | |
| Invalid share ID | Open bad URL | "Mock draft not found" error | | |
| CTA on shared page | Check buttons | Links to start own draft | | |

### 7.8 Error Handling
| Test Case | Steps | Expected Result | Pass/Fail | Notes |
|-----------|-------|-----------------|-----------|-------|
| Network error | Simulate offline | "Network error. Please try again." | | |
| Eligibility error | Invalid team | Error message from DataLab | | |
| No prospects | Empty prospect list | Appropriate message | | |
| API 500 error | Server error | Generic error message | | |
| Error dismissal | Click X on error | Error banner closes | | |

### 7.9 Eligibility Edge Cases
| Test Case | Steps | Expected Result | Pass/Fail | Notes |
|-----------|-------|-----------------|-----------|-------|
| Season in progress | During regular season | "Mock draft not available" | | |
| Draft window closed | Outside window | Team shown as ineligible | | |
| No draft order data | Missing data | Falls back to most recent year | | |
| Champion team | Team won championship | May have different eligibility | | |

---

## 8. Fan Chat

### 8.1 Page Access & Layout
| Test Case | Steps | Expected Result | Pass/Fail | Notes |
|-----------|-------|-----------------|-----------|-------|
| Page loads | Navigate to /fan-chat | Chat interface loads | | |
| Auth check | Access as guest | Can view but prompted to sign in | | |
| Desktop layout | View on desktop | Sidebar + main chat visible | | |
| Mobile layout | View on mobile | Sidebar hidden, hamburger menu | | |
| Mobile toggle | Tap hamburger | Sidebar slides in | | |

### 8.2 Channel Selection & Sidebar
| Test Case | Steps | Expected Result | Pass/Fail | Notes |
|-----------|-------|-----------------|-----------|-------|
| Channel count | View sidebar | All 6 channels displayed | | |
| Chicago Lounge | Check first channel | 🏙️ icon, general sports | | |
| Bears Den | Check channel | Bears logo, "BearDownBenny is here" | | |
| Bulls Nation | Check channel | Bulls logo, "WindyCityHoops is here" | | |
| Cubs Corner | Check channel | Cubs logo, "WrigleyWill is here" | | |
| Sox Side | Check channel | White Sox logo, AI personality | | |
| Hawks Nest | Check channel | Blackhawks logo, AI personality | | |
| Active channel highlight | Click channel | Channel highlighted with team color | | |
| Online indicator | Each channel | Green dot for AI presence | | |
| LIVE badge | Bears Den | Shows "LIVE" badge | | |
| Channel switch | Click different channel | Chat resets to welcome message | | |

### 8.3 Chat Interface
| Test Case | Steps | Expected Result | Pass/Fail | Notes |
|-----------|-------|-----------------|-----------|-------|
| Chat header | View header | Team logo, name, AI status | | |
| Welcome section | Enter channel | Welcome message with channel description | | |
| Input placeholder | Check input | "Message {personality}..." | | |
| Empty send disabled | Empty input | Send button disabled | | |
| Sign-in prompt | Not logged in | "Sign in to save your chat history" link | | |
| Message input | Type message | Text appears in input | | |
| Send via button | Click send | Message sent | | |
| Send via Enter | Press Enter | Message sent | | |
| User message style | After sending | Right-aligned, red (#bc0000) background | | |

### 8.4 AI Personality Responses
| Test Case | Steps | Expected Result | Pass/Fail | Notes |
|-----------|-------|-----------------|-----------|-------|
| AI responds | Send message, wait | AI personality responds (1.5-3.5s delay) | | |
| AI message style | Check AI message | Left-aligned, neutral background | | |
| AI avatar | Check message | Team-colored avatar with green pulse | | |
| Typing indicator | While waiting | 3 bouncing dots shown | | |
| BearDownBenny personality | Bears Den message | Bears-themed response, catchphrases | | |
| WindyCityHoops personality | Bulls Nation message | Bulls-themed response | | |
| WrigleyWill personality | Cubs Corner message | Cubs-themed response | | |
| White Sox personality | Sox Side message | White Sox-themed response | | |
| Blackhawks personality | Hawks Nest message | Blackhawks-themed response | | |
| No citation markers | Check AI response | No [1][2][3] markers in text | | |
| Context awareness | Follow-up question | AI maintains conversation context | | |

### 8.5 AI Response Conditions (CRITICAL)
| Test Case | Steps | Expected Result | Pass/Fail | Notes |
|-----------|-------|-----------------|-----------|-------|
| Solo user | Only you in chat | AI responds normally | | |
| Multiple users | Others in channel | AI does NOT respond | | |
| Rate limiting | Send many messages fast | AI stops responding, retry after delay | | |
| Rate limit recovery | Wait 30+ seconds | AI responds again | | |
| AI mention | Mention personality name | May trigger response | | |

### 8.6 Message Display
| Test Case | Steps | Expected Result | Pass/Fail | Notes |
|-----------|-------|-----------------|-----------|-------|
| Timestamp format | Check messages | "Just now", "5 min ago" format | | |
| Auto-scroll | New messages | Chat scrolls to bottom | | |
| Long message | Send long text | Message wraps properly | | |
| Multiple messages | Send several | All messages displayed in order | | |

### 8.7 Error Handling
| Test Case | Steps | Expected Result | Pass/Fail | Notes |
|-----------|-------|-----------------|-----------|-------|
| Network error | Simulate offline | Error message displayed | | |
| AI service down | API returns 500 | User-friendly error | | |
| Rate limited | API returns 429 | "Please wait" message | | |

### 8.8 Channel-Specific AI Personalities

#### Bears Den - BearDownBenny
| Test Case | Steps | Expected Result | Pass/Fail | Notes |
|-----------|-------|-----------------|-----------|-------|
| Personality loads | Enter Bears Den | BearDownBenny persona active | | |
| Bears knowledge | Ask about Bears | Accurate Bears info | | |
| Catchphrases | Chat naturally | Uses Bears catchphrases | | |
| Team loyalty | Ask about rivals | Shows Bears loyalty | | |

#### Bulls Nation - WindyCityHoops
| Test Case | Steps | Expected Result | Pass/Fail | Notes |
|-----------|-------|-----------------|-----------|-------|
| Personality loads | Enter Bulls Nation | WindyCityHoops persona active | | |
| Bulls knowledge | Ask about Bulls | Accurate Bulls info | | |
| Basketball focus | Discuss NBA | Basketball-centric responses | | |

#### Cubs Corner - WrigleyWill
| Test Case | Steps | Expected Result | Pass/Fail | Notes |
|-----------|-------|-----------------|-----------|-------|
| Personality loads | Enter Cubs Corner | WrigleyWill persona active | | |
| Cubs knowledge | Ask about Cubs | Accurate Cubs info | | |
| Baseball focus | Discuss MLB | Baseball-centric responses | | |

#### Sox Side - White Sox AI
| Test Case | Steps | Expected Result | Pass/Fail | Notes |
|-----------|-------|-----------------|-----------|-------|
| Personality loads | Enter Sox Side | White Sox persona active | | |
| White Sox knowledge | Ask about Sox | Accurate White Sox info | | |
| South side pride | Discuss teams | Shows Sox loyalty | | |

#### Hawks Nest - Blackhawks AI
| Test Case | Steps | Expected Result | Pass/Fail | Notes |
|-----------|-------|-----------------|-----------|-------|
| Personality loads | Enter Hawks Nest | Blackhawks persona active | | |
| Blackhawks knowledge | Ask about Hawks | Accurate Blackhawks info | | |
| Hockey focus | Discuss NHL | Hockey-centric responses | | |

---

## 9. Polls & Voting

### 9.1 Viewing Polls
| Test Case | Steps | Expected Result | Pass/Fail | Notes |
|-----------|-------|-----------------|-----------|-------|
| Page loads | Navigate to /polls | Polls list loads | | |
| Poll display | Check poll cards | Question, options visible | | |
| Active polls | Filter active | Only active polls shown | | |

### 9.2 Voting
| Test Case | Steps | Expected Result | Pass/Fail | Notes |
|-----------|-------|-----------------|-----------|-------|
| Vote on poll | Select option | Vote recorded | | |
| See results | After voting | Results displayed | | |
| Prevent double vote | Try vote again | Blocked or updated | | |
| Results page | Navigate to /polls/[id]/results | Full results shown | | |

### 9.3 Creating Polls (Logged-in)
| Test Case | Steps | Expected Result | Pass/Fail | Notes |
|-----------|-------|-----------------|-----------|-------|
| Create poll | Navigate to /polls/new | Form displayed | | |
| Submit poll | Fill form, submit | Poll created | | |
| Validation | Submit empty | Validation errors | | |

---

## 10. Content & Articles

### 10.1 Article Display
| Test Case | Steps | Expected Result | Pass/Fail | Notes |
|-----------|-------|-----------------|-----------|-------|
| Article page | Click any article | Full article loads | | |
| Featured image | Check image | Displays correctly | | |
| Author info | Check byline | Author name, photo | | |
| Publish date | Check date | Correct date shown | | |
| Category | Check tag | Category displayed | | |
| Related articles | Scroll down | Related posts shown | | |

### 10.2 Article Interactions
| Test Case | Steps | Expected Result | Pass/Fail | Notes |
|-----------|-------|-----------------|-----------|-------|
| Share button | Click share | Share options appear | | |
| Share to Twitter | Click Twitter | Tweet composer opens | | |
| Share to Facebook | Click Facebook | FB share opens | | |
| Copy link | Click copy | Link copied | | |

### 10.3 Category Pages
| Test Case | Steps | Expected Result | Pass/Fail | Notes |
|-----------|-------|-----------------|-----------|-------|
| Category page | Navigate to category | Articles filtered | | |
| Pagination | Click next page | More articles load | | |

### 10.4 Author Pages
| Test Case | Steps | Expected Result | Pass/Fail | Notes |
|-----------|-------|-----------------|-----------|-------|
| Authors list | Navigate to /authors | Authors displayed | | |
| Author profile | Click author | Profile with articles | | |

---

## 11. User Profile & Preferences

### 11.1 Profile Page
| Test Case | Steps | Expected Result | Pass/Fail | Notes |
|-----------|-------|-----------------|-----------|-------|
| Page loads | Navigate to /profile | Profile page loads | | |
| User info | Check display | Name, email, join date | | |
| Avatar | Check photo | Avatar displays | | |
| Change avatar | Upload new | Avatar updated | | |

### 11.2 Favorite Teams
| Test Case | Steps | Expected Result | Pass/Fail | Notes |
|-----------|-------|-----------------|-----------|-------|
| Select favorites | Choose teams | Selection saved | | |
| Deselect team | Uncheck team | Team removed | | |
| Max selection | Select all 5 | All 5 selectable | | |

### 11.3 Eliminate Other Teams
| Test Case | Steps | Expected Result | Pass/Fail | Notes |
|-----------|-------|-----------------|-----------|-------|
| Enable toggle | Turn on elimination | Setting saved | | |
| Feed filtered | Go to homepage | Only favorite teams shown | | |
| Disable toggle | Turn off | All teams shown again | | |

### 11.4 Theme Preference
| Test Case | Steps | Expected Result | Pass/Fail | Notes |
|-----------|-------|-----------------|-----------|-------|
| Switch to dark | Click toggle | Dark theme applies | | |
| Switch to light | Click toggle | Light theme applies | | |
| Persists | Refresh page | Theme maintained | | |

### 11.5 Achievements
| Test Case | Steps | Expected Result | Pass/Fail | Notes |
|-----------|-------|-----------------|-----------|-------|
| View badges | Check achievements | Badges displayed | | |
| Progress tracking | Check stats | Articles read, votes, streak | | |

---

## 12. Search Functionality

### 12.1 Global Search
| Test Case | Steps | Expected Result | Pass/Fail | Notes |
|-----------|-------|-----------------|-----------|-------|
| Open search | Click search icon | Search interface opens | | |
| Search articles | Type "Bears" | Relevant articles appear | | |
| No results | Search gibberish | "No results" message | | |
| Clear search | Click clear | Search cleared | | |

### 12.2 Filters
| Test Case | Steps | Expected Result | Pass/Fail | Notes |
|-----------|-------|-----------------|-----------|-------|
| Category filter | Select category | Results filtered | | |
| Team filter | Select team | Results filtered | | |
| Date filter | Select date range | Results filtered | | |
| Combined filters | Multiple filters | Correctly combined | | |

### 12.3 Player Search
| Test Case | Steps | Expected Result | Pass/Fail | Notes |
|-----------|-------|-----------------|-----------|-------|
| Search players | Navigate to /players | Player search works | | |
| Search by name | Type player name | Results appear | | |
| Click result | Click player | Navigate to profile | | |

---

## 13. Subscription & Payments

### 13.1 Pricing Page
| Test Case | Steps | Expected Result | Pass/Fail | Notes |
|-----------|-------|-----------------|-----------|-------|
| Page loads | Navigate to /pricing | Plans displayed | | |
| Plan comparison | Check features | Features listed per tier | | |
| CTA buttons | Click subscribe | Redirects appropriately | | |

### 13.2 Checkout Flow
| Test Case | Steps | Expected Result | Pass/Fail | Notes |
|-----------|-------|-----------------|-----------|-------|
| Start checkout | Click subscribe (SM+) | Stripe checkout opens | | |
| Payment form | Enter test card | Form accepts input | | |
| Success | Complete payment | Success page, access granted | | |
| Cancel | Cancel checkout | Return to pricing | | |

### 13.3 Subscription Management
| Test Case | Steps | Expected Result | Pass/Fail | Notes |
|-----------|-------|-----------------|-----------|-------|
| Portal access | Click manage | Stripe portal opens | | |
| Cancel sub | Cancel in portal | Subscription ends | | |
| Feature access | After cancellation | SM+ features blocked | | |

---

## 14. Admin Dashboard

### 14.1 Access Control
| Test Case | Steps | Expected Result | Pass/Fail | Notes |
|-----------|-------|-----------------|-----------|-------|
| Admin access | Login as admin | Dashboard accessible | | |
| Non-admin denied | Login as regular user | Redirect away | | |

### 14.2 Post Management
| Test Case | Steps | Expected Result | Pass/Fail | Notes |
|-----------|-------|-----------------|-----------|-------|
| Posts list | Navigate to /admin/posts | Posts displayed | | |
| Create post | Click new, fill form | Post created | | |
| Edit post | Edit existing | Changes saved | | |
| Delete post | Delete post | Post removed | | |
| Schedule post | Set future date | Post scheduled | | |
| Publish post | Change to published | Post goes live | | |

### 14.3 PostIQ AI Assistant (Comprehensive)

#### 14.3.1 PostIQ Panel Access
| Test Case | Steps | Expected Result | Pass/Fail | Notes |
|-----------|-------|-----------------|-----------|-------|
| Panel visible | Open /admin/posts/new | AI Assistant panel on right sidebar | | |
| Panel header | Check header | Purple header with lightbulb icon | | |
| Tab navigation | View tabs | 4 tabs: Headlines, SEO, Ideas, Grammar | | |
| Tab switching | Click each tab | Content changes per tab | | |
| Dark mode styling | Toggle theme | Proper dark mode colors | | |

#### 14.3.2 Headlines Tab
| Test Case | Steps | Expected Result | Pass/Fail | Notes |
|-----------|-------|-----------------|-----------|-------|
| Button disabled | No title entered | "Generate Headlines" disabled | | |
| Button enabled | Enter title | Button becomes clickable | | |
| Generate headlines | Click button | Loading state, then 5 headlines | | |
| Headlines display | After generation | 5 clickable headline buttons | | |
| Select headline | Click a headline | Title field updates with selection | | |
| Headline quality | Review headlines | Relevant to original title | | |
| Different styles | Check variety | Mix of styles (question, statement, etc.) | | |

#### 14.3.3 SEO Tab
| Test Case | Steps | Expected Result | Pass/Fail | Notes |
|-----------|-------|-----------------|-----------|-------|
| Analyze disabled | No content entered | "Analyze SEO" button disabled | | |
| Analyze enabled | Enter content | Button becomes clickable | | |
| Run SEO analysis | Click button | Loading state, then results | | |
| Mockery Score | Check score | 1-100 score with color gradient | | |
| Score feedback | Check text | Feedback based on score range | | |
| Optimized title | Check field | Improved title suggestion | | |
| Meta description | Check field | SEO-optimized description | | |
| Focus keyword | Check badges | 1 purple badge for focus keyword | | |
| Secondary keywords | Check badges | Gray badges for secondary keywords | | |
| Improvements list | Check list | Yellow bullet points with suggestions | | |
| Apply suggestions | Click "Apply SEO Suggestions" | Fields update with suggestions | | |
| Auto Excerpt button | Click button | Generates 2-3 sentence excerpt | | |
| Excerpt quality | Review excerpt | Summarizes article accurately | | |

#### 14.3.4 Ideas Tab
| Test Case | Steps | Expected Result | Pass/Fail | Notes |
|-----------|-------|-----------------|-----------|-------|
| Generate ideas | Click "Generate Ideas" | Loading state, then 5 ideas | | |
| Idea cards | Check display | Each idea has headline + emoji badge | | |
| Idea types | Check badges | satire/opinion/analysis/news types | | |
| Angle description | Check cards | Each idea has angle explanation | | |
| Use headline link | Click "Use this headline →" | Title field updates | | |
| Category relevance | Select category first | Ideas match category | | |
| Team relevance | Select team first | Ideas focus on team | | |

#### 14.3.5 Grammar Tab
| Test Case | Steps | Expected Result | Pass/Fail | Notes |
|-----------|-------|-----------------|-----------|-------|
| Check disabled | No content entered | "Check Grammar" button disabled | | |
| Check enabled | Enter content | Button becomes clickable | | |
| Run grammar check | Click button | Loading state, then results | | |
| No issues | Perfect content | Green banner: "No issues found!" | | |
| Issues found | Content with errors | Yellow banner with issue count | | |
| Issue display | Check list | Original (red strikethrough) → Corrected (green) | | |
| Explanation | Each issue | Gray explanation text | | |
| Apply all | Click "Apply All Corrections" | Content field updates | | |
| Apply button hidden | No issues | Button not displayed | | |

#### 14.3.6 Auto-Chart Feature
| Test Case | Steps | Expected Result | Pass/Fail | Notes |
|-----------|-------|-----------------|-----------|-------|
| Checkbox visible | In post editor | "Auto-generate chart" checkbox | | |
| Enable auto-chart | Check checkbox | Feature enabled | | |
| Chart analysis | On publish | AI analyzes content for data | | |
| Chart generated | Data found | Chart inserted into content | | |
| No chart | No data found | Article published without chart | | |

#### 14.3.7 PostIQ Error Handling
| Test Case | Steps | Expected Result | Pass/Fail | Notes |
|-----------|-------|-----------------|-----------|-------|
| Network error | Simulate offline | "AI service unavailable" red banner | | |
| API timeout | Long wait | Timeout handled gracefully | | |
| Invalid JSON | Malformed response | Fallback values used | | |
| DataLab fallback | DataLab down | Falls back to local Anthropic | | |
| Error dismissal | Click X on error | Error banner closes | | |
| Retry after error | Click button again | New request made | | |

#### 14.3.8 PostIQ Content Edge Cases
| Test Case | Steps | Expected Result | Pass/Fail | Notes |
|-----------|-------|-----------------|-----------|-------|
| Very long content | >2000 chars | Truncated for API, works | | |
| Special characters | HTML/markdown in content | Properly escaped | | |
| Empty category | No category selected | Still generates (optional) | | |
| Empty team | No team selected | Still generates (optional) | | |
| Multiple requests | Rapid clicking | Buttons disabled during loading | | |

### 14.4 Media Library
| Test Case | Steps | Expected Result | Pass/Fail | Notes |
|-----------|-------|-----------------|-----------|-------|
| View media | Navigate to /admin/media | Media grid displayed | | |
| Upload image | Upload file | Image saved | | |
| Delete media | Delete item | Item removed | | |

### 14.5 User Management
| Test Case | Steps | Expected Result | Pass/Fail | Notes |
|-----------|-------|-----------------|-----------|-------|
| Users list | Navigate to /admin/users | Users displayed | | |
| Search users | Search by email | Results filtered | | |
| Reset password | Click reset | Email sent | | |

### 14.6 Team Pages Sync
| Test Case | Steps | Expected Result | Pass/Fail | Notes |
|-----------|-------|-----------------|-----------|-------|
| Health check | Navigate to /admin/team-pages-sync | Status displayed | | |
| Manual sync | Click sync | Sync triggered | | |
| ESPN ID check | View mapping status | Mapping verified | | |

---

## 15. Live Games & Real-Time

### 15.1 Live Game Detection
| Test Case | Steps | Expected Result | Pass/Fail | Notes |
|-----------|-------|-----------------|-----------|-------|
| Live indicator | During live game | Live badge shown | | |
| Score updates | Watch score | Updates every 10 seconds | | |
| Game clock | Check time | Real-time clock | | |

### 15.2 Live Stats
| Test Case | Steps | Expected Result | Pass/Fail | Notes |
|-----------|-------|-----------------|-----------|-------|
| Player stats | During live game | Stats update in real-time | | |
| Box score | Check box score | Updates with play-by-play | | |

---

## 16. Mobile & Responsive

### 16.1 Mobile Navigation
| Test Case | Steps | Expected Result | Pass/Fail | Notes |
|-----------|-------|-----------------|-----------|-------|
| Hamburger menu | Tap menu icon | Navigation opens | | |
| Menu links | Tap links | Navigate correctly | | |
| Close menu | Tap outside | Menu closes | | |

### 16.2 Responsive Layouts
| Test Case | Steps | Expected Result | Pass/Fail | Notes |
|-----------|-------|-----------------|-----------|-------|
| Homepage | View on mobile | Stacked layout, readable | | |
| Team pages | View on mobile | Tables scroll horizontally | | |
| Trade simulator | View on mobile | Usable on small screen | | |
| Articles | View on mobile | Full-width, readable | | |

### 16.3 Touch Interactions
| Test Case | Steps | Expected Result | Pass/Fail | Notes |
|-----------|-------|-----------------|-----------|-------|
| Tap targets | Tap buttons | Responsive, 44px min | | |
| Swipe | Swipe carousels | Smooth scrolling | | |
| Pull to refresh | Pull down | Page refreshes | | |

---

## 17. Performance & Load Testing

### 17.1 Page Load Times
| Page | Target | Actual | Pass/Fail | Notes |
|------|--------|--------|-----------|-------|
| Homepage | < 3s | | | |
| Team page hub | < 2s | | | |
| Team roster | < 2s | | | |
| Scout AI | < 2s | | | |
| GM Simulator | < 3s | | | |
| Article page | < 2s | | | |

### 17.2 API Response Times
| Endpoint | Target | Actual | Pass/Fail | Notes |
|----------|--------|--------|-----------|-------|
| /api/ask-ai | < 10s | | | |
| /api/gm/grade | < 15s | | | |
| /api/gm/roster | < 2s | | | |
| /api/bears/roster | < 1s | | | |
| /api/feed | < 1s | | | |

### 17.3 Lighthouse Scores
| Metric | Target | Actual | Pass/Fail | Notes |
|--------|--------|--------|-----------|-------|
| Performance | > 80 | | | |
| Accessibility | > 90 | | | |
| Best Practices | > 90 | | | |
| SEO | > 90 | | | |

---

## 18. Error Handling & Edge Cases

### 18.1 Error Pages
| Test Case | Steps | Expected Result | Pass/Fail | Notes |
|-----------|-------|-----------------|-----------|-------|
| 404 page | Go to /nonexistent | 404 page displays | | |
| 500 handling | Trigger server error | Error page, not crash | | |

### 18.2 Network Errors
| Test Case | Steps | Expected Result | Pass/Fail | Notes |
|-----------|-------|-----------------|-----------|-------|
| Offline mode | Disable network | Offline message | | |
| Slow connection | Throttle to 3G | Loading states, no timeout | | |
| API failure | Mock API error | User-friendly message | | |

### 18.3 Empty States
| Test Case | Steps | Expected Result | Pass/Fail | Notes |
|-----------|-------|-----------------|-----------|-------|
| No search results | Search gibberish | "No results" message | | |
| No trades | New user, view history | "No trades yet" message | | |
| No polls | Empty polls list | "No polls available" | | |

### 18.4 Input Validation
| Test Case | Steps | Expected Result | Pass/Fail | Notes |
|-----------|-------|-----------------|-----------|-------|
| XSS attempt | Enter `<script>` in forms | Sanitized, no execution | | |
| SQL injection | Enter `'; DROP TABLE` | Sanitized, no effect | | |
| Long input | Enter 10,000 characters | Handled gracefully | | |

---

## 19. Cross-Browser Testing

### 19.1 Desktop Browsers
| Browser | Version | Homepage | Team Pages | Scout AI | GM | Pass/Fail |
|---------|---------|----------|------------|----------|-----|-----------|
| Chrome | Latest | | | | | |
| Firefox | Latest | | | | | |
| Safari | Latest | | | | | |
| Edge | Latest | | | | | |

### 19.2 Mobile Browsers
| Browser | Device | Homepage | Team Pages | Scout AI | GM | Pass/Fail |
|---------|--------|----------|------------|----------|-----|-----------|
| Safari | iPhone | | | | | |
| Chrome | Android | | | | | |
| Samsung Internet | Galaxy | | | | | |

---

## 20. Accessibility Testing

### 20.1 Keyboard Navigation
| Test Case | Steps | Expected Result | Pass/Fail | Notes |
|-----------|-------|-----------------|-----------|-------|
| Tab navigation | Tab through page | Logical order | | |
| Enter activation | Press enter on buttons | Activates element | | |
| Escape closes | Press Esc on modals | Modal closes | | |
| Focus visible | Tab through | Focus ring visible | | |

### 20.2 Screen Reader
| Test Case | Steps | Expected Result | Pass/Fail | Notes |
|-----------|-------|-----------------|-----------|-------|
| Alt text | Check images | All images have alt | | |
| Form labels | Check forms | All inputs labeled | | |
| Headings | Check structure | Logical heading hierarchy | | |
| ARIA labels | Check interactive | ARIA labels present | | |

### 20.3 Color Contrast
| Test Case | Steps | Expected Result | Pass/Fail | Notes |
|-----------|-------|-----------------|-----------|-------|
| Text contrast | Check body text | Ratio >= 4.5:1 | | |
| Button contrast | Check buttons | Readable in both themes | | |
| Link contrast | Check links | Distinguishable from text | | |

---

## 21. Security Testing

### 21.1 Authentication Security
| Test Case | Steps | Expected Result | Pass/Fail | Notes |
|-----------|-------|-----------------|-----------|-------|
| Session expiry | Wait for timeout | Logged out | | |
| CSRF protection | Check tokens | CSRF token present | | |
| Password hashing | Check storage | Not stored in plain text | | |

### 21.2 Authorization
| Test Case | Steps | Expected Result | Pass/Fail | Notes |
|-----------|-------|-----------------|-----------|-------|
| Admin routes | Access as non-admin | Denied | | |
| API auth | Call API without token | 401 response | | |
| User data isolation | View other user profile | Denied or limited | | |

### 21.3 Data Protection
| Test Case | Steps | Expected Result | Pass/Fail | Notes |
|-----------|-------|-----------------|-----------|-------|
| HTTPS | Check connection | Always HTTPS | | |
| Sensitive data | Check responses | No passwords/tokens leaked | | |
| Error messages | Trigger errors | No stack traces exposed | | |

---

## 22. Automated Test Scripts

### 22.1 Team Pages Health Check
```bash
# Run from project root
node scripts/test-all-team-pages.mjs
```

### 22.2 API Endpoint Check
```bash
# Check all critical endpoints
for endpoint in "ask-ai" "gm/teams" "feed" "bears/roster" "bulls/roster"; do
  curl -s -o /dev/null -w "API /${endpoint}: %{http_code}\n" "https://test.sportsmockery.com/api/${endpoint}"
done
```

### 22.3 Page Load Check
```bash
# Check all major pages return 200
for page in "" "scout-ai" "gm" "fan-chat" "polls" "profile" "chicago-bears" "chicago-bulls" "chicago-cubs" "chicago-white-sox" "chicago-blackhawks"; do
  curl -s -o /dev/null -w "/${page}: %{http_code}\n" "https://test.sportsmockery.com/${page}"
done
```

### 22.4 Lighthouse CI
```bash
# Run Lighthouse audit
npx lighthouse https://test.sportsmockery.com --output=html --output-path=./lighthouse-report.html
```

---

## 23. Video Sections (Bears Film Room & Pinwheels & Ivy)

### 23.1 Bears Film Room (/bears-film-room)
| Test Case | Steps | Expected Result | Pass/Fail | Notes |
|-----------|-------|-----------------|-----------|-------|
| Page loads | Navigate to /bears-film-room | Page loads < 3s | | |
| Hero section | Check top area | BFR wide logo, title, description | | |
| Latest video | Check main video | Most recent episode embedded | | |
| Video plays | Click play on embed | YouTube video plays | | |
| Published date | Check metadata | Date + "Latest episode" label | | |
| Description | Check text | Truncated to ~220 chars | | |
| Social links | Check icons | YouTube, Apple Podcasts, Spotify, X | | |
| YouTube link | Click YouTube | Opens channel with sub confirmation | | |
| Podcast links | Click Apple/Spotify | Opens podcast pages | | |
| Recent episodes | Scroll down | Grid of episode cards | | |
| Episode thumbnail | Check cards | Thumbnail with play icon overlay | | |
| Click episode | Click thumbnail | Main video changes to selected | | |
| Episode metadata | Check cards | Title + publish date | | |
| CTA section | Check bottom | "Want more..." text + button | | |
| Archive button | Click button | Navigates to video archive | | |

### 23.2 Pinwheels & Ivy (/pinwheels-and-ivy)
| Test Case | Steps | Expected Result | Pass/Fail | Notes |
|-----------|-------|-----------------|-----------|-------|
| Page loads | Navigate to /pinwheels-and-ivy | Page loads < 3s | | |
| Hero section | Check top area | P&I logo, title, description | | |
| Latest video | Check main video | Most recent episode embedded | | |
| Video plays | Click play on embed | YouTube video plays | | |
| Social links | Check icons | YouTube, Apple Podcasts, Spotify, X | | |
| Recent episodes | Scroll down | Grid of episode cards | | |
| Click episode | Click thumbnail | Main video changes to selected | | |
| CTA section | Check bottom | "Want more..." text + button | | |

### 23.3 Video Section Error States
| Test Case | Steps | Expected Result | Pass/Fail | Notes |
|-----------|-------|-----------------|-----------|-------|
| Loading state | During fetch | Spinner displayed | | |
| No videos | API returns empty | "Videos temporarily unavailable" | | |
| Error message | On error | Helpful message + social links | | |
| No iframe on error | Check page | Video embed not shown | | |

### 23.4 Video Section Technical
| Test Case | Steps | Expected Result | Pass/Fail | Notes |
|-----------|-------|-----------------|-----------|-------|
| ISR revalidation | Wait 15+ min | Fresh data on next request | | |
| Scroll behavior | On page load | No iframe scroll hijacking | | |
| Lazy loading | Check thumbnails | Images load lazily | | |
| External links | Click social | target="_blank", rel="noopener" | | |

---

## 24. Internal Auto-Linking

### 24.1 Player Auto-Linking
| Test Case | Steps | Expected Result | Pass/Fail | Notes |
|-----------|-------|-----------------|-----------|-------|
| Player name linked | View article with player name | Name links to player page | | |
| Correct player page | Click link | Navigates to correct /players/[id] | | |
| Multiple mentions | Same player twice | Both instances linked | | |
| Different players | Multiple players in article | Each links to correct page | | |
| Partial name match | "Williams" alone | Not linked (too ambiguous) | | |
| Full name match | "Caleb Williams" | Linked to Bears QB | | |

### 24.2 Team Auto-Linking
| Test Case | Steps | Expected Result | Pass/Fail | Notes |
|-----------|-------|-----------------|-----------|-------|
| Team name linked | "Bears" in article | Links to /chicago-bears | | |
| Full team name | "Chicago Bears" | Links to /chicago-bears | | |
| All teams work | Each team mentioned | Correct team page links | | |
| Non-Chicago teams | "Green Bay Packers" | Not linked (external) | | |

### 24.3 Auto-Link Edge Cases
| Test Case | Steps | Expected Result | Pass/Fail | Notes |
|-----------|-------|-----------------|-----------|-------|
| Already linked text | Text in existing <a> tag | No double-linking | | |
| Inside headings | Player name in H1/H2 | Linking behavior (check design) | | |
| In quotes | "Caleb Williams said..." | Still linked | | |
| With punctuation | "Williams," or "Williams." | Link doesn't include punctuation | | |
| Case sensitivity | "caleb williams" | Still linked (case-insensitive) | | |

### 24.4 Related Articles Auto-Linking
| Test Case | Steps | Expected Result | Pass/Fail | Notes |
|-----------|-------|-----------------|-----------|-------|
| Related articles | Bottom of article | Related posts displayed | | |
| Relevance | Check suggestions | Related to article topic | | |
| Team matching | Bears article | Shows other Bears articles | | |
| Click related | Click article card | Navigates to article | | |

---

## 25. Cron Jobs & Background Tasks

### 25.1 Team Data Sync (/api/cron/sync-teams)
| Test Case | Steps | Expected Result | Pass/Fail | Notes |
|-----------|-------|-----------------|-----------|-------|
| Schedule | Check vercel.json | Runs every hour (:00) | | |
| Manual trigger | POST to endpoint | Sync executes | | |
| Revalidation | After sync | Team pages have fresh data | | |
| All teams synced | Check each team | Data updated for all 5 | | |
| Error handling | Simulate failure | Errors logged, no crash | | |

### 25.2 Team Pages Health Check (/api/cron/team-pages-health)
| Test Case | Steps | Expected Result | Pass/Fail | Notes |
|-----------|-------|-----------------|-----------|-------|
| Schedule | Check vercel.json | Runs every hour (:15) | | |
| HTTP status check | Run health check | All pages return 200 | | |
| Record table check | Verify output | Season records exist | | |
| Games count check | Verify output | Games exist for season | | |
| Roster count check | Verify output | Within expected range | | |
| Stats count check | Verify output | Player stats exist | | |
| ESPN ID mapping | Verify output | >50% players have stats | | |
| Admin dashboard | /admin/team-pages-sync | Health results displayed | | |

### 25.3 Scout History Cleanup (/api/cron/cleanup-scout-history)
| Test Case | Steps | Expected Result | Pass/Fail | Notes |
|-----------|-------|-----------------|-----------|-------|
| Schedule | Check vercel.json | Runs daily at 3am UTC | | |
| 30-day retention | Check deletion | Entries >30 days removed | | |
| Row count alert | If >100k rows | Alert generated | | |
| Execution log | Check logs | Cleanup completed message | | |

### 25.4 Live Games Polling (/api/cron/live-games)
| Test Case | Steps | Expected Result | Pass/Fail | Notes |
|-----------|-------|-----------------|-----------|-------|
| During live game | Game in progress | Polls every 10 seconds | | |
| No live games | No games active | Standard 60s polling | | |
| Score updates | During game | Scores update in real-time | | |
| Live registry | Check table | Active games listed | | |

### 25.5 GM Roster Sync (/api/cron/sync-gm-rosters)
| Test Case | Steps | Expected Result | Pass/Fail | Notes |
|-----------|-------|-----------------|-----------|-------|
| Roster freshness | After sync | GM rosters updated | | |
| All leagues | Check each | NFL/NBA/NHL/MLB updated | | |
| Player stats | Verify data | Season stats current | | |

### 25.6 Mobile Alerts (/api/cron/mobile-alerts)
| Test Case | Steps | Expected Result | Pass/Fail | Notes |
|-----------|-------|-----------------|-----------|-------|
| Push notifications | When triggered | Alerts sent to subscribed users | | |
| Alert content | Check notification | Correct message content | | |

### 25.7 Daily Digest (/api/cron/send-chicago-daily)
| Test Case | Steps | Expected Result | Pass/Fail | Notes |
|-----------|-------|-----------------|-----------|-------|
| Email delivery | Check inbox | Daily digest received | | |
| Content accuracy | Review email | Contains today's highlights | | |
| Unsubscribe link | Click unsubscribe | User unsubscribed | | |

---

## 26. Audit Scripts & Logging

### 26.1 GM Audit Log (gm_audit_logs table)
| Test Case | Steps | Expected Result | Pass/Fail | Notes |
|-----------|-------|-----------------|-----------|-------|
| Trade logged | Submit trade | Entry in audit table | | |
| Request payload | Check log | Trade details stored | | |
| Response payload | Check log | AI response stored | | |
| User ID | Check log | User identified | | |
| Timestamp | Check log | Accurate timestamp | | |

### 26.2 Scout Error Logging (scout_errors table)
| Test Case | Steps | Expected Result | Pass/Fail | Notes |
|-----------|-------|-----------------|-----------|-------|
| Frontend errors | Trigger error | Logged with source='frontend' | | |
| Backend errors | API error | Logged with source='backend' | | |
| Error types | Various errors | Correct error_type assigned | | |
| Response time | Check field | response_time_ms recorded | | |
| User agent | Check field | Browser info stored | | |
| Query stored | Check field | User query preserved | | |

### 26.3 GM Error Logging (gm_errors table)
| Test Case | Steps | Expected Result | Pass/Fail | Notes |
|-----------|-------|-----------------|-----------|-------|
| Trade error | Trigger failure | Error logged | | |
| Error details | Check log | Stack trace, context | | |
| Admin view | /admin/gm-errors | Errors displayed | | |

### 26.4 Audit Query Examples
```sql
-- Recent Scout errors (last 24h)
SELECT created_at, error_type, error_message, user_query, response_time_ms
FROM scout_errors
WHERE created_at > NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC;

-- Error counts by type
SELECT error_type, COUNT(*) as count
FROM scout_errors
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY error_type
ORDER BY count DESC;

-- Slow requests (over 10s)
SELECT * FROM scout_errors
WHERE response_time_ms > 10000
ORDER BY created_at DESC
LIMIT 20;

-- GM audit trail for user
SELECT * FROM gm_audit_logs
WHERE user_id = 'user-uuid'
ORDER BY created_at DESC
LIMIT 50;
```

---

## 27. Login, Redirects & Session Management

### 27.1 Login Redirects
| Test Case | Steps | Expected Result | Pass/Fail | Notes |
|-----------|-------|-----------------|-----------|-------|
| Protected route redirect | Access /gm as guest | Redirect to /login?next=/gm | | |
| Mock draft redirect | Access /mock-draft as guest | Redirect to /login?next=/mock-draft | | |
| Profile redirect | Access /profile as guest | Redirect to /login?next=/profile | | |
| Admin redirect | Access /admin as non-admin | Redirect to homepage or 403 | | |
| Return after login | Login from protected page | Returns to original page | | |
| ?next parameter | Check URL after redirect | next= parameter present | | |

### 27.2 Post-Login Navigation
| Test Case | Steps | Expected Result | Pass/Fail | Notes |
|-----------|-------|-----------------|-----------|-------|
| Login from /gm | Complete login | Returns to /gm | | |
| Login from /mock-draft | Complete login | Returns to /mock-draft | | |
| Login from homepage | Complete login | Returns to homepage | | |
| Deep link preservation | Login from article | Returns to article | | |

### 27.3 Session Management
| Test Case | Steps | Expected Result | Pass/Fail | Notes |
|-----------|-------|-----------------|-----------|-------|
| Session creation | Login | Session cookie set | | |
| Session persistence | Refresh page | Still logged in | | |
| Session expiry | Wait for timeout | Logged out automatically | | |
| Manual logout | Click logout | Session destroyed | | |
| Multi-tab logout | Logout in one tab | Other tabs reflect logout | | |

### 27.4 OAuth/SSO Flows
| Test Case | Steps | Expected Result | Pass/Fail | Notes |
|-----------|-------|-----------------|-----------|-------|
| OAuth callback | /api/auth/callback | Handles OAuth response | | |
| Session creation | After OAuth | User session created | | |
| Profile creation | New OAuth user | Profile auto-created | | |

### 27.5 Error Page Handling
| Test Case | Steps | Expected Result | Pass/Fail | Notes |
|-----------|-------|-----------------|-----------|-------|
| 404 page | /nonexistent-page | Custom 404 displayed | | |
| 404 navigation | Check 404 page | Links to homepage, search | | |
| 500 error | Trigger server error | Custom 500 page | | |
| 500 no stack trace | Check 500 page | No sensitive info exposed | | |
| API 401 | Unauthenticated API call | JSON 401 response | | |
| API 403 | Unauthorized API call | JSON 403 response | | |
| API 404 | Invalid API endpoint | JSON 404 response | | |
| API 500 | Server error in API | JSON 500 response (no stack) | | |

### 27.6 Rate Limiting
| Test Case | Steps | Expected Result | Pass/Fail | Notes |
|-----------|-------|-----------------|-----------|-------|
| GM trade limit | 11 trades in 1 min | Rate limit message | | |
| Scout query limit | Rapid queries | Rate limit applied | | |
| Fan chat limit | Many messages fast | AI stops responding | | |
| Rate limit recovery | Wait required time | Access restored | | |
| 429 response | API rate limited | Proper 429 status | | |

### 27.7 Concurrent Sessions
| Test Case | Steps | Expected Result | Pass/Fail | Notes |
|-----------|-------|-----------------|-----------|-------|
| Multiple devices | Login on 2 devices | Both sessions active | | |
| Password change | Change password | Other sessions invalidated | | |
| Account deletion | Delete account | All sessions terminated | | |

---

## 28. Additional Admin Features

### 28.1 AI Logging (/admin/ai-logging)
| Test Case | Steps | Expected Result | Pass/Fail | Notes |
|-----------|-------|-----------------|-----------|-------|
| Page access | Navigate to page | AI logs displayed | | |
| Scout queries | Check log | Query history visible | | |
| PostIQ requests | Check log | Content requests logged | | |
| Filter by date | Apply filter | Results filtered | | |
| Filter by type | Apply filter | Results filtered | | |

### 28.2 User GM Scoring (/admin/user-gm-scoring)
| Test Case | Steps | Expected Result | Pass/Fail | Notes |
|-----------|-------|-----------------|-----------|-------|
| Leaderboard view | Navigate to page | User rankings displayed | | |
| Score details | Click user | Trade history shown | | |
| Manual adjustment | Adjust score | Score updated | | |

### 28.3 Feed Scoring (/admin/feed-scoring)
| Test Case | Steps | Expected Result | Pass/Fail | Notes |
|-----------|-------|-----------------|-----------|-------|
| Algorithm view | Navigate to page | Scoring rules displayed | | |
| Adjust weights | Change values | Feed ordering changes | | |
| Test scoring | Preview changes | See effect on feed | | |

### 28.4 Notifications Management (/admin/notifications)
| Test Case | Steps | Expected Result | Pass/Fail | Notes |
|-----------|-------|-----------------|-----------|-------|
| Send notification | Fill form, send | Notification delivered | | |
| History view | Check sent list | Previous notifications shown | | |
| Target users | Select audience | Correct users receive | | |
| Notification content | Check delivery | Title + body correct | | |

### 28.5 Bot Management (/admin/bot)
| Test Case | Steps | Expected Result | Pass/Fail | Notes |
|-----------|-------|-----------------|-----------|-------|
| Bot status | Check page | Bot status displayed | | |
| Post to X | Trigger post | Tweet published | | |
| Post to Facebook | Trigger post | FB post published | | |
| Bot config | Update settings | Settings saved | | |
| Monitor activity | Check logs | Bot actions logged | | |

---

## Testing Sign-Off

### Pre-Launch Approval

| Area | Tester | Date | Status |
|------|--------|------|--------|
| Authentication & Login Flows | | | |
| Team Pages (All 30) | | | |
| Scout AI (All Functions) | | | |
| GM Trade Simulator | | | |
| Mock Draft (All Sports) | | | |
| Fan Chat (All 6 Channels) | | | |
| PostIQ (All 6 Features) | | | |
| Video Sections | | | |
| Polls | | | |
| User Profile & Preferences | | | |
| Admin Dashboard | | | |
| Internal Auto-Linking | | | |
| Cron Jobs & Audit Scripts | | | |
| Mobile/Responsive | | | |
| Performance | | | |
| Security | | | |
| Error Handling & Redirects | | | |

### Critical Blockers Found
| Issue | Severity | Status | Resolution |
|-------|----------|--------|------------|
| | | | |

### Final Approval

- [ ] All critical features tested and passing
- [ ] No P0/P1 bugs remaining
- [ ] Performance meets targets
- [ ] Security audit complete
- [ ] Accessibility audit complete

**Approved for Production:** [ ] Yes / [ ] No

**Approver:** _________________ **Date:** _____________

---

## Appendix: Test Data Reference

### Current Season Values (as of Feb 2026)
| Sport | Season Value | Record Reference |
|-------|--------------|------------------|
| NFL | 2025 | Bears: 11-6 |
| NBA | 2026 | Bulls: ~23-22 |
| NHL | 2026 | Blackhawks: 21-22-8 |
| MLB | 2025 | Cubs: 92-70, White Sox: 60-102 |

### Test Card for Stripe
- Card: 4242 4242 4242 4242
- Expiry: Any future date
- CVC: Any 3 digits

### Known Issues to Verify Fixed
1. Citation markers [1][2][3] appearing in Scout AI responses
2. Cubs/White Sox roster showing 0 or 200+ players
3. OTL calculation for Blackhawks

---

*Document generated: February 5, 2026*
*Last updated: February 5, 2026 - Added comprehensive testing for PostIQ, Scout AI, Mock Draft, Fan Chat, Video sections, auto-linking, cron jobs, audit scripts, and login/redirect flows*
*Next review: Before production launch*
*Estimated testing time: 8-12 hours for full manual testing*
