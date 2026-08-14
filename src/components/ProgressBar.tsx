type ProgressBarStyle = 'warning' | 'brand' | 'success' | 'error'

interface ProgressBarProps {
  /** 0–100. Se topa al 100% sin desbordar el Track (nunca se pasa el Fill). */
  percent: number
  variant?: ProgressBarStyle
  className?: string
}

const fillClasses: Record<ProgressBarStyle, string> = {
  warning: 'bg-status-warning-strong',
  brand: 'bg-action-primary-default',
  success: 'bg-status-success-strong',
  error: 'bg-status-error-strong',
}

export function ProgressBar({ percent, variant = 'brand', className }: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, percent))
  return (
    <div
      role="progressbar"
      aria-valuenow={Math.round(clamped)}
      aria-valuemin={0}
      aria-valuemax={100}
      className={`h-1 w-full overflow-hidden rounded-full bg-surface-secondary ${className ?? ''}`}
    >
      <div
        className={`h-full rounded-full ${fillClasses[variant]}`}
        style={{ width: `${clamped}%` }}
      />
    </div>
  )
}
