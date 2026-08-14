import type { MouseEventHandler } from 'react'
import { Icon, type IconName } from './Icon'

interface ListItemProps {
  emoji: string
  title: string
  subtitle?: string
  amount?: string
  trailingIcon?: IconName
  onTrailingClick?: MouseEventHandler<HTMLButtonElement>
  trailingIconLabel?: string
  onClick?: () => void
  className?: string
}

/**
 * Fila reutilizable de listado. El catálogo de Figma solo documenta la
 * anatomía base (icon-box + text-group + amount); los estados interactivos
 * (fila tappable con Pressed) se infirieron acá para las filas accionables de
 * gastos (editar/borrar) y categorías (renombrar/borrar) — ver
 * .specify/memory/design-system.md § List Item.
 */
export function ListItem({
  emoji,
  title,
  subtitle,
  amount,
  trailingIcon,
  onTrailingClick,
  trailingIconLabel,
  onClick,
  className,
}: ListItemProps) {
  const content = (
    <>
      <span
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-input bg-surface-secondary text-xl"
        aria-hidden="true"
      >
        {emoji}
      </span>
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-text-primary">{title}</span>
        {subtitle && <span className="truncate text-xs text-text-secondary">{subtitle}</span>}
      </span>
      {amount && <span className="shrink-0 font-semibold text-text-primary">{amount}</span>}
    </>
  )

  return (
    <div className={`flex w-full items-center gap-2 rounded-input py-1 ${className ?? ''}`}>
      {onClick ? (
        <button
          type="button"
          onClick={onClick}
          className="flex min-w-0 flex-1 items-center gap-3.5 rounded-input px-2 py-1.5 text-left transition-colors hover:bg-surface-secondary active:bg-surface-secondary"
        >
          {content}
        </button>
      ) : (
        <div className="flex min-w-0 flex-1 items-center gap-3.5 px-2 py-1.5">{content}</div>
      )}
      {trailingIcon && (
        <button
          type="button"
          aria-label={trailingIconLabel}
          onClick={onTrailingClick}
          className="shrink-0 rounded-full p-2 text-icon-secondary hover:bg-surface-secondary"
        >
          <Icon name={trailingIcon} size={18} />
        </button>
      )}
    </div>
  )
}
