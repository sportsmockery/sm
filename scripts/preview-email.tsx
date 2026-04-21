import { render } from '@react-email/components';
import { ChicagoDailyEmail } from '../src/emails/ChicagoDailyEmail';
import { prepareDailyEmailVariables } from '../src/lib/email/prepare-daily';

// Yesterday's date for relative time calculation
const yesterday = new Date();
yesterday.setDate(yesterday.getDate() - 1);
const yISO = (h: number) => {
  const d = new Date(yesterday);
  d.setUTCHours(h, 0, 0, 0);
  return d.toISOString();
};

// Real stories from April 20, 2026 (from /api/daily)
const rawStories = [
  { id: '53537', title: "NFL Agents, Execs Believe Bears Are Targeting Emmanuel McNeil-Warren — Which Is Dangerous", url: 'https://test.sportsmockery.com/nfl-agents-execs-believe-bears-are-targeting-emmanuel-mcneil-warren-which-is-dangerous', imageUrl: 'https://www.sportsmockery.com/wp-content/uploads/2026/04/Emmanuel-McNeil-Warren.jpg', team: 'Bears', summary: "The Chicago Bears have been among the hardest teams to pin down on their intentions for the 2026 draft. Insiders close to the team have signaled they wish to move down.", publishedAt: yISO(12), views: 6486 },
  { id: '53087', title: "Ranking The Ten Most Likely Picks For The Chicago Bears At #25", url: 'https://test.sportsmockery.com/ranking-the-ten-most-likely-picks-for-the-chicago-bears-at-25', imageUrl: 'https://www.sportsmockery.com/wp-content/uploads/2026/01/USATSI_27021222-scaled.jpg', team: 'Bears', summary: "The speculation and guesswork are finally almost over. The 2026 NFL draft is less than a week away. By now, the Chicago Bears will have solidified their board.", publishedAt: yISO(2), views: 5410 },
  { id: '53086', title: "The Chris Johnson Clue Bears Fans Can't Ignore From Latest 1920 Football Drive", url: 'https://test.sportsmockery.com/the-chris-johnson-clue-bears-fans-cant-ignore-from-latest-1920-football-drive', imageUrl: 'https://www.sportsmockery.com/wp-content/uploads/2026/04/Chris-Johnson-scaled.jpg', team: 'Bears', summary: "There are few things more entertaining for Chicago Bears fans during the down periods of the NFL offseason than the episodes of 1920 Football Drive.", publishedAt: yISO(4), views: 4484 },
  { id: '53538', title: "Why The Chicago Bears' Trade Market For The 25th Pick Might Be Bigger Than Expected", url: 'https://test.sportsmockery.com/why-the-chicago-bears-trade-market-for-the-25th-pick-might-be-bigger-than-expected', imageUrl: 'https://www.sportsmockery.com/wp-content/uploads/2026/04/Ryan-Poles-and-Ben-Johnson.jpg', team: 'Bears', summary: "One of the more persistent rumors surrounding the Chicago Bears ahead of the 2026 NFL draft is their desire to move down from the 25th pick.", publishedAt: yISO(23), views: 4431 },
  { id: '53536', title: "The Chicago Bulls Now Set To Interview 5 NBA Execs — And One Stands Above The Rest", url: 'https://test.sportsmockery.com/the-chicago-bulls-now-set-to-interview-5-nba-execs-and-one-stands-above-the-rest', imageUrl: 'https://www.sportsmockery.com/wp-content/uploads/2026/04/The-Reinsdorfs.jpg', team: 'Bulls', summary: "The Chicago Bulls know they're up against the clock now. After dismissing Arturas Karnisovas as their VP of Basketball Operations, they must find his replacement.", publishedAt: yISO(17), views: 2738 },
  { id: '53535', title: "Three-Outcome Machine: Murakami's Wild Offensive Profile Driving White Sox Offense", url: 'https://test.sportsmockery.com/three-outcome-machine-murakamis-wild-offensive-profile-driving-white-sox-offense', imageUrl: 'https://www.sportsmockery.com/wp-content/uploads/2026/04/USATSI_28756041_168390417_lowres-scaled-e1776708983213.jpg', team: 'White Sox', summary: "Less than 30 games into his MLB career, Munetaka Murakami is already in rare company, homering in three straight games twice this season.", publishedAt: yISO(18), views: 837 },
];

// No Chicago games on April 20 per API
const rawGames: any[] = [];

async function main() {
  const variables = prepareDailyEmailVariables(rawStories, rawGames, new Date());
  console.error('Scout examples:', variables.scout_examples);
  const html = await render(ChicagoDailyEmail(variables));
  console.log(html);
}

main().catch(console.error);
