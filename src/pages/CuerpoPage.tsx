import { useLiveQuery } from 'dexie-react-hooks'
import { subDays } from 'date-fns'
import { useMemo, useState } from 'react'
import { db } from '@/db/db'
import type { MuscleGroup } from '@/db/types'
import { Card } from '@/components/ui/Card'
import { computeMuscleRecovery, formatWeight, volumeByMuscleGroup } from '@/lib/calculations'
import { muscleGroupLabels } from '@/lib/labels'
import { BodyMap } from '@/modules/cuerpo/BodyMap'
import { useSettingsStore } from '@/store/useSettingsStore'

export function CuerpoPage() {
  const unit = useSettingsStore((s) => s.unit)
  const [view, setView] = useState<'front' | 'back'>('front')
  const [windowDays, setWindowDays] = useState(7)
  const [selected, setSelected] = useState<MuscleGroup | null>(null)

  const sessions = useLiveQuery(() => db.sessions.toArray(), [])
  const sets = useLiveQuery(() => db.sets.toArray(), [])
  const exercises = useLiveQuery(() => db.exercises.toArray(), [])

  const volumeByMuscle = useMemo(() => {
    const since = subDays(new Date(), windowDays)
    return volumeByMuscleGroup(sets ?? [], exercises ?? [], since)
  }, [sets, exercises, windowDays])

  const recovery = useMemo(
    () => computeMuscleRecovery(sessions ?? [], sets ?? [], exercises ?? [], selected ? [selected] : []),
    [sessions, sets, exercises, selected],
  )
  const selectedRecovery = recovery[0]

  return (
    <div className="flex flex-col gap-4">
      <header className="flex items-center justify-between pt-1">
        <h1 className="text-2xl font-bold">Cuerpo</h1>
        <div className="flex rounded-full bg-(--color-surface-2) p-0.5 text-xs font-semibold">
          {(['front', 'back'] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`rounded-full px-3 py-1.5 transition-colors ${
                view === v ? 'bg-(--color-accent) text-white' : 'text-(--color-ink-muted)'
              }`}
            >
              {v === 'front' ? 'Frontal' : 'Espalda'}
            </button>
          ))}
        </div>
      </header>

      <div className="flex justify-center gap-2">
        {[7, 28].map((d) => (
          <button
            key={d}
            onClick={() => setWindowDays(d)}
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              windowDays === d
                ? 'bg-(--color-accent) text-white'
                : 'bg-(--color-surface-2) text-(--color-ink-muted)'
            }`}
          >
            {d} días
          </button>
        ))}
      </div>

      <Card>
        <BodyMap
          view={view}
          volumeByMuscle={volumeByMuscle}
          selected={selected}
          onSelect={(m) => setSelected((prev) => (prev === m ? null : m))}
        />
        <div className="mt-3 flex items-center justify-center gap-2 text-[11px] text-(--color-ink-muted)">
          <span>Menos</span>
          {[0, 1, 2, 3, 4].map((lvl) => (
            <span
              key={lvl}
              className="h-3 w-3 rounded-sm"
              style={{ backgroundColor: `var(--color-muscle-${lvl})` }}
            />
          ))}
          <span>Más</span>
        </div>
      </Card>

      {selected && selectedRecovery && (
        <Card>
          <h3 className="text-sm font-semibold">{muscleGroupLabels[selected]}</h3>
          <div className="mt-2 grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-(--color-ink-muted)">Volumen ({windowDays}d)</p>
              <p className="text-lg font-bold">
                {formatWeight(volumeByMuscle[selected] ?? 0, unit)}
              </p>
            </div>
            <div>
              <p className="text-xs text-(--color-ink-muted)">Última vez</p>
              <p className="text-lg font-bold">
                {selectedRecovery.daysSinceTrained === null
                  ? 'Nunca'
                  : selectedRecovery.daysSinceTrained === 0
                    ? 'Hoy'
                    : `hace ${selectedRecovery.daysSinceTrained}d`}
              </p>
            </div>
          </div>
        </Card>
      )}

      <p className="text-center text-xs text-(--color-ink-muted)">
        Toca un músculo para ver el detalle. El color muestra el volumen relativo en la ventana
        seleccionada (incluye secundarios a mitad de peso).
      </p>
    </div>
  )
}
