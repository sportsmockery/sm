// Run with: npx tsx --test src/lib/security/__tests__/disposable-email.test.ts
//
// Covers the disposable-email blocker — known-bad domains, normal
// providers, subdomain matching, case insensitivity, and obvious
// malformed inputs.

import { test } from 'node:test'
import { strict as assert } from 'node:assert'
import {
  isDisposableEmail,
  isValidEmail,
  extractDomain,
  setDisposableDomains,
  getDisposableDomainCount,
  DISPOSABLE_EMAIL_ERROR,
} from '../disposable-email'

test('rejects known disposable provider (mailinator)', () => {
  assert.equal(isDisposableEmail('foo@mailinator.com'), true)
})

test('rejects another known disposable provider (guerrillamail)', () => {
  assert.equal(isDisposableEmail('hello@guerrillamail.com'), true)
})

test('accepts normal gmail / outlook / icloud accounts', () => {
  assert.equal(isDisposableEmail('chris@gmail.com'), false)
  assert.equal(isDisposableEmail('user@outlook.com'), false)
  assert.equal(isDisposableEmail('me@icloud.com'), false)
  assert.equal(isDisposableEmail('reporter@sportsmockery.com'), false)
})

test('matches subdomains of disposable hosts (foo.mailinator.com)', () => {
  assert.equal(isDisposableEmail('user@foo.mailinator.com'), true)
  assert.equal(isDisposableEmail('user@a.b.mailinator.com'), true)
})

test('domain matching is case-insensitive', () => {
  assert.equal(isDisposableEmail('user@MAILINATOR.com'), true)
  assert.equal(isDisposableEmail('USER@Mailinator.COM'), true)
})

test('rejects malformed emails (no @, no TLD, empty, whitespace)', () => {
  assert.equal(isValidEmail(''), false)
  assert.equal(isValidEmail('   '), false)
  assert.equal(isValidEmail('foo'), false)
  assert.equal(isValidEmail('foo@'), false)
  assert.equal(isValidEmail('foo@bar'), false)
  assert.equal(isValidEmail('@bar.com'), false)
  assert.equal(isValidEmail('foo@bar.com'), true)
  assert.equal(isValidEmail(undefined as unknown as string), false)
  assert.equal(isValidEmail(null as unknown as string), false)
})

test('extractDomain returns lowercased domain or null', () => {
  assert.equal(extractDomain('Foo@Example.COM'), 'example.com')
  assert.equal(extractDomain('not-an-email'), null)
})

test('isDisposableEmail returns false for malformed input rather than throwing', () => {
  assert.equal(isDisposableEmail('not-an-email'), false)
  assert.equal(isDisposableEmail(''), false)
})

test('bundled list is non-empty and meaningfully sized', () => {
  // Sanity check — if the build pipeline ever drops the file we want to
  // know about it, not silently let every email through.
  assert.ok(getDisposableDomainCount() > 1000, 'bundled list should have >1000 domains')
})

test('setDisposableDomains refuses suspiciously small lists', () => {
  const before = getDisposableDomainCount()
  const accepted = setDisposableDomains(['only.example', 'another.example'])
  assert.equal(accepted, 0, 'should refuse a tiny list')
  assert.equal(getDisposableDomainCount(), before, 'list should not have shrunk')
})

test('error copy matches the user-facing message', () => {
  assert.match(DISPOSABLE_EMAIL_ERROR, /permanent email/)
})
