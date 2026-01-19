'use client'

import { useEffect, useRef } from 'react'
import Chart from 'chart.js/auto'
import { useTheme } from '@/src/hooks/useTheme'
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

interface Max {
  id: string
  lift: "Deadlift" | "Squat" | "Bench"
  weight: number
  month: string
  date: Date
}

interface MaxesLineChartProps {
  maxes: Max[]
  selectedLift: "Deadlift" | "Squat" | "Bench"
  windowSize: number 
}

export default function MaxesLineChart({ maxes, selectedLift, windowSize }: MaxesLineChartProps) {
  const isDark = useTheme()
  const chartRef = useRef<HTMLCanvasElement>(null)
  const chartInstanceRef = useRef<Chart | null>(null)

  useEffect(() => {
    if (!chartRef.current || maxes.length === 0) return
    
    const filteredData = maxes
      .filter(m => m.lift === selectedLift)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    if (filteredData.length === 0) return
    
    const dates = filteredData.map(m => new Date(m.date))
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
    const weights = allMonths.map(monthDate => {
      const dataPoint = filteredData.find(m => {
        const mDate = new Date(m.date)
        return mDate.getMonth() === monthDate.getMonth() && 
               mDate.getFullYear() === monthDate.getFullYear()
      })
      return dataPoint ? dataPoint.weight : null
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
            label: `${selectedLift}`,
            data: weights,
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
                  const dataPoint = filteredData.find(m => {
                    const mDate = new Date(m.date)
                    return mDate.getMonth() === monthDate.getMonth() && 
                          mDate.getFullYear() === monthDate.getFullYear()
                  })
                  
                  if (!dataPoint) return ''
                  return formatDateLong(new Date(dataPoint.date))
                },
                label: function(context) {
                  return ' ' + context.parsed.y + 'kg'
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
  }, [maxes, selectedLift, isDark])

  if (maxes.length === 0) { return ( <NoDataCard/> ) }

  const filteredCount = maxes.filter(m => m.lift === selectedLift).length

  if (filteredCount === 0) { return (<NoDataCard/>) }

  return (
    <div className="h-full w-full">
      <canvas ref={chartRef}></canvas>
    </div>
  )
}