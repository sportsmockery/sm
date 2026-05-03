import { createHmac } from 'crypto';
import type { CardType } from './river-types';

export interface TokenPayload {
  card_id: string;
  card_type: CardType;
  user_segment: string;
  session_id: string;
  team_slug: string | null;
  expires_at: number;
}

// In production, refuse to fall back to a public default — tokens signed
// with a known secret are forgeable. Local dev keeps a clearly-named
// fallback so contributors don't have to set the var to run the app.
if (!process.env.TRACKING_TOKEN_SECRET && process.env.VERCEL_ENV === 'production') {
  throw new Error('TRACKING_TOKEN_SECRET is required in production');
}
const SECRET = process.env.TRACKING_TOKEN_SECRET ?? 'sm-river-dev-only-not-secure';

export function generateTrackingToken(
  cardId: string,
  cardType: CardType,
  userSegment: string,
  sessionId: string,
  teamSlug: string | null
): string {
  const payload: TokenPayload = {
    card_id: cardId,
    card_type: cardType,
    user_segment: userSegment,
    session_id: sessionId,
    team_slug: teamSlug,
    expires_at: Date.now() + 24 * 60 * 60 * 1000,
  };
  const encoded = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sig = createHmac('sha256', SECRET).update(encoded).digest('base64url');
  return `${encoded}.${sig}`;
}

export function validateTrackingToken(token: string): TokenPayload | null {
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [encoded, sig] = parts;
  const expectedSig = createHmac('sha256', SECRET).update(encoded).digest('base64url');
  if (sig !== expectedSig) return null;
  try {
    const payload: TokenPayload = JSON.parse(Buffer.from(encoded, 'base64url').toString());
    if (payload.expires_at < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}
