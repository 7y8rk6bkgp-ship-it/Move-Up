import { useLiveQuery } from 'dexie-react-hooks'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { useMemo } from 'react'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { db } from '@/db/db'
import { toDisplayWeight, weeklyVolume } from '@/lib/calculations'
import { useSettingsStore } from '@/store/useSettingsStore'
import { Card } from '@/components/ui/Card'
import { ChartTooltip } from './ChartTooltip'

export function WeeklyVolumeChart() {
  const unit = useSettingsStore((s) => s.unit)
  const sessions = useLiveQuery(() => db.sessions.toArray(), [])
  const sets = useLiveQuery(() => db.sets.toArray(), [])

  const data = useMemo(() => {
    const buckets = weeklyVolume(sessions ?? [], sets ?? []).slice(-12)
    return buckets.map((b) => ({
      week: format(new Date(b.weekStart), 'd MMM', { locale: es }),
      Volumen: Number(toDisplayWeight(b.volumeKg, unit).toFixed(0)),
    }))
  }, [sessions, sets, unit])

  return (
    <Card>
      <h3 className="mb-3 text-sm font-semibold">Volumen semanal ({unit})</h3>
      {data.length > 0 ? (
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data} margin={{ left: -20, right: 8, top: 8 }}>
            <CartesianGrid stroke="var(--color-border)" vertical={false} />
            <XAxis dataKey="week" tick={{ fontSize: 9, fill: 'var(--color-ink-muted)' }} />
            <YAxis tick={{ fontSize: 10, fill: 'var(--color-ink-muted)' }} width={36} />
            <Tooltip content={ChartTooltip} cursor={{ fill: 'var(--color-surface-2)' }} />
            <Bar dataKey="Volumen" fill="var(--color-cat-1)" radius={[4, 4, 0, 0]} maxBarSize={28} />
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <p className="py-8 text-center text-sm text-(--color-ink-muted)">Sin datos aún</p>
      )}
    </Card>
  )
}
