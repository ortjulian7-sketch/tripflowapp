import type { SVGProps } from 'react'

/**
 * Inventario acotado según .specify/memory/design-system.md — pedir un ícono
 * nuevo al Design System solo cuando ninguno de estos cubra el significado.
 */
export type IconName =
  | 'plus'
  | 'home'
  | 'map'
  | 'arrow-left'
  | 'chevron-down'
  | 'search'
  | 'close'
  | 'sparkle'
  | 'trash'
  | 'spinner'
  | 'user'
  | 'pin'
  | 'card'

const paths: Record<IconName, React.ReactNode> = {
  plus: <path d="M8 3v10M3 8h10" />,
  home: <path d="M2.5 7 8 2.5l5.5 4.5M4 6.5V13h3V9.5h2V13h3V6.5" />,
  map: (
    <path d="M3 4.5 6 3.3l4 1.2 3-1.2v8.2l-3 1.2-4-1.2-3 1.2V4.5ZM6 3.3v8.2M10 4.5v8.2" />
  ),
  'arrow-left': <path d="M13 8H3M7 4 3 8l4 4" />,
  'chevron-down': <path d="M4 6l4 4 4-4" />,
  search: (
    <>
      <circle cx="7" cy="7" r="4.5" />
      <path d="M13.5 13.5 10.5 10.5" />
    </>
  ),
  close: <path d="M4 4l8 8M12 4l-8 8" />,
  sparkle: <path d="M8 2l1.2 3.8L13 7l-3.8 1.2L8 12l-1.2-3.8L3 7l3.8-1.2L8 2Z" />,
  trash: (
    <path d="M3 5h10M6.5 5V3.5h3V5M5 5v8a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1V5M7 7.5v4M9 7.5v4" />
  ),
  spinner: (
    <>
      <circle cx="8" cy="8" r="6" opacity="0.25" />
      <path d="M14 8a6 6 0 0 0-6-6" />
    </>
  ),
  user: (
    <>
      <circle cx="8" cy="5.5" r="2.5" />
      <path d="M3 13.5c0-2.5 2.2-4.5 5-4.5s5 2 5 4.5" />
    </>
  ),
  pin: (
    <>
      <path d="M8 14s-5-4.5-5-8a5 5 0 0 1 10 0c0 3.5-5 8-5 8Z" />
      <circle cx="8" cy="6" r="1.6" />
    </>
  ),
  card: (
    <>
      <rect x="2" y="3.5" width="12" height="9" rx="1.8" />
      <path d="M2 6.2h12" />
      <path d="M4.5 8.7h1.7M4.5 10.2h3" opacity="0.5" />
    </>
  ),
}

interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'name'> {
  name: IconName
  size?: number
}

export function Icon({ name, size = 16, className, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={name === 'spinner' ? `animate-spin ${className ?? ''}` : className}
      {...props}
    >
      {paths[name]}
    </svg>
  )
}
