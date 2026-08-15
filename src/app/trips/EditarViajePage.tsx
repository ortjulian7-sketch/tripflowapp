import { useEffect, useState, type FormEvent } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { useNavigate, useParams } from 'react-router-dom'
import { AmountInput } from '@/components/AmountInput'
import { Button } from '@/components/Button'
import { Input } from '@/components/Input'
import { useToast } from '@/components/Toast'
import { db } from '@/lib/db'
import { getCurrency } from '@/lib/currencies'
import { parseAmountInput, toEditableAmountString } from '@/lib/money'
import { actualizarViaje } from '@/features/trips/tripRepository'

interface FormErrors {
  nombre?: string
  destino?: string
  fechaSalida?: string
  fechaRegreso?: string
  presupuesto?: string
}

export function EditarViajePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const viaje = useLiveQuery(() => (id ? db.viajes.get(id) : undefined), [id])

  const [nombre, setNombre] = useState('')
  const [destino, setDestino] = useState('')
  const [fechaSalida, setFechaSalida] = useState('')
  const [fechaRegreso, setFechaRegreso] = useState('')
  const [presupuesto, setPresupuesto] = useState('')
  const [errors, setErrors] = useState<FormErrors>({})
  const [saving, setSaving] = useState(false)
  const [precargado, setPrecargado] = useState(false)

  useEffect(() => {
    if (!viaje || precargado) return
    const currency = getCurrency(viaje.moneda)
    setNombre(viaje.nombre)
    setDestino(viaje.destino)
    setFechaSalida(viaje.fecha_salida)
    setFechaRegreso(viaje.fecha_regreso ?? '')
    setPresupuesto(toEditableAmountString(viaje.presupuesto_total, currency.decimalDigits))
    setPrecargado(true)
  }, [viaje, precargado])

  if (!viaje || !precargado) {
    return <p className="text-text-secondary">Cargando…</p>
  }

  const currency = getCurrency(viaje.moneda)

  function handleFechaSalidaChange(value: string) {
    setFechaSalida(value)
    // Si la nueva salida deja obsoleta la fecha de regreso ya elegida, se
    // limpia en lugar de dejar seleccionable una combinación inconsistente.
    if (fechaRegreso && value && fechaRegreso < value) {
      setFechaRegreso('')
    }
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!viaje) return

    const nextErrors: FormErrors = {}
    if (!nombre.trim()) nextErrors.nombre = 'Ponle un nombre al viaje.'
    if (!destino.trim()) nextErrors.destino = 'Dinos a dónde vas.'
    if (!fechaSalida) nextErrors.fechaSalida = 'Elige la fecha de salida.'
    if (fechaRegreso && fechaSalida && fechaRegreso < fechaSalida) {
      nextErrors.fechaRegreso = 'La fecha de regreso no puede ser anterior a la de salida.'
    }

    const montoMinorUnits = parseAmountInput(presupuesto, currency.decimalDigits)
    if (montoMinorUnits === null) nextErrors.presupuesto = 'El presupuesto debe ser mayor a cero.'

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }

    setSaving(true)
    try {
      await actualizarViaje({
        id: viaje.id,
        nombre: nombre.trim(),
        destino: destino.trim(),
        fechaSalida,
        fechaRegreso: fechaRegreso || null,
        presupuestoTotal: montoMinorUnits!,
      })
      navigate('/', { replace: true })
      showToast('Cambios guardados.')
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'No pudimos guardar los cambios.', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-sm flex-col gap-6 py-6">
      <h1 className="text-xl font-semibold text-text-primary">Editar viaje</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <Input
            type="date"
            label="Fecha de salida"
            value={fechaSalida}
            onChange={(e) => handleFechaSalidaChange(e.target.value)}
            error={errors.fechaSalida}
          />
          <Input
            type="date"
            label="Fecha de regreso"
            min={fechaSalida || undefined}
            helperText="Opcional: déjalo vacío si todavía no lo sabes"
            value={fechaRegreso}
            onChange={(e) => setFechaRegreso(e.target.value)}
            error={errors.fechaRegreso}
          />
        </div>
        <Input
          type="text"
          label="Nombre del viaje"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          error={errors.nombre}
        />
        <Input
          type="text"
          label="Destino"
          value={destino}
          onChange={(e) => setDestino(e.target.value)}
          error={errors.destino}
        />
        <Input
          type="text"
          label="Moneda"
          value={`${currency.name} (${currency.code})`}
          disabled
          readOnly
          helperText="La moneda no se puede cambiar después de crear el viaje."
        />
        <AmountInput
          label="Presupuesto total"
          leadingText={currency.symbol}
          value={presupuesto}
          onChange={setPresupuesto}
          decimalDigits={currency.decimalDigits}
          error={errors.presupuesto}
        />
        <div className="flex gap-3">
          <Button type="button" variant="secondary" size="large" onClick={() => navigate('/')}>
            Cancelar
          </Button>
          <Button type="submit" size="large" loading={saving}>
            Guardar cambios
          </Button>
        </div>
      </form>
    </div>
  )
}
