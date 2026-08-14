import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/Button'
import { Logo } from '@/components/Logo'
import { useIdentity } from '@/features/identity/IdentityProvider'

/** Primera pantalla en un dispositivo sin identidad (FR-001): tres opciones con el mismo peso visual. */
export function BienvenidaPage() {
  const { establecerInvitado } = useIdentity()
  const navigate = useNavigate()

  function handleContinuarComoInvitado() {
    establecerInvitado()
    navigate('/onboarding/intro', { replace: true })
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-surface-background px-4">
      <div className="flex w-full max-w-sm flex-col gap-8">
        <div className="flex justify-center">
          <Logo size="large" />
        </div>

        <div className="flex flex-col gap-3">
          <Button variant="secondary" size="large" onClick={() => navigate('/login')}>
            Iniciar sesión
          </Button>
          <Button variant="secondary" size="large" onClick={() => navigate('/registro')}>
            Registrarse
          </Button>
          <Button variant="secondary" size="large" onClick={handleContinuarComoInvitado}>
            Continuar como invitado
          </Button>
        </div>
      </div>
    </div>
  )
}
