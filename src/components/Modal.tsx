import { useEffect, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { IconButton } from './IconButton'

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
}

/**
 * Diálogo genérico para contenido arbitrario (formularios, etc.) — mismo
 * patrón de overlay que `SearchSpotlight` (backdrop, Escape, scroll-lock),
 * generalizado para cualquier caso que no encaje en `ConfirmDialog`.
 */
export function Modal({ open, onClose, title, children }: ModalProps) {
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

  // Portal a `document.body`: si el modal se renderizara donde vive el
  // trigger, un ancestro con `backdrop-filter`/`filter`/`transform` (p. ej. el
  // header sticky del dashboard) crearía un containing block propio y el
  // `fixed inset-0` dejaría de cubrir el viewport completo.
  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 px-4 pb-6 backdrop-blur-sm md:items-center dark:bg-black/60"
      onClick={onClose}
    >
      <div
        className="flex max-h-[85vh] w-full max-w-sm flex-col overflow-hidden rounded-card bg-surface-elevated shadow-md"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-black/[0.06] px-4 py-3 dark:border-white/[0.06]">
          <h2 id="modal-title" className="text-base font-semibold text-text-primary">
            {title}
          </h2>
          <IconButton
            icon="close"
            label="Cerrar"
            variant="secondary"
            className="!h-8 !w-8 !shadow-none"
            onClick={onClose}
          />
        </div>
        <div className="flex-1 overflow-y-auto p-card-padding">{children}</div>
      </div>
    </div>,
    document.body,
  )
}
