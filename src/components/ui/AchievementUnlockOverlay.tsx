import { AnimatePresence, motion } from 'framer-motion'
import { useUIStore } from '@/store/useUIStore'

export function AchievementUnlockOverlay() {
  const achievement = useUIStore((s) => s.achievementQueue[0])
  const dismiss = useUIStore((s) => s.dismissAchievementUnlock)

  return (
    <AnimatePresence>
      {achievement && (
        <motion.div
          className="fixed inset-x-4 top-20 z-[55] mx-auto max-w-sm"
          initial={{ y: -80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -60, opacity: 0 }}
          transition={{ type: 'spring', damping: 18, stiffness: 280 }}
          onClick={() => dismiss(achievement.id)}
        >
          <div className="flex items-center gap-3 rounded-2xl border border-(--color-cat-7)/40 bg-(--color-surface) p-3 shadow-2xl">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-(--color-cat-7)/20 text-2xl">
              {achievement.icon}
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-(--color-cat-7)">
                Logro desbloqueado
              </p>
              <p className="truncate text-sm font-bold">{achievement.name}</p>
              <p className="truncate text-xs text-(--color-ink-muted)">{achievement.description}</p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
