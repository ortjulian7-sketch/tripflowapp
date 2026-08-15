import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/Button'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { Input } from '@/components/Input'
import { Logo } from '@/components/Logo'
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

/** Cuenta opcional (FR-002, FR-004): un paso voluntario para respaldar lo que ya se creó como invitado, no la entrada a la app. */
export function RegistroPage() {
  const { signUp } = useAuth()
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
    const { error: signUpError, userId: nuevoUserId } = await signUp(email, password)
    if (signUpError || !nuevoUserId) {
      setError(signUpError ?? 'No pudimos crear tu cuenta. Intenta de nuevo.')
      setLoading(false)
      return
    }

    if (identidadAnterior === nuevoUserId) {
      navigate('/onboarding/intro', { replace: true, state: { cuentaNueva: true } })
      return
    }

    const cantidadViajes = identidadAnterior ? await contarViajesLocales(identidadAnterior) : 0
    if (cantidadViajes === 0) {
      if (identidadAnterior) await incluirDatosLocales(identidadAnterior, nuevoUserId)
      setActiveIdentity(nuevoUserId)
      navigate('/onboarding/intro', { replace: true, state: { cuentaNueva: true } })
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
    navigate('/onboarding/intro', { replace: true, state: { cuentaNueva: true } })
  }

  async function confirmarDescartar() {
    if (!vinculacionPendiente) return
    setVinculando(true)
    await descartarDatosLocales(vinculacionPendiente.identidadAnterior)
    setActiveIdentity(vinculacionPendiente.nuevoUserId)
    navigate('/onboarding/intro', { replace: true, state: { cuentaNueva: true } })
  }

  function handleContinuarComoInvitado() {
    establecerInvitado()
    navigate('/onboarding/intro', { replace: true })
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-background px-4">
      <div className="w-full max-w-sm">
        <div className="mb-4 flex justify-center">
          <Logo size="large" />
        </div>
        <p className="mb-6 text-center text-text-secondary">
          Crea tu cuenta para respaldar tus viajes
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
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="font-semibold text-text-brand transition-opacity hover:opacity-80">
            Iniciar sesión
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
        description={`Tienes ${vinculacionPendiente?.cantidadViajes ?? 0} ${vinculacionPendiente?.cantidadViajes === 1 ? 'viaje guardado' : 'viajes guardados'} en este dispositivo. ¿Quieres incluirlos en tu cuenta nueva?`}
        confirmLabel="Incluir"
        cancelLabel="Descartar"
        onConfirm={confirmarIncluir}
        onCancel={confirmarDescartar}
        loading={vinculando}
      />
    </div>
  )
}
