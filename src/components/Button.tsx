import type { ButtonHTMLAttributes } from 'react'
import { Icon, type IconName } from './Icon'

type ButtonStyle = 'primary' | 'secondary' | 'danger'
type ButtonSize = 'medium' | 'large'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonStyle
  size?: ButtonSize
  icon?: IconName
  loading?: boolean
}

const styleClasses: Record<ButtonStyle, string> = {
  primary:
    'bg-action-primary-default text-text-inverse shadow-sm hover:opacity-90 disabled:opacity-100 disabled:bg-action-primary-disabled disabled:text-text-placeholder disabled:shadow-none',
  secondary:
    'bg-surface-elevated text-text-brand border border-border-brand hover:bg-surface-secondary disabled:text-text-placeholder disabled:border-text-placeholder disabled:hover:bg-surface-elevated',
  danger:
    'bg-status-error-strong text-status-error-on-strong shadow-sm hover:bg-status-error-strong-hover disabled:bg-action-primary-disabled disabled:text-text-placeholder disabled:shadow-none',
}

const sizeClasses: Record<ButtonSize, string> = {
  medium: 'h-10 px-4 text-[15px] gap-1.5',
  large: 'h-14 px-4 text-[15px] gap-2 w-full',
}

export function Button({
  variant = 'primary',
  size = 'medium',
  icon,
  loading = false,
  disabled,
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center rounded-button font-semibold transition-colors disabled:cursor-not-allowed ${styleClasses[variant]} ${sizeClasses[size]} ${className ?? ''}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <Icon name="spinner" size={20} />
      ) : icon ? (
        <Icon name={icon} size={20} />
      ) : null}
      {children}
    </button>
  )
}
