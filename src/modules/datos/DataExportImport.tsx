import { useRef, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { db } from '@/db/db'
import { useUIStore } from '@/store/useUIStore'
import { exportBodyWeightCsv, exportTrainingCsv, importTrainingCsv } from './csv'

export function DataExportImport() {
  const pushToast = useUIStore((s) => s.pushToast)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const [confirmingReset, setConfirmingReset] = useState(false)

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setBusy(true)
    try {
      const summary = await importTrainingCsv(file)
      pushToast(
        `Importado: ${summary.sessionsImported} sesiones, ${summary.setsImported} series`,
        'success',
      )
    } catch {
      pushToast('Error al importar el CSV', 'error')
    } finally {
      setBusy(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  async function handleReset() {
    if (!confirmingReset) {
      setConfirmingReset(true)
      return
    }
    await db.delete()
    window.location.reload()
  }

  return (
    <Card className="flex flex-col gap-3">
      <h3 className="text-sm font-semibold">Datos</h3>
      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="secondary" onClick={exportTrainingCsv}>
          Exportar entrenamientos (CSV)
        </Button>
        <Button size="sm" variant="secondary" onClick={exportBodyWeightCsv}>
          Exportar peso corporal (CSV)
        </Button>
        <Button
          size="sm"
          variant="secondary"
          disabled={busy}
          onClick={() => fileInputRef.current?.click()}
        >
          Importar CSV
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,text/csv"
          className="hidden"
          onChange={handleImport}
        />
      </div>
      <div className="mt-2 border-t border-(--color-border) pt-3">
        <Button size="sm" variant="danger" onClick={handleReset}>
          {confirmingReset ? '¿Seguro? Toca de nuevo para borrar todo' : 'Borrar todos los datos'}
        </Button>
      </div>
    </Card>
  )
}
