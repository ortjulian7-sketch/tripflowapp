import type { ButtonHTMLAttributes } from 'react'
import { Icon, type IconName } from './Icon'

type IconButtonStyle = 'primary' | 'secondary'
type IconButtonSize = 'medium' | 'large'

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: IconName
  label: string
  variant?: IconButtonStyle
  size?: IconButtonSize
}

const styleClasses: Record<IconButtonStyle, string> = {
  primary:
    'bg-action-primary-default text-text-inverse shadow-brand-glow disabled:bg-action-primary-disabled disabled:shadow-none',
  secondary: 'bg-surface-elevated text-icon-secondary shadow-md',
}

const sizeClasses: Record<IconButtonSize, string> = {
  medium: 'h-12 w-12',
  large: 'h-14 w-14',
}

export function IconButton({
  icon,
  label,
  variant = 'primary',
  size = 'medium',
  className,
  ...props
}: IconButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      className={`inline-flex items-center justify-center rounded-full transition-colors disabled:cursor-not-allowed ${styleClasses[variant]} ${sizeClasses[size]} ${className ?? ''}`}
      {...props}
    >
      <Icon name={icon} size={size === 'large' ? 24 : 20} />
    </button>
  )
}
