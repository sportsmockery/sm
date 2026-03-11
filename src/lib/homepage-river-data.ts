// River Feed Data - The Sports Mockery Intelligence Stream

export interface HomepageRiverItem {
  id: string
  type: "editorial" | "poll" | "chart" | "hub_update" | "box_score" | "trade_proposal" | "scout_summary" | "trending_article" | "debate" | "video"
  team: string
  teamColor: string
  timestamp: string
  data: Record<string, unknown>
}

// Sample River Feed for "For You" - mixed content from all teams
export const homepageRiverFeed: HomepageRiverItem[] = [
  // 1. Editorial Post Card
  {
    id: "river-1",
    type: "editorial",
    team: "Bears",
    teamColor: "#0B162A",
    timestamp: "2h",
    data: {
      author: { name: "Sports Mockery", handle: "SportsMockery", avatar: "SM", verified: true },
      headline: "Caleb Williams Working With New WR Corps in Offseason Drills",
      summary: "Bears QB Caleb Williams has been spotted running routes with the team's revamped wide receiver group in voluntary workouts at Halas Hall. The early chemistry building is a promising sign for the 2026 season.",
      insight: "Williams is taking a page from the elite QB playbook - building rapport before camp even starts. This proactive approach could accelerate the offense's development significantly.",
      author_name: "Amgaa Pureval",
      authorPhoto: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
      breakingIndicator: "REPORT",
      stats: { comments: 89, retweets: 312, likes: 1500, views: "45.2K" },
      gmQuestion: "Will Caleb Williams lead the Bears to the playoffs in 2026?",
      trendingContext: "12,000 reads in the last hour",
      scoutStat: "Bears have allowed pressure on 38% of dropbacks — highest rate since Week 2.",
      scoutAnalysis: "Williams completed 68% of passes to new receivers in offseason drills — a sharp improvement from last year's 59% with unfamiliar targets. Early chemistry is real.",
    },
  },
  // 2. Poll Card
  {
    id: "river-2",
    type: "poll",
    team: "Bears",
    teamColor: "#0B162A",
    timestamp: "3h",
    data: {
      question: "Should the Bears prioritize OL in Round 1 of the draft?",
      context: "Chicago has multiple needs heading into April. The offensive line remains a question mark despite offseason moves.",
      options: ["Yes, protect Caleb", "No, best player available", "Trade back for more picks", "Target a pass rusher"],
      totalVotes: 4832,
      status: "LIVE",
    },
  },
  // 3. Chart/Stats Card
  {
    id: "river-3",
    type: "chart",
    team: "Blackhawks",
    teamColor: "#CF0A2C",
    timestamp: "4h",
    data: {
      headline: "Connor Bedard's Point Production Trajectory",
      takeaway: "Bedard's points-per-game has increased 23% since December. At this pace, he's on track to finish with 75+ points in his sophomore season.",
      chartData: [
        { label: "Oct", value: 8 },
        { label: "Nov", value: 12 },
        { label: "Dec", value: 14 },
        { label: "Jan", value: 18 },
        { label: "Feb", value: 16 },
        { label: "Mar", value: 19 },
      ],
      statSource: "NHL.com, Sports Mockery Analysis",
      stats: { comments: 67, retweets: 234, likes: 890, views: "34.5K" },
    },
  },
  // 4. Hub Update Card
  {
    id: "river-4",
    type: "hub_update",
    team: "Bears",
    teamColor: "#0B162A",
    timestamp: "5h",
    data: {
      updateText: "Bears free agency tracker updated with 3 new OL names added this morning.",
      takeaway: "Front office is clearly prioritizing the trenches. Expect movement soon.",
      status: "NEW",
    },
  },
  // 5. Box Score Card
  {
    id: "river-5",
    type: "box_score",
    team: "Blackhawks",
    teamColor: "#CF0A2C",
    timestamp: "6h",
    data: {
      homeTeam: { name: "Blackhawks", logo: "https://a.espncdn.com/i/teamlogos/nhl/500/chi.png", score: 4 },
      awayTeam: { name: "Jets", logo: "https://a.espncdn.com/i/teamlogos/nhl/500/wpg.png", score: 3 },
      status: "FINAL",
      period: "Final",
      keyPerformer: "Connor Bedard - 2 G, 1 A",
    },
  },
  // 6. Trade Proposal Card
  {
    id: "river-6",
    type: "trade_proposal",
    team: "Bears",
    teamColor: "#0B162A",
    timestamp: "7h",
    data: {
      proposer: { name: "ChiTown GM", handle: "chitowngm_sm" },
      teamGets: { name: "Bears", items: ["2025 2nd Round Pick", "Veteran WR Depth"] },
      otherTeamGets: { name: "Raiders", items: ["CB Jaylon Johnson", "2025 4th Round Pick"] },
      fairnessScore: 72,
      isEditorApproved: true,
    },
  },
  // 7. Scout Summary Card
  {
    id: "river-7",
    type: "scout_summary",
    team: "Bulls",
    teamColor: "#CE1141",
    timestamp: "8h",
    data: {
      topic: "Bulls Trade Deadline Impact",
      summary: "The Bulls made strategic moves at the deadline, balancing cap flexibility with competitive roster construction. The focus remains on developing the young core while maintaining playoff viability.",
      bullets: [
        "Coby White's extension looking like a bargain with his current production",
        "Patrick Williams needs consistent opportunities in the second half",
        "Cap space opens up significantly next summer for a potential max player",
      ],
    },
  },
  // 8. Trending Article Card
  {
    id: "river-8",
    type: "trending_article",
    team: "Cubs",
    teamColor: "#0E3386",
    timestamp: "9h",
    data: {
      headline: "Bo Bichette Rumors: Cubs Emerge as Surprise Frontrunner",
      summary: "Multiple sources indicate Chicago has ramped up discussions with Toronto. The Cubs' prospect depth gives them unique leverage in any potential deal.",
      trendMetric: "Rising fast - 12K engagements in 2 hours",
      stats: { comments: 234, retweets: 567, likes: 2100, views: "89.3K" },
    },
  },
  // 9. Debate Card
  {
    id: "river-9",
    type: "debate",
    team: "Bulls",
    teamColor: "#CE1141",
    timestamp: "10h",
    data: {
      prompt: "Did the Bulls wait too long to move on from this core?",
      sideA: "Yes, wasted prime years",
      sideB: "No, gave them a fair shot",
      participantCount: 3421,
    },
  },
  // 10. Video Card
  {
    id: "river-10",
    type: "video",
    team: "Blackhawks",
    teamColor: "#CF0A2C",
    timestamp: "11h",
    data: {
      title: "Bedard's Top 10 Plays of 2026 So Far",
      duration: "4:32",
      source: "SM Originals",
      teaser: "From between-the-legs passes to overtime winners, Connor Bedard continues to dazzle Chicago.",
      thumbnailUrl: "https://a.espncdn.com/photo/2023/0629/r1189975_1296x729_16-9.jpg",
      stats: { comments: 156, retweets: 389, likes: 1800, views: "156K" },
    },
  },
  {
    id: "river-11",
    type: "editorial",
    team: "White Sox",
    teamColor: "#27251F",
    timestamp: "12h",
    data: {
      author: { name: "Sports Mockery", handle: "SportsMockery", avatar: "SM", verified: true },
      headline: "White Sox Begin Massive Rebuild: What Fans Need to Know",
      summary: "After years of trying to compete, the White Sox are finally tearing it down. Here's the roadmap and what to expect over the next few seasons.",
      insight: "The rebuild may be painful, but it's necessary. The White Sox need to stockpile young talent and draft capital to build a sustainable winner on the South Side.",
      author_name: "Aldo Soto",
      authorPhoto: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
      breakingIndicator: "ANALYSIS",
      stats: { comments: 189, retweets: 234, likes: 890, views: "45.6K" },
      trendingContext: "Chicago fans debating the rebuild timeline",
      scoutStat: "White Sox have traded 6 players with 10+ WAR in the last 18 months.",
      scoutAnalysis: "The White Sox farm system ranked 28th entering 2025. After deadline deals, they now sit at 12th with 4 top-100 prospects. The math is starting to work.",
    },
  },
  {
    id: "river-12",
    type: "box_score",
    team: "Bulls",
    teamColor: "#CE1141",
    timestamp: "1d",
    data: {
      homeTeam: { name: "Bulls", logo: "https://a.espncdn.com/i/teamlogos/nba/500/chi.png", score: 118 },
      awayTeam: { name: "Magic", logo: "https://a.espncdn.com/i/teamlogos/nba/500/orl.png", score: 112 },
      status: "FINAL",
      period: "Final",
      keyPerformer: "Coby White - 32 pts, 8 ast",
    },
  },
  {
    id: "river-13",
    type: "poll",
    team: "Cubs",
    teamColor: "#0E3386",
    timestamp: "1d",
    data: {
      question: "Who will be the Cubs' MVP in 2026?",
      context: "Spring training is underway. Who do you think will have the biggest impact this season?",
      options: ["Shota Imanaga", "Seiya Suzuki", "Dansby Swanson", "A prospect breakout"],
      totalVotes: 2891,
      status: "LIVE",
    },
  },
  {
    id: "river-14",
    type: "hub_update",
    team: "Blackhawks",
    teamColor: "#CF0A2C",
    timestamp: "1d",
    data: {
      updateText: "Blackhawks prospect rankings updated: Artyom Levshunov climbs to #2 in system.",
      takeaway: "The defensive depth is building faster than expected.",
      status: "UPDATED",
    },
  },
  // 15. Rumor Editorial (with credibility meter)
  {
    id: "river-15b",
    type: "editorial",
    team: "Bulls",
    teamColor: "#CE1141",
    timestamp: "1d",
    data: {
      author: { name: "Sports Mockery", handle: "SportsMockery", avatar: "SM", verified: true },
      headline: "Report: Bulls Exploring Zach LaVine Trade With Three Teams",
      summary: "Sources tell SM that the Bulls have had preliminary discussions with the Heat, 76ers, and Kings regarding a Zach LaVine deal. Chicago is seeking a first-round pick and salary relief.",
      author_name: "Amgaa Pureval",
      authorPhoto: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
      breakingIndicator: "RUMOR",
      rumorCredibility: "MEDIUM",
      stats: { comments: 412, retweets: 890, likes: 3200, views: "145K" },
      scoutStat: "LaVine is averaging 24.1 PPG but has missed 22 games this season.",
    },
  },
  {
    id: "river-15",
    type: "trending_article",
    team: "Bears",
    teamColor: "#0B162A",
    timestamp: "1d",
    data: {
      headline: "Ben Johnson's Offensive System: Film Breakdown",
      summary: "We dive deep into what the new Bears head coach's scheme could look like with Caleb Williams at the helm. The results are exciting.",
      trendMetric: "Most discussed - 8.5K comments",
      stats: { comments: 345, retweets: 678, likes: 2900, views: "123K" },
    },
  },
]

// Team-specific River feeds
export const homepageTeamRiverFeeds: Record<string, HomepageRiverItem[]> = {
  bears: homepageRiverFeed.filter((item) => item.team === "Bears"),
  bulls: homepageRiverFeed.filter((item) => item.team === "Bulls"),
  cubs: homepageRiverFeed.filter((item) => item.team === "Cubs"),
  blackhawks: homepageRiverFeed.filter((item) => item.team === "Blackhawks"),
  whitesox: homepageRiverFeed.filter((item) => item.team === "White Sox"),
}
