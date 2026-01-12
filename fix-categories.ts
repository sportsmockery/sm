import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function fix() {
  const { data: categories } = await supabase.from('sm_categories').select('id, wp_id')
  const catMap = new Map(categories?.map(c => [c.wp_id, c.id]) || [])
  console.log('Categories:', catMap.size)

  let page = 1
  let updated = 0

  while (true) {
    const res = await fetch('https://www.sportsmockery.com/wp-json/sm-export/v1/posts?page=' + page + '&per_page=500')
    const data = await res.json()
    
    if (!data.posts || data.posts.length === 0) break
    
    for (const post of data.posts) {
      const newCatId = catMap.get(post.category_id)
      if (newCatId) {
        await supabase.from('sm_posts').update({ category_id: newCatId }).eq('wp_id', post.id)
        updated++
      }
    }
    
    console.log('Page', page + '/' + data.total_pages, '- Updated:', updated)
    page++
    if (page > data.total_pages) break
  }

  console.log('Done! Updated', updated)
}

fix()