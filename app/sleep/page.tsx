'use client'
import { useEffect, useState } from 'react'
import SleepStackedBarChart from '@/src/components/charts/SleepMonthlyBarChart'
import SleepLineChart from '@/src/components/charts/SleepMonthlyLineChart'
import { fetchSleep } from '@/src/lib/queries'
import { Sleep } from '@/src/types'
import { useTheme } from '@/src/hooks/useTheme'
import PageHeader from '@/src/components/ui/PageHeader'
import BaseCard from '@/src/components/ui/BaseCard'

export default function SleepPage() {
  const [sleepData, setSleepData] = useState<Sleep[]>([])
  const [isLoading, setLoading] = useState(true)
  const [isError, setError] = useState(false)
  const isDark  = useTheme()
  const [windowSize, setWindowSize] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024)
  const [isLandscape, setIsLandscape] = useState(true)
  
  useEffect(() => {
    const handleResize = () => {
      setWindowSize(window.innerWidth)
      setIsLandscape(window.innerWidth > window.innerHeight)
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    async function loadSleepData() {
      try {
        setLoading(true)
        const data = await fetchSleep()
        setSleepData(data)
      } catch (err) {
        setError(true)
      } finally {
        setLoading(false)
      }
    }
    loadSleepData()
  }, [])

  return (
    <div className="w-full h-full flex flex-col">
      <PageHeader header={"Sleep"} />
      <div className={`flex flex-col gap-6 w-full flex-1 min-h-0 ${isLandscape ? 'md:grid md:grid-cols-2' : ''}`}>
        <BaseCard type='chart' padding={true} isLoading={isLoading} isError={isError} className="flex-1 min-h-0">
          <SleepStackedBarChart data={sleepData} isDark={isDark} windowSize={windowSize}/>
        </BaseCard>
        <BaseCard type='chart' padding={true}  isLoading={isLoading} isError={isError} className="flex-1 min-h-0">
          <SleepLineChart data={sleepData} isDark={isDark} windowSize={windowSize}/>
        </BaseCard>
      </div>
    </div>
  )
}