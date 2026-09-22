import { Card } from '@/components/ui/Card'
import { useSettingsStore } from '@/store/useSettingsStore'

export function UnitToggle() {
  const unit = useSettingsStore((s) => s.unit)
  const setUnit = useSettingsStore((s) => s.setUnit)

  return (
    <Card className="flex items-center justify-between">
      <div>
        <h3 className="text-sm font-semibold">Unidad de peso</h3>
        <p className="text-xs text-(--color-ink-muted)">Se guarda internamente en kg</p>
      </div>
      <div className="flex rounded-full bg-(--color-surface-2) p-0.5 text-sm font-semibold">
        {(['kg', 'lb'] as const).map((u) => (
          <button
            key={u}
            onClick={() => setUnit(u)}
            className={`rounded-full px-4 py-1.5 uppercase transition-colors ${
              unit === u ? 'bg-(--color-accent) text-white' : 'text-(--color-ink-muted)'
            }`}
          >
            {u}
          </button>
        ))}
      </div>
    </Card>
  )
}
