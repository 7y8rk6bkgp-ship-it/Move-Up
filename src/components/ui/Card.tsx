import type { HTMLAttributes } from 'react'

export function Card({ className = '', ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`rounded-2xl border border-(--color-border) bg-(--color-surface) p-4 shadow-(--shadow-card) ${className}`}
      {...props}
    />
  )
}
