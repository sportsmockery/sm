/**
 * DISQUS SSO API
 * Generates SSO payload for Disqus authentication
 * Allows users to use their site login for Disqus comments and chat
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import * as crypto from 'crypto';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const DISQUS_SECRET_KEY = process.env.DISQUS_SECRET_KEY || '';
const DISQUS_PUBLIC_KEY = process.env.DISQUS_PUBLIC_KEY || '';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface DisqusSSOPayload {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  url?: string;
}

/**
 * Generate HMAC-SHA1 signature for Disqus SSO
 */
function generateDisqusAuth(userData: DisqusSSOPayload): {
  auth: string;
  public_key: string;
} | null {
  if (!DISQUS_SECRET_KEY || !DISQUS_PUBLIC_KEY) {
    return null;
  }

  // Create the message (base64 encoded JSON)
  const message = Buffer.from(JSON.stringify(userData)).toString('base64');

  // Create timestamp
  const timestamp = Math.floor(Date.now() / 1000);

  // Create signature
  const signatureData = `${message} ${timestamp}`;
  const signature = crypto
    .createHmac('sha1', DISQUS_SECRET_KEY)
    .update(signatureData)
    .digest('hex');

  return {
    auth: `${message} ${signature} ${timestamp}`,
    public_key: DISQUS_PUBLIC_KEY,
  };
}

export async function GET(request: NextRequest) {
  try {
    // Get auth token from header or cookie
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

    if (!token) {
      // Return anonymous/guest SSO
      return NextResponse.json({
        auth: null,
        public_key: DISQUS_PUBLIC_KEY,
        isGuest: true,
      });
    }

    // Verify user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({
        auth: null,
        public_key: DISQUS_PUBLIC_KEY,
        isGuest: true,
      });
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('chat_users')
      .select('*')
      .eq('user_id', user.id)
      .single();

    // Build SSO payload
    const ssoPayload: DisqusSSOPayload = {
      id: user.id,
      username: profile?.display_name || user.email?.split('@')[0] || 'Fan',
      email: user.email || '',
      avatar: profile?.avatar_url || undefined,
      url: `/user/${profile?.id || user.id}`,
    };

    const ssoAuth = generateDisqusAuth(ssoPayload);

    if (!ssoAuth) {
      return NextResponse.json({
        error: 'SSO not configured',
      }, { status: 500 });
    }

    return NextResponse.json({
      ...ssoAuth,
      user: {
        id: user.id,
        username: ssoPayload.username,
        avatar: ssoPayload.avatar,
      },
      isGuest: false,
    });
  } catch (error) {
    console.error('Disqus SSO error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST endpoint for logout callback from Disqus
 */
export async function POST(request: NextRequest) {
  try {
    // This endpoint can be used as a logout callback
    // Disqus will POST to this URL when user logs out

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Disqus SSO logout error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
