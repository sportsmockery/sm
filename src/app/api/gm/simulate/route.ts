import { NextRequest, NextResponse } from 'next/server'
import { getGMAuthUser } from '@/lib/gm-auth'

export const dynamic = 'force-dynamic'

const DATALAB_URL = 'https://datalab.sportsmockery.com'

interface SimulationRequest {
  trade_id: string
  original_grade: number
  num_simulations?: number // default 1000
  player_volatility?: 'low' | 'medium' | 'high' // How much player performance varies
  injury_factor?: boolean // Include injury risk
  development_factor?: boolean // Include player development curves
}

interface SimulationResult {
  num_simulations: number
  original_grade: number
  mean_grade: number
  median_grade: number
  std_deviation: number
  percentiles: {
    p5: number
    p10: number
    p25: number
    p50: number
    p75: number
    p90: number
    p95: number
  }
  distribution: Array<{
    grade_bucket: number // 0-10, 10-20, etc.
    count: number
    percentage: number
  }>
  risk_analysis: {
    downside_risk: number // % chance of grade below 50
    upside_potential: number // % chance of grade above 80
    variance_band: [number, number] // 90% confidence interval
  }
  key_factors: Array<{
    factor: string
    impact: 'positive' | 'negative' | 'neutral'
    magnitude: number
    description: string
  }>
}

export async function POST(request: NextRequest) {
  try {
    const user = await getGMAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const body: SimulationRequest = await request.json()

    if (!body.trade_id || body.original_grade === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const numSimulations = body.num_simulations || 1000

    // Try Data Lab first for proper Monte Carlo
    try {
      const res = await fetch(`${DATALAB_URL}/api/gm/simulate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Source': 'sportsmockery.com',
          'X-User-Id': user.id,
        },
        body: JSON.stringify(body),
      })

      if (res.ok) {
        const data = await res.json()
        return NextResponse.json(data)
      }
    } catch {
      // Fall through to local simulation
    }

    // Local Monte Carlo simulation
    const result = runLocalSimulation(body.original_grade, numSimulations, {
      volatility: body.player_volatility || 'medium',
      includeInjury: body.injury_factor ?? true,
      includeDevelopment: body.development_factor ?? true,
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('GM simulate error:', error)
    return NextResponse.json({ error: 'Failed to run simulation' }, { status: 500 })
  }
}

function runLocalSimulation(
  originalGrade: number,
  numSimulations: number,
  options: { volatility: string; includeInjury: boolean; includeDevelopment: boolean }
): SimulationResult {
  // Volatility affects the standard deviation
  const volatilityMap = { low: 5, medium: 10, high: 18 }
  const baseStdDev = volatilityMap[options.volatility as keyof typeof volatilityMap] || 10

  // Run simulations
  const results: number[] = []
  const buckets: number[] = Array(10).fill(0)

  for (let i = 0; i < numSimulations; i++) {
    let simGrade = originalGrade

    // Base random variance (normal distribution approximation using Box-Muller)
    const u1 = Math.random()
    const u2 = Math.random()
    const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)
    simGrade += z * baseStdDev

    // Injury factor - can significantly lower grade
    if (options.includeInjury && Math.random() < 0.15) { // 15% injury chance
      const severityDrop = -Math.random() * 20 // Up to -20 points
      simGrade += severityDrop
    }

    // Development factor - slight positive bias for younger player trades
    if (options.includeDevelopment) {
      const devBonus = (Math.random() - 0.4) * 8 // Slight positive skew
      simGrade += devBonus
    }

    // Clamp to 0-100
    simGrade = Math.max(0, Math.min(100, Math.round(simGrade)))
    results.push(simGrade)

    // Add to bucket
    const bucketIdx = Math.min(9, Math.floor(simGrade / 10))
    buckets[bucketIdx]++
  }

  // Sort for percentile calculations
  results.sort((a, b) => a - b)

  // Calculate statistics
  const mean = results.reduce((a, b) => a + b, 0) / numSimulations
  const median = results[Math.floor(numSimulations / 2)]
  const variance = results.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / numSimulations
  const stdDev = Math.sqrt(variance)

  // Percentiles
  const percentile = (p: number) => results[Math.floor((p / 100) * numSimulations)]

  // Distribution
  const distribution = buckets.map((count, i) => ({
    grade_bucket: i * 10,
    count,
    percentage: Math.round((count / numSimulations) * 100),
  }))

  // Risk analysis
  const belowFifty = results.filter(g => g < 50).length
  const aboveEighty = results.filter(g => g >= 80).length

  // Key factors
  const keyFactors = [
    {
      factor: 'Player Volatility',
      impact: options.volatility === 'high' ? 'negative' : 'neutral' as 'positive' | 'negative' | 'neutral',
      magnitude: options.volatility === 'high' ? 0.7 : options.volatility === 'medium' ? 0.4 : 0.2,
      description: `${options.volatility.charAt(0).toUpperCase() + options.volatility.slice(1)} player performance variance increases outcome uncertainty.`,
    },
    {
      factor: 'Injury Risk',
      impact: 'negative' as const,
      magnitude: options.includeInjury ? 0.5 : 0,
      description: options.includeInjury ? 'Injury scenarios can significantly impact trade value.' : 'Injury risk not factored.',
    },
    {
      factor: 'Development Potential',
      impact: 'positive' as const,
      magnitude: options.includeDevelopment ? 0.3 : 0,
      description: options.includeDevelopment ? 'Player development curve may improve long-term value.' : 'Development not factored.',
    },
  ]

  return {
    num_simulations: numSimulations,
    original_grade: originalGrade,
    mean_grade: Math.round(mean * 10) / 10,
    median_grade: median,
    std_deviation: Math.round(stdDev * 10) / 10,
    percentiles: {
      p5: percentile(5),
      p10: percentile(10),
      p25: percentile(25),
      p50: percentile(50),
      p75: percentile(75),
      p90: percentile(90),
      p95: percentile(95),
    },
    distribution,
    risk_analysis: {
      downside_risk: Math.round((belowFifty / numSimulations) * 100),
      upside_potential: Math.round((aboveEighty / numSimulations) * 100),
      variance_band: [percentile(5), percentile(95)],
    },
    key_factors: keyFactors,
  }
}
