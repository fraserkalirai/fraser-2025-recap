'use client'

import { useEffect, useState } from 'react'
import BiometricLineChart from '@/src/components/charts/BiometricsChart'
import { fetchBodyComposition, fetchHormones, fetchSleep } from '@/src/lib/queries'
import { BiometricMetric, Sleep, BodyComposition, Hormone } from '@/src/types'
import { useTheme } from '@/src/hooks/useTheme'
import PageHeader from '@/src/components/ui/PageHeader'
import BaseCard from '@/src/components/ui/BaseCard'
import ErrorCard from '@/src/components/ui/ErrorCard'

type BaseMetric = Omit<BiometricMetric, 'yAxisID' | 'color'>

const availableMetrics: BaseMetric[] = [
  { id: 'overall_sleep', label: 'Overall Sleep', unit: 'time', enabled: false },
  { id: 'total_testosterone', label: 'Total Testosterone', unit: 'ng/dl', enabled: false },
  { id: 'free_testosterone', label: 'Free Testosterone', unit: 'ng/dl - Free Testosterone', enabled: false },
  { id: 'shbg', label: 'SHBG', unit: 'ng/dl', enabled: false },
  { id: 'fai', label: 'FAI', unit: '% - FAI', enabled: false },
  { id: 'weight', label: 'Weight', unit: 'kg', enabled: true },
  { id: 'body_fat_navy', label: 'Body Fat - Navy', unit: '%', enabled: false },
  { id: 'body_fat_calipers', label: 'Body Fat - Calipers', unit: '%', enabled: false },
  { id: 'body_fat_composite', label: 'Body Fat - Composite', unit: '%', enabled: true },
]

const COLOR_PALETTE = [
  'rgb(28, 57, 142)',
  'rgb(20, 71, 230)',
  'rgb(43, 127, 255)',
  'rgb(77, 23, 154)',
  'rgb(112, 8, 231)'
]

const COLOR_PALETTE_DARK = [
  'rgb(255, 255, 255)',
  'rgb(142, 197, 255)',
  'rgb(43, 127, 255)',
  'rgb(196, 180, 255)',
  'rgb(142, 81, 255)',
]

export default function BiometricsPage() {
  const [windowSize, setWindowSize] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024)
  const [sleepData, setSleepData] = useState<Sleep[]>([])
  const [bodyCompositionData, setBodyCompositionData] = useState<BodyComposition[]>([])
  const [hormoneData, setHormoneData] = useState<Hormone[]>([])
  const [metrics, setMetrics] = useState<BaseMetric[]>(availableMetrics)
  const [isLoading, setLoading] = useState(true)
  const [isError, setError] = useState(false)
  const isDark = useTheme()

  useEffect(() => {
    const handleResize = () => {
      setWindowSize(window.innerWidth)
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        const [sleepRes, hormoneRes, bodyRes] = await Promise.all([
          fetchSleep(),
          fetchHormones(),
          fetchBodyComposition(),
        ])
        setSleepData(sleepRes)
        setHormoneData(hormoneRes)
        setBodyCompositionData(bodyRes)
      } catch (err) {
        setError(true)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])
  
  const getMetricsWithAxes = (): BiometricMetric[] => {
    const enabledMetrics = metrics.filter(m => m.enabled)
    if (enabledMetrics.length === 0) return []
    
    const unitGroups = new Map<string, BaseMetric[]>()
    enabledMetrics.forEach(m => {
      if (!unitGroups.has(m.unit)) {
        unitGroups.set(m.unit, [])
      }
      unitGroups.get(m.unit)!.push(m)
    })
    
    const units = Array.from(unitGroups.keys())
    const result: BiometricMetric[] = []
    let colorIndex = 0
    
    units.forEach((unit, index) => {
      const yAxisID: 'y' | 'y1' = index === 0 ? 'y' : 'y1'
      unitGroups.get(unit)!.forEach(metric => {
        result.push({ 
          ...metric, 
          yAxisID,
          color: isDark? COLOR_PALETTE_DARK[colorIndex % COLOR_PALETTE.length] : COLOR_PALETTE[colorIndex % COLOR_PALETTE.length]
        } as BiometricMetric)
        colorIndex++
      })
    })

    return result
  }

  const metricsWithAxes = getMetricsWithAxes()
  const enabledUnits = new Set(metricsWithAxes.map(m => m.unit))
  const canEnableMore = enabledUnits.size < 2

  const toggleMetric = (id: string) => {
    setMetrics(prev => {
      const newMetrics = prev.map(m => 
        m.id === id ? { ...m, enabled: !m.enabled } : m
      )

      const metric = prev.find(m => m.id === id)!
      if (!metric.enabled) {
        const wouldBeEnabledUnits = new Set(
          newMetrics.filter(m => m.enabled).map(m => m.unit)
        )
        if (wouldBeEnabledUnits.size > 2) {
          return prev
        }
      }
      
      return newMetrics
    })
  }

  const canToggle = (metric: BaseMetric) => {
    if (metric.enabled) return true
    if (enabledUnits.has(metric.unit)) return true
    return canEnableMore
  }

  return (
    <div className="w-full h-full flex flex-col">
      <PageHeader header={"Biometrics Analysis"} />
      
      {isLoading ? (
        <div className="h-55 md:h-42 mb-4 lg:mb-8 p-4 rounded-lg shadow-lg bg-blue-50 dark:bg-blue-950 flex-shrink-0 animate-pulse" />
      ) : isError ? (
        <div className="h-55 md:h-42 mb-4 lg:mb-8 p-4 rounded-lg shadow-lg bg-blue-50 dark:bg-blue-950 flex-shrink-0 flex items-center justify-center">
          <ErrorCard />
        </div>
      ) : (
        <div className="mb-4 lg:mb-8 p-4 rounded-lg shadow-lg bg-blue-50 text-blue-900 dark:text-white dark:bg-blue-950 flex-shrink-0">
          <h2 className="text-md sm:text-lg font-semibold mb-2 md:mb-4">Select Metrics (Max 2 different units)</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {metrics.map(metric => (
              <label 
                key={metric.id} 
                className={`flex items-center space-x-2 cursor-pointer ${
                  !canToggle(metric) && !metric.enabled ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <input
                  type="checkbox"
                  checked={metric.enabled}
                  onChange={() => toggleMetric(metric.id)}
                  disabled={!canToggle(metric)}
                  className="w-4 h-4"
                />
                <span className="text-[10px] sm:text-sm">{metric.label} ({metric.unit})</span>
              </label>
            ))}
          </div>
        </div>
      )}

      <BaseCard type='chart' padding={true} isLoading={isLoading} isError={isError}>
        <BiometricLineChart
          sleepData={sleepData}
          bodyCompositionData={bodyCompositionData}
          hormoneData={hormoneData}
          metrics={metricsWithAxes}
          isDark={isDark}
          windowSize={windowSize}
        />
      </BaseCard>
        
    </div>
  )
}