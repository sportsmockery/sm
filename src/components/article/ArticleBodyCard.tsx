import { ReactNode } from 'react'

interface ArticleBodyCardProps {
  children: ReactNode
}

export default function ArticleBodyCard({ children }: ArticleBodyCardProps) {
  return (
    <div className="article-glass-card" style={{ marginTop: 24 }}>
      {children}
    </div>
  )
}
