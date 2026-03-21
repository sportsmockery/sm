'use client'

export default function FreestarDashboard() {
  return (
    <iframe
      src="/admin/freestar/index.html"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        border: 'none',
        zIndex: 9999,
      }}
      title="Freestar Revenue Intelligence"
    />
  )
}
