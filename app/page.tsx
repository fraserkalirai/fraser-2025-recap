'use client'

import { useQueries } from '@tanstack/react-query'
import { useState, useEffect } from 'react'
import { 
  fetchWeeklyVolume,
  fetchTestosteroneIncrease, 
  fetchTotalLiftIncrease,
  fetchWeightChange 
} from '@/src/lib/queries'
import WeeklyVolumeChart from '@/src/components/charts/WeeklyVolumeChart'
import MetricCard from '@/src/components/ui/MetricCard'
import PageHeader from '@/src/components/ui/PageHeader'
import BaseCard from '@/src/components/ui/BaseCard'
import NoDataCard from '@/src/components/ui/NoDataCard'

export default function Home() {
  const [windowSize, setWindowSize] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024)

  useEffect(() => {
    const handleResize = () => {
      setWindowSize(window.innerWidth)
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const results = useQueries({
    queries: [
      {
        queryKey: ['weeklyVolume'],
        queryFn: fetchWeeklyVolume,
      },
      {
        queryKey: ['testosteroneIncrease'],
        queryFn: fetchTestosteroneIncrease,
      },
      {
        queryKey: ['totalLiftIncrease'],
        queryFn: fetchTotalLiftIncrease,
      },
      {
        queryKey: ['weightChange'],
        queryFn: fetchWeightChange,
      },
    ],
  })
  
  const [
    { data: weeklyVolume, isLoading: isWeeklyVolumeLoading, error: weeklyVolumeError },
    { data: testosteroneData, isLoading: isTestosteroneLoading, error: testosteroneError },
    { data: totalLiftData, isLoading: isTotalLiftLoading, error: totalLiftError },
    { data: weightChangeData, isLoading: isWeightChangeLoading, error: weightChangeError },
  ] = results

  const isLoading = isWeeklyVolumeLoading || isTestosteroneLoading || isTotalLiftLoading || isWeightChangeLoading
  const isError = !!(weeklyVolumeError || testosteroneError || totalLiftError || weightChangeError)

  return (
    <div className="h-full flex flex-col bg-white dark:bg-blue-900 gap-4 lg:gap-8">
      <div>
        <PageHeader header={"Overview"} />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-8">
          {isLoading ? (
            <>
              <div className="h-23 md:h-29 bg-blue-50 dark:bg-blue-950 rounded-lg animate-pulse" />
              <div className="h-23 md:h-29 bg-blue-50 dark:bg-blue-950 rounded-lg animate-pulse" />
              <div className="h-23 md:h-29 bg-blue-50 dark:bg-blue-950 rounded-lg animate-pulse" />
              <div className="h-23 md:h-29 bg-blue-50 dark:bg-blue-950 rounded-lg animate-pulse" />
            </>
          ) : (
            <>
              <MetricCard
                label="Weight Gain"
                primaryDataPoint={
                  weightChangeData?.kgChange !== undefined
                    ? `${weightChangeData.kgChange.toFixed(1)}kg`
                    : '--'
                }
                secondaryDataPoint={
                  weightChangeData?.percentChange !== undefined
                    ? `${weightChangeData.percentChange.toFixed(0)}%`
                    : undefined
                }
              />

              <MetricCard
                label="SBD Maxes Gain"
                primaryDataPoint={
                  totalLiftData?.kgIncrease !== undefined
                    ? `${totalLiftData.kgIncrease.toFixed(1).replace(/\.0$/, '')}kg`
                    : '--'
                }
                secondaryDataPoint={
                  totalLiftData?.percentIncrease !== undefined
                    ? `${totalLiftData.percentIncrease.toFixed(0)}%`
                    : undefined
                }
              />
              
              <MetricCard
                label="Testosterone Gain"
                primaryDataPoint={
                  testosteroneData?.percentIncrease !== undefined
                    ? `${testosteroneData.percentIncrease.toFixed(0)}%`
                    : '--'
                }
              />
              
              <MetricCard
                label="Total Reps"
                primaryDataPoint={
                  weeklyVolume
                    ? weeklyVolume.reduce((sum, w) => sum + w.totalVolume, 0).toLocaleString()
                    : '--'
                }
              />
            </>
          )}
        </div>
      </div>
      
      <BaseCard type='chart' padding={true} isLoading={isLoading} isError={isError}>
        {!isLoading && !isError && weeklyVolume && weeklyVolume.length > 0 && (
          <div className="h-full"> 
            <WeeklyVolumeChart data={weeklyVolume} windowSize={windowSize}/>
          </div>
        )}
        
        {!isLoading && !isError && weeklyVolume && weeklyVolume.length === 0 && (
          <NoDataCard/>
        )}
      </BaseCard>
    </div>
  )
}