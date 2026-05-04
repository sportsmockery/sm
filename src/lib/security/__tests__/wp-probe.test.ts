// Run with: npx tsx --test src/lib/security/__tests__/wp-probe.test.ts
//
// Asserts the WordPress / secret-probe path matcher returns 410-eligible
// for every variant we've seen probed in production logs, and does NOT
// catch legitimate routes.

import { test } from 'node:test'
import { strict as assert } from 'node:assert'
import { isWordPressProbe } from '../wp-probe'

test('catches literal WP entry endpoints', () => {
  assert.equal(isWordPressProbe('/wp-login.php'), true)
  assert.equal(isWordPressProbe('/wp-login'), true)
  assert.equal(isWordPressProbe('/xmlrpc.php'), true)
  assert.equal(isWordPressProbe('/wp-cron.php'), true)
  assert.equal(isWordPressProbe('/wp-config.php'), true)
  assert.equal(isWordPressProbe('/wp-config.php.bak'), true)
  assert.equal(isWordPressProbe('/wp-config-sample.php'), true)
})

test('catches /wp-admin and any subpath', () => {
  assert.equal(isWordPressProbe('/wp-admin'), true)
  assert.equal(isWordPressProbe('/wp-admin/'), true)
  assert.equal(isWordPressProbe('/wp-admin/install.php'), true)
  assert.equal(isWordPressProbe('/wp-admin/network/'), true)
  assert.equal(isWordPressProbe('/wp-admin.php'), true)
})

// Live-probe gap from PR #100: /wp-content (no slash) was rendering the
// Next.js shell as a soft-200. Vercel's auto trailing-slash 308 was sending
// `/wp-content/` to `/wp-content`, which the old Set-only matcher missed.
test('catches /wp-content with or without trailing slash and any subpath', () => {
  assert.equal(isWordPressProbe('/wp-content'), true)
  assert.equal(isWordPressProbe('/wp-content/'), true)
  assert.equal(isWordPressProbe('/wp-content/uploads'), true)
  assert.equal(isWordPressProbe('/wp-content/uploads/'), true)
  assert.equal(isWordPressProbe('/wp-content/plugins/'), true)
  assert.equal(isWordPressProbe('/wp-content/plugins/akismet/akismet.php'), true)
  assert.equal(isWordPressProbe('/wp-content/themes/twentytwenty/style.css'), true)
  assert.equal(isWordPressProbe('/wp-content/debug.log'), true)
})

test('catches /wp-includes with or without trailing slash and any subpath', () => {
  assert.equal(isWordPressProbe('/wp-includes'), true)
  assert.equal(isWordPressProbe('/wp-includes/'), true)
  assert.equal(isWordPressProbe('/wp-includes/version.php'), true)
})

// Live-probe gap: /wordpress (no slash) was a soft-200, and
// /wordpress/wp-login.php looked like a live WP login page.
test('catches /wordpress with or without trailing slash and any subpath', () => {
  assert.equal(isWordPressProbe('/wordpress'), true)
  assert.equal(isWordPressProbe('/wordpress/'), true)
  assert.equal(isWordPressProbe('/wordpress/wp-login.php'), true)
  assert.equal(isWordPressProbe('/wordpress/wp-admin'), true)
  assert.equal(isWordPressProbe('/wordpress/anything/here'), true)
})

test('catches dotfile / secret probes', () => {
  assert.equal(isWordPressProbe('/.env'), true)
  assert.equal(isWordPressProbe('/.env.local'), true)
  assert.equal(isWordPressProbe('/.env.production'), true)
  assert.equal(isWordPressProbe('/.htaccess'), true)
  assert.equal(isWordPressProbe('/.git'), true)
  assert.equal(isWordPressProbe('/.git/'), true)
  assert.equal(isWordPressProbe('/.git/HEAD'), true)
  assert.equal(isWordPressProbe('/.git/config'), true)
  assert.equal(isWordPressProbe('/.aws/credentials'), true)
})

test('catches WP discovery endpoints', () => {
  assert.equal(isWordPressProbe('/readme.html'), true)
  assert.equal(isWordPressProbe('/license.txt'), true)
})

test('matches case-insensitively (scanners often randomize case)', () => {
  assert.equal(isWordPressProbe('/WP-ADMIN'), true)
  assert.equal(isWordPressProbe('/Wp-Content/uploads'), true)
  assert.equal(isWordPressProbe('/WordPress/'), true)
})

test('does NOT match legitimate routes that share a prefix', () => {
  // Critical: prefix regex must use `(?:\/|$)` so it doesn't catch
  // routes that start with the probe name followed by other letters.
  assert.equal(isWordPressProbe('/wordpresses'), false)
  assert.equal(isWordPressProbe('/wp-administrator'), false)
  assert.equal(isWordPressProbe('/wp-includesfoo'), false)
  assert.equal(isWordPressProbe('/wp-contently'), false)
})

test('does NOT match the homepage or normal article paths', () => {
  assert.equal(isWordPressProbe('/'), false)
  assert.equal(isWordPressProbe('/home'), false)
  assert.equal(isWordPressProbe('/chicago-bears'), false)
  assert.equal(isWordPressProbe('/chicago-bears/roster'), false)
  assert.equal(isWordPressProbe('/news/some-article-slug'), false)
  assert.equal(isWordPressProbe('/admin'), false) // /admin is a real route, not /wp-admin
  assert.equal(isWordPressProbe('/admin/posts'), false)
})

test('handles bad input gracefully', () => {
  assert.equal(isWordPressProbe(''), false)
  // @ts-expect-error — runtime guard for non-string input
  assert.equal(isWordPressProbe(null), false)
  // @ts-expect-error — runtime guard for non-string input
  assert.equal(isWordPressProbe(undefined), false)
})
