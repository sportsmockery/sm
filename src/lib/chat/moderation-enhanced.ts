/**
 * ENHANCED MODERATION - BYPASS PREVENTION
 * Additional checks to prevent common evasion techniques
 */

// =====================================================
// BYPASS DETECTION
// =====================================================

/**
 * Detect Zalgo text (combining characters abuse)
 */
export function detectZalgoText(text: string): boolean {
  // Count combining characters
  const combiningChars = text.match(/[\u0300-\u036f\u0489\u1dc0-\u1dff\u20d0-\u20ff\ufe20-\ufe2f]/g) || [];
  const ratio = combiningChars.length / text.length;
  return ratio > 0.3; // More than 30% combining chars is suspicious
}

/**
 * Detect invisible character spam
 */
export function detectInvisibleChars(text: string): boolean {
  const invisibleChars = text.match(/[\u200B-\u200F\u2028-\u202F\u2060-\u206F\uFEFF\u00AD]/g) || [];
  return invisibleChars.length > 3;
}

/**
 * Detect Morse code or similar encoding
 */
export function detectMorseCode(text: string): boolean {
  // Pattern like "- - - .... .. ..."
  return /^[\s.\-/|\\]+$/.test(text) && text.length > 10;
}

/**
 * Detect Base64 or encoded content
 */
export function detectEncodedContent(text: string): boolean {
  // Base64 pattern
  if (/^[A-Za-z0-9+/=]{20,}$/.test(text.replace(/\s/g, ''))) {
    return true;
  }
  // Hex encoding
  if (/^(0x)?[0-9a-fA-F]{20,}$/.test(text.replace(/\s/g, ''))) {
    return true;
  }
  return false;
}

/**
 * Detect Unicode lookalikes being used for evasion
 */
export function detectUnicodeEvasion(text: string): boolean {
  // Check for mixing of different scripts that might be evasion
  const hasLatin = /[a-zA-Z]/.test(text);
  const hasCyrillic = /[\u0400-\u04FF]/.test(text);
  const hasGreek = /[\u0370-\u03FF]/.test(text);

  // Multiple script mixing in a short text is suspicious
  const scriptCount = [hasLatin, hasCyrillic, hasGreek].filter(Boolean).length;
  return scriptCount > 1 && text.length < 50;
}

/**
 * Detect leetspeak with high confidence
 */
export function detectLeetspeak(text: string): number {
  const leetPatterns = [
    /0/g, /1/g, /3/g, /4/g, /5/g, /7/g, /8/g, // Numbers for letters
    /\$/g, /@/g, /!/g, /\|/g, // Symbols
  ];

  let leetCount = 0;
  for (const pattern of leetPatterns) {
    const matches = text.match(pattern) || [];
    leetCount += matches.length;
  }

  return leetCount / text.length;
}

/**
 * Detect words split by characters
 */
export function detectSplitWords(text: string): string {
  // Remove single character separators between letters
  return text
    .replace(/([a-zA-Z])[\s._\-*#@!$%^&()+=\[\]{}|\\:;"'<>,?/~`]([a-zA-Z])/g, '$1$2')
    .replace(/([a-zA-Z])\s([a-zA-Z])\s/g, '$1$2');
}

/**
 * Detect reversed text
 */
export function detectReversedText(text: string): string {
  return text.split('').reverse().join('');
}

// =====================================================
// ADDITIONAL WORD LISTS
// =====================================================

// Phonetic variations
export const PHONETIC_VARIATIONS: Record<string, string[]> = {
  'fuck': ['phuck', 'phuk', 'fawk', 'fawk', 'fvck', 'fucc', 'fuhk', 'faq', 'fux', 'effing', 'effin'],
  'shit': ['shite', 'shiit', 'schit', 'shat', 'chit', 'sheet', 'shyt', 'sh!t', 'ish'],
  'ass': ['azz', 'a55', 'arse', 'arrse'],
  'bitch': ['biatch', 'biotch', 'beech', 'b1tch', 'bytch', 'witch'],
  'dick': ['d1ck', 'diick', 'dik', 'dique'],
  'cock': ['c0ck', 'cawk', 'kok', 'cok'],
  'nigger': ['n1gger', 'niqqer', 'niqqa', 'ni99er', 'n!gger', 'knee grow', 'knee ger', 'neger'],
  'faggot': ['f4ggot', 'f@ggot', 'phaggot', 'fgt', 'fagit'],
  'retard': ['r3tard', 'ret@rd', 'ree tard', 'reeetard'],
};

// Emoji-based evasion (emojis that look like letters)
export const EMOJI_LETTERS: Record<string, string> = {
  '🅰️': 'a', '🅱️': 'b', '©️': 'c', '🇩': 'd', '📧': 'e',
  '🔤': 'f', '🇬': 'g', '🇭': 'h', 'ℹ️': 'i', '🇯': 'j',
  '🇰': 'k', '🇱': 'l', 'Ⓜ️': 'm', '🇳': 'n', '⭕': 'o',
  '🅿️': 'p', '🇶': 'q', '®️': 'r', '💲': 's', '🇹': 't',
  '🇺': 'u', '🇻': 'v', '🇼': 'w', '❌': 'x', '🇾': 'y',
  '🇿': 'z', '0️⃣': '0', '1️⃣': '1', '2️⃣': '2', '3️⃣': '3',
  '4️⃣': '4', '5️⃣': '5', '6️⃣': '6', '7️⃣': '7', '8️⃣': '8',
  '9️⃣': '9',
};

// Scam and phishing patterns
export const SCAM_PATTERNS = [
  /send\s*(me\s*)?(your\s*)?(bitcoin|btc|crypto|money|cash|venmo|cashapp|paypal)/i,
  /wire\s*(me\s*)?(money|funds|cash)/i,
  /password|login|credentials/i,
  /social\s*security|ssn/i,
  /bank\s*account|routing\s*number/i,
  /won\s*(a|the)?\s*(prize|lottery|giveaway)/i,
  /claim\s*(your)?\s*(prize|reward|winnings)/i,
  /verify\s*(your)?\s*(account|identity|email)/i,
  /urgent.*action\s*required/i,
  /limited\s*time.*act\s*now/i,
  /click\s*here\s*to\s*(verify|confirm|claim)/i,
];

// Sexual harassment patterns
export const HARASSMENT_PATTERNS = [
  /send\s*(me\s*)?(nudes|pics|photos)/i,
  /show\s*(me\s*)?(your|ur)\s*(body|boobs|tits|ass|dick|cock)/i,
  /wanna\s*(hook\s*up|smash|bang|fuck)/i,
  /you('re)?\s*(hot|sexy|thicc)/i,
  /asl\??/i, // Age/sex/location
  /dtf\??/i, // Down to f***
  /netflix\s*and\s*chill/i,
];

// =====================================================
// ENHANCED MODERATION FUNCTION
// =====================================================

export interface EnhancedModerationResult {
  blocked: boolean;
  reason?: string;
  evasionAttempt: boolean;
  evasionType?: string;
  suspiciousScore: number;
}

export function enhancedModeration(text: string): EnhancedModerationResult {
  const result: EnhancedModerationResult = {
    blocked: false,
    evasionAttempt: false,
    suspiciousScore: 0,
  };

  // Check for Zalgo text
  if (detectZalgoText(text)) {
    result.blocked = true;
    result.evasionAttempt = true;
    result.evasionType = 'zalgo_text';
    result.reason = 'Message contains suspicious formatting';
    result.suspiciousScore += 0.5;
  }

  // Check for invisible characters
  if (detectInvisibleChars(text)) {
    result.blocked = true;
    result.evasionAttempt = true;
    result.evasionType = 'invisible_chars';
    result.reason = 'Message contains hidden characters';
    result.suspiciousScore += 0.4;
  }

  // Check for morse code or similar
  if (detectMorseCode(text)) {
    result.blocked = true;
    result.evasionAttempt = true;
    result.evasionType = 'encoded_message';
    result.reason = 'Message appears to be encoded';
    result.suspiciousScore += 0.3;
  }

  // Check for Base64/hex encoding
  if (detectEncodedContent(text)) {
    result.blocked = true;
    result.evasionAttempt = true;
    result.evasionType = 'base64_or_hex';
    result.reason = 'Message appears to contain encoded content';
    result.suspiciousScore += 0.4;
  }

  // Check for Unicode evasion
  if (detectUnicodeEvasion(text)) {
    result.evasionAttempt = true;
    result.evasionType = 'unicode_mixing';
    result.suspiciousScore += 0.3;
  }

  // Check for high leetspeak usage
  const leetRatio = detectLeetspeak(text);
  if (leetRatio > 0.3) {
    result.evasionAttempt = true;
    result.evasionType = 'leetspeak';
    result.suspiciousScore += leetRatio * 0.5;
  }

  // Check for scam patterns
  for (const pattern of SCAM_PATTERNS) {
    if (pattern.test(text)) {
      result.blocked = true;
      result.reason = 'Message contains scam/phishing content';
      result.suspiciousScore += 0.8;
      break;
    }
  }

  // Check for harassment patterns
  for (const pattern of HARASSMENT_PATTERNS) {
    if (pattern.test(text)) {
      result.blocked = true;
      result.reason = 'Message contains inappropriate content';
      result.suspiciousScore += 0.7;
      break;
    }
  }

  // Also check reversed text for hidden profanity
  const reversed = detectReversedText(text);
  if (/fuck|shit|bitch|cunt|nigger|faggot/i.test(reversed)) {
    result.blocked = true;
    result.evasionAttempt = true;
    result.evasionType = 'reversed_text';
    result.reason = 'Message contains hidden inappropriate content';
    result.suspiciousScore += 0.6;
  }

  // Check split words
  const unsplit = detectSplitWords(text);
  if (/fuck|shit|bitch|cunt|nigger|faggot/i.test(unsplit) && unsplit !== text) {
    result.blocked = true;
    result.evasionAttempt = true;
    result.evasionType = 'split_words';
    result.reason = 'Message contains hidden inappropriate content';
    result.suspiciousScore += 0.5;
  }

  return result;
}

// =====================================================
// ADDITIONAL CONTENT POLICIES
// =====================================================

export const CONTENT_POLICIES = {
  // Maximum message length
  maxLength: 1000,

  // Minimum account age for certain features (in hours)
  minAccountAgeForLinks: 24,
  minAccountAgeForGifs: 1,
  minAccountAgeForDMs: 24,

  // Rate limits
  messagesPerMinute: 10,
  messagesPerHour: 100,
  duplicateMessageCooldown: 30, // seconds

  // Reputation thresholds
  minReputationForLinks: 10,
  reputationLossPerWarning: 5,
  reputationLossPerMute: 20,
  reputationLossPerBan: 100,

  // Progressive punishment
  warningsBeforeMute: 3,
  mutesBeforeBan: 3,
  initialMuteDuration: 5 * 60, // 5 minutes
  muteDurationMultiplier: 2, // Each mute is 2x longer
  maxMuteDuration: 24 * 60 * 60, // 24 hours

  // Appeal cooldown
  appealCooldown: 7 * 24 * 60 * 60, // 7 days
};

/**
 * Calculate punishment based on violation history
 */
export function calculatePunishment(
  warningCount: number,
  muteCount: number,
  currentSeverity: 'low' | 'medium' | 'high' | 'critical'
): { action: 'warn' | 'mute' | 'ban'; duration?: number } {
  // Critical severity always results in immediate ban
  if (currentSeverity === 'critical') {
    return { action: 'ban' };
  }

  // High severity with history
  if (currentSeverity === 'high') {
    if (muteCount >= CONTENT_POLICIES.mutesBeforeBan) {
      return { action: 'ban' };
    }
    const duration = Math.min(
      CONTENT_POLICIES.initialMuteDuration * Math.pow(CONTENT_POLICIES.muteDurationMultiplier, muteCount),
      CONTENT_POLICIES.maxMuteDuration
    );
    return { action: 'mute', duration };
  }

  // Medium severity
  if (currentSeverity === 'medium') {
    if (warningCount >= CONTENT_POLICIES.warningsBeforeMute) {
      const duration = Math.min(
        CONTENT_POLICIES.initialMuteDuration * Math.pow(CONTENT_POLICIES.muteDurationMultiplier, muteCount),
        CONTENT_POLICIES.maxMuteDuration
      );
      return { action: 'mute', duration };
    }
    return { action: 'warn' };
  }

  // Low severity - just warn
  return { action: 'warn' };
}
