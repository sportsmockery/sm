'use client'

interface SEOFieldsProps {
  seoTitle: string
  seoDescription: string
  ogImage: string | null
  onSeoTitleChange: (value: string) => void
  onSeoDescriptionChange: (value: string) => void
  onOgImageChange: (value: string | null) => void
}

export default function SEOFields({
  seoTitle,
  seoDescription,
  ogImage,
  onSeoTitleChange,
  onSeoDescriptionChange,
  onOgImageChange,
}: SEOFieldsProps) {
  const titleLength = seoTitle.length
  const descriptionLength = seoDescription.length
  const titleOptimal = titleLength >= 50 && titleLength <= 60
  const descriptionOptimal = descriptionLength >= 150 && descriptionLength <= 160

  return (
    <div className="space-y-4">
      {/* SEO Title */}
      <div>
        <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          SEO Title
        </label>
        <input
          type="text"
          value={seoTitle}
          onChange={(e) => onSeoTitleChange(e.target.value)}
          placeholder="Enter SEO title..."
          className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-[#8B0000] focus:outline-none focus:ring-1 focus:ring-[#8B0000] dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
        />
        <div className="mt-1 flex items-center justify-between text-xs">
          <span className={titleOptimal ? 'text-green-600' : 'text-zinc-500'}>
            Recommended: 50-60 characters
          </span>
          <span className={`${titleLength > 60 ? 'text-amber-500' : 'text-zinc-500'}`}>
            {titleLength}/60
          </span>
        </div>
      </div>

      {/* Meta Description */}
      <div>
        <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Meta Description
        </label>
        <textarea
          value={seoDescription}
          onChange={(e) => onSeoDescriptionChange(e.target.value)}
          placeholder="Enter meta description..."
          rows={3}
          className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-[#8B0000] focus:outline-none focus:ring-1 focus:ring-[#8B0000] dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
        />
        <div className="mt-1 flex items-center justify-between text-xs">
          <span className={descriptionOptimal ? 'text-green-600' : 'text-zinc-500'}>
            Recommended: 150-160 characters
          </span>
          <span className={`${descriptionLength > 160 ? 'text-amber-500' : 'text-zinc-500'}`}>
            {descriptionLength}/160
          </span>
        </div>
      </div>

      {/* OG Image */}
      <div>
        <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Social Image (OG Image)
        </label>
        {ogImage ? (
          <div className="relative">
            <img
              src={ogImage}
              alt="OG preview"
              className="w-full rounded-lg object-cover"
            />
            <button
              onClick={() => onOgImageChange(null)}
              className="absolute right-2 top-2 rounded-full bg-black/50 p-1 text-white hover:bg-black/70"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ) : (
          <div>
            <input
              type="url"
              placeholder="Enter image URL..."
              onChange={(e) => e.target.value && onOgImageChange(e.target.value)}
              className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-[#8B0000] focus:outline-none focus:ring-1 focus:ring-[#8B0000] dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
            />
            <p className="mt-1 text-xs text-zinc-500">
              Recommended: 1200x630 pixels for optimal sharing
            </p>
          </div>
        )}
      </div>

      {/* Preview */}
      <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-700 dark:bg-zinc-800">
        <p className="mb-2 text-xs font-medium uppercase text-zinc-500">Search Preview</p>
        <div className="space-y-1">
          <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
            {seoTitle || 'Page Title'}
          </p>
          <p className="text-xs text-green-700 dark:text-green-500">
            sportsmockery.com/article/slug
          </p>
          <p className="text-xs text-zinc-600 dark:text-zinc-400">
            {seoDescription || 'Meta description will appear here...'}
          </p>
        </div>
      </div>
    </div>
  )
}
