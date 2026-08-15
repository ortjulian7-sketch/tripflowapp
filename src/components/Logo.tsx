type LogoSize = 'small' | 'large'

interface LogoProps {
  size?: LogoSize
  className?: string
}

const iconSizeClasses: Record<LogoSize, string> = {
  small: 'h-6 w-6',
  large: 'h-16 w-16',
}

const wordmarkSizeClasses: Record<LogoSize, string> = {
  small: 'text-base',
  large: 'text-3xl',
}

/**
 * Ícono de marca + wordmark, siempre juntos (.specify/memory/design-system.md § Logo).
 * El wordmark usa `color-text-brand` (no un asset con color bakeado) para que siga
 * siendo legible en dark mode — un SVG plano con texto negro fijo se volvía invisible
 * sobre fondo oscuro. Small: lado a lado (nav). Large: apilado, para momentos de
 * mayor protagonismo de marca (bienvenida, login, registro).
 */
export function Logo({ size = 'small', className }: LogoProps) {
  if (size === 'large') {
    return (
      <div className={`flex flex-col items-center gap-3 ${className ?? ''}`}>
        <img src="/icons/icon.svg" alt="" className={iconSizeClasses[size]} />
        <span className={`font-brand text-text-brand ${wordmarkSizeClasses[size]}`}>Tripflow</span>
      </div>
    )
  }

  return (
    <div className={`flex items-center gap-2 ${className ?? ''}`}>
      <img src="/icons/icon.svg" alt="" className={iconSizeClasses[size]} />
      <span className={`font-brand text-text-brand ${wordmarkSizeClasses[size]}`}>Tripflow</span>
    </div>
  )
}
