// Skip build-time static generation for team pages — DataLab may be unreachable during builds.
// Pages still use ISR via individual revalidate exports at runtime.
export const dynamic = 'force-dynamic'

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
