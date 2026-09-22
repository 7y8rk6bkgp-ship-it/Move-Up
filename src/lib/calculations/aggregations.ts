import { format, startOfWeek } from 'date-fns'
import type { Exercise, MuscleGroup, SetEntry, WorkoutSession } from '@/db/types'
import { epley1RM } from './oneRepMax'
import { setVolumeKg, workingSets } from './volume'

export interface DayVolume {
  date: string // yyyy-MM-dd
  volumeKg: number
  setCount: number
  sessionIds: string[]
}

/** Aggregates working-set volume per calendar day, keyed by yyyy-MM-dd. */
export function volumeByDay(
  sessions: WorkoutSession[],
  sets: SetEntry[],
): Map<string, DayVolume> {
  const sessionById = new Map(sessions.map((s) => [s.id, s]))
  const result = new Map<string, DayVolume>()

  for (const set of workingSets(sets)) {
    const session = sessionById.get(set.sessionId)
    if (!session) continue
    const dayKey = format(new Date(session.date), 'yyyy-MM-dd')
    const entry = result.get(dayKey) ?? {
      date: dayKey,
      volumeKg: 0,
      setCount: 0,
      sessionIds: [],
    }
    entry.volumeKg += setVolumeKg(set)
    entry.setCount += 1
    if (!entry.sessionIds.includes(session.id)) entry.sessionIds.push(session.id)
    result.set(dayKey, entry)
  }

  return result
}

export interface WeekBucket {
  weekStart: string // yyyy-MM-dd, Monday
  volumeKg: number
  sessionCount: number
}

export function weeklyVolume(sessions: WorkoutSession[], sets: SetEntry[]): WeekBucket[] {
  const sessionById = new Map(sessions.map((s) => [s.id, s]))
  const buckets = new Map<string, WeekBucket>()

  for (const set of workingSets(sets)) {
    const session = sessionById.get(set.sessionId)
    if (!session) continue
    const weekKey = format(startOfWeek(new Date(session.date), { weekStartsOn: 1 }), 'yyyy-MM-dd')
    const bucket = buckets.get(weekKey) ?? { weekStart: weekKey, volumeKg: 0, sessionCount: 0 }
    bucket.volumeKg += setVolumeKg(set)
    buckets.set(weekKey, bucket)
  }

  for (const session of sessions) {
    const weekKey = format(startOfWeek(new Date(session.date), { weekStartsOn: 1 }), 'yyyy-MM-dd')
    const bucket = buckets.get(weekKey)
    if (bucket) bucket.sessionCount += 1
  }

  return Array.from(buckets.values()).sort((a, b) => a.weekStart.localeCompare(b.weekStart))
}

export function weeklyFrequency(sessions: WorkoutSession[]): { weekStart: string; count: number }[] {
  const buckets = new Map<string, number>()
  for (const session of sessions) {
    const weekKey = format(startOfWeek(new Date(session.date), { weekStartsOn: 1 }), 'yyyy-MM-dd')
    buckets.set(weekKey, (buckets.get(weekKey) ?? 0) + 1)
  }
  return Array.from(buckets.entries())
    .map(([weekStart, count]) => ({ weekStart, count }))
    .sort((a, b) => a.weekStart.localeCompare(b.weekStart))
}

/** Volume per muscle group, crediting secondary muscles at half weight. */
export function volumeByMuscleGroup(
  sets: SetEntry[],
  exercises: Exercise[],
  sinceDate?: Date,
): Record<MuscleGroup, number> {
  const exerciseById = new Map(exercises.map((e) => [e.id, e]))
  const result = {} as Record<MuscleGroup, number>

  for (const set of workingSets(sets)) {
    if (sinceDate && new Date(set.createdAt) < sinceDate) continue
    const exercise = exerciseById.get(set.exerciseId)
    if (!exercise) continue
    const volume = setVolumeKg(set)
    result[exercise.muscleGroup] = (result[exercise.muscleGroup] ?? 0) + volume
    for (const secondary of exercise.secondaryMuscles) {
      result[secondary] = (result[secondary] ?? 0) + volume * 0.5
    }
  }

  return result
}

export interface ExerciseHistoryPoint {
  date: string
  sessionId: string
  bestWeightKg: number
  bestWeightReps: number
  estimated1RmKg: number
  volumeKg: number
}

/** Per-session history for one exercise, sorted chronologically. */
export function exerciseHistory(
  sessions: WorkoutSession[],
  sets: SetEntry[],
  exerciseId: string,
): ExerciseHistoryPoint[] {
  const sessionById = new Map(sessions.map((s) => [s.id, s]))
  const bySession = new Map<string, SetEntry[]>()

  for (const set of sets) {
    if (set.exerciseId !== exerciseId || set.isWarmup) continue
    const arr = bySession.get(set.sessionId) ?? []
    arr.push(set)
    bySession.set(set.sessionId, arr)
  }

  const points: ExerciseHistoryPoint[] = []
  for (const [sessionId, sessionSets] of bySession) {
    const session = sessionById.get(sessionId)
    if (!session) continue
    let bestWeightKg = 0
    let bestWeightReps = 0
    let best1Rm = 0
    let volumeKg = 0
    for (const set of sessionSets) {
      volumeKg += setVolumeKg(set)
      const e1rm = epley1RM(set.weightKg, set.reps)
      if (e1rm > best1Rm) best1Rm = e1rm
      if (
        set.weightKg > bestWeightKg ||
        (set.weightKg === bestWeightKg && set.reps > bestWeightReps)
      ) {
        bestWeightKg = set.weightKg
        bestWeightReps = set.reps
      }
    }
    points.push({
      date: session.date,
      sessionId,
      bestWeightKg,
      bestWeightReps,
      estimated1RmKg: best1Rm,
      volumeKg,
    })
  }

  return points.sort((a, b) => a.date.localeCompare(b.date))
}
