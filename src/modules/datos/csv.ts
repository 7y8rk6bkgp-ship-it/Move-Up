import Papa from 'papaparse'
import { db } from '@/db/db'
import { recomputeAchievements } from '@/db/prEngine'
import type { MovementPattern, MuscleGroup, WorkoutSession } from '@/db/types'

interface TrainingRow {
  sessionId: string
  date: string
  templateName: string
  notes: string
  bodyWeightKg: string
  exerciseId: string
  exerciseName: string
  muscleGroup: string
  pattern: string
  exerciseOrder: string
  setId: string
  setIndex: string
  weightKg: string
  reps: string
  rpe: string
  isWarmup: string
}

function downloadBlob(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

export async function exportTrainingCsv(): Promise<void> {
  const [sessions, sets, exercises] = await Promise.all([
    db.sessions.toArray(),
    db.sets.toArray(),
    db.exercises.toArray(),
  ])
  const exerciseById = new Map(exercises.map((e) => [e.id, e]))
  const sessionById = new Map(sessions.map((s) => [s.id, s]))

  const rows: TrainingRow[] = sets
    .slice()
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
    .map((set) => {
      const session = sessionById.get(set.sessionId)
      const exercise = exerciseById.get(set.exerciseId)
      return {
        sessionId: set.sessionId,
        date: session?.date ?? '',
        templateName: session?.templateName ?? '',
        notes: session?.notes ?? '',
        bodyWeightKg: session?.bodyWeightKg != null ? String(session.bodyWeightKg) : '',
        exerciseId: set.exerciseId,
        exerciseName: exercise?.name ?? '',
        muscleGroup: exercise?.muscleGroup ?? '',
        pattern: exercise?.pattern ?? '',
        exerciseOrder: String(set.exerciseOrder),
        setId: set.id,
        setIndex: String(set.setIndex),
        weightKg: String(set.weightKg),
        reps: String(set.reps),
        rpe: set.rpe != null ? String(set.rpe) : '',
        isWarmup: set.isWarmup ? '1' : '0',
      }
    })

  const csv = Papa.unparse(rows)
  downloadBlob(csv, `move-up-entrenamientos-${new Date().toISOString().slice(0, 10)}.csv`, 'text/csv')
}

export async function exportBodyWeightCsv(): Promise<void> {
  const logs = await db.bodyWeightLogs.orderBy('date').toArray()
  const csv = Papa.unparse(logs.map((l) => ({ date: l.date, weightKg: l.weightKg })))
  downloadBlob(csv, `move-up-peso-corporal-${new Date().toISOString().slice(0, 10)}.csv`, 'text/csv')
}

export interface ImportSummary {
  sessionsImported: number
  setsImported: number
  exercisesCreated: number
}

export async function importTrainingCsv(file: File): Promise<ImportSummary> {
  const text = await file.text()
  const { data } = Papa.parse<TrainingRow>(text, { header: true, skipEmptyLines: true })

  const existingExercises = await db.exercises.toArray()
  const exerciseByName = new Map(existingExercises.map((e) => [e.name.toLowerCase(), e]))
  const existingExerciseIds = new Set(existingExercises.map((e) => e.id))

  const sessionsToPut = new Map<string, WorkoutSession>()
  let exercisesCreated = 0
  let setsImported = 0

  await db.transaction('rw', db.sessions, db.sets, db.exercises, async () => {
    for (const row of data) {
      if (!row.sessionId || !row.setId) continue

      if (!sessionsToPut.has(row.sessionId)) {
        sessionsToPut.set(row.sessionId, {
          id: row.sessionId,
          date: row.date || new Date().toISOString(),
          endedAt: row.date || new Date().toISOString(),
          notes: row.notes || '',
          templateId: null,
          templateName: row.templateName || null,
          bodyWeightKg: row.bodyWeightKg ? Number(row.bodyWeightKg) : null,
        })
      }

      let exerciseId = row.exerciseId
      if (!exerciseId || !existingExerciseIds.has(exerciseId)) {
        const byName = exerciseByName.get((row.exerciseName || '').toLowerCase())
        if (byName) {
          exerciseId = byName.id
        } else if (row.exerciseName) {
          const newExercise = {
            id: exerciseId || crypto.randomUUID(),
            name: row.exerciseName,
            muscleGroup: (row.muscleGroup || 'pecho') as MuscleGroup,
            secondaryMuscles: [],
            pattern: (row.pattern || 'empuje') as MovementPattern,
            isCustom: true,
          }
          await db.exercises.put(newExercise)
          exerciseByName.set(newExercise.name.toLowerCase(), newExercise)
          existingExerciseIds.add(newExercise.id)
          exerciseId = newExercise.id
          exercisesCreated++
        } else {
          continue
        }
      }

      await db.sets.put({
        id: row.setId,
        sessionId: row.sessionId,
        exerciseId,
        exerciseOrder: Number(row.exerciseOrder) || 0,
        setIndex: Number(row.setIndex) || 0,
        weightKg: Number(row.weightKg) || 0,
        reps: Number(row.reps) || 0,
        rpe: row.rpe ? Number(row.rpe) : null,
        isWarmup: row.isWarmup === '1',
        createdAt: row.date || new Date().toISOString(),
      })
      setsImported++
    }

    for (const session of sessionsToPut.values()) {
      await db.sessions.put(session)
    }
  })

  await recomputeAchievements()

  return { sessionsImported: sessionsToPut.size, setsImported, exercisesCreated }
}
