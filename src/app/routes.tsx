import { useLiveQuery } from 'dexie-react-hooks'
import { Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom'
import { useAuth } from '@/features/auth/AuthProvider'
import { useIdentity } from '@/features/identity/IdentityProvider'
import { db } from '@/lib/db'
import { AppShell } from './AppShell'
import { BienvenidaPage } from './bienvenida/BienvenidaPage'
import { RegistroPage } from './auth/RegistroPage'
import { LoginPage } from './auth/LoginPage'
import { CategoriasOnboardingPage } from './onboarding/CategoriasOnboardingPage'
import { NuevoViajePage } from './trips/NuevoViajePage'
import { EditarViajePage } from './trips/EditarViajePage'
import { DashboardPage } from './dashboard/DashboardPage'
import { GastoFormPage } from './expenses/GastoFormPage'
import { CategoriasPage } from './categories/CategoriasPage'
import { CuentaPage } from './account/CuentaPage'

function Cargando() {
  return <div className="flex min-h-screen items-center justify-center text-text-secondary">Cargando…</div>
}

/**
 * Con o sin cuenta hay acceso (FR-001, FR-002): redirige a onboarding
 * mientras la identidad activa no tenga ninguna categoría y corresponda
 * ofrecer el paso de selección — así el resto de la app queda accesible
 * tanto para invitados como para personas con sesión. Nunca siembra nada
 * (contracts/onboarding-categorias-contract.md): la única vía para que el
 * conteo deje de ser cero es que la persona confirme su elección en
 * `CategoriasOnboardingPage`, o que el `pull` de `useSync` traiga las
 * remotas de una cuenta preexistente.
 *
 * `cuentaNueva` (pasado por `RegistroPage` en `location.state`) distingue una
 * cuenta recién creada —que sí necesita onboarding con conteo cero— de una
 * cuenta preexistente que inicia sesión, donde conteo cero siempre significa
 * "esperando el pull" (research.md §3).
 */
function Bootstrap() {
  const { userId, isGuest, loading } = useIdentity()
  const location = useLocation()
  const categorias = useLiveQuery(
    () => db.categorias.where('user_id').equals(userId!).toArray(),
    [userId],
  )

  if (loading || categorias === undefined) return <Cargando />

  const necesitaOnboarding =
    categorias.length === 0 && (isGuest || Boolean(location.state?.cuentaNueva))

  if (necesitaOnboarding) {
    if (location.pathname === '/onboarding/categorias') return <Outlet />
    return (
      <Navigate to="/onboarding/categorias" replace state={{ cuentaNueva: !isGuest }} />
    )
  }
  // Conteo en cero sin necesitar onboarding: cuenta preexistente con un
  // `pull` todavía en curso — esperar en vez de redirigir.
  if (categorias.length === 0) return <Cargando />
  return <Outlet />
}

function RedirectIfAuth() {
  const { session, loading } = useAuth()
  if (loading) return <Cargando />
  if (session) return <Navigate to="/" replace />
  return <Outlet />
}

/** Redirige a Bienvenida mientras no exista ninguna identidad establecida (contracts/entrada-gate-contract.md). */
function EntradaGate() {
  const { userId, loading } = useIdentity()
  if (loading) return <Cargando />
  if (userId === null) return <Navigate to="/bienvenida" replace />
  return <Outlet />
}

/**
 * El encadenado registro → categorías → nuevo viaje → resumen (FR-002) lo
 * maneja cada pantalla navegando explícitamente al siguiente paso al
 * completar su acción — acá solo se define a qué URL corresponde cada una.
 */
export function AppRoutes() {
  return (
    <Routes>
      <Route element={<RedirectIfAuth />}>
        <Route path="/bienvenida" element={<BienvenidaPage />} />
        <Route path="/registro" element={<RegistroPage />} />
        <Route path="/login" element={<LoginPage />} />
      </Route>

      <Route element={<EntradaGate />}>
        <Route element={<Bootstrap />}>
          <Route path="/onboarding/categorias" element={<CategoriasOnboardingPage />} />

          <Route element={<AppShell />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/gastos/nuevo" element={<GastoFormPage />} />
            <Route path="/gastos/:id/editar" element={<GastoFormPage />} />
            <Route path="/categorias" element={<CategoriasPage />} />
            <Route path="/viajes/nuevo" element={<NuevoViajePage />} />
            <Route path="/viajes/:id/editar" element={<EditarViajePage />} />
            <Route path="/cuenta" element={<CuentaPage />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
