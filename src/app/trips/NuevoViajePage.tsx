import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/Button'
import { Input } from '@/components/Input'
import { CURRENCIES, getCurrency } from '@/lib/currencies'
import { parseAmountInput } from '@/lib/money'
import { useIdentity } from '@/features/identity/IdentityProvider'
import { crearViaje } from '@/features/trips/tripRepository'

const MONEDA_OPTIONS = CURRENCIES.map((currency) => ({
  value: currency.code,
  label: `${currency.name} (${currency.code})`,
}))

interface FormErrors {
  nombre?: string
  destino?: string
  fechaSalida?: string
  moneda?: string
  presupuesto?: string
}

export function NuevoViajePage() {
  const { userId } = useIdentity()
  const navigate = useNavigate()

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

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()

    const nextErrors: FormErrors = {}
    if (!nombre.trim()) nextErrors.nombre = 'Ponele un nombre al viaje.'
    if (!destino.trim()) nextErrors.destino = 'Decinos a dónde vas.'
    if (!fechaSalida) nextErrors.fechaSalida = 'Elegí la fecha de salida.'
    if (!moneda) nextErrors.moneda = 'Elegí una moneda.'

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
      await crearViaje({
        userId,
        nombre: nombre.trim(),
        destino: destino.trim(),
        fechaSalida,
        fechaRegreso: fechaRegreso || null,
        presupuestoTotal: montoMinorUnits!,
        moneda,
      })
      navigate('/', { replace: true })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-surface-background px-4 py-10">
      <div className="w-full max-w-sm">
        <h1 className="mb-1 text-center text-2xl font-semibold text-text-primary">
          Tu primer viaje
        </h1>
        <p className="mb-6 text-center text-text-secondary">
          Con presupuesto y moneda ya podés empezar a registrar gastos.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
          <div className="grid grid-cols-2 gap-3">
            <Input
              type="date"
              label="Fecha de salida"
              value={fechaSalida}
              onChange={(e) => setFechaSalida(e.target.value)}
              error={errors.fechaSalida}
            />
            <Input
              type="date"
              label="Fecha de regreso"
              helperText="Opcional: dejalo vacío si todavía no lo sabés"
              value={fechaRegreso}
              onChange={(e) => setFechaRegreso(e.target.value)}
            />
          </div>
          <Input
            type="select"
            label="Moneda"
            placeholder="Elegí una moneda"
            options={MONEDA_OPTIONS}
            value={moneda}
            onChange={setMoneda}
            error={errors.moneda}
          />
          <Input
            type="number"
            label="Presupuesto total"
            placeholder="0"
            leadingText={simbolo}
            value={presupuesto}
            onChange={(e) => setPresupuesto(e.target.value)}
            error={errors.presupuesto}
          />
          <Button type="submit" size="large" loading={saving}>
            Crear viaje
          </Button>
        </form>
      </div>
    </div>
  )
}
