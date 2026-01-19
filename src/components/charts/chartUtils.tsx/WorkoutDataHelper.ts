import { ExerciseBubbleDataPoint, Workout, WeeklyExerciseData } from "@/src/types"

export function processExerciseData(exercises: Workout[], isSmallScreen: boolean): ExerciseBubbleDataPoint[] {
  const grouped = new Map<string, Workout[]>()
  
  exercises.forEach(exercise => {
    const key = `${exercise.date}-${exercise.weight}`
    if (!grouped.has(key)) {
      grouped.set(key, [])
    }
    grouped.get(key)!.push(exercise)
  })
  
  const processed: ExerciseBubbleDataPoint[] = []
  
  grouped.forEach((group) => {
    const totalSets = group.reduce((sum, w) => sum + w.sets, 0)
    const maxReps = Math.max(...group.map(w => w.reps))
    
    const repMap = new Map<number, number>()
    group.forEach(w => {
      repMap.set(w.reps, (repMap.get(w.reps) || 0) + w.sets)
    })
    
    const repBreakdown = Array.from(repMap.entries())
      .map(([reps, sets]) => ({ reps, sets }))
      .sort((a, b) => b.reps - a.reps)
    
    processed.push({
      x: new Date(group[0].date).getTime(),
      y: group[0].weight,
      r: isSmallScreen ? (totalSets * 1.75) + 0.125 : (totalSets * 4) + 1,
      maxReps,
      repBreakdown,
      date: group[0].date
    })
  })
  
  return processed
}

export function processWeeklyData(workouts: Workout[]): WeeklyExerciseData[] {
  const weekMap = new Map<number, Workout[]>()
  
  workouts.forEach(workout => {
    if (!weekMap.has(workout.week)) {
      weekMap.set(workout.week, [])
    }
    weekMap.get(workout.week)!.push(workout)
  })
  
  const weeklyData: WeeklyExerciseData[] = []
  
  weekMap.forEach((weekWorkouts, week) => {
    let totalVolumeWeight = 0
    let totalReps = 0
    let topWeight = 0
    
    weekWorkouts.forEach(workout => {
      const volume = workout.sets * workout.reps
      totalVolumeWeight += volume * workout.weight
      totalReps += volume
      topWeight = Math.max(topWeight, workout.weight)
    })
    
    const volumeWeightAverage = totalReps > 0 ? totalVolumeWeight / totalReps : 0
    
    weeklyData.push({
      week,
      volumeWeightAverage,
      topSet: topWeight
    })
  })
  
  return weeklyData.sort((a, b) => a.week - b.week)
}