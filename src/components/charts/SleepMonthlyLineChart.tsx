import { useEffect, useRef } from 'react'
import { Chart, registerables } from 'chart.js'
import { Sleep } from '@/src/types'
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
  chartGridColor,
  lightModeColours,
  darkModeColours
} from './chartUtils.tsx/ChartStyles'
import NoDataCard from '../ui/NoDataCard'

Chart.register(...registerables)

interface SleepLineChartProps {
  data: Sleep[]
  isDark?: boolean,
  windowSize: number 
}

export default function SleepLineChart({ data, isDark = false, windowSize }: SleepLineChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null)
  const chartInstance = useRef<Chart | null>(null)

  useEffect(() => {
    if (!chartRef.current) return
    if (typeof isDark !== 'boolean') return
    
    const ctx = chartRef.current.getContext('2d')
    if (!ctx) return
    if (data.length < 1) return

    const colours = isDark ? darkModeColours : lightModeColours

    if (!chartInstance.current) {
      chartInstance.current = new Chart(ctx, {
        type: 'line',
        data: {
          labels: [],
          datasets: [
            {
              label: 'Overall Sleep',
              data: [],
              borderColor: colours.overall,
              backgroundColor: colours.overall.replace('0.8', '0.2'),
              borderWidth: 2,
              tension: 0.4,
              pointRadius: pointRadius(windowSize),
              pointHoverRadius: pointHoverRadius(windowSize),
              fill: false,
            },
            {
              label: 'Deep Sleep',
              data: [],
              borderColor: colours.deep,
              backgroundColor: colours.deep.replace('0.8', '0.2'),
              borderWidth: 2,
              tension: 0.4,
              pointRadius: pointRadius(windowSize),
              pointHoverRadius: pointHoverRadius(windowSize),
              fill: false,
            },
            {
              label: 'Core Sleep',
              data: [],
              borderColor: colours.core,
              backgroundColor: colours.core.replace('0.8', '0.2'),
              borderWidth: 2,
              tension: 0.4,
              pointRadius: pointRadius(windowSize),
              pointHoverRadius: pointHoverRadius(windowSize),
              fill: false,
            },
            {
              label: 'REM Sleep',
              data: [],
              borderColor: colours.rem,
              backgroundColor: colours.rem.replace('0.8', '0.2'),
              borderWidth: 2,
              tension: 0.4,
              pointRadius: pointRadius(windowSize),
              pointHoverRadius: pointHoverRadius(windowSize),
              fill: false,
            },
            {
              label: 'Awake',
              data: [],
              borderColor: colours.awake,
              backgroundColor: colours.awake.replace('0.8', '0.2'),
              borderWidth: 2,
              tension: 0.4,
              pointRadius: pointRadius(windowSize),
              pointHoverRadius: pointHoverRadius(windowSize),
              fill: false,
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
          interaction: {
            mode: 'nearest',
            intersect: false,
          },
          scales: {
            x: {
              grid: {
                color: chartGridColor(isDark)
              },
              ticks: {
                font: chartFontAxisTicks(windowSize),
                color: chartColor(isDark),
                callback: function(value, index) {
                  const label = this.getLabelForValue(index);
                  if (typeof label === 'string') {
                    return label.substring(0, 3)
                  }
                  return label;
                }
              }
            },
            y: {
              beginAtZero: true,
              grid: {
                color: chartGridColor(isDark)
              },
              title: {
                display: true,
                text: 'Hours',
                font: chartFontAxisTitle(windowSize),
                color: chartColor(isDark),
              },
              ticks: {
                font: chartFontAxisTicks(windowSize),
                color: chartColor(isDark),
                stepSize: 60,
                callback: function(value) {
                  return (Number(value) / 60).toFixed(0)
                }
              }
            }
          },
          plugins: {
            tooltip: {
              mode: 'nearest',
              intersect: false,
              backgroundColor: chartTooltipBackground(isDark),
              titleColor: chartTooltipColor(isDark),
              titleFont: chartFontAxisTicks(windowSize), 
              bodyColor: chartTooltipColor(isDark),
              bodyFont: chartFontTooltipBody(windowSize),
              callbacks: {
                label: function(context) {
                  const value = context.parsed.y || 0
                  return ' ' + context.dataset.label + ': ' + (value / 60).toFixed(1) + ' hrs'
                }
              }
            },
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
          }
        }
      })
      
      setTimeout(() => {
        if (chartInstance.current) {
          const chart = chartInstance.current
          chart.data.labels = data.map(d => d.month)
          chart.data.datasets[0].data = data.map(d => d.overall)
          chart.data.datasets[1].data = data.map(d => d.deep)
          chart.data.datasets[2].data = data.map(d => d.core)
          chart.data.datasets[3].data = data.map(d => d.rem)
          chart.data.datasets[4].data = data.map(d => d.awake)
          chart.update()
        }
      }, 50)
    } else {
      const chart = chartInstance.current
      chart.data.labels = data.map(d => d.month)
      chart.data.datasets[0].data = data.map(d => d.overall)
      chart.data.datasets[0].borderColor = colours.overall
      chart.data.datasets[0].backgroundColor = colours.overall.replace('0.8', '0.2')
      chart.data.datasets[1].data = data.map(d => d.deep)
      chart.data.datasets[1].borderColor = colours.deep
      chart.data.datasets[1].backgroundColor = colours.deep.replace('0.8', '0.2')
      chart.data.datasets[2].data = data.map(d => d.core)
      chart.data.datasets[2].borderColor = colours.core
      chart.data.datasets[2].backgroundColor = colours.core.replace('0.8', '0.2')
      chart.data.datasets[3].data = data.map(d => d.rem)
      chart.data.datasets[3].borderColor = colours.rem
      chart.data.datasets[3].backgroundColor = colours.rem.replace('0.8', '0.2')
      chart.data.datasets[4].data = data.map(d => d.awake)
      chart.data.datasets[4].borderColor = colours.awake
      chart.data.datasets[4].backgroundColor = colours.awake.replace('0.8', '0.2')

      if (chart.options.scales?.x?.grid) {
        chart.options.scales.x.grid.color = chartGridColor(isDark)
      }
      if (chart.options.scales?.x?.ticks) {
        chart.options.scales.x.ticks.color = chartColor(isDark)
      }
      if (chart.options.scales?.y?.grid) {
        chart.options.scales.y.grid.color = chartGridColor(isDark)
      }
      if (chart.options.scales?.y?.ticks) {
        chart.options.scales.y.ticks.color = chartColor(isDark)
      }
      if (chart.options.scales?.y && 'title' in chart.options.scales.y && chart.options.scales.y.title) {
        chart.options.scales.y.title.color = chartColor(isDark)
      }
      if (chart.options.plugins?.title) {
        chart.options.plugins.title.color = chartColor(isDark)
      }
      if (chart.options.plugins?.legend?.labels) {
        chart.options.plugins.legend.labels.color = chartColor(isDark)
      }
      
      chart.update()
    }

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy()
        chartInstance.current = null
      }
    }
  }, [data, isDark, windowSize])

  if (data.length === 0) {
    return <NoDataCard/>
  }

  return (
    <div className="w-full h-full">
      <canvas ref={chartRef} />
    </div>
  )
}