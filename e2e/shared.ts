export const TEAMS = ['Bears', 'Bulls', 'Blackhawks', 'Cubs', 'White Sox'] as const
export type Team = typeof TEAMS[number]

export const TEAM_CATEGORIES: Record<Team, string> = {
  Bears: 'Chicago Bears',
  Bulls: 'Chicago Bulls',
  Blackhawks: 'Chicago Blackhawks',
  Cubs: 'Chicago Cubs',
  'White Sox': 'Chicago White Sox',
}

export const SAMPLE_ARTICLES: Record<Team, { title: string; content: string }> = {
  Bears: {
    title: 'Bears Draft Strategy: Why Chicago Should Trade Up for a Top Wide Receiver',
    content: `<p>The Chicago Bears enter the 2026 NFL Draft with significant needs on offense. After a promising 2025 season that saw Caleb Williams develop into a franchise quarterback, the front office must now surround him with elite weapons.</p>
<p>The Bears currently hold the 18th overall pick, but moving up could land them one of the top three receivers in this class. Trading future draft capital is always risky, but the window to maximize Williams' rookie contract is closing.</p>
<p>Chicago's receiving corps ranked 24th in yards after catch last season, and adding a dynamic playmaker could transform this offense. The question isn't whether the Bears need a receiver — it's how aggressive they should be to get one.</p>
<p>GM Ryan Poles has shown willingness to make bold moves, and this draft could define the Bears' trajectory for years to come. With cap space available and a young core in place, investing draft picks for immediate impact makes strategic sense.</p>`,
  },
  Bulls: {
    title: 'Bulls Rebuild Hits Accelerator: Zach LaVine Trade Opens New Era',
    content: `<p>The Chicago Bulls have entered a new chapter. After years of middling results, the front office finally pulled the trigger on a Zach LaVine trade that signals a full rebuild is underway.</p>
<p>The return package includes two first-round picks and a promising young wing, giving Chicago the draft capital to build around their emerging core. This move wasn't about giving up — it was about getting serious.</p>
<p>Coby White has emerged as a legitimate starting point guard, averaging 21 points and 6 assists this season. Patrick Williams continues to develop his two-way game. The foundation is there.</p>
<p>The Bulls need to be patient and smart with their newfound assets. The Eastern Conference is wide open, and a well-executed rebuild could have Chicago competing for a playoff spot within two years.</p>`,
  },
  Blackhawks: {
    title: 'Connor Bedard Is Living Up to the Hype: A Statistical Deep Dive',
    content: `<p>Connor Bedard is proving that the hype was justified. The Blackhawks' franchise cornerstone has elevated his game to new heights in his second full NHL season, and the numbers tell the story.</p>
<p>Bedard leads all Blackhawks skaters with 52 points through 51 games, a pace that would give him 83 points for the full season. His shot accuracy has improved from 11.2% to 14.8%, and his power play production has doubled.</p>
<p>What makes Bedard special isn't just the offense — it's how he controls the game. His Corsi For percentage of 54.2% means the Blackhawks dominate possession when he's on the ice. He's winning battles along the boards and creating chances for linemates.</p>
<p>The rebuild in Chicago is centered around Bedard, and so far, the investment is paying dividends. If he continues this trajectory, the Blackhawks could be a playoff team sooner than anyone expected.</p>`,
  },
  Cubs: {
    title: 'Cubs Pitching Staff Poised for Breakout 2026 Season',
    content: `<p>The Chicago Cubs have quietly assembled one of the most promising pitching staffs in the National League. With a blend of veteran arms and emerging talent, the rotation could be the key to a deep October run.</p>
<p>Justin Steele has established himself as a legitimate ace, posting a 2.98 ERA last season with 198 strikeouts. Behind him, Shota Imanaga proved he belongs in a major league rotation with his deceptive arsenal and elite command.</p>
<p>The bullpen got a massive upgrade with the signing of a proven closer, giving the Cubs a weapon they've lacked in recent years. The setup crew features two hard-throwing righties who dominated in the second half.</p>
<p>If the offense provides even average run support, this pitching staff has the talent to carry the Cubs to the postseason. The North Side is ready for meaningful baseball again.</p>`,
  },
  'White Sox': {
    title: 'White Sox Rebuild: Finding Hope After a Historic Loss Season',
    content: `<p>The Chicago White Sox are coming off one of the worst seasons in modern baseball history. But amid the wreckage of a 60-102 campaign, there are genuine reasons for optimism on the South Side.</p>
<p>The farm system has been completely restocked through aggressive trading. Top prospect Colson Montgomery showed flashes of his potential in a September call-up, and the system now ranks in the top 10 league-wide.</p>
<p>New management has brought a different philosophy to the organization. The focus is on player development, analytics-driven decisions, and building a sustainable winner rather than chasing quick fixes.</p>
<p>It will take time, but the White Sox have the building blocks for a legitimate contender. The key is patience — something Chicago's South Side fans have earned the right to expect will pay off.</p>`,
  },
}

export const BASE_URL = process.env.TEST_URL || 'https://test.sportsmockery.com'
