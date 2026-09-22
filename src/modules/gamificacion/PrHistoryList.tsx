import { useLiveQuery } from 'dexie-react-hooks'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { db } from '@/db/db'
import { formatWeight } from '@/lib/calculations'
import { useSettingsStore } from '@/store/useSettingsStore'
import { Card } from '@/components/ui/Card'

const kindLabel: Record<string, string> = { peso: 'Peso', '1rm': '1RM est.', volumen: 'Volumen' }

export function PrHistoryList() {
  const unit = useSettingsStore((s) => s.unit)
  const events = useLiveQuery(
    () => db.prEvents.orderBy('date').reverse().limit(20).toArray(),
    [],
  )

  if (!events || events.length === 0) return null

  return (
    <Card>
      <h3 className="mb-3 text-sm font-semibold">Récords recientes</h3>
      <div className="flex flex-col gap-2">
        {events.map((e) => (
          <div key={e.id} className="flex items-center justify-between text-sm">
            <div className="min-w-0">
              <p className="truncate font-medium">{e.exerciseName}</p>
              <p className="text-xs text-(--color-ink-muted)">
                {kindLabel[e.kind]} · {format(new Date(e.date), 'd MMM', { locale: es })}
              </p>
            </div>
            <span className="shrink-0 font-semibold text-(--color-accent-2)">
              {formatWeight(e.valueKg, unit)}
            </span>
          </div>
        ))}
      </div>
    </Card>
  )
}
