import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/features/auth/AuthProvider'
import { aplicarTema, resolverTemaInicial, THEME_STORAGE_KEY, type Theme } from './theme'

interface ThemeContextValue {
  theme: Theme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

/**
 * Preferencia de tema con memoria en tres niveles: `localStorage` (aplicación
 * inmediata y misma pestaña), evento `storage` (otra ventana del mismo
 * dispositivo) y `user_metadata` de Supabase cuando hay cuenta (otro
 * dispositivo, al iniciar sesión). El script inline de index.html ya aplicó
 * el `data-theme` correcto antes del primer paint — acá solo se sincroniza
 * el estado de React con eso.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const { session } = useAuth()
  const [theme, setThemeState] = useState<Theme>(resolverTemaInicial)
  const themeRef = useRef(theme)

  useEffect(() => {
    themeRef.current = theme
  }, [theme])

  const setTheme = useCallback(
    (next: Theme) => {
      aplicarTema(next)
      setThemeState(next)
      if (session) {
        // Best effort: si falla (sin conexión, etc.) el tema sigue funcionando
        // localmente y se reintenta solo la próxima vez que la persona lo cambie.
        supabase.auth.updateUser({ data: { theme: next } }).catch(() => {})
      }
    },
    [session],
  )

  const toggleTheme = useCallback(() => {
    setTheme(themeRef.current === 'dark' ? 'light' : 'dark')
  }, [setTheme])

  // Otra ventana/pestaña del mismo dispositivo cambió el tema.
  useEffect(() => {
    function onStorage(evento: StorageEvent) {
      if (evento.key !== THEME_STORAGE_KEY) return
      const nuevo = evento.newValue
      if ((nuevo === 'light' || nuevo === 'dark') && nuevo !== themeRef.current) {
        aplicarTema(nuevo)
        setThemeState(nuevo)
      }
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  // Otro dispositivo: al iniciar sesión, adoptar el tema guardado en la cuenta.
  useEffect(() => {
    const remoto = session?.user.user_metadata?.theme as Theme | undefined
    if ((remoto === 'light' || remoto === 'dark') && remoto !== themeRef.current) {
      aplicarTema(remoto)
      setThemeState(remoto)
    }
  }, [session])

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme debe usarse dentro de ThemeProvider')
  }
  return context
}
