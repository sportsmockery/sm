/**
 * Test script for chat moderation rules
 * Run with: npx tsx scripts/test-moderation.ts
 */

import { moderateMessage } from '../src/lib/chat/moderation'

interface TestCase {
  input: string
  expected: 'approve' | 'block' | 'shadow_block' | 'warn' | 'ban'
  description: string
}

// Test cases
const testCases: TestCase[] = [
  // Should be APPROVED
  { input: "Let's go Bears!", expected: 'approve', description: 'Normal message' },
  { input: "They killed it last night!", expected: 'approve', description: 'Sports context - killed it' },
  { input: "What a choke job in the 4th quarter", expected: 'approve', description: 'Sports context - choke' },
  { input: "FTP!", expected: 'approve', description: 'Sports rivalry acronym' },
  { input: "The defense got destroyed", expected: 'approve', description: 'Sports context - destroyed' },
  { input: "Check out this play on https://espn.com/video/123", expected: 'approve', description: 'Whitelisted domain' },
  { input: "Great game! The Bulls dominated!", expected: 'approve', description: 'Normal enthusiastic message' },
  { input: "He's totally washed", expected: 'approve', description: 'Sports slang - washed' },

  // Should be BLOCKED (profanity)
  { input: "What the f*ck was that call?", expected: 'block', description: 'Profanity with asterisk' },
  { input: "This team is sh!t", expected: 'block', description: 'Profanity with character swap' },
  { input: "You're an a$$hole", expected: 'block', description: 'Profanity bypass attempt' },

  // Should be BLOCKED (gambling)
  { input: "Put your bets on DraftKings now!", expected: 'block', description: 'Gambling promotion - DraftKings' },
  { input: "Free picks for betting odds!", expected: 'block', description: 'Gambling content' },

  // Should be BLOCKED (sexual content)
  { input: "Check out my OnlyFans", expected: 'block', description: 'Adult content promotion' },

  // Should be SHADOW_BLOCKED (spam/sales)
  { input: "DM me to make money fast!", expected: 'shadow_block', description: 'Spam message' },
  { input: "Free crypto giveaway bitcoin airdrop!", expected: 'shadow_block', description: 'Crypto spam' },
  { input: "Buy now! Limited time discount code!", expected: 'shadow_block', description: 'Sales spam' },

  // Should be BLOCKED (unauthorized links)
  { input: "Check this out: https://random-site.com/page", expected: 'block', description: 'Unauthorized link' },

  // Should be BANNED (violence/threats)
  { input: "kys", expected: 'ban', description: 'Self-harm encouragement' },
  { input: "I'm gonna kill you", expected: 'ban', description: 'Death threat' },
  { input: "kill yourself loser", expected: 'ban', description: 'Explicit self-harm' },

  // Edge cases
  { input: "", expected: 'block', description: 'Empty message' },
  { input: "A".repeat(1001), expected: 'block', description: 'Too long message (1001 chars)' },
  { input: "THIS IS ALL CAPS AND VERY LOUD!!!!", expected: 'warn', description: 'All caps abuse' },
]

console.log('\n========================================')
console.log('CHAT MODERATION TEST RESULTS')
console.log('========================================\n')

let passed = 0
let failed = 0

for (const test of testCases) {
  const result = moderateMessage(test.input)
  const actualAction = result.action
  const testPassed = actualAction === test.expected

  const truncatedInput = test.input.length > 50
    ? test.input.slice(0, 50) + '...'
    : test.input

  if (testPassed) {
    passed++
    console.log(`✅ PASS: ${test.description}`)
    console.log(`   Input: "${truncatedInput}"`)
    console.log(`   Expected: ${test.expected}, Got: ${actualAction}`)
  } else {
    failed++
    console.log(`❌ FAIL: ${test.description}`)
    console.log(`   Input: "${truncatedInput}"`)
    console.log(`   Expected: ${test.expected}, Got: ${actualAction}`)
    console.log(`   Flags: ${result.flags.join(', ')}`)
    console.log(`   Score: ${result.score}`)
  }
  console.log('')
}

console.log('========================================')
console.log(`SUMMARY: ${passed} passed, ${failed} failed out of ${testCases.length} tests`)
console.log('========================================\n')

process.exit(failed > 0 ? 1 : 0)
