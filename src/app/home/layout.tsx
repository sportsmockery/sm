import type { Metadata } from 'next'
import '@/styles/home.css'
import HomeNav from '@/components/home/HomeNav'
import HomeFooter from '@/components/home/HomeFooter'

export const metadata: Metadata = {
  title: {
    template: '%s | Sports Mockery',
    default: 'Sports Mockery',
  },
}

export default function HomeLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="hm-root">
      <HomeNav />
      {children}
      <HomeFooter />
    </div>
  )
}
