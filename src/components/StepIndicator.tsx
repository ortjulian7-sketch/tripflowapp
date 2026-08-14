interface StepIndicatorProps {
  total: number
  activo: number
}

/** Puramente informativo (design-system.md § Step Indicator): no es un control, no se toca para navegar. */
export function StepIndicator({ total, activo }: StepIndicatorProps) {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: total }, (_, indice) => (
        <span
          key={indice}
          className={
            indice === activo
              ? 'h-1.5 w-5 rounded-full bg-icon-brand'
              : 'h-1.5 w-1.5 rounded-full bg-surface-selected'
          }
        />
      ))}
    </div>
  )
}
