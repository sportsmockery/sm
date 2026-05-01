// Block-based article editor types

// ─── Block Classification ───
// Content blocks: Writer-authored editorial content
// Analysis blocks: Data-driven intelligence and roster analysis
// Fan Interaction blocks: User engagement and participation
// Platform blocks: System-generated (not writer-controlled)

export type BlockType =
  // Content
  | 'paragraph'
  | 'heading'
  | 'image'
  | 'video'
  | 'quote'
  | 'social-embed'
  | 'divider'
  // Editorial structure (human-written — used for HCU compliance)
  | 'tldr'
  | 'key-facts'
  | 'why-it-matters'
  | 'whats-next'
  // Scout AI-generated (visibly labeled — never article body)
  | 'scout-summary'
  | 'scout-recap'
  // Analysis
  | 'scout-insight'
  | 'stats-chart'
  | 'player-comparison'
  | 'trade-scenario'
  | 'mock-draft'
  | 'sentiment-meter'
  // Fan Interaction
  | 'interaction'
  | 'debate'
  | 'hot-take'
  | 'update'
  // Legacy (backwards compat — mapped at load time)
  | 'gm-interaction'
  | 'poll'
  | 'rumor-meter'
  | 'heat-meter'
  | 'reaction-stream';

export interface BlockBase {
  id: string;
  type: BlockType;
}

// ─── Content Blocks ───

export interface ParagraphBlock extends BlockBase {
  type: 'paragraph';
  data: { html: string };
}

export interface HeadingBlock extends BlockBase {
  type: 'heading';
  data: { text: string; level: 2 | 3 | 4 };
}

export interface ImageBlock extends BlockBase {
  type: 'image';
  data: { src: string; alt: string; caption?: string };
}

export interface VideoBlock extends BlockBase {
  type: 'video';
  data: { url: string; caption?: string };
}

export interface QuoteBlock extends BlockBase {
  type: 'quote';
  data: { text: string; speaker: string; team?: string };
}

export type SocialPlatform = 'twitter' | 'youtube' | 'tiktok' | 'instagram';

export interface SocialEmbedBlock extends BlockBase {
  type: 'social-embed';
  data: { url: string; platform: SocialPlatform };
}

export interface DividerBlock extends BlockBase {
  type: 'divider';
  data: Record<string, never>;
}

// ─── Editorial Structure Blocks (human-written) ───

export interface TldrBlock extends BlockBase {
  type: 'tldr';
  data: { html: string };
}

export interface KeyFactsBlock extends BlockBase {
  type: 'key-facts';
  data: { html: string };
}

export interface WhyItMattersBlock extends BlockBase {
  type: 'why-it-matters';
  data: { html: string };
}

export interface WhatsNextBlock extends BlockBase {
  type: 'whats-next';
  data: { html: string };
}

// ─── Scout AI Blocks (visibly labeled — never article body) ───
//
// Scout is an in-house AI tool. It produces ONLY the summary blurb at the
// top of an article and the recap at the end. The article body is always
// human-written by the bylined staff writer (see /editorial-standards).

export interface ScoutSummaryBlock extends BlockBase {
  type: 'scout-summary';
  data: { html: string };
}

export interface ScoutRecapBlock extends BlockBase {
  type: 'scout-recap';
  data: { html: string };
}

// ─── Analysis Blocks ───

export interface ScoutInsightBlock extends BlockBase {
  type: 'scout-insight';
  data: { insight: string; confidence: 'low' | 'medium' | 'high'; autoGenerate?: boolean };
}

export interface StatsChartBlock extends BlockBase {
  type: 'stats-chart';
  data: {
    title: string;
    chartType: 'bar' | 'line';
    color: string;
    dataPoints: { label: string; value: number }[];
  };
}

export interface PlayerComparisonBlock extends BlockBase {
  type: 'player-comparison';
  data: {
    playerA: { name: string; team: string; headshot: string };
    playerB: { name: string; team: string; headshot: string };
    stats: { label: string; playerA: number; playerB: number; higherWins?: boolean }[];
  };
}

export interface TradeItem {
  type: 'player' | 'pick';
  label: string;
  headshot_url?: string;
  stat_line?: string;
  position?: string;
  player_id?: string;
}

export interface TradeScenarioBlock extends BlockBase {
  type: 'trade-scenario';
  data: {
    teamA: string;
    teamB: string;
    teamALogo?: string;
    teamBLogo?: string;
    teamASport?: string;
    teamBSport?: string;
    teamAKey?: string;
    teamBKey?: string;
    teamAReceives: TradeItem[];
    teamBReceives: TradeItem[];
  };
}

export interface MockDraftBlock extends BlockBase {
  type: 'mock-draft';
  data: {
    picks: { pickNumber: number; team: string; player: string; position: string; school: string }[];
  };
}

export type SentimentMode = 'rumor' | 'heat' | 'confidence' | 'panic';

export interface SentimentMeterBlock extends BlockBase {
  type: 'sentiment-meter';
  data: { mode: SentimentMode; level: number };
}

// ─── Fan Interaction Blocks ───

export type InteractionVariant = 'poll' | 'gm-pulse';

export interface InteractionBlock extends BlockBase {
  type: 'interaction';
  data: { variant: InteractionVariant; question: string; options: string[]; reward: number };
}

export interface DebateBlock extends BlockBase {
  type: 'debate';
  data: { proArgument: string; conArgument: string; reward: number };
}

export interface HotTakeBlock extends BlockBase {
  type: 'hot-take';
  data: { text: string };
}

export interface UpdateBlockType extends BlockBase {
  type: 'update';
  data: { timestamp: string; text: string };
}

// ─── Legacy Block Types (backwards compat) ───

export interface GMInteractionBlock extends BlockBase {
  type: 'gm-interaction';
  data: { question: string; options: string[]; reward: number };
}

export interface PollBlock extends BlockBase {
  type: 'poll';
  data: { question: string; options: string[]; reward: number };
}

export interface RumorMeterBlock extends BlockBase {
  type: 'rumor-meter';
  data: { strength: 'Low' | 'Medium' | 'Strong' | 'Heating Up' };
}

export interface HeatMeterBlock extends BlockBase {
  type: 'heat-meter';
  data: { level: 'Warm' | 'Hot' | 'Nuclear' };
}

export type ReactionSource = 'auto' | 'debate' | 'poll' | 'fan-chat' | 'team';

export interface ReactionStreamBlock extends BlockBase {
  type: 'reaction-stream';
  data: {
    enabled: boolean;
    source: ReactionSource;
    maxItems: number;
    autoHideWhenEmpty: boolean;
    availableCount?: number;
    previewItems?: { avatar: string; username: string; comment: string; timestamp: string }[];
  };
}

// ─── Union & Document ───

export type ContentBlock =
  | ParagraphBlock
  | HeadingBlock
  | ImageBlock
  | VideoBlock
  | QuoteBlock
  | SocialEmbedBlock
  | DividerBlock
  | TldrBlock
  | KeyFactsBlock
  | WhyItMattersBlock
  | WhatsNextBlock
  | ScoutSummaryBlock
  | ScoutRecapBlock
  | ScoutInsightBlock
  | StatsChartBlock
  | PlayerComparisonBlock
  | TradeScenarioBlock
  | MockDraftBlock
  | SentimentMeterBlock
  | InteractionBlock
  | DebateBlock
  | HotTakeBlock
  | UpdateBlockType
  // Legacy
  | GMInteractionBlock
  | PollBlock
  | RumorMeterBlock
  | HeatMeterBlock
  | ReactionStreamBlock;

export interface ArticleDocument {
  version: 1;
  template?: string;
  blocks: ContentBlock[];
}

// ─── Sentiment Meter Config ───

export const SENTIMENT_CONFIGS: Record<SentimentMode, { label: string; segments: string[] }> = {
  rumor: { label: 'Rumor Confidence', segments: ['Low', 'Medium', 'Strong', 'Heating Up'] },
  heat: { label: 'Heat Meter', segments: ['Warm', 'Hot', 'Nuclear'] },
  confidence: { label: 'Confidence', segments: ['Low', 'Moderate', 'High', 'Lock'] },
  panic: { label: 'Panic Meter', segments: ['Calm', 'Uneasy', 'Alarmed', 'Full Panic'] },
};

// ─── Block Categories for Inserter ───

export interface BlockCategory {
  label: string;
  blocks: { type: BlockType; label: string; icon: string; description: string }[];
}

export const BLOCK_CATEGORIES: BlockCategory[] = [
  {
    label: 'Content',
    blocks: [
      { type: 'paragraph', label: 'Paragraph', icon: 'Type', description: 'Article body text' },
      { type: 'heading', label: 'Heading', icon: 'Heading', description: 'Section heading (H2-H4)' },
      { type: 'image', label: 'Image', icon: 'Image', description: 'Image with caption' },
      { type: 'video', label: 'Video', icon: 'Play', description: 'Embedded video' },
      { type: 'quote', label: 'Quote', icon: 'Quote', description: 'Player or coach quote' },
      { type: 'social-embed', label: 'Social Embed', icon: 'Share2', description: 'Twitter, YouTube, TikTok, Instagram' },
      { type: 'divider', label: 'Divider', icon: 'Minus', description: 'Horizontal separator' },
    ],
  },
  {
    label: 'Editorial Structure',
    blocks: [
      { type: 'tldr', label: 'TL;DR', icon: 'AlignLeft', description: 'Quick summary callout (top of article)' },
      { type: 'key-facts', label: 'Key Facts', icon: 'List', description: 'Bullet-point fact list' },
      { type: 'why-it-matters', label: 'Why It Matters', icon: 'AlertCircle', description: 'Significance / context callout' },
      { type: 'whats-next', label: "What's Next", icon: 'ArrowRight', description: 'Next steps / what to watch for' },
    ],
  },
  {
    label: 'Scout AI',
    blocks: [
      { type: 'scout-summary', label: 'Scout Summary', icon: 'Sparkles', description: 'AI-generated summary blurb (visibly labeled)' },
      { type: 'scout-recap', label: 'Scout Recap', icon: 'Sparkles', description: 'AI-generated end-of-article recap (visibly labeled)' },
    ],
  },
  {
    label: 'Analysis',
    blocks: [
      { type: 'scout-insight', label: 'Scout Insight', icon: 'Sparkles', description: 'Scout AI analysis block' },
      { type: 'stats-chart', label: 'Chart', icon: 'BarChart', description: 'Animated bar or line chart' },
      { type: 'player-comparison', label: 'Player Comparison', icon: 'Users', description: 'Head-to-head stat matchup' },
      { type: 'trade-scenario', label: 'Trade Scenario', icon: 'ArrowRightLeft', description: 'Team A / B trade card' },
      { type: 'mock-draft', label: 'Mock Draft', icon: 'List', description: 'Draft pick cards' },
      { type: 'sentiment-meter', label: 'Sentiment Meter', icon: 'Thermometer', description: 'Rumor, heat, confidence, or panic gauge' },
    ],
  },
  {
    label: 'Fan Interaction',
    blocks: [
      { type: 'interaction', label: 'Fan Poll / GM Pulse', icon: 'Vote', description: 'Fan poll or GM Score vote' },
      { type: 'debate', label: 'Debate', icon: 'Swords', description: 'PRO vs CON with voting' },
      { type: 'hot-take', label: 'Hot Take', icon: 'Flame', description: 'Bold highlighted take' },
      { type: 'update', label: 'Breaking Update', icon: 'Bell', description: 'Breaking update notice' },
    ],
  },
];

// ─── Block Factory ───

export function createBlock(type: BlockType): ContentBlock {
  const id = crypto.randomUUID();
  const defaults: Record<string, () => ContentBlock> = {
    // Content
    'paragraph': () => ({ id, type: 'paragraph', data: { html: '' } }),
    'heading': () => ({ id, type: 'heading', data: { text: '', level: 2 } }),
    'image': () => ({ id, type: 'image', data: { src: '', alt: '' } }),
    'video': () => ({ id, type: 'video', data: { url: '' } }),
    'quote': () => ({ id, type: 'quote', data: { text: '', speaker: '', team: '' } }),
    'social-embed': () => ({ id, type: 'social-embed', data: { url: '', platform: 'twitter' as const } }),
    'divider': () => ({ id, type: 'divider', data: {} }),
    // Editorial structure
    'tldr': () => ({ id, type: 'tldr', data: { html: '' } }),
    'key-facts': () => ({ id, type: 'key-facts', data: { html: '' } }),
    'why-it-matters': () => ({ id, type: 'why-it-matters', data: { html: '' } }),
    'whats-next': () => ({ id, type: 'whats-next', data: { html: '' } }),
    // Scout AI (writer adds when Scout has produced content)
    'scout-summary': () => ({ id, type: 'scout-summary', data: { html: '' } }),
    'scout-recap': () => ({ id, type: 'scout-recap', data: { html: '' } }),
    // Analysis
    'scout-insight': () => ({ id, type: 'scout-insight', data: { insight: '', confidence: 'high', autoGenerate: true } }),
    'stats-chart': () => ({ id, type: 'stats-chart', data: { title: '', chartType: 'bar', color: '#00D4FF', dataPoints: [] } }),
    'player-comparison': () => ({
      id, type: 'player-comparison',
      data: {
        playerA: { name: '', team: '', headshot: '' },
        playerB: { name: '', team: '', headshot: '' },
        stats: [],
      },
    }),
    'trade-scenario': () => ({
      id, type: 'trade-scenario',
      data: { teamA: '', teamB: '', teamAReceives: [], teamBReceives: [] },
    }),
    'mock-draft': () => ({ id, type: 'mock-draft', data: { picks: [] } }),
    'sentiment-meter': () => ({ id, type: 'sentiment-meter', data: { mode: 'rumor' as const, level: 2 } }),
    // Fan Interaction — default to Fan Poll (most common) with a starter
    // question so the live preview is never empty after insertion. Writers
    // can edit or switch to GM Pulse from the panel.
    'interaction': () => ({ id, type: 'interaction', data: { variant: 'poll' as const, question: 'Is this an overreaction?', options: ['YES', 'NO'], reward: 3 } }),
    'debate': () => ({ id, type: 'debate', data: { proArgument: '', conArgument: '', reward: 3 } }),
    'hot-take': () => ({ id, type: 'hot-take', data: { text: '' } }),
    'update': () => ({ id, type: 'update', data: { timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'America/Chicago' }) + ' CT', text: '' } }),
    // Legacy aliases → new types
    'gm-interaction': () => ({ id, type: 'interaction', data: { variant: 'gm-pulse' as const, question: '', options: ['YES', 'NO'], reward: 3 } }),
    'poll': () => ({ id, type: 'interaction', data: { variant: 'poll' as const, question: '', options: ['YES', 'NO'], reward: 2 } }),
    'rumor-meter': () => ({ id, type: 'sentiment-meter', data: { mode: 'rumor' as const, level: 2 } }),
    'heat-meter': () => ({ id, type: 'sentiment-meter', data: { mode: 'heat' as const, level: 2 } }),
    'reaction-stream': () => ({ id, type: 'reaction-stream', data: { enabled: false, source: 'auto' as const, maxItems: 5, autoHideWhenEmpty: true } }),
  };
  return (defaults[type] || defaults['paragraph'])();
}

// ─── Legacy Migration ───
// Converts old block types stored in DB to new unified types

export function migrateBlock(block: ContentBlock): ContentBlock {
  switch (block.type) {
    case 'gm-interaction':
      return { ...block, type: 'interaction', data: { variant: 'gm-pulse', question: block.data.question, options: block.data.options, reward: block.data.reward } } as InteractionBlock;
    case 'poll':
      return { ...block, type: 'interaction', data: { variant: 'poll', question: block.data.question, options: block.data.options, reward: block.data.reward } } as InteractionBlock;
    case 'rumor-meter': {
      const strengthMap: Record<string, number> = { 'Low': 1, 'Medium': 2, 'Strong': 3, 'Heating Up': 4 };
      return { ...block, type: 'sentiment-meter', data: { mode: 'rumor', level: strengthMap[block.data.strength] || 2 } } as SentimentMeterBlock;
    }
    case 'heat-meter': {
      const levelMap: Record<string, number> = { 'Warm': 1, 'Hot': 2, 'Nuclear': 3 };
      return { ...block, type: 'sentiment-meter', data: { mode: 'heat', level: levelMap[block.data.level] || 2 } } as SentimentMeterBlock;
    }
    default:
      return block;
  }
}

export function migrateDocument(doc: ArticleDocument): ArticleDocument {
  return {
    ...doc,
    blocks: doc.blocks
      .filter(b => b.type !== 'reaction-stream') // Strip platform blocks from editor
      .map(migrateBlock),
  };
}
