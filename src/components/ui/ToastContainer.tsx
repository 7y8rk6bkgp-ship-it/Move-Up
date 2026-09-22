import { AnimatePresence, motion } from 'framer-motion'
import { useEffect } from 'react'
import { useUIStore } from '@/store/useUIStore'

const toneClasses: Record<string, string> = {
  info: 'bg-(--color-surface-3) text-(--color-ink)',
  success: 'bg-(--color-good)/90 text-white',
  error: 'bg-(--color-critical)/90 text-white',
}

export function ToastContainer() {
  const toasts = useUIStore((s) => s.toasts)
  const dismiss = useUIStore((s) => s.dismissToast)

  useEffect(() => {
    if (toasts.length === 0) return
    const timers = toasts.map((t) => setTimeout(() => dismiss(t.id), 2600))
    return () => timers.forEach(clearTimeout)
  }, [toasts, dismiss])

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-24 z-50 flex flex-col items-center gap-2 px-4">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`pointer-events-auto rounded-full px-4 py-2 text-sm font-medium shadow-lg ${toneClasses[t.tone]}`}
          >
            {t.message}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
