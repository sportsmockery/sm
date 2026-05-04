// Hidden form field that bots fill but real users never see.
//
// We deliberately avoid `type="hidden"` (modern bots skip those) and
// avoid the field name "honeypot" (bots scan for it). The field is
// hidden via CSS positioning + aria-hidden + tabIndex=-1 so screen
// readers and keyboard users never reach it.
//
// Server-side handler: empty value -> proceed; non-empty value -> reject
// silently with a generic error (don't tell the bot why).

export const HONEYPOT_FIELD_NAME = 'website_url'

// CSS that visually removes the field while keeping it in the DOM and
// reachable by automated form fillers. inline-styles so the rule
// can't be globally disabled by a stylesheet edit.
export const HONEYPOT_INPUT_STYLE: React.CSSProperties = {
  position: 'absolute',
  left: '-9999px',
  top: 'auto',
  width: '1px',
  height: '1px',
  overflow: 'hidden',
  opacity: 0,
  pointerEvents: 'none',
}

// Common HTML attributes for the input. The label that wraps it should
// also carry aria-hidden so the relationship doesn't leak to AT.
export const HONEYPOT_INPUT_ATTRS = {
  type: 'text' as const,
  name: HONEYPOT_FIELD_NAME,
  tabIndex: -1,
  autoComplete: 'off',
  'aria-hidden': true as const,
}

// Returns true when the honeypot value indicates a bot submission.
// Anything other than an empty / whitespace-only string is suspicious.
export function isHoneypotTriggered(value: unknown): boolean {
  if (value === undefined || value === null) return false
  if (typeof value !== 'string') return true
  return value.trim().length > 0
}

// The error string we surface when a bot trips the trap. Identical to
// generic auth failure copy so a bot can't differentiate the cause.
export const HONEYPOT_GENERIC_ERROR = 'Sign up failed. Please try again.'
