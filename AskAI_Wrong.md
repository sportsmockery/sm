# Ask AI (Scout) - QA Test Failure Log

> **Test Date:** 2026-01-23
> **Test Target:** https://datalab.sportsmockery.com/api/query
> **Total Questions:** 200
> **Pass:** 169 | **Fail:** 31

---

## Summary of Failures

| Issue Type | Count | Severity |
|------------|-------|----------|
| NAME_OR_CLASSIFICATION_FAIL | 2 | High |
| NO_TABLE_FOR_STATS | 4 | Medium |
| PRONOUN_RESOLUTION_FAIL | 25 | High |

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

**Affected Questions:** Q4, Q101, Q111, Q122

**Sample Failures:**

### Q4: "What were his passing yards game by game last season?"
> "No team detected in question"

### Q101: "Using only last season’s data, give me a MECE breakdown of why the Bears offense improved after midseason."
> "Hey Bears fan, your question about a MECE breakdown of the offense's midseason improvement got tripped up by a database glitch that only allows simple SELECT queries—no fancy splits or analysis possib..."

### Q111: "Based on last season, were the Bulls losing because of offense, defense, or the bench more than anything else? Give me a 3–5 factor breakdown."
> "Hey buddy, your question's spot on for Bulls talk, but the database choked on the multi-part breakdown—let's narrow it to one focused stat angle from last season (2024-25) so I can pull clean data."

---

## Issue 3: PRONOUN RESOLUTION FAIL (High Severity)

**Affected Questions:** Q7, Q17, Q22, Q23, Q33, Q45, Q46, Q47, Q54, Q57, Q65, Q69, Q72, Q74, Q79, Q90, Q95, Q96, Q127, Q139, Q150, Q164, Q182, Q185, Q189

**Sample Failures:**

### Q7: "How many games did he miss?"
> "Hey, Bears fan—sorry, but "he" is too vague (who we talking, Caleb? DJ? Montez?), and the query hit a snag since our datalab only handles straight SELECT stats pulls."

### Q17: "Why do Bears fans say the team is stuck in QB hell, and how does Caleb change that narrative?"
> "Bears fans call it **QB hell** because the team's been cycling through a nightmare of bust drafts, bad trades, injuries, and inconsistent play at the position for decades—think passing on Joe Montana ..."

### Q22: "How many YDs did he have?"
> "DJ Moore finished the 2024 season with **966 receiving yards** for the Bears. That's a solid year for a guy who's been a reliable target in Chicago's offense, though it was down from his monster 2023 ..."

---

## Passing Questions (169 total)

Q1, Q2, Q6, Q8, Q9, Q10, Q11, Q12, Q13, Q14, Q15, Q16, Q18, Q19, Q20, Q21, Q24, Q25, Q26, Q27, Q28, Q29, Q30, Q31, Q32, Q34, Q35, Q36, Q37, Q38, Q39, Q40, Q41, Q42, Q43, Q44, Q48, Q49, Q50, Q51, Q52, Q53, Q55, Q56, Q58, Q59, Q60, Q61, Q62, Q63, Q64, Q66, Q67, Q68, Q70, Q71, Q73, Q75, Q76, Q77, Q78, Q80, Q81, Q82, Q83, Q84, Q85, Q86, Q87, Q88, Q89, Q91, Q92, Q93, Q94, Q97, Q98, Q99, Q100, Q102, Q103, Q104, Q105, Q106, Q107, Q108, Q109, Q110, Q112, Q113, Q114, Q115, Q116, Q117, Q118, Q119, Q120, Q121, Q123, Q124, Q125, Q126, Q128, Q129, Q130, Q131, Q132, Q133, Q134, Q135, Q136, Q137, Q138, Q140, Q141, Q142, Q143, Q144, Q145, Q146, Q147, Q148, Q149, Q151, Q152, Q153, Q154, Q155, Q156, Q157, Q158, Q159, Q160, Q161, Q162, Q163, Q165, Q166, Q167, Q168, Q169, Q170, Q171, Q172, Q173, Q174, Q175, Q176, Q177, Q178, Q179, Q180, Q181, Q183, Q184, Q186, Q187, Q188, Q190, Q191, Q192, Q193, Q194, Q195, Q196, Q197, Q198, Q199, Q200
