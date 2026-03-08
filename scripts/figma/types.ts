// Figma API response types (subset relevant to our sync pipeline)

export interface FigmaFile {
  name: string
  lastModified: string
  version: string
  document: FigmaNode
  styles: Record<string, FigmaStyle>
  schemaVersion: number
}

export interface FigmaNode {
  id: string
  name: string
  type: string
  children?: FigmaNode[]
  fills?: FigmaPaint[]
  strokes?: FigmaPaint[]
  effects?: FigmaEffect[]
  style?: FigmaTextStyle
  absoluteBoundingBox?: { x: number; y: number; width: number; height: number }
  exportSettings?: FigmaExportSetting[]
  componentId?: string
  styles?: Record<string, string>
}

export interface FigmaStyle {
  key: string
  name: string
  styleType: 'FILL' | 'TEXT' | 'EFFECT' | 'GRID'
  description: string
}

export interface FigmaPaint {
  type: string
  color?: { r: number; g: number; b: number; a: number }
  opacity?: number
  gradientStops?: Array<{ color: { r: number; g: number; b: number; a: number }; position: number }>
}

export interface FigmaEffect {
  type: string
  visible: boolean
  radius?: number
  color?: { r: number; g: number; b: number; a: number }
  offset?: { x: number; y: number }
}

export interface FigmaTextStyle {
  fontFamily?: string
  fontPostScriptName?: string
  fontSize?: number
  fontWeight?: number
  lineHeightPx?: number
  letterSpacing?: number
  textAlignHorizontal?: string
}

export interface FigmaExportSetting {
  suffix: string
  format: 'JPG' | 'PNG' | 'SVG' | 'PDF'
  constraint: { type: string; value: number }
}

// Our output types

export interface PageSummary {
  id: string
  name: string
  frames: FrameSummary[]
}

export interface FrameSummary {
  id: string
  name: string
  type: string
  childCount: number
  width?: number
  height?: number
}

export interface ColorToken {
  name: string
  hex: string
  rgba: { r: number; g: number; b: number; a: number }
}

export interface TextToken {
  name: string
  fontFamily: string
  fontSize: number
  fontWeight: number
  lineHeight?: number
  letterSpacing?: number
}

export interface EffectToken {
  name: string
  type: string
  radius?: number
  color?: string
  offset?: { x: number; y: number }
}

export interface TokensOutput {
  colors: ColorToken[]
  text: TextToken[]
  effects: EffectToken[]
  tailwind: {
    colors: Record<string, string>
    fontSize: Record<string, string>
    fontFamily: Record<string, string[]>
  }
}

export interface ExportManifest {
  exportedAt: string
  format: string
  scale: number
  assets: Array<{
    nodeId: string
    name: string
    fileName: string
    path: string
    format: string
  }>
}

export interface SyncSummary {
  fileName: string
  lastModified: string
  syncedAt: string
  pages: number
  totalFrames: number
  components: number
  styles: {
    fill: number
    text: number
    effect: number
    grid: number
  }
  exportableNodes: number
  pageDetails: Array<{
    name: string
    frameCount: number
    frameNames: string[]
  }>
  componentNames: string[]
}
