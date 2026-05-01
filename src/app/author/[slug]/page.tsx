import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { format } from 'date-fns'
import {
  canonicalUrl,
  JsonLd,
  personJsonLd,
  breadcrumbJsonLd,
} from '@/lib/seo'
import {
  getAuthorBySlug,
  getAllActiveAuthors,
  getArticlesByAuthorId,
} from '@/lib/data/authors'

interface AuthorSlugPageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const authors = await getAllActiveAuthors()
  return authors
    .filter((a) => Boolean(a.slug))
    .map((a) => ({ slug: a.slug as string }))
}

export async function generateMetadata({
  params,
}: AuthorSlugPageProps): Promise<Metadata> {
  const { slug } = await params
  const author = await getAuthorBySlug(slug)
  if (!author) {
    return { title: 'Author Not Found | SportsMockery' }
  }

  const description =
    author.bio?.slice(0, 160) ||
    `Articles by ${author.display_name} on SportsMockery — Chicago's premier sports coverage.`

  return {
    title: `${author.display_name} | SportsMockery`,
    description,
    alternates: { canonical: canonicalUrl(`/author/${slug}`) },
    openGraph: {
      title: `${author.display_name} | SportsMockery`,
      description,
      type: 'profile',
      url: canonicalUrl(`/author/${slug}`),
      images: author.avatar_url ? [{ url: author.avatar_url }] : undefined,
    },
    twitter: {
      card: 'summary',
      title: `${author.display_name} | SportsMockery`,
      description,
    },
  }
}

export default async function AuthorBySlugPage({ params }: AuthorSlugPageProps) {
  const { slug } = await params
  const author = await getAuthorBySlug(slug)
  if (!author) notFound()

  const articles = await getArticlesByAuthorId(author.id, 20)

  const sameAs = [
    ...(author.same_as ?? []),
    ...(author.twitter_url ? [author.twitter_url] : []),
    ...(author.facebook_url ? [author.facebook_url] : []),
    ...(author.instagram_url ? [author.instagram_url] : []),
  ].filter((u, i, arr) => arr.indexOf(u) === i)

  return (
    <>
      <JsonLd
        data={personJsonLd({
          slug,
          name: author.display_name,
          bio: author.bio,
          headshotUrl: author.avatar_url,
          jobTitle: author.job_title,
          alumniOf: author.alumni_of,
          knowsAbout: author.knows_about,
          sameAs,
        })}
      />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Home', url: '/' },
          { name: 'Authors', url: '/authors' },
          { name: author.display_name, url: `/author/${slug}` },
        ])}
      />

      <article style={{ maxWidth: 960, margin: '0 auto', padding: '48px 16px' }}>
        <header style={{ display: 'flex', gap: 24, alignItems: 'flex-start', marginBottom: 40 }}>
          {author.avatar_url && (
            <Image
              src={author.avatar_url}
              alt={author.display_name}
              width={120}
              height={120}
              style={{ borderRadius: '50%', flexShrink: 0 }}
            />
          )}
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 8 }}>
              {author.display_name}
            </h1>
            {author.job_title && (
              <p style={{ fontSize: 18, color: 'var(--text-secondary)', marginBottom: 12 }}>
                {author.job_title}
              </p>
            )}
            {author.bio && (
              <p style={{ fontSize: 16, lineHeight: 1.6 }}>{author.bio}</p>
            )}
          </div>
        </header>

        <h2 style={{ fontSize: 24, fontWeight: 600, marginBottom: 20 }}>Latest articles</h2>

        {articles.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)' }}>No published articles yet.</p>
        ) : (
          <ul style={{ display: 'grid', gap: 24, listStyle: 'none', padding: 0 }}>
            {articles.map((a) => (
              <li
                key={a.id}
                style={{
                  borderRadius: 14,
                  border: '1px solid rgba(0,0,0,0.08)',
                  padding: 20,
                }}
              >
                <Link
                  href={`/${a.category?.slug ?? 'news'}/${a.slug}`}
                  style={{
                    display: 'block',
                    fontSize: 20,
                    fontWeight: 500,
                    marginBottom: 6,
                    color: 'inherit',
                  }}
                >
                  {a.title}
                </Link>
                {a.excerpt && (
                  <p style={{ fontSize: 15, lineHeight: 1.5, marginBottom: 8 }}>{a.excerpt}</p>
                )}
                <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                  {a.category?.name && <span>{a.category.name} · </span>}
                  <time dateTime={a.published_at}>
                    {format(new Date(a.published_at), 'MMM d, yyyy')}
                  </time>
                </div>
              </li>
            ))}
          </ul>
        )}
      </article>
    </>
  )
}
