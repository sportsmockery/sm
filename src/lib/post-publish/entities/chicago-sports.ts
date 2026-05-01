/**
 * Curated allow-list of Chicago sports entities used by the inverted-pyramid
 * lede validator (rule #19a). Lower-cased for cheap inclusion checks.
 *
 * Maintained by hand on purpose — false negatives cost a writer-fix prompt
 * they don't owe; false positives are cheap (writer keeps their lede). When
 * a roster swap happens, add or remove from the relevant section.
 */

export const BEARS_PEOPLE: string[] = [
  // QB / Skill
  'caleb williams',
  'tyson bagent',
  "d'andre swift",
  'roschon johnson',
  'rome odunze',
  'd.j. moore',
  'dj moore',
  'keenan allen',
  'cole kmet',
  'gerald everett',
  // Defense
  'montez sweat',
  'tremaine edmunds',
  'jaylon johnson',
  'kyler gordon',
  'tj edwards',
  't.j. edwards',
  'kevin byard',
  // Special teams / kickers / punters
  'cairo santos',
  // Front office / coaching
  'ben johnson',
  'ryan poles',
  'kevin warren',
  'eric washington',
  'matt eberflus', // recent past — keep until staff fully turned over
]

export const CUBS_PEOPLE: string[] = [
  'craig counsell',
  'jed hoyer',
  'carter hawkins',
  'shōta imanaga',
  'shota imanaga',
  'justin steele',
  'jameson taillon',
  'kyle hendricks', // recent past
  'pete crow-armstrong',
  'pca',
  'seiya suzuki',
  'ian happ',
  'nico hoerner',
  'dansby swanson',
  'michael busch',
]

export const WHITESOX_PEOPLE: string[] = [
  'chris getz',
  'will venable',
  'pedro grifol', // recent past
  'luis robert',
  'luis robert jr',
  'andrew benintendi',
  'andrew vaughn',
  'garrett crochet', // traded — keep for legacy posts
  'colson montgomery',
  'noah schultz',
]

export const BULLS_PEOPLE: string[] = [
  'billy donovan',
  'arturas karnisovas',
  'artūras karnišovas',
  'marc eversley',
  'josh giddey',
  'coby white',
  'matas buzelis',
  'patrick williams',
  'nikola vučević',
  'nikola vucevic',
  'ayo dosunmu',
  'zach lavine', // traded — keep for legacy posts
  'lonzo ball',
]

export const BLACKHAWKS_PEOPLE: string[] = [
  'connor bedard',
  'kyle davidson',
  'anders sörensen',
  'anders sorensen',
  'luke richardson', // recent past
  'frank nazar',
  'kevin korchinski',
  'alex vlasic',
  'taylor hall',
  'philipp kurashev',
  'tyler bertuzzi',
  'spencer knight',
]

export const TEAM_NAMES: string[] = [
  'bears',
  'chicago bears',
  'cubs',
  'chicago cubs',
  'white sox',
  'whitesox',
  'chicago white sox',
  'bulls',
  'chicago bulls',
  'blackhawks',
  'chicago blackhawks',
]

export const VENUES: string[] = [
  'soldier field',
  'wrigley',
  'wrigley field',
  'rate field',
  'guaranteed rate field',
  'united center',
]

export const BEAT_REPORTERS: string[] = [
  // Bears
  'kevin fishbain',
  'adam jahns',
  'dan wiederer',
  'brad biggs',
  'courtney cronin',
  'jason lieser',
  // Cubs / Sox
  'patrick mooney',
  'sahadev sharma',
  'james fegan',
  'scot gregor',
  'mark gonzales',
  // Bulls / Hawks
  'k.c. johnson',
  'kc johnson',
  'mark schanowski',
  'darnell mayberry',
  'mark lazerus',
  'scott powers',
  'ben pope',
]

export const BROADCASTERS: string[] = [
  'pat hughes',
  'jason benetti',
  'len kasper',
  'darrin pang',
  'stacey king',
  'adam amin',
]

/**
 * Combined allow-list, lower-cased, used by the lede validator's entity
 * sub-check. Re-exported through `category-types.ts` for backwards-compat
 * with anywhere the old import path is still in use.
 */
export const CHICAGO_ENTITY_LIST: string[] = [
  ...BEARS_PEOPLE,
  ...CUBS_PEOPLE,
  ...WHITESOX_PEOPLE,
  ...BULLS_PEOPLE,
  ...BLACKHAWKS_PEOPLE,
  ...TEAM_NAMES,
  ...VENUES,
  ...BEAT_REPORTERS,
  ...BROADCASTERS,
]
