import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon } from '@/components/Icon'
import { IconButton } from '@/components/IconButton'
import { ListItem } from '@/components/ListItem'
import type { Categoria, Gasto } from '@/lib/db'
import type { Currency } from '@/lib/currencies'
import { formatDateShort, parseDateOnly } from '@/lib/dates'
import { formatMoney } from '@/lib/money'
import { filtrarPorTexto } from '@/features/expenses/search'

interface SearchSpotlightProps {
  open: boolean
  onClose: () => void
  gastos: Gasto[]
  categorias: Categoria[]
  currency: Currency
}

/**
 * Búsqueda como overlay tipo spotlight sobre el propio Dashboard — nunca
 * navegación a otra pantalla. En escritorio flota cerca del top (estilo
 * Cmd+K); en móvil el input queda anclado arriba para que el teclado nunca
 * lo tape. Los resultados reusan la misma presentación que la lista de
 * gastos (ListItem), a la que esta búsqueda le da énfasis.
 */
export function SearchSpotlight({
  open,
  onClose,
  gastos,
  categorias,
  currency,
}: SearchSpotlightProps) {
  const navigate = useNavigate()
  const [texto, setTexto] = useState('')

  useEffect(() => {
    if (!open) setTexto('')
  }, [open])

  useEffect(() => {
    if (!open) return
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previousOverflow
    }
  }, [open, onClose])

  if (!open) return null

  const categoriaPorId = new Map(categorias.map((categoria) => [categoria.id, categoria]))
  const resultados = filtrarPorTexto(gastos, categorias, texto)

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Buscar gastos"
      className="fixed inset-0 z-50 flex justify-center bg-black/40 px-4 pt-4 backdrop-blur-sm md:pt-[12vh] dark:bg-black/60"
      onClick={onClose}
    >
      <div
        className="flex max-h-[70vh] w-full max-w-[560px] flex-col overflow-hidden rounded-card bg-surface-elevated shadow-md"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex shrink-0 items-center gap-2 border-b border-black/[0.06] px-4 py-3 dark:border-white/[0.06]">
          <Icon name="search" size={18} className="shrink-0 text-icon-secondary" />
          <input
            autoFocus
            type="text"
            value={texto}
            onChange={(event) => setTexto(event.target.value)}
            placeholder="Buscar gastos, categorías..."
            className="h-8 flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-placeholder focus:outline-none"
          />
          <IconButton
            icon="close"
            label="Cerrar búsqueda"
            variant="secondary"
            className="!h-8 !w-8 !shadow-none"
            onClick={onClose}
          />
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {gastos.length === 0 ? (
            <p className="px-2 py-6 text-center text-sm text-text-secondary">
              Todavía no registraste ningún gasto de este viaje.
            </p>
          ) : resultados.length === 0 ? (
            <p className="px-2 py-6 text-center text-sm text-text-secondary">
              No encontramos gastos con esos filtros.
            </p>
          ) : (
            resultados.map((gasto) => {
              const categoria = categoriaPorId.get(gasto.categoria_id)
              return (
                <ListItem
                  key={gasto.id}
                  emoji={categoria?.emoji ?? '🗂️'}
                  title={gasto.descripcion}
                  subtitle={`${categoria?.nombre ?? 'Otro'} · ${formatDateShort(parseDateOnly(gasto.fecha))}`}
                  amount={formatMoney(gasto.monto, currency)}
                  onClick={() => {
                    onClose()
                    navigate(`/gastos/${gasto.id}/editar`)
                  }}
                />
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
