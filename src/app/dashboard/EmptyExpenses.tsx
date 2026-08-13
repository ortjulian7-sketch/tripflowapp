import { Card } from '@/components/Card'

/** Invita a registrar el primer gasto del viaje (FR-044). */
export function EmptyExpenses() {
  return (
    <Card variant="subtle" className="items-center text-center text-text-secondary">
      Todavía no registraste ningún gasto de este viaje. Tocá el botón + para agregar el primero.
    </Card>
  )
}
