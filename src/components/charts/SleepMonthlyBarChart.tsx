import { useEffect, useRef } from 'react'
import { Chart, registerables } from 'chart.js'
import { Sleep } from '@/src/types'
import {
  chartFontLegend,
  chartFontAxisTicks, 
  chartFontAxisTitle, 
  chartTooltipBackground, 
  chartTooltipColor,
  chartFontTooltipBody,
  chartColor, 
  chartGridColor ,
  lightModeColours,
  darkModeColours
} from './chartUtils.tsx/ChartStyles'
import NoDataCard from '../ui/NoDataCard'

Chart.register(...registerables)

interface SleepStackedBarChartProps {
  data: Sleep[]
  isDark?: boolean,
  windowSize: number 
}

export default function SleepStackedBarChart({ data, isDark = false, windowSize }: SleepStackedBarChartProps) {
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
        type: 'bar',
        data: {
          labels: [],
          datasets: [
            {
              label: 'Deep Sleep',
              data: [],
              backgroundColor: colours.deep,
              borderColor: colours.deep.replace('0.8', '1'),
              borderWidth: 1
            },
            {
              label: 'Core Sleep',
              data: [],
              backgroundColor: colours.core,
              borderColor: colours.core.replace('0.8', '1'),
              borderWidth: 1
            },
            {
              label: 'REM Sleep',
              data: [],
              backgroundColor: colours.rem,
              borderColor: colours.rem.replace('0.8', '1'),
              borderWidth: 1
            },
            {
              label: 'Awake',
              data: [],
              backgroundColor: colours.awake,
              borderColor: colours.awake.replace('0.8', '1'),
              borderWidth: 1
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
          scales: {
            x: {
              stacked: true,
              grid: {
                display: false,
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
              stacked: true,
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
                stepSize: 120,
                callback: function(value) {
                  return (Number(value) / 60)
                }
              }
            }
          },
          plugins: {
            tooltip: {
              mode: 'index',
              intersect: false,
              backgroundColor: chartTooltipBackground(isDark),
              titleColor: chartTooltipColor(isDark),
              titleFont: chartFontAxisTicks(windowSize), 
              bodyColor: chartTooltipColor(isDark),
              bodyFont: chartFontTooltipBody(windowSize),
              footerColor: chartTooltipColor(isDark),
              footerFont: chartFontTooltipBody(windowSize),
              callbacks: {
                label: function(context) {
                  return ' ' + context.dataset.label + ': ' + context.parsed.y + ' min'
                },
                footer: function(tooltipItems) {
                  const total = tooltipItems.reduce((sum, item) => sum + (item.parsed.y || 0), 0)
                  return 'Total: ' + total + ' min (' + (total / 60).toFixed(1) + ' hrs)'
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
          chart.data.datasets[0].data = data.map(d => d.deep)
          chart.data.datasets[1].data = data.map(d => d.core)
          chart.data.datasets[2].data = data.map(d => d.rem)
          chart.data.datasets[3].data = data.map(d => d.awake)
          chart.update()
        }
      }, 50)
    } else {
      const chart = chartInstance.current
      chart.data.labels = data.map(d => d.month)
      chart.data.datasets[0].data = data.map(d => d.deep)
      chart.data.datasets[0].backgroundColor = colours.deep
      chart.data.datasets[0].borderColor = colours.deep.replace('0.8', '1')
      chart.data.datasets[1].data = data.map(d => d.core)
      chart.data.datasets[1].backgroundColor = colours.core
      chart.data.datasets[1].borderColor = colours.core.replace('0.8', '1')
      chart.data.datasets[2].data = data.map(d => d.rem)
      chart.data.datasets[2].backgroundColor = colours.rem
      chart.data.datasets[2].borderColor = colours.rem.replace('0.8', '1')
      chart.data.datasets[3].data = data.map(d => d.awake)
      chart.data.datasets[3].backgroundColor = colours.awake
      chart.data.datasets[3].borderColor = colours.awake.replace('0.8', '1')
      
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
  }, [data, isDark])

  if (data.length === 0) {
    return <NoDataCard/>
  }

  return (
    <div className="w-full h-full">
      <canvas ref={chartRef} />
    </div>
  )
}