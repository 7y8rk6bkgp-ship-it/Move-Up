import { useLiveQuery } from 'dexie-react-hooks'
import { useMemo } from 'react'
import { db } from '@/db/db'
import { computeMuscleRecovery } from '@/lib/calculations'
import { allMuscleGroups, muscleGroupLabels } from '@/lib/labels'
import { Card } from '@/components/ui/Card'

export function MuscleRecoveryList() {
  const sessions = useLiveQuery(() => db.sessions.toArray(), [])
  const sets = useLiveQuery(() => db.sets.toArray(), [])
  const exercises = useLiveQuery(() => db.exercises.toArray(), [])

  const recovery = useMemo(
    () =>
      computeMuscleRecovery(sessions ?? [], sets ?? [], exercises ?? [], allMuscleGroups).sort(
        (a, b) => (b.daysSinceTrained ?? 999) - (a.daysSinceTrained ?? 999),
      ),
    [sessions, sets, exercises],
  )

  const hasData = recovery.some((r) => r.daysSinceTrained !== null)
  if (!hasData) return null

  return (
    <Card>
      <h3 className="mb-3 text-sm font-semibold">Días sin entrenar cada músculo</h3>
      <div className="flex flex-col gap-1.5">
        {recovery.map((r) => {
          const stale = r.daysSinceTrained !== null && r.daysSinceTrained >= 7
          return (
            <div key={r.muscleGroup} className="flex items-center justify-between text-sm">
              <span className="text-(--color-ink-secondary)">
                {muscleGroupLabels[r.muscleGroup]}
              </span>
              <span
                className={`font-semibold ${stale ? 'text-(--color-warning)' : 'text-(--color-ink)'}`}
              >
                {r.daysSinceTrained === null ? 'Nunca' : `${r.daysSinceTrained}d`}
              </span>
            </div>
          )
        })}
      </div>
    </Card>
  )
}
