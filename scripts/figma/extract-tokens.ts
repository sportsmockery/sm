/**
 * extract-tokens.ts — Extract design tokens (colors, text styles, effects) from the Figma file.
 *
 * Usage: npx tsx scripts/figma/extract-tokens.ts
 */

import { readJson, writeJson, slugify, FILE_JSON, TOKENS_JSON } from './client'
import type { FigmaFile, FigmaNode, ColorToken, TextToken, EffectToken, TokensOutput } from './types'

function rgbaToHex(r: number, g: number, b: number, a: number): string {
  const to255 = (v: number) => Math.round(v * 255)
  const hex = [r, g, b].map((c) => to255(c).toString(16).padStart(2, '0')).join('')
  return a < 1 ? `#${hex}${to255(a).toString(16).padStart(2, '0')}` : `#${hex}`
}

function toRgba255(c: { r: number; g: number; b: number; a: number }) {
  return { r: Math.round(c.r * 255), g: Math.round(c.g * 255), b: Math.round(c.b * 255), a: Math.round(c.a * 100) / 100 }
}

function walkNodes(node: FigmaNode, callback: (n: FigmaNode) => void) {
  callback(node)
  if (node.children) node.children.forEach((c) => walkNodes(c, callback))
}

function extractColors(data: FigmaFile): ColorToken[] {
  const fillStyleIds = new Set<string>()
  for (const [id, style] of Object.entries(data.styles || {})) {
    if (style.styleType === 'FILL') fillStyleIds.add(id)
  }

  const colors: ColorToken[] = []
  const seen = new Set<string>()

  // Primary: extract from nodes that reference named fill styles
  walkNodes(data.document, (node) => {
    if (!node.styles) return
    for (const [role, styleId] of Object.entries(node.styles)) {
      if (!fillStyleIds.has(styleId) || seen.has(styleId)) continue
      seen.add(styleId)
      const fills = role === 'fill' || role === 'fills' ? node.fills : node.strokes
      const paint = fills?.[0]
      if (paint?.color) {
        colors.push({
          name: data.styles[styleId].name,
          hex: rgbaToHex(paint.color.r, paint.color.g, paint.color.b, paint.color.a),
          rgba: toRgba255(paint.color),
        })
      }
    }
  })

  // Fallback: if no named styles, collect unique solid fills from frames/rectangles
  if (colors.length === 0) {
    walkNodes(data.document, (node) => {
      if ((node.type === 'FRAME' || node.type === 'RECTANGLE') && node.fills?.length) {
        for (const fill of node.fills) {
          if (fill.type === 'SOLID' && fill.color) {
            const hex = rgbaToHex(fill.color.r, fill.color.g, fill.color.b, fill.color.a)
            if (!seen.has(hex)) {
              seen.add(hex)
              colors.push({ name: node.name, hex, rgba: toRgba255(fill.color) })
            }
          }
        }
      }
    })
  }

  return colors
}

function extractTextStyles(data: FigmaFile): TextToken[] {
  const textStyleIds = new Set<string>()
  for (const [id, style] of Object.entries(data.styles || {})) {
    if (style.styleType === 'TEXT') textStyleIds.add(id)
  }

  const tokens: TextToken[] = []
  const seen = new Set<string>()

  walkNodes(data.document, (node) => {
    if (!node.styles || !node.style) return
    for (const [, styleId] of Object.entries(node.styles)) {
      if (!textStyleIds.has(styleId) || seen.has(styleId)) continue
      seen.add(styleId)
      tokens.push({
        name: data.styles[styleId].name,
        fontFamily: node.style.fontFamily || 'sans-serif',
        fontSize: node.style.fontSize || 16,
        fontWeight: node.style.fontWeight || 400,
        lineHeight: node.style.lineHeightPx,
        letterSpacing: node.style.letterSpacing,
      })
    }
  })

  return tokens
}

function extractEffects(data: FigmaFile): EffectToken[] {
  const effectStyleIds = new Set<string>()
  for (const [id, style] of Object.entries(data.styles || {})) {
    if (style.styleType === 'EFFECT') effectStyleIds.add(id)
  }

  const tokens: EffectToken[] = []
  const seen = new Set<string>()

  walkNodes(data.document, (node) => {
    if (!node.styles || !node.effects?.length) return
    for (const [, styleId] of Object.entries(node.styles)) {
      if (!effectStyleIds.has(styleId) || seen.has(styleId)) continue
      seen.add(styleId)
      const effect = node.effects[0]
      tokens.push({
        name: data.styles[styleId].name,
        type: effect.type,
        radius: effect.radius,
        color: effect.color ? rgbaToHex(effect.color.r, effect.color.g, effect.color.b, effect.color.a) : undefined,
        offset: effect.offset,
      })
    }
  })

  return tokens
}

function buildTailwindMap(colors: ColorToken[], text: TextToken[]): TokensOutput['tailwind'] {
  const colorMap: Record<string, string> = {}
  for (const c of colors) colorMap[slugify(c.name)] = c.hex

  const fontSizeMap: Record<string, string> = {}
  const fontFamilyMap: Record<string, string[]> = {}
  const seenFamilies = new Set<string>()

  for (const t of text) {
    fontSizeMap[slugify(t.name)] = `${t.fontSize}px`
    if (!seenFamilies.has(t.fontFamily)) {
      seenFamilies.add(t.fontFamily)
      fontFamilyMap[slugify(t.fontFamily)] = [t.fontFamily, 'sans-serif']
    }
  }

  return { colors: colorMap, fontSize: fontSizeMap, fontFamily: fontFamilyMap }
}

function main() {
  const data = readJson<FigmaFile>(FILE_JSON)

  const colors = extractColors(data)
  const text = extractTextStyles(data)
  const effects = extractEffects(data)
  const tailwind = buildTailwindMap(colors, text)

  const output: TokensOutput = { colors, text, effects, tailwind }
  writeJson(TOKENS_JSON, output)

  console.log(`Tokens from "${data.name}"`)
  console.log(`  Colors:  ${colors.length}`)
  console.log(`  Text:    ${text.length}`)
  console.log(`  Effects: ${effects.length}\n`)

  if (colors.length) {
    console.log('  Colors:')
    for (const c of colors.slice(0, 20)) console.log(`    ${c.hex.padEnd(10)} ${c.name}`)
    if (colors.length > 20) console.log(`    ... +${colors.length - 20} more`)
    console.log()
  }

  if (text.length) {
    console.log('  Text styles:')
    for (const t of text.slice(0, 10)) console.log(`    ${t.fontFamily} ${t.fontWeight} ${t.fontSize}px — "${t.name}"`)
    if (text.length > 10) console.log(`    ... +${text.length - 10} more`)
    console.log()
  }

  console.log(`Saved: ${TOKENS_JSON}`)
  console.log('Copy tailwind section into tailwind.config.ts theme.extend to use.')
}

main()
