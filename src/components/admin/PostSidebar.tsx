'use client'

import { useState } from 'react'
import PublishPanel from './PublishPanel'
import CategorySelector from './CategorySelector'
import FeaturedImagePicker from './FeaturedImagePicker'
import SEOFields from './SEOFields'

interface PostSidebarProps {
  post: {
    status: string
    publishDate: string | null
    visibility: string
    categoryId: number | null
    authorId: number | null
    featuredImage: string | null
    seoTitle: string
    seoDescription: string
    ogImage: string | null
  }
  categories: { id: number; name: string; slug: string; parent_id?: number | null }[]
  authors: { id: number; name: string }[]
  onPostChange: (updates: Partial<PostSidebarProps['post']>) => void
  onPublish: () => void
  onSaveDraft: () => void
  isLoading?: boolean
  isNew?: boolean
}

export default function PostSidebar({
  post,
  categories,
  authors,
  onPostChange,
  onPublish,
  onSaveDraft,
  isLoading = false,
  isNew = true,
}: PostSidebarProps) {
  const [expandedSections, setExpandedSections] = useState({
    publish: true,
    category: true,
    author: true,
    featuredImage: true,
    seo: false,
  })

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  return (
    <div className="space-y-4">
      {/* Publish Panel */}
      <PublishPanel
        status={post.status}
        publishDate={post.publishDate}
        visibility={post.visibility}
        onStatusChange={(status) => onPostChange({ status })}
        onPublishDateChange={(publishDate) => onPostChange({ publishDate })}
        onVisibilityChange={(visibility) => onPostChange({ visibility })}
        onPublish={onPublish}
        onSaveDraft={onSaveDraft}
        isLoading={isLoading}
        isNew={isNew}
      />

      {/* Category Section */}
      <div className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <button
          onClick={() => toggleSection('category')}
          className="flex w-full items-center justify-between px-4 py-3"
        >
          <span className="font-medium text-zinc-900 dark:text-white">Category</span>
          <svg
            className={`h-5 w-5 text-zinc-500 transition-transform ${expandedSections.category ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        </button>
        {expandedSections.category && (
          <div className="border-t border-zinc-200 px-4 py-4 dark:border-zinc-800">
            <CategorySelector
              categories={categories}
              selectedId={post.categoryId}
              onSelect={(categoryId) => onPostChange({ categoryId })}
            />
          </div>
        )}
      </div>

      {/* Author Section */}
      <div className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <button
          onClick={() => toggleSection('author')}
          className="flex w-full items-center justify-between px-4 py-3"
        >
          <span className="font-medium text-zinc-900 dark:text-white">Author</span>
          <svg
            className={`h-5 w-5 text-zinc-500 transition-transform ${expandedSections.author ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        </button>
        {expandedSections.author && (
          <div className="border-t border-zinc-200 px-4 py-4 dark:border-zinc-800">
            <select
              value={post.authorId || ''}
              onChange={(e) => onPostChange({ authorId: e.target.value ? Number(e.target.value) : null })}
              className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-[#8B0000] focus:outline-none focus:ring-1 focus:ring-[#8B0000] dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
            >
              <option value="">Select author</option>
              {authors.map((author) => (
                <option key={author.id} value={author.id}>
                  {author.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Featured Image Section */}
      <div className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <button
          onClick={() => toggleSection('featuredImage')}
          className="flex w-full items-center justify-between px-4 py-3"
        >
          <span className="font-medium text-zinc-900 dark:text-white">Featured Image</span>
          <svg
            className={`h-5 w-5 text-zinc-500 transition-transform ${expandedSections.featuredImage ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        </button>
        {expandedSections.featuredImage && (
          <div className="border-t border-zinc-200 px-4 py-4 dark:border-zinc-800">
            <FeaturedImagePicker
              currentImage={post.featuredImage}
              onImageSelect={(url) => onPostChange({ featuredImage: url })}
              onRemove={() => onPostChange({ featuredImage: null })}
            />
          </div>
        )}
      </div>

      {/* SEO Section */}
      <div className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <button
          onClick={() => toggleSection('seo')}
          className="flex w-full items-center justify-between px-4 py-3"
        >
          <span className="font-medium text-zinc-900 dark:text-white">SEO Settings</span>
          <svg
            className={`h-5 w-5 text-zinc-500 transition-transform ${expandedSections.seo ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        </button>
        {expandedSections.seo && (
          <div className="border-t border-zinc-200 px-4 py-4 dark:border-zinc-800">
            <SEOFields
              seoTitle={post.seoTitle}
              seoDescription={post.seoDescription}
              ogImage={post.ogImage}
              onSeoTitleChange={(seoTitle) => onPostChange({ seoTitle })}
              onSeoDescriptionChange={(seoDescription) => onPostChange({ seoDescription })}
              onOgImageChange={(ogImage) => onPostChange({ ogImage })}
            />
          </div>
        )}
      </div>
    </div>
  )
}
