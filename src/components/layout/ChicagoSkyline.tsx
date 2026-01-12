interface ChicagoSkylineProps {
  className?: string
  color?: string
}

export default function ChicagoSkyline({ className = '', color = 'currentColor' }: ChicagoSkylineProps) {
  return (
    <svg
      viewBox="0 0 1200 200"
      fill={color}
      className={`w-full ${className}`}
      preserveAspectRatio="xMidYMax slice"
    >
      {/* Willis Tower */}
      <rect x="100" y="20" width="60" height="180" />
      <rect x="110" y="10" width="40" height="10" />
      <rect x="115" y="0" width="30" height="10" />

      {/* Trump Tower */}
      <rect x="200" y="40" width="40" height="160" />
      <rect x="208" y="30" width="24" height="10" />
      <rect x="214" y="20" width="12" height="10" />

      {/* AON Center */}
      <rect x="280" y="30" width="45" height="170" />

      {/* John Hancock */}
      <rect x="360" y="25" width="50" height="175" />
      <polygon points="360,25 385,0 410,25" />
      <rect x="370" y="10" width="30" height="15" />

      {/* Building cluster */}
      <rect x="450" y="60" width="35" height="140" />
      <rect x="490" y="80" width="30" height="120" />
      <rect x="525" y="50" width="40" height="150" />
      <rect x="570" y="70" width="35" height="130" />

      {/* Marina City Towers */}
      <rect x="650" y="50" width="25" height="150" />
      <rect x="680" y="50" width="25" height="150" />

      {/* Mid-rise buildings */}
      <rect x="750" y="90" width="40" height="110" />
      <rect x="795" y="70" width="35" height="130" />
      <rect x="835" y="100" width="30" height="100" />

      {/* Prudential buildings */}
      <rect x="900" y="45" width="45" height="155" />
      <rect x="950" y="60" width="40" height="140" />

      {/* Eastern cluster */}
      <rect x="1020" y="80" width="35" height="120" />
      <rect x="1060" y="60" width="40" height="140" />
      <rect x="1105" y="90" width="30" height="110" />
      <rect x="1140" y="70" width="35" height="130" />
    </svg>
  )
}
