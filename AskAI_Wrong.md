# Ask AI (Scout) - QA Test Failure Log

> **Test Date:** 2026-01-25
> **Test Target:** https://datalab.sportsmockery.com/api/query
> **Total Questions:** 100
> **Pass:** 87 | **Fail:** 13

---

## Summary of Failures

| Issue Type | Count | Severity |
|------------|-------|----------|
| PRONOUN_RESOLUTION_FAIL | 12 | High |
| NO_TABLE_FOR_STATS | 1 | Medium |

---

## Issue 1: PRONOUN RESOLUTION FAIL (High Severity)

**Affected Questions:** Q3, Q7, Q33, Q44, Q46, Q49, Q50, Q62, Q72, Q74, Q89, Q90

**Sample Failures:**

### Q3: "How many games did he miss last year?"
> "Hey, Bears fan—your question "How many games did he miss last year?" tripped up the database because it didn't know who "he" is (we need a name like Caleb, DJ Moore, or whoever you're thinking of)."

### Q7: "How many games did he miss?"
> "Caleb Williams missed **2 games** in the 2025 season. That's not bad for a guy who balled out with nearly 4,000 yards, 27 TDs, and led us to 11 wins and the NFC North—talk about turning Soldier Field ..."

### Q33: "How many threes per game did he average, and what was his 3-point percentage?"
> "I need more specifics to answer your question—**who** are you asking about?"

---

## Issue 2: NO TABLE FOR STATS (Medium Severity)

**Affected Questions:** Q4

**Sample Failures:**

### Q4: "What were his passing yards game by game last season?"
> "Based on the search results, I can see that **Caleb Williams' game-by-game passing yards for the 2025 regular season are available**, but the detailed logs aren't fully displayed in these results. How..."

---

## Passing Questions (87 total)

Q1, Q2, Q5, Q6, Q8, Q9, Q10, Q11, Q12, Q13, Q14, Q15, Q16, Q17, Q18, Q19, Q20, Q21, Q22, Q23, Q24, Q25, Q26, Q27, Q28, Q29, Q30, Q31, Q32, Q34, Q35, Q36, Q37, Q38, Q39, Q40, Q41, Q42, Q43, Q45, Q47, Q48, Q51, Q52, Q53, Q54, Q55, Q56, Q57, Q58, Q59, Q60, Q61, Q63, Q64, Q65, Q66, Q67, Q68, Q69, Q70, Q71, Q73, Q75, Q76, Q77, Q78, Q79, Q80, Q81, Q82, Q83, Q84, Q85, Q86, Q87, Q88, Q91, Q92, Q93, Q94, Q95, Q96, Q97, Q98, Q99, Q100
