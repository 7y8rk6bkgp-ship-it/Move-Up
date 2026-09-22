import { db } from './db'
import { evaluateSetForRecords, recomputeAchievements } from './prEngine'
import type {
  BodyWeightLog,
  Exercise,
  MovementPattern,
  MuscleGroup,
  RoutineTemplate,
  SetEntry,
  WorkoutSession,
} from './types'

// ---- Exercises ----

export async function createExercise(input: {
  name: string
  muscleGroup: MuscleGroup
  secondaryMuscles: MuscleGroup[]
  pattern: MovementPattern
}): Promise<Exercise> {
  const exercise: Exercise = {
    id: crypto.randomUUID(),
    name: input.name.trim(),
    muscleGroup: input.muscleGroup,
    secondaryMuscles: input.secondaryMuscles,
    pattern: input.pattern,
    isCustom: true,
  }
  await db.exercises.add(exercise)
  return exercise
}

export async function updateExercise(id: string, patch: Partial<Exercise>): Promise<void> {
  await db.exercises.update(id, patch)
}

export async function archiveExercise(id: string): Promise<void> {
  await db.exercises.update(id, { archivedAt: new Date().toISOString() })
}

// ---- Templates ----

export async function createTemplate(name: string, exerciseIds: string[]): Promise<RoutineTemplate> {
  const template: RoutineTemplate = {
    id: crypto.randomUUID(),
    name: name.trim(),
    exerciseIds,
    isCustom: true,
  }
  await db.templates.add(template)
  return template
}

export async function updateTemplate(id: string, patch: Partial<RoutineTemplate>): Promise<void> {
  await db.templates.update(id, patch)
}

export async function deleteTemplate(id: string): Promise<void> {
  await db.templates.delete(id)
}

// ---- Sessions ----

export async function startSession(template?: RoutineTemplate | null): Promise<WorkoutSession> {
  const session: WorkoutSession = {
    id: crypto.randomUUID(),
    date: new Date().toISOString(),
    endedAt: null,
    notes: '',
    templateId: template?.id ?? null,
    templateName: template?.name ?? null,
    bodyWeightKg: null,
  }
  await db.sessions.add(session)
  return session
}

export async function updateSessionNotes(sessionId: string, notes: string): Promise<void> {
  await db.sessions.update(sessionId, { notes })
}

export async function setSessionBodyWeight(sessionId: string, weightKg: number | null): Promise<void> {
  await db.sessions.update(sessionId, { bodyWeightKg: weightKg })
}

export async function endSession(sessionId: string): Promise<void> {
  await db.sessions.update(sessionId, { endedAt: new Date().toISOString() })
  await recomputeAchievements()
}

export async function deleteSession(sessionId: string): Promise<void> {
  await db.transaction('rw', db.sessions, db.sets, async () => {
    await db.sets.where('sessionId').equals(sessionId).delete()
    await db.sessions.delete(sessionId)
  })
  await recomputeAchievements()
}

// ---- Sets ----

export interface AddSetInput {
  sessionId: string
  exerciseId: string
  exerciseOrder: number
  setIndex: number
  weightKg: number
  reps: number
  rpe?: number | null
  isWarmup?: boolean
}

export async function addSet(input: AddSetInput): Promise<SetEntry> {
  const set: SetEntry = {
    id: crypto.randomUUID(),
    sessionId: input.sessionId,
    exerciseId: input.exerciseId,
    exerciseOrder: input.exerciseOrder,
    setIndex: input.setIndex,
    weightKg: input.weightKg,
    reps: input.reps,
    rpe: input.rpe ?? null,
    isWarmup: input.isWarmup ?? false,
    createdAt: new Date().toISOString(),
  }
  await db.sets.add(set)

  const exercise = await db.exercises.get(input.exerciseId)
  if (exercise) {
    await evaluateSetForRecords(set, exercise)
  }

  return set
}

export async function updateSet(setId: string, patch: Partial<SetEntry>): Promise<void> {
  await db.sets.update(setId, patch)
  const updated = await db.sets.get(setId)
  if (updated) {
    const exercise = await db.exercises.get(updated.exerciseId)
    if (exercise) await evaluateSetForRecords(updated, exercise)
  }
}

export async function deleteSet(setId: string): Promise<void> {
  await db.sets.delete(setId)
}

/** Returns the most recent completed session's sets for a given exercise, for "repeat last session". */
export async function getLastSetsForExercise(
  exerciseId: string,
  excludeSessionId?: string,
): Promise<SetEntry[]> {
  const allSets = await db.sets.where('exerciseId').equals(exerciseId).toArray()
  const bySession = new Map<string, SetEntry[]>()
  for (const set of allSets) {
    if (set.sessionId === excludeSessionId) continue
    const arr = bySession.get(set.sessionId) ?? []
    arr.push(set)
    bySession.set(set.sessionId, arr)
  }
  if (bySession.size === 0) return []

  const sessionIds = Array.from(bySession.keys())
  const sessions = await db.sessions.bulkGet(sessionIds)
  let latestSessionId: string | null = null
  let latestDate = ''
  sessions.forEach((session, i) => {
    if (session && session.date > latestDate) {
      latestDate = session.date
      latestSessionId = sessionIds[i]
    }
  })

  if (!latestSessionId) return []
  return (bySession.get(latestSessionId) ?? []).sort((a, b) => a.setIndex - b.setIndex)
}

// ---- Body weight ----

export async function logBodyWeight(weightKg: number, date?: string): Promise<BodyWeightLog> {
  const day = (date ?? new Date().toISOString()).slice(0, 10)
  const existing = await db.bodyWeightLogs.where('date').equals(day).first()
  if (existing) {
    await db.bodyWeightLogs.update(existing.id, { weightKg })
    return { ...existing, weightKg }
  }
  const log: BodyWeightLog = { id: crypto.randomUUID(), date: day, weightKg }
  await db.bodyWeightLogs.add(log)
  return log
}

export async function deleteBodyWeightLog(id: string): Promise<void> {
  await db.bodyWeightLogs.delete(id)
}
