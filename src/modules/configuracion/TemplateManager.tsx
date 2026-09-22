import { useLiveQuery } from 'dexie-react-hooks'
import { useState } from 'react'
import { createTemplate, deleteTemplate } from '@/db/actions'
import { db } from '@/db/db'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Sheet } from '@/components/ui/Sheet'
import { TrashIcon } from '@/components/icons'
import { muscleGroupLabels } from '@/lib/labels'
import { useUIStore } from '@/store/useUIStore'

export function TemplateManager() {
  const pushToast = useUIStore((s) => s.pushToast)
  const templates = useLiveQuery(() => db.templates.toArray(), [])
  const exercises = useLiveQuery(() => db.exercises.filter((e) => !e.archivedAt).toArray(), [])

  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [selected, setSelected] = useState<string[]>([])

  const grouped = new Map<string, typeof exercises>()
  for (const e of exercises ?? []) {
    const arr = grouped.get(e.muscleGroup) ?? []
    arr.push(e)
    grouped.set(e.muscleGroup, arr as never)
  }

  function toggle(id: string) {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  async function handleCreate() {
    if (!name.trim() || selected.length === 0) return
    await createTemplate(name, selected)
    setName('')
    setSelected([])
    setOpen(false)
    pushToast('Plantilla creada', 'success')
  }

  return (
    <Card>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold">Plantillas de rutina</h3>
        <Button size="sm" variant="secondary" onClick={() => setOpen(true)}>
          + Nueva
        </Button>
      </div>
      <div className="flex flex-col gap-1">
        {(templates ?? []).map((t) => (
          <div key={t.id} className="flex items-center justify-between py-1 text-sm">
            <div>
              <p className="font-medium">{t.name}</p>
              <p className="text-[11px] text-(--color-ink-muted)">
                {t.exerciseIds.length} ejercicios
              </p>
            </div>
            <button
              onClick={() => deleteTemplate(t.id)}
              className="p-1.5 text-(--color-ink-muted) active:text-(--color-critical)"
              aria-label="Eliminar plantilla"
            >
              <TrashIcon width={16} height={16} />
            </button>
          </div>
        ))}
      </div>

      <Sheet open={open} onClose={() => setOpen(false)} title="Nueva plantilla">
        <div className="flex flex-col gap-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nombre de la plantilla"
            className="rounded-xl border border-(--color-border-strong) bg-(--color-surface-2) px-3 py-2.5 text-sm"
          />
          <p className="text-xs text-(--color-ink-muted)">
            Selecciona los ejercicios ({selected.length})
          </p>
          <div className="flex max-h-80 flex-col gap-4 overflow-y-auto">
            {Array.from(grouped.entries()).map(([mg, list]) => (
              <div key={mg}>
                <h4 className="mb-1 text-xs font-semibold uppercase text-(--color-ink-muted)">
                  {muscleGroupLabels[mg as keyof typeof muscleGroupLabels] ?? mg}
                </h4>
                <div className="flex flex-col gap-1">
                  {(list ?? []).map((e) => (
                    <label
                      key={e.id}
                      className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm active:bg-(--color-surface-2)"
                    >
                      <input
                        type="checkbox"
                        checked={selected.includes(e.id)}
                        onChange={() => toggle(e.id)}
                        className="h-4 w-4"
                      />
                      {e.name}
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <Button onClick={handleCreate} className="w-full">
            Crear plantilla
          </Button>
        </div>
      </Sheet>
    </Card>
  )
}
