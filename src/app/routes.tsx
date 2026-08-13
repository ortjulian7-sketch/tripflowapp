import { Navigate, Outlet, Route, Routes } from 'react-router-dom'
import { useAuth } from '@/features/auth/AuthProvider'
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

/** Sin sesión no hay acceso (FR-001). */
function RequireAuth() {
  const { session, loading } = useAuth()
  if (loading) return <Cargando />
  if (!session) return <Navigate to="/login" replace />
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

      <Route element={<RequireAuth />}>
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
