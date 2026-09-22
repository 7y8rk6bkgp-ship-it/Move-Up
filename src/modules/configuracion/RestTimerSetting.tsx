import { Card } from '@/components/ui/Card'
import { useSettingsStore } from '@/store/useSettingsStore'

export function RestTimerSetting() {
  const seconds = useSettingsStore((s) => s.restTimerSeconds)
  const setRestTimerSeconds = useSettingsStore((s) => s.setRestTimerSeconds)

  return (
    <Card className="flex items-center justify-between">
      <div>
        <h3 className="text-sm font-semibold">Descanso sugerido</h3>
        <p className="text-xs text-(--color-ink-muted)">Referencia entre series</p>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => setRestTimerSeconds(Math.max(15, seconds - 15))}
          className="h-8 w-8 rounded-lg bg-(--color-surface-2) font-bold active:opacity-70"
        >
          −
        </button>
        <span className="w-14 text-center text-sm font-semibold">
          {Math.floor(seconds / 60)}:{(seconds % 60).toString().padStart(2, '0')}
        </span>
        <button
          onClick={() => setRestTimerSeconds(seconds + 15)}
          className="h-8 w-8 rounded-lg bg-(--color-surface-2) font-bold active:opacity-70"
        >
          +
        </button>
      </div>
    </Card>
  )
}
