import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/Button'
import { Input } from '@/components/Input'
import { useAuth } from '@/features/auth/AuthProvider'

export function LoginPage() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setLoading(true)
    const { error: signInError } = await signIn(email, password)
    if (signInError) {
      setError(signInError)
      setLoading(false)
      return
    }
    navigate('/', { replace: true })
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-background px-4">
      <div className="w-full max-w-sm">
        <h1 className="mb-1 text-center text-2xl font-semibold text-text-primary">Tripflow</h1>
        <p className="mb-6 text-center text-text-secondary">Iniciá sesión para continuar</p>

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
            placeholder="Tu contraseña"
            autoComplete="current-password"
            required
          />
          {error && (
            <p role="alert" className="text-sm text-status-error">
              {error}
            </p>
          )}
          <Button type="submit" size="large" loading={loading}>
            Iniciar sesión
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-text-secondary">
          ¿No tenés cuenta?{' '}
          <Link to="/registro" className="font-semibold text-text-brand">
            Crear cuenta
          </Link>
        </p>
      </div>
    </div>
  )
}
