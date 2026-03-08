/**
 * sync-summary.ts — Generate a human-readable summary of the Figma file contents.
 *
 * Usage: npx tsx scripts/figma/sync-summary.ts
 */

import { readJson, writeJson, FILE_JSON, SUMMARY_JSON } from './client'
import type { FigmaFile, FigmaNode, SyncSummary } from './types'

function findComponents(node: FigmaNode): string[] {
  const names: string[] = []
  if (node.type === 'COMPONENT' || node.type === 'COMPONENT_SET') names.push(node.name)
  if (node.children) node.children.forEach((c) => names.push(...findComponents(c)))
  return names
}

function countExportable(node: FigmaNode): number {
  let count = node.exportSettings?.length ? 1 : 0
  if (node.children) node.children.forEach((c) => { count += countExportable(c) })
  return count
}

function main() {
  const data = readJson<FigmaFile>(FILE_JSON)
  const pages = data.document.children || []

  const styleCounts = { fill: 0, text: 0, effect: 0, grid: 0 }
  for (const style of Object.values(data.styles || {})) {
    const key = style.styleType.toLowerCase() as keyof typeof styleCounts
    if (key in styleCounts) styleCounts[key]++
  }

  const componentNames = findComponents(data.document)
  const exportableCount = countExportable(data.document)

  const pageDetails = pages.map((page) => {
    const frames = (page.children || []).filter(
      (c) => ['FRAME', 'COMPONENT', 'COMPONENT_SET', 'GROUP'].includes(c.type)
    )
    return {
      name: page.name,
      frameCount: frames.length,
      frameNames: frames.map((f) => f.name),
    }
  })

  const totalFrames = pageDetails.reduce((sum, p) => sum + p.frameCount, 0)

  const summary: SyncSummary = {
    fileName: data.name,
    lastModified: data.lastModified,
    syncedAt: new Date().toISOString(),
    pages: pages.length,
    totalFrames,
    components: componentNames.length,
    styles: styleCounts,
    exportableNodes: exportableCount,
    pageDetails,
    componentNames,
  }

  writeJson(SUMMARY_JSON, summary)

  // Human-readable output
  const line = '='.repeat(60)
  const dash = '-'.repeat(60)

  console.log(line)
  console.log(`FIGMA SYNC SUMMARY — "${data.name}"`)
  console.log(line)
  console.log()
  console.log(`  Last modified:  ${data.lastModified}`)
  console.log(`  Synced at:      ${summary.syncedAt}`)
  console.log(`  Pages:          ${summary.pages}`)
  console.log(`  Frames:         ${summary.totalFrames}`)
  console.log(`  Components:     ${summary.components}`)
  console.log(`  Exportable:     ${summary.exportableNodes} nodes`)
  console.log(`  Styles:         ${styleCounts.fill} fill, ${styleCounts.text} text, ${styleCounts.effect} effect, ${styleCounts.grid} grid`)
  console.log()
  console.log(dash)
  console.log('PAGES')
  console.log(dash)

  for (const page of pageDetails) {
    console.log(`\n  ${page.name} (${page.frameCount} frames)`)
    for (const name of page.frameNames) console.log(`    - ${name}`)
  }

  if (componentNames.length) {
    console.log(`\n${dash}`)
    console.log('COMPONENTS')
    console.log(dash)
    for (const name of componentNames.slice(0, 30)) console.log(`    - ${name}`)
    if (componentNames.length > 30) console.log(`    ... +${componentNames.length - 30} more`)
  }

  console.log(`\n${line}`)
  console.log(`Saved: ${SUMMARY_JSON}`)
}

main()
