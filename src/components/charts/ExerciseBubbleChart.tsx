import { useEffect, useRef, useState } from 'react'
import { Chart, registerables } from 'chart.js'
import { ExerciseBubbleDataPoint, Workout } from '@/src/types'
import { processExerciseData } from './chartUtils.tsx/WorkoutDataHelper'
import 'chartjs-adapter-date-fns'
import {
  chartFontAxisTicks, 
  chartFontAxisTitle, 
  chartTooltipBackground, 
  chartTooltipColor,
  chartFontTooltipBody,
  formatDateLong,
  chartColor, 
  chartGridColor 
} from './chartUtils.tsx/ChartStyles'
import NoDataCard from '../ui/NoDataCard'

Chart.register(...registerables)

const darkModeColours = ['rgb(37, 75, 188, 0.7)', 'rgb(42, 86, 213, 0.7)', 'rgb(67, 105, 218, 0.7)', 'rgb(92, 125, 223, 0.7)', 'rgb(117, 145, 228, 0.7)', 'rgb(142, 165, 233, 0.7)', 'rgb(167, 185, 238, 0.7)', 'rgb(192, 205, 243, 0.7)', 'rgb(217, 225, 248, 0.7)', 'rgb(242, 245, 253, 0.7)'];
const lightModeColours = ['rgb(117, 145, 228, 0.7)', 'rgb(92, 125, 223, 0.7)', 'rgb(67, 105, 218, 0.7)', 'rgb(42, 86, 213, 0.7)', 'rgb(37, 75, 188, 0.7)', 'rgb(32, 65, 163, 0.7)', 'rgb(27, 55, 138, 0.7)', 'rgb(22, 45, 113, 0.7)', 'rgb(17, 35, 88, 0.7)', 'rgb(12, 25, 63, 0.7)']

function getColorByReps(reps: number, isDark: boolean): string {
  const colours = isDark ? darkModeColours : lightModeColours
  if (reps > 10) return colours[9]
  return colours[reps - 1]
}

interface ExerciseBubbleChartProps {
  exercises: Workout[]
  isDark: boolean
  windowSize: number 
}

export default function ExerciseBubbleChart({ exercises, isDark = false, windowSize  }: ExerciseBubbleChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null)
  const chartInstance = useRef<Chart | null>(null)
  
  useEffect(() => {
    if (!chartRef.current) return
    if (typeof isDark !== 'boolean') return
    const ctx = chartRef.current.getContext('2d')
    if (!ctx) return
    if (exercises.length < 1) return
    
    const processedData = processExerciseData(exercises, windowSize < 640)

    if (!chartInstance.current) {
      chartInstance.current = new Chart(ctx, {
        type: 'bubble',
        data: {
          datasets: [{
            label: exercises[0]?.exercise || 'Exercise',
            data: [],
            backgroundColor: [],
            borderColor: [],
            borderWidth: 2
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          animation: {
            duration: 1200,
            easing: 'easeOutQuart',
          },
          animations: {
            radius: {
              duration: 1200,
              easing: 'easeOutElastic',
              from: 0,
            }
          },
          transitions: {
            active: {
              animation: {
                duration: 800,
                easing: 'easeInOutQuart'
              }
            }
          },
          plugins: {
            legend: { 
              display: true,
              position: 'top',
              labels: {
                font: chartFontAxisTicks(windowSize),
                color: chartColor(isDark),
                usePointStyle: true,
                pointStyle: 'circle',
                generateLabels: () => {
                  const colours = isDark ? darkModeColours : lightModeColours
                  const textColor = chartColor(isDark)
                  return [
                    { text: '1 rep', fillStyle: colours[0], strokeStyle: colours[0].replace('0.7', '1'), lineWidth: 2, fontColor: textColor },
                    { text: '2 reps', fillStyle: colours[1], strokeStyle: colours[1].replace('0.7', '1'), lineWidth: 2, fontColor: textColor },
                    { text: '3 reps', fillStyle: colours[2], strokeStyle: colours[2].replace('0.7', '1'), lineWidth: 2, fontColor: textColor },
                    { text: '4 reps', fillStyle: colours[3], strokeStyle: colours[3].replace('0.7', '1'), lineWidth: 2, fontColor: textColor },
                    { text: '5 reps', fillStyle: colours[4], strokeStyle: colours[4].replace('0.7', '1'), lineWidth: 2, fontColor: textColor },
                    { text: '6 reps', fillStyle: colours[5], strokeStyle: colours[5].replace('0.7', '1'), lineWidth: 2, fontColor: textColor },
                    { text: '7 reps', fillStyle: colours[6], strokeStyle: colours[6].replace('0.7', '1'), lineWidth: 2, fontColor: textColor },
                    { text: '8 reps', fillStyle: colours[7], strokeStyle: colours[7].replace('0.7', '1'), lineWidth: 2, fontColor: textColor },
                    { text: '9 reps', fillStyle: colours[8], strokeStyle: colours[8].replace('0.7', '1'), lineWidth: 2, fontColor: textColor },
                    { text: '10 reps', fillStyle: colours[9], strokeStyle: colours[9].replace('0.7', '1'), lineWidth: 2, fontColor: textColor },
                    { text: '10+ reps', fillStyle: colours[9], strokeStyle: colours[9].replace('0.7', '1'), lineWidth: 2, fontColor: textColor }
                  ]
                }
              }
            },
            tooltip: {
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
                label: (context) => {
                  const point = context.raw as ExerciseBubbleDataPoint
                  const lines = [
                    ` Weight: ${point.y}kg`,
                    ' Rep Breakdown:'
                  ]
                  point.repBreakdown.forEach(rb => {
                    lines.push(` ${rb.sets} sets: ${rb.reps} reps`)
                  })
                  return lines
                }
              }
            }
          },
          scales: {
            x: {
              grid: {
                color: chartGridColor(isDark)
              },
              type: 'time',
              time: {
                unit: 'month',
                displayFormats: {
                  month: 'MMM'
                }
              },
              title: { 
                display: true, 
                text: 'Date',
                font: chartFontAxisTitle(windowSize),
                color: chartColor(isDark)
              },
              ticks: {
                font: chartFontAxisTicks(windowSize),
                color: chartColor(isDark),
              }
            },
            y: {
              afterDataLimits: (scale: any) => {
                scale.max = scale.max + 0.5
              },
              grid: {
                color: chartGridColor(isDark)
              },
              title: { 
                display: true, 
                text: 'Weight (kg)',
                font: chartFontAxisTitle(windowSize),
                color: chartColor(isDark)
              },
              beginAtZero: false,
              ticks: {
                font: chartFontAxisTicks(windowSize),
                color: chartColor(isDark),
              }
            }
          }
        }
      })
      
      if (processedData.length > 0) {
        setTimeout(() => {
          if (chartInstance.current) {
            const chart = chartInstance.current
            chart.data.datasets[0].label = exercises[0]?.exercise || 'Exercise'
            chart.data.datasets[0].data = processedData
            chart.data.datasets[0].backgroundColor = processedData.map(d => getColorByReps(d.maxReps, isDark))
            chart.data.datasets[0].borderColor = processedData.map(d => getColorByReps(d.maxReps, isDark).replace('0.7', '1'))
            chart.update()
          }
        }, 50)
      }
    } else {
      const chart = chartInstance.current
      
      chart.data.datasets[0].label = exercises[0]?.exercise || 'Exercise'
      chart.data.datasets[0].data = processedData
      chart.data.datasets[0].backgroundColor = processedData.map(d => getColorByReps(d.maxReps, isDark))
      chart.data.datasets[0].borderColor = processedData.map(d => getColorByReps(d.maxReps, isDark).replace('0.7', '1'))
      
      const colours = isDark ? darkModeColours : lightModeColours
      const textColor = chartColor(isDark)
      
      if (chart.options.plugins?.legend?.labels) {
        chart.options.plugins.legend.labels.color = textColor
        chart.options.plugins.legend.labels.generateLabels = () => [
          { text: '1 rep', fillStyle: colours[0], strokeStyle: colours[0].replace('0.7', '1'), lineWidth: 2, fontColor: textColor },
          { text: '2 reps', fillStyle: colours[1], strokeStyle: colours[1].replace('0.7', '1'), lineWidth: 2, fontColor: textColor },
          { text: '3 reps', fillStyle: colours[2], strokeStyle: colours[2].replace('0.7', '1'), lineWidth: 2, fontColor: textColor },
          { text: '4 reps', fillStyle: colours[3], strokeStyle: colours[3].replace('0.7', '1'), lineWidth: 2, fontColor: textColor },
          { text: '5 reps', fillStyle: colours[4], strokeStyle: colours[4].replace('0.7', '1'), lineWidth: 2, fontColor: textColor },
          { text: '6 reps', fillStyle: colours[5], strokeStyle: colours[5].replace('0.7', '1'), lineWidth: 2, fontColor: textColor },
          { text: '7 reps', fillStyle: colours[6], strokeStyle: colours[6].replace('0.7', '1'), lineWidth: 2, fontColor: textColor },
          { text: '8 reps', fillStyle: colours[7], strokeStyle: colours[7].replace('0.7', '1'), lineWidth: 2, fontColor: textColor },
          { text: '9 reps', fillStyle: colours[8], strokeStyle: colours[8].replace('0.7', '1'), lineWidth: 2, fontColor: textColor },
          { text: '10 reps', fillStyle: colours[9], strokeStyle: colours[9].replace('0.7', '1'), lineWidth: 2, fontColor: textColor },
          { text: '10+ reps', fillStyle: colours[9], strokeStyle: colours[9].replace('0.7', '1'), lineWidth: 2, fontColor: textColor }
        ]
      }
      
      if (chart.options.plugins?.tooltip) {
        chart.options.plugins.tooltip.backgroundColor = chartTooltipBackground(isDark)
        chart.options.plugins.tooltip.titleColor = chartTooltipColor(isDark)
        chart.options.plugins.tooltip.bodyColor = chartTooltipColor(isDark)
      }
      
      if (chart.options.scales?.x) {
        const xScale = chart.options.scales.x as any
        if (xScale.grid) {
          xScale.grid.color = chartGridColor(isDark)
        }
        if (xScale.title) {
          xScale.title.color = textColor
        }
        if (xScale.ticks) {
          xScale.ticks.color = textColor
        }
      }
      
      if (chart.options.scales?.y) {
        const yScale = chart.options.scales.y as any
        if (yScale.grid) {
          yScale.grid.color = chartGridColor(isDark)
        }
        if (yScale.title) {
          yScale.title.color = textColor
        }
        if (yScale.ticks) {
          yScale.ticks.color = textColor
        }
      }
      
      chart.update()
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