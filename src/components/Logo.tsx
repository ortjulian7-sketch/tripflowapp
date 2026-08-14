type LogoSize = 'small' | 'large'

interface LogoProps {
  size?: LogoSize
  className?: string
}

const iconSizeClasses: Record<LogoSize, string> = {
  small: 'h-6 w-6',
  large: 'h-10 w-10',
}

const wordmarkSizeClasses: Record<LogoSize, string> = {
  small: 'text-base',
  large: 'text-2xl',
}

/**
 * Ícono de marca + wordmark, siempre juntos (.specify/memory/design-system.md § Logo).
 * Small: ícono + wordmark en Brand/Display lado a lado (nav). Large: el lockup
 * completo (ícono + logotipo apilados) tal como viene de marca — un solo asset,
 * sin recolorear (mismo criterio que el ícono: viene con su color bakeado).
 */
export function Logo({ size = 'small', className }: LogoProps) {
  if (size === 'large') {
    return (
      <img
        src="/icons/tripflow-lockup.svg"
        alt="Tripflow"
        className={`h-24 w-auto ${className ?? ''}`}
      />
    )
  }

  return (
    <div className={`flex items-center gap-2 ${className ?? ''}`}>
      <img src="/icons/icon.svg" alt="" className={iconSizeClasses[size]} />
      <span className={`font-brand text-text-brand ${wordmarkSizeClasses[size]}`}>Tripflow</span>
    </div>
  )
}
