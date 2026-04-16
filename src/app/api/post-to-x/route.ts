import { NextRequest, NextResponse } from 'next/server';
import { TwitterApi } from 'twitter-api-v2';
import { supabaseAdmin } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

function getTwitterClient() {
  return new TwitterApi({
    appKey: process.env.X_API_KEY!,
    appSecret: process.env.X_API_SECRET!,
    accessToken: process.env.X_ACCESS_TOKEN!,
    accessSecret: process.env.X_ACCESS_TOKEN_SECRET!,
  });
}

export async function POST(request: NextRequest) {
  try {
    const { predictionId, caption, mediaUrl } = await request.json();

    const twitterClient = getTwitterClient();

    if (!predictionId || !caption) {
      return NextResponse.json({ error: 'predictionId and caption required' }, { status: 400 });
    }

    let tweetId: string;

    if (mediaUrl) {
      try {
        const mediaResponse = await fetch(mediaUrl);
        const mediaBuffer = Buffer.from(await mediaResponse.arrayBuffer());
        const mediaId = await twitterClient.v1.uploadMedia(mediaBuffer, {
          mimeType: mediaResponse.headers.get('content-type') || 'image/jpeg',
        });
        const tweet = await twitterClient.v2.tweet({
          text: caption,
          media: { media_ids: [mediaId] }
        });
        tweetId = tweet.data.id;
      } catch {
        const tweet = await twitterClient.v2.tweet({ text: caption });
        tweetId = tweet.data.id;
      }
    } else {
      const tweet = await twitterClient.v2.tweet({ text: caption });
      tweetId = tweet.data.id;
    }

    await supabaseAdmin
      .from('Twitter_viral_predictions')
      .update({ tweet_id: tweetId, posted_at: new Date().toISOString(), status: 'posted' })
      .eq('id', predictionId);

    return NextResponse.json({ success: true, tweetId });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
