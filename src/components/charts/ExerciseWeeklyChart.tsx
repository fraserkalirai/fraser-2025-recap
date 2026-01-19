import { useEffect, useRef } from 'react'
import {
  Chart,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartOptions
} from 'chart.js'
import { Workout } from '@/src/types'
import { processWeeklyData } from './chartUtils.tsx/WorkoutDataHelper'
import {
  pointRadius,
  pointHoverRadius,
  chartFontLegend,
  chartFontAxisTicks, 
  chartFontAxisTitle, 
  chartTooltipBackground, 
  chartTooltipColor,
  chartFontTooltipBody,
  chartColor, 
  chartGridColor 
} from './chartUtils.tsx/ChartStyles'
import NoDataCard from '../ui/NoDataCard'

Chart.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

interface ExerciseWeeklyChartProps {
  exercises: Workout[]
  isDark?: boolean
  windowSize: number 
}

export default function ExerciseWeeklyChart({ exercises, isDark = false, windowSize }: ExerciseWeeklyChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null)
  const chartInstance = useRef<Chart | null>(null)
  
  useEffect(() => {
    if (!chartRef.current) return

    const ctx = chartRef.current.getContext('2d')
    if (!ctx) return

    const processedData = exercises.length > 0 ? processWeeklyData(exercises) : []
    const weeks = processedData.map(d => d.week)
    const volumeData = processedData.map(d => d.volumeWeightAverage)
    const topSetData = processedData.map(d => d.topSet)

    if (!chartInstance.current) {
      chartInstance.current = new Chart(ctx, {
        type: 'line',
        data: {
          labels: [],
          datasets: [
            {
              label: 'Volume Weight Average',
              data: [],
              borderColor: 'rgb(59, 130, 246)',
              borderWidth: 2,
              tension: 0.4,
              pointBackgroundColor: 'rgb(59, 130, 246)',
              pointRadius: pointRadius(windowSize),
              pointHoverRadius: pointHoverRadius(windowSize),
              fill: false
            },
            {
              label: 'Top Set',
              data: [],
              borderColor: chartColor(isDark),
              borderWidth: 2,
              tension: 0.4,
              pointBackgroundColor: chartColor(isDark),
              pointRadius: pointRadius(windowSize),
              pointHoverRadius: pointHoverRadius(windowSize),
              fill: false
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          animation: {
            duration: 1200,
            easing: 'easeOutQuart',
          },
          transitions: {
            active: {
              animation: {
                duration: 800,
                easing: 'easeInOutQuart'
              }
            }
          },
          interaction: {
            mode: 'nearest',
            intersect: false,
          },
          plugins: {
            legend: {
              display: true,
              position: 'top',
              labels: {
                color: chartColor(isDark),
                font: chartFontLegend(windowSize),
                usePointStyle: true,
                pointStyle: 'circle'
              }
            },
            tooltip: {
              mode: 'nearest',
              intersect: false,
              backgroundColor: chartTooltipBackground(isDark),
              titleColor: chartTooltipColor(isDark),
              titleFont: chartFontAxisTicks(windowSize), 
              bodyColor: chartTooltipColor(isDark),
              bodyFont: chartFontTooltipBody(windowSize),
              displayColors: true,
              callbacks: {
                title: (context) => ` Week ${context[0].label}`,
                label: (context) => {
                  const value = (context.parsed.y as number).toFixed(1)
                  return ` ${context.dataset.label}: ${value} kg`
                }
              }
            }
          },
          scales: {
            x: {
              title: {
                display: true,
                text: 'Week',
                font: chartFontAxisTitle(windowSize),
                color: chartColor(isDark),
              },
              ticks: {
                font: chartFontAxisTicks(windowSize),
                color: chartColor(isDark),
                callback: function(value, index, ticks) {
                  const weekNum = this.getLabelForValue(value as number)
                  const num = parseInt(weekNum)
                  return num % 5 === 0 ? weekNum : ''
                }
              },
              grid: {
                color: chartGridColor(isDark)
              },
            },
            y: {
              title: {
                display: true,
                text: 'Weight (kg)',
                font: chartFontAxisTitle(windowSize),
                color: chartColor(isDark),
              },
              ticks: {
                font: chartFontAxisTicks(windowSize),
                color: chartColor(isDark),
              },
              grid: {
                color: chartGridColor(isDark)
              },
              beginAtZero: false
            }
          }
        } as ChartOptions<'line'>
      })
      
      if (processedData.length > 0) {
        setTimeout(() => {
          if (chartInstance.current) {
            const chart = chartInstance.current
            chart.data.labels = weeks
            chart.data.datasets[0].data = volumeData
            chart.data.datasets[1].data = topSetData
            chart.update()
          }
        }, 50)
      }
    } else {
      const chart = chartInstance.current
      chart.data.labels = weeks
      chart.data.datasets[0].data = volumeData
      chart.data.datasets[1].data = topSetData
      chart.update('active')
    }

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy()
        chartInstance.current = null
      }
    }
  }, [exercises, isDark, windowSize])

  if (exercises.length === 0) {
    return <NoDataCard/>
  }
  
  return (
    <div className="w-full h-full">
      <canvas ref={chartRef} />
    </div>
  )
}