/**
 * export-node-images.ts — Export specific Figma nodes as images (SVG or PNG).
 *
 * Usage:
 *   npx tsx scripts/figma/export-node-images.ts <nodeId1> <nodeId2> ...
 *   npx tsx scripts/figma/export-node-images.ts --format png --scale 2 <nodeId1>
 *   npx tsx scripts/figma/export-node-images.ts --ids-from figma/export-list.txt
 */

import fs from 'fs'
import path from 'path'
import { figmaGet, downloadBuffer, getFileKey, readJson, writeJson, slugify, FIGMA_DIR, DESIGN_DIR, EXPORT_MANIFEST, FILE_JSON } from './client'
import type { ExportManifest, FigmaFile, FigmaNode } from './types'

function parseArgs() {
  const args = process.argv.slice(2)
  let format: 'svg' | 'png' = 'svg'
  let scale = 2
  const nodeIds: string[] = []
  let idsFromFile: string | null = null

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--format' && args[i + 1]) {
      format = args[++i] as 'svg' | 'png'
    } else if (args[i] === '--scale' && args[i + 1]) {
      scale = parseInt(args[++i], 10)
    } else if (args[i] === '--ids-from' && args[i + 1]) {
      idsFromFile = args[++i]
    } else if (!args[i].startsWith('--')) {
      nodeIds.push(args[i])
    }
  }

  if (idsFromFile) {
    const content = fs.readFileSync(idsFromFile, 'utf-8')
    for (const line of content.split('\n')) {
      const trimmed = line.trim()
      if (trimmed && !trimmed.startsWith('#')) nodeIds.push(trimmed)
    }
  }

  return { format, scale: Math.min(4, Math.max(1, scale)), nodeIds }
}

function buildNodeNameMap(): Map<string, string> {
  const map = new Map<string, string>()
  try {
    const data = readJson<FigmaFile>(FILE_JSON)
    function walk(node: FigmaNode) {
      if (node.id && node.name) map.set(node.id, node.name)
      if (node.children) node.children.forEach(walk)
    }
    walk(data.document)
  } catch {
    // file.json not available — names will fall back to node IDs
  }
  return map
}

async function main() {
  const { format, scale, nodeIds } = parseArgs()

  if (!nodeIds.length) {
    console.error('No node IDs provided.\n')
    console.error('Usage:')
    console.error('  npm run figma:export -- <nodeId1> <nodeId2>')
    console.error('  npm run figma:export -- --format png --scale 2 <nodeId1>')
    console.error('  npm run figma:export -- --ids-from figma/export-list.txt\n')
    console.error('Find node IDs in figma/pages.json or in the Figma URL after selecting a layer.')
    process.exit(1)
  }

  const fileKey = getFileKey()
  const nameMap = buildNodeNameMap()

  console.log(`Exporting ${nodeIds.length} node(s) as ${format.toUpperCase()}${format === 'png' ? ` @${scale}x` : ''}`)

  const params: Record<string, string> = { ids: nodeIds.join(','), format }
  if (format === 'png') params.scale = String(scale)

  const response = await figmaGet<{ images: Record<string, string | null> }>(`/images/${fileKey}`, params)

  fs.mkdirSync(DESIGN_DIR, { recursive: true })

  const assets: ExportManifest['assets'] = []
  let downloaded = 0
  let failed = 0

  for (const [nodeId, imageUrl] of Object.entries(response.images)) {
    const nodeName = nameMap.get(nodeId) || nodeId
    const safeName = slugify(nodeName) || 'unnamed'
    const fileName = `${safeName}.${format}`
    const filePath = path.join(DESIGN_DIR, fileName)

    if (!imageUrl) {
      console.log(`  SKIP ${nodeName} (${nodeId}) — no image URL returned`)
      failed++
      continue
    }

    try {
      const buffer = await downloadBuffer(imageUrl)
      fs.writeFileSync(filePath, buffer)
      console.log(`  OK   ${fileName} (${(buffer.length / 1024).toFixed(1)} KB)`)
      downloaded++
      assets.push({ nodeId, name: nodeName, fileName, path: `/design/${fileName}`, format })
    } catch (err: any) {
      console.log(`  FAIL ${nodeName} (${nodeId}) — ${err.message}`)
      failed++
    }
  }

  const manifest: ExportManifest = { exportedAt: new Date().toISOString(), format, scale, assets }
  writeJson(EXPORT_MANIFEST, manifest)

  console.log(`\nDownloaded: ${downloaded}, Failed: ${failed}`)
  console.log(`Assets: ${DESIGN_DIR}`)
  console.log(`Manifest: ${EXPORT_MANIFEST}`)
}

main().catch((err) => {
  console.error('Export failed:', err.message)
  process.exit(1)
})
