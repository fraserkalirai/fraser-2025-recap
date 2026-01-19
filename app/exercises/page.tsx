'use client'
import { useState, useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchExerciseTypes, fetchExercise } from '@/src/lib/queries'
import ExerciseBubbleChart from '@/src/components/charts/ExerciseBubbleChart'
import ExerciseWeeklyChart from '@/src/components/charts/ExerciseWeeklyChart'
import { useTheme } from '@/src/hooks/useTheme'
import PageHeader from '@/src/components/ui/PageHeader'
import BaseCard from '@/src/components/ui/BaseCard'
import Dropdown from '@/src/components/ui/Dropdown'

export default function Exercises() {
  const [windowSize, setWindowSize] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024)
  const isDark = useTheme()
  const [isLoading, setLoading] = useState(true)
  const queryClient = useQueryClient()

  useEffect(() => {
    const handleResize = () => {
      setWindowSize(window.innerWidth)
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])
  
  const { data: exerciseTypes } = useQuery({
    queryKey: ['exerciseTypes'],
    queryFn: fetchExerciseTypes,
  })
  
  const [selectedExercise, setSelectedExercise] = useState<string | undefined>(undefined)
  const [chartType, setChartType] = useState<'bubble' | 'line'>('bubble')
  
  useEffect(() => {
    if (exerciseTypes && exerciseTypes.length > 0) {
      setSelectedExercise(exerciseTypes[0])
      
      exerciseTypes.forEach((exerciseType: string) => {
        queryClient.prefetchQuery({
          queryKey: ['exercise', exerciseType],
          queryFn: () => fetchExercise(exerciseType),
        })
      })
    }
  }, [exerciseTypes, queryClient])
  
  const { data: exerciseData, isError, isFetching } = useQuery({
    queryKey: ['exercise', selectedExercise],
    queryFn: () => fetchExercise(selectedExercise!),
    enabled: !!selectedExercise,
  })

  useEffect(() => {
    if (!isFetching && selectedExercise) {
      setLoading(false)
    }
  }, [isFetching, selectedExercise])
  
  return (
    <div className="h-full flex flex-col bg-white dark:bg-blue-900 space-y-6">
      <PageHeader header={"Exercises"} />

      <BaseCard type="table" padding={true} isError={!!isError} isLoading={isLoading}>
        {exerciseTypes && (
          <div className="mb-4 flex flex-wrap gap-4 items-end flex-shrink-0">
            <div className="flex-initial ">
              <label className="block text-blue-900 dark:text-white font-semibold mb-2">
                Select Exercise
              </label>
              <Dropdown
                value={selectedExercise || ''}
                onChange={setSelectedExercise}
                options={exerciseTypes.map((et: string) => ({ value: et, label: et }))}
                className="p-2 rounded-md border-2 bg-blue-50 dark:bg-blue-950 text-blue-900 dark:text-white"
                minWidth={300}
              />
            </div>
            
            <div className='flex-initial'>
              <label className="block text-blue-900 dark:text-white font-semibold mb-2">
                Chart Type
              </label>
              <div className="inline-flex">
                <button
                  onClick={() => setChartType('bubble')}
                  className={`px-4 py-2 transition-colors border-2 border-blue-950 dark:border-white rounded-l-md ${
                    chartType === 'bubble'
                      ? 'bg-blue-950 dark:bg-white text-blue-50 dark:text-blue-950'
                      : 'bg-blue-50 dark:bg-blue-950 text-blue-950 dark:text-white hover:underline'
                  }`}
                >
                  Bubble
                </button>
                <button
                  onClick={() => setChartType('line')}
                  className={`px-4 py-2 transition-colors border-2 border-blue-950 dark:border-white rounded-r-md  ${
                    chartType === 'line'
                      ? 'bg-blue-950 dark:bg-white text-blue-50 dark:text-blue-950'
                      : 'bg-blue-50 dark:bg-blue-950 text-blue-950 dark:text-white hover:underline'
                  }`}
                >
                  Line
                </button>
              </div>
            </div>
          </div>
        )}
        
        <div className="flex-1 min-h-0 w-full">
          {exerciseData && selectedExercise && !isFetching && (
            <div className="h-full">
              {chartType === 'bubble' ? (
                <ExerciseBubbleChart exercises={exerciseData} isDark={isDark} windowSize={windowSize}/>
              ) : (
                <ExerciseWeeklyChart exercises={exerciseData} isDark={isDark} windowSize={windowSize}/>
              )}
            </div>
          )}
        </div>
      </BaseCard>
    </div>
  )
}