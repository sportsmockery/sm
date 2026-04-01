import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const html = fs.readFileSync(
  path.join(process.cwd(), 'public', 'masters', 'index.html'),
  'utf-8'
)

export async function GET() {
  return new NextResponse(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  })
}
