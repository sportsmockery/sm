// app/api/audio/[slug]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";

// Allow longer timeout for TTS generation
export const maxDuration = 60;

// ElevenLabs voice IDs - custom voices
const VOICE_IDS: Record<string, string> = {
  scout: "vBKc2FfBKJfcZNyEt1n6",    // Scout - 15yo Chicago sports fan, passionate and energetic
  will: "bIHbv24MWmeRgasZH58o",     // Will - young, energetic American male
  brian: "nPczCjzI2devNBz1zQrb",    // Brian - mature, authoritative American male
  laura: "FGY2WhTYpPnrIDTdsKH5",    // Laura - warm, friendly American female
  sarah: "EXAVITQu4vr4xnSDxMaL",    // Sarah - expressive American female
};

// ElevenLabs model - eleven_turbo_v2_5 is fast and high quality
const ELEVENLABS_MODEL = "eleven_turbo_v2_5";

// Strip URLs from text so TTS doesn't read them letter-by-letter
function stripUrls(text: string): string {
  // Remove markdown-style links [text](url) → keep just the text
  text = text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
  // Remove raw URLs (http/https)
  text = text.replace(/https?:\/\/[^\s),]+/gi, '');
  // Remove www. URLs without protocol
  text = text.replace(/www\.[^\s),]+/gi, '');
  // Remove citation markers like [1], [2] etc.
  text = text.replace(/\[\d+\]/g, '');
  // Clean up leftover artifacts (double spaces, orphaned parens)
  text = text.replace(/\(\s*\)/g, '');
  text = text.replace(/\s+/g, ' ');
  return text.trim();
}

// Strip HTML tags and clean text for TTS
function stripHtmlForTTS(html: string): string {
  // Remove script and style tags completely
  let text = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
  text = text.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');

  // Remove anchor tags but keep the link text
  text = text.replace(/<a[^>]*>([\s\S]*?)<\/a>/gi, '$1');

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

  // Strip any URLs that were in the text
  text = stripUrls(text);

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

  // Validate voice parameter (overridden for some scout-specific slugs below)
  let voiceId = VOICE_IDS[voiceParam] || VOICE_IDS.will;

  // Check for API key
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "ElevenLabs API key not configured" },
      { status: 500 }
    );
  }

  try {
    let plainText: string;

    if (slug === 'scout-insight') {
      // Scout Insight card — bullets passed via query (?b=...&b=...)
      const bullets = req.nextUrl.searchParams.getAll('b').map(b => b.trim()).filter(Boolean);
      if (bullets.length === 0) {
        return NextResponse.json(
          { error: "No insight bullets provided" },
          { status: 400 }
        );
      }

      // Force Scout voice for insight reads
      voiceId = VOICE_IDS.scout;

      const greetings = [
        "What's up, this is your pal Scout with some insight.",
        "Hey Chicago, Scout here — let's break down what you need to know.",
        "Scout checking in — here's what's happening with your teams.",
        "What's good, Chicago — Scout's got the latest for you.",
        "Your favorite AI analyst here — let me catch you up real quick.",
      ];

      const closers = [
        "That's the rundown — tap in if you want to dig deeper.",
        "That's what I got for now. Ask me anything, I'm always here.",
        "There you have it, Chicago. Let's talk if you want the full breakdown.",
        "That's your snapshot — hit me up for the details behind the numbers.",
        "And that's the intel. You know where to find me.",
      ];

      // Deterministic rotation based on first bullet so the same card is stable
      const seedSource = bullets[0] || '';
      const seed = seedSource.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
      const greeting = greetings[seed % greetings.length];
      const closer = closers[seed % closers.length];

      const cleanBullets = bullets.map(b => stripUrls(b));
      const insightsText = cleanBullets.join('. ') + (cleanBullets.length ? '.' : '');
      plainText = `${greeting} ${insightsText} ${closer}`;
    } else if (slug === 'scout-briefing') {
      // Special case: fetch live Scout briefing from edge/scout API
      const briefingPrompt = `Summarize the biggest Chicago sports news from the last 24 hours for a fan. Keep it conversational like a 15-year-old Chicago sports fan would talk. Cover Bears, Bulls, Blackhawks, Cubs, and White Sox if there is news. Keep it under 2000 characters. No markdown formatting. Do NOT include any URLs, links, citations, or source references — this will be read aloud.`;
      const baseUrl = req.nextUrl.origin;
      const briefingRes = await fetch(`${baseUrl}/api/edge/scout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: briefingPrompt }),
      });
      const briefingData = await briefingRes.json();
      const briefingText = briefingData?.answer?.trim();
      if (!briefingText || briefingText.length < 50) {
        return NextResponse.json(
          { error: "Scout briefing not available" },
          { status: 503 }
        );
      }
      // Force Scout voice for briefing
      voiceId = VOICE_IDS.scout;
      plainText = `Here's your Scout Report. ${stripUrls(briefingText)}`;
    } else {
      // Standard article: fetch from database
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

      const publishDate = post.published_at
        ? new Date(post.published_at).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
          })
        : 'recently';

      const introduction = `Article Headline: ${post.title}. Written ${publishDate}.`;
      plainText = `${introduction} ${stripHtmlForTTS(post.content || '')}`;
    }

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
