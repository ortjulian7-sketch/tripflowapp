import type { HTMLAttributes } from 'react'

type CardStyle = 'subtle' | 'outlined'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardStyle
}

const styleClasses: Record<CardStyle, string> = {
  subtle: 'bg-surface-secondary',
  outlined: 'bg-surface-elevated border border-border-brand',
}

export function Card({ variant = 'subtle', className, children, ...props }: CardProps) {
  return (
    <div
      className={`flex flex-col gap-2.5 rounded-card p-card-padding text-text-primary ${styleClasses[variant]} ${className ?? ''}`}
      {...props}
    >
      {children}
    </div>
  )
}
