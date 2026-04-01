import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const htmlPath = path.join(process.cwd(), 'public', 'masters', 'index.html')

// In production, cache the file; in dev, read fresh every request
const isDev = process.env.NODE_ENV === 'development'
const cachedHtml = isDev ? null : fs.readFileSync(htmlPath, 'utf-8')

export async function GET() {
  const html = cachedHtml ?? fs.readFileSync(htmlPath, 'utf-8')
  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    },
  })
}
