import { useLiveQuery } from 'dexie-react-hooks'
import { useMemo, useState } from 'react'
import { db } from '@/db/db'
import type { Exercise } from '@/db/types'
import { Sheet } from '@/components/ui/Sheet'
import { muscleGroupLabels } from '@/lib/labels'

interface Props {
  open: boolean
  onClose: () => void
  onSelect: (exercise: Exercise) => void
  excludeIds?: string[]
}

export function ExercisePickerSheet({ open, onClose, onSelect, excludeIds = [] }: Props) {
  const [query, setQuery] = useState('')
  const exercises = useLiveQuery(
    () => db.exercises.filter((e) => !e.archivedAt).toArray(),
    [],
  )

  const grouped = useMemo(() => {
    const filtered = (exercises ?? []).filter(
      (e) =>
        !excludeIds.includes(e.id) &&
        e.name.toLowerCase().includes(query.trim().toLowerCase()),
    )
    const map = new Map<string, Exercise[]>()
    for (const e of filtered) {
      const arr = map.get(e.muscleGroup) ?? []
      arr.push(e)
      map.set(e.muscleGroup, arr)
    }
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exercises, query, excludeIds.join(',')])

  return (
    <Sheet open={open} onClose={onClose} title="Añadir ejercicio">
      <input
        autoFocus
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Buscar ejercicio..."
        className="mb-4 w-full rounded-xl border border-(--color-border-strong) bg-(--color-surface-2) px-3 py-2.5 text-sm"
      />
      <div className="flex flex-col gap-5">
        {grouped.map(([muscleGroup, list]) => (
          <div key={muscleGroup}>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-(--color-ink-muted)">
              {muscleGroupLabels[muscleGroup as keyof typeof muscleGroupLabels] ?? muscleGroup}
            </h3>
            <div className="flex flex-col gap-1">
              {list.map((exercise) => (
                <button
                  key={exercise.id}
                  onClick={() => onSelect(exercise)}
                  className="rounded-xl px-3 py-2.5 text-left text-sm font-medium active:bg-(--color-surface-2)"
                >
                  {exercise.name}
                </button>
              ))}
            </div>
          </div>
        ))}
        {grouped.length === 0 && (
          <p className="py-8 text-center text-sm text-(--color-ink-muted)">Sin resultados</p>
        )}
      </div>
    </Sheet>
  )
}
