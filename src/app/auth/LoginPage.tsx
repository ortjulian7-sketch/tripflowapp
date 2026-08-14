import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/Button'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { Input } from '@/components/Input'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/features/auth/AuthProvider'
import { useIdentity } from '@/features/identity/IdentityProvider'
import { setActiveIdentity } from '@/features/identity/activeIdentity'
import {
  contarViajesLocales,
  descartarDatosLocales,
  incluirDatosLocales,
} from '@/features/identity/linkGuestData'

interface VinculacionPendiente {
  identidadAnterior: string
  nuevoUserId: string
  cantidadViajes: number
}

export function LoginPage() {
  const { signIn } = useAuth()
  const { userId: identidadActiva, establecerInvitado } = useIdentity()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [vinculacionPendiente, setVinculacionPendiente] = useState<VinculacionPendiente | null>(
    null,
  )
  const [vinculando, setVinculando] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)

    if (!navigator.onLine) {
      setError('Este paso requiere conexión a internet.')
      return
    }

    setLoading(true)
    const identidadAnterior = identidadActiva
    const { error: signInError } = await signIn(email, password)
    if (signInError) {
      setError(signInError)
      setLoading(false)
      return
    }

    const { data } = await supabase.auth.getUser()
    const nuevoUserId = data.user?.id
    if (!nuevoUserId || identidadAnterior === nuevoUserId) {
      navigate('/', { replace: true })
      return
    }

    const cantidadViajes = identidadAnterior ? await contarViajesLocales(identidadAnterior) : 0
    if (cantidadViajes === 0) {
      if (identidadAnterior) await incluirDatosLocales(identidadAnterior, nuevoUserId)
      setActiveIdentity(nuevoUserId)
      navigate('/', { replace: true })
      return
    }

    setLoading(false)
    setVinculacionPendiente({ identidadAnterior: identidadAnterior!, nuevoUserId, cantidadViajes })
  }

  async function confirmarIncluir() {
    if (!vinculacionPendiente) return
    setVinculando(true)
    await incluirDatosLocales(vinculacionPendiente.identidadAnterior, vinculacionPendiente.nuevoUserId)
    setActiveIdentity(vinculacionPendiente.nuevoUserId)
    navigate('/', { replace: true })
  }

  async function confirmarDescartar() {
    if (!vinculacionPendiente) return
    setVinculando(true)
    await descartarDatosLocales(vinculacionPendiente.identidadAnterior)
    setActiveIdentity(vinculacionPendiente.nuevoUserId)
    navigate('/', { replace: true })
  }

  function handleContinuarComoInvitado() {
    establecerInvitado()
    navigate('/onboarding/intro', { replace: true })
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
          <Link to="/registro" className="font-semibold text-text-brand transition-opacity hover:opacity-80">
            Crear cuenta
          </Link>
        </p>
        <p className="mt-2 text-center text-sm text-text-secondary">
          <button
            type="button"
            onClick={handleContinuarComoInvitado}
            className="font-semibold text-text-brand transition-opacity hover:opacity-80"
          >
            Continuar como invitado
          </button>
        </p>
      </div>

      <ConfirmDialog
        open={vinculacionPendiente !== null}
        tone="neutral"
        title="Viajes guardados en este dispositivo"
        description={`Tenés ${vinculacionPendiente?.cantidadViajes ?? 0} ${vinculacionPendiente?.cantidadViajes === 1 ? 'viaje guardado' : 'viajes guardados'} en este dispositivo. ¿Querés incluirlos en tu cuenta?`}
        confirmLabel="Incluir"
        cancelLabel="Descartar"
        onConfirm={confirmarIncluir}
        onCancel={confirmarDescartar}
        loading={vinculando}
      />
    </div>
  )
}
