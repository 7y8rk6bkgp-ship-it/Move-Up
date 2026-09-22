import { useLiveQuery } from 'dexie-react-hooks'
import { useEffect, useState } from 'react'
import { db } from '@/db/db'
import { endSession, updateSessionNotes } from '@/db/actions'
import type { Exercise, WorkoutSession } from '@/db/types'
import { Button } from '@/components/ui/Button'
import { PlusIcon } from '@/components/icons'
import { useActiveSessionStore } from '@/store/useActiveSessionStore'
import { useUIStore } from '@/store/useUIStore'
import { ExerciseBlock } from './ExerciseBlock'
import { ExercisePickerSheet } from './ExercisePickerSheet'
import { SessionTimer } from './SessionTimer'

export function ActiveWorkoutView({ session }: { session: WorkoutSession }) {
  const setActiveSessionId = useActiveSessionStore((s) => s.setActiveSessionId)
  const pushToast = useUIStore((s) => s.pushToast)
  const [exerciseIds, setExerciseIds] = useState<string[]>([])
  const [pickerOpen, setPickerOpen] = useState(false)
  const [notes, setNotes] = useState(session.notes ?? '')
  const [notesOpen, setNotesOpen] = useState(!!session.notes)

  const sessionSets = useLiveQuery(
    () => db.sets.where('sessionId').equals(session.id).toArray(),
    [session.id],
  )
  const exercisesById = useLiveQuery(async () => {
    const all = await db.exercises.toArray()
    return new Map(all.map((e) => [e.id, e])) as Map<string, Exercise>
  }, [])

  useEffect(() => {
    let cancelled = false
    async function init() {
      const sets = await db.sets.where('sessionId').equals(session.id).toArray()
      if (sets.length > 0) {
        const orderMap = new Map<string, number>()
        for (const set of sets) {
          const current = orderMap.get(set.exerciseId)
          if (current === undefined || set.exerciseOrder < current) {
            orderMap.set(set.exerciseId, set.exerciseOrder)
          }
        }
        const ordered = Array.from(orderMap.entries())
          .sort((a, b) => a[1] - b[1])
          .map(([id]) => id)
        if (!cancelled) setExerciseIds(ordered)
        return
      }
      if (session.templateId) {
        const template = await db.templates.get(session.templateId)
        if (template && !cancelled) setExerciseIds(template.exerciseIds)
        return
      }
      if (!cancelled) setExerciseIds([])
    }
    init()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session.id])

  function handleAddExercise(exercise: Exercise) {
    setExerciseIds((prev) => (prev.includes(exercise.id) ? prev : [...prev, exercise.id]))
    setPickerOpen(false)
  }

  function handleRemoveExercise(exerciseId: string) {
    const hasSets = (sessionSets ?? []).some((s) => s.exerciseId === exerciseId)
    if (hasSets) {
      pushToast('No se puede quitar: ya tiene series registradas', 'error')
      return
    }
    setExerciseIds((prev) => prev.filter((id) => id !== exerciseId))
  }

  async function handleFinish() {
    await updateSessionNotes(session.id, notes)
    await endSession(session.id)
    setActiveSessionId(null)
    pushToast('Sesión guardada 💪', 'success')
  }

  const totalSets = (sessionSets ?? []).length

  return (
    <div className="flex flex-col gap-4 pb-4">
      <header className="flex items-start justify-between pt-1">
        <div>
          <p className="text-sm text-(--color-ink-muted)">
            {session.templateName ?? 'Entrenamiento libre'}
          </p>
          <h1 className="text-2xl font-bold">
            <SessionTimer startedAt={session.date} />
          </h1>
        </div>
        <Button size="sm" variant="secondary" onClick={handleFinish}>
          Finalizar
        </Button>
      </header>

      {totalSets === 0 && exerciseIds.length === 0 && (
        <p className="rounded-2xl border border-dashed border-(--color-border-strong) p-6 text-center text-sm text-(--color-ink-muted)">
          Añade tu primer ejercicio para empezar a registrar series.
        </p>
      )}

      <div className="flex flex-col gap-3">
        {exerciseIds.map((exerciseId, index) => {
          const exercise = exercisesById?.get(exerciseId)
          if (!exercise) return null
          return (
            <ExerciseBlock
              key={exerciseId}
              sessionId={session.id}
              exercise={exercise}
              exerciseOrder={index}
              onRemove={() => handleRemoveExercise(exerciseId)}
            />
          )
        })}
      </div>

      <button
        onClick={() => setPickerOpen(true)}
        className="flex items-center justify-center gap-2 rounded-2xl border border-dashed border-(--color-border-strong) py-3.5 text-sm font-semibold text-(--color-accent) active:bg-(--color-surface-2)"
      >
        <PlusIcon width={18} height={18} />
        Añadir ejercicio
      </button>

      <div>
        {notesOpen ? (
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            onBlur={() => updateSessionNotes(session.id, notes)}
            placeholder="Notas de la sesión..."
            rows={3}
            className="w-full rounded-xl border border-(--color-border-strong) bg-(--color-surface-2) p-3 text-sm"
          />
        ) : (
          <button
            onClick={() => setNotesOpen(true)}
            className="text-sm text-(--color-ink-muted) underline underline-offset-2"
          >
            + Añadir nota
          </button>
        )}
      </div>

      <ExercisePickerSheet
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={handleAddExercise}
        excludeIds={exerciseIds}
      />
    </div>
  )
}
