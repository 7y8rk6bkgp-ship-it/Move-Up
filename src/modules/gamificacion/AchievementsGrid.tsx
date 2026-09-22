import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/db/db'
import { Card } from '@/components/ui/Card'

const categoryLabels: Record<string, string> = {
  consistencia: 'Consistencia',
  fuerza: 'Fuerza',
  volumen: 'Volumen',
  exploracion: 'Exploración',
}

export function AchievementsGrid() {
  const achievements = useLiveQuery(() => db.achievements.toArray(), [])
  const progress = useLiveQuery(() => db.achievementProgress.toArray(), [])

  const progressById = new Map((progress ?? []).map((p) => [p.achievementId, p]))
  const grouped = new Map<string, typeof achievements>()
  for (const a of achievements ?? []) {
    const arr = grouped.get(a.category) ?? []
    arr.push(a)
    grouped.set(a.category, arr as never)
  }

  const unlockedCount = (progress ?? []).filter((p) => p.unlockedAt).length

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-(--color-ink-muted)">
        {unlockedCount} / {achievements?.length ?? 0} logros desbloqueados
      </p>
      {Array.from(grouped.entries()).map(([category, list]) => (
        <div key={category}>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-(--color-ink-muted)">
            {categoryLabels[category] ?? category}
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {(list ?? []).map((a) => {
              const p = progressById.get(a.id)
              const unlocked = !!p?.unlockedAt
              const pct = Math.min(100, ((p?.currentValue ?? 0) / a.targetValue) * 100)
              return (
                <Card
                  key={a.id}
                  className={`flex flex-col items-center gap-1 text-center ${unlocked ? '' : 'opacity-50'}`}
                >
                  <span className="text-2xl">{a.icon}</span>
                  <p className="text-xs font-semibold leading-tight">{a.name}</p>
                  <p className="text-[10px] text-(--color-ink-muted)">{a.description}</p>
                  <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-(--color-surface-2)">
                    <div
                      className="h-full bg-(--color-accent)"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </Card>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
