/**
 * extract-pages.ts — Parse the saved Figma file JSON and extract page/frame structure.
 *
 * Usage: npx tsx scripts/figma/extract-pages.ts
 */

import { readJson, writeJson, FILE_JSON, PAGES_JSON } from './client'
import type { FigmaFile, FigmaNode, PageSummary, FrameSummary } from './types'

function extractFrames(page: FigmaNode): FrameSummary[] {
  if (!page.children) return []
  return page.children.map((child) => ({
    id: child.id,
    name: child.name,
    type: child.type,
    childCount: child.children?.length ?? 0,
    width: child.absoluteBoundingBox?.width ? Math.round(child.absoluteBoundingBox.width) : undefined,
    height: child.absoluteBoundingBox?.height ? Math.round(child.absoluteBoundingBox.height) : undefined,
  }))
}

function main() {
  const data = readJson<FigmaFile>(FILE_JSON)
  const pages = data.document.children || []

  const summary: PageSummary[] = pages.map((page) => ({
    id: page.id,
    name: page.name,
    frames: extractFrames(page),
  }))

  writeJson(PAGES_JSON, summary)

  console.log(`Extracted ${summary.length} pages from "${data.name}"\n`)

  for (const page of summary) {
    console.log(`  ${page.name} (${page.frames.length} frames)`)
    for (const frame of page.frames) {
      const dims = frame.width && frame.height ? ` [${frame.width}x${frame.height}]` : ''
      console.log(`    ${frame.name} — ${frame.type}, ${frame.childCount} children${dims}`)
    }
  }

  console.log(`\nSaved: ${PAGES_JSON}`)
}

main()
