import { useLiveQuery } from 'dexie-react-hooks'
import { useState } from 'react'
import { db } from '@/db/db'
import { logBodyWeight } from '@/db/actions'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { ScaleIcon } from '@/components/icons'
import { formatWeight, toDisplayWeight, toStorageKg } from '@/lib/calculations'
import { useSettingsStore } from '@/store/useSettingsStore'
import { useUIStore } from '@/store/useUIStore'

export function BodyWeightQuickLog() {
  const unit = useSettingsStore((s) => s.unit)
  const pushToast = useUIStore((s) => s.pushToast)
  const todayKey = new Date().toISOString().slice(0, 10)
  const todayLog = useLiveQuery(() => db.bodyWeightLogs.where('date').equals(todayKey).first(), [
    todayKey,
  ])
  const latestLog = useLiveQuery(
    () => db.bodyWeightLogs.orderBy('date').last(),
    [],
  )

  const [value, setValue] = useState('')

  const displayed = todayLog ?? null
  const placeholder = latestLog ? toDisplayWeight(latestLog.weightKg, unit).toString() : '—'

  async function handleSave() {
    const parsed = Number(value.replace(',', '.'))
    if (!Number.isFinite(parsed) || parsed <= 0) return
    await logBodyWeight(toStorageKg(parsed, unit))
    setValue('')
    pushToast('Peso corporal registrado', 'success')
  }

  return (
    <Card className="flex items-center gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-(--color-cat-1)/15 text-(--color-cat-1)">
        <ScaleIcon width={20} height={20} />
      </div>
      <div className="flex-1">
        <p className="text-sm font-semibold">Peso corporal</p>
        <p className="text-xs text-(--color-ink-muted)">
          {displayed ? `Hoy: ${formatWeight(displayed.weightKg, unit)}` : 'Sin registrar hoy'}
        </p>
      </div>
      <input
        inputMode="decimal"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="w-16 rounded-lg border border-(--color-border-strong) bg-(--color-surface-2) px-2 py-1.5 text-right text-sm"
      />
      <Button size="sm" variant="secondary" onClick={handleSave}>
        Guardar
      </Button>
    </Card>
  )
}
