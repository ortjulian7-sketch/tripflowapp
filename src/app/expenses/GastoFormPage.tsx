import { useEffect, useState, type FormEvent } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { useNavigate, useParams } from 'react-router-dom'
import { AmountInput } from '@/components/AmountInput'
import { Button } from '@/components/Button'
import { Chip } from '@/components/Chip'
import { Input } from '@/components/Input'
import { db } from '@/lib/db'
import { getCurrency } from '@/lib/currencies'
import { toDateOnlyString, today } from '@/lib/dates'
import { parseAmountInput, toEditableAmountString } from '@/lib/money'
import { useIdentity } from '@/features/identity/IdentityProvider'
import { useSelectedTrip } from '@/features/trips/useSelectedTrip'
import { useCategories } from '@/features/categories/useCategories'
import { useLearnedAssociations } from '@/features/categorization/useLearnedAssociations'
import { sugerirCategoria } from '@/features/categorization/suggest'
import { registrarCorreccion } from '@/features/categorization/learn'
import { actualizarGasto, crearGasto } from '@/features/expenses/expenseRepository'
import { NuevaCategoriaModal } from './NuevaCategoriaModal'

interface FormErrors {
  monto?: string
  descripcion?: string
  categoria?: string
}

/** Pantalla única para crear un gasto y para editarlo (FR-018): mismos campos, mismo orden. */
export function GastoFormPage() {
  const { id } = useParams<{ id: string }>()
  const isEditing = !!id
  const { userId } = useIdentity()
  const navigate = useNavigate()

  const gastoExistente = useLiveQuery(() => (id ? db.gastos.get(id) : undefined), [id])
  const { viaje: viajeSeleccionado } = useSelectedTrip(userId!)
  const tripIdDelGasto = gastoExistente?.trip_id
  const viajeDelGasto = useLiveQuery(
    () => (tripIdDelGasto ? db.viajes.get(tripIdDelGasto) : undefined),
    [tripIdDelGasto],
  )
  const viaje = isEditing ? viajeDelGasto : viajeSeleccionado

  const categorias = useCategories(userId!)
  const asociaciones = useLearnedAssociations(userId!)

  const [monto, setMonto] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [categoriaId, setCategoriaId] = useState<string | null>(null)
  // Al editar, la categoría guardada se trata como elección manual desde el
  // inicio: corregir la descripción no debe reemplazarla (FR-024).
  const [categoriaElegidaManualmente, setCategoriaElegidaManualmente] = useState(isEditing)
  const [fecha, setFecha] = useState(toDateOnlyString(today()))
  const [errors, setErrors] = useState<FormErrors>({})
  const [saving, setSaving] = useState(false)
  const [precargado, setPrecargado] = useState(false)
  const [modalCategoriaAbierto, setModalCategoriaAbierto] = useState(false)

  useEffect(() => {
    if (!isEditing || !gastoExistente || !viajeDelGasto || precargado) return
    const currency = getCurrency(viajeDelGasto.moneda)
    setMonto(toEditableAmountString(gastoExistente.monto, currency.decimalDigits))
    setDescripcion(gastoExistente.descripcion)
    setCategoriaId(gastoExistente.categoria_id)
    setFecha(gastoExistente.fecha)
    setPrecargado(true)
  }, [isEditing, gastoExistente, viajeDelGasto, precargado])

  // Preselección automática (FR-021), solo al crear: se detiene apenas la
  // persona toca una categoría a mano (FR-024).
  useEffect(() => {
    if (isEditing || categoriaElegidaManualmente || !categorias || !asociaciones) return
    const sugerida = sugerirCategoria(descripcion, categorias, asociaciones)
    setCategoriaId(sugerida?.id ?? null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [descripcion, categorias, asociaciones, isEditing])

  if (isEditing && !precargado) {
    return <p className="text-text-secondary">Cargando…</p>
  }

  if (!viaje) {
    return <p className="text-text-secondary">Crea un viaje antes de registrar un gasto.</p>
  }

  const currency = getCurrency(viaje.moneda)

  function handleSelectCategoria(categoriaIdSeleccionada: string) {
    setCategoriaId(categoriaIdSeleccionada)
    setCategoriaElegidaManualmente(true)
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!viaje) return

    const nextErrors: FormErrors = {}
    const montoMinorUnits = parseAmountInput(monto, currency.decimalDigits)
    if (montoMinorUnits === null) nextErrors.monto = 'Ingresa un monto mayor a cero.'
    if (!descripcion.trim()) nextErrors.descripcion = 'Cuéntanos en qué gastaste.'
    if (!categoriaId) nextErrors.categoria = 'Elige una categoría.'

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }

    setSaving(true)
    try {
      if (isEditing && id) {
        await actualizarGasto({
          id,
          categoriaId: categoriaId!,
          monto: montoMinorUnits!,
          descripcion,
          fecha,
          categoriaElegidaManualmente,
        })
      } else {
        await crearGasto({
          tripId: viaje.id,
          categoriaId: categoriaId!,
          monto: montoMinorUnits!,
          descripcion,
          fecha,
          categoriaElegidaManualmente,
        })
      }
      if (categoriaElegidaManualmente) {
        await registrarCorreccion(userId!, descripcion, categoriaId!)
      }
      navigate('/', { replace: true })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-sm flex-col gap-6 py-6">
      <h1 className="text-xl font-semibold text-text-primary">
        {isEditing ? 'Editar gasto' : 'Nuevo gasto'}
      </h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <AmountInput
          label="Monto"
          placeholder="0"
          leadingText={currency.symbol}
          value={monto}
          onChange={setMonto}
          decimalDigits={currency.decimalDigits}
          error={errors.monto}
        />
        <Input
          type="text"
          label="Descripción"
          placeholder="¿En qué gastaste?"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          error={errors.descripcion}
        />

        <div>
          <p className="mb-1.5 text-[11px] font-semibold text-text-secondary">Categoría</p>
          <div className="grid grid-cols-4 gap-2">
            {categorias?.map((categoria) => (
              <Chip
                key={categoria.id}
                emoji={categoria.emoji}
                label={categoria.nombre}
                selected={categoriaId === categoria.id}
                onClick={() => handleSelectCategoria(categoria.id)}
              />
            ))}
            <Chip
              emoji="➕"
              label="Nueva"
              onClick={() => setModalCategoriaAbierto(true)}
            />
          </div>
          {errors.categoria && <p className="mt-1.5 text-xs text-status-error">{errors.categoria}</p>}
        </div>

        <Input type="date" label="Fecha" value={fecha} onChange={(e) => setFecha(e.target.value)} />

        <div className="flex gap-3">
          <Button type="button" variant="secondary" size="large" onClick={() => navigate('/')}>
            Cancelar
          </Button>
          <Button type="submit" size="large" loading={saving}>
            {isEditing ? 'Actualizar gasto' : 'Crear gasto'}
          </Button>
        </div>
      </form>

      <NuevaCategoriaModal
        open={modalCategoriaAbierto}
        userId={userId!}
        onClose={() => setModalCategoriaAbierto(false)}
        onCreada={(categoria) => {
          handleSelectCategoria(categoria.id)
          setModalCategoriaAbierto(false)
        }}
      />
    </div>
  )
}
