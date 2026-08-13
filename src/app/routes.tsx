import { useEffect, useRef } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom'
import { useAuth } from '@/features/auth/AuthProvider'
import { useIdentity } from '@/features/identity/IdentityProvider'
import { seedCategoriasIniciales } from '@/features/categories/seed'
import { db } from '@/lib/db'
import { AppShell } from './AppShell'
import { RegistroPage } from './auth/RegistroPage'
import { LoginPage } from './auth/LoginPage'
import { CategoriasOnboardingPage } from './onboarding/CategoriasOnboardingPage'
import { NuevoViajePage } from './trips/NuevoViajePage'
import { EditarViajePage } from './trips/EditarViajePage'
import { DashboardPage } from './dashboard/DashboardPage'
import { GastoFormPage } from './expenses/GastoFormPage'
import { BuscarPage } from './search/BuscarPage'
import { CategoriasPage } from './categories/CategoriasPage'
import { CuentaPage } from './account/CuentaPage'

function Cargando() {
  return <div className="flex min-h-screen items-center justify-center text-text-secondary">Cargando…</div>
}

/**
 * Con o sin cuenta hay acceso (FR-001, FR-002): siembra categorías la
 * primera vez que una identidad invitada no tiene ninguna, y redirige a
 * onboarding mientras el conteo siga en cero — así el resto de la app queda
 * accesible tanto para invitados como para personas con sesión.
 *
 * Solo siembra para invitados: con sesión, un conteo en cero significa que
 * el `pull` de `useSync` todavía no trajo las categorías ya existentes de la
 * cuenta (o, tras vincular, la vinculación ya se encargó del conteo) — sembrar
 * acá crearía un set de categorías duplicado que se subiría a Supabase antes
 * de que el pull llegue a compararlo (research.md §3, FR-012).
 */
function Bootstrap() {
  const { userId, isGuest, loading } = useIdentity()
  const location = useLocation()
  const categorias = useLiveQuery(
    () => db.categorias.where('user_id').equals(userId).toArray(),
    [userId],
  )
  const sembrando = useRef(false)

  useEffect(() => {
    if (!isGuest || categorias === undefined || categorias.length > 0 || sembrando.current) return
    sembrando.current = true
    seedCategoriasIniciales(userId)
  }, [isGuest, categorias, userId])

  if (loading || categorias === undefined) return <Cargando />
  if (isGuest && categorias.length === 0) {
    if (location.pathname === '/onboarding/categorias') return <Cargando />
    return <Navigate to="/onboarding/categorias" replace />
  }
  // Con sesión, un conteo en cero es un pull todavía en curso (o recién
  // vinculado): esperar en vez de redirigir a onboarding evita mandar a
  // alguien con cuenta ya existente por el camino de "primera vez".
  if (categorias.length === 0) return <Cargando />
  return <Outlet />
}

function RedirectIfAuth() {
  const { session, loading } = useAuth()
  if (loading) return <Cargando />
  if (session) return <Navigate to="/" replace />
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
        <Route path="/registro" element={<RegistroPage />} />
        <Route path="/login" element={<LoginPage />} />
      </Route>

      <Route element={<Bootstrap />}>
        <Route path="/onboarding/categorias" element={<CategoriasOnboardingPage />} />
        <Route path="/viajes/nuevo" element={<NuevoViajePage />} />

        <Route element={<AppShell />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/gastos/nuevo" element={<GastoFormPage />} />
          <Route path="/gastos/:id/editar" element={<GastoFormPage />} />
          <Route path="/buscar" element={<BuscarPage />} />
          <Route path="/categorias" element={<CategoriasPage />} />
          <Route path="/viajes/:id/editar" element={<EditarViajePage />} />
          <Route path="/cuenta" element={<CuentaPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
