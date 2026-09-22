import { useLiveQuery } from 'dexie-react-hooks'
import { subDays } from 'date-fns'
import { useMemo } from 'react'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { db } from '@/db/db'
import { toDisplayWeight, volumeByMuscleGroup } from '@/lib/calculations'
import { muscleGroupLabels } from '@/lib/labels'
import { useSettingsStore } from '@/store/useSettingsStore'
import { Card } from '@/components/ui/Card'
import { ChartTooltip } from './ChartTooltip'

export function MuscleGroupVolumeChart() {
  const unit = useSettingsStore((s) => s.unit)
  const sets = useLiveQuery(() => db.sets.toArray(), [])
  const exercises = useLiveQuery(() => db.exercises.toArray(), [])

  const data = useMemo(() => {
    const since = subDays(new Date(), 28)
    const volumes = volumeByMuscleGroup(sets ?? [], exercises ?? [], since)
    return Object.entries(volumes)
      .map(([muscleGroup, kg]) => ({
        name: muscleGroupLabels[muscleGroup as keyof typeof muscleGroupLabels] ?? muscleGroup,
        Volumen: Number(toDisplayWeight(kg, unit).toFixed(0)),
      }))
      .sort((a, b) => b.Volumen - a.Volumen)
  }, [sets, exercises, unit])

  return (
    <Card>
      <h3 className="mb-3 text-sm font-semibold">Volumen por grupo muscular (28 días)</h3>
      {data.length > 0 ? (
        <ResponsiveContainer width="100%" height={Math.max(180, data.length * 32)}>
          <BarChart data={data} layout="vertical" margin={{ left: 0, right: 16, top: 4 }}>
            <CartesianGrid stroke="var(--color-border)" horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 10, fill: 'var(--color-ink-muted)' }} />
            <YAxis
              type="category"
              dataKey="name"
              width={92}
              tick={{ fontSize: 11, fill: 'var(--color-ink-secondary)' }}
            />
            <Tooltip content={ChartTooltip} cursor={{ fill: 'var(--color-surface-2)' }} />
            <Bar dataKey="Volumen" fill="var(--color-cat-3)" radius={[0, 4, 4, 0]} maxBarSize={16} />
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <p className="py-8 text-center text-sm text-(--color-ink-muted)">Sin datos aún</p>
      )}
    </Card>
  )
}
