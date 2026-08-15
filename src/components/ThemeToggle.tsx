import { useTheme } from '@/features/theme/ThemeProvider'

/** Switch para elegir modo claro/oscuro — ver src/features/theme/ThemeProvider.tsx. */
export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const esOscuro = theme === 'dark'

  return (
    <div className="flex w-full items-center justify-between gap-3.5 rounded-input px-2 py-1.5">
      <span className="text-text-primary">Modo oscuro</span>
      <button
        type="button"
        role="switch"
        aria-checked={esOscuro}
        aria-label="Modo oscuro"
        onClick={toggleTheme}
        className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${
          esOscuro ? 'bg-action-primary-default' : 'bg-surface-secondary'
        }`}
      >
        <span
          className={`absolute left-0.5 top-0.5 h-6 w-6 rounded-full bg-surface-elevated shadow-sm transition-transform ${
            esOscuro ? 'translate-x-[20px]' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  )
}
