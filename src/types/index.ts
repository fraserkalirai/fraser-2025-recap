export interface Workout {
  id: string
  date: string
  week: number
  day: number
  exercise: string
  sets: number
  reps: number
  weight: number
}

export interface ExerciseBubbleDataPoint {
  x: number
  y: number
  r: number
  maxReps: number
  repBreakdown: { reps: number; sets: number }[]
  date: string
}

export interface WeeklyExerciseData {
  week: number
  volumeWeightAverage: number
  topSet: number
}

export interface WeeklyVolume {
  weekNumber: number
  totalVolume: number
}

export interface Supplement {
  id: string
  type: "Morning" | "Night" | "Preworkout"
  supplement: string
  dosage: string
  increasedDosage?: string | null
  dateOfIncrease?: Date | null
}

export interface Max {
  id: string
  lift: "Deadlift" | "Squat" | "Bench"
  weight: number
  bodyWeight: number
  month: string
  date: Date
}

export interface WilksScore {
  month: string
  date: Date
  wilksScore: number
  total: number
  bodyWeight: number
  lifts: {
    bench?: number
    squat?: number
    deadlift?: number
  }
}

export interface Sleep {
  id: string
  date: Date
  month: string
  overall: number
  awake: number
  core: number
  rem: number
  deep: number
}

export interface Hormone {
  id: string
  totalTestosterone: number
  freeTestosterone: number
  sexHormoneBindingGlobulin: number
  fai: number
  date: Date
}

export interface BodyComposition {
  id: string
  date: Date
  week: number
  weight: number
  bodyFatNavy: number
  bodyFatCalipers: number
}

export interface BiometricMetric {
  id: string
  label: string
  color: string
  yAxisID: 'y' | 'y1'
  unit: string
  enabled: boolean
}