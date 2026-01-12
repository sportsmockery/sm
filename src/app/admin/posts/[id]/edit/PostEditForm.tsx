'use client'

import { AdvancedPostEditor } from '@/components/admin/PostEditor'

interface Post {
  id: string
  title: string
  slug: string
  content: string
  excerpt: string | null
  featured_image: string | null
  status: string
  category_id: string | null
  author_id: string | null
  seo_title: string | null
  seo_description: string | null
  published_at?: string | null
  scheduled_at?: string | null
}

interface Category {
  id: string
  name: string
}

interface Author {
  id: string
  display_name: string
}

interface PostEditFormProps {
  post: Post
  categories: Category[]
  authors: Author[]
}

export default function PostEditForm({ post, categories, authors }: PostEditFormProps) {
  return (
    <AdvancedPostEditor
      post={post}
      categories={categories}
      authors={authors}
    />
  )
}
