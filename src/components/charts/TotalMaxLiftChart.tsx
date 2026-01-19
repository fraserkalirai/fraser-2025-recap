'use client'

import { useEffect, useRef, useMemo } from 'react'
import Chart from 'chart.js/auto'
import { useTheme } from '@/src/hooks/useTheme'
import { Max } from '@/src/types'
import { 
  pointRadius,
  pointHoverRadius,
  chartFontAxisTicks, 
  chartTooltipBackground, 
  chartTooltipColor,
  chartFontTooltipBody,
  chartColor, 
  chartGridColor,
  formatDateLong
} from './chartUtils.tsx/ChartStyles'
import NoDataCard from '../ui/NoDataCard'

interface TotalLineChartProps {
  maxes: Max[]
  windowSize: number 
}

export default function TotalLineChart({ maxes, windowSize }: TotalLineChartProps) {
  const isDark = useTheme()
  const chartRef = useRef<HTMLCanvasElement>(null)
  const chartInstanceRef = useRef<Chart | null>(null)

  const totalData = useMemo(() => {
    const monthGroups = maxes.reduce((acc, max) => {
      if (!acc[max.month]) {
        acc[max.month] = []
      }
      acc[max.month].push(max)
      return acc
    }, {} as Record<string, Max[]>)
    
    const totals: Array<{date: Date, total: number, bench: number, squat: number, deadlift: number}> = []

    Object.entries(monthGroups).forEach(([month, lifts]) => {
      const bench = lifts.find(l => l.lift === 'Bench')
      const squat = lifts.find(l => l.lift === 'Squat')
      const deadlift = lifts.find(l => l.lift === 'Deadlift')
      
      if (bench && squat && deadlift) {
        const total = bench.weight + squat.weight + deadlift.weight
        const mostRecentDate = [bench.date, squat.date, deadlift.date]
          .map(d => new Date(d))
          .sort((a, b) => b.getTime() - a.getTime())[0]

        totals.push({
          date: mostRecentDate,
          total,
          bench: bench.weight,
          squat: squat.weight,
          deadlift: deadlift.weight
        })
      }
    })
    
    return totals.sort((a, b) => a.date.getTime() - b.date.getTime())
  }, [maxes])

  useEffect(() => {
    if (!chartRef.current || totalData.length === 0) return
    
    const dates = totalData.map(d => d.date)
    const minDate = new Date(Math.min(...dates.map(d => d.getTime())))
    const maxDate = new Date(Math.max(...dates.map(d => d.getTime())))
    
    const allMonths: Date[] = []
    const current = new Date(minDate.getFullYear(), minDate.getMonth(), 1)
    const end = new Date(maxDate.getFullYear(), maxDate.getMonth(), 1)
    
    while (current <= end) {
      allMonths.push(new Date(current))
      current.setMonth(current.getMonth() + 1)
    }
    
    const labels = allMonths.map(date => date.toLocaleDateString('en-GB', { month: 'short' }))
    const totals = allMonths.map(monthDate => {
      const dataPoint = totalData.find(d => {
        return d.date.getMonth() === monthDate.getMonth() && 
               d.date.getFullYear() === monthDate.getFullYear()
      })
      return dataPoint ? dataPoint.total : null
    })
    
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy()
    }
    
    const ctx = chartRef.current.getContext('2d')
    if (ctx) {
      chartInstanceRef.current = new Chart(ctx, {
        type: 'line',
        data: {
          labels: labels,
          datasets: [{
            label: 'Total',
            data: totals,
            borderColor: chartColor(isDark),
            backgroundColor: chartColor(isDark),
            borderWidth: 2,
            tension: 0.4,
            fill: false,
            pointRadius: pointRadius(windowSize),
            pointHoverRadius: pointHoverRadius(windowSize),
            spanGaps: true,
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: false,
              ticks: {
                font: chartFontAxisTicks(windowSize),
                color: chartColor(isDark),
                callback: function(value) {
                  return value + ' kg'
                }
              },
              grid: {
                color: chartGridColor(isDark)
              },
            },
            x: {
              ticks: {
                font: chartFontAxisTicks(windowSize),
                color: chartColor(isDark),
              },
              grid: {
                color: chartGridColor(isDark)
              },
            }
          },
          interaction: {
            mode: 'nearest',
            intersect: false,
          },
          plugins: {
            legend: {
              display: false,
            },
            tooltip: {
              mode: 'nearest',
              intersect: false,
              backgroundColor: chartTooltipBackground(isDark),
              titleColor: chartTooltipColor(isDark),
              titleFont: chartFontAxisTicks(windowSize), 
              bodyColor: chartTooltipColor(isDark),
              bodyFont: chartFontTooltipBody(windowSize),
              callbacks: {
                title: function(context) {
                  const index = context[0].dataIndex
                  if (index === undefined || index === null) return ''
                  const monthDate = allMonths[index]
                  const dataPoint = totalData.find(d => {
                    return d.date.getMonth() === monthDate.getMonth() && 
                           d.date.getFullYear() === monthDate.getFullYear()
                  })
                  if (!dataPoint) return ''
                  return formatDateLong(new Date(dataPoint.date))
                },
                label: function(context) {
                  return ` ${context.parsed.y}kg`
                }
              }
            }
          }
        }
      })
    }

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy()
      }
    }
  }, [totalData, isDark, windowSize])

  if (totalData.length === 0) {
    return <NoDataCard/>
  }

  return (
    <div className="h-full w-full">
      <canvas ref={chartRef}></canvas>
    </div>
  )
}