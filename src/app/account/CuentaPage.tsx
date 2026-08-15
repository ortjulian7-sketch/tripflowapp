import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/Button'
import { Card } from '@/components/Card'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { ListItem } from '@/components/ListItem'
import { ThemeToggle } from '@/components/ThemeToggle'
import { db } from '@/lib/db'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/features/auth/AuthProvider'
import { useIdentity } from '@/features/identity/IdentityProvider'
import { setActiveIdentity } from '@/features/identity/activeIdentity'

export function CuentaPage() {
  const { session, signOut } = useAuth()
  const { userId, isGuest } = useIdentity()
  const navigate = useNavigate()
  const [confirmando, setConfirmando] = useState(false)
  const [eliminando, setEliminando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function confirmarEliminacion() {
    setEliminando(true)
    setError(null)
    try {
      const { error: fnError } = await supabase.functions.invoke('delete-account')
      if (fnError) {
        setError('No pudimos eliminar tu cuenta. Intentá de nuevo.')
        setEliminando(false)
        return
      }
      // Limpieza completa de IndexedDB y cierre de sesión: no queda ningún
      // dato de la cuenta en el dispositivo (FR-056).
      await db.delete()
      await signOut()
      window.location.assign('/login')
    } catch {
      setError('No pudimos eliminar tu cuenta. Intentá de nuevo.')
      setEliminando(false)
    }
  }

  /** Congela la identidad activa en la cuenta antes de cerrar sesión: el dispositivo sigue usándose como invitado con los mismos datos (FR-015). */
  async function handleCerrarSesion() {
    setActiveIdentity(userId!)
    await signOut()
  }

  if (isGuest) {
    return (
      <div className="mx-auto flex w-full max-w-sm flex-col gap-6 py-6">
        <h1 className="text-xl font-semibold text-text-primary">Cuenta</h1>

        <Card variant="subtle" className="gap-3">
          <p className="text-sm text-text-secondary">
            Estás usando Tripflow sin cuenta: tus viajes y gastos se guardan en este dispositivo.
            Creá una cuenta cuando quieras respaldarlos y acceder desde otro dispositivo.
          </p>
          <Button onClick={() => navigate('/registro')}>Crear cuenta o iniciar sesión</Button>
        </Card>

        <ListItem emoji="🗂️" title="Categorías" onClick={() => navigate('/categorias')} />
        <ThemeToggle />
      </div>
    )
  }

  return (
    <div className="mx-auto flex w-full max-w-sm flex-col gap-6 py-6">
      <h1 className="text-xl font-semibold text-text-primary">Cuenta</h1>
      <p className="text-sm text-text-secondary">{session?.user.email}</p>

      <ListItem emoji="🗂️" title="Categorías" onClick={() => navigate('/categorias')} />
      <ThemeToggle />

      <Button variant="secondary" onClick={handleCerrarSesion}>
        Cerrar sesión
      </Button>

      <div className="rounded-card border border-status-error-border bg-status-error-subtle p-card-padding">
        <h2 className="mb-1 font-semibold text-status-error">Eliminar cuenta</h2>
        <p className="mb-3 text-sm text-status-error">
          Esta acción es permanente e irreversible: se borran todos tus viajes, gastos y
          categorías, tanto de este dispositivo como de la copia sincronizada.
        </p>
        <Button variant="danger" onClick={() => setConfirmando(true)}>
          Eliminar mi cuenta
        </Button>
      </div>

      {error && (
        <p role="alert" className="text-sm text-status-error">
          {error}
        </p>
      )}

      <ConfirmDialog
        open={confirmando}
        title="Eliminar cuenta"
        description="Esta acción es permanente e irreversible. Se borrará todo: tus viajes, gastos y categorías. No se puede deshacer."
        confirmLabel="Sí, eliminar mi cuenta"
        onCancel={() => setConfirmando(false)}
        onConfirm={confirmarEliminacion}
        loading={eliminando}
      />
    </div>
  )
}
