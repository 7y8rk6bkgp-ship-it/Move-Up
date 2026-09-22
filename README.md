# Move Up — Gym Log

PWA de gimnasio para un solo usuario, sin login, pensada para usarse desde el
celular en el gimnasio. Todo el historial vive en el dispositivo (IndexedDB) —
no hay backend ni cuentas.

## Stack

- Vite + React + TypeScript
- Tailwind CSS v4 (mobile-first, tema oscuro)
- Dexie.js (IndexedDB) para todos los datos de entrenamiento
- Zustand para estado global (unidades, sesión activa, UI)
- Recharts para gráficas, heatmap del calendario y mapa corporal en SVG a mano
- Framer Motion para animaciones (PRs y logros)
- date-fns, PapaParse
- vite-plugin-pwa (instalable, funciona offline)

## Estructura

```
src/
  db/            Esquema Dexie, semillas, acciones de escritura, motor de PRs/logros
  lib/
    calculations/  1RM (Epley), volumen, unidades, rachas, agregaciones, insights
    labels.ts      Etiquetas en español de grupos musculares / patrones
  store/         Zustand: settings, sesión activa, UI (toasts, celebraciones)
  modules/       Lógica + componentes por módulo (registro, calendario,
                 estadisticas, cuerpo, gamificacion, datos, configuracion)
  pages/         Una página por pestaña de navegación
  components/    UI compartida (Card, Button, Sheet, iconos, layout)
```

## Desarrollo

```bash
npm install
npm run dev       # servidor local
npm run build     # tsc -b && vite build
npm run lint       # oxlint
npm run preview    # sirve dist/ localmente
```

Los íconos de la PWA se generan a partir de `src-icons/*.svg` con
`node scripts/generate-icons.mjs` (requiere `sharp`, ya en devDependencies).

## Despliegue

Es un sitio 100% estático (`dist/`) — desplegable en Netlify, Vercel o GitHub
Pages sin configuración adicional. El router usa `HashRouter` para que
funcione en cualquier hosting estático sin reglas de rewrite.
