import { useLiveQuery } from 'dexie-react-hooks'
import { useState } from 'react'
import { db } from '@/db/db'
import { startSession } from '@/db/actions'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { FlameIcon } from '@/components/icons'
import { computeStreaks } from '@/lib/calculations'
import { useActiveSessionStore } from '@/store/useActiveSessionStore'
import { BodyWeightQuickLog } from './BodyWeightQuickLog'
import type { RoutineTemplate } from '@/db/types'

export function StartWorkoutView() {
  const setActiveSessionId = useActiveSessionStore((s) => s.setActiveSessionId)
  const [starting, setStarting] = useState(false)

  const sessions = useLiveQuery(() => db.sessions.toArray(), [])
  const templates = useLiveQuery(() => db.templates.toArray(), [])

  const streaks = computeStreaks((sessions ?? []).map((s) => s.date))
  const lastSession = (sessions ?? [])
    .slice()
    .sort((a, b) => b.date.localeCompare(a.date))[0]

  async function handleStart(template?: RoutineTemplate) {
    setStarting(true)
    try {
      const session = await startSession(template)
      setActiveSessionId(session.id)
    } finally {
      setStarting(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <header className="pt-1">
        <p className="text-sm text-(--color-ink-muted)">Hoy</p>
        <h1 className="text-2xl font-bold">Move Up</h1>
      </header>

      <Card className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-(--color-accent-2)/15 text-(--color-accent-2)">
          <FlameIcon width={24} height={24} />
        </div>
        <div className="flex-1">
          <p className="text-lg font-bold leading-none">
            {streaks.current} {streaks.current === 1 ? 'día' : 'días'}
          </p>
          <p className="text-xs text-(--color-ink-muted)">
            racha actual · récord {streaks.longest} días
          </p>
        </div>
        {lastSession && (
          <div className="text-right">
            <p className="text-xs text-(--color-ink-muted)">Última sesión</p>
            <p className="text-sm font-medium">
              {new Date(lastSession.date).toLocaleDateString('es', {
                day: 'numeric',
                month: 'short',
              })}
            </p>
          </div>
        )}
      </Card>

      <div>
        <h2 className="mb-2 text-sm font-semibold text-(--color-ink-secondary)">Plantillas</h2>
        <div className="grid grid-cols-2 gap-2">
          {(templates ?? []).map((t) => (
            <button
              key={t.id}
              disabled={starting}
              onClick={() => handleStart(t)}
              className="rounded-2xl border border-(--color-border) bg-(--color-surface) p-3 text-left active:bg-(--color-surface-2)"
            >
              <p className="font-semibold">{t.name}</p>
              <p className="text-xs text-(--color-ink-muted)">{t.exerciseIds.length} ejercicios</p>
            </button>
          ))}
        </div>
      </div>

      <Button
        size="lg"
        disabled={starting}
        onClick={() => handleStart(undefined)}
        className="w-full"
      >
        Entrenamiento libre
      </Button>

      <BodyWeightQuickLog />
    </div>
  )
}
