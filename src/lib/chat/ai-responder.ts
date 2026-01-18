/**
 * AI AUTO-RESPONDER FOR TEAM CHAT
 * Chicago sports expert with humorous fan tone
 * Responds when no staff is online, always supports Chicago teams
 */

import Anthropic from '@anthropic-ai/sdk';

// =====================================================
// TYPES
// =====================================================

export interface AIResponderConfig {
  team: ChicagoTeam;
  recentMessages: ChatMessage[];
  userQuestion: string;
  userName: string;
  staffOnline: boolean;
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
}

export interface ChatMessage {
  id: string;
  content: string;
  userName: string;
  isStaff: boolean;
  isAI: boolean;
  timestamp: Date;
}

export interface AIResponse {
  content: string;
  shouldRespond: boolean;
  confidence: number;
  sources?: string[];
}

export type ChicagoTeam = 'bears' | 'cubs' | 'bulls' | 'white-sox' | 'blackhawks';

// =====================================================
// TEAM KNOWLEDGE BASE
// =====================================================

const TEAM_INFO: Record<ChicagoTeam, TeamKnowledge> = {
  bears: {
    name: 'Chicago Bears',
    nickname: 'Da Bears',
    league: 'NFL',
    division: 'NFC North',
    stadium: 'Soldier Field',
    founded: 1920,
    championships: ['1921', '1932', '1933', '1940', '1941', '1943', '1946', '1963', '1985'],
    rivals: ['Green Bay Packers', 'Minnesota Vikings', 'Detroit Lions'],
    legends: [
      'Walter Payton (Sweetness)',
      'Mike Ditka',
      'Dick Butkus',
      'Gale Sayers',
      'Brian Urlacher',
      'Mike Singletary',
      'Red Grange',
      'Sid Luckman',
      'Devin Hester',
    ],
    recentHighlights: [
      '2024 #1 overall pick Caleb Williams - franchise QB hope',
      'Rome Odunze adds elite receiving depth',
      'DJ Moore coming off 1,300+ yard season',
      'Montez Sweat anchoring the defense',
    ],
    fanPhrases: [
      'Bear Down!',
      'Da Bears!',
      'FTP (Fire The Packers sentiment)',
      'Monsters of the Midway',
      '85 Bears forever',
    ],
    currentQB: 'Caleb Williams',
    headCoach: 'Matt Eberflus',
    colors: ['Navy Blue', 'Orange', 'White'],
  },
  cubs: {
    name: 'Chicago Cubs',
    nickname: 'Cubbies',
    league: 'MLB',
    division: 'NL Central',
    stadium: 'Wrigley Field',
    founded: 1876,
    championships: ['1907', '1908', '2016'],
    rivals: ['St. Louis Cardinals', 'Chicago White Sox', 'Milwaukee Brewers'],
    legends: [
      'Ernie Banks (Mr. Cub)',
      'Ryne Sandberg',
      'Ron Santo',
      'Fergie Jenkins',
      'Billy Williams',
      'Sammy Sosa',
      'Kerry Wood',
      'Anthony Rizzo',
      'Kris Bryant',
    ],
    recentHighlights: [
      '2016 World Series Champions - ended 108-year drought',
      'Wrigley Field - The Friendly Confines',
      'Building young core for future',
    ],
    fanPhrases: [
      'Go Cubs Go!',
      'The Friendly Confines',
      'Lets play two!',
      'Cubs Win! Cubs Win!',
      'Fly the W!',
    ],
    currentQB: 'N/A',
    headCoach: 'Craig Counsell',
    colors: ['Cubbie Blue', 'Red', 'White'],
  },
  bulls: {
    name: 'Chicago Bulls',
    nickname: 'The Bulls',
    league: 'NBA',
    division: 'Central Division',
    stadium: 'United Center',
    founded: 1966,
    championships: ['1991', '1992', '1993', '1996', '1997', '1998'],
    rivals: ['Detroit Pistons', 'New York Knicks', 'Miami Heat', 'Cleveland Cavaliers'],
    legends: [
      'Michael Jordan (GOAT)',
      'Scottie Pippen',
      'Dennis Rodman',
      'Derrick Rose',
      'Joakim Noah',
      'Artis Gilmore',
      'Bob Love',
      'Jerry Sloan',
    ],
    recentHighlights: [
      '6-time NBA Champions in the 90s',
      'DeMar DeRozan leadership',
      'Zach LaVine athletic ability',
      'Coby White development',
    ],
    fanPhrases: [
      'See Red!',
      'Run with us!',
      'Bulls Nation',
      '6 rings!',
      'Jordan > LeBron',
    ],
    currentQB: 'N/A',
    headCoach: 'Billy Donovan',
    colors: ['Red', 'Black', 'White'],
  },
  'white-sox': {
    name: 'Chicago White Sox',
    nickname: 'The South Siders',
    league: 'MLB',
    division: 'AL Central',
    stadium: 'Guaranteed Rate Field',
    founded: 1901,
    championships: ['1906', '1917', '2005'],
    rivals: ['Chicago Cubs', 'Minnesota Twins', 'Detroit Tigers', 'Cleveland Guardians'],
    legends: [
      'Frank Thomas (Big Hurt)',
      'Minnie Minoso',
      'Luis Aparicio',
      'Nellie Fox',
      'Paul Konerko',
      'Mark Buehrle',
      'Carlton Fisk',
      'Harold Baines',
    ],
    recentHighlights: [
      '2005 World Series Champions',
      'South Side Pride',
      'Rebuilding with young talent',
    ],
    fanPhrases: [
      'Go Go White Sox!',
      'South Side Pride',
      'Good Guys Wear Black',
      'Sox Win!',
    ],
    currentQB: 'N/A',
    headCoach: 'Grady Sizemore',
    colors: ['Black', 'Silver', 'White'],
  },
  blackhawks: {
    name: 'Chicago Blackhawks',
    nickname: 'Hawks',
    league: 'NHL',
    division: 'Central Division',
    stadium: 'United Center',
    founded: 1926,
    championships: ['1934', '1938', '1961', '2010', '2013', '2015'],
    rivals: ['Detroit Red Wings', 'St. Louis Blues', 'Nashville Predators'],
    legends: [
      'Bobby Hull',
      'Stan Mikita',
      'Tony Esposito',
      'Denis Savard',
      'Jonathan Toews',
      'Patrick Kane',
      'Duncan Keith',
      'Marian Hossa',
    ],
    recentHighlights: [
      '3 Stanley Cups in 6 years (2010, 2013, 2015)',
      'Connor Bedard - generational talent',
      'Rebuilding dynasty',
    ],
    fanPhrases: [
      'One Goal!',
      'Chelsea Dagger!',
      'Hawks Win!',
      'Lord Stanley!',
    ],
    currentQB: 'N/A',
    headCoach: 'Luke Richardson',
    colors: ['Red', 'Black', 'White'],
  },
};

interface TeamKnowledge {
  name: string;
  nickname: string;
  league: string;
  division: string;
  stadium: string;
  founded: number;
  championships: string[];
  rivals: string[];
  legends: string[];
  recentHighlights: string[];
  fanPhrases: string[];
  currentQB: string;
  headCoach: string;
  colors: string[];
}

// =====================================================
// CHICAGO FAN PERSONALITY PHRASES
// =====================================================

const CHICAGO_GREETINGS: Record<string, string[]> = {
  morning: [
    "Hey hey! Good morning from the Windy City!",
    "Rise and shine, Chicago style!",
    "Morning! Ready to talk some sports?",
    "What's good? Coffee's hot, takes are hotter!",
  ],
  afternoon: [
    "What's up! Perfect time to talk Chicago sports!",
    "Hey there! How's the afternoon treating ya?",
    "Afternoon! Let's get into it!",
    "What's good, fam? Talk to me!",
  ],
  evening: [
    "Evening! Prime time for sports talk!",
    "Hey! Perfect time to hang with the best fans in sports!",
    "What's happening? Let's break it down!",
    "Evening vibes! What's on your mind?",
  ],
  night: [
    "Late night crew! The real ones are still up!",
    "Night owl? Respect! Let's talk sports!",
    "Burning the midnight oil talking Chicago sports? I'm here for it!",
    "Can't sleep without your sports fix? I got you!",
  ],
};

const ENTHUSIASM_PHRASES = [
  "Man, I love this team!",
  "This is what it's all about!",
  "Chicago sports baby!",
  "You love to see it!",
  "That's what I'm talking about!",
  "Inject it into my veins!",
  "This city runs on sports!",
];

const DISAPPOINTMENT_PHRASES = [
  "Look, it's painful, but we're still here.",
  "Rough times, but real fans stick around.",
  "Hey, even the '85 Bears had bad years before they dominated.",
  "It's part of being a Chicago fan. We suffer, then we celebrate.",
  "The highs wouldn't feel as good without the lows, right?",
];

const RIVAL_TRASH_TALK: Record<string, string[]> = {
  packers: [
    "FTP! Always and forever!",
    "Can't spell 'Packers' without 'overrated'... wait, you can, but my point stands!",
    "Green Bay? More like Green Boring.",
    "Cheese heads? More like losing... heads? Look, I'm working on this one.",
  ],
  cardinals: [
    "Cardinals fans are like their pizza - pretending to be good!",
    "St. Louis BBQ is mid at best. Fight me.",
    "The only thing red about Cardinals fans is their embarrassment!",
  ],
  pistons: [
    "Bad Boys era was 30+ years ago, let it go!",
    "Detroit Rock City? More like Detroit Floppy!",
  ],
  'red-wings': [
    "Original Six rivalry! But we got more recent Cups!",
    "Detroit might have cars, but we have championships this decade!",
  ],
};

// =====================================================
// AI RESPONSE LOGIC
// =====================================================

/**
 * Determine if AI should respond
 */
function shouldAIRespond(config: AIResponderConfig): boolean {
  // Don't respond if staff is online and actively chatting
  if (config.staffOnline) {
    const recentStaffMessage = config.recentMessages
      .filter(m => m.isStaff)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0];

    // If staff responded in last 2 minutes, let them handle it
    if (recentStaffMessage) {
      const timeSinceStaff = Date.now() - recentStaffMessage.timestamp.getTime();
      if (timeSinceStaff < 2 * 60 * 1000) {
        return false;
      }
    }
  }

  // Check if the message is a question or engagement-worthy
  const isQuestion = /\?$|who|what|when|where|why|how|should|will|can|did|does|is|are/i.test(
    config.userQuestion
  );

  // Check if it mentions the team or sports topics
  const mentionsTeam = new RegExp(
    TEAM_INFO[config.team].name.replace(/\s+/g, '\\s*') + '|' +
    TEAM_INFO[config.team].nickname,
    'i'
  ).test(config.userQuestion);

  const sportKeywords = /game|player|trade|draft|season|championship|playoff|score|stats|roster|coach|win|lose|beat/i;
  const mentionsSports = sportKeywords.test(config.userQuestion);

  // Respond to greetings
  const isGreeting = /^(hey|hi|hello|yo|what'?s up|sup|good morning|good afternoon|good evening)/i.test(
    config.userQuestion
  );

  return isQuestion || mentionsTeam || mentionsSports || isGreeting || !config.staffOnline;
}

/**
 * Build context for the AI
 */
function buildSystemPrompt(team: ChicagoTeam): string {
  const info = TEAM_INFO[team];

  return `You are the official AI assistant for the ${info.name} fan chat on Sports Mockery. You are a die-hard, lifelong Chicago sports fan with deep knowledge of all Chicago teams, but especially the ${info.name}.

## Your Personality:
- Passionate, enthusiastic, and genuinely fun to talk to
- Use a conversational, casual tone like you're talking to friends at a bar
- Sprinkle in Chicago slang and references naturally (not forced)
- Self-deprecating humor about Chicago sports suffering is welcome
- Always supportive of Chicago teams, even when they're struggling
- Playful trash talk about rivals is encouraged (especially the ${info.rivals.join(', ')})
- Use sports phrases like "${info.fanPhrases.slice(0, 3).join('", "')}"

## Your Knowledge:
- ${info.name} (${info.league}) - ${info.division}
- Stadium: ${info.stadium}
- Founded: ${info.founded}
- Championships: ${info.championships.join(', ')}
- Legends: ${info.legends.join(', ')}
- Current coach: ${info.headCoach}
- Recent highlights: ${info.recentHighlights.join('; ')}

## Rules:
1. ALWAYS support Chicago teams. Never criticize them harshly - be constructive
2. Trash talk rivals playfully, never hatefully
3. If you don't know something, say so and don't make up stats
4. Keep responses concise - 1-3 sentences usually, unless explaining something complex
5. Use emojis sparingly but appropriately (🐻🏈⚾🏀🏒)
6. Never discuss politics, religion, or controversial non-sports topics
7. Be inclusive and welcoming to all fans
8. If someone is being negative, redirect to something positive
9. Reference real stats, players, and games when possible
10. Have FUN! This is what sports fandom is about!

## Chicago Sports Pride:
- Bears: ${TEAM_INFO.bears.championships.length} championships, Monsters of the Midway
- Cubs: 2016 ended the 108-year drought! Wrigley is sacred.
- Bulls: 6 rings with MJ! Greatest dynasty ever.
- White Sox: 2005 World Series Champions, South Side pride
- Blackhawks: 3 Cups in 6 years (2010, 2013, 2015)

Remember: You're here to make fans feel welcome, entertained, and informed. Be the friend everyone wants to talk sports with!`;
}

/**
 * Generate AI response using Claude
 */
export async function generateAIResponse(config: AIResponderConfig): Promise<AIResponse> {
  // Check if AI should respond
  if (!shouldAIRespond(config)) {
    return {
      content: '',
      shouldRespond: false,
      confidence: 0,
    };
  }

  const info = TEAM_INFO[config.team];

  // Build conversation context
  const recentContext = config.recentMessages
    .slice(-10)
    .map(m => `${m.isStaff ? '[STAFF]' : m.isAI ? '[AI]' : '[FAN]'} ${m.userName}: ${m.content}`)
    .join('\n');

  const systemPrompt = buildSystemPrompt(config.team);

  // Get a random greeting based on time of day
  const greeting = CHICAGO_GREETINGS[config.timeOfDay][
    Math.floor(Math.random() * CHICAGO_GREETINGS[config.timeOfDay].length)
  ];

  const userPrompt = `Recent chat context:
${recentContext}

${config.userName} just said: "${config.userQuestion}"

Respond naturally as the ${info.name} fan chat AI assistant. Be conversational, fun, and helpful. If it's a greeting, greet them back warmly. If it's a question, answer it with your knowledge. Keep it concise unless they're asking for detailed information.`;

  try {
    const anthropic = new Anthropic();

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 300,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: userPrompt,
        },
      ],
    });

    const content = response.content[0].type === 'text' ? response.content[0].text : '';

    return {
      content,
      shouldRespond: true,
      confidence: 0.9,
    };
  } catch (error) {
    console.error('AI Responder error:', error);

    // Fallback to a simple response
    const fallbackResponses = [
      `Hey ${config.userName}! ${greeting} The ${info.name} chat is hopping today!`,
      `What's up ${config.userName}! Always great to see fans in here. ${info.fanPhrases[0]}`,
      `${config.userName}! Welcome to the ${info.nickname} chat! What's on your mind?`,
    ];

    return {
      content: fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)],
      shouldRespond: true,
      confidence: 0.5,
    };
  }
}

/**
 * Quick response for simple interactions (no API call)
 */
export function getQuickResponse(
  type: 'greeting' | 'thanks' | 'agreement' | 'hype',
  team: ChicagoTeam,
  userName: string
): string {
  const info = TEAM_INFO[team];

  const responses: Record<string, string[]> = {
    greeting: [
      `Hey ${userName}! Welcome to ${info.nickname} chat! 🏆`,
      `What's good ${userName}! Ready to talk ${info.name}?`,
      `${userName}! Let's go! ${info.fanPhrases[0]}`,
    ],
    thanks: [
      `You got it! That's what we're here for!`,
      `Anytime! ${info.nickname} fans stick together!`,
      `No problem! ${info.fanPhrases[0]}`,
    ],
    agreement: [
      `100%! Couldn't agree more!`,
      `This is the way! Big facts!`,
      `You're spitting straight facts right now!`,
      `Exactly! This person gets it! 🙌`,
    ],
    hype: [
      `LET'S GOOOOO! ${info.fanPhrases[0]} 🔥`,
      `I'M HYPED! ${info.name} FOREVER!`,
      `THIS IS IT! ${info.fanPhrases[0].toUpperCase()}!`,
      ENTHUSIASM_PHRASES[Math.floor(Math.random() * ENTHUSIASM_PHRASES.length)],
    ],
  };

  const typeResponses = responses[type] || responses.greeting;
  return typeResponses[Math.floor(Math.random() * typeResponses.length)];
}

/**
 * Get rival trash talk
 */
export function getRivalTrashTalk(rival: string): string {
  const lowerRival = rival.toLowerCase().replace(/\s+/g, '-');
  const trashTalk = RIVAL_TRASH_TALK[lowerRival];

  if (trashTalk) {
    return trashTalk[Math.floor(Math.random() * trashTalk.length)];
  }

  return "Yeah, they're not on our level. Chicago > everywhere else!";
}

/**
 * Get time of day for greeting context
 */
export function getTimeOfDay(): 'morning' | 'afternoon' | 'evening' | 'night' {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 21) return 'evening';
  return 'night';
}

// =====================================================
// EXPORTS
// =====================================================

export { TEAM_INFO, CHICAGO_GREETINGS, ENTHUSIASM_PHRASES, DISAPPOINTMENT_PHRASES };
