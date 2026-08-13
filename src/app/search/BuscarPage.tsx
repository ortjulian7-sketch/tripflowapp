import { useState } from 'react'
import { Card } from '@/components/Card'
import { Input } from '@/components/Input'
import { ListItem } from '@/components/ListItem'
import { getCurrency } from '@/lib/currencies'
import { formatDateShort, parseDateOnly } from '@/lib/dates'
import { formatMoney } from '@/lib/money'
import { useIdentity } from '@/features/identity/IdentityProvider'
import { useSelectedTrip } from '@/features/trips/useSelectedTrip'
import { useCategories } from '@/features/categories/useCategories'
import { useExpenses } from '@/features/expenses/useExpenses'
import { filtrarPorRangoFechas, filtrarPorTexto } from '@/features/expenses/search'

export function BuscarPage() {
  const { userId } = useIdentity()
  const { viaje } = useSelectedTrip(userId)
  const categorias = useCategories(userId)
  const gastos = useExpenses(viaje?.id)

  const [texto, setTexto] = useState('')
  const [desde, setDesde] = useState('')
  const [hasta, setHasta] = useState('')

  if (!viaje) {
    return <p className="text-text-secondary">Creá un viaje para poder buscar gastos.</p>
  }

  const currency = getCurrency(viaje.moneda)
  const categoriaPorId = new Map((categorias ?? []).map((categoria) => [categoria.id, categoria]))

  const resultados = filtrarPorRangoFechas(
    filtrarPorTexto(gastos ?? [], categorias ?? [], texto),
    desde || null,
    hasta || null,
  )

  const hayFiltrosActivos = texto.trim() !== '' || desde !== '' || hasta !== ''

  function limpiarFiltros() {
    setTexto('')
    setDesde('')
    setHasta('')
  }

  return (
    <div className="mx-auto flex w-full max-w-sm flex-col gap-4 py-6">
      <h1 className="text-xl font-semibold text-text-primary">Buscar</h1>

      <Input
        type="text"
        label="Buscar"
        showLabel={false}
        leadingIcon="search"
        placeholder="Buscar por descripción o categoría"
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
      />

      <div className="grid grid-cols-2 gap-3">
        <Input type="date" label="Desde" value={desde} onChange={(e) => setDesde(e.target.value)} />
        <Input type="date" label="Hasta" value={hasta} onChange={(e) => setHasta(e.target.value)} />
      </div>

      {resultados.length === 0 ? (
        <Card variant="subtle" className="items-center gap-2 text-center text-text-secondary">
          <p>No encontramos gastos con esos filtros.</p>
          {hayFiltrosActivos && (
            <button
              type="button"
              onClick={limpiarFiltros}
              className="text-sm font-semibold text-text-brand"
            >
              Limpiar búsqueda
            </button>
          )}
        </Card>
      ) : (
        <div className="flex flex-col gap-1">
          {resultados.map((gasto) => {
            const categoria = categoriaPorId.get(gasto.categoria_id)
            return (
              <ListItem
                key={gasto.id}
                emoji={categoria?.emoji ?? '🗂️'}
                title={gasto.descripcion}
                subtitle={`${categoria?.nombre ?? 'Otro'} · ${formatDateShort(parseDateOnly(gasto.fecha))}`}
                amount={formatMoney(gasto.monto, currency)}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}
