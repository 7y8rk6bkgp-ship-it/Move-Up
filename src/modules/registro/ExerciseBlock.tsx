import { useLiveQuery } from 'dexie-react-hooks'
import { useEffect, useState } from 'react'
import { addSet, deleteSet, getLastSetsForExercise } from '@/db/actions'
import { db } from '@/db/db'
import type { Exercise } from '@/db/types'
import { TrashIcon } from '@/components/icons'
import { formatWeight, toDisplayWeight, toStorageKg } from '@/lib/calculations'
import { useSettingsStore } from '@/store/useSettingsStore'
import { RpePicker } from './RpePicker'
import { WeightRepsStepper } from './WeightRepsStepper'

interface Props {
  sessionId: string
  exercise: Exercise
  exerciseOrder: number
  onRemove: () => void
}

export function ExerciseBlock({ sessionId, exercise, exerciseOrder, onRemove }: Props) {
  const unit = useSettingsStore((s) => s.unit)
  const sets = useLiveQuery(
    () =>
      db.sets
        .where('sessionId')
        .equals(sessionId)
        .filter((s) => s.exerciseId === exercise.id)
        .toArray(),
    [sessionId, exercise.id],
  )
  const pr = useLiveQuery(() => db.personalRecords.get(exercise.id), [exercise.id])

  const [weightDisplay, setWeightDisplay] = useState(20)
  const [reps, setReps] = useState(10)
  const [rpe, setRpe] = useState<number | null>(null)
  const [isWarmup, setIsWarmup] = useState(false)
  const [touched, setTouched] = useState(false)
  const [loadingCopy, setLoadingCopy] = useState(false)

  const orderedSets = (sets ?? []).slice().sort((a, b) => a.setIndex - b.setIndex)

  useEffect(() => {
    if (touched) return
    if (orderedSets.length > 0) {
      const last = orderedSets[orderedSets.length - 1]
      setWeightDisplay(toDisplayWeight(last.weightKg, unit))
      setReps(last.reps)
      return
    }
    let cancelled = false
    getLastSetsForExercise(exercise.id, sessionId).then((previous) => {
      if (cancelled || previous.length === 0) return
      const first = previous[0]
      setWeightDisplay(toDisplayWeight(first.weightKg, unit))
      setReps(first.reps)
    })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exercise.id, sessionId, orderedSets.length])

  async function handleAddSet() {
    await addSet({
      sessionId,
      exerciseId: exercise.id,
      exerciseOrder,
      setIndex: orderedSets.length,
      weightKg: toStorageKg(weightDisplay, unit),
      reps,
      rpe,
      isWarmup,
    })
    setTouched(false)
    setRpe(null)
    setIsWarmup(false)
  }

  async function handleCopyLastSession() {
    setLoadingCopy(true)
    try {
      const previous = await getLastSetsForExercise(exercise.id, sessionId)
      for (let i = 0; i < previous.length; i++) {
        const s = previous[i]
        await addSet({
          sessionId,
          exerciseId: exercise.id,
          exerciseOrder,
          setIndex: i,
          weightKg: s.weightKg,
          reps: s.reps,
          rpe: s.rpe,
          isWarmup: s.isWarmup,
        })
      }
    } finally {
      setLoadingCopy(false)
    }
  }

  return (
    <div className="rounded-2xl border border-(--color-border) bg-(--color-surface) p-3">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="font-semibold">{exercise.name}</h3>
        {orderedSets.length === 0 && (
          <button
            onClick={onRemove}
            className="rounded-full p-1 text-(--color-ink-muted) active:bg-(--color-surface-2)"
            aria-label="Quitar ejercicio"
          >
            <TrashIcon width={16} height={16} />
          </button>
        )}
      </div>

      {pr && (
        <p className="mb-2 text-xs text-(--color-ink-muted)">
          Mejor: {formatWeight(pr.bestWeightKg, unit)} x {pr.bestWeightReps} · 1RM est.{' '}
          {formatWeight(pr.bestEstimated1RmKg, unit)}
        </p>
      )}

      {orderedSets.length > 0 && (
        <ul className="mb-3 flex flex-col gap-1">
          {orderedSets.map((set, i) => (
            <li
              key={set.id}
              className="flex items-center justify-between rounded-lg bg-(--color-surface-2) px-3 py-2 text-sm"
            >
              <span className="w-6 text-(--color-ink-muted)">{i + 1}</span>
              <span className="flex-1 font-medium">
                {formatWeight(set.weightKg, unit)} × {set.reps}
                {set.isWarmup && (
                  <span className="ml-2 rounded bg-(--color-warning)/20 px-1.5 py-0.5 text-[10px] font-semibold text-(--color-warning)">
                    calentamiento
                  </span>
                )}
                {set.rpe != null && (
                  <span className="ml-2 text-xs text-(--color-ink-muted)">RPE {set.rpe}</span>
                )}
              </span>
              <button
                onClick={() => deleteSet(set.id)}
                className="p-1 text-(--color-ink-muted) active:text-(--color-critical)"
                aria-label="Eliminar serie"
              >
                <TrashIcon width={14} height={14} />
              </button>
            </li>
          ))}
        </ul>
      )}

      {orderedSets.length === 0 && (
        <button
          disabled={loadingCopy}
          onClick={handleCopyLastSession}
          className="mb-3 w-full rounded-xl border border-dashed border-(--color-border-strong) py-2 text-xs font-semibold text-(--color-accent) active:bg-(--color-surface-2)"
        >
          {loadingCopy ? 'Copiando...' : 'Copiar sets de la última vez'}
        </button>
      )}

      <WeightRepsStepper
        weight={weightDisplay}
        reps={reps}
        unit={unit}
        onChangeWeight={(v) => {
          setTouched(true)
          setWeightDisplay(v)
        }}
        onChangeReps={(v) => {
          setTouched(true)
          setReps(v)
        }}
      />

      <div className="mt-2 flex items-center justify-between gap-2">
        <RpePicker value={rpe} onChange={setRpe} />
        <label className="flex shrink-0 items-center gap-1.5 text-xs text-(--color-ink-muted)">
          <input
            type="checkbox"
            checked={isWarmup}
            onChange={(e) => setIsWarmup(e.target.checked)}
            className="h-3.5 w-3.5"
          />
          Calentamiento
        </label>
      </div>

      <button
        onClick={handleAddSet}
        className="mt-3 w-full rounded-xl bg-(--color-accent) py-2.5 text-sm font-semibold text-white active:bg-(--color-accent-dim)"
      >
        Añadir serie
      </button>
    </div>
  )
}
