import { useLiveQuery } from 'dexie-react-hooks'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/Button'
import { Chip } from '@/components/Chip'
import { db } from '@/lib/db'
import { useIdentity } from '@/features/identity/IdentityProvider'

/**
 * Onboarding reducido a una sola pantalla saltable con todo preseleccionado
 * (FR-003): las categorías ya se sembraron al arrancar, acá solo se
 * confirman y se avanza — "Continuar" no requiere ningún cambio.
 */
export function CategoriasOnboardingPage() {
  const { userId } = useIdentity()
  const navigate = useNavigate()

  const categorias = useLiveQuery(
    () => db.categorias.where('user_id').equals(userId).toArray(),
    [userId],
    [],
  )

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-surface-background px-4 py-10">
      <div className="w-full max-w-sm">
        <h1 className="mb-1 text-center text-2xl font-semibold text-text-primary">
          Tus categorías
        </h1>
        <p className="mb-6 text-center text-text-secondary">
          Empezamos con estas — después podés editarlas cuando quieras.
        </p>

        <div className="mb-8 grid grid-cols-4 gap-2">
          {categorias?.map((categoria) => (
            <Chip
              key={categoria.id}
              emoji={categoria.emoji}
              label={categoria.nombre}
              selected
              tabIndex={-1}
              className="cursor-default"
            />
          ))}
        </div>

        <Button size="large" onClick={() => navigate('/viajes/nuevo', { replace: true })}>
          Continuar
        </Button>
      </div>
    </div>
  )
}
