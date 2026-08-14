import { Outlet } from 'react-router-dom'
import { Logo } from '@/components/Logo'
import { NavItem } from '@/components/NavItem'
import type { IconName } from '@/components/Icon'
import { SyncIndicator } from '@/features/sync/SyncIndicator'

const NAV_ITEMS: { to: string; icon: IconName; label: string; end?: boolean }[] = [
  { to: '/', icon: 'home', label: 'Resumen', end: true },
  { to: '/gastos/nuevo', icon: 'plus', label: 'Registrar' },
  { to: '/viajes/nuevo', icon: 'map', label: 'Nuevo viaje' },
  { to: '/cuenta', icon: 'user', label: 'Cuenta' },
]

/**
 * Marco de la app con navegación responsiva (FR-004): sidebar horizontal en
 * escritorio, bottom bar vertical en móvil — mismo destino, mismo contenido.
 */
export function AppShell() {
  return (
    <div className="min-h-screen bg-surface-background md:flex">
      <nav className="hidden shrink-0 flex-col gap-1 border-r border-surface-secondary p-4 md:flex md:w-56">
        <div className="mb-4 px-2">
          <Logo size="small" />
        </div>
        {NAV_ITEMS.map((item) => (
          <NavItem key={item.to} layout="horizontal" {...item} />
        ))}
        <div className="mt-auto px-2 pt-4">
          <SyncIndicator />
        </div>
      </nav>

      <div className="flex min-h-screen flex-1 flex-col pb-20 md:pb-0">
        <header className="sticky top-0 z-10 flex h-[60px] items-center justify-between border-b border-black/[0.06] bg-surface-background/[0.92] px-5 backdrop-blur md:hidden dark:border-white/[0.06]">
          <Logo size="small" />
          <SyncIndicator />
        </header>
        <main className="flex-1 px-4 py-6 md:px-8 md:py-8">
          <Outlet />
        </main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-10 flex border-t border-surface-secondary bg-surface-elevated shadow-md md:hidden">
        {NAV_ITEMS.map((item) => (
          <NavItem key={item.to} layout="vertical" {...item} />
        ))}
      </nav>
    </div>
  )
}
