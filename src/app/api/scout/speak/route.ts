import { NextRequest, NextResponse } from 'next/server'

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY
const SCOUT_VOICE_ID = process.env.ELEVENLABS_VOICE_ID || 'vBKc2FfBKJfcZNyEt1n6' // Scout's voice

export async function POST(request: NextRequest) {
  if (!ELEVENLABS_API_KEY) {
    return NextResponse.json({ error: 'TTS not configured' }, { status: 503 })
  }

  try {
    const { text } = await request.json()

    if (!text || typeof text !== 'string' || text.length < 10) {
      return NextResponse.json({ error: 'Invalid text' }, { status: 400 })
    }

    // Truncate to ~5000 chars to stay within limits
    const truncated = text.slice(0, 5000)

    const res = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${SCOUT_VOICE_ID}`,
      {
        method: 'POST',
        headers: {
          'xi-api-key': ELEVENLABS_API_KEY,
          'Content-Type': 'application/json',
          'Accept': 'audio/mpeg',
        },
        body: JSON.stringify({
          text: truncated,
          model_id: 'eleven_turbo_v2_5',
          voice_settings: {
            stability: 0.4,
            similarity_boost: 0.75,
            style: 0.6,
            use_speaker_boost: true,
          },
        }),
      }
    )

    if (!res.ok) {
      const errText = await res.text()
      console.error('ElevenLabs error:', res.status, errText)
      return NextResponse.json({ error: 'TTS generation failed' }, { status: 502 })
    }

    const audioBuffer = await res.arrayBuffer()

    return new NextResponse(audioBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'public, max-age=3600',
      },
    })
  } catch (err) {
    console.error('Scout speak error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
