#!/usr/bin/env npx ts-node

/**
 * Scout QA Automated Test Runner
 *
 * Reads questions 1-200 from Scout_QA_Test_Instructions.md
 * Calls POST https://test.sportsmockery.com/api/ask-ai for each
 * Applies deterministic PASS/FAIL checks
 * Writes failures to /AskAI_Wrong.md
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

// ES module compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const SM_DATA_LAB_PATH = '/Users/christopherburhans/Documents/projects/sm-data-lab';
const INSTRUCTIONS_FILE = path.join(SM_DATA_LAB_PATH, 'docs/Scout_QA_Test_Instructions.md');
const OUTPUT_FILE = path.join(__dirname, '../AskAI_Wrong.md');
const API_ENDPOINT = 'https://test.sportsmockery.com/api/ask-ai';
const DELAY_BETWEEN_REQUESTS_MS = 1500;

// Failure reason types
type FailureReason =
  | 'CITATIONS_PRESENT'
  | 'DB_LEAK'
  | 'NO_TABLE_FOR_STATS'
  | 'WRONG_SOURCE_FLAG'
  | 'NAME_OR_CLASSIFICATION_FAIL'
  | 'SPEC_VIOLATION_BETTING'
  | 'SPEC_VIOLATION_GOSSIP'
  | 'SPEC_VIOLATION_SELF_REFERENCE'
  | 'SPEC_VIOLATION_PRONOUN_RESOLUTION';

interface TestResult {
  questionNumber: number;
  question: string;
  response: string;
  source: string;
  passed: boolean;
  failureReasons: FailureReason[];
  sessionId?: string;
}

interface APIResponse {
  response?: string;
  answer?: string;
  source?: string;
  sessionId?: string;
  sessionContext?: {
    player?: string;
    team?: string;
    season?: string | number;
    sport?: string;
  };
  error?: string;
}

// Parse questions from markdown file
function parseQuestions(content: string): Map<number, string> {
  const questions = new Map<number, string>();
  const lines = content.split('\n');

  // Regex patterns for different question formats
  // Format 1: "1. How many passing touchdowns..."
  // Format 2: "101. Using only last season's data..."
  const questionPattern = /^(\d+)\.\s+(.+)$/;

  for (const line of lines) {
    const trimmedLine = line.trim();
    const match = trimmedLine.match(questionPattern);

    if (match) {
      const num = parseInt(match[1], 10);
      const question = match[2].trim();

      // Only include questions 1-200
      if (num >= 1 && num <= 200) {
        questions.set(num, question);
      }
    }
  }

  return questions;
}

// Check for citation markers [1], [2], [1][2], etc.
function hasCitations(text: string): boolean {
  return /\[\d+\]/.test(text);
}

// Check for database/SQL error leaks
function hasDBLeak(text: string): boolean {
  const dbLeakPatterns = [
    /database\s*(error|snag|issue|problem)/i,
    /sql\s*(error|failed|issue)/i,
    /table\s*error/i,
    /query\s*(failed|error)/i,
    /connection\s*(failed|error)/i,
    /\[atabase\s*error\]/i, // Partial match for truncated errors
  ];

  return dbLeakPatterns.some(pattern => pattern.test(text));
}

// Check if this is a stats question (should have a table)
function isStatsQuestion(question: string): boolean {
  const statsKeywords = [
    /\bavg\b/i,
    /\baverage\b/i,
    /\bstats?\b/i,
    /\bgame\s+by\s+game\b/i,
    /\bppg\b/i,
    /\breb\b/i,
    /\bast\b/i,
    /\bpts\b/i,
    /\bgoals?\b/i,
    /\bassists?\b/i,
    /\bpoints?\b/i,
    /how\s+many\s+(touchdowns?|tds?|yards?|yds?|ints?|interceptions?|sacks?|homers?|home\s+runs?|rbis?|wins?)/i,
    /\bera\b/i,
    /\bwhip\b/i,
    /\bops\b/i,
    /\bts%\b/i,
    /\bqbr\b/i,
    /\bpasser\s+rtg\b/i,
    /\bxg\b/i,
    /\bcorsi\b/i,
  ];

  return statsKeywords.some(pattern => pattern.test(question));
}

// Check if response contains a markdown table
function hasTable(text: string): boolean {
  // Markdown tables have | characters and ---|--- patterns
  return /\|[^|]+\|/.test(text) && /[-]{3,}/.test(text);
}

// Check for "could not determine team or sport" error
function hasClassificationFailure(text: string): boolean {
  const patterns = [
    /could\s+not\s+determine\s+team/i,
    /could\s+not\s+determine.*sport/i,
    /couldn't\s+determine\s+team/i,
    /unable\s+to\s+determine.*team/i,
  ];

  return patterns.some(pattern => pattern.test(text));
}

// Check if typos are being called out instead of silently corrected
function hasTypoCallout(text: string): boolean {
  const patterns = [
    /did\s+you\s+mean/i,
    /i\s+notice.*misspelled/i,
    /i\s+see.*typo/i,
    /did\s+you\s+mean.*instead/i,
  ];

  return patterns.some(pattern => pattern.test(text));
}

// Check for betting-related spec violations (questions 171-180)
function hasBettingSpecViolation(question: string, response: string): boolean {
  const isBettingQuestion = /bet|parlay|spread|over\/under|odds|gambling|wager|lock\s+of\s+the\s+week/i.test(question);

  if (!isBettingQuestion) return false;

  // Should NOT give direct betting advice
  const badPatterns = [
    /you\s+should\s+(bet|take|hammer)/i,
    /i\s+recommend\s+(betting|taking)/i,
    /go\s+with\s+the\s+(over|under|spread)/i,
    /safe\s+bet/i,
    /easy\s+money/i,
  ];

  return badPatterns.some(pattern => pattern.test(response));
}

// Check for gossip-related spec violations (questions 181-190)
function hasGossipSpecViolation(question: string, response: string): boolean {
  const isGossipQuestion = /cheat|drama|arrested|scandal|toxic|embarrassing|party|personal\s+life|instagram/i.test(question);

  if (!isGossipQuestion) return false;

  // Should redirect to stats/performance, not engage with gossip
  const badPatterns = [
    /reportedly\s+(cheated|dated|arrested)/i,
    /according\s+to\s+rumors/i,
    /sources\s+say.*personal/i,
  ];

  return badPatterns.some(pattern => pattern.test(response));
}

// Check for self-reference spec violations (questions 191-200)
function hasSelfReferenceViolation(question: string, response: string): boolean {
  const isSelfRefQuestion = /as\s+an\s+ai|your\s+(personal\s+)?opinion|how\s+sure\s+are\s+you|are\s+you\s+sure/i.test(question);

  if (!isSelfRefQuestion) return false;

  // Should NOT say "As an AI" or similar
  const badPatterns = [
    /as\s+an\s+ai/i,
    /i\s+am\s+an?\s+(ai|artificial|language\s+model)/i,
    /my\s+personal\s+opinion/i,
    /i\s+personally\s+think/i,
  ];

  return badPatterns.some(pattern => pattern.test(response));
}

// Check for pronoun resolution failures (follow-up questions)
function isPronounResolutionQuestion(question: string): boolean {
  return /\b(he|she|his|her|they|their|that\s+player|that\s+team)\b/i.test(question) &&
         !/who\s+is\s+(he|she)/i.test(question); // Not asking "who is he"
}

function hasPronounResolutionFailure(question: string, response: string): boolean {
  if (!isPronounResolutionQuestion(question)) return false;

  const failurePatterns = [
    /who\s+.*are\s+you\s+(asking|referring)/i,
    /need\s+to\s+know\s+who/i,
    /too\s+vague/i,
    /which\s+player/i,
    /please\s+specify/i,
  ];

  return failurePatterns.some(pattern => pattern.test(response));
}

// Run all checks on a response
function checkResponse(questionNumber: number, question: string, response: string, source: string): TestResult {
  const failureReasons: FailureReason[] = [];

  // Check 1: Citations present
  if (hasCitations(response)) {
    failureReasons.push('CITATIONS_PRESENT');
  }

  // Check 2: Database leak
  if (hasDBLeak(response)) {
    failureReasons.push('DB_LEAK');
  }

  // Check 3: Stats question without table
  if (isStatsQuestion(question) && !hasTable(response)) {
    failureReasons.push('NO_TABLE_FOR_STATS');
  }

  // Check 4: Source is "error" but response is substantive
  if (source === 'error' && response.length > 50) {
    failureReasons.push('WRONG_SOURCE_FLAG');
  }

  // Check 5: Classification or typo callout failure
  if (hasClassificationFailure(response) || hasTypoCallout(response)) {
    failureReasons.push('NAME_OR_CLASSIFICATION_FAIL');
  }

  // Check 6: Spec violations for advanced questions (101-200)
  if (questionNumber >= 171 && questionNumber <= 180 && hasBettingSpecViolation(question, response)) {
    failureReasons.push('SPEC_VIOLATION_BETTING');
  }

  if (questionNumber >= 181 && questionNumber <= 190 && hasGossipSpecViolation(question, response)) {
    failureReasons.push('SPEC_VIOLATION_GOSSIP');
  }

  if (questionNumber >= 191 && questionNumber <= 200 && hasSelfReferenceViolation(question, response)) {
    failureReasons.push('SPEC_VIOLATION_SELF_REFERENCE');
  }

  // Check 7: Pronoun resolution failures (applicable to follow-up style questions)
  if (hasPronounResolutionFailure(question, response)) {
    failureReasons.push('SPEC_VIOLATION_PRONOUN_RESOLUTION');
  }

  return {
    questionNumber,
    question,
    response,
    source,
    passed: failureReasons.length === 0,
    failureReasons,
  };
}

// Call the Ask AI API
async function callAskAI(query: string, sessionId?: string): Promise<APIResponse> {
  try {
    const body: { query: string; sessionId?: string } = { query };
    if (sessionId) {
      body.sessionId = sessionId;
    }

    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      return {
        response: `HTTP Error: ${response.status} ${response.statusText}`,
        source: 'error',
      };
    }

    const data = await response.json();
    return {
      response: data.response || data.answer || '',
      source: data.source || 'unknown',
      sessionId: data.sessionId,
      sessionContext: data.sessionContext,
    };
  } catch (error) {
    return {
      response: `Network Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      source: 'error',
    };
  }
}

// Format a single failure entry for the markdown file
function formatFailureEntry(result: TestResult): string {
  const now = new Date();
  const timestamp = now.toLocaleString('en-US', {
    timeZone: 'America/Chicago',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).replace(',', '');

  const reasonsStr = result.failureReasons.join(', ');
  const shortTitle = `Q${result.questionNumber}: ${reasonsStr}`;

  // Truncate response for display (first 300 chars)
  const excerpt = result.response.length > 300
    ? result.response.substring(0, 300) + '...'
    : result.response;

  // Determine severity based on failure type
  let severity = 'Medium';
  if (result.failureReasons.includes('DB_LEAK') ||
      result.failureReasons.includes('NAME_OR_CLASSIFICATION_FAIL')) {
    severity = 'High';
  } else if (result.failureReasons.includes('CITATIONS_PRESENT')) {
    severity = 'High';
  }

  // Determine expected behavior based on failure type
  const expectedBehaviors: string[] = [];
  if (result.failureReasons.includes('CITATIONS_PRESENT')) {
    expectedBehaviors.push('No citation markers [1][2] in response text');
  }
  if (result.failureReasons.includes('DB_LEAK')) {
    expectedBehaviors.push('No database/SQL errors exposed to user');
  }
  if (result.failureReasons.includes('NO_TABLE_FOR_STATS')) {
    expectedBehaviors.push('Stats questions should include markdown tables');
  }
  if (result.failureReasons.includes('WRONG_SOURCE_FLAG')) {
    expectedBehaviors.push('Source should not be "error" when answer is provided');
  }
  if (result.failureReasons.includes('NAME_OR_CLASSIFICATION_FAIL')) {
    expectedBehaviors.push('Should recognize Chicago players/teams from typos');
    expectedBehaviors.push('Should silently correct misspellings, not call them out');
  }
  if (result.failureReasons.includes('SPEC_VIOLATION_PRONOUN_RESOLUTION')) {
    expectedBehaviors.push('Should resolve pronouns (he/his/they) from session context');
  }

  // Suggested fixes
  const suggestedFixes: string[] = [];
  if (result.failureReasons.includes('CITATIONS_PRESENT')) {
    suggestedFixes.push('Strip [\\d+] markers in post-processing');
  }
  if (result.failureReasons.includes('DB_LEAK')) {
    suggestedFixes.push('Sanitize error messages before returning to user');
  }
  if (result.failureReasons.includes('NO_TABLE_FOR_STATS')) {
    suggestedFixes.push('Add table formatting logic to stats responses');
  }
  if (result.failureReasons.includes('WRONG_SOURCE_FLAG')) {
    suggestedFixes.push('Only return source="error" when response is truly empty/failed');
  }
  if (result.failureReasons.includes('NAME_OR_CLASSIFICATION_FAIL')) {
    suggestedFixes.push('Improve name normalization in classifier');
  }
  if (result.failureReasons.includes('SPEC_VIOLATION_PRONOUN_RESOLUTION')) {
    suggestedFixes.push('Apply sessionContext to resolve pronouns before query processing');
  }

  return `## [${timestamp} CST] - ${shortTitle}

**User prompt(s):**
1. "${result.question}"

**Ask AI answer (relevant excerpt):**
> "${excerpt}"

**Source:** \`${result.source}\`

**Expected behavior:**
${expectedBehaviors.map(b => `- ${b}`).join('\n')}

**What went wrong:**
- ${result.failureReasons.join('\n- ')}

**Severity:** ${severity}

**Suggested fix:**
${suggestedFixes.map(f => `- ${f}`).join('\n')}
---
`;
}

// Generate summary section
function generateSummary(results: TestResult[]): string {
  const totalQuestions = results.length;
  const passedCount = results.filter(r => r.passed).length;
  const failedCount = totalQuestions - passedCount;

  // Count by failure reason
  const reasonCounts = new Map<FailureReason, number>();
  for (const result of results) {
    for (const reason of result.failureReasons) {
      reasonCounts.set(reason, (reasonCounts.get(reason) || 0) + 1);
    }
  }

  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', {
    timeZone: 'America/Chicago',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  let summary = `# Ask AI (Scout) - QA Test Failure Log

> **Test Date:** ${dateStr}
> **Test Target:** ${API_ENDPOINT}
> **Total Questions:** ${totalQuestions}
> **Pass:** ${passedCount} | **Fail:** ${failedCount}

---

## Summary of Failures

| Issue Type | Count | Severity |
|------------|-------|----------|
`;

  const severityMap: Record<FailureReason, string> = {
    'CITATIONS_PRESENT': 'High',
    'DB_LEAK': 'High',
    'NO_TABLE_FOR_STATS': 'Medium',
    'WRONG_SOURCE_FLAG': 'Medium',
    'NAME_OR_CLASSIFICATION_FAIL': 'High',
    'SPEC_VIOLATION_BETTING': 'Medium',
    'SPEC_VIOLATION_GOSSIP': 'Medium',
    'SPEC_VIOLATION_SELF_REFERENCE': 'Low',
    'SPEC_VIOLATION_PRONOUN_RESOLUTION': 'High',
  };

  for (const [reason, count] of reasonCounts.entries()) {
    summary += `| ${reason} | ${count} | ${severityMap[reason]} |\n`;
  }

  summary += `\n---\n\n`;

  return summary;
}

// Sleep helper
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Main function
async function main() {
  console.log('🏈 Scout QA Automated Test Runner\n');

  // Read instructions file
  console.log('📖 Reading questions from Scout_QA_Test_Instructions.md...');
  let instructionsContent: string;
  try {
    instructionsContent = fs.readFileSync(INSTRUCTIONS_FILE, 'utf-8');
  } catch (error) {
    console.error(`❌ Could not read instructions file: ${INSTRUCTIONS_FILE}`);
    console.error(error);
    process.exit(1);
  }

  // Parse questions
  const questions = parseQuestions(instructionsContent);
  console.log(`✅ Found ${questions.size} questions\n`);

  if (questions.size === 0) {
    console.error('❌ No questions found in the file');
    process.exit(1);
  }

  // Sort question numbers
  const sortedNumbers = Array.from(questions.keys()).sort((a, b) => a - b);

  // Run tests
  const results: TestResult[] = [];
  let sessionId: string | undefined;

  console.log('🚀 Starting tests...\n');

  for (const qNum of sortedNumbers) {
    const question = questions.get(qNum)!;

    process.stdout.write(`Q${qNum}: ${question.substring(0, 50)}... `);

    // Call API
    const apiResponse = await callAskAI(question, sessionId);

    // Update session ID for follow-up context
    if (apiResponse.sessionId) {
      sessionId = apiResponse.sessionId;
    }

    // Check response
    const result = checkResponse(
      qNum,
      question,
      apiResponse.response || '',
      apiResponse.source || 'unknown'
    );
    result.sessionId = sessionId;

    results.push(result);

    if (result.passed) {
      console.log('✅ PASS');
    } else {
      console.log(`❌ FAIL (${result.failureReasons.join(', ')})`);
    }

    // Delay between requests
    await sleep(DELAY_BETWEEN_REQUESTS_MS);
  }

  // Generate output
  console.log('\n📝 Generating failure report...\n');

  const failedResults = results.filter(r => !r.passed);

  let output = generateSummary(results);

  // Add individual failure entries
  for (const result of failedResults) {
    output += formatFailureEntry(result);
    output += '\n';
  }

  // Write to file
  fs.writeFileSync(OUTPUT_FILE, output, 'utf-8');

  // Print summary
  const passCount = results.filter(r => r.passed).length;
  const failCount = results.length - passCount;

  console.log('═══════════════════════════════════════════════');
  console.log(`📊 RESULTS: ${passCount} PASS / ${failCount} FAIL (${results.length} total)`);
  console.log('═══════════════════════════════════════════════\n');

  if (failCount > 0) {
    console.log(`📄 Failure details written to: ${OUTPUT_FILE}`);
  } else {
    console.log('🎉 All tests passed!');
  }

  // Exit with error code if there were failures
  process.exit(failCount > 0 ? 1 : 0);
}

// Run
main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
