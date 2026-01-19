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
import { WilksScore } from '@/src/types'
import NoDataCard from '../ui/NoDataCard'

interface WilksLineChartProps {
  WilksScore: WilksScore[]
  windowSize: number 
}

export default function WilksLineChart({ WilksScore, windowSize }: WilksLineChartProps) {
  const isDark = useTheme()
  const chartRef = useRef<HTMLCanvasElement>(null)
  const chartInstanceRef = useRef<Chart | null>(null)

  useEffect(() => {
    if (!chartRef.current || WilksScore.length === 0) return

    const sortedData = [...WilksScore].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    )
    
    const dates = sortedData.map(d => new Date(d.date))
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
    const scores = allMonths.map(monthDate => {
      const dataPoint = sortedData.find(d => {
        const dDate = new Date(d.date)
        return dDate.getMonth() === monthDate.getMonth() && 
               dDate.getFullYear() === monthDate.getFullYear()
      })
      return dataPoint ? dataPoint.wilksScore : null
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
            label: 'Wilks Score',
            data: scores,
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
                  const dataPoint = sortedData.find(d => {
                    const dDate = new Date(d.date)
                    return dDate.getMonth() === monthDate.getMonth() && 
                           dDate.getFullYear() === monthDate.getFullYear()
                  })
                  if (!dataPoint) return ''
                  return formatDateLong(new Date(dataPoint.date))
                },
                label: function(context) {
                  const index = context.dataIndex
                  const monthDate = allMonths[index]
                  const data = sortedData.find(d => {
                    const dDate = new Date(d.date)
                    return dDate.getMonth() === monthDate.getMonth() && 
                           dDate.getFullYear() === monthDate.getFullYear()
                  })
                  if (!data) return []
                  return [
                    ` Wilks: ${context.parsed.y?.toFixed(2)}`,
                    ` Total: ${data.total}kg`,
                    ` BW: ${data.bodyWeight}kg`
                  ]
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
  }, [WilksScore, isDark, windowSize])

  if (WilksScore.length === 0) {
    return <NoDataCard/>
  }

  return (
    <div className="h-full w-full">
      <canvas ref={chartRef}></canvas>
    </div>
  )
}