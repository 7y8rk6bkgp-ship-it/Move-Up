import { useLiveQuery } from 'dexie-react-hooks'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { useMemo } from 'react'
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { db } from '@/db/db'
import { toDisplayWeight } from '@/lib/calculations'
import { useSettingsStore } from '@/store/useSettingsStore'
import { Card } from '@/components/ui/Card'
import { ChartTooltip } from './ChartTooltip'

export function BodyWeightChart() {
  const unit = useSettingsStore((s) => s.unit)
  const logs = useLiveQuery(() => db.bodyWeightLogs.orderBy('date').toArray(), [])

  const data = useMemo(
    () =>
      (logs ?? []).map((l) => ({
        date: format(new Date(l.date), 'd MMM', { locale: es }),
        Peso: Number(toDisplayWeight(l.weightKg, unit).toFixed(1)),
      })),
    [logs, unit],
  )

  return (
    <Card>
      <h3 className="mb-3 text-sm font-semibold">Peso corporal ({unit})</h3>
      {data.length >= 2 ? (
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={data} margin={{ left: -20, right: 8, top: 8 }}>
            <CartesianGrid stroke="var(--color-border)" vertical={false} />
            <XAxis dataKey="date" tick={{ fontSize: 9, fill: 'var(--color-ink-muted)' }} />
            <YAxis
              domain={['dataMin - 1', 'dataMax + 1']}
              tick={{ fontSize: 10, fill: 'var(--color-ink-muted)' }}
              width={32}
            />
            <Tooltip content={ChartTooltip} />
            <Line
              type="monotone"
              dataKey="Peso"
              stroke="var(--color-cat-5)"
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <p className="py-8 text-center text-sm text-(--color-ink-muted)">
          Registra tu peso al menos 2 veces para ver la tendencia.
        </p>
      )}
    </Card>
  )
}
