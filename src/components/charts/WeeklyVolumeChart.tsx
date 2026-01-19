'use client'
import { Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { useTheme } from '@/src/hooks/useTheme'
import { 
  chartFontAxisTicks, 
  chartFontAxisTitle, 
  chartTooltipBackground, 
  chartTooltipColor,
  chartFontTooltipBody,
  chartFontTitle, 
  chartColor, 
  chartGridColor 
} from './chartUtils.tsx/ChartStyles'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
)

interface WeeklyVolumeChartProps {
  data: {
    weekNumber: number
    totalVolume: number
  }[],
  windowSize: number 
}

export default function WeeklyVolumeChart({ data, windowSize }: WeeklyVolumeChartProps) {
  const isDark = useTheme()
  const chartData = {
    labels: data.map((item) => item.weekNumber),
    datasets: [
      {
        label: 'Training Volume (Reps)',
        data: data.map((item) => item.totalVolume),
        backgroundColor: chartColor(isDark),
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false, 
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Weekly Training Volume',
        color: chartColor(isDark),
        font: chartFontTitle(windowSize),
      },
      tooltip: {
        backgroundColor: chartTooltipBackground(isDark),
        titleColor: chartTooltipColor(isDark),
        titleFont: chartFontAxisTicks(windowSize), 
        bodyColor: chartTooltipColor(isDark),
        bodyFont: chartFontTooltipBody(windowSize),
        callbacks: {
          title: function(context: any) {
            return `Week ${context[0].label}`;
          },
          label: function(context: any) {
            return ` Volume: ${context.parsed.y.toLocaleString()} reps`
          }
        }
      }
    },
    scales: {
      y: {
        grid: {
          color: chartGridColor(isDark)
        },
        title: {
          display: true,
          text: 'Reps',
          font: chartFontAxisTitle(windowSize),
          color: chartColor(isDark),
        },
        beginAtZero: true,
        ticks: {
          font: chartFontAxisTicks(windowSize),
          color: chartColor(isDark),
          callback: function(value: any) {
            return value.toLocaleString()
          }
        }
      },
      x: {
        grid: {
          color: chartGridColor(isDark)
        },
        title: {
          display: true,
          text: 'Week',
          font: chartFontAxisTitle(windowSize),
          color: chartColor(isDark),
        },
        ticks: {
          font: chartFontAxisTicks(windowSize),
          color: chartColor(isDark),
          maxRotation: 0,
          minRotation: 0,
          callback: (value: any, index: number) => {
            const label = data[index]?.weekNumber
            return label % 5 === 0 ? label : ''
          }
        },
      }
    },
  }

  return (
    <div className="h-full">
      <Bar data={chartData} options={options} />
    </div>
  )
}