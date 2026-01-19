import { useMemo } from 'react'
import { Max, WilksScore } from '../types'

function calculateWilksCoefficient(bodyWeight: number): number {
  const a = -216.0475144
  const b = 16.2606339
  const c = -0.002388645
  const d = -0.00113732
  const e = 7.01863e-6
  const f = -1.291e-8
  
  const bw = bodyWeight
  const coefficient = 500 / (a + b * bw + c * bw ** 2 + d * bw ** 3 + e * bw ** 4 + f * bw ** 5)
  
  return coefficient
}

export function useWilksScore(maxes: Max[]): WilksScore[] {
  return useMemo(() => {
    const monthGroups = maxes.reduce((acc, max) => {
      if (!acc[max.month]) {
        acc[max.month] = []
      }
      acc[max.month].push(max)
      return acc
    }, {} as Record<string, Max[]>)
    
    const WilksScore: WilksScore[] = []

    Object.entries(monthGroups).forEach(([month, lifts]) => {
      const bench = lifts.find(l => l.lift === 'Bench')
      const squat = lifts.find(l => l.lift === 'Squat')
      const deadlift = lifts.find(l => l.lift === 'Deadlift')
      
      if (bench && squat && deadlift) {
        const bodyWeight = squat.bodyWeight || deadlift.bodyWeight
        
        if (bodyWeight > 0) {
          const total = bench.weight + squat.weight + deadlift.weight
          const wilksCoefficient = calculateWilksCoefficient(bodyWeight)
          const wilksScore = total * wilksCoefficient
          const mostRecentDate = [bench.date, squat.date, deadlift.date]
            .map(d => new Date(d))
            .sort((a, b) => b.getTime() - a.getTime())[0]

          WilksScore.push({
            month,
            date: mostRecentDate,
            wilksScore: Math.round(wilksScore * 100) / 100,
            total,
            bodyWeight,
            lifts: {
              bench: bench.weight,
              squat: squat.weight,
              deadlift: deadlift.weight
            }
          })
        }
      }
    })
    
    return WilksScore.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  }, [maxes])
}