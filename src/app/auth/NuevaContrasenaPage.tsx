import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/Button'
import { Input } from '@/components/Input'
import { Logo } from '@/components/Logo'
import { useToast } from '@/components/Toast'
import { useAuth } from '@/features/auth/AuthProvider'
import { supabase } from '@/lib/supabase'

type Estado = 'esperando' | 'invalido' | 'listo'

const TIMEOUT_ESPERA_MS = 5000

/** Establece la contraseña nueva desde el enlace de recuperación (FR-005 a FR-008). */
export function NuevaContrasenaPage() {
  const { updatePassword, signOut } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const [estado, setEstado] = useState<Estado>('esperando')
  const [password, setPassword] = useState('')
  const [confirmacion, setConfirmacion] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.replace(/^#/, ''))
    if (params.get('error')) {
      setEstado('invalido')
      return
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setEstado('listo')
    })

    const timeout = setTimeout(() => {
      setEstado((actual) => (actual === 'esperando' ? 'invalido' : actual))
    }, TIMEOUT_ESPERA_MS)

    return () => {
      subscription.unsubscribe()
      clearTimeout(timeout)
    }
  }, [])

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)

    if (!navigator.onLine) {
      setError('Este paso requiere conexión a internet.')
      return
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.')
      return
    }

    if (password !== confirmacion) {
      setError('Las contraseñas no coinciden.')
      return
    }

    setLoading(true)
    const { error: updateError } = await updatePassword(password)
    if (updateError) {
      setError(updateError)
      setLoading(false)
      return
    }

    await signOut()
    navigate('/login', { replace: true })
    showToast('Tu contraseña se actualizó. Ya puedes iniciar sesión con ella.')
  }

  if (estado !== 'listo') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface-background px-4">
        <div className="w-full max-w-sm text-center">
          <div className="mb-4 flex justify-center">
            <Logo size="large" />
          </div>
          {estado === 'invalido' ? (
            <>
              <p className="mb-6 text-text-secondary">
                Este enlace ya venció o ya se usó. Pide uno nuevo para continuar.
              </p>
              <Link
                to="/recuperar-contrasena"
                className="font-semibold text-text-brand transition-opacity hover:opacity-80"
              >
                Pedir un enlace nuevo
              </Link>
            </>
          ) : (
            <p className="text-text-secondary">Verificando tu enlace…</p>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-background px-4">
      <div className="w-full max-w-sm">
        <div className="mb-4 flex justify-center">
          <Logo size="large" />
        </div>
        <p className="mb-6 text-center text-text-secondary">Ingresa tu contraseña nueva</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            type="text"
            secure
            label="Contraseña nueva"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mínimo 6 caracteres"
            autoComplete="new-password"
            required
          />
          <Input
            type="text"
            secure
            label="Confirmar contraseña"
            value={confirmacion}
            onChange={(e) => setConfirmacion(e.target.value)}
            placeholder="Repite tu contraseña"
            autoComplete="new-password"
            required
          />
          {error && (
            <p role="alert" className="text-sm text-status-error">
              {error}
            </p>
          )}
          <Button type="submit" size="large" loading={loading}>
            Guardar contraseña
          </Button>
        </form>
      </div>
    </div>
  )
}
