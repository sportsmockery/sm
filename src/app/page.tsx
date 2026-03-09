import { Metadata } from 'next';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import HomepageFeedV2 from '@/components/homepage/HomepageFeedV2';

export const metadata: Metadata = {
  title: { absolute: 'Sports Mockery | Where Chicago Fans Come First' },
  description:
    'Your personalized Chicago sports feed. Live scores, breaking news, Scout AI analysis, and fan community — all in one stream.',
};

export const dynamic = 'force-dynamic';

// ---------------------------------------------------------------------------
// Detect user's first name for personalized greeting
// ---------------------------------------------------------------------------

async function getUserFirstName(): Promise<string | null> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseAnonKey) return null;

    const cookieStore = await cookies();
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll() {},
      },
    });

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    // Try user_metadata first, then email
    const meta = user.user_metadata;
    if (meta?.first_name) return meta.first_name;
    if (meta?.full_name) return meta.full_name.split(' ')[0];
    if (meta?.name) return meta.name.split(' ')[0];
    if (user.email) return user.email.split('@')[0];

    return null;
  } catch {
    return null;
  }
}

export default async function HomePage() {
  const firstName = await getUserFirstName();
  return <HomepageFeedV2 firstName={firstName ?? undefined} />;
}
