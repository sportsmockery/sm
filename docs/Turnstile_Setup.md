# Cloudflare Turnstile — Auth CAPTCHA Setup

Turnstile gates Supabase Auth `signUp`, `signInWithPassword`, and
`resetPasswordForEmail`. The frontend renders the widget, captures the
token, and forwards it via `options.captchaToken`. Supabase verifies the
token server-side against Cloudflare before completing the auth call.

## Why this is wired ahead of time

Once the **CAPTCHA toggle** is flipped on in the Supabase Auth dashboard,
**every** unauthenticated `signUp` / `signInWithPassword` / `resetPasswordForEmail`
call without a `captchaToken` returns `400 captcha verification process failed`.
That instantly breaks signups for everyone if the frontend isn't ready.

The frontend is wired so that:

- **`NEXT_PUBLIC_TURNSTILE_SITE_KEY` unset** → forms render without the
  widget (current dev/preview behavior). Supabase still doesn't enforce
  CAPTCHA, so submits work as usual.
- **`NEXT_PUBLIC_TURNSTILE_SITE_KEY` set** → widget renders, submit is
  disabled until a token is produced, token is passed to Supabase. Works
  whether or not Supabase's CAPTCHA toggle is on (the token is just
  ignored by Supabase if the toggle is off).

This lets us ship the frontend, set the env var on Vercel, then flip the
Supabase toggle — in any order — without breaking signups.

## Forms wired

- `src/components/auth/SignupForm.tsx` (`/signup`)
- `src/components/auth/LoginForm.tsx` (`/login` standalone variant)
- `src/components/auth/ForgotPasswordForm.tsx` (`/forgot-password`)
- `src/components/auth/LoginShell.tsx` (`/login` — both signup + signin tabs)
- `src/components/home/HomeSignupForm.tsx` (`/home/signup`)
- `src/components/home/HomeLoginForm.tsx` (`/home/login`)

The shared widget wrapper is `src/components/auth/TurnstileWidget.tsx`.

## Dashboard / env steps the operator still needs to do

1. **Cloudflare → Turnstile → Add Site**
   - Domain: `test.sportsmockery.com` and `sportsmockery.com` (add both).
   - Widget mode: **Managed** (recommended) or **Non-Interactive**.
   - Copy the **Site key** (public) and **Secret key** (private).

2. **Supabase → Project → Auth → Settings → Bot and Abuse Protection**
   - Enable CAPTCHA.
   - Provider: **Turnstile**.
   - Paste the Cloudflare **Secret key**.
   - Save.

3. **Vercel → Project → Settings → Environment Variables**
   - Add `NEXT_PUBLIC_TURNSTILE_SITE_KEY=<cloudflare-site-key>`.
   - Apply to **Production** and **Preview**.
   - Trigger a new deploy (or rely on the next push).

That's it — the widget appears, submits are gated on the token, and
Supabase enforces verification.

## CSP impact

`src/lib/security/csp.ts` allows:

- `script-src` → adds `https://challenges.cloudflare.com` (loads the
  Turnstile JS — `'strict-dynamic'` plus the explicit allowlist covers
  both the initial script and any chunks it spawns).
- `frame-src` → adds `https://challenges.cloudflare.com` (the widget
  injects an `<iframe>` for the challenge UI).

No other CSP changes are needed.
