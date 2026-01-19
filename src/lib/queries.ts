import { supabase } from './supabase'
import { BodyComposition, Hormone, Max, Sleep, Supplement, WeeklyVolume, Workout } from '@/src/types'

export async function fetchExerciseTypes() {
  const { data, error } = await supabase
    .rpc('get_exercise_counts')
  
  if (error) throw error
  return data.map((row: any) => row.exercise)
}

export async function fetchExercise(exercise: string): Promise<Workout[]> {
  const { data, error } = await supabase
    .from('workouts')
    .select('*')
    .eq('exercise', exercise)
    .order('date', { ascending: true })

  if (error) throw error
  return data
}

export async function fetchWeeklyVolume(): Promise<WeeklyVolume[]> {
  const { data, error } = await supabase
    .rpc('get_weekly_volume')
  
  if (error) throw error
  
  return (data || []).map((item: any) => ({
    weekNumber: item.week_number,
    totalVolume: item.total_volume
  }))
}

export async function fetchSupplements(): Promise<Supplement[]> {
  const { data, error } = await supabase
    .from('supplements')
    .select('*')
    .order('type', { ascending: true })
    .order('supplement', { ascending: true })

  if (error) throw error

  return (data ?? []).map((item) => ({
    id: item.id,
    type: item.type,
    supplement: item.supplement,
    dosage: item.dosage,
    increasedDosage: item.increased_dosage ?? null,
    dateOfIncrease: item.date_of_increase
      ? new Date(item.date_of_increase)
      : null,
  }))
}

export async function fetchMaxes(): Promise<Max[]> {
  const { data, error } = await supabase
    .from('maxes')
    .select('*')
    .order('date', { ascending: true })
  
  if (error) throw error
  
  return data.map((item: any) => ({
    id: item.id,
    lift: item.lift,
    weight: item.weight,
    bodyWeight: item.body_weight,
    month: item.month,
    date: new Date(item.date)
  }))
}

export async function fetchSleep(): Promise<Sleep[]> {
  const { data, error } = await supabase
    .from('sleep')
    .select('*')
    .order('date', { ascending: true })
  
  if (error) throw error
  
  return data.map((item: any) => ({
    id: item.id,
    date: new Date(item.date),
    month: item.month,
    overall: item.overall,
    awake: item.awake,
    core: item.core,
    rem: item.rem,
    deep: item.deep
  }))
}

export async function fetchHormones(): Promise<Hormone[]> {
  const { data, error } = await supabase
    .from('hormones')
    .select('*')
    .order('date', { ascending: true })
  
  if (error) throw error
  
  return data.map((item: any) => ({
    id: item.id,
    totalTestosterone: item.total_testosterone,
    freeTestosterone: item.free_testosterone,
    sexHormoneBindingGlobulin: item.sex_hormone_binding_globulin,
    fai: item.fai,
    date: new Date(item.date)
  }))
}

export async function fetchBodyComposition(): Promise<BodyComposition[]> {
  const { data, error } = await supabase
    .from('body_composition')
    .select('*')
    .order('date', { ascending: true })
  
  if (error) throw error
  
  return data.map((item: any) => ({
    id: item.id,
    date: new Date(item.date),
    week: item.week,
    weight: item.weight,
    bodyFatNavy: item.body_fat_navy,
    bodyFatCalipers: item.body_fat_calipers
  }))
}

export async function fetchTestosteroneIncrease(): Promise<{ percentIncrease: number; first: number; peak: number }> {
  const hormones = await fetchHormones()
  
  if (!hormones || hormones.length === 0) throw new Error('No testosterone data found')
  
  const first = hormones[0].totalTestosterone
  const peak = Math.max(...hormones.map(h => h.totalTestosterone))
  const percentIncrease = ((peak - first) / first) * 100
  
  return { percentIncrease, first, peak }
}

export async function fetchTotalLiftIncrease(): Promise<{ kgIncrease: number; percentIncrease: number; firstTotal: number; recentTotal: number }> {
  const lifts: Array<"Deadlift" | "Squat" | "Bench"> = ["Deadlift", "Squat", "Bench"]
  const maxes = await fetchMaxes()
  
  const firstMaxes: Record<string, number> = {}
  const recentMaxes: Record<string, number> = {}
  
  for (const lift of lifts) {
    const liftData = maxes.filter(m => m.lift === lift)
    
    if (!liftData || liftData.length === 0) throw new Error(`No data found for ${lift}`)
    
    firstMaxes[lift] = liftData[0].weight
    recentMaxes[lift] = liftData[liftData.length - 1].weight
  }
  
  const firstTotal = Object.values(firstMaxes).reduce((sum, w) => sum + w, 0)
  const recentTotal = Object.values(recentMaxes).reduce((sum, w) => sum + w, 0)
  const kgIncrease = recentTotal - firstTotal
  const percentIncrease = ((recentTotal - firstTotal) / firstTotal) * 100
  
  return { kgIncrease, percentIncrease, firstTotal, recentTotal }
}

export async function fetchWeightChange(): Promise<{ kgChange: number; percentChange: number; startWeight: number; endWeight: number }> {
  const bodyComposition = await fetchBodyComposition()
  
  if (!bodyComposition || bodyComposition.length === 0) throw new Error('No body composition data found')
  
  const startWeight = bodyComposition[0].weight
  const endWeight = bodyComposition[bodyComposition.length - 1].weight
  const kgChange = endWeight - startWeight
  const percentChange = ((endWeight - startWeight) / startWeight) * 100
  
  return { kgChange, percentChange, startWeight, endWeight }
}