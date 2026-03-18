export function LiveBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[13px] font-medium text-white" style={{ backgroundColor: '#BC0000' }}>
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: '#fff' }} />
        <span className="relative inline-flex rounded-full h-2 w-2" style={{ backgroundColor: '#fff' }} />
      </span>
      LIVE
    </span>
  )
}
