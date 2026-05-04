// Run with: npx tsx --test src/lib/security/__tests__/honeypot.test.ts
//
// Covers the honeypot lib — empty values pass, non-empty rejects,
// and the constants the React component / route handler depend on.

import { test } from 'node:test'
import { strict as assert } from 'node:assert'
import {
  isHoneypotTriggered,
  HONEYPOT_FIELD_NAME,
  HONEYPOT_INPUT_ATTRS,
  HONEYPOT_INPUT_STYLE,
  HONEYPOT_GENERIC_ERROR,
} from '../honeypot'

test('empty / undefined / whitespace honeypot values pass through', () => {
  assert.equal(isHoneypotTriggered(undefined), false)
  assert.equal(isHoneypotTriggered(null), false)
  assert.equal(isHoneypotTriggered(''), false)
  assert.equal(isHoneypotTriggered('   '), false)
  assert.equal(isHoneypotTriggered('\t\n'), false)
})

test('any non-empty string trips the trap', () => {
  assert.equal(isHoneypotTriggered('https://example.com'), true)
  assert.equal(isHoneypotTriggered('a'), true)
  assert.equal(isHoneypotTriggered('  filled  '), true)
})

test('non-string values are treated as suspicious', () => {
  // A bot framework might post an object/array instead of a string.
  assert.equal(isHoneypotTriggered(123 as unknown as string), true)
  assert.equal(isHoneypotTriggered({} as unknown as string), true)
  assert.equal(isHoneypotTriggered([] as unknown as string), true)
})

test('field name is something innocuous (NOT "honeypot")', () => {
  assert.notEqual(HONEYPOT_FIELD_NAME, 'honeypot')
  // Also avoid obviously trap-like names.
  assert.doesNotMatch(HONEYPOT_FIELD_NAME, /honey|trap|bot/i)
})

test('input attrs include the accessibility / autocomplete protections', () => {
  assert.equal(HONEYPOT_INPUT_ATTRS.tabIndex, -1)
  assert.equal(HONEYPOT_INPUT_ATTRS.autoComplete, 'off')
  assert.equal(HONEYPOT_INPUT_ATTRS['aria-hidden'], true)
  // Critically, the field must NOT be type=hidden — bots skip those.
  assert.notEqual(HONEYPOT_INPUT_ATTRS.type, 'hidden')
  assert.equal(HONEYPOT_INPUT_ATTRS.type, 'text')
})

test('CSS removes the field from layout and pointer-events', () => {
  assert.equal(HONEYPOT_INPUT_STYLE.position, 'absolute')
  assert.equal(HONEYPOT_INPUT_STYLE.left, '-9999px')
  assert.equal(HONEYPOT_INPUT_STYLE.opacity, 0)
  assert.equal(HONEYPOT_INPUT_STYLE.pointerEvents, 'none')
})

test('generic error copy does not reveal the trap', () => {
  // Bot mustn't be able to differentiate honeypot rejection from a
  // real auth failure — the copy here is identical to the AuthContext
  // catch-all message.
  assert.match(HONEYPOT_GENERIC_ERROR, /try again/i)
  assert.doesNotMatch(HONEYPOT_GENERIC_ERROR, /honeypot|bot|spam/i)
})
