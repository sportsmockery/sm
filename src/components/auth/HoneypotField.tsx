'use client'

// Visually-hidden honeypot input. Bots that auto-fill every input
// will fill this; real users (sighted, keyboard, screen-reader) never
// reach it. The field is wrapped in an aria-hidden label so AT skips it.
//
// Usage:
//   const [honeypot, setHoneypot] = useState('')
//   <HoneypotField value={honeypot} onChange={setHoneypot} />
//
// Submit handler must reject when value !== '' BEFORE calling captcha
// or Supabase — see isHoneypotTriggered() in lib/security/honeypot.ts.

import {
  HONEYPOT_FIELD_NAME,
  HONEYPOT_INPUT_ATTRS,
  HONEYPOT_INPUT_STYLE,
} from '@/lib/security/honeypot'

interface Props {
  value: string
  onChange: (value: string) => void
  // Optional unique suffix when multiple forms share a page (e.g. the
  // signup/signin tabs in LoginShell), so each input has a distinct id.
  idSuffix?: string
}

export default function HoneypotField({ value, onChange, idSuffix }: Props) {
  const id = idSuffix ? `${HONEYPOT_FIELD_NAME}-${idSuffix}` : HONEYPOT_FIELD_NAME
  return (
    <div aria-hidden="true" style={HONEYPOT_INPUT_STYLE}>
      <label htmlFor={id}>Website</label>
      <input
        {...HONEYPOT_INPUT_ATTRS}
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  )
}
