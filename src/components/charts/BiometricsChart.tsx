import { useEffect, useRef } from 'react'
import { Chart, registerables } from 'chart.js'
import { BiometricMetric, BodyComposition, Hormone, Sleep } from '@/src/types'
import { processBodyComposition } from './chartUtils.tsx/BiometricDataHelper'
import 'chartjs-adapter-date-fns'
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
  formatDateLong
} from './chartUtils.tsx/ChartStyles'

Chart.register(...registerables)

interface BiometricLineChartProps {
  sleepData?: Sleep[]
  hormoneData?: Hormone[]
  bodyCompositionData?: BodyComposition[]
  metrics: BiometricMetric[]
  isDark?: boolean
  windowSize: number 
}

export default function BiometricLineChart({
  sleepData = [],
  hormoneData = [],
  bodyCompositionData = [],
  metrics,
  isDark = false,
  windowSize
}: BiometricLineChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null)
  const chartInstance = useRef<Chart | null>(null)

  useEffect(() => {
    if (!chartRef.current) return
    if (typeof isDark !== 'boolean') return
    
    const ctx = chartRef.current.getContext('2d')
    if (!ctx) return
    
    const { weight: weightData, bodyFatNavy: bodyFatNavyData, bodyFatCalipers: bodyFatCalipersData, bodyFatComposite: bodyFatCompositeData } = processBodyComposition(bodyCompositionData)

    const datasets: any[] = []
    
    metrics.forEach(metric => {
      if (!metric.enabled) return
      
      let data: Array<{ x: Date; y: number }> = []
      
      switch (metric.id) {
        case 'overall_sleep':
          data = sleepData.map(d => ({ x: new Date(d.date), y: d.overall }))
          break
        case 'total_testosterone':
          data = hormoneData.map(d => ({ x: new Date(d.date), y: d.totalTestosterone }))
          break
        case 'free_testosterone':
          data = hormoneData.map(d => ({ x: new Date(d.date), y: d.freeTestosterone }))
          break
        case 'shbg':
          data = hormoneData.map(d => ({ x: new Date(d.date), y: d.sexHormoneBindingGlobulin }))
          break
        case 'fai':
          data = hormoneData.map(d => ({ x: new Date(d.date), y: d.fai }))
          break
        case 'weight':
          data = weightData
          break
        case 'body_fat_navy':
          data = bodyFatNavyData
          break
        case 'body_fat_calipers':
          data = bodyFatCalipersData
          break
        case 'body_fat_composite':
          data = bodyFatCompositeData
          break
      }
      
      if (data.length > 0) {
        datasets.push({
          label: metric.label,
          data: data,
          borderColor: metric.color,
          backgroundColor: metric.color,
          borderWidth: 2,
          tension: 0.4,
          fill: false,
          pointRadius: pointRadius(windowSize),
          pointHoverRadius: pointHoverRadius(windowSize),
          yAxisID: metric.yAxisID
        })
      }
    })
    
    const needsY = metrics.some(m => m.enabled && m.yAxisID === 'y')
    const needsY1 = metrics.some(m => m.enabled && m.yAxisID === 'y1')
    
    const yUnit = metrics.find(m => m.enabled && m.yAxisID === 'y')?.unit || ''
    const y1Unit = metrics.find(m => m.enabled && m.yAxisID === 'y1')?.unit || ''

    const scales: any = {
      x: {
        type: 'time',
        time: {
          unit: 'month',
          displayFormats: {
            month: 'MMM'
          }
        },
        grid: {
          color: chartGridColor(isDark)
        },
        ticks: {
          font: chartFontAxisTicks(windowSize),
          color: chartColor(isDark),
        }
      }
    }

    if (needsY) {
      scales.y = {
        type: 'linear',
        display: true,
        position: 'left',
        grid: {
          color: chartGridColor(isDark)
        },
        ticks: {
          font: chartFontAxisTicks(windowSize),
          color: chartColor(isDark),
          callback: function(value: any) {
            if (yUnit === 'time') {
              return (Number(value) / 60).toFixed(1) + ' hrs'
            }
            return value
          }
        },
        title: {
          display: true,
          text: yUnit === 'time' ? 'Hours' : yUnit,
          font: chartFontAxisTitle(windowSize),
          color: chartColor(isDark),
        }
      }
    }

    if (needsY1) {
      scales.y1 = {
        type: 'linear',
        display: true,
        position: 'right',
        grid: {
          drawOnChartArea: false
        },
        ticks: {
          font: chartFontAxisTicks(windowSize),
          color: chartColor(isDark),
          callback: function(value: any) {
            return value
          }
        },
        title: {
          display: true,
          text: y1Unit,
          font: chartFontAxisTitle(windowSize),
          color: chartColor(isDark),
        }
      }
    }

    if (!chartInstance.current) {
      chartInstance.current = new Chart(ctx, {
        type: 'line',
        data: {
          datasets: []
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
          scales: scales,
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
                title: function(context) {
                  const xValue = context[0].parsed.x
                  if (xValue === null) return ''
                  return formatDateLong(new Date(xValue))
                },
                label: function(context) {
                  const metric = metrics.find(m => m.label === context.dataset.label)
                  const value = context.parsed.y || 0
                  if (metric?.unit === 'time') {
                    return ' ' + context.dataset.label + ': ' + (value / 60).toFixed(1) + ' hrs'
                  }
                  return ' ' + context.dataset.label + ': ' + value.toFixed(1) + ' ' + (metric?.unit || '')
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
            }
          }
        }
      })
      
      setTimeout(() => {
        if (chartInstance.current) {
          chartInstance.current.data.datasets = datasets
          chartInstance.current.update()
        }
      }, 50)
    } else {
      const chart = chartInstance.current
      chart.data.datasets = datasets
      chart.options.scales = scales
      
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
  }, [sleepData, hormoneData, bodyCompositionData, metrics, isDark])

  if (metrics.filter(m => m.enabled).length === 0) {
    return <div className="w-full h-full p-4 text-center text-whiten flex flex-col justify-center text-blue-900 dark:text-white">Select at least one metric to display.</div>
  }

  return (
    <div className="h-full">
      <canvas ref={chartRef} />
    </div>
  )
}