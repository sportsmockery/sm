'use client'



// Stadium configurations for each team
const STADIUM_CONFIG: Record<string, {
  name: string
  buttonText: string
  modelPath: string
  fallbackImage: string
}> = {
  'chicago-bears': {
    name: 'Soldier Field',
    buttonText: 'Tour Soldier Field',
    modelPath: '/models/soldier-field.usdz',
    fallbackImage: '/images/soldier-field.jpg',
  },
  'chicago-cubs': {
    name: 'Wrigley Field',
    buttonText: 'Tour Wrigley Field',
    modelPath: '/models/wrigley-field.usdz',
    fallbackImage: '/images/wrigley-field.jpg',
  },
  'chicago-white-sox': {
    name: 'Guaranteed Rate Field',
    buttonText: 'Tour Guaranteed Rate Field',
    modelPath: '/models/guaranteed-rate-field.usdz',
    fallbackImage: '/images/guaranteed-rate-field.jpg',
  },
  'chicago-bulls': {
    name: 'United Center',
    buttonText: 'Tour United Center',
    modelPath: '/models/united-center.usdz',
    fallbackImage: '/images/united-center.jpg',
  },
  'chicago-blackhawks': {
    name: 'United Center',
    buttonText: 'Tour United Center',
    modelPath: '/models/united-center.usdz',
    fallbackImage: '/images/united-center.jpg',
  },
}

interface ARQuickLookButtonProps {
  team: string
  className?: string
}

/**
 * AR Quick Look Button
 *
 * iOS-specific AR experience using Apple's AR Quick Look:
 * - Uses <a href="model.usdz" rel="ar"> for native iOS AR
 * - Opens directly in Safari's AR mode
 * - Places 3D model in user's physical space
 *
 * Requirements:
 * - iPhone 6s or later with iOS 12+
 * - Safari browser
 * - .usdz file in /public/models/
 */
export default function ARQuickLookButton({ team, className = '' }: ARQuickLookButtonProps) {
  const config = STADIUM_CONFIG[team]

  if (!config) {
    return null
  }

  return (
    <div className={`p-4 ${className}`} style={{ backgroundColor: 'var(--sm-surface)', border: '1px solid var(--sm-border)' }}>
      <h3 className={`text-lg mb-2 `} style={{ color: 'var(--sm-text)' }}>
        AR Stadium Tour
      </h3>

      <p className="text-sm mb-4 font-serif" style={{ color: 'var(--sm-text-muted)' }}>
        Place {config.name} in your room using AR!
      </p>

      {/* AR Quick Look Link - iOS Safari detects rel="ar" */}
      <a
        href={config.modelPath}
        rel="ar"
        className={`
          block w-full text-center px-4 py-3
          bg-[#FF0000] hover:bg-red-700
          text-white font-bold rounded
          transition-colors
          focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2 focus:ring-offset-zinc-900
          
        `}
        aria-label={`View ${config.name} in augmented reality`}
      >
        {/* AR icon */}
        <span className="inline-flex items-center gap-2">
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
            />
          </svg>
          {config.buttonText}
        </span>

        {/* Fallback image for non-AR browsers */}
        <img
          src={config.fallbackImage}
          alt={`${config.name} preview`}
          className="hidden"
          aria-hidden="true"
        />
      </a>

      {/* Fallback note */}
      <p className="text-xs mt-3 text-center" style={{ color: 'var(--sm-text-muted)' }}>
        Best on iPhone (Safari) – place the stadium in your room!
      </p>

      {/* Device compatibility note */}
      <p className="text-[10px] mt-2 text-center" style={{ color: 'var(--sm-text-muted)' }}>
        Requires iPhone 6s+ with iOS 12+ and Safari
      </p>
    </div>
  )
}
