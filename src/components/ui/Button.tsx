import type { ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size = 'md' | 'lg' | 'sm'

const variantClasses: Record<Variant, string> = {
  primary: 'bg-(--color-accent) text-white active:bg-(--color-accent-dim)',
  secondary:
    'bg-(--color-surface-3) text-(--color-ink) border border-(--color-border-strong) active:bg-(--color-surface-2)',
  ghost: 'text-(--color-ink-secondary) active:bg-(--color-surface-2)',
  danger: 'bg-(--color-critical)/15 text-(--color-critical) active:bg-(--color-critical)/25',
}

const sizeClasses: Record<Size, string> = {
  sm: 'text-sm px-3 py-1.5 rounded-lg',
  md: 'text-sm px-4 py-2.5 rounded-xl',
  lg: 'text-base px-5 py-3.5 rounded-2xl font-semibold',
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
}

export function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 font-medium transition-colors disabled:opacity-40 disabled:pointer-events-none ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    />
  )
}
