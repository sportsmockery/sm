import { Metadata } from 'next';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import HomepageFeedV2 from '@/components/homepage/HomepageFeedV2';
import { getHeroData } from '@/lib/hero-data';

export const metadata: Metadata = {
  title: { absolute: 'Sports Mockery | Where Chicago Fans Come First' },
  description:
    'Your personalized Chicago sports feed. Live scores, breaking news, Scout AI analysis, and fan community — all in one stream.',
};

export const dynamic = 'force-dynamic';

// ---------------------------------------------------------------------------
// Detect authenticated user for personalized greeting + hero data
// ---------------------------------------------------------------------------

async function getUser(): Promise<{ firstName: string | null; userId: string | null }> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseAnonKey) return { firstName: null, userId: null };

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
    if (!user) return { firstName: null, userId: null };

    // Try user_metadata first, then email
    const meta = user.user_metadata;
    let firstName: string | null = null;
    if (meta?.first_name) firstName = meta.first_name;
    else if (meta?.full_name) firstName = meta.full_name.split(' ')[0];
    else if (meta?.name) firstName = meta.name.split(' ')[0];
    else if (user.email) firstName = user.email.split('@')[0];

    return { firstName, userId: user.id };
  } catch {
    return { firstName: null, userId: null };
  }
}

export default async function HomePage() {
  const { firstName, userId } = await getUser();

  // Fetch hero context data server-side
  const heroData = await getHeroData(userId);

  return (
    <HomepageFeedV2
      firstName={firstName ?? undefined}
      featuredStory={heroData.featuredStory}
      gameContext={heroData.gameContext}
      teamContext={heroData.teamContext}
      debateContext={heroData.debateContext}
      primaryTeam={heroData.primaryTeam ?? undefined}
      heroArticleId={heroData.heroArticleId ?? undefined}
    />
  );
}
