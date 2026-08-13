import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/Button'
import { Input } from '@/components/Input'
import { useAuth } from '@/features/auth/AuthProvider'
import { seedCategoriasIniciales } from '@/features/categories/seed'

/** Sin pantallas de valor previas (FR-002): registro es el primer paso del camino dorado. */
export function RegistroPage() {
  const { signUp } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setLoading(true)
    const { error: signUpError, userId } = await signUp(email, password)
    if (signUpError || !userId) {
      setError(signUpError ?? 'No pudimos crear tu cuenta. Intentá de nuevo.')
      setLoading(false)
      return
    }
    await seedCategoriasIniciales(userId)
    navigate('/onboarding/categorias', { replace: true })
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-background px-4">
      <div className="w-full max-w-sm">
        <h1 className="mb-1 text-center text-2xl font-semibold text-text-primary">Tripflow</h1>
        <p className="mb-6 text-center text-text-secondary">Creá tu cuenta para empezar</p>

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
          <Input
            type="text"
            secure
            label="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mínimo 6 caracteres"
            autoComplete="new-password"
            required
          />
          {error && (
            <p role="alert" className="text-sm text-status-error">
              {error}
            </p>
          )}
          <Button type="submit" size="large" loading={loading}>
            Crear cuenta
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-text-secondary">
          ¿Ya tenés cuenta?{' '}
          <Link to="/login" className="font-semibold text-text-brand">
            Iniciar sesión
          </Link>
        </p>
      </div>
    </div>
  )
}
