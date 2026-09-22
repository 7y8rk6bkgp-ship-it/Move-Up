import { useLiveQuery } from 'dexie-react-hooks'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { useMemo } from 'react'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { db } from '@/db/db'
import { weeklyFrequency } from '@/lib/calculations'
import { Card } from '@/components/ui/Card'
import { ChartTooltip } from './ChartTooltip'

export function FrequencyChart() {
  const sessions = useLiveQuery(() => db.sessions.toArray(), [])

  const data = useMemo(() => {
    const buckets = weeklyFrequency(sessions ?? []).slice(-12)
    return buckets.map((b) => ({
      week: format(new Date(b.weekStart), 'd MMM', { locale: es }),
      Sesiones: b.count,
    }))
  }, [sessions])

  const avg = data.length > 0 ? data.reduce((s, d) => s + d.Sesiones, 0) / data.length : 0

  return (
    <Card>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold">Frecuencia semanal</h3>
        <span className="text-xs text-(--color-ink-muted)">Media: {avg.toFixed(1)}/sem</span>
      </div>
      {data.length > 0 ? (
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={data} margin={{ left: -20, right: 8, top: 8 }}>
            <CartesianGrid stroke="var(--color-border)" vertical={false} />
            <XAxis dataKey="week" tick={{ fontSize: 9, fill: 'var(--color-ink-muted)' }} />
            <YAxis
              allowDecimals={false}
              tick={{ fontSize: 10, fill: 'var(--color-ink-muted)' }}
              width={24}
            />
            <Tooltip content={ChartTooltip} cursor={{ fill: 'var(--color-surface-2)' }} />
            <Bar dataKey="Sesiones" fill="var(--color-cat-4)" radius={[4, 4, 0, 0]} maxBarSize={24} />
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <p className="py-8 text-center text-sm text-(--color-ink-muted)">Sin datos aún</p>
      )}
    </Card>
  )
}
