// Shared Figma API client and utilities

import fs from 'fs'
import path from 'path'
import { config } from 'dotenv'

// Load .env.local (same as Next.js convention)
config({ path: path.resolve(__dirname, '..', '..', '.env.local') })

const FIGMA_API_BASE = 'https://api.figma.com/v1'

// --- Environment ---

export function getToken(): string {
  const token = process.env.FIGMA_TOKEN
  if (!token) {
    console.error('Missing FIGMA_TOKEN. Set it in .env.local or export it.')
    console.error('Get one at: https://www.figma.com/developers/api#access-tokens')
    process.exit(1)
  }
  return token
}

export function getFileKey(): string {
  const key = process.env.FIGMA_FILE_KEY
  if (!key) {
    console.error('Missing FIGMA_FILE_KEY. Set it in .env.local or export it.')
    console.error('Find it in your Figma URL: figma.com/design/<FILE_KEY>/...')
    process.exit(1)
  }
  return key
}

// --- API ---

export async function figmaGet<T = any>(path: string, params?: Record<string, string>): Promise<T> {
  const token = getToken()
  const url = new URL(`${FIGMA_API_BASE}${path}`)
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      url.searchParams.set(k, v)
    }
  }

  const res = await fetch(url.toString(), {
    headers: { 'X-Figma-Token': token },
  })

  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`Figma API ${res.status}: ${body || res.statusText}`)
  }

  return res.json() as Promise<T>
}

export async function downloadBuffer(url: string): Promise<Buffer> {
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`Download failed (${res.status}): ${url}`)
  }
  return Buffer.from(await res.arrayBuffer())
}

// --- File I/O ---

export function writeJson(filePath: string, data: unknown): void {
  fs.mkdirSync(path.dirname(filePath), { recursive: true })
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n')
}

export function readJson<T>(filePath: string): T {
  if (!fs.existsSync(filePath)) {
    console.error(`Not found: ${filePath}`)
    console.error('Run "npm run figma:fetch" first.')
    process.exit(1)
  }
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'))
}

export function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

// --- Paths ---

export const ROOT = path.resolve(__dirname, '..', '..')
export const FIGMA_DIR = path.join(ROOT, 'figma')
export const DESIGN_DIR = path.join(ROOT, 'public', 'design')
export const FILE_JSON = path.join(FIGMA_DIR, 'file.json')
export const PAGES_JSON = path.join(FIGMA_DIR, 'pages.json')
export const TOKENS_JSON = path.join(FIGMA_DIR, 'tokens.json')
export const EXPORT_MANIFEST = path.join(FIGMA_DIR, 'export-manifest.json')
export const SUMMARY_JSON = path.join(FIGMA_DIR, 'sync-summary.json')
