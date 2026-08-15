import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { AmountInput } from '@/components/AmountInput'
import { Button } from '@/components/Button'
import { Input } from '@/components/Input'
import { CURRENCIES, getCurrency } from '@/lib/currencies'
import { parseAmountInput } from '@/lib/money'
import { useIdentity } from '@/features/identity/IdentityProvider'
import { crearViaje } from '@/features/trips/tripRepository'
import { setSelectedTripId } from '@/features/trips/useSelectedTrip'
import { useTrips } from '@/features/trips/useTrips'

const MONEDA_OPTIONS = CURRENCIES.map((currency) => ({
  value: currency.code,
  label: `${currency.name} (${currency.code})`,
}))

interface FormErrors {
  nombre?: string
  destino?: string
  fechaSalida?: string
  fechaRegreso?: string
  moneda?: string
  presupuesto?: string
}

export function NuevoViajePage() {
  const { userId } = useIdentity()
  const navigate = useNavigate()
  const viajes = useTrips(userId ?? undefined)
  const esPrimerViaje = viajes?.length === 0

  const [nombre, setNombre] = useState('')
  const [destino, setDestino] = useState('')
  const [fechaSalida, setFechaSalida] = useState('')
  const [fechaRegreso, setFechaRegreso] = useState('')
  const [moneda, setMoneda] = useState('')
  const [presupuesto, setPresupuesto] = useState('')
  const [errors, setErrors] = useState<FormErrors>({})
  const [saving, setSaving] = useState(false)

  const decimalDigits = moneda ? getCurrency(moneda).decimalDigits : 2
  const simbolo = moneda ? getCurrency(moneda).symbol : undefined

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

    const nextErrors: FormErrors = {}
    if (!nombre.trim()) nextErrors.nombre = 'Ponle un nombre al viaje.'
    if (!destino.trim()) nextErrors.destino = 'Dinos a dónde vas.'
    if (!fechaSalida) nextErrors.fechaSalida = 'Elige la fecha de salida.'
    if (fechaRegreso && fechaSalida && fechaRegreso < fechaSalida) {
      nextErrors.fechaRegreso = 'La fecha de regreso no puede ser anterior a la de salida.'
    }
    if (!moneda) nextErrors.moneda = 'Elige una moneda.'

    const montoMinorUnits = parseAmountInput(presupuesto, decimalDigits)
    if (montoMinorUnits === null) {
      nextErrors.presupuesto = 'El presupuesto debe ser mayor a cero.'
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }

    setSaving(true)
    try {
      const viaje = await crearViaje({
        userId: userId!,
        nombre: nombre.trim(),
        destino: destino.trim(),
        fechaSalida,
        fechaRegreso: fechaRegreso || null,
        presupuestoTotal: montoMinorUnits!,
        moneda,
      })
      // El viaje recién creado pasa a ser el elegido a mano — si no, el
      // resumen podría seguir mostrando la elección previa (US "mostrar el
      // viaje recién creado").
      setSelectedTripId(viaje.id)
      navigate('/', { replace: true })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-sm flex-col gap-6 py-6">
      <div>
        <h1 className="mb-1 text-xl font-semibold text-text-primary">
          {esPrimerViaje ? 'Tu primer viaje' : 'Nuevo viaje'}
        </h1>
        <p className="text-text-secondary">
          Con presupuesto y moneda ya puedes empezar a registrar gastos.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3">
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
          placeholder="Vacaciones de verano"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          error={errors.nombre}
        />
        <Input
          type="text"
          label="Destino"
          placeholder="Bariloche"
          value={destino}
          onChange={(e) => setDestino(e.target.value)}
          error={errors.destino}
        />
        <Input
          type="select"
          label="Moneda"
          placeholder="Elige una moneda"
          options={MONEDA_OPTIONS}
          value={moneda}
          onChange={setMoneda}
          error={errors.moneda}
        />
        <AmountInput
          label="Presupuesto total"
          placeholder="0"
          leadingText={simbolo}
          value={presupuesto}
          onChange={setPresupuesto}
          decimalDigits={decimalDigits}
          error={errors.presupuesto}
        />
        <Button type="submit" size="large" loading={saving}>
          Crear viaje
        </Button>
      </form>
    </div>
  )
}
