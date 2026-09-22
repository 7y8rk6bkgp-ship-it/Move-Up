import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { ensureSeeded } from './db/seed'
import './index.css'

ensureSeeded().catch((err) => {
  console.error('Failed to seed database', err)
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
