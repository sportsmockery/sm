import type { CardType } from '@/lib/river-types';

export const CARD_TYPE_LABELS: Record<CardType, string> = {
  scout_summary: 'SCOUT AI',
  hub_update: 'HUB UPDATE',
  trade_proposal: 'TRADE PROPOSAL',
  vision_theater: 'VISION THEATER',
  trending_article: 'TRENDING',
  box_score: 'GAME CENTER',
  trending_player: 'TRENDING',
  fan_chat: 'FAN CHAT',
  mock_draft: 'MOCK DRAFT',
  sm_plus: 'SM+',
  infographic: 'NEXT GEN DATA',
  chart: 'ANALYTICS',
  poll: 'EDGE DEBATE',
  comment_spotlight: 'COMMUNITY',
  listen_now: 'LISTEN NOW',
  join_newsletter: 'NEWSLETTER',
  download_app: 'GET THE APP',
};

export function formatTimestamp(timestamp: string | null): string {
  if (!timestamp) return '';
  const now = Date.now();
  const then = new Date(timestamp).getTime();
  const diffMs = now - then;
  if (diffMs < 0) return 'just now';
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return `${diffSec}s ago`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  return `${diffDay}d ago`;
}
