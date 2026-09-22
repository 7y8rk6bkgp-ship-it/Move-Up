import { lazy, Suspense, useEffect } from 'react'
import { HashRouter, Route, Routes } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { HoyPage } from '@/pages/HoyPage'
import { useSettingsStore } from '@/store/useSettingsStore'

const CalendarioPage = lazy(() =>
  import('@/pages/CalendarioPage').then((m) => ({ default: m.CalendarioPage })),
)
const EstadisticasPage = lazy(() =>
  import('@/pages/EstadisticasPage').then((m) => ({ default: m.EstadisticasPage })),
)
const CuerpoPage = lazy(() =>
  import('@/pages/CuerpoPage').then((m) => ({ default: m.CuerpoPage })),
)
const PerfilPage = lazy(() =>
  import('@/pages/PerfilPage').then((m) => ({ default: m.PerfilPage })),
)

function App() {
  const load = useSettingsStore((s) => s.load)

  useEffect(() => {
    load()
  }, [load])

  return (
    <HashRouter>
      <AppShell>
        <Suspense fallback={null}>
          <Routes>
            <Route path="/" element={<HoyPage />} />
            <Route path="/calendario" element={<CalendarioPage />} />
            <Route path="/estadisticas" element={<EstadisticasPage />} />
            <Route path="/cuerpo" element={<CuerpoPage />} />
            <Route path="/perfil" element={<PerfilPage />} />
          </Routes>
        </Suspense>
      </AppShell>
    </HashRouter>
  )
}

export default App
