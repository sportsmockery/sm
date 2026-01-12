import Image from 'next/image'
import AuthorSocial from './AuthorSocial'
import FollowButton from './FollowButton'
import { format } from 'date-fns'

interface AuthorHeaderProps {
  author: {
    id: number
    name: string
    slug?: string
    avatar_url?: string
    bio?: string
    title?: string
    twitter_url?: string
    facebook_url?: string
    instagram_url?: string
    email?: string
    joined_at?: string
  }
  postCount: number
  totalViews?: number
  className?: string
}

export default function AuthorHeader({
  author,
  postCount,
  totalViews = 0,
  className = '',
}: AuthorHeaderProps) {
  return (
    <header
      className={`relative overflow-hidden bg-gradient-to-br from-zinc-900 via-zinc-800 to-[#8B0000]/30 py-16 lg:py-24 ${className}`}
    >
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      <div className="relative mx-auto max-w-7xl px-4">
        <div className="flex flex-col items-center gap-6 lg:flex-row lg:items-start lg:gap-10">
          {/* Avatar */}
          <div className="relative">
            <div className="relative h-32 w-32 overflow-hidden rounded-full ring-4 ring-[#8B0000]/50 lg:h-40 lg:w-40">
              {author.avatar_url ? (
                <Image
                  src={author.avatar_url}
                  alt={author.name}
                  fill
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#8B0000] to-[#FF6666] text-5xl font-bold text-white lg:text-6xl">
                  {author.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            {/* Verified badge (optional) */}
            <div className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-[#8B0000] text-white ring-4 ring-zinc-900">
              <svg
                className="h-4 w-4"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
              </svg>
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 text-center lg:text-left">
            <h1 className="mb-2 font-heading text-3xl font-black text-white sm:text-4xl lg:text-5xl">
              {author.name}
            </h1>
            {author.title && (
              <p className="mb-3 text-lg text-[#FF6666]">{author.title}</p>
            )}
            {author.bio && (
              <p className="mb-4 max-w-2xl text-zinc-300">{author.bio}</p>
            )}

            {/* Stats */}
            <div className="mb-6 flex flex-wrap justify-center gap-6 lg:justify-start">
              <div className="text-center lg:text-left">
                <p className="text-2xl font-bold text-white">
                  {postCount.toLocaleString()}
                </p>
                <p className="text-sm text-zinc-400">Articles</p>
              </div>
              <div className="text-center lg:text-left">
                <p className="text-2xl font-bold text-white">
                  {totalViews.toLocaleString()}
                </p>
                <p className="text-sm text-zinc-400">Total Views</p>
              </div>
              {author.joined_at && (
                <div className="text-center lg:text-left">
                  <p className="text-2xl font-bold text-white">
                    {format(new Date(author.joined_at), 'yyyy')}
                  </p>
                  <p className="text-sm text-zinc-400">Joined</p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-wrap justify-center gap-3 lg:justify-start">
              <FollowButton authorId={author.id} authorName={author.name} />
              <AuthorSocial
                twitter={author.twitter_url}
                facebook={author.facebook_url}
                instagram={author.instagram_url}
                email={author.email}
              />
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
