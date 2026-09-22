import { AnimatePresence, motion } from 'framer-motion'
import type { ReactNode } from 'react'
import { CloseIcon } from '@/components/icons'

interface SheetProps {
  open: boolean
  onClose: () => void
  title?: string
  children: ReactNode
}

export function Sheet({ open, onClose, title, children }: SheetProps) {
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <motion.div
            className="absolute inset-0 bg-black/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="relative z-10 max-h-[88vh] w-full max-w-md overflow-y-auto rounded-t-3xl border-t border-(--color-border) bg-(--color-surface) pb-[env(safe-area-inset-bottom)]"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 32, stiffness: 320 }}
          >
            <div className="sticky top-0 flex items-center justify-between border-b border-(--color-border) bg-(--color-surface) px-4 py-3">
              <h2 className="text-base font-semibold">{title}</h2>
              <button
                onClick={onClose}
                className="rounded-full p-1.5 text-(--color-ink-muted) active:bg-(--color-surface-2)"
                aria-label="Cerrar"
              >
                <CloseIcon width={20} height={20} />
              </button>
            </div>
            <div className="p-4">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
