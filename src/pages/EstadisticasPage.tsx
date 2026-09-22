import { BalanceInsights } from '@/modules/estadisticas/BalanceInsights'
import { BodyWeightChart } from '@/modules/estadisticas/BodyWeightChart'
import { ExerciseProgressChart } from '@/modules/estadisticas/ExerciseProgressChart'
import { FrequencyChart } from '@/modules/estadisticas/FrequencyChart'
import { MuscleGroupVolumeChart } from '@/modules/estadisticas/MuscleGroupVolumeChart'
import { MuscleRecoveryList } from '@/modules/estadisticas/MuscleRecoveryList'
import { WeeklyVolumeChart } from '@/modules/estadisticas/WeeklyVolumeChart'

export function EstadisticasPage() {
  return (
    <div className="flex flex-col gap-4">
      <header className="pt-1">
        <h1 className="text-2xl font-bold">Estadísticas</h1>
      </header>

      <ExerciseProgressChart />
      <BalanceInsights />
      <MuscleRecoveryList />
      <WeeklyVolumeChart />
      <MuscleGroupVolumeChart />
      <FrequencyChart />
      <BodyWeightChart />
    </div>
  )
}
