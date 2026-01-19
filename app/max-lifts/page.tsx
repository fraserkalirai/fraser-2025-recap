'use client'

import { useState, useEffect } from 'react'
import MaxesLineChart from '@/src/components/charts/MaxLiftChart'
import WilksLineChart from '@/src/components/charts/WilksScoreChart'
import TotalLineChart from '@/src/components/charts/TotalMaxLiftChart'
import { fetchMaxes } from '@/src/lib/queries'
import MetricCard from '@/src/components/ui/MetricCard'
import PageHeader from '@/src/components/ui/PageHeader'
import BaseCard from '@/src/components/ui/BaseCard'
import Dropdown from '@/src/components/ui/Dropdown'
import { useWilksScore } from '@/src/hooks/useWilksScore'

interface Max {
  id: string
  lift: "Deadlift" | "Squat" | "Bench"
  weight: number
  bodyWeight: number
  month: string
  date: Date
}

type ChartType = "Deadlift" | "Squat" | "Bench" | "Total" | "Wilks"

export default function MaxesPage() {
  const [windowSize, setWindowSize] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024)
  const [maxes, setMaxes] = useState<Max[]>([])
  const [selectedChart, setSelectedChart] = useState<ChartType>("Bench")
  const [isLoading, setLoading] = useState(true)
  const [isError, setError] = useState(false)

  const WilksScore = useWilksScore(maxes)

  useEffect(() => {
    const handleResize = () => {
      setWindowSize(window.innerWidth)
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    async function loadMaxes() {
      try {
        const data = await fetchMaxes()
        setMaxes(data)
      } catch (err) {
        setError(true)
      } finally {
        setLoading(false)
      }
    }

    loadMaxes()
  }, [])

  const currentMaxes = {
    Bench: Math.max(...maxes.filter(m => m.lift === 'Bench').map(m => m.weight), 0),
    Squat: Math.max(...maxes.filter(m => m.lift === 'Squat').map(m => m.weight), 0),
    Deadlift: Math.max(...maxes.filter(m => m.lift === 'Deadlift').map(m => m.weight), 0)
  }

  const currentWilks = WilksScore.length > 0 
    ? WilksScore[WilksScore.length - 1].wilksScore 
    : 0

  return (
    <div className='h-full w-full flex flex-col'>
      <PageHeader header={"Max Lifts"} />
      <div className="w-full flex-1 min-h-0">
        <div className="flex flex-col lg:flex-row gap-4 md:gap-8 w-full h-full">
          <div className="lg:w-64 flex-shrink-0">
            <div className="grid grid-cols-2 lg:flex lg:flex-col h-full gap-4 md:gap-8">
              {isLoading ? (
                <>
                  <div className="h-23 md:h-48 bg-blue-50 dark:bg-blue-950 rounded-lg shadow-lg p-4 lg:p-6 animate-pulse"/>
                  <div className="h-23 md:h-48 bg-blue-50 dark:bg-blue-950 rounded-lg shadow-lg p-4 lg:p-6 animate-pulse"/>
                  <div className="h-23 md:h-48 bg-blue-50 dark:bg-blue-950 rounded-lg shadow-lg p-4 lg:p-6 animate-pulse"/>
                  <div className="h-23 md:h-48 bg-blue-50 dark:bg-blue-950 rounded-lg shadow-lg p-4 lg:p-6 animate-pulse"/>
                </>
              ) : (
                <>
                  <MetricCard
                    label="Bench Press"
                    primaryDataPoint={
                      currentMaxes?.Bench !== undefined
                        ? `${currentMaxes.Bench}kg`
                        : '--'
                    }
                  />
                  <MetricCard
                    label="Squat"
                    primaryDataPoint={
                      currentMaxes?.Squat !== undefined
                        ? `${currentMaxes.Squat}kg`
                        : '--'
                    }
                  />
                  <MetricCard
                    label="Deadlift"
                    primaryDataPoint={
                      currentMaxes?.Deadlift !== undefined
                        ? `${currentMaxes.Deadlift}kg`
                        : '--'
                    }
                  />
                  <MetricCard
                    label="Wilks Score"
                    primaryDataPoint={
                      currentWilks > 0
                        ? currentWilks.toFixed(2)
                        : '--'
                    }
                  />
                </>
              )}
            </div>
          </div>
          <BaseCard type="table" padding={true} isLoading={isLoading} isError={isError}>
            <div className="mb-6 flex-shrink-0">
              <label htmlFor="chart-select" className="block text-blue-900 dark:text-white font-semibold mb-2">
                Select Chart
              </label>
              <Dropdown
                id="chart-select"
                value={selectedChart}
                onChange={(value) => setSelectedChart(value as ChartType)}
                options={[
                  { value: 'Bench', label: 'Bench Press' },
                  { value: 'Squat', label: 'Squat' },
                  { value: 'Deadlift', label: 'Deadlift' },
                  { value: 'Total', label: 'Total' },
                  { value: 'Wilks', label: 'Wilks Score' }
                ]}
                className="block rounded-md border-2 w-full md:w-64 px-4 py-2 bg-blue-50 dark:bg-blue-950"
              />
            </div>
            <div className="w-full flex-1 min-h-0">
              {selectedChart === 'Wilks' ? (
                <WilksLineChart WilksScore={WilksScore} windowSize={windowSize} />
              ) : selectedChart === 'Total' ? (
                <TotalLineChart maxes={maxes} windowSize={windowSize} />
              ) : (
                <MaxesLineChart maxes={maxes} selectedLift={selectedChart} windowSize={windowSize} />
              )}
            </div>
          </BaseCard>
        </div>
      </div>
    </div>
  )
}