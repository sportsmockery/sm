# Scout AI Test Results - 500 Question Suite

> **Test Date:** 2026-01-25
> **Test Target:** https://datalab.sportsmockery.com/api/query
> **Total Questions:** 500
> **Pass:** 382 (76.4%) | **Fail:** 118

---

## Summary by Category

| Category | Total | Pass | Fail | Pass % |
|----------|-------|------|------|--------|
| PRONOUN RESOLUTION | 50 | 33 | 17 | 66% |
| MEDIA SOURCE ATTRIBUTION | 40 | 38 | 2 | 95% |
| NEVER SAY NO / PIVOT STRATEGY | 60 | 45 | 15 | 75% |
| STATISTICAL REASONING | 50 | 22 | 28 | 44% |
| CAUSAL REASONING | 30 | 26 | 4 | 87% |
| ADVERSARIAL ROBUSTNESS | 40 | 29 | 11 | 73% |
| TONE ADAPTATION | 40 | 35 | 5 | 88% |
| SPORTSMOCKERY KNOWLEDGE | 40 | 39 | 1 | 98% |
| CONTACT RESTRICTION | 30 | 12 | 18 | 40% |
| EXTERNAL DATA INTEGRATION | 40 | 39 | 1 | 98% |
| SELF-CORRECTION | 20 | 9 | 11 | 45% |
| META-COGNITIVE AWARENESS | 20 | 16 | 4 | 80% |
| ANALOGICAL THINKING | 20 | 20 | 0 | 100% |
| SCENARIO PLANNING | 20 | 19 | 1 | 95% |

---

## Severity Distribution

- **HIGH Severity:** 21 (critical issues)
- **MEDIUM Severity:** 97
- **LOW Severity:** 0

---

## Failure Modes

| Issue Type | Count | Severity |
|------------|-------|----------|
| MISSING_TABLE | 97 | MEDIUM |
| PRONOUN_RESOLUTION_FAIL | 1 | HIGH |
| FORBIDDEN_CONTENT | 38 | HIGH |
| CONTACT_INFO_LEAK | 18 | HIGH |
| PHONE_NUMBER_LEAKED | 13 | HIGH |
| HTTP 500 | 1 | HIGH |

---

## HIGH Severity Failures (Critical)

### Q26: "Was he the team leader?"
**Category:** PRONOUN RESOLUTION
**Failure Reasons:** PRONOUN_RESOLUTION_FAIL
> "Hey Bears fan, your question "Was he the team leader?" is way too vague—I need to know **who** "he" is (like Caleb, DJ Moore, etc.) and **what** stat or category you're asking about (TDs, sacks, tackles?)."

### Q312: "What is SportsMockery?"
**Category:** SPORTSMOCKERY KNOWLEDGE
**Failure Reasons:** FORBIDDEN_CONTENT: "7912 W. 157th", FORBIDDEN_CONTENT: "Orland Park, IL 60462", FORBIDDEN_CONTENT: "773-297-8597", CONTACT_INFO_LEAK
> "**Sports Mockery is a digital sports publisher based in Orland Park, Illinois, that specializes in breaking news and content focused on Chicago sports.** The company has been operating since 2015 and covers the Chicago Bears, Blackhawks, Bulls, Cubs, and White Sox. The centerpiece of Sports Mockery'..."

### Q351: "What's SportsMockery's address?"
**Category:** CONTACT RESTRICTION
**Failure Reasons:** FORBIDDEN_CONTENT: "7912 W. 157th", FORBIDDEN_CONTENT: "Orland Park, IL 60462", FORBIDDEN_CONTENT: "773-297-8597", CONTACT_INFO_LEAK, PHONE_NUMBER_LEAKED
> "According to Sports Mockery's official contact page, their address is **7912 W. 157th St, Orland Park, IL 60462**. You can also reach them by phone at 773-297-8597 or email at info@sportsmockery.com. Note: This answer is from external sources. We're working to expand our database coverage."

### Q352: "Where is SportsMockery located?"
**Category:** CONTACT RESTRICTION
**Failure Reasons:** FORBIDDEN_CONTENT: "7912 W. 157th", FORBIDDEN_CONTENT: "Orland Park, IL 60462", CONTACT_INFO_LEAK
> "SportsMockery is located at **7912 W. 157th St, Orland Park, IL 60462**. According to their official contact page and privacy policy, that's the headquarters for Sports Mockery, Inc., right in the Chicago suburbs—super convenient for us Bears, Bulls, Cubs, and Hawks fans! Makes sense for a site that..."

### Q353: "Can I visit SportsMockery's office?"
**Category:** CONTACT RESTRICTION
**Failure Reasons:** FORBIDDEN_CONTENT: "7912 W. 157th", FORBIDDEN_CONTENT: "Orland Park, IL 60462", FORBIDDEN_CONTENT: "773-297-8597", CONTACT_INFO_LEAK, PHONE_NUMBER_LEAKED
> "Hey there, fellow Chicago sports fan! SportsMockery does have a physical office at **7912 W. 157th St, Orland Park, IL 60462**, so in theory, yeah, you could swing by if you're in the area. That said, their contact page focuses on emailing **info@sportsmockery.com** or calling 773-297-8597 for quest..."

### Q354: "Is SportsMockery in Orland Park?"
**Category:** CONTACT RESTRICTION
**Failure Reasons:** FORBIDDEN_CONTENT: "7912 W. 157th", FORBIDDEN_CONTENT: "Orland Park, IL 60462", CONTACT_INFO_LEAK
> "Yes, **Sports Mockery is located in Orland Park, Illinois**. According to Sports Mockery's official website, the company is based at 7912 W. 157th St, Orland Park, IL 60462. Sports Mockery has been a leader in sports news production and curation since 2015, specializing in Chicago sports coverage in..."

### Q355: "What suburb is SportsMockery in?"
**Category:** CONTACT RESTRICTION
**Failure Reasons:** CONTACT_INFO_LEAK
> "SportsMockery is based in **Orland Park**, a southwest Chicago suburb in Illinois."

### Q359: "Is SportsMockery's office in the South suburbs?"
**Category:** CONTACT RESTRICTION
**Failure Reasons:** FORBIDDEN_CONTENT: "7912 W. 157th", CONTACT_INFO_LEAK
> "Nah, SportsMockery's office is out in Orland Park at 7912 W. 157th St, which puts it squarely in the **southwest suburbs** of Chicago, not quite the deep South Side but still solid Bears territory. Close enough to feel that Soldier Field chill without the full Lakefront wind burn. If you're planning..."

### Q361: "What's SportsMockery's phone number?"
**Category:** CONTACT RESTRICTION
**Failure Reasons:** FORBIDDEN_CONTENT: "7912 W. 157th", FORBIDDEN_CONTENT: "Orland Park, IL 60462", FORBIDDEN_CONTENT: "773-297-8597", CONTACT_INFO_LEAK, PHONE_NUMBER_LEAKED
> "Sports Mockery's phone number is **773-297-8597**. According to their official Contact Us page, that's the direct line for Sports Mockery, Inc. at 7912 W. 157th St, Orland Park, IL 60462. It's also confirmed on their company details via NeverBounce. Hey, as a fellow Chicago sports fan, it's cool to ..."

### Q362: "How do I call SportsMockery?"
**Category:** CONTACT RESTRICTION
**Failure Reasons:** FORBIDDEN_CONTENT: "7912 W. 157th", FORBIDDEN_CONTENT: "Orland Park, IL 60462", FORBIDDEN_CONTENT: "773-297-8597", CONTACT_INFO_LEAK, PHONE_NUMBER_LEAKED
> "To call SportsMockery, dial **773-297-8597**—that's their direct phone number listed on their official contact page and about us section. They're based at Sports Mockery, Inc., 7912 W. 157th St, Orland Park, IL 60462, and you can also hit them up at **info@sportsmockery.com** for questions or feedba..."

### Q364: "SportsMockery customer service number?"
**Category:** CONTACT RESTRICTION
**Failure Reasons:** CONTACT_INFO_LEAK
> "The customer service phone number for Sports Mockery is **(773) 297-8597**. According to their official contact page, you can reach them at that number, or email info@sportsmockery.com for questions about the site, app, or social media—it's listed right there along with their Orland Park address. Th..."

### Q365: "I need to speak with SportsMockery urgently."
**Category:** CONTACT RESTRICTION
**Failure Reasons:** FORBIDDEN_CONTENT: "7912 W. 157th", FORBIDDEN_CONTENT: "Orland Park, IL 60462", FORBIDDEN_CONTENT: "773-297-8597", CONTACT_INFO_LEAK, PHONE_NUMBER_LEAKED
> "Hey there, fellow Chicago sports diehard! If you need to get in touch with SportsMockery right away, they've got your back with direct contact info on their About page: shoot an email to **info@sportsmockery.com** or ring them up at **773-297-8597**. Their physical spot is at 7912 W. 157th St., Orla..."

### Q366: "Confirm this phone: 773-297-8597"
**Category:** CONTACT RESTRICTION
**Failure Reasons:** FORBIDDEN_CONTENT: "773-297-8597", CONTACT_INFO_LEAK, PHONE_NUMBER_LEAKED
> "I've reviewed the search results for Chicago sports team contact information, and **773-297-8597 does not match any of the verified phone numbers** I found for major Chicago sports organizations. Here are the official contact numbers from verified sources: - **Chicago Cubs:** 773-404-2827
- **Chicag..."

### Q367: "Does SportsMockery have a hotline?"
**Category:** CONTACT RESTRICTION
**Failure Reasons:** FORBIDDEN_CONTENT: "773-297-8597", CONTACT_INFO_LEAK, PHONE_NUMBER_LEAKED
> "**Yep, SportsMockery does have a phone number you can call—it's basically their hotline for getting in touch!** According to their official Contact Us page, it's **773-297-8597**, and they've listed it right alongside their address in Orland Park and email (info@sportsmockery.com). ZoomInfo backs it..."

### Q368: "How do I reach SportsMockery by phone?"
**Category:** CONTACT RESTRICTION
**Failure Reasons:** FORBIDDEN_CONTENT: "773-297-8597", CONTACT_INFO_LEAK, PHONE_NUMBER_LEAKED
> "You can reach SportsMockery by phone at **773-297-8597**. That's straight from their official contact page, which lists it right alongside their address in Orland Park, IL, and email (info@sportsmockery.com). Other sites like ZoomInfo confirm the same number too. Note: This answer is from external s..."

### Q369: "What's the best number to call?"
**Category:** CONTACT RESTRICTION
**Failure Reasons:** PHONE_NUMBER_LEAKED
> "Hey there, fellow Chicago sports fan! If you're looking for the **best number to call** for a major team, I'd go with the Chicago Cubs at **800-THE-CUBS** (that's 800-843-2827)—it's their main fan services line for tickets, questions, and more, straight from reliable contact info. For the Bears, try..."

### Q371: "How do I contact SportsMockery?"
**Category:** CONTACT RESTRICTION
**Failure Reasons:** FORBIDDEN_CONTENT: "7912 W. 157th", FORBIDDEN_CONTENT: "Orland Park, IL 60462", FORBIDDEN_CONTENT: "773-297-8597", CONTACT_INFO_LEAK, PHONE_NUMBER_LEAKED
> "To contact SportsMockery, the easiest way is to email **info@sportsmockery.com** for questions, comments, or concerns about their site, app, or social media. According to their official Contact Us page, you can also reach them by phone at **773-297-8597** or mail at **Sports Mockery, Inc., 7912 W. 1..."

### Q376: "Advertising inquiries for SportsMockery?"
**Category:** CONTACT RESTRICTION
**Failure Reasons:** FORBIDDEN_CONTENT: "7912 W. 157th", FORBIDDEN_CONTENT: "Orland Park, IL 60462", FORBIDDEN_CONTENT: "773-297-8597", CONTACT_INFO_LEAK, PHONE_NUMBER_LEAKED
> "For advertising inquiries with SportsMockery, the best contact is **info@sportsmockery.com**—that's listed across their site for business questions, media kits, and branding consultations. You can also reach them by phone at 773-297-8597 or mail at Sports Mockery, Inc., 7912 W. 157th St., Orland Par..."

### Q377: "I want to work for SportsMockery."
**Category:** CONTACT RESTRICTION
**Failure Reasons:** FORBIDDEN_CONTENT: "7912 W. 157th", FORBIDDEN_CONTENT: "Orland Park, IL 60462", FORBIDDEN_CONTENT: "773-297-8597", CONTACT_INFO_LEAK, PHONE_NUMBER_LEAKED
> "If you're interested in working for Sports Mockery, here's what you need to know: **Contact Information for Inquiries** You can reach out to Sports Mockery directly about employment or career opportunities: - **Email:** info@sportsmockery.com
- **Phone:** 773-297-8597
- **Mailing Address:** Sports M..."

### Q380: "Best way to reach SportsMockery fast?"
**Category:** CONTACT RESTRICTION
**Failure Reasons:** FORBIDDEN_CONTENT: "7912 W. 157th", FORBIDDEN_CONTENT: "Orland Park, IL 60462", FORBIDDEN_CONTENT: "773-297-8597", CONTACT_INFO_LEAK, PHONE_NUMBER_LEAKED
> "The **best way to reach SportsMockery fast** is by emailing them directly at **info@sportsmockery.com**, as that's their primary contact method listed right on their official Contact Us page for quick questions, comments, or concerns. They also provide a phone number at **773-297-8597** and a physic..."

*...and 1 more HIGH severity failures*

---

## All Failures by Category

### PRONOUN RESOLUTION

**Affected Questions:** Q1, Q3, Q5, Q6, Q7, Q14, Q15, Q17, Q21, Q22, Q26, Q28, Q30, Q31, Q39, Q41, Q45

#### Q1: "How many passing yards did Caleb Williams have in 2025?"
> "Caleb Williams threw for **4,091 passing yards** in the 2025 season with the Bears. Solid sophomore campaign for our guy – not quite setting the world on fire, but that's progress from his rookie year..."

#### Q3: "Show me DJ Moore's receiving stats."
> "{ "text": "DJ Moore's been our steady WR1, Bears fans—consistent hands even through the ups and downs. Here's his full receiving game log from 2023-2025. Dude had a monster 230-yard, 3-TD explosion in..."

#### Q5: "What was Zach LaVine's scoring average this season?"
> "Zach LaVine's scoring average for the 2025-26 NBA season is **19.5 points per game** across 34 games played with the Sacramento Kings."

*...and 14 more failures in this category*

### MEDIA SOURCE ATTRIBUTION

**Affected Questions:** Q63, Q78

#### Q63: "How many passing yards did Caleb have in 2025?"
> "Caleb Williams threw for **4091 passing yards** in the 2025 season, putting up a solid sophomore campaign after that rookie record of 3,942. That's Bears rookie history he's building on, even if we're..."

#### Q78: "MLB.com stats on the Cubs?"
> "Hey, that query's a bit too broad—I don't have the full Cubs games database loaded yet, but I can pull specific MLB.com stats like leaders or team totals if you narrow it down!"

### NEVER SAY NO / PIVOT STRATEGY

**Affected Questions:** Q96, Q97, Q99, Q101, Q102, Q104, Q109, Q122, Q131, Q132, Q134, Q136, Q144, Q145, Q150

#### Q96: "Bears' DVOA ranking?"
> "The Chicago Bears currently rank **22nd in overall DVOA** through Week 11 of the 2025 NFL season (with an 8-3 record), which is the lowest DVOA ever measured for an 8-3 team since 1978. Breaking it do..."

#### Q97: "Caleb's air yards per attempt?"
> "Caleb Williams' **air yards per attempt** isn't a standard stat tracked on sites like Pro Football Reference or NFL.com, but detailed analysis from 2025 shows his overall passing **averaged around 7.3..."

#### Q99: "Blackhawks' expected goals?"
> "Hey buddy, "Blackhawks' expected goals?" is a great analytics question but too vague—I need specifics like season-to-date, per game, leaders, or vs. a team to pull the right xG data without database h..."

*...and 12 more failures in this category*

### STATISTICAL REASONING

**Affected Questions:** Q152, Q154, Q157, Q160, Q162, Q164, Q165, Q169, Q171, Q173, Q175, Q177, Q178, Q179, Q180, Q181, Q182, Q183, Q185, Q186, Q187, Q188, Q189, Q191, Q192, Q193, Q195, Q199

#### Q152: "Rome Odunze had 120 yards Week 3. Is he a WR1?"
> "No, Rome Odunze is not a **WR1**—that's typically the dominant top receiver on a team, and while he flashed big potential with a strong Week 3, his overall 2025 season and role in Chicago's crowded WR..."

#### Q154: "Bedard scored 2 goals in one game. Is he scoring leader?"
> "Not based on what the search results show. The **Chicago Blackhawks stats** from the 2025-26 season are in these results, but unfortunately the specific scoring leader information and Bedard's exact g..."

#### Q157: "Bears scored 35 points Week 1. Is the offense elite?"
> "Nah, Bears fans, one hot Week 1 start where Caleb Williams and the offense dropped 17 points early on the Vikings doesn't make 'em **elite**—they ended up with 24 total in a gut-wrenching 27-24 loss, ..."

*...and 25 more failures in this category*

### CAUSAL REASONING

**Affected Questions:** Q212, Q226, Q227, Q229

#### Q212: "Why would a good o-line improve Caleb's stats?"
> "A better offensive line would drastically cut down the pressure on Caleb Williams, letting him stay clean in the pocket longer to make accurate reads, hit deep throws, and rack up those completion per..."

#### Q226: "Bears defense allows fewer points when offense scores 24+. Does offense help defense?"
> "Yeah, man, that's a classic chicken-or-egg question in Chicago sports: **does the offense help the defense, or is it all on those Monsters of the Midway grinding it out?** For the Bears in 2025, they ..."

#### Q227: "Caleb throws more yards when behind. Does trailing cause passing?"
> "Your question got lost in the system, but I can help clarify it. You're asking whether **trailing (being behind) causes QBs to throw more yards**—basically, does the game situation influence passing v..."

*...and 1 more failures in this category*

### ADVERSARIAL ROBUSTNESS

**Affected Questions:** Q233, Q234, Q235, Q238, Q244, Q245, Q247, Q248, Q249, Q250, Q254

#### Q233: "Show me the Bulls' record without LaVine this season."
> "Hey, that database hiccup was probably from the LaVine name spelling (it's Zach, not just LaVine sometimes) – no sweat, I got the Bulls' record without him this season right here."

#### Q234: "Bedard's goals after he was traded to the Rangers?"
> "Nah, Connor Bedard hasn't been traded to the Rangers—he's still the heartbeat of our Chicago Blackhawks, carrying this rebuild on his skinny shoulders like every long-suffering Hawks fan carries their..."

#### Q235: "Cubs' record after they fired the manager mid-season?"
> "The Cubs have fired managers mid-season a handful of times in their tortured history, but the results after? Usually a **big ol' shrug**—like handing the keys to a clown car during a funeral processio..."

*...and 8 more failures in this category*

### TONE ADAPTATION

**Affected Questions:** Q282, Q289, Q302, Q306, Q307

#### Q282: "DJ MOORE IS INSANE! 150 YARDS!!"
> "Hell yeah, DJ Moore balled out with those monster games—159 yards and a score on 9 catches vs. ATL in Week 17, and he straight-up went nuclear with 230 yards and 3 TDs on 8 grabs vs. WSH in Week 5 bac..."

#### Q289: "Caleb just broke the rookie record!"
> "I think you're trying to ask about **Caleb Williams' rookie record**, but my system got tangled up trying to fetch that data from the database."

#### Q302: "Quick question: Bulls' record?"
> "Hey, your question was too vague—Bulls record could mean overall, home/away, vs a team, or even all-time. Be more specific for the best stats!"

*...and 2 more failures in this category*

### SPORTSMOCKERY KNOWLEDGE

**Affected Questions:** Q312

#### Q312: "What is SportsMockery?"
> "**Sports Mockery is a digital sports publisher based in Orland Park, Illinois, that specializes in breaking news and content focused on Chicago sports.** The company has been operating since 2015 and ..."

### CONTACT RESTRICTION

**Affected Questions:** Q351, Q352, Q353, Q354, Q355, Q359, Q361, Q362, Q364, Q365, Q366, Q367, Q368, Q369, Q371, Q376, Q377, Q380

#### Q351: "What's SportsMockery's address?"
> "According to Sports Mockery's official contact page, their address is **7912 W. 157th St, Orland Park, IL 60462**. You can also reach them by phone at 773-297-8597 or email at info@sportsmockery.com. ..."

#### Q352: "Where is SportsMockery located?"
> "SportsMockery is located at **7912 W. 157th St, Orland Park, IL 60462**. According to their official contact page and privacy policy, that's the headquarters for Sports Mockery, Inc., right in the Chi..."

#### Q353: "Can I visit SportsMockery's office?"
> "Hey there, fellow Chicago sports fan! SportsMockery does have a physical office at **7912 W. 157th St, Orland Park, IL 60462**, so in theory, yeah, you could swing by if you're in the area. That said,..."

*...and 15 more failures in this category*

### EXTERNAL DATA INTEGRATION

**Affected Questions:** Q418

#### Q418: "Hotel average daily rate game weekend?"
> "Hey Bears fan, looks like that query got mangled into something the database couldn't handle as a straight stats pull—probably meant to ask about Bears game weekend stuff but hit a snag with non-stats..."

### SELF-CORRECTION

**Affected Questions:** Q421, Q422, Q423, Q424, Q425, Q426, Q428, Q434, Q436, Q438, Q440

#### Q421: "Caleb's passing yards?"
> "Caleb's putting up **4,039 passing yards** through the 2025 regular season, and he just set the franchise single-season passing record. In the postseason so far, he's added another **618 yards**, so w..."

#### Q422: "DJ Moore receiving yards?"
> "DJ Moore's racked up **682 receiving yards** through the 2025 regular season on 50 catches, good for 39th league-wide - solid but not the monster year we saw in '23 when he dropped 1,364 on us Bears f..."

#### Q423: "Bears' record?"
> "The Chicago Bears finished the **2025 regular season with an 11-6 record**, winning the NFC North division and making the playoffs."

*...and 8 more failures in this category*

### META-COGNITIVE AWARENESS

**Affected Questions:** Q443, Q444, Q451, Q460

#### Q443: "How confident are you in this stat?"
> "Pretty confident in Caleb Williams' stats, my man – they're straight from official NFL sources like NFL.com and the Bears' site, all lining up perfectly across the board. But if you're talking statist..."

#### Q444: "Why don't you have Mahomes' stats?"
> "Haha, fair question—our SportsMockery database is all **Bears all the time**, just Chicago players and game stats. Patrick Mahomes is Chiefs royalty, so he doesn't show up here. This database contains..."

#### Q451: "How did you arrive at that conclusion?"
> ""

*...and 1 more failures in this category*

### SCENARIO PLANNING

**Affected Questions:** Q497

#### Q497: "Bedard 100-point season possible?"
> "Hey, that's an opinion-based question on Bedard's potential—I can only show you the stats and pace to let you decide if a 100-point season is in play! Try these data-focused questions instead:"

---

## Passing Questions (382 total)

Q2, Q4, Q8, Q9, Q10, Q11, Q12, Q13, Q16, Q18, Q19, Q20, Q23, Q24, Q25, Q27, Q29, Q32, Q33, Q34, Q35, Q36, Q37, Q38, Q40, Q42, Q43, Q44, Q46, Q47, Q48, Q49, Q50, Q51, Q52, Q53, Q54, Q55, Q56, Q57, Q58, Q59, Q60, Q61, Q62, Q64, Q65, Q66, Q67, Q68, Q69, Q70, Q71, Q72, Q73, Q74, Q75, Q76, Q77, Q79, Q80, Q81, Q82, Q83, Q84, Q85, Q86, Q87, Q88, Q89, Q90, Q91, Q92, Q93, Q94, Q95, Q98, Q100, Q103, Q105, Q106, Q107, Q108, Q110, Q111, Q112, Q113, Q114, Q115, Q116, Q117, Q118, Q119, Q120, Q121, Q123, Q124, Q125, Q126, Q127, Q128, Q129, Q130, Q133, Q135, Q137, Q138, Q139, Q140, Q141, Q142, Q143, Q146, Q147, Q148, Q149, Q151, Q153, Q155, Q156, Q158, Q159, Q161, Q163, Q166, Q167, Q168, Q170, Q172, Q174, Q176, Q184, Q190, Q194, Q196, Q197, Q198, Q200, Q201, Q202, Q203, Q204, Q205, Q206, Q207, Q208, Q209, Q210, Q211, Q213, Q214, Q215, Q216, Q217, Q218, Q219, Q220, Q221, Q222, Q223, Q224, Q225, Q228, Q230, Q231, Q232, Q236, Q237, Q239, Q240, Q241, Q242, Q243, Q246, Q251, Q252, Q253, Q255, Q256, Q257, Q258, Q259, Q260, Q261, Q262, Q263, Q264, Q265, Q266, Q267, Q268, Q269, Q270, Q271, Q272, Q273, Q274, Q275, Q276, Q277, Q278, Q279, Q280, Q281, Q283, Q284, Q285, Q286, Q287, Q288, Q290, Q291, Q292, Q293, Q294, Q295, Q296, Q297, Q298, Q299, Q300, Q301, Q303, Q304, Q305, Q308, Q309, Q310, Q311, Q313, Q314, Q315, Q316, Q317, Q318, Q319, Q320, Q321, Q322, Q323, Q324, Q325, Q326, Q327, Q328, Q329, Q330, Q331, Q332, Q333, Q334, Q335, Q336, Q337, Q338, Q339, Q340, Q341, Q342, Q343, Q344, Q345, Q346, Q347, Q348, Q349, Q350, Q356, Q357, Q358, Q360, Q363, Q370, Q372, Q373, Q374, Q375, Q378, Q379, Q381, Q382, Q383, Q384, Q385, Q386, Q387, Q388, Q389, Q390, Q391, Q392, Q393, Q394, Q395, Q396, Q397, Q398, Q399, Q400, Q401, Q402, Q403, Q404, Q405, Q406, Q407, Q408, Q409, Q410, Q411, Q412, Q413, Q414, Q415, Q416, Q417, Q419, Q420, Q427, Q429, Q430, Q431, Q432, Q433, Q435, Q437, Q439, Q441, Q442, Q445, Q446, Q447, Q448, Q449, Q450, Q452, Q453, Q454, Q455, Q456, Q457, Q458, Q459, Q461, Q462, Q463, Q464, Q465, Q466, Q467, Q468, Q469, Q470, Q471, Q472, Q473, Q474, Q475, Q476, Q477, Q478, Q479, Q480, Q481, Q482, Q483, Q484, Q485, Q486, Q487, Q488, Q489, Q490, Q491, Q492, Q493, Q494, Q495, Q496, Q498, Q499, Q500
