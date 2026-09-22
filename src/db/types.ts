export type MovementPattern = 'empuje' | 'tiron' | 'pierna' | 'core'

export type MuscleGroup =
  | 'pecho'
  | 'espalda'
  | 'hombros'
  | 'biceps'
  | 'triceps'
  | 'antebrazos'
  | 'abdomen'
  | 'cuadriceps'
  | 'isquiotibiales'
  | 'gluteos'
  | 'gemelos'
  | 'trapecios'

/** Unit stored internally is always kg. This is only the display preference. */
export type WeightUnit = 'kg' | 'lb'

export interface Exercise {
  id: string
  name: string
  muscleGroup: MuscleGroup
  secondaryMuscles: MuscleGroup[]
  pattern: MovementPattern
  isCustom: boolean
  archivedAt?: string | null
}

export interface WorkoutSession {
  id: string
  date: string // ISO datetime, session start
  endedAt?: string | null // ISO datetime, session end (for duration)
  notes?: string
  templateId?: string | null
  templateName?: string | null
  bodyWeightKg?: number | null
}

export interface SetEntry {
  id: string
  sessionId: string
  exerciseId: string
  exerciseOrder: number // order of the exercise block within the session
  setIndex: number // order of the set within the exercise block
  weightKg: number
  reps: number
  rpe?: number | null
  isWarmup: boolean
  createdAt: string
}

export interface BodyWeightLog {
  id: string
  date: string // ISO date (day precision)
  weightKg: number
}

export interface RoutineTemplate {
  id: string
  name: string
  exerciseIds: string[]
  isCustom: boolean
}

export interface AppSettings {
  id: 'app'
  unit: WeightUnit
  restTimerSeconds: number
}

export type AchievementCategory = 'consistencia' | 'fuerza' | 'volumen' | 'exploracion'

export interface Achievement {
  id: string
  category: AchievementCategory
  name: string
  description: string
  targetValue: number
  icon: string
}

export interface AchievementProgress {
  achievementId: string
  currentValue: number
  unlockedAt?: string | null
}

export type PrEventKind = 'peso' | '1rm' | 'volumen'

export interface PrEvent {
  id: string
  exerciseId: string
  exerciseName: string
  kind: PrEventKind
  valueKg: number
  previousValueKg: number | null
  date: string
}

export interface PersonalRecord {
  /** composite key: `${exerciseId}` */
  exerciseId: string
  bestWeightKg: number
  bestWeightReps: number
  bestWeightDate: string
  bestEstimated1RmKg: number
  best1RmDate: string
  bestVolumeSingleSessionKg: number
  bestVolumeDate: string
}
