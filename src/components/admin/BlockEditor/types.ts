// Block-based article editor types

export type BlockType =
  | 'paragraph'
  | 'heading'
  | 'image'
  | 'video'
  | 'scout-insight'
  | 'gm-interaction'
  | 'trade-scenario'
  | 'player-comparison'
  | 'stats-chart'
  | 'debate'
  | 'update'
  | 'reaction-stream'
  | 'poll'
  | 'hot-take'
  | 'rumor-meter'
  | 'heat-meter'
  | 'mock-draft'
  | 'divider';

export interface BlockBase {
  id: string;
  type: BlockType;
}

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

export interface ScoutInsightBlock extends BlockBase {
  type: 'scout-insight';
  data: { insight: string; confidence: 'low' | 'medium' | 'high'; autoGenerate?: boolean };
}

export interface GMInteractionBlock extends BlockBase {
  type: 'gm-interaction';
  data: { question: string; options: string[]; reward: number };
}

export interface TradeScenarioBlock extends BlockBase {
  type: 'trade-scenario';
  data: {
    teamA: string;
    teamB: string;
    teamAReceives: { type: 'player' | 'pick'; label: string }[];
    teamBReceives: { type: 'player' | 'pick'; label: string }[];
  };
}

export interface PlayerComparisonBlock extends BlockBase {
  type: 'player-comparison';
  data: {
    playerA: { name: string; team: string; headshot: string };
    playerB: { name: string; team: string; headshot: string };
    stats: { label: string; playerA: number; playerB: number }[];
  };
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

export interface DebateBlock extends BlockBase {
  type: 'debate';
  data: { proArgument: string; conArgument: string; reward: number };
}

export interface UpdateBlockType extends BlockBase {
  type: 'update';
  data: { timestamp: string; text: string };
}

export interface ReactionStreamBlock extends BlockBase {
  type: 'reaction-stream';
  data: {
    reactions: { avatar: string; username: string; comment: string; timestamp: string }[];
  };
}

export interface PollBlock extends BlockBase {
  type: 'poll';
  data: { question: string; options: string[]; reward: number };
}

export interface HotTakeBlock extends BlockBase {
  type: 'hot-take';
  data: { text: string };
}

export interface RumorMeterBlock extends BlockBase {
  type: 'rumor-meter';
  data: { strength: 'Low' | 'Medium' | 'Strong' | 'Heating Up' };
}

export interface HeatMeterBlock extends BlockBase {
  type: 'heat-meter';
  data: { level: 'Warm' | 'Hot' | 'Nuclear' };
}

export interface MockDraftBlock extends BlockBase {
  type: 'mock-draft';
  data: {
    picks: { pickNumber: number; team: string; player: string; position: string; school: string }[];
  };
}

export interface DividerBlock extends BlockBase {
  type: 'divider';
  data: Record<string, never>;
}

export type ContentBlock =
  | ParagraphBlock
  | HeadingBlock
  | ImageBlock
  | VideoBlock
  | ScoutInsightBlock
  | GMInteractionBlock
  | TradeScenarioBlock
  | PlayerComparisonBlock
  | StatsChartBlock
  | DebateBlock
  | UpdateBlockType
  | ReactionStreamBlock
  | PollBlock
  | HotTakeBlock
  | RumorMeterBlock
  | HeatMeterBlock
  | MockDraftBlock
  | DividerBlock;

export interface ArticleDocument {
  version: 1;
  template?: string;
  blocks: ContentBlock[];
}

// Block category for inserter menu
export interface BlockCategory {
  label: string;
  blocks: { type: BlockType; label: string; icon: string; description: string }[];
}

export const BLOCK_CATEGORIES: BlockCategory[] = [
  {
    label: 'Text',
    blocks: [
      { type: 'paragraph', label: 'Paragraph', icon: 'Type', description: 'Article body text' },
      { type: 'heading', label: 'Heading', icon: 'Heading', description: 'Section heading (H2-H4)' },
      { type: 'image', label: 'Image', icon: 'Image', description: 'Image with caption' },
      { type: 'video', label: 'Video', icon: 'Play', description: 'Embedded video' },
      { type: 'divider', label: 'Divider', icon: 'Minus', description: 'Horizontal separator' },
    ],
  },
  {
    label: 'Intelligence',
    blocks: [
      { type: 'scout-insight', label: 'Scout Insight', icon: 'Sparkles', description: 'Scout AI analysis block' },
      { type: 'gm-interaction', label: 'GM Pulse', icon: 'Vote', description: 'GM Score vote interaction' },
      { type: 'poll', label: 'Fan Poll', icon: 'BarChart3', description: 'Fan poll with GM reward' },
    ],
  },
  {
    label: 'GM & Roster',
    blocks: [
      { type: 'player-comparison', label: 'Player Comparison', icon: 'Users', description: 'Head-to-head stat matchup' },
      { type: 'stats-chart', label: 'Chart', icon: 'BarChart', description: 'Bar or line chart' },
      { type: 'trade-scenario', label: 'Trade Scenario', icon: 'ArrowRightLeft', description: 'Team A / B trade card' },
      { type: 'rumor-meter', label: 'Rumor Confidence', icon: 'Thermometer', description: 'Rumor confidence gauge' },
      { type: 'mock-draft', label: 'Mock Draft', icon: 'List', description: 'Draft pick cards' },
    ],
  },
  {
    label: 'Engagement',
    blocks: [
      { type: 'debate', label: 'Debate', icon: 'Swords', description: 'PRO vs CON with voting' },
      { type: 'hot-take', label: 'Hot Take', icon: 'Flame', description: 'Bold highlighted take' },
      { type: 'reaction-stream', label: 'Reaction Stream', icon: 'MessageCircle', description: 'Fan reaction cards' },
      { type: 'heat-meter', label: 'Heat Meter', icon: 'Flame', description: 'Trending heat gauge' },
      { type: 'update', label: 'Breaking Update', icon: 'Bell', description: 'Breaking update notice' },
    ],
  },
];

export function createBlock(type: BlockType): ContentBlock {
  const id = crypto.randomUUID();
  const defaults: Record<BlockType, () => ContentBlock> = {
    'paragraph': () => ({ id, type: 'paragraph', data: { html: '' } }),
    'heading': () => ({ id, type: 'heading', data: { text: '', level: 2 } }),
    'image': () => ({ id, type: 'image', data: { src: '', alt: '' } }),
    'video': () => ({ id, type: 'video', data: { url: '' } }),
    'scout-insight': () => ({ id, type: 'scout-insight', data: { insight: '', confidence: 'high', autoGenerate: true } }),
    'gm-interaction': () => ({ id, type: 'gm-interaction', data: { question: '', options: ['YES', 'NO'], reward: 3 } }),
    'trade-scenario': () => ({
      id, type: 'trade-scenario',
      data: { teamA: '', teamB: '', teamAReceives: [], teamBReceives: [] },
    }),
    'player-comparison': () => ({
      id, type: 'player-comparison',
      data: {
        playerA: { name: '', team: '', headshot: '' },
        playerB: { name: '', team: '', headshot: '' },
        stats: [],
      },
    }),
    'stats-chart': () => ({
      id, type: 'stats-chart',
      data: { title: '', chartType: 'bar', color: '#00D4FF', dataPoints: [] },
    }),
    'debate': () => ({ id, type: 'debate', data: { proArgument: '', conArgument: '', reward: 3 } }),
    'update': () => ({ id, type: 'update', data: { timestamp: '', text: '' } }),
    'reaction-stream': () => ({ id, type: 'reaction-stream', data: { reactions: [] } }),
    'poll': () => ({ id, type: 'poll', data: { question: '', options: ['YES', 'NO'], reward: 2 } }),
    'hot-take': () => ({ id, type: 'hot-take', data: { text: '' } }),
    'rumor-meter': () => ({ id, type: 'rumor-meter', data: { strength: 'Medium' } }),
    'heat-meter': () => ({ id, type: 'heat-meter', data: { level: 'Hot' } }),
    'mock-draft': () => ({ id, type: 'mock-draft', data: { picks: [] } }),
    'divider': () => ({ id, type: 'divider', data: {} }),
  };
  return defaults[type]();
}
