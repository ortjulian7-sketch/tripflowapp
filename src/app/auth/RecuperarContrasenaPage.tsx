import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/Button'
import { Input } from '@/components/Input'
import { Logo } from '@/components/Logo'
import { useToast } from '@/components/Toast'
import { useAuth } from '@/features/auth/AuthProvider'

/** Pide el correo para disparar el email de recuperación de Supabase Auth (FR-002 a FR-004). */
export function RecuperarContrasenaPage() {
  const { resetPassword } = useAuth()
  const { showToast } = useToast()
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)

    if (!navigator.onLine) {
      setError('Este paso requiere conexión a internet.')
      return
    }

    setLoading(true)
    const { error: resetError } = await resetPassword(email)
    setLoading(false)

    if (resetError) {
      setError(resetError)
      return
    }

    showToast('Si el correo tiene una cuenta, te enviamos un enlace para recuperar tu contraseña.')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-background px-4">
      <div className="w-full max-w-sm">
        <div className="mb-4 flex justify-center">
          <Logo size="large" />
        </div>
        <p className="mb-6 text-center text-text-secondary">
          Ingresa tu correo y te enviamos un enlace para recuperar tu contraseña
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            type="text"
            label="Correo"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@correo.com"
            autoComplete="email"
            required
          />
          {error && (
            <p role="alert" className="text-sm text-status-error">
              {error}
            </p>
          )}
          <Button type="submit" size="large" loading={loading}>
            Enviar enlace
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-text-secondary">
          <Link to="/login" className="font-semibold text-text-brand transition-opacity hover:opacity-80">
            Volver a iniciar sesión
          </Link>
        </p>
      </div>
    </div>
  )
}
