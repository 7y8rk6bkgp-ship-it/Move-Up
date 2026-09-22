import { useLiveQuery } from 'dexie-react-hooks'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { useMemo, useState } from 'react'
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { db } from '@/db/db'
import { classifyExerciseTrend, exerciseHistory, toDisplayWeight } from '@/lib/calculations'
import { useSettingsStore } from '@/store/useSettingsStore'
import { Card } from '@/components/ui/Card'
import { ChartTooltip } from './ChartTooltip'

const trendStyles: Record<string, { label: string; className: string }> = {
  progresando: { label: '↑ Progresando', className: 'text-(--color-good) bg-(--color-good)/15' },
  estable: { label: '→ Estable', className: 'text-(--color-warning) bg-(--color-warning)/15' },
  en_descenso: {
    label: '↓ En descenso',
    className: 'text-(--color-critical) bg-(--color-critical)/15',
  },
  sin_datos: { label: 'Sin datos suficientes', className: 'text-(--color-ink-muted) bg-(--color-surface-2)' },
}

export function ExerciseProgressChart() {
  const unit = useSettingsStore((s) => s.unit)
  const exercises = useLiveQuery(() => db.exercises.toArray(), [])
  const [exerciseId, setExerciseId] = useState<string>('')

  const activeId = exerciseId || exercises?.[0]?.id || ''

  const history = useLiveQuery(async () => {
    if (!activeId) return []
    const [sessions, sets] = await Promise.all([db.sessions.toArray(), db.sets.toArray()])
    return exerciseHistory(sessions, sets, activeId)
  }, [activeId])

  const trend = useMemo(() => classifyExerciseTrend(history ?? []), [history])

  const chartData = useMemo(
    () =>
      (history ?? []).map((p) => ({
        date: format(new Date(p.date), 'd MMM', { locale: es }),
        '1RM est.': Number(toDisplayWeight(p.estimated1RmKg, unit).toFixed(1)),
        'Mejor serie': Number(toDisplayWeight(p.bestWeightKg, unit).toFixed(1)),
      })),
    [history, unit],
  )

  return (
    <Card>
      <div className="mb-3 flex items-center justify-between gap-2">
        <select
          value={activeId}
          onChange={(e) => setExerciseId(e.target.value)}
          className="min-w-0 flex-1 rounded-lg border border-(--color-border-strong) bg-(--color-surface-2) px-2 py-1.5 text-sm"
        >
          {(exercises ?? []).map((e) => (
            <option key={e.id} value={e.id}>
              {e.name}
            </option>
          ))}
        </select>
      </div>

      {chartData.length >= 2 ? (
        <>
          <div className={`mb-2 inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${trendStyles[trend.label].className}`}>
            {trendStyles[trend.label].label}
            {trend.label !== 'sin_datos' && ` (${trend.changePct >= 0 ? '+' : ''}${trend.changePct.toFixed(1)}%)`}
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={chartData} margin={{ left: -20, right: 8, top: 8 }}>
              <CartesianGrid stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--color-ink-muted)' }} />
              <YAxis tick={{ fontSize: 10, fill: 'var(--color-ink-muted)' }} width={36} />
              <Tooltip content={ChartTooltip} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line
                type="monotone"
                dataKey="1RM est."
                stroke="var(--color-cat-1)"
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
              <Line
                type="monotone"
                dataKey="Mejor serie"
                stroke="var(--color-cat-2)"
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </>
      ) : (
        <p className="py-10 text-center text-sm text-(--color-ink-muted)">
          Registra al menos 2 sesiones de este ejercicio para ver su progreso.
        </p>
      )}
    </Card>
  )
}
