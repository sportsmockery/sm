/**
 * fetch-file.ts — Download the full Figma file JSON and save locally.
 *
 * Usage: npx tsx scripts/figma/fetch-file.ts
 * Env:   FIGMA_TOKEN, FIGMA_FILE_KEY
 */

import { figmaGet, getFileKey, writeJson, FILE_JSON } from './client'
import type { FigmaFile } from './types'

async function main() {
  const fileKey = getFileKey()
  console.log(`Fetching Figma file ${fileKey} ...`)

  const start = Date.now()
  const data = await figmaGet<FigmaFile>(`/files/${fileKey}`, { geometry: 'paths' })
  const elapsed = ((Date.now() - start) / 1000).toFixed(1)

  writeJson(FILE_JSON, data)

  const sizeKB = (Buffer.byteLength(JSON.stringify(data)) / 1024).toFixed(0)
  const pageCount = data.document?.children?.length ?? 0
  const styleCount = Object.keys(data.styles || {}).length

  console.log(`Done in ${elapsed}s`)
  console.log(`  File:     "${data.name}"`)
  console.log(`  Modified: ${data.lastModified}`)
  console.log(`  Pages:    ${pageCount}`)
  console.log(`  Styles:   ${styleCount}`)
  console.log(`  Size:     ${sizeKB} KB`)
  console.log(`  Saved:    ${FILE_JSON}`)
}

main().catch((err) => {
  console.error('Fetch failed:', err.message)
  process.exit(1)
})
