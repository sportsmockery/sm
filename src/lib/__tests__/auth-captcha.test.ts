// Run with: npx tsx --test src/lib/__tests__/auth-captcha.test.ts
//
// Verifies the captcha token plumbing through src/lib/auth.ts. Once
// Supabase Auth's CAPTCHA toggle is enabled in the dashboard, every
// signUp / signInWithPassword / resetPasswordForEmail call MUST include
// `options.captchaToken`. These tests assert the wrapper forwards the
// token unchanged and omits the option when no token is supplied.

import { test } from 'node:test'
import { strict as assert } from 'node:assert'
import Module from 'node:module'

// We need a `window` object for the signUp wrapper's emailRedirectTo line.
;(globalThis as any).window = { location: { origin: 'https://test.sportsmockery.com' } }

interface CapturedCall {
  method: 'signUp' | 'signInWithPassword' | 'resetPasswordForEmail'
  args: unknown[]
}

const calls: CapturedCall[] = []

function makeMockClient(): {
  auth: {
    signUp: (args: unknown) => Promise<{ data: { user: null; session: null }; error: null }>
    signInWithPassword: (args: unknown) => Promise<{ data: { user: null; session: null }; error: null }>
    resetPasswordForEmail: (email: string, opts?: unknown) => Promise<{ error: null }>
  }
} {
  return {
    auth: {
      signUp: async (args: unknown) => {
        calls.push({ method: 'signUp', args: [args] })
        return { data: { user: null, session: null }, error: null }
      },
      signInWithPassword: async (args: unknown) => {
        calls.push({ method: 'signInWithPassword', args: [args] })
        return { data: { user: null, session: null }, error: null }
      },
      resetPasswordForEmail: async (email: string, opts?: unknown) => {
        calls.push({ method: 'resetPasswordForEmail', args: [email, opts] })
        return { error: null }
      },
    },
  }
}

// Stub the supabase-browser singleton via a require-cache override BEFORE
// auth.ts is loaded. This is the same trick the rest of the security
// tests use to avoid pulling in real Supabase / network deps.
const stubPath = require.resolve('../supabase-browser')
const stub = { getBrowserClient: makeMockClient }
;(Module as any)._cache[stubPath] = {
  id: stubPath,
  filename: stubPath,
  loaded: true,
  exports: stub,
}

// eslint-disable-next-line @typescript-eslint/no-require-imports
const auth = require('../auth') as typeof import('../auth')

test('signUp forwards captchaToken into options when provided', async () => {
  calls.length = 0
  await auth.signUp('a@b.com', 'pw12345678', { full_name: 'A' }, { captchaToken: 'TS-TOKEN-1' })
  assert.equal(calls.length, 1)
  const sent = calls[0].args[0] as {
    email: string
    password: string
    options: { captchaToken?: string; data?: { full_name?: string }; emailRedirectTo?: string }
  }
  assert.equal(sent.email, 'a@b.com')
  assert.equal(sent.options.captchaToken, 'TS-TOKEN-1')
  assert.deepEqual(sent.options.data, { full_name: 'A' })
})

test('signUp omits captchaToken when not provided', async () => {
  calls.length = 0
  await auth.signUp('a@b.com', 'pw12345678', { full_name: 'A' })
  const sent = calls[0].args[0] as { options: Record<string, unknown> }
  assert.equal('captchaToken' in sent.options, false)
})

test('signIn forwards captchaToken into options when provided', async () => {
  calls.length = 0
  await auth.signIn('a@b.com', 'pw12345678', { captchaToken: 'TS-TOKEN-2' })
  assert.equal(calls.length, 1)
  const sent = calls[0].args[0] as {
    email: string
    password: string
    options?: { captchaToken?: string }
  }
  assert.equal(sent.email, 'a@b.com')
  assert.equal(sent.options?.captchaToken, 'TS-TOKEN-2')
})

test('signIn omits options entirely when no captcha token', async () => {
  calls.length = 0
  await auth.signIn('a@b.com', 'pw12345678')
  const sent = calls[0].args[0] as { options?: unknown }
  assert.equal(sent.options, undefined)
})

test('resetPassword forwards captchaToken alongside redirectTo', async () => {
  calls.length = 0
  await auth.resetPassword('a@b.com', { captchaToken: 'TS-TOKEN-3' })
  assert.equal(calls.length, 1)
  const opts = calls[0].args[1] as { redirectTo: string; captchaToken?: string }
  assert.equal(opts.captchaToken, 'TS-TOKEN-3')
  // The redirectTo is still set — captcha plumbing must not drop it.
  assert.match(opts.redirectTo, /\/reset-password$/)
})

test('resetPassword omits captchaToken but keeps redirectTo when not supplied', async () => {
  calls.length = 0
  await auth.resetPassword('a@b.com')
  const opts = calls[0].args[1] as { redirectTo: string; captchaToken?: string }
  assert.equal('captchaToken' in opts, false)
  assert.match(opts.redirectTo, /\/reset-password$/)
})
