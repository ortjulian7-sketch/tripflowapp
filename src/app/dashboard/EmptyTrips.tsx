import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/Button'
import { Icon } from '@/components/Icon'

/** Invita a crear el primer viaje (Figma node 213:2149 "EmptyNoTrip"). */
export function EmptyTrips() {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col items-center px-8 pb-12 pt-16 text-center">
      <div className="relative mb-3 flex size-24 items-center justify-center rounded-full bg-surface-secondary">
        <div className="pointer-events-none absolute inset-[-12px] rounded-full border border-[rgba(5,0,254,0.08)] dark:border-[rgba(165,168,255,0.12)]" />
        <div className="pointer-events-none absolute inset-[-24px] rounded-full border border-[rgba(5,0,254,0.04)] dark:border-[rgba(165,168,255,0.06)]" />
        <Icon name="pin" size={44} strokeWidth={1.1} className="text-icon-brand" />
      </div>
      <h2 className="font-brand text-[26px] font-semibold tracking-[-0.26px] text-text-primary">
        ¿A dónde vas?
      </h2>
      <p className="mb-6 mt-2.5 w-[260px] text-[15px] leading-6 text-text-secondary">
        Crea tu primer viaje para empezar a controlar tu presupuesto.
      </p>
      <Button icon="plus" onClick={() => navigate('/viajes/nuevo')}>
        Crear viaje
      </Button>
    </div>
  )
}
