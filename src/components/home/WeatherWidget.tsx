'use client'

import { useState, useEffect } from 'react'

interface WeatherData {
  temperature: number
  condition: 'sunny' | 'cloudy' | 'rainy' | 'snowy' | 'windy' | 'partly-cloudy'
  humidity: number
  wind: number
  location: string
}

// Mock weather data - in production, this would come from an API
const mockWeather: WeatherData = {
  temperature: 28,
  condition: 'partly-cloudy',
  humidity: 65,
  wind: 15,
  location: 'Chicago, IL',
}

const weatherIcons: Record<WeatherData['condition'], string> = {
  sunny: '☀️',
  cloudy: '☁️',
  rainy: '🌧️',
  snowy: '❄️',
  windy: '💨',
  'partly-cloudy': '⛅',
}

const weatherDescriptions: Record<WeatherData['condition'], string> = {
  sunny: 'Sunny',
  cloudy: 'Cloudy',
  rainy: 'Rainy',
  snowy: 'Snowy',
  windy: 'Windy',
  'partly-cloudy': 'Partly Cloudy',
}

interface WeatherWidgetProps {
  className?: string
}

export default function WeatherWidget({ className = '' }: WeatherWidgetProps) {
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate API fetch
    const fetchWeather = async () => {
      setIsLoading(true)
      // In production, fetch from weather API
      await new Promise((resolve) => setTimeout(resolve, 500))
      setWeather(mockWeather)
      setIsLoading(false)
    }

    fetchWeather()
  }, [])

  if (isLoading) {
    return (
      <div className={`rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 p-4 ${className}`}>
        <div className="animate-pulse">
          <div className="mb-2 h-4 w-20 rounded bg-white/20" />
          <div className="h-8 w-16 rounded bg-white/20" />
        </div>
      </div>
    )
  }

  if (!weather) return null

  return (
    <div
      className={`
        relative overflow-hidden rounded-xl
        bg-gradient-to-br from-blue-500 to-blue-600 p-4
        ${className}
      `}
    >
      {/* Background decoration */}
      <div className="absolute -right-4 -top-4 text-6xl opacity-20">
        {weatherIcons[weather.condition]}
      </div>

      {/* Content */}
      <div className="relative">
        {/* Location */}
        <div className="mb-1 flex items-center gap-1 text-xs text-white/80">
          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
          </svg>
          {weather.location}
        </div>

        {/* Temperature and condition */}
        <div className="flex items-center gap-3">
          <span className="text-3xl font-bold text-white">
            {weather.temperature}°F
          </span>
          <span className="text-2xl">
            {weatherIcons[weather.condition]}
          </span>
        </div>

        {/* Condition description */}
        <p className="mb-2 text-sm text-white/90">
          {weatherDescriptions[weather.condition]}
        </p>

        {/* Details */}
        <div className="flex gap-4 text-xs text-white/70">
          <span className="flex items-center gap-1">
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
            </svg>
            {weather.humidity}% humidity
          </span>
          <span className="flex items-center gap-1">
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.115 5.19l.319 1.913A6 6 0 008.11 10.36L9.75 12l-.387.775c-.217.433-.132.956.21 1.298l1.348 1.348c.21.21.329.497.329.795v1.089c0 .426.24.815.622 1.006l.153.076c.433.217.956.132 1.298-.21l.723-.723a8.7 8.7 0 002.288-4.042 1.087 1.087 0 00-.358-1.099l-1.33-1.108c-.251-.21-.582-.299-.905-.245l-1.17.195a1.125 1.125 0 01-.98-.314l-.295-.295a1.125 1.125 0 010-1.591l.13-.132a1.125 1.125 0 011.3-.21l.603.302a.809.809 0 001.086-1.086L14.25 7.5l1.256-.837a4.5 4.5 0 001.528-1.732l.146-.292M6.115 5.19A9 9 0 1017.18 4.64M6.115 5.19A8.965 8.965 0 0112 3c1.929 0 3.716.607 5.18 1.64" />
            </svg>
            {weather.wind} mph
          </span>
        </div>

        {/* Game day weather note */}
        <div className="mt-3 rounded-lg bg-white/10 px-2 py-1.5 text-xs text-white/90">
          <span className="font-semibold">Game Day:</span> Perfect weather for the Bears vs Packers
        </div>
      </div>
    </div>
  )
}

// Compact version for sidebar
export function WeatherWidgetCompact({ className = '' }: WeatherWidgetProps) {
  return (
    <div className={`flex items-center gap-2 rounded-lg bg-blue-500/10 px-3 py-2 ${className}`}>
      <span className="text-lg">⛅</span>
      <div>
        <span className="text-sm font-semibold" style={{ color: 'var(--sm-text)' }}>28°F</span>
        <span className="ml-1 text-xs" style={{ color: 'var(--sm-text-muted)' }}>Chicago</span>
      </div>
    </div>
  )
}
