export const metadata = {
  title: 'Freestar Revenue Intelligence',
}

export default function FreestarLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Skip the AdminShell wrapper — dashboard has its own shell
  return <>{children}</>
}
