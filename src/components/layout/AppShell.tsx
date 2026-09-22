import type { ReactNode } from 'react'
import { AchievementUnlockOverlay } from '@/components/ui/AchievementUnlockOverlay'
import { PrCelebrationOverlay } from '@/components/ui/PrCelebrationOverlay'
import { ToastContainer } from '@/components/ui/ToastContainer'
import { BottomNav } from './BottomNav'

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-(--color-bg)">
      <main className="mx-auto max-w-md px-4 pb-28 pt-[calc(env(safe-area-inset-top)+1rem)]">
        {children}
      </main>
      <BottomNav />
      <ToastContainer />
      <PrCelebrationOverlay />
      <AchievementUnlockOverlay />
    </div>
  )
}
