// app/api/audio/[slug]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";

// Allow longer timeout for TTS generation
export const maxDuration = 60;

// ElevenLabs voice IDs - custom voices
const VOICE_IDS: Record<string, string> = {
  will: "bIHbv24MWmeRgasZH58o",     // Will - young, energetic American male
  brian: "nPczCjzI2devNBz1zQrb",    // Brian - mature, authoritative American male
  laura: "FGY2WhTYpPnrIDTdsKH5",    // Laura - warm, friendly American female
  sarah: "EXAVITQu4vr4xnSDxMaL",    // Sarah - expressive American female
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
  const voiceParam = req.nextUrl.searchParams.get("voice") || "will";

  // Validate voice parameter
  const voiceId = VOICE_IDS[voiceParam] || VOICE_IDS.will;

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
      .select("title, content, published_at")
      .eq("slug", slug)
      .eq("status", "published")
      .single();

    if (error || !post) {
      return NextResponse.json(
        { error: "Article not found" },
        { status: 404 }
      );
    }

    // Format the publish date
    const publishDate = post.published_at
      ? new Date(post.published_at).toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        })
      : 'recently';

    // Prepare text for TTS: introduction + title + date + content
    const introduction = `Article Headline: ${post.title}. Written ${publishDate}.`;
    const plainText = `${introduction} ${stripHtmlForTTS(post.content || '')}`;

    // Limit text length (ElevenLabs has limits)
    const maxChars = 5000; // Adjust based on your plan
    const truncatedText = plainText.length > maxChars
      ? plainText.substring(0, maxChars) + "... Article continues."
      : plainText;

    // Call ElevenLabs API (non-streaming for better compatibility)
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
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

    // Get the audio data
    const audioBuffer = await response.arrayBuffer();

    // Return the audio with proper headers
    return new NextResponse(audioBuffer, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": audioBuffer.byteLength.toString(),
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
