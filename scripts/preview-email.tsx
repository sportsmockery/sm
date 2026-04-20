import { render } from '@react-email/components';
import { ChicagoDailyEmail } from '../src/emails/ChicagoDailyEmail';
import { prepareDailyEmailVariables } from '../src/lib/email/prepare-daily';

// Real stories from April 19, 2026 (from sm_posts)
const rawStories = [
  { id: '53089', title: "How The Dexter Lawrence Trade Just Proved The Bears REALLY Want To Move Down", url: 'https://test.sportsmockery.com/how-the-dexter-lawrence-trade-just-proved-the-bears-really-want-to-move-down', imageUrl: 'https://www.sportsmockery.com/wp-content/uploads/2026/04/Dexter-Lawrence.jpg', team: 'Bears', summary: "The Cincinnati Bengals have long held a reputation as a conservative team when it comes to their draft capital. They almost never traded it away.", publishedAt: '2026-04-19T12:03:38Z', views: 6729 },
  { id: '53088', title: "We Finally Know Why The Bears Are Obsessed With De'Zhaun Stribling — Here's How", url: 'https://test.sportsmockery.com/we-finally-know-why-the-bears-are-obsessed-with-dezhaun-stribling-heres-how', imageUrl: 'https://www.sportsmockery.com/wp-content/uploads/2026/03/DeZhaun-Stribling.jpg', team: 'Bears', summary: "Wide receiver wasn't a position many expected the Bears to focus on early. However, the D.J. Moore trade changed everything.", publishedAt: '2026-04-19T17:37:27Z', views: 4226 },
  { id: '52644', title: "How The Bears' Growing Interest In Keylan Rutledge Suddenly Makes Sense", url: 'https://test.sportsmockery.com/how-the-bears-growing-interest-in-keylan-rutledge-suddenly-makes-sense', imageUrl: 'https://www.sportsmockery.com/wp-content/uploads/2026/03/Keylan-Rutledge.jpg', team: 'Bears', summary: "The Bears have been active on the offensive line circuit ahead of the draft. In three months, they were hit hard by free agency losses.", publishedAt: '2026-04-19T03:27:50Z', views: 4034 },
  { id: '53077', title: "Bears Offensive Line Overhaul Sets Stage for Caleb Williams's Breakout", url: 'https://test.sportsmockery.com/bears-offensive-line-overhaul-caleb-williams-breakout-2025', imageUrl: '', team: 'Bears', summary: "The Bears invested heavily in protecting Caleb Williams this offseason. Here's why it could transform the offense.", publishedAt: '2026-04-19T05:22:25Z', views: 5 },
  { id: '53078', title: 'Should the Bulls Trade Zach LaVine? The Great Chicago Debate', url: 'https://test.sportsmockery.com/should-bulls-trade-zach-lavine-great-debate-2026', imageUrl: '', team: 'Bulls', summary: "Bulls fans are split on LaVine's future. We break down both sides of the most heated debate in Chicago basketball.", publishedAt: '2026-04-19T05:22:25Z', views: 0 },
  { id: '53079', title: 'Cubs Land Ace Pitcher in Blockbuster Deal', url: 'https://test.sportsmockery.com/cubs-land-ace-pitcher-blockbuster-120m-deal-2026', imageUrl: '', team: 'Cubs', summary: "Chicago makes its biggest pitching investment in franchise history, signaling the window is open now.", publishedAt: '2026-04-19T05:22:25Z', views: 0 },
];

const rawGames = [
  { id: 'g1', team: 'Cubs', teamSlug: 'chicago-cubs', opponent: 'STL', opponentFull: 'St. Louis Cardinals', teamScore: 7, opponentScore: 2, isHome: true, result: 'W' as const, gameDate: '2026-04-19', scoresUrl: 'https://test.sportsmockery.com/chicago-cubs/scores' },
  { id: 'g2', team: 'White Sox', teamSlug: 'chicago-white-sox', opponent: 'DET', opponentFull: 'Detroit Tigers', teamScore: 3, opponentScore: 8, isHome: false, result: 'L' as const, gameDate: '2026-04-19', scoresUrl: 'https://test.sportsmockery.com/chicago-white-sox/scores' },
];

async function main() {
  const variables = prepareDailyEmailVariables(rawStories, rawGames, new Date('2026-04-20T11:00:00Z'));
  console.error('Scout examples:', variables.scout_examples);
  const html = await render(ChicagoDailyEmail(variables));
  console.log(html);
}

main().catch(console.error);
