// app/api/audio/[slug]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";

// ElevenLabs voice IDs - using their high-quality built-in voices
const VOICE_IDS: Record<string, string> = {
  mike: "TxGEqnHWrfWFTfGW9XjX",    // Josh - young, energetic American male
  david: "pNInz6obpgDQGcFmaJgB",   // Adam - deep, mature American male
  sarah: "21m00Tcm4TlvDq8ikWAM",   // Rachel - expressive American female
  jennifer: "MF3mGyEYCl7XYWbV9V6O", // Elli - warm, friendly American female
};

// ElevenLabs model - eleven_turbo_v2_5 is fast and high quality
const ELEVENLABS_MODEL = "eleven_turbo_v2_5";

// Strip HTML tags and clean text for TTS
function stripHtmlForTTS(html: string): string {
  // Remove script and style tags completely
  let text = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
  text = text.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');

  // Replace common block elements with newlines for natural pauses
  text = text.replace(/<\/(p|div|h[1-6]|li|br)>/gi, '. ');
  text = text.replace(/<br\s*\/?>/gi, '. ');

  // Remove all remaining HTML tags
  text = text.replace(/<[^>]+>/g, '');

  // Decode HTML entities
  text = text.replace(/&nbsp;/g, ' ');
  text = text.replace(/&amp;/g, '&');
  text = text.replace(/&lt;/g, '<');
  text = text.replace(/&gt;/g, '>');
  text = text.replace(/&quot;/g, '"');
  text = text.replace(/&#39;/g, "'");

  // Clean up whitespace
  text = text.replace(/\s+/g, ' ');
  text = text.replace(/\.\s*\./g, '.');
  text = text.trim();

  return text;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const voiceParam = req.nextUrl.searchParams.get("voice") || "mike";

  // Validate voice parameter
  const voiceId = VOICE_IDS[voiceParam] || VOICE_IDS.mike;

  // Check for API key
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "ElevenLabs API key not configured" },
      { status: 500 }
    );
  }

  try {
    // Fetch article content from database
    const { data: post, error } = await supabaseAdmin
      .from("sm_posts")
      .select("title, content")
      .eq("slug", slug)
      .eq("status", "published")
      .single();

    if (error || !post) {
      return NextResponse.json(
        { error: "Article not found" },
        { status: 404 }
      );
    }

    // Prepare text for TTS: title + content
    const plainText = `${post.title}. ${stripHtmlForTTS(post.content || '')}`;

    // Limit text length (ElevenLabs has limits)
    const maxChars = 5000; // Adjust based on your plan
    const truncatedText = plainText.length > maxChars
      ? plainText.substring(0, maxChars) + "... Article continues."
      : plainText;

    // Call ElevenLabs API
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream`,
      {
        method: "POST",
        headers: {
          "Accept": "audio/mpeg",
          "Content-Type": "application/json",
          "xi-api-key": apiKey,
        },
        body: JSON.stringify({
          text: truncatedText,
          model_id: ELEVENLABS_MODEL,
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
            style: 0.5,
            use_speaker_boost: true,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("ElevenLabs error:", errorText);
      return NextResponse.json(
        { error: "TTS generation failed", details: errorText },
        { status: response.status }
      );
    }

    // Stream the audio response
    const audioStream = response.body;
    if (!audioStream) {
      return NextResponse.json(
        { error: "No audio stream returned" },
        { status: 500 }
      );
    }

    // Return the audio stream with proper headers
    return new NextResponse(audioStream, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "public, max-age=86400", // Cache for 24 hours
        "X-Voice": voiceParam,
      },
    });

  } catch (error) {
    console.error("TTS error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
