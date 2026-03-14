/**
 * Transform the last 10 imported WP posts into structured block format.
 * Run with: node scripts/transform-latest-posts.mjs
 *
 * This script is reusable — run it after any WP sync to transform new posts.
 */

// ─── Inline transform logic (no TS compilation needed) ───

function stripHtml(html) {
  return html
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .trim()
}

function wordCount(text) {
  return text.split(/\s+/).filter(Boolean).length
}

function blockId(prefix, index) {
  return `${prefix}-${index}-${Date.now().toString(36)}`
}

function parseWpHtml(html) {
  const elements = []
  const cleaned = html.replace(/<!--\s*\/?wp:\w[\w-]*(?:\s+\{[^}]*\})?\s*-->/g, '').trim()
  const blockRegex = /<(p|h[1-6]|blockquote|ul|ol|figure|img)[^>]*>([\s\S]*?)<\/\1>|<(img)\s+[^>]*\/?>/gi
  let match
  while ((match = blockRegex.exec(cleaned)) !== null) {
    const tag = (match[1] || match[3] || 'p').toLowerCase()
    const content = match[2] || ''
    const rawHtml = match[0]
    if (tag === 'p' && !stripHtml(content).trim()) continue
    elements.push({ tag, content, rawHtml })
  }
  if (elements.length === 0 && cleaned.length > 0) {
    const pSplit = cleaned.split(/<\/?p[^>]*>/i).filter(s => stripHtml(s).trim())
    pSplit.forEach((text) => {
      elements.push({ tag: 'p', content: text.trim(), rawHtml: `<p>${text.trim()}</p>` })
    })
  }
  return elements
}

function extractQuotes(elements) {
  const quotes = []
  for (const el of elements) {
    if (el.tag === 'blockquote') {
      const text = stripHtml(el.content)
      if (text.length > 10) quotes.push({ text, speaker: '' })
    }
  }
  for (const el of elements) {
    if (el.tag !== 'p') continue
    const plain = stripHtml(el.content)
    const quoteMatch = plain.match(/["\u201C]([^"\u201D]{20,})["\u201D]\s*(?:said|according to|per|told)\s+([^.]+)/i)
    if (quoteMatch && !quotes.some(q => q.text === quoteMatch[1])) {
      quotes.push({ text: quoteMatch[1].trim(), speaker: quoteMatch[2].trim() })
    }
  }
  return quotes.slice(0, 2)
}

function generateKeyTakeaways(plainText, title) {
  const sentences = plainText
    .replace(/\s+/g, ' ')
    .split(/(?<=[.!?])\s+/)
    .map(s => s.trim())
    .filter(s => s.length > 30 && s.length < 250)

  if (sentences.length < 3) return []

  const scored = sentences.map(sentence => {
    let score = 0
    if (/\d+/.test(sentence)) score += 3
    if (/key|important|significant|major|critical|notably|reportedly|according|sources/i.test(sentence)) score += 2
    const idx = sentences.indexOf(sentence)
    if (idx > 1 && idx < sentences.length - 1) score += 1
    if (sentence.length < 50) score -= 1
    const titleWords = title.toLowerCase().split(/\s+/)
    const overlap = titleWords.filter(w => w.length > 3 && sentence.toLowerCase().includes(w)).length
    if (overlap > titleWords.length * 0.7) score -= 3
    return { sentence, score }
  })

  const top = scored
    .sort((a, b) => b.score - a.score)
    .slice(0, 6)
    .sort((a, b) => sentences.indexOf(a.sentence) - sentences.indexOf(b.sentence))
    .slice(0, 3)

  return top.map(t => t.sentence)
}

function transformPostContent(rawContent, title) {
  const elements = parseWpHtml(rawContent)
  const plainText = elements.map(el => stripHtml(el.content)).join(' ')
  const totalWords = wordCount(plainText)
  const blocks = []
  let blockIndex = 0

  const quotesFound = extractQuotes(elements)
  let quoteInserted = false
  const paragraphs = elements.filter(el => el.tag === 'p')
  const introCount = Math.min(paragraphs.length <= 3 ? 1 : 2, paragraphs.length)
  let paragraphIndex = 0

  for (const el of elements) {
    switch (el.tag) {
      case 'p': {
        const text = stripHtml(el.content).trim()
        if (!text) break
        const html = el.content
          .replace(/<a\s+href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi, '<a href="$1">$2</a>')
          .trim()
        blocks.push({ id: blockId('p', blockIndex++), type: 'paragraph', data: { html } })
        paragraphIndex++
        if (!quoteInserted && quotesFound.length > 0 && paragraphIndex === Math.min(3, paragraphs.length)) {
          const q = quotesFound[0]
          blocks.push({ id: blockId('quote', blockIndex++), type: 'quote', data: { text: q.text, speaker: q.speaker, team: '' } })
          quoteInserted = true
        }
        break
      }
      case 'h1': case 'h2': case 'h3': case 'h4': case 'h5': case 'h6': {
        const text = stripHtml(el.content).trim()
        if (!text) break
        const level = Math.max(2, Math.min(4, parseInt(el.tag[1])))
        blocks.push({ id: blockId('h', blockIndex++), type: 'heading', data: { text, level } })
        break
      }
      case 'figure': case 'img': {
        const srcMatch = el.rawHtml.match(/src="([^"]+)"/i)
        const altMatch = el.rawHtml.match(/alt="([^"]*)"?/i)
        const captionMatch = el.rawHtml.match(/<figcaption[^>]*>([\s\S]*?)<\/figcaption>/i)
        if (srcMatch) {
          blocks.push({ id: blockId('img', blockIndex++), type: 'image', data: { src: srcMatch[1], alt: altMatch ? stripHtml(altMatch[1]) : '', caption: captionMatch ? stripHtml(captionMatch[1]) : undefined } })
        }
        break
      }
    }
  }

  if (blocks.length === 0 && plainText.trim()) {
    blocks.push({ id: blockId('p', 0), type: 'paragraph', data: { html: `<p>${plainText}</p>` } })
  }

  const keyTakeaways = totalWords >= 250 ? generateKeyTakeaways(plainText, title) : []

  if (keyTakeaways.length === 3) {
    const takeawayBlocks = [
      { id: blockId('h-takeaway', blockIndex++), type: 'heading', data: { text: 'Key Takeaways', level: 3 } },
      { id: blockId('takeaways', blockIndex++), type: 'paragraph', data: { html: '<ul>' + keyTakeaways.map(t => `<li>${t}</li>`).join('') + '</ul>' } },
    ]
    const insertAt = Math.min(introCount, blocks.length)
    blocks.splice(insertAt, 0, ...takeawayBlocks)
  }

  const excerptText = plainText.slice(0, 160).trimEnd()
  const excerpt = excerptText.length < plainText.length ? excerptText + '...' : excerptText

  return {
    document: { version: 1, template: 'standard-news', blocks },
    excerpt,
    keyTakeaways,
    wordCount: totalWords,
  }
}

// ─── Main execution ───

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

config({ path: '.env.local' })

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !key) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local')
  process.exit(1)
}

const supabase = createClient(url, key)

async function main() {
  console.log('Fetching last 10 untransformed published posts...')

  const { data: posts, error } = await supabase
    .from('sm_posts')
    .select('id, slug, title, content, excerpt, featured_image, category_id, published_at')
    .eq('status', 'published')
    .is('template_version', null)
    .order('published_at', { ascending: false })
    .limit(10)

  if (error) {
    console.error('Failed to fetch posts:', error.message)
    process.exit(1)
  }

  if (!posts || posts.length === 0) {
    console.log('No untransformed posts found.')
    return
  }

  console.log(`Found ${posts.length} posts to transform.\n`)

  let successCount = 0
  let errorCount = 0

  for (const post of posts) {
    try {
      // Skip if already JSON content
      if (post.content.trim().startsWith('{') && post.content.includes('"version"')) {
        console.log(`  SKIP: ${post.slug} (already transformed)`)
        continue
      }

      const result = transformPostContent(post.content, post.title)

      const { error: updateError } = await supabase
        .from('sm_posts')
        .update({
          content: JSON.stringify(result.document),
          excerpt: post.excerpt || result.excerpt,
          template_version: 1,
          updated_at: new Date().toISOString(),
        })
        .eq('id', post.id)

      if (updateError) {
        console.error(`  FAIL: ${post.slug} — ${updateError.message}`)
        errorCount++
      } else {
        console.log(`  OK: ${post.slug} (${result.wordCount} words, ${result.keyTakeaways.length} takeaways, ${result.document.blocks.length} blocks)`)
        successCount++
      }
    } catch (err) {
      console.error(`  FAIL: ${post.slug} — ${err.message}`)
      errorCount++
    }
  }

  console.log(`\nDone. Transformed: ${successCount}, Errors: ${errorCount}`)
}

main().catch(err => {
  console.error('Script failed:', err)
  process.exit(1)
})
