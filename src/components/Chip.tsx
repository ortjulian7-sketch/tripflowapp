import type { ButtonHTMLAttributes } from 'react'

interface ChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  emoji: string
  label: string
  selected?: boolean
}

export function Chip({ emoji, label, selected = false, className, ...props }: ChipProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      className={`flex w-full flex-col items-center gap-1 rounded-input px-2 py-3 text-center transition-colors ${
        selected
          ? 'border border-border-brand bg-surface-selected text-text-brand'
          : 'border border-transparent bg-surface-elevated text-text-secondary shadow-sm hover:bg-surface-secondary'
      } ${className ?? ''}`}
      {...props}
    >
      <span className="text-xl leading-none" aria-hidden="true">
        {emoji}
      </span>
      <span className="text-[10px] font-semibold leading-tight">{label}</span>
    </button>
  )
}
