import { Input } from './Input'

/** Sugerencias rápidas; el input de texto permite cualquier emoji a voluntad. */
const EMOJI_SUGERIDOS = [
  '🏷️', '🏨', '🍔', '🍺', '🚗', '🎟️', '🛍️', '💊',
  '📶', '✈️', '☕', '🎉', '💰', '📚', '🧳', '🎁',
]

interface EmojiPickerProps {
  value: string
  onChange: (emoji: string) => void
  error?: string
}

export function EmojiPicker({ value, onChange, error }: EmojiPickerProps) {
  return (
    <div className="flex flex-col gap-2">
      <Input
        type="text"
        label="Emoji"
        placeholder="🏷️"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        maxLength={8}
        error={error}
      />
      <div className="flex flex-wrap gap-1.5">
        {EMOJI_SUGERIDOS.map((emoji) => (
          <button
            key={emoji}
            type="button"
            onClick={() => onChange(emoji)}
            aria-label={`Usar ${emoji}`}
            aria-pressed={value === emoji}
            className={`flex h-9 w-9 items-center justify-center rounded-input text-lg transition-colors ${
              value === emoji
                ? 'border border-border-brand bg-surface-selected'
                : 'border border-transparent bg-surface-elevated text-text-secondary shadow-sm hover:bg-surface-secondary'
            }`}
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  )
}
