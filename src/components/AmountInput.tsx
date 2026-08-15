import type { ChangeEvent } from 'react'
import { Input } from './Input'
import { formatAmountForInput } from '@/lib/money'

interface AmountInputProps {
  label: string
  /** Valor crudo compatible con `parseAmountInput` (dígitos + opcional "." decimal) — nunca con separador de miles. */
  value: string
  onChange: (raw: string) => void
  /** Dígitos decimales de la moneda del viaje: 0 desactiva la coma decimal. */
  decimalDigits: number
  leadingText?: string
  placeholder?: string
  error?: string
}

function countDigits(text: string): number {
  return (text.match(/\d/g) ?? []).length
}

/** Ubica el cursor de forma que queden `digitsAfterCursor` dígitos a su derecha, sin importar dónde caigan los "." de agrupación. */
function cursorPositionFromEnd(text: string, digitsAfterCursor: number): number {
  if (digitsAfterCursor <= 0) return text.length
  let seen = 0
  for (let i = text.length - 1; i >= 0; i--) {
    if (/\d/.test(text[i])) {
      seen++
      if (seen === digitsAfterCursor) return i
    }
  }
  return 0
}

/**
 * Campo de monto con separador de miles en vivo (p. ej. "100.000"): el punto
 * es siempre de agrupación y la coma es el único separador decimal, para que
 * nunca haya ambigüedad mientras se tipea.
 */
export function AmountInput({
  label,
  value,
  onChange,
  decimalDigits,
  leadingText,
  placeholder,
  error,
}: AmountInputProps) {
  const displayValue = formatAmountForInput(value.replace('.', ','))

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const input = event.target
    const cursorPos = input.selectionStart ?? input.value.length
    const digitsAfterCursor = countDigits(input.value.slice(cursorPos))

    let sanitized = input.value.replace(/[^\d,]/g, '')
    const commaIndex = sanitized.indexOf(',')
    if (decimalDigits === 0 || commaIndex === -1) {
      sanitized = sanitized.replace(/,/g, '')
    } else {
      const integerPart = sanitized.slice(0, commaIndex)
      const fractionPart = sanitized.slice(commaIndex + 1).replace(/,/g, '').slice(0, decimalDigits)
      sanitized = `${integerPart},${fractionPart}`
    }
    const [integerRaw, fractionRaw] = sanitized.split(',')
    const integerClean = (integerRaw ?? '').replace(/^0+(?=\d)/, '')
    sanitized = fractionRaw !== undefined ? `${integerClean},${fractionRaw}` : integerClean

    const formatted = formatAmountForInput(sanitized)
    const newCursorPos = cursorPositionFromEnd(formatted, digitsAfterCursor)

    input.value = formatted
    input.setSelectionRange(newCursorPos, newCursorPos)

    onChange(sanitized.replace(',', '.'))
  }

  return (
    <Input
      type="text"
      inputMode="decimal"
      label={label}
      placeholder={placeholder}
      leadingText={leadingText}
      value={displayValue}
      onChange={handleChange}
      error={error}
    />
  )
}
