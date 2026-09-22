import { useLiveQuery } from 'dexie-react-hooks'
import { subDays } from 'date-fns'
import { useMemo } from 'react'
import { db } from '@/db/db'
import { computeBalanceRatios, volumeByMuscleGroup } from '@/lib/calculations'
import { Card } from '@/components/ui/Card'

export function BalanceInsights() {
  const sets = useLiveQuery(() => db.sets.toArray(), [])
  const exercises = useLiveQuery(() => db.exercises.toArray(), [])

  const ratios = useMemo(() => {
    const since = subDays(new Date(), 28)
    const volumes = volumeByMuscleGroup(sets ?? [], exercises ?? [], since)
    return computeBalanceRatios(volumes)
  }, [sets, exercises])

  if (ratios.length === 0) return null

  return (
    <Card>
      <h3 className="mb-3 text-sm font-semibold">Equilibrio muscular (28 días)</h3>
      <div className="flex flex-col gap-3">
        {ratios.map((r) => (
          <div key={r.label}>
            <div className="mb-1 flex items-center justify-between text-xs">
              <span className="font-medium text-(--color-ink-secondary)">{r.label}</span>
              <span
                className={`rounded-full px-2 py-0.5 font-semibold ${
                  r.status === 'equilibrado'
                    ? 'bg-(--color-good)/15 text-(--color-good)'
                    : 'bg-(--color-warning)/15 text-(--color-warning)'
                }`}
              >
                {r.status === 'equilibrado' ? 'Equilibrado' : 'Desbalanceado'}
              </span>
            </div>
            <div className="flex h-2 overflow-hidden rounded-full bg-(--color-surface-2)">
              <div
                className="bg-(--color-cat-1)"
                style={{ width: `${(r.aKg / (r.aKg + r.bKg || 1)) * 100}%` }}
              />
              <div
                className="bg-(--color-cat-2)"
                style={{ width: `${(r.bKg / (r.aKg + r.bKg || 1)) * 100}%` }}
              />
            </div>
            <p className="mt-1.5 text-xs text-(--color-ink-muted)">{r.message}</p>
          </div>
        ))}
      </div>
    </Card>
  )
}
