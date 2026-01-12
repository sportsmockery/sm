'use client'

import { useState, useEffect, useCallback } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import Placeholder from '@tiptap/extension-placeholder'
import PostEditorToolbar from './PostEditorToolbar'

interface PostFormProps {
  initialData?: {
    title: string
    slug: string
    content: string
    excerpt: string
  }
  onDataChange: (data: { title: string; slug: string; content: string; excerpt: string }) => void
  onInsertImage?: () => void
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export default function PostForm({ initialData, onDataChange, onInsertImage }: PostFormProps) {
  const [title, setTitle] = useState(initialData?.title || '')
  const [slug, setSlug] = useState(initialData?.slug || '')
  const [excerpt, setExcerpt] = useState(initialData?.excerpt || '')
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false)

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-[#8B0000] underline hover:text-red-700',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'rounded-lg max-w-full',
        },
      }),
      Placeholder.configure({
        placeholder: 'Start writing your post...',
      }),
    ],
    content: initialData?.content || '',
    editorProps: {
      attributes: {
        class:
          'prose prose-zinc dark:prose-invert max-w-none min-h-[400px] px-6 py-4 focus:outline-none',
      },
    },
    onUpdate: ({ editor }) => {
      onDataChange({
        title,
        slug,
        content: editor.getHTML(),
        excerpt,
      })
    },
  })

  // Update parent when form fields change
  useEffect(() => {
    if (editor) {
      onDataChange({
        title,
        slug,
        content: editor.getHTML(),
        excerpt,
      })
    }
  }, [title, slug, excerpt, editor, onDataChange])

  // Auto-generate slug from title
  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle)
    if (!slugManuallyEdited) {
      setSlug(generateSlug(newTitle))
    }
  }

  const handleSlugChange = (newSlug: string) => {
    setSlugManuallyEdited(true)
    setSlug(generateSlug(newSlug))
  }

  return (
    <div className="space-y-6">
      {/* Title Input */}
      <div>
        <label htmlFor="title" className="mb-2 block text-sm font-medium text-zinc-900 dark:text-white">
          Title
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          placeholder="Enter post title..."
          className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-3 text-lg font-semibold text-zinc-900 placeholder-zinc-400 focus:border-[#8B0000] focus:outline-none focus:ring-1 focus:ring-[#8B0000] dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:placeholder-zinc-500"
        />
      </div>

      {/* Slug Input */}
      <div>
        <label htmlFor="slug" className="mb-2 block text-sm font-medium text-zinc-900 dark:text-white">
          Slug
        </label>
        <div className="flex items-center">
          <span className="rounded-l-lg border border-r-0 border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400">
            sportsmockery.com/
          </span>
          <input
            id="slug"
            type="text"
            value={slug}
            onChange={(e) => handleSlugChange(e.target.value)}
            placeholder="post-slug"
            className="flex-1 rounded-r-lg border border-zinc-200 bg-white px-4 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-[#8B0000] focus:outline-none focus:ring-1 focus:ring-[#8B0000] dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:placeholder-zinc-500"
          />
        </div>
      </div>

      {/* Rich Text Editor */}
      <div>
        <label className="mb-2 block text-sm font-medium text-zinc-900 dark:text-white">Content</label>
        <div className="overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-700">
          <PostEditorToolbar editor={editor} onInsertImage={onInsertImage} />
          <EditorContent editor={editor} />
        </div>
      </div>

      {/* Excerpt */}
      <div>
        <label htmlFor="excerpt" className="mb-2 block text-sm font-medium text-zinc-900 dark:text-white">
          Excerpt
        </label>
        <textarea
          id="excerpt"
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          placeholder="Brief summary of the post (displayed in listings)..."
          rows={3}
          className="w-full resize-none rounded-lg border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 placeholder-zinc-400 focus:border-[#8B0000] focus:outline-none focus:ring-1 focus:ring-[#8B0000] dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:placeholder-zinc-500"
        />
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
          {excerpt.length} / 160 characters recommended
        </p>
      </div>
    </div>
  )
}
