// app/api/audio/[slug]/route.ts

import { NextRequest, NextResponse } from "next/server";

/**
 * Stub endpoint for article TTS audio.
 * In production, this should:
 *  - Fetch article HTML/markdown
 *  - Strip to plain text
 *  - Call a TTS provider (e.g., ElevenLabs, Google TTS, Amazon Polly)
 *  - Stream or redirect to the resulting audio file
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  // TODO: Implement actual TTS pipeline:
  // 1. Fetch article content from database
  // 2. Strip HTML tags to plain text
  // 3. Call TTS API (ElevenLabs, Google Cloud TTS, Amazon Polly, etc.)
  // 4. Return audio stream or redirect to cached audio file

  // For now, return 204 No Content with a TODO header.
  return new NextResponse(null, {
    status: 204,
    headers: {
      "X-Stub": `TTS for article slug=${slug} not yet implemented`,
      "Content-Type": "audio/mpeg",
    },
  });
}
