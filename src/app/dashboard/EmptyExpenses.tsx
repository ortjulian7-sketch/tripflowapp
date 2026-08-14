import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/Button'
import { Icon } from '@/components/Icon'

/** Invita a registrar el primer gasto del viaje (FR-044, Figma node 213:2445 "EmptyNoExpenses"). */
export function EmptyExpenses() {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col items-center px-8 pb-8 pt-4 text-center">
      <div className="relative mb-3 flex size-20 items-center justify-center rounded-[22px] bg-surface-secondary">
        <div className="pointer-events-none absolute inset-[-10px] rounded-[30px] border border-[rgba(5,0,254,0.07)] dark:border-[rgba(165,168,255,0.1)]" />
        <Icon name="card" size={36} strokeWidth={1.1} className="text-icon-brand" />
      </div>
      <h2 className="font-brand text-[22px] font-semibold tracking-[-0.22px] text-text-primary">
        Sin gastos aún
      </h2>
      <p className="mb-5 mt-1.5 w-[240px] text-sm leading-[22.4px] text-text-secondary">
        Registra tu primer gasto y empieza a ver cómo fluye tu presupuesto.
      </p>
      <Button icon="plus" onClick={() => navigate('/gastos/nuevo')}>
        Registrar gasto
      </Button>
    </div>
  )
}
