import { JsonLd } from '@/lib/seo/jsonld'

interface YouTubeEmbedProps {
  videoId: string
  title?: string
  description?: string
  publishedAt?: string
  thumbnailUrl?: string
  duration?: string // ISO 8601 duration, e.g. "PT15M33S"
  className?: string
}

export function YouTubeEmbed({
  videoId,
  title,
  description,
  publishedAt,
  thumbnailUrl,
  duration,
  className,
}: YouTubeEmbedProps) {
  const embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}`
  const thumbnail = thumbnailUrl || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`

  // Only emit VideoObject JSON-LD when required fields are present
  const hasRequiredFields = title && description && publishedAt
  const videoObjectData = hasRequiredFields
    ? {
        '@context': 'https://schema.org',
        '@type': 'VideoObject',
        name: title,
        description,
        thumbnailUrl: [thumbnail],
        uploadDate: publishedAt,
        embedUrl,
        contentUrl: `https://www.youtube.com/watch?v=${videoId}`,
        ...(duration && { duration }),
      }
    : null

  return (
    <>
      <div
        className={className}
        style={{ position: 'relative', width: '100%', aspectRatio: '16/9' }}
      >
        <iframe
          src={embedUrl}
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
          title={title || 'YouTube video'}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            border: 0,
          }}
        />
      </div>
      {videoObjectData && <JsonLd data={videoObjectData} />}
    </>
  )
}
