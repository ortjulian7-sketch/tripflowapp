import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/Button'
import { Chip } from '@/components/Chip'
import { useIdentity } from '@/features/identity/IdentityProvider'
import { CATEGORIAS_CANDIDATAS, guardarSeleccionInicial } from '@/features/categories/seed'

/**
 * Selección deliberada del onboarding (FR-012 a FR-014): catálogo candidato
 * en memoria, nada seleccionado por defecto, cada toque solo cambia estado
 * local hasta que "Continuar" persiste la elección.
 */
export function CategoriasOnboardingPage() {
  const { userId } = useIdentity()
  const navigate = useNavigate()
  const [seleccion, setSeleccion] = useState<Set<string>>(new Set())
  const [guardando, setGuardando] = useState(false)

  function alternarSeleccion(nombre: string) {
    setSeleccion((actual) => {
      const siguiente = new Set(actual)
      if (siguiente.has(nombre)) siguiente.delete(nombre)
      else siguiente.add(nombre)
      return siguiente
    })
  }

  async function handleContinuar() {
    setGuardando(true)
    await guardarSeleccionInicial(userId!, seleccion)
    navigate('/viajes/nuevo', { replace: true })
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-surface-background px-4 py-10">
      <div className="w-full max-w-sm">
        <h1 className="mb-1 text-center text-2xl font-semibold text-text-primary">
          Tus categorías
        </h1>
        <p className="mb-6 text-center text-text-secondary">
          Elige las que quieras usar — después puedes crear más desde Cuenta.
        </p>

        <div className="mb-8 grid grid-cols-4 gap-2">
          {CATEGORIAS_CANDIDATAS.map((categoria) => (
            <Chip
              key={categoria.nombre}
              emoji={categoria.emoji}
              label={categoria.nombre}
              selected={seleccion.has(categoria.nombre)}
              onClick={() => alternarSeleccion(categoria.nombre)}
            />
          ))}
        </div>

        <Button size="large" loading={guardando} onClick={handleContinuar}>
          Continuar
        </Button>
      </div>
    </div>
  )
}
