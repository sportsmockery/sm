# Ask AI (Scout) - QA Test Failure Log

> **Test Date:** 2026-01-25
> **Test Target:** https://datalab.sportsmockery.com/api/query
> **Total Questions:** 100
> **Pass:** 85 | **Fail:** 15

---

## Summary of Failures

| Issue Type | Count | Severity |
|------------|-------|----------|
| PRONOUN_RESOLUTION_FAIL | 15 | High |

---

## Issue 1: PRONOUN RESOLUTION FAIL (High Severity)

**Affected Questions:** Q3, Q7, Q40, Q44, Q46, Q49, Q54, Q56, Q62, Q65, Q74, Q79, Q89, Q95, Q96

**Sample Failures:**

### Q3: "How many games did he miss last year?"
> "Hey Bears fan, your question "How many games did he miss last year?" tripped up the database because it didn't specify who "he" is (like Caleb, DJ Moore, or someone else)—I need a player name to pull ..."

### Q7: "How many games did he miss?"
> "Hey, Bears fan—looks like "he" is too vague (who we talkin', Caleb? DJ? Montez?) and the query tried something funky beyond a simple SELECT, tripping the database."

### Q40: "What would it take for the Bulls to become a legit top-4 seed in the East in the next 2–3 years?"
> "Hey, fellow Bulls fan! Right now, the Bulls are sitting at 22-22, good for 9th in the East according to FOX Sports standings, which puts them on the playoff bubble but a long way from top-4 security (..."

---

## Passing Questions (85 total)

Q1, Q2, Q4, Q5, Q6, Q8, Q9, Q10, Q11, Q12, Q13, Q14, Q15, Q16, Q17, Q18, Q19, Q20, Q21, Q22, Q23, Q24, Q25, Q26, Q27, Q28, Q29, Q30, Q31, Q32, Q33, Q34, Q35, Q36, Q37, Q38, Q39, Q41, Q42, Q43, Q45, Q47, Q48, Q50, Q51, Q52, Q53, Q55, Q57, Q58, Q59, Q60, Q61, Q63, Q64, Q66, Q67, Q68, Q69, Q70, Q71, Q72, Q73, Q75, Q76, Q77, Q78, Q80, Q81, Q82, Q83, Q84, Q85, Q86, Q87, Q88, Q90, Q91, Q92, Q93, Q94, Q97, Q98, Q99, Q100
