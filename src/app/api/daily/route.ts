import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';

// =============================================================================
// Types
// =============================================================================

type Team = 'Bears' | 'Bulls' | 'Cubs' | 'White Sox' | 'Other';

type Story = {
  id: string;
  title: string;
  url: string;
  imageUrl: string;
  team: Team;
  summary?: string;
  publishedAt: string;
  views: number;
};

// =============================================================================
// Team Mapping
// =============================================================================

const CATEGORY_TO_TEAM: Record<string, Team> = {
  // Slugs
  bears: 'Bears',
  'chicago-bears': 'Bears',
  bulls: 'Bulls',
  'chicago-bulls': 'Bulls',
  cubs: 'Cubs',
  'chicago-cubs': 'Cubs',
  'white-sox': 'White Sox',
  'chicago-white-sox': 'White Sox',
  whitesox: 'White Sox',
  sox: 'White Sox',
  // Names (fallback)
  'Chicago Bears': 'Bears',
  'Chicago Bulls': 'Bulls',
  'Chicago Cubs': 'Cubs',
  'Chicago White Sox': 'White Sox',
};

function mapCategoryToTeam(category?: { slug?: string; name?: string }): Team {
  if (!category) return 'Other';

  // Try slug first
  if (category.slug && CATEGORY_TO_TEAM[category.slug.toLowerCase()]) {
    return CATEGORY_TO_TEAM[category.slug.toLowerCase()];
  }

  // Try name
  if (category.name && CATEGORY_TO_TEAM[category.name]) {
    return CATEGORY_TO_TEAM[category.name];
  }

  // Fuzzy match on name
  const name = (category.name || category.slug || '').toLowerCase();
  if (name.includes('bear')) return 'Bears';
  if (name.includes('bull')) return 'Bulls';
  if (name.includes('cub')) return 'Cubs';
  if (name.includes('sox') || name.includes('white')) return 'White Sox';

  return 'Other';
}

// =============================================================================
// GET /api/daily?date=YYYY-MM-DD
// =============================================================================

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const dateParam = searchParams.get('date');

    // Parse date (default: yesterday)
    let targetDate: Date;
    if (dateParam) {
      targetDate = new Date(dateParam + 'T00:00:00');
      if (isNaN(targetDate.getTime())) {
        return NextResponse.json(
          { error: 'Invalid date format. Use YYYY-MM-DD.' },
          { status: 400 }
        );
      }
    } else {
      targetDate = new Date();
      targetDate.setDate(targetDate.getDate() - 1);
    }

    // Build date range for the target day
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    // Query posts
    const supabase = createClient();

    const { data: posts, error } = await supabase
      .from('sm_posts')
      .select(`
        id,
        title,
        slug,
        excerpt,
        featured_image,
        published_at,
        views,
        category:sm_categories(id, name, slug)
      `)
      .eq('status', 'published')
      .gte('published_at', startOfDay.toISOString())
      .lte('published_at', endOfDay.toISOString())
      .order('views', { ascending: false });

    if (error) {
      console.error('[Daily API] Query error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch posts' },
        { status: 500 }
      );
    }

    if (!posts || posts.length === 0) {
      return NextResponse.json(
        { error: `No posts found for ${dateParam || 'yesterday'}` },
        { status: 404 }
      );
    }

    // Map to Story format
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://test.sportsmockery.com';

    const stories: Story[] = posts.map((post) => ({
      id: post.id,
      title: post.title,
      url: `${baseUrl}/${post.slug}`,
      imageUrl: post.featured_image || `${baseUrl}/placeholder.jpg`,
      team: mapCategoryToTeam(post.category as { slug?: string; name?: string }),
      summary: post.excerpt || undefined,
      publishedAt: post.published_at || new Date().toISOString(),
      views: post.views || 0,
    }));

    // Return stories (already sorted by views from query)
    return NextResponse.json(stories, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (err) {
    console.error('[Daily API] Error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
