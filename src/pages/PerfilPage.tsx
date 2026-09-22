import { ExerciseCatalogManager } from '@/modules/configuracion/ExerciseCatalogManager'
import { RestTimerSetting } from '@/modules/configuracion/RestTimerSetting'
import { TemplateManager } from '@/modules/configuracion/TemplateManager'
import { UnitToggle } from '@/modules/configuracion/UnitToggle'
import { DataExportImport } from '@/modules/datos/DataExportImport'
import { AchievementsGrid } from '@/modules/gamificacion/AchievementsGrid'
import { PrHistoryList } from '@/modules/gamificacion/PrHistoryList'

export function PerfilPage() {
  return (
    <div className="flex flex-col gap-4">
      <header className="pt-1">
        <h1 className="text-2xl font-bold">Perfil</h1>
      </header>

      <section>
        <h2 className="mb-2 text-sm font-semibold text-(--color-ink-secondary)">Logros</h2>
        <AchievementsGrid />
      </section>

      <PrHistoryList />

      <section>
        <h2 className="mb-2 text-sm font-semibold text-(--color-ink-secondary)">Ajustes</h2>
        <div className="flex flex-col gap-3">
          <UnitToggle />
          <RestTimerSetting />
          <ExerciseCatalogManager />
          <TemplateManager />
          <DataExportImport />
        </div>
      </section>
    </div>
  )
}
