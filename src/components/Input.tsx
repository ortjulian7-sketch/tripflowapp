import { useId, type InputHTMLAttributes, type ReactNode } from 'react'
import { Icon, type IconName } from './Icon'

interface BaseProps {
  label: string
  showLabel?: boolean
  error?: string
  helperText?: string
  leadingIcon?: IconName
  /** Prefijo de texto (p. ej. el símbolo de moneda del viaje) — nunca hardcodear "$". */
  leadingText?: string
}

interface TextOrNumberProps
  extends BaseProps,
    Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  /**
   * `date` es una extensión v0 (el catálogo solo documenta Text/Number/Select
   * — ver design-system.md § Input): usa el picker nativo del navegador con
   * el mismo chrome visual que Text/Number.
   */
  type: 'text' | 'number' | 'date'
  /** Enmascara el valor (campo de contraseña) — sigue siendo Type: Text a nivel de diseño. */
  secure?: boolean
}

interface SelectOption {
  value: string
  label: string
}

interface SelectProps extends BaseProps {
  type: 'select'
  options: SelectOption[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  name?: string
  id?: string
}

type InputProps = TextOrNumberProps | SelectProps

function fieldChrome(hasError: boolean, leadingWidthClass: string) {
  return `w-full h-12 rounded-input bg-surface-elevated shadow-sm text-text-primary placeholder:text-text-placeholder focus:outline-none focus:border focus:border-border-brand ${
    hasError ? 'border border-status-error-border' : 'border border-transparent'
  } ${leadingWidthClass} pr-4`
}

function Chrome({
  id,
  label,
  showLabel,
  error,
  helperText,
  children,
}: {
  id: string
  label: string
  showLabel: boolean
  error?: string
  helperText?: string
  children: ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      {showLabel && (
        <label htmlFor={id} className="text-[11px] font-semibold text-text-secondary">
          {label}
        </label>
      )}
      <div className="relative">{children}</div>
      {(error || helperText) && (
        <p
          className={`text-xs ${error ? 'text-status-error' : 'text-text-secondary'}`}
        >
          {error ?? helperText}
        </p>
      )}
    </div>
  )
}

export function Input(props: InputProps) {
  const autoId = useId()
  const id = props.id ?? autoId
  const showLabel = props.showLabel ?? true

  if (props.type === 'select') {
    const { label, error, helperText, options, value, onChange, placeholder, disabled, name } =
      props
    return (
      <Chrome id={id} label={label} showLabel={showLabel} error={error} helperText={helperText}>
        <select
          id={id}
          name={name}
          disabled={disabled}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`${fieldChrome(!!error, 'pl-4')} appearance-none pr-10`}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <Icon
          name="chevron-down"
          size={20}
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-icon-secondary"
        />
      </Chrome>
    )
  }

  const {
    label,
    showLabel: _showLabel,
    error,
    helperText,
    leadingIcon,
    leadingText,
    secure,
    className,
    type,
    ...inputProps
  } = props
  const leadingWidthClass = leadingIcon || leadingText ? 'pl-10' : 'pl-4'
  const isEmptyDate = type === 'date' && !inputProps.value

  return (
    <Chrome id={id} label={label} showLabel={showLabel} error={error} helperText={helperText}>
      {leadingIcon && (
        <Icon
          name={leadingIcon}
          size={20}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-icon-secondary"
        />
      )}
      {!leadingIcon && leadingText && (
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary">
          {leadingText}
        </span>
      )}
      {isEmptyDate && (
        <span
          className={`pointer-events-none absolute ${leadingWidthClass === 'pl-10' ? 'left-10' : 'left-4'} top-1/2 -translate-y-1/2 text-text-placeholder`}
        >
          dd/mm/aaaa
        </span>
      )}
      <input
        id={id}
        type={type === 'text' && secure ? 'password' : type}
        className={`${fieldChrome(!!error, leadingWidthClass)} ${type === 'date' ? 'pr-10' : ''} ${className ?? ''}`}
        style={isEmptyDate ? { color: 'transparent' } : undefined}
        {...inputProps}
      />
      {type === 'date' && (
        <Icon
          name="calendar"
          size={20}
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-icon-secondary"
        />
      )}
    </Chrome>
  )
}
