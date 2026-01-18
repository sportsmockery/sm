/**
 * COMPREHENSIVE CHAT MODERATION SYSTEM
 * Auto-moderates messages before they are published
 * Detects and blocks: profanity, hate speech, violence, spam,
 * sales/marketing, unauthorized links, nudity/sex, gambling, drugs, alcohol
 *
 * SECURITY NOTE: This is a client-side pre-filter. Server-side validation
 * is always performed via the API routes for security.
 */

import {
  enhancedModeration,
  SCAM_PATTERNS,
  HARASSMENT_PATTERNS,
} from './moderation-enhanced';

// =====================================================
// TYPES
// =====================================================

export interface ModerationResult {
  approved: boolean;
  action: 'allow' | 'warn' | 'block' | 'shadow_block' | 'mute' | 'ban';
  flags: ModerationFlag[];
  score: number; // 0.00 to 1.00 toxicity score
  sanitizedContent?: string; // Content with modifications (if any)
  blockedReason?: string;
}

export interface ModerationFlag {
  category: ModerationCategory;
  rule: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  matchedText: string;
}

export type ModerationCategory =
  | 'profanity'
  | 'hate_speech'
  | 'violence'
  | 'spam'
  | 'sales'
  | 'links'
  | 'harassment'
  | 'inappropriate'
  | 'nudity_sex'
  | 'gambling'
  | 'drugs_alcohol'
  | 'evasion';

export interface RateLimitContext {
  userId: string;
  messageHistory: { content: string; timestamp: number }[];
  lastMessageTime: number;
  messageCountLastMinute: number;
  messageCountLastHour: number;
  isNewUser: boolean; // Account < 24 hours old
  warningCount: number;
}

// =====================================================
// HOMOGLYPH / UNICODE NORMALIZATION
// Characters that look similar to Latin letters
// =====================================================

const HOMOGLYPH_MAP: Record<string, string> = {
  // Cyrillic
  'а': 'a', 'А': 'A', 'В': 'B', 'с': 'c', 'С': 'C', 'е': 'e', 'Е': 'E',
  'Н': 'H', 'і': 'i', 'І': 'I', 'К': 'K', 'М': 'M', 'Т': 'T', 'о': 'o',
  'О': 'O', 'р': 'p', 'Р': 'P', 'х': 'x', 'Х': 'X', 'у': 'y', 'У': 'Y',
  // Greek
  'α': 'a', 'Α': 'A', 'β': 'b', 'Β': 'B', 'ε': 'e', 'Ε': 'E', 'η': 'n',
  'Η': 'H', 'ι': 'i', 'Ι': 'I', 'κ': 'k', 'Κ': 'K', 'ν': 'v', 'Ν': 'N',
  'ο': 'o', 'Ο': 'O', 'ρ': 'p', 'Ρ': 'P', 'τ': 't', 'Τ': 'T', 'υ': 'u',
  'Υ': 'Y', 'χ': 'x', 'Χ': 'X',
  // Common substitutions
  '0': 'o', '1': 'i', '3': 'e', '4': 'a', '5': 's', '7': 't', '8': 'b',
  '@': 'a', '$': 's', '!': 'i', '|': 'i', '+': 't',
  // Special characters
  'ℹ': 'i', '①': 'a', '②': 'b', '③': 'c', '④': 'd', '⑤': 'e',
  '₀': 'o', '₁': 'i', '₂': 'z', '₃': 'e', '₄': 'a', '₅': 's',
  '⁰': 'o', '¹': 'i', '²': 'z', '³': 'e', '⁴': 'a', '⁵': 's',
  // Fullwidth
  'ａ': 'a', 'ｂ': 'b', 'ｃ': 'c', 'ｄ': 'd', 'ｅ': 'e', 'ｆ': 'f',
  'ｇ': 'g', 'ｈ': 'h', 'ｉ': 'i', 'ｊ': 'j', 'ｋ': 'k', 'ｌ': 'l',
  'ｍ': 'm', 'ｎ': 'n', 'ｏ': 'o', 'ｐ': 'p', 'ｑ': 'q', 'ｒ': 'r',
  'ｓ': 's', 'ｔ': 't', 'ｕ': 'u', 'ｖ': 'v', 'ｗ': 'w', 'ｘ': 'x',
  'ｙ': 'y', 'ｚ': 'z',
  // Mathematical/styled
  '𝐚': 'a', '𝐛': 'b', '𝐜': 'c', '𝐝': 'd', '𝐞': 'e', '𝐟': 'f',
  '𝒂': 'a', '𝒃': 'b', '𝒄': 'c', '𝒅': 'd', '𝒆': 'e', '𝒇': 'f',
  '𝓪': 'a', '𝓫': 'b', '𝓬': 'c', '𝓭': 'd', '𝓮': 'e', '𝓯': 'f',
  // Enclosed/circled
  'ⓐ': 'a', 'ⓑ': 'b', 'ⓒ': 'c', 'ⓓ': 'd', 'ⓔ': 'e', 'ⓕ': 'f',
  'Ⓐ': 'a', 'Ⓑ': 'b', 'Ⓒ': 'c', 'Ⓓ': 'd', 'Ⓔ': 'e', 'Ⓕ': 'f',
  // Accented (normalize)
  'á': 'a', 'à': 'a', 'â': 'a', 'ä': 'a', 'ã': 'a', 'å': 'a',
  'é': 'e', 'è': 'e', 'ê': 'e', 'ë': 'e',
  'í': 'i', 'ì': 'i', 'î': 'i', 'ï': 'i',
  'ó': 'o', 'ò': 'o', 'ô': 'o', 'ö': 'o', 'õ': 'o', 'ø': 'o',
  'ú': 'u', 'ù': 'u', 'û': 'u', 'ü': 'u',
  'ñ': 'n', 'ç': 'c', 'ß': 'ss',
};

/**
 * Normalize text by replacing homoglyphs and removing obfuscation
 */
function normalizeText(text: string): string {
  let normalized = text.toLowerCase();

  // Replace homoglyphs
  for (const [glyph, replacement] of Object.entries(HOMOGLYPH_MAP)) {
    normalized = normalized.split(glyph.toLowerCase()).join(replacement);
  }

  // Remove zero-width characters (invisible unicode)
  normalized = normalized.replace(/[\u200B-\u200D\u2060\uFEFF]/g, '');

  // Remove combining characters
  normalized = normalized.normalize('NFKD').replace(/[\u0300-\u036f]/g, '');

  // Collapse repeated characters (e.g., "fuuuuck" -> "fuck")
  normalized = normalized.replace(/(.)\1{2,}/g, '$1$1');

  // Remove common separator insertions (e.g., "f.u.c.k" -> "fuck")
  const withoutSeparators = normalized.replace(/([a-z])[\s._\-*#@!$%^&()+=\[\]{}|\\:;"'<>,?/~`]+([a-z])/gi, '$1$2');

  // Remove spaces within words for detection
  const withoutSpaces = normalized.replace(/\s+/g, '');

  return { normalized, withoutSeparators, withoutSpaces } as unknown as string;
}

interface NormalizedText {
  normalized: string;
  withoutSeparators: string;
  withoutSpaces: string;
}

function getNormalizedVersions(text: string): NormalizedText {
  let normalized = text.toLowerCase();

  // Replace homoglyphs
  for (const [glyph, replacement] of Object.entries(HOMOGLYPH_MAP)) {
    normalized = normalized.split(glyph.toLowerCase()).join(replacement);
  }

  // Remove zero-width characters
  normalized = normalized.replace(/[\u200B-\u200D\u2060\uFEFF]/g, '');

  // Remove combining characters
  normalized = normalized.normalize('NFKD').replace(/[\u0300-\u036f]/g, '');

  // Collapse repeated characters
  const collapsed = normalized.replace(/(.)\1{2,}/g, '$1$1');

  // Version without separators
  const withoutSeparators = collapsed.replace(/([a-z])[\s._\-*#@!$%^&()+=\[\]{}|\\:;"'<>,?/~`]+([a-z])/gi, '$1$2');

  // Version without any spaces
  const withoutSpaces = collapsed.replace(/\s+/g, '');

  return { normalized: collapsed, withoutSeparators, withoutSpaces };
}

// =====================================================
// WORD FILTERS (Expanded comprehensive lists)
// =====================================================

const PROFANITY_WORDS = new Set([
  // F-word and variations
  'fuck', 'fck', 'fuk', 'fuq', 'phuck', 'phuk', 'fux', 'fvck', 'fukk',
  'fucking', 'fucker', 'fucked', 'fucks', 'fuckhead', 'fuckface', 'fucktard',
  'motherfucker', 'motherfucking', 'mf', 'mofo',
  // S-word
  'shit', 'sht', 'shyt', 'shiit', 'shite', 'shitting', 'shitty', 'shithead',
  'bullshit', 'horseshit', 'dipshit', 'shithole', 'shitface',
  // A-word
  'ass', 'arse', 'asshole', 'arsehole', 'asswipe', 'asshat', 'jackass',
  'dumbass', 'fatass', 'badass', 'hardass', 'smartass', 'kickass',
  // B-word
  'bitch', 'btch', 'biatch', 'biotch', 'bitches', 'bitchy', 'bitching',
  'sonofabitch', 'sob',
  // C-word (severe)
  'cunt', 'cnt', 'cvnt', 'kunts',
  // D-word anatomy
  'dick', 'dck', 'd1ck', 'dickhead', 'dickface', 'dickwad',
  'cock', 'cck', 'c0ck', 'cockhead', 'cocksucker',
  // P-word
  'pussy', 'puss', 'pussies', 'pussi',
  // Other anatomy
  'penis', 'vagina', 'tits', 'titties', 'boobs', 'boobies', 'nipple',
  'ballsack', 'nutsack', 'testicle', 'scrotum', 'boner', 'erection',
  // Other profanity
  'bastard', 'whore', 'hoe', 'slut', 'skank', 'tramp',
  'damn', 'dammit', 'goddamn', 'goddammit',
  'crap', 'crappy', 'piss', 'pissed', 'pissing',
  'wanker', 'wank', 'tosser', 'twat', 'bellend', 'knob', 'knobhead',
  'dildo', 'vibrator', 'buttplug',
  'jizz', 'cum', 'cumshot', 'creampie', 'facial',
]);

const HATE_SPEECH_WORDS = new Set([
  // Racial slurs - N-word
  'nigger', 'nigga', 'nigg3r', 'n1gger', 'negro', 'negroid',
  // Other racial slurs
  'coon', 'darkie', 'sambo', 'jigaboo', 'spook',
  'spic', 'spick', 'wetback', 'beaner', 'greaser',
  'chink', 'gook', 'slant', 'slanteye', 'zipperhead',
  'kike', 'heeb', 'hymie', 'yid',
  'raghead', 'towelhead', 'sandnigger', 'cameljockey', 'hajji',
  'cracker', 'honky', 'whitey', 'gringo', 'redneck',
  'redskin', 'injun', 'squaw',
  // LGBTQ+ slurs
  'faggot', 'fag', 'f4g', 'fagg0t', 'faggy',
  'dyke', 'd1ke', 'lesbo',
  'tranny', 'shemale', 'ladyboy', 'heshe',
  'homo', 'queer', 'sodomite',
  // Disability slurs
  'retard', 'retarded', 'tard', 'ree', 'reee',
  'cripple', 'spaz', 'spastic', 'mong', 'mongoloid',
  // Hate group terms
  'nazi', 'hitleri', 'ss', 'gestapo',
  'kkk', 'klan', 'klux',
  '1488', '14words', '88', 'hh',
  'whitepower', 'whitepride', 'aryan',
  // Dehumanizing
  'subhuman', 'untermensch', 'vermin', 'parasite', 'cockroach',
]);

const VIOLENCE_WORDS = new Set([
  // Direct violence
  'kill', 'murder', 'assassinate', 'execute', 'slaughter',
  'stab', 'shoot', 'strangle', 'choke', 'suffocate',
  'behead', 'decapitate', 'dismember', 'mutilate', 'torture',
  // Suicide encouragement
  'kys', 'killyourself', 'neckyourself', 'godie', 'drinbleach',
  'hangyourself', 'jumpofffabridge', 'slityourwrists',
  // Weapons
  'gundown', 'shootup', 'massshooting', 'schoolshooting',
  'bomb', 'bombing', 'terrorist', 'terrorism',
  // Sexual violence
  'rape', 'rapist', 'molest', 'molester', 'pedophile', 'pedo',
  // Self-harm
  'cutmyself', 'selfharm', 'suicide', 'suicidal',
]);

const SPAM_KEYWORDS = new Set([
  // Crypto/financial
  'bitcoin', 'btc', 'ethereum', 'eth', 'crypto', 'cryptocurrency',
  'nft', 'forex', 'trading', 'invest', 'investment',
  'passiveincome', 'getrich', 'makemoney', 'earnmoney',
  'workfromhome', 'sidehustle', 'mlm', 'networkmarketing',
  'financialfreedom', 'beyourownboss',
  // Dating/adult
  'hotsingles', 'onlyfans', 'fansly', 'manyvids',
  'camgirl', 'webcam', 'hookup', 'dating',
  'sugardaddy', 'sugarmommy', 'sugarbaby', 'escort',
  // Bot patterns
  'dmmefor', 'checkmybio', 'linkinbio',
  'followforfollow', 'f4f', 'likeforlike', 'l4l',
]);

const SALES_KEYWORDS = new Set([
  'buynow', 'ordernow', 'shopnow', 'limitedtime', 'actnow',
  'specialoffer', 'discountcode', 'promocode', 'usecode', 'coupon',
  'freeshipping', 'clickhere', 'checkoutmy', 'visitmywebsite',
  'subscribeto', 'giveaway', 'freebie',
  'sponsored', 'ad', 'advertisement', 'promotion',
]);

// NUDITY & SEX - Comprehensive
const NUDITY_SEX_WORDS = new Set([
  // Explicit acts
  'sex', 'sexual', 'sexy', 'sexx', 'sexxx',
  'porn', 'porno', 'pornography', 'pornhub', 'xvideos', 'xhamster',
  'hentai', 'rule34', 'r34', 'nsfw',
  'masturbate', 'masturbation', 'jerkoff', 'jackoff', 'fap', 'fapping',
  'blowjob', 'bj', 'handjob', 'hj', 'footjob', 'titjob',
  'anal', 'analsex', 'buttsex', 'assfuck',
  'oral', 'oralsex', 'cunnilingus', 'fellatio',
  'gangbang', 'threesome', 'foursome', 'orgy',
  'bondage', 'bdsm', 'domination', 'submission', 'fetish',
  'incest', 'taboo', 'stepmom', 'stepdad', 'stepsister', 'stepbrother',
  'milf', 'gilf', 'dilf', 'cougar',
  'nude', 'nudes', 'nudity', 'naked', 'topless', 'bottomless',
  'booty', 'bootycall', 'twerk', 'twerking',
  'horny', 'aroused', 'turned on', 'hard-on', 'wet',
  'orgasm', 'climax', 'squirt', 'cumming',
  'strip', 'stripper', 'striptease', 'lapdance',
  'prostitute', 'prostitution', 'hooker', 'callgirl',
  'pimp', 'brothel', 'redlight',
  'swingers', 'swinging', 'hotwife', 'cuckold',
  'onlyfans', 'fansly', 'manyvids', 'chaturbate', 'livejasmin',
]);

// GAMBLING - Comprehensive
const GAMBLING_WORDS = new Set([
  // General gambling
  'gamble', 'gambling', 'gambler', 'bet', 'betting', 'bets',
  'wager', 'wagering', 'odds', 'spread', 'moneyline', 'parlay',
  'casino', 'casinos', 'slots', 'slot', 'jackpot',
  'poker', 'blackjack', 'roulette', 'baccarat', 'craps',
  'sportsbook', 'bookie', 'bookmaker',
  // Specific platforms
  'bet365', 'draftkings', 'fanduel', 'betmgm', 'caesars',
  'pointsbet', 'barstoolsports', 'bovada', 'mybookie',
  'betonline', 'sportsbetting', 'bettingapp',
  // Betting terms
  'freebet', 'freebets', 'bettingtips', 'surebets', 'guaranteedwin',
  'handicapper', 'handicapping', 'tipster', 'picks', 'lock',
  'underdog', 'favorite', 'over', 'under', 'totals',
  'prop', 'propbet', 'futures', 'livebetting', 'inplay',
]);

// DRUGS & ALCOHOL - Comprehensive
const DRUGS_ALCOHOL_WORDS = new Set([
  // Illegal drugs
  'drugs', 'drug', 'narcotics', 'dealer', 'drugdealer',
  'weed', 'marijuana', 'cannabis', 'pot', 'ganja', 'dope', 'reefer',
  'joint', 'blunt', 'bong', 'edibles', 'thc', 'cbd',
  'cocaine', 'coke', 'crack', 'snow', 'blow',
  'heroin', 'smack', 'horse', 'junk', 'h',
  'meth', 'methamphetamine', 'crystal', 'ice', 'speed', 'crank',
  'lsd', 'acid', 'shrooms', 'mushrooms', 'psilocybin', 'psychedelics',
  'ecstasy', 'mdma', 'molly', 'xtc', 'e',
  'ketamine', 'specialk', 'k',
  'fentanyl', 'oxy', 'oxycontin', 'percocet', 'vicodin', 'xanax',
  'codeine', 'lean', 'purpledrank', 'sizzurp',
  'pcp', 'angeldust',
  'ghb', 'roofies', 'rohypnol',
  'dmt', 'ayahuasca', 'peyote', 'mescaline',
  'adderall', 'ritalin', 'vyvanse',
  'highaf', 'stoned', 'baked', 'blazed', 'faded', 'zooted', 'lit',
  // Alcohol
  'alcohol', 'alcoholic', 'drunk', 'wasted', 'hammered', 'plastered',
  'beer', 'wine', 'vodka', 'whiskey', 'rum', 'tequila', 'gin',
  'liquor', 'booze', 'spirits', 'shots', 'cocktail',
  'bar', 'pub', 'brewery', 'distillery',
  'hangover', 'blackout', 'blacked out', 'drinkingame',
  'chug', 'chugging', 'kegstand', 'beerpong',
  'aa', 'alcoholicsanonymous',
]);

// =====================================================
// ALLOWED SPORTS LINKS (Whitelist)
// =====================================================

const ALLOWED_LINK_DOMAINS = new Set([
  // Major sports networks
  'espn.com', 'espn.go.com',
  'bleacherreport.com', 'br.com',
  'si.com', 'sportsillustrated.com',
  'cbssports.com', 'cbs.com/sports',
  'nbcsports.com', 'nbc.com/sports',
  'foxsports.com', 'fs1.com',
  'theathletic.com',
  'yahoo.com/sports', 'sports.yahoo.com',

  // League official sites
  'nfl.com', 'nflpa.com',
  'mlb.com', 'milb.com',
  'nba.com', 'wnba.com', 'gleague.nba.com',
  'nhl.com', 'ahl.org',
  'mls.com', 'mlssoccer.com',

  // Chicago teams
  'chicagobears.com',
  'mlb.com/cubs', 'cubs.com',
  'mlb.com/whitesox', 'whitesox.com',
  'nba.com/bulls', 'bulls.com',
  'nhl.com/blackhawks', 'blackhawks.nhl.com',
  'chicagofirefc.com',
  'chicagosky.com', 'sky.wnba.com',

  // College
  'espn.com/college', 'ncaa.com',
  'bigten.org', 'big10.org',

  // Sports reference
  'pro-football-reference.com',
  'baseball-reference.com',
  'basketball-reference.com',
  'hockey-reference.com',

  // News
  'chicagotribune.com/sports',
  'suntimes.com/sports',
  'dailyherald.com/sports',
]);

// =====================================================
// PHRASE PATTERNS (Multi-word detection)
// =====================================================

const THREAT_PHRASES = [
  /i('m| am| will)?\s*(gonna|going to|will)\s*(kill|hurt|beat|shoot|stab|find)/i,
  /you('re| are)?\s*(dead|gonna die|going to die)/i,
  /know where you (live|work)/i,
  /watch your back/i,
  /sleep with one eye open/i,
  /i('ll| will)?\s*find (you|your)/i,
  /come to your (house|home|place)/i,
];

const DOXXING_PATTERNS = [
  /\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/, // Phone
  /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i, // Email
  /\b\d{1,5}\s+\w+\s+(st|street|ave|avenue|blvd|boulevard|rd|road|dr|drive|ln|lane|way|ct|court|pl|place)\b/i, // Address
  /\b\d{5}(-\d{4})?\b/, // ZIP
  /\b\d{3}-\d{2}-\d{4}\b/, // SSN
];

const SPAM_PATTERNS = [
  /(.)\1{5,}/, // Character repetition (aaaaa)
  /(\b\w+\b)(\s+\1){3,}/, // Word repetition
  /^[A-Z\s!?]{30,}$/, // All caps long message
  /dm\s*(me|us)\s*(for|to)/i, // DM solicitation
  /check\s*(out|my)\s*bio/i, // Bio spam
  /link\s*in\s*(my\s*)?bio/i, // Link in bio
  /follow\s*(me\s*)?(for|and|4)\s*(follow|more)/i, // Follow spam
];

// =====================================================
// LINK DETECTION AND VALIDATION
// =====================================================

const URL_REGEX = /https?:\/\/[^\s<>"{}|\\^`\[\]]+|www\.[^\s<>"{}|\\^`\[\]]+|\b[a-z0-9][-a-z0-9]*\.(com|net|org|io|co|tv|gg|me|info|biz|xyz|site|online|app|dev|tech|live|stream|club|space|fun|shop|store|us|uk|ca|au|de|fr|ru|cn|jp|br|in|it|es|nl|se|no|fi|dk|pl|cz|at|ch|be|ie|pt|gr|hu|ro|bg|sk|si|hr|lt|lv|ee)\b[^\s]*/gi;

function extractLinks(text: string): string[] {
  const matches = text.match(URL_REGEX) || [];
  return matches;
}

function isAllowedLink(url: string): boolean {
  try {
    // Normalize URL
    let normalizedUrl = url.toLowerCase();
    if (!normalizedUrl.startsWith('http')) {
      normalizedUrl = 'https://' + normalizedUrl;
    }

    const urlObj = new URL(normalizedUrl);
    const domain = urlObj.hostname.replace(/^www\./, '');

    // Check against whitelist
    for (const allowed of ALLOWED_LINK_DOMAINS) {
      if (domain === allowed || domain.endsWith('.' + allowed)) {
        return true;
      }
    }

    return false;
  } catch {
    return false;
  }
}

// =====================================================
// RATE LIMITING
// =====================================================

const RATE_LIMITS = {
  messagesPerMinute: 10,
  messagesPerHour: 100,
  duplicateMessageCooldown: 30000, // 30 seconds
  similarityThreshold: 0.8,
  newUserCooldown: 5000, // 5 seconds between messages for new users
};

function calculateSimilarity(str1: string, str2: string): number {
  const s1 = str1.toLowerCase();
  const s2 = str2.toLowerCase();

  if (s1 === s2) return 1;
  if (s1.length < 2 || s2.length < 2) return 0;

  const bigrams = new Map<string, number>();
  for (let i = 0; i < s1.length - 1; i++) {
    const bigram = s1.substring(i, i + 2);
    bigrams.set(bigram, (bigrams.get(bigram) || 0) + 1);
  }

  let intersectionSize = 0;
  for (let i = 0; i < s2.length - 1; i++) {
    const bigram = s2.substring(i, i + 2);
    const count = bigrams.get(bigram) || 0;
    if (count > 0) {
      bigrams.set(bigram, count - 1);
      intersectionSize++;
    }
  }

  return (2.0 * intersectionSize) / (s1.length + s2.length - 2);
}

function checkRateLimits(
  content: string,
  context: RateLimitContext
): ModerationFlag[] {
  const flags: ModerationFlag[] = [];
  const now = Date.now();

  // Messages per minute
  if (context.messageCountLastMinute >= RATE_LIMITS.messagesPerMinute) {
    flags.push({
      category: 'spam',
      rule: 'rate_limit_minute',
      severity: 'medium',
      matchedText: `${context.messageCountLastMinute} messages in last minute`,
    });
  }

  // Messages per hour
  if (context.messageCountLastHour >= RATE_LIMITS.messagesPerHour) {
    flags.push({
      category: 'spam',
      rule: 'rate_limit_hour',
      severity: 'high',
      matchedText: `${context.messageCountLastHour} messages in last hour`,
    });
  }

  // New user cooldown
  if (context.isNewUser && (now - context.lastMessageTime) < RATE_LIMITS.newUserCooldown) {
    flags.push({
      category: 'spam',
      rule: 'new_user_cooldown',
      severity: 'low',
      matchedText: 'New user sending too fast',
    });
  }

  // Check for duplicate/similar recent messages
  for (const historyMsg of context.messageHistory) {
    const timeDiff = now - historyMsg.timestamp;

    // Exact duplicate
    if (content.toLowerCase() === historyMsg.content.toLowerCase()) {
      if (timeDiff < RATE_LIMITS.duplicateMessageCooldown) {
        flags.push({
          category: 'spam',
          rule: 'duplicate_message',
          severity: 'medium',
          matchedText: 'Duplicate message',
        });
        break;
      }
    }

    // Similar message
    const similarity = calculateSimilarity(content, historyMsg.content);
    if (similarity >= RATE_LIMITS.similarityThreshold && timeDiff < 60000) {
      flags.push({
        category: 'spam',
        rule: 'similar_message',
        severity: 'low',
        matchedText: `${Math.round(similarity * 100)}% similar to recent message`,
      });
      break;
    }
  }

  return flags;
}

// =====================================================
// SPORTS CONTEXT DETECTION
// =====================================================

const SPORTS_CONTEXT_PATTERNS = [
  // Teams
  /bears|cubs|bulls|white\s*sox|blackhawks|fire|sky/i,
  /packers|vikings|lions|brewers|cardinals|reds|twins|royals/i,
  /lakers|celtics|warriors|heat|nets|clippers|knicks|76ers/i,
  /yankees|dodgers|red\s*sox|mets|giants|astros|braves/i,

  // Players (will match names)
  /caleb\s*williams|dj\s*moore|keenan\s*allen|montez\s*sweat/i,
  /fields|jones|smith|johnson|williams|brown|davis|wilson/i,

  // Sports terms
  /touchdown|homerun|three\s*pointer|goal|assist|rebound/i,
  /quarterback|pitcher|point\s*guard|goalie|receiver/i,
  /draft|trade|free\s*agent|contract|roster|lineup/i,
  /playoffs|championship|super\s*bowl|world\s*series|finals/i,
  /offense|defense|special\s*teams|pitching|batting/i,
  /score|stats|record|standings|schedule|game/i,
];

function hasSportsContext(text: string): boolean {
  for (const pattern of SPORTS_CONTEXT_PATTERNS) {
    if (pattern.test(text)) {
      return true;
    }
  }
  return false;
}

// Sports-acceptable terms that might otherwise flag
const SPORTS_ALLOWED_PHRASES = new Set([
  'killed it', 'killing it', 'kill the clock', 'kill the game',
  'murdered them', 'murdered that defense', 'murder that team',
  'destroyed them', 'destroyed the competition',
  'crushed it', 'crushed them', 'crushing it',
  'slaughtered them', 'slaughter rule',
  'choke', 'choked', 'choking', 'choker',
  'bust', 'draft bust', 'busted play',
  'bum', 'scrub', 'washed', 'cooked', 'fraud',
  'exposed', 'got exposed',
  'hate the', 'hate that team', 'hate this team',
  'suck', 'sucks', 'sucked',
  'trash', 'garbage', 'pathetic', 'embarrassing',
  'joke', 'clown', 'clowns',
]);

function isSportsAllowedPhrase(text: string): boolean {
  const lowerText = text.toLowerCase();
  for (const phrase of SPORTS_ALLOWED_PHRASES) {
    if (lowerText.includes(phrase)) {
      return true;
    }
  }
  return false;
}

// =====================================================
// MAIN MODERATION FUNCTION
// =====================================================

export function moderateMessage(
  content: string,
  rateLimitContext?: RateLimitContext
): ModerationResult {
  const flags: ModerationFlag[] = [];
  let highestSeverity: 'low' | 'medium' | 'high' | 'critical' = 'low';

  // Get normalized versions for detection
  const { normalized, withoutSeparators, withoutSpaces } = getNormalizedVersions(content);
  const originalLower = content.toLowerCase();

  // Check for sports context
  const sportsContext = hasSportsContext(content);
  const sportsAllowed = isSportsAllowedPhrase(content);

  // Helper to add flag and update severity
  const addFlag = (flag: ModerationFlag) => {
    flags.push(flag);
    const severityOrder = { low: 1, medium: 2, high: 3, critical: 4 };
    if (severityOrder[flag.severity] > severityOrder[highestSeverity]) {
      highestSeverity = flag.severity;
    }
  };

  // Helper to check word in all normalized versions
  const checkWord = (word: string): boolean => {
    const lowerWord = word.toLowerCase();
    return (
      originalLower.includes(lowerWord) ||
      normalized.includes(lowerWord) ||
      withoutSeparators.includes(lowerWord) ||
      withoutSpaces.includes(lowerWord)
    );
  };

  // 0. ENHANCED BYPASS DETECTION
  const enhancedResult = enhancedModeration(content);
  if (enhancedResult.blocked) {
    addFlag({
      category: 'evasion',
      rule: enhancedResult.evasionType || 'bypass_attempt',
      severity: 'high',
      matchedText: enhancedResult.reason || 'Bypass attempt detected',
    });
  }
  if (enhancedResult.evasionAttempt) {
    addFlag({
      category: 'evasion',
      rule: 'evasion_detected',
      severity: 'medium',
      matchedText: `Suspicious pattern: ${enhancedResult.evasionType}`,
    });
  }

  // 0.5. CHECK SCAM & HARASSMENT PATTERNS
  for (const pattern of SCAM_PATTERNS) {
    if (pattern.test(content)) {
      addFlag({
        category: 'spam',
        rule: 'scam_pattern',
        severity: 'critical',
        matchedText: content.match(pattern)?.[0] || 'scam detected',
      });
    }
  }

  for (const pattern of HARASSMENT_PATTERNS) {
    if (pattern.test(content)) {
      addFlag({
        category: 'harassment',
        rule: 'harassment_pattern',
        severity: 'critical',
        matchedText: content.match(pattern)?.[0] || 'harassment detected',
      });
    }
  }

  // 1. CHECK RATE LIMITS (if context provided)
  if (rateLimitContext) {
    const rateLimitFlags = checkRateLimits(content, rateLimitContext);
    rateLimitFlags.forEach(addFlag);
  }

  // 2. CHECK HATE SPEECH (highest priority - always blocked)
  for (const word of HATE_SPEECH_WORDS) {
    if (checkWord(word)) {
      addFlag({
        category: 'hate_speech',
        rule: 'hate_word',
        severity: 'critical',
        matchedText: word,
      });
    }
  }

  // 3. CHECK VIOLENCE & THREATS
  for (const word of VIOLENCE_WORDS) {
    if (checkWord(word)) {
      // Skip if it's a sports-context phrase
      if (!sportsContext || !sportsAllowed) {
        addFlag({
          category: 'violence',
          rule: 'violence_word',
          severity: 'critical',
          matchedText: word,
        });
      }
    }
  }

  // Check threat phrases
  for (const pattern of THREAT_PHRASES) {
    if (pattern.test(content)) {
      addFlag({
        category: 'violence',
        rule: 'threat_phrase',
        severity: 'critical',
        matchedText: content.match(pattern)?.[0] || 'threat detected',
      });
    }
  }

  // 4. CHECK DOXXING PATTERNS
  for (const pattern of DOXXING_PATTERNS) {
    if (pattern.test(content)) {
      addFlag({
        category: 'harassment',
        rule: 'doxxing_pattern',
        severity: 'critical',
        matchedText: content.match(pattern)?.[0] || 'personal info detected',
      });
    }
  }

  // 5. CHECK NUDITY/SEX
  for (const word of NUDITY_SEX_WORDS) {
    if (checkWord(word)) {
      addFlag({
        category: 'nudity_sex',
        rule: 'explicit_content',
        severity: 'high',
        matchedText: word,
      });
    }
  }

  // 6. CHECK GAMBLING
  for (const word of GAMBLING_WORDS) {
    if (checkWord(word)) {
      addFlag({
        category: 'gambling',
        rule: 'gambling_content',
        severity: 'high',
        matchedText: word,
      });
    }
  }

  // 7. CHECK DRUGS/ALCOHOL
  for (const word of DRUGS_ALCOHOL_WORDS) {
    if (checkWord(word)) {
      addFlag({
        category: 'drugs_alcohol',
        rule: 'substance_content',
        severity: 'high',
        matchedText: word,
      });
    }
  }

  // 8. CHECK PROFANITY
  for (const word of PROFANITY_WORDS) {
    if (checkWord(word)) {
      addFlag({
        category: 'profanity',
        rule: 'profanity_word',
        severity: 'high',
        matchedText: word,
      });
    }
  }

  // 9. CHECK SPAM PATTERNS
  for (const word of SPAM_KEYWORDS) {
    if (checkWord(word)) {
      addFlag({
        category: 'spam',
        rule: 'spam_keyword',
        severity: 'medium',
        matchedText: word,
      });
    }
  }

  for (const pattern of SPAM_PATTERNS) {
    if (pattern.test(content)) {
      addFlag({
        category: 'spam',
        rule: 'spam_pattern',
        severity: 'medium',
        matchedText: content.match(pattern)?.[0] || 'spam pattern detected',
      });
    }
  }

  // 10. CHECK SALES/MARKETING
  for (const word of SALES_KEYWORDS) {
    if (checkWord(word)) {
      addFlag({
        category: 'sales',
        rule: 'sales_keyword',
        severity: 'medium',
        matchedText: word,
      });
    }
  }

  // 11. CHECK LINKS
  const links = extractLinks(content);
  for (const link of links) {
    if (!isAllowedLink(link)) {
      addFlag({
        category: 'links',
        rule: 'unauthorized_link',
        severity: 'high',
        matchedText: link,
      });
    }
  }

  // 12. CHECK FOR EVASION ATTEMPTS
  // Detect if message has unusual unicode or seems obfuscated
  const unicodeRatio = (content.match(/[^\x00-\x7F]/g) || []).length / content.length;
  if (unicodeRatio > 0.3 && content.length > 10) {
    addFlag({
      category: 'evasion',
      rule: 'high_unicode_ratio',
      severity: 'medium',
      matchedText: `${Math.round(unicodeRatio * 100)}% non-ASCII characters`,
    });
  }

  // Check for excessive punctuation/symbols (obfuscation attempt)
  const symbolRatio = (content.match(/[^\w\s]/g) || []).length / content.length;
  if (symbolRatio > 0.4 && content.length > 10) {
    addFlag({
      category: 'evasion',
      rule: 'high_symbol_ratio',
      severity: 'low',
      matchedText: `${Math.round(symbolRatio * 100)}% symbols`,
    });
  }

  // 13. CALCULATE TOXICITY SCORE
  const score = calculateToxicityScore(flags, highestSeverity);

  // 14. DETERMINE ACTION
  let action: ModerationResult['action'];
  let approved: boolean;
  let blockedReason: string | undefined;

  if (flags.length === 0) {
    action = 'allow';
    approved = true;
  } else {
    switch (highestSeverity) {
      case 'critical':
        action = 'ban';
        approved = false;
        blockedReason = `Message blocked: ${flags[0].category.replace('_', ' ')}`;
        break;
      case 'high':
        action = 'block';
        approved = false;
        blockedReason = `Message blocked: ${flags[0].category.replace('_', ' ')}`;
        break;
      case 'medium':
        action = 'shadow_block';
        approved = false;
        blockedReason = `Message not delivered: ${flags[0].category.replace('_', ' ')}`;
        break;
      case 'low':
        // Allow with warning if only low severity flags
        if (flags.every(f => f.severity === 'low')) {
          action = 'warn';
          approved = true;
        } else {
          action = 'block';
          approved = false;
          blockedReason = `Message blocked: ${flags[0].category.replace('_', ' ')}`;
        }
        break;
      default:
        action = 'allow';
        approved = true;
    }
  }

  return {
    approved,
    action,
    flags,
    score,
    blockedReason,
  };
}

function calculateToxicityScore(
  flags: ModerationFlag[],
  highestSeverity: string
): number {
  if (flags.length === 0) return 0;

  const severityWeights = {
    low: 0.1,
    medium: 0.3,
    high: 0.6,
    critical: 1.0,
  };

  // Base score from highest severity
  let score = severityWeights[highestSeverity as keyof typeof severityWeights] || 0;

  // Add weight for multiple flags
  score += Math.min(flags.length * 0.05, 0.2);

  // Category weights
  const categoryWeights: Record<string, number> = {
    hate_speech: 0.15,
    violence: 0.15,
    nudity_sex: 0.1,
    harassment: 0.1,
    profanity: 0.05,
    spam: 0.03,
    sales: 0.03,
    links: 0.02,
    gambling: 0.08,
    drugs_alcohol: 0.08,
    evasion: 0.05,
  };

  for (const flag of flags) {
    score += categoryWeights[flag.category] || 0;
  }

  return Math.min(score, 1.0);
}

// =====================================================
// EXPORT UTILITIES
// =====================================================

export { extractLinks, isAllowedLink, calculateSimilarity, hasSportsContext };
