import { useLiveQuery } from 'dexie-react-hooks'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { useMemo, useState } from 'react'
import { db } from '@/db/db'
import { Card } from '@/components/ui/Card'
import { Sheet } from '@/components/ui/Sheet'
import { FlameIcon } from '@/components/icons'
import { computeStreaks, formatWeight, volumeByDay } from '@/lib/calculations'
import { useSettingsStore } from '@/store/useSettingsStore'
import { MonthHeatmap } from '@/modules/calendario/MonthHeatmap'
import { YearHeatmap } from '@/modules/calendario/YearHeatmap'

export function CalendarioPage() {
  const unit = useSettingsStore((s) => s.unit)
  const [view, setView] = useState<'mes' | 'año'>('mes')
  const [month, setMonth] = useState(() => new Date())
  const [year, setYear] = useState(() => new Date().getFullYear())
  const [selectedDay, setSelectedDay] = useState<string | null>(null)

  const sessions = useLiveQuery(() => db.sessions.toArray(), [])
  const sets = useLiveQuery(() => db.sets.toArray(), [])

  const dayMap = useMemo(
    () => volumeByDay(sessions ?? [], sets ?? []),
    [sessions, sets],
  )
  const streaks = computeStreaks((sessions ?? []).map((s) => s.date))

  const selectedData = selectedDay ? dayMap.get(selectedDay) : null
  const selectedSessions = useLiveQuery(async () => {
    if (!selectedData) return []
    return db.sessions.bulkGet(selectedData.sessionIds)
  }, [selectedData?.date])

  return (
    <div className="flex flex-col gap-4">
      <header className="flex items-center justify-between pt-1">
        <h1 className="text-2xl font-bold">Calendario</h1>
        <div className="flex rounded-full bg-(--color-surface-2) p-0.5 text-xs font-semibold">
          {(['mes', 'año'] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`rounded-full px-3 py-1.5 capitalize transition-colors ${
                view === v ? 'bg-(--color-accent) text-white' : 'text-(--color-ink-muted)'
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      </header>

      <div className="grid grid-cols-2 gap-3">
        <Card className="flex items-center gap-3">
          <FlameIcon width={20} height={20} className="text-(--color-accent-2)" />
          <div>
            <p className="text-lg font-bold leading-none">{streaks.current}</p>
            <p className="text-[11px] text-(--color-ink-muted)">racha actual</p>
          </div>
        </Card>
        <Card className="flex items-center gap-3">
          <FlameIcon width={20} height={20} className="text-(--color-cat-8)" />
          <div>
            <p className="text-lg font-bold leading-none">{streaks.longest}</p>
            <p className="text-[11px] text-(--color-ink-muted)">racha más larga</p>
          </div>
        </Card>
      </div>

      <Card>
        {view === 'mes' ? (
          <>
            <div className="mb-3 flex items-center justify-between">
              <button
                onClick={() => setMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1))}
                className="rounded-lg px-2 py-1 text-(--color-ink-muted) active:bg-(--color-surface-2)"
              >
                ‹
              </button>
              <p className="text-sm font-semibold capitalize">
                {format(month, 'MMMM yyyy', { locale: es })}
              </p>
              <button
                onClick={() => setMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1))}
                className="rounded-lg px-2 py-1 text-(--color-ink-muted) active:bg-(--color-surface-2)"
              >
                ›
              </button>
            </div>
            <MonthHeatmap month={month} volumeByDay={dayMap} onSelectDay={setSelectedDay} />
          </>
        ) : (
          <>
            <div className="mb-3 flex items-center justify-between">
              <button
                onClick={() => setYear((y) => y - 1)}
                className="rounded-lg px-2 py-1 text-(--color-ink-muted) active:bg-(--color-surface-2)"
              >
                ‹
              </button>
              <p className="text-sm font-semibold">{year}</p>
              <button
                onClick={() => setYear((y) => y + 1)}
                className="rounded-lg px-2 py-1 text-(--color-ink-muted) active:bg-(--color-surface-2)"
              >
                ›
              </button>
            </div>
            <YearHeatmap year={year} volumeByDay={dayMap} onSelectDay={(key) => setSelectedDay(key)} />
          </>
        )}
      </Card>

      <div className="flex items-center gap-3 text-[11px] text-(--color-ink-muted)">
        <span>Menos</span>
        {[0, 1, 2, 3, 4].map((lvl) => (
          <span
            key={lvl}
            className="h-3 w-3 rounded-sm"
            style={{ backgroundColor: `var(--color-heat-${lvl})` }}
          />
        ))}
        <span>Más</span>
      </div>

      <Sheet
        open={!!selectedDay}
        onClose={() => setSelectedDay(null)}
        title={
          selectedDay
            ? format(new Date(selectedDay), "d 'de' MMMM, yyyy", { locale: es })
            : ''
        }
      >
        {selectedData ? (
          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-(--color-surface-2) p-3">
                <p className="text-xs text-(--color-ink-muted)">Volumen total</p>
                <p className="text-lg font-bold">{formatWeight(selectedData.volumeKg, unit)}</p>
              </div>
              <div className="rounded-xl bg-(--color-surface-2) p-3">
                <p className="text-xs text-(--color-ink-muted)">Series</p>
                <p className="text-lg font-bold">{selectedData.setCount}</p>
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              {(selectedSessions ?? []).filter(Boolean).map((session) => (
                <div key={session!.id} className="rounded-xl bg-(--color-surface-2) p-3">
                  <p className="text-sm font-semibold">
                    {session!.templateName ?? 'Entrenamiento libre'}
                  </p>
                  {session!.notes && (
                    <p className="mt-1 text-xs text-(--color-ink-muted)">{session!.notes}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="py-8 text-center text-sm text-(--color-ink-muted)">
            Sin entrenamientos este día
          </p>
        )}
      </Sheet>
    </div>
  )
}
