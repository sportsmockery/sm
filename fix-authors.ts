import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function fix() {
  const { data: authors } = await supabase.from('sm_authors').select('id, wp_id')
  const authorMap = new Map(authors?.map(a => [a.wp_id, a.id]) || [])
  console.log('Authors:', authorMap.size)

  let page = 1
  let updated = 0

  while (true) {
    const res = await fetch('https://www.sportsmockery.com/wp-json/sm-export/v1/posts?page=' + page + '&per_page=500')
    const data = await res.json()

    if (!data.posts || data.posts.length === 0) break

    for (const post of data.posts) {
      const newAuthorId = authorMap.get(Number(post.author_id))
      if (newAuthorId) {
        await supabase.from('sm_posts').update({ author_id: newAuthorId }).eq('wp_id', post.id)
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
