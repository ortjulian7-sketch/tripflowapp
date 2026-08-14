import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Button } from '@/components/Button'
import { StepIndicator } from '@/components/StepIndicator'

interface PasoOnboardingIntro {
  ilustracion: string
  titulo: string
  subtitulo: string
  ctaLabel: string
}

const PASOS: PasoOnboardingIntro[] = [
  {
    ilustracion: '/icons/onboarding-plan.svg',
    titulo: 'Planeá menos. Viajá más.',
    subtitulo:
      'Tripflow te ayuda a controlar tu presupuesto en tiempo real para que solo pienses en disfrutar.',
    ctaLabel: 'Empezar',
  },
  {
    ilustracion: '/icons/onboarding-categories.svg',
    titulo: 'Ve exactamente dónde va tu dinero.',
    subtitulo:
      'Categorías visuales en tiempo real para que nunca pierdas el control del gasto.',
    ctaLabel: 'Siguiente',
  },
  {
    ilustracion: '/icons/onboarding-insights.svg',
    titulo: 'Insights que importan.',
    subtitulo:
      'Tripflow analiza tus patrones de gasto y te da contexto inteligente en el momento justo.',
    ctaLabel: 'Siguiente',
  },
  {
    ilustracion: '/icons/onboarding-ready.svg',
    titulo: 'Listo para tu próxima aventura.',
    subtitulo:
      'Crea tu primer viaje, define tu presupuesto y empieza a registrar gastos al instante.',
    ctaLabel: 'Seleccionar mis categorías',
  },
]

/**
 * Introducción de 4 pasos antes de la selección de categorías (FR-001 a
 * FR-003). El CTA del último paso reenvía `cuentaNueva` tal cual lo recibió
 * — perderlo rompe el gate de `Bootstrap()` (contracts/onboarding-intro-gate-contract.md).
 */
export function IntroOnboardingPage() {
  const [paso, setPaso] = useState(0)
  const navigate = useNavigate()
  const location = useLocation()
  const cuentaNueva = (location.state as { cuentaNueva?: boolean } | null)?.cuentaNueva

  const esUltimoPaso = paso === PASOS.length - 1
  const pasoActual = PASOS[paso]

  function irACategorias() {
    navigate('/onboarding/categorias', { replace: true, state: { cuentaNueva } })
  }

  function handleCta() {
    if (esUltimoPaso) {
      irACategorias()
      return
    }
    setPaso(paso + 1)
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-surface-background px-4">
      <div className="flex w-full max-w-sm flex-col items-center">
        <div className="mb-4 flex w-full justify-end">
          {!esUltimoPaso && (
            <button
              type="button"
              onClick={irACategorias}
              className="font-semibold text-text-secondary transition-opacity hover:opacity-80"
            >
              Saltar
            </button>
          )}
        </div>

        <img src={pasoActual.ilustracion} alt="" className="mb-8 h-[140px] w-[140px]" />

        <h1 className="font-brand mb-3 text-center text-[34px] font-semibold text-text-primary">
          {pasoActual.titulo}
        </h1>
        <p className="mb-8 text-center text-text-secondary">{pasoActual.subtitulo}</p>

        <div className="mb-8">
          <StepIndicator total={PASOS.length} activo={paso} />
        </div>

        <Button variant="primary" size="large" onClick={handleCta}>
          {pasoActual.ctaLabel}
        </Button>
      </div>
    </div>
  )
}
