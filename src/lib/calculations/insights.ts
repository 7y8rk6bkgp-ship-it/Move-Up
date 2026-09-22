import { differenceInCalendarDays } from 'date-fns'
import type { Exercise, MuscleGroup, SetEntry, WorkoutSession } from '@/db/types'
import type { ExerciseHistoryPoint } from './aggregations'
import { workingSets } from './volume'

/** Simple least-squares slope over (index, value) pairs. */
export function linearSlope(values: number[]): number {
  const n = values.length
  if (n < 2) return 0
  const xs = values.map((_, i) => i)
  const meanX = xs.reduce((a, b) => a + b, 0) / n
  const meanY = values.reduce((a, b) => a + b, 0) / n
  let num = 0
  let den = 0
  for (let i = 0; i < n; i++) {
    num += (xs[i] - meanX) * (values[i] - meanY)
    den += (xs[i] - meanX) ** 2
  }
  return den === 0 ? 0 : num / den
}

export type TrendLabel = 'progresando' | 'estable' | 'en_descenso' | 'sin_datos'

export interface ExerciseTrend {
  label: TrendLabel
  changePct: number
  windowSize: number
}

/**
 * Classifies recent progress on an exercise from its last `window` sessions'
 * estimated 1RM. >=2.5% slope-implied change is "progresando", <=-2.5% is
 * "en_descenso", otherwise "estable".
 */
export function classifyExerciseTrend(
  history: ExerciseHistoryPoint[],
  window = 5,
): ExerciseTrend {
  const recent = history.slice(-window)
  if (recent.length < 3) return { label: 'sin_datos', changePct: 0, windowSize: recent.length }

  const values = recent.map((p) => p.estimated1RmKg)
  const slope = linearSlope(values)
  const first = values[0]
  const projectedChange = slope * (values.length - 1)
  const changePct = first > 0 ? (projectedChange / first) * 100 : 0

  let label: TrendLabel = 'estable'
  if (changePct >= 2.5) label = 'progresando'
  else if (changePct <= -2.5) label = 'en_descenso'

  return { label, changePct, windowSize: recent.length }
}

export type MuscleGroupZone = 'empuje' | 'tiron' | 'pierna'

const PUSH_GROUPS: MuscleGroup[] = ['pecho', 'hombros', 'triceps']
const PULL_GROUPS: MuscleGroup[] = ['espalda', 'biceps', 'trapecios']
const QUAD_GROUPS: MuscleGroup[] = ['cuadriceps']
const HAMSTRING_GLUTE_GROUPS: MuscleGroup[] = ['isquiotibiales', 'gluteos']

export interface BalanceRatio {
  label: string
  aKg: number
  bKg: number
  ratio: number // a / b
  status: 'equilibrado' | 'desbalanceado'
  message: string
}

function sumGroups(volume: Record<MuscleGroup, number>, groups: MuscleGroup[]): number {
  return groups.reduce((sum, g) => sum + (volume[g] ?? 0), 0)
}

/** Push/pull and quad/posterior-chain balance from a muscle-group volume map. */
export function computeBalanceRatios(volume: Record<MuscleGroup, number>): BalanceRatio[] {
  const pushKg = sumGroups(volume, PUSH_GROUPS)
  const pullKg = sumGroups(volume, PULL_GROUPS)
  const quadKg = sumGroups(volume, QUAD_GROUPS)
  const posteriorKg = sumGroups(volume, HAMSTRING_GLUTE_GROUPS)

  const ratios: BalanceRatio[] = []

  if (pushKg > 0 || pullKg > 0) {
    const ratio = pullKg === 0 ? Infinity : pushKg / pullKg
    const balanced = ratio >= 0.75 && ratio <= 1.35
    ratios.push({
      label: 'Empuje vs. tirón',
      aKg: pushKg,
      bKg: pullKg,
      ratio,
      status: balanced ? 'equilibrado' : 'desbalanceado',
      message: balanced
        ? 'Buen equilibrio entre empuje y tirón.'
        : ratio > 1.35
          ? 'Estás priorizando empuje sobre tirón — considera sumar más remo/dominadas.'
          : 'Estás priorizando tirón sobre empuje — considera sumar más press.',
    })
  }

  if (quadKg > 0 || posteriorKg > 0) {
    const ratio = posteriorKg === 0 ? Infinity : quadKg / posteriorKg
    const balanced = ratio >= 0.6 && ratio <= 1.6
    ratios.push({
      label: 'Cuádriceps vs. cadena posterior',
      aKg: quadKg,
      bKg: posteriorKg,
      ratio,
      status: balanced ? 'equilibrado' : 'desbalanceado',
      message: balanced
        ? 'Buen equilibrio entre cuádriceps y cadena posterior.'
        : ratio > 1.6
          ? 'Dominan los cuádriceps — suma peso muerto rumano, femoral o hip thrust.'
          : 'Domina la cadena posterior — suma sentadilla o prensa.',
    })
  }

  return ratios
}

export interface MuscleRecovery {
  muscleGroup: MuscleGroup
  daysSinceTrained: number | null
  volumeLast7Days: number
}

/** Days since each muscle group was last worked (primary movers only), for a recovery/staleness view. */
export function computeMuscleRecovery(
  sessions: WorkoutSession[],
  sets: SetEntry[],
  exercises: Exercise[],
  allMuscleGroups: MuscleGroup[],
  now: Date = new Date(),
): MuscleRecovery[] {
  const sessionById = new Map(sessions.map((s) => [s.id, s]))
  const exerciseById = new Map(exercises.map((e) => [e.id, e]))
  const lastTrainedAt = new Map<MuscleGroup, Date>()
  const last7DaysVolume = new Map<MuscleGroup, number>()

  for (const set of workingSets(sets)) {
    const session = sessionById.get(set.sessionId)
    const exercise = exerciseById.get(set.exerciseId)
    if (!session || !exercise) continue
    const date = new Date(session.date)
    const current = lastTrainedAt.get(exercise.muscleGroup)
    if (!current || date > current) lastTrainedAt.set(exercise.muscleGroup, date)

    if (differenceInCalendarDays(now, date) <= 7) {
      last7DaysVolume.set(
        exercise.muscleGroup,
        (last7DaysVolume.get(exercise.muscleGroup) ?? 0) + set.weightKg * set.reps,
      )
    }
  }

  return allMuscleGroups.map((muscleGroup) => {
    const last = lastTrainedAt.get(muscleGroup)
    return {
      muscleGroup,
      daysSinceTrained: last ? differenceInCalendarDays(now, last) : null,
      volumeLast7Days: last7DaysVolume.get(muscleGroup) ?? 0,
    }
  })
}
