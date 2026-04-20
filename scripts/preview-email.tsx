/**
 * Email Preview Generator — uses real data from April 19, 2026
 * Usage: npx tsx scripts/preview-email.tsx > /tmp/email-preview.html
 */

import { render } from '@react-email/components';
import { ChicagoDailyEmail } from '../src/emails/ChicagoDailyEmail';

const sampleStories = [
  {
    id: '53089',
    title: "How The Dexter Lawrence Trade Just Proved The Bears REALLY Want To Move Down",
    url: 'https://test.sportsmockery.com/how-the-dexter-lawrence-trade-just-proved-the-bears-really-want-to-move-down',
    imageUrl: 'https://www.sportsmockery.com/wp-content/uploads/2026/04/Dexter-Lawrence.jpg',
    team: 'Bears' as const,
    summary: "The Dexter Lawrence trade sends a loud signal about Chicago's draft plans. Here's what it means for pick #10.",
    publishedAt: '2026-04-19T12:03:38Z',
    views: 6607,
  },
  {
    id: '53088',
    title: "We Finally Know Why The Bears Are Obsessed With De'Zhaun Stribling — Here's How",
    url: 'https://test.sportsmockery.com/we-finally-know-why-the-bears-are-obsessed-with-dezhaun-stribling-heres-how',
    imageUrl: 'https://www.sportsmockery.com/wp-content/uploads/2026/03/DeZhaun-Stribling.jpg',
    team: 'Bears' as const,
    summary: "Multiple sources confirm the Bears have met with Stribling more than any other receiver prospect.",
    publishedAt: '2026-04-19T17:37:27Z',
    views: 4122,
  },
  {
    id: '52644',
    title: "How The Bears' Growing Interest In Keylan Rutledge Suddenly Makes Sense",
    url: 'https://test.sportsmockery.com/how-the-bears-growing-interest-in-keylan-rutledge-suddenly-makes-sense',
    imageUrl: 'https://www.sportsmockery.com/wp-content/uploads/2026/03/Keylan-Rutledge.jpg',
    team: 'Bears' as const,
    summary: "The Bears' interest in the guard prospect has been building quietly. Now it all clicks into place.",
    publishedAt: '2026-04-19T03:27:50Z',
    views: 3984,
  },
  {
    id: '53077',
    title: "Bears Offensive Line Overhaul Sets Stage for Caleb Williams's Breakout",
    url: 'https://test.sportsmockery.com/bears-offensive-line-overhaul-caleb-williams-breakout-2025',
    imageUrl: '', // no featured image
    team: 'Bears' as const,
    summary: "Chicago's aggressive O-line rebuild gives Williams the protection he needs for a Year 2 leap.",
    publishedAt: '2026-04-19T05:22:25Z',
    views: 5,
  },
  {
    id: '53078',
    title: 'Should the Bulls Trade Zach LaVine? The Great Chicago Debate',
    url: 'https://test.sportsmockery.com/should-bulls-trade-zach-lavine-great-debate-2026',
    imageUrl: '', // no featured image
    team: 'Bulls' as const,
    summary: "The franchise is at a crossroads — and LaVine's future is the biggest question.",
    publishedAt: '2026-04-19T05:22:25Z',
    views: 0,
  },
  {
    id: '53079',
    title: 'Cubs Land Ace Pitcher in Blockbuster Deal',
    url: 'https://test.sportsmockery.com/cubs-land-ace-pitcher-blockbuster-120m-deal-2026',
    imageUrl: '', // no featured image
    team: 'Cubs' as const,
    summary: 'The Cubs make a major splash on the trade market, landing a front-line starter.',
    publishedAt: '2026-04-19T05:22:25Z',
    views: 0,
  },
];

const sampleGameResults = [
  {
    id: 'g1',
    team: 'Cubs' as const,
    teamSlug: 'chicago-cubs',
    opponent: 'STL',
    opponentFull: 'St. Louis Cardinals',
    teamScore: 7,
    opponentScore: 2,
    isHome: true,
    result: 'W' as const,
    gameDate: '2026-04-19',
    scoresUrl: 'https://test.sportsmockery.com/chicago-cubs/scores',
  },
  {
    id: 'g2',
    team: 'White Sox' as const,
    teamSlug: 'chicago-white-sox',
    opponent: 'DET',
    opponentFull: 'Detroit Tigers',
    teamScore: 3,
    opponentScore: 8,
    isHome: false,
    result: 'L' as const,
    gameDate: '2026-04-19',
    scoresUrl: 'https://test.sportsmockery.com/chicago-white-sox/scores',
  },
];

async function main() {
  const html = await render(
    ChicagoDailyEmail({
      date: 'Sunday, April 20, 2026',
      stories: sampleStories,
      gameResults: sampleGameResults,
      showAppPromo: true,
      unsubscribeUrl: 'https://sportsmockery.com/unsubscribe',
      managePrefsUrl: 'https://sportsmockery.com/preferences',
      previewText: 'Cubs W 7-2 + Dexter Lawrence trade proves Bears want to move down',
    })
  );

  console.log(html);
}

main().catch(console.error);
