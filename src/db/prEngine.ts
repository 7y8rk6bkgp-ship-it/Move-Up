import { db } from './db'
import type { Exercise, SetEntry } from './types'
import { epley1RM, setVolumeKg, computeStreaks } from '@/lib/calculations'
import { useUIStore } from '@/store/useUIStore'

/**
 * Call after inserting/updating a working set. Detects weight / e1RM /
 * session-volume personal records, updates the cached PersonalRecord row,
 * appends a PrEvent, and queues a celebration in the UI store.
 */
export async function evaluateSetForRecords(set: SetEntry, exercise: Exercise): Promise<void> {
  if (set.isWarmup) return

  const now = new Date().toISOString()
  const existing = await db.personalRecords.get(exercise.id)
  const e1rm = epley1RM(set.weightKg, set.reps)

  const sessionSets = await db.sets.where('sessionId').equals(set.sessionId).toArray()
  const sessionVolumeForExercise = sessionSets
    .filter((s) => s.exerciseId === exercise.id && !s.isWarmup)
    .reduce((sum, s) => sum + setVolumeKg(s), 0)

  const next = {
    exerciseId: exercise.id,
    bestWeightKg: existing?.bestWeightKg ?? 0,
    bestWeightReps: existing?.bestWeightReps ?? 0,
    bestWeightDate: existing?.bestWeightDate ?? now,
    bestEstimated1RmKg: existing?.bestEstimated1RmKg ?? 0,
    best1RmDate: existing?.best1RmDate ?? now,
    bestVolumeSingleSessionKg: existing?.bestVolumeSingleSessionKg ?? 0,
    bestVolumeDate: existing?.bestVolumeDate ?? now,
  }

  const events: { kind: 'peso' | '1rm' | 'volumen'; valueKg: number; previousValueKg: number | null }[] = []

  if (set.weightKg > next.bestWeightKg) {
    events.push({ kind: 'peso', valueKg: set.weightKg, previousValueKg: existing?.bestWeightKg ?? null })
    next.bestWeightKg = set.weightKg
    next.bestWeightReps = set.reps
    next.bestWeightDate = now
  }

  if (e1rm > next.bestEstimated1RmKg) {
    events.push({ kind: '1rm', valueKg: e1rm, previousValueKg: existing?.bestEstimated1RmKg ?? null })
    next.bestEstimated1RmKg = e1rm
    next.best1RmDate = now
  }

  if (sessionVolumeForExercise > next.bestVolumeSingleSessionKg) {
    events.push({
      kind: 'volumen',
      valueKg: sessionVolumeForExercise,
      previousValueKg: existing?.bestVolumeSingleSessionKg ?? null,
    })
    next.bestVolumeSingleSessionKg = sessionVolumeForExercise
    next.bestVolumeDate = now
  }

  if (events.length === 0) return

  await db.personalRecords.put(next)

  const isFirstEverRecord = !existing
  for (const event of events) {
    // Don't spam three simultaneous celebrations the very first time an
    // exercise is logged — every metric is trivially a "record" then.
    if (isFirstEverRecord && event.kind !== 'peso') continue

    await db.prEvents.add({
      id: crypto.randomUUID(),
      exerciseId: exercise.id,
      exerciseName: exercise.name,
      kind: event.kind,
      valueKg: event.valueKg,
      previousValueKg: event.previousValueKg,
      date: now,
    })

    if (event.previousValueKg !== null || event.kind === 'peso') {
      useUIStore.getState().pushPrCelebration({
        exerciseName: exercise.name,
        kind: event.kind,
        valueKg: event.valueKg,
        previousKg: event.previousValueKg,
      })
    }
  }

  await recomputeAchievements()
}

export async function recomputeAchievements(): Promise<void> {
  const [sessions, sets, exercises, achievements, progressRows, prEventCount] = await Promise.all([
    db.sessions.toArray(),
    db.sets.toArray(),
    db.exercises.toArray(),
    db.achievements.toArray(),
    db.achievementProgress.toArray(),
    db.prEvents.count(),
  ])

  const exerciseById = new Map(exercises.map((e) => [e.id, e]))
  const workingSets = sets.filter((s) => !s.isWarmup)

  const totalVolumeKg = workingSets.reduce((sum, s) => sum + s.weightKg * s.reps, 0)
  const distinctExercises = new Set(workingSets.map((s) => s.exerciseId)).size
  const distinctMuscleGroups = new Set(
    workingSets.map((s) => exerciseById.get(s.exerciseId)?.muscleGroup).filter(Boolean),
  ).size
  const { longest: longestStreak } = computeStreaks(sessions.map((s) => s.date))

  const metricByAchievement: Record<string, number> = {
    'ach-racha-3': longestStreak,
    'ach-racha-7': longestStreak,
    'ach-racha-30': longestStreak,
    'ach-sesiones-10': sessions.length,
    'ach-sesiones-50': sessions.length,
    'ach-sesiones-100': sessions.length,
    'ach-pr-1': prEventCount,
    'ach-pr-10': prEventCount,
    'ach-pr-25': prEventCount,
    'ach-volumen-10000': totalVolumeKg,
    'ach-volumen-100000': totalVolumeKg,
    'ach-volumen-1000000': totalVolumeKg,
    'ach-ejercicios-10': distinctExercises,
    'ach-ejercicios-25': distinctExercises,
    'ach-musculos-8': distinctMuscleGroups,
  }

  const progressByAchievement = new Map(progressRows.map((p) => [p.achievementId, p]))
  const now = new Date().toISOString()

  for (const achievement of achievements) {
    const value = metricByAchievement[achievement.id] ?? 0
    const existingProgress = progressByAchievement.get(achievement.id)
    const wasUnlocked = !!existingProgress?.unlockedAt
    const justUnlocked = !wasUnlocked && value >= achievement.targetValue

    await db.achievementProgress.put({
      achievementId: achievement.id,
      currentValue: value,
      unlockedAt: justUnlocked ? now : (existingProgress?.unlockedAt ?? null),
    })

    if (justUnlocked) {
      useUIStore.getState().pushAchievementUnlock({
        name: achievement.name,
        description: achievement.description,
        icon: achievement.icon,
      })
    }
  }
}
