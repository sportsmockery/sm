# Ask AI (Scout) - QA Test Failure Log

> **Test Date:** 2026-01-23
> **Test Target:** https://datalab.sportsmockery.com/api/query
> **Total Questions:** 100
> **Pass:** 82 | **Fail:** 18

---

## Summary of Failures

| Issue Type | Count | Severity |
|------------|-------|----------|
| NAME_OR_CLASSIFICATION_FAIL | 2 | High |
| NO_TABLE_FOR_STATS | 1 | Medium |
| PRONOUN_RESOLUTION_FAIL | 15 | High |

---

## Issue 1: NAME OR CLASSIFICATION FAIL (High Severity)

**Affected Questions:** Q3, Q5

**Sample Failures:**

### Q3: "How many games did he miss last year?"
> "Could not determine team or sport from question"

### Q5: "How many interceptions did he throw in his rookie year, and in which games did they happen?"
> "Could not determine team or sport from question"

---

## Issue 2: NO TABLE FOR STATS (Medium Severity)

**Affected Questions:** Q4

**Sample Failures:**

### Q4: "What were his passing yards game by game last season?"
> "No team detected in question"

---

## Issue 3: PRONOUN RESOLUTION FAIL (High Severity)

**Affected Questions:** Q23, Q33, Q39, Q40, Q45, Q47, Q50, Q56, Q57, Q62, Q64, Q65, Q79, Q90, Q96

**Sample Failures:**

### Q23: "How many ints did he throw?"
> "Caleb Williams threw **6 interceptions** in his 2024 rookie season with the Bears, a solid number for a first-year QB who started all 17 games and balled out with 3,541 yards and 20 TDs. That killer p..."

### Q33: "How many threes per game did he average, and what was his 3-point percentage?"
> "I'd be happy to help, but I need a bit of clarification! Your question asks about "he" and "his," but doesn't specify which Chicago Bulls player you're asking about. Based on the search results, I can..."

### Q39: "How real is the "Bulls are mid" meme right now, based on their numbers and results?"
> "The "Bulls are mid" meme is **painfully real right now**, sitting at 21-22 or 22-22 depending on the exact count—good enough for 3rd in the Central (behind the Cavs and Bucks, naturally) but hovering ..."

---

## Passing Questions (82 total)

Q1, Q2, Q6, Q7, Q8, Q9, Q10, Q11, Q12, Q13, Q14, Q15, Q16, Q17, Q18, Q19, Q20, Q21, Q22, Q24, Q25, Q26, Q27, Q28, Q29, Q30, Q31, Q32, Q34, Q35, Q36, Q37, Q38, Q41, Q42, Q43, Q44, Q46, Q48, Q49, Q51, Q52, Q53, Q54, Q55, Q58, Q59, Q60, Q61, Q63, Q66, Q67, Q68, Q69, Q70, Q71, Q72, Q73, Q74, Q75, Q76, Q77, Q78, Q80, Q81, Q82, Q83, Q84, Q85, Q86, Q87, Q88, Q89, Q91, Q92, Q93, Q94, Q95, Q97, Q98, Q99, Q100
