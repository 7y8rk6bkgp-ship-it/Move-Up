import { AnimatePresence, motion } from 'framer-motion'
import { useSettingsStore } from '@/store/useSettingsStore'
import { useUIStore } from '@/store/useUIStore'
import { formatWeight } from '@/lib/calculations'

const kindLabel: Record<string, string> = {
  peso: 'Récord de peso',
  '1rm': 'Récord de 1RM estimado',
  volumen: 'Récord de volumen',
}

export function PrCelebrationOverlay() {
  const pr = useUIStore((s) => s.prQueue[0])
  const dismiss = useUIStore((s) => s.dismissPrCelebration)
  const unit = useSettingsStore((s) => s.unit)

  return (
    <AnimatePresence>
      {pr && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 px-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => dismiss(pr.id)}
        >
          <motion.div
            className="relative w-full max-w-xs rounded-3xl border border-(--color-accent-2)/40 bg-(--color-surface) p-6 text-center shadow-2xl"
            initial={{ scale: 0.7, y: 40, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: 'spring', damping: 16, stiffness: 260 }}
          >
            <motion.div
              className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-(--color-accent-2) to-(--color-accent) text-3xl"
              initial={{ rotate: -20, scale: 0.5 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ delay: 0.1, type: 'spring', damping: 10 }}
            >
              🏆
            </motion.div>
            <p className="text-xs font-semibold uppercase tracking-wide text-(--color-accent-2)">
              {kindLabel[pr.kind]}
            </p>
            <h3 className="mt-1 text-lg font-bold">{pr.exerciseName}</h3>
            <p className="mt-2 text-2xl font-extrabold">
              {formatWeight(pr.valueKg, unit)}
              {pr.kind !== 'peso' && pr.kind !== 'volumen' ? '' : ''}
            </p>
            {pr.previousKg !== null && (
              <p className="mt-1 text-sm text-(--color-ink-muted)">
                Anterior: {formatWeight(pr.previousKg, unit)}
              </p>
            )}
            <button
              className="mt-5 w-full rounded-xl bg-(--color-accent-2) py-2.5 text-sm font-semibold text-white active:opacity-80"
              onClick={() => dismiss(pr.id)}
            >
              ¡Vamos!
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
