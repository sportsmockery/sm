import '@/styles/home.css'
import HomeNav from '@/components/home/HomeNav'
import HomeFooter from '@/components/home/HomeFooter'

export default function HomeLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="hm-root">
      <HomeNav />
      {children}
      <HomeFooter />
    </div>
  )
}
