interface ChicagoSkylineProps {
  className?: string
  color?: string
  opacity?: number
}

export default function ChicagoSkyline({
  className = '',
  color = 'currentColor',
  opacity = 0.1,
}: ChicagoSkylineProps) {
  return (
    <svg
      viewBox="0 0 1440 200"
      className={className}
      style={{ color, opacity }}
      preserveAspectRatio="xMidYMax slice"
      fill="currentColor"
    >
      {/* Willis Tower (Sears Tower) */}
      <rect x="200" y="20" width="40" height="180" />
      <rect x="210" y="10" width="20" height="10" />
      <rect x="215" y="0" width="10" height="10" />

      {/* Trump Tower */}
      <rect x="280" y="40" width="35" height="160" />
      <rect x="290" y="30" width="15" height="10" />

      {/* Aon Center */}
      <rect x="340" y="35" width="45" height="165" />

      {/* John Hancock */}
      <path d="M420,200 L420,25 L430,20 L450,20 L460,25 L460,200" />
      <rect x="435" y="5" width="10" height="15" />

      {/* 875 N Michigan (old John Hancock) */}
      <rect x="500" y="50" width="30" height="150" />

      {/* Various smaller buildings */}
      <rect x="100" y="100" width="25" height="100" />
      <rect x="130" y="80" width="20" height="120" />
      <rect x="155" y="120" width="30" height="80" />

      <rect x="550" y="90" width="25" height="110" />
      <rect x="580" y="110" width="20" height="90" />
      <rect x="610" y="70" width="35" height="130" />

      {/* Marina City (corn cobs) */}
      <ellipse cx="680" cy="130" rx="20" ry="70" />
      <ellipse cx="720" cy="130" rx="20" ry="70" />

      {/* More buildings */}
      <rect x="760" y="85" width="30" height="115" />
      <rect x="800" y="95" width="25" height="105" />
      <rect x="830" y="75" width="40" height="125" />

      {/* Merchandise Mart style */}
      <rect x="890" y="120" width="80" height="80" />

      {/* Right side buildings */}
      <rect x="990" y="90" width="35" height="110" />
      <rect x="1030" y="60" width="30" height="140" />
      <rect x="1070" y="100" width="25" height="100" />

      {/* 311 South Wacker */}
      <rect x="1120" y="40" width="35" height="160" />
      <rect x="1130" y="25" width="15" height="15" />

      {/* Chase Tower */}
      <rect x="1180" y="55" width="40" height="145" />

      {/* Two Prudential Plaza */}
      <path d="M1250,200 L1250,45 L1270,30 L1290,45 L1290,200" />

      {/* Far right buildings */}
      <rect x="1320" y="95" width="25" height="105" />
      <rect x="1350" y="110" width="30" height="90" />
      <rect x="1390" y="80" width="35" height="120" />

      {/* Ground line */}
      <rect x="0" y="195" width="1440" height="5" />
    </svg>
  )
}
