import { useLiveQuery } from 'dexie-react-hooks'
import { useState } from 'react'
import { archiveExercise, createExercise, updateExercise } from '@/db/actions'
import { db } from '@/db/db'
import type { MovementPattern, MuscleGroup } from '@/db/types'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Sheet } from '@/components/ui/Sheet'
import { allMuscleGroups, muscleGroupLabels, patternLabels } from '@/lib/labels'
import { useUIStore } from '@/store/useUIStore'

const patterns: MovementPattern[] = ['empuje', 'tiron', 'pierna', 'core']

export function ExerciseCatalogManager() {
  const pushToast = useUIStore((s) => s.pushToast)
  const exercises = useLiveQuery(() => db.exercises.toArray(), [])
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [muscleGroup, setMuscleGroup] = useState<MuscleGroup>('pecho')
  const [pattern, setPattern] = useState<MovementPattern>('empuje')

  const active = (exercises ?? []).filter((e) => !e.archivedAt)
  const archived = (exercises ?? []).filter((e) => e.archivedAt)

  async function handleCreate() {
    if (!name.trim()) return
    await createExercise({ name, muscleGroup, secondaryMuscles: [], pattern })
    setName('')
    pushToast('Ejercicio añadido', 'success')
    setOpen(false)
  }

  return (
    <Card>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold">Catálogo de ejercicios</h3>
        <Button size="sm" variant="secondary" onClick={() => setOpen(true)}>
          + Nuevo
        </Button>
      </div>
      <div className="flex flex-col gap-1 text-sm">
        {active.map((e) => (
          <div key={e.id} className="flex items-center justify-between py-1">
            <div className="min-w-0">
              <p className="truncate">{e.name}</p>
              <p className="text-[11px] text-(--color-ink-muted)">
                {muscleGroupLabels[e.muscleGroup]} · {patternLabels[e.pattern]}
              </p>
            </div>
            <button
              onClick={() => archiveExercise(e.id)}
              className="shrink-0 rounded-lg px-2 py-1 text-xs text-(--color-ink-muted) active:bg-(--color-surface-2)"
            >
              Archivar
            </button>
          </div>
        ))}
      </div>

      {archived.length > 0 && (
        <details className="mt-3">
          <summary className="cursor-pointer text-xs text-(--color-ink-muted)">
            Archivados ({archived.length})
          </summary>
          <div className="mt-2 flex flex-col gap-1 text-sm opacity-60">
            {archived.map((e) => (
              <div key={e.id} className="flex items-center justify-between py-1">
                <p className="truncate">{e.name}</p>
                <button
                  onClick={() => updateExercise(e.id, { archivedAt: null })}
                  className="shrink-0 rounded-lg px-2 py-1 text-xs text-(--color-accent)"
                >
                  Restaurar
                </button>
              </div>
            ))}
          </div>
        </details>
      )}

      <Sheet open={open} onClose={() => setOpen(false)} title="Nuevo ejercicio">
        <div className="flex flex-col gap-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nombre del ejercicio"
            className="rounded-xl border border-(--color-border-strong) bg-(--color-surface-2) px-3 py-2.5 text-sm"
          />
          <div>
            <label className="mb-1 block text-xs text-(--color-ink-muted)">Grupo muscular</label>
            <select
              value={muscleGroup}
              onChange={(e) => setMuscleGroup(e.target.value as MuscleGroup)}
              className="w-full rounded-xl border border-(--color-border-strong) bg-(--color-surface-2) px-3 py-2.5 text-sm"
            >
              {allMuscleGroups.map((g) => (
                <option key={g} value={g}>
                  {muscleGroupLabels[g]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs text-(--color-ink-muted)">Patrón de movimiento</label>
            <select
              value={pattern}
              onChange={(e) => setPattern(e.target.value as MovementPattern)}
              className="w-full rounded-xl border border-(--color-border-strong) bg-(--color-surface-2) px-3 py-2.5 text-sm"
            >
              {patterns.map((p) => (
                <option key={p} value={p}>
                  {patternLabels[p]}
                </option>
              ))}
            </select>
          </div>
          <Button onClick={handleCreate} className="w-full">
            Crear ejercicio
          </Button>
        </div>
      </Sheet>
    </Card>
  )
}
