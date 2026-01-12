'use client'

import { AdvancedPostEditor } from '@/components/admin/PostEditor'

interface Category {
  id: string
  name: string
}

interface Author {
  id: string
  display_name: string
}

interface NewPostFormProps {
  categories: Category[]
  authors: Author[]
  currentUserId?: string
}

export default function NewPostForm({ categories, authors, currentUserId }: NewPostFormProps) {
  return (
    <AdvancedPostEditor
      categories={categories}
      authors={authors}
      currentUserId={currentUserId}
    />
  )
}
