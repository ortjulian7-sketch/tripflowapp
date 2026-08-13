import { Button } from './Button'

interface ConfirmDialogProps {
  open: boolean
  title: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  onConfirm: () => void
  onCancel: () => void
  loading?: boolean
}

/** Confirmación destructiva reutilizable — Button Danger + advertencia en color-status-error. */
export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Eliminar',
  cancelLabel = 'Cancelar',
  onConfirm,
  onCancel,
  loading = false,
}: ConfirmDialogProps) {
  if (!open) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 px-4 pb-6 md:items-center"
    >
      <div className="w-full max-w-sm rounded-card bg-surface-elevated p-card-padding shadow-md">
        <h2 id="confirm-dialog-title" className="mb-1.5 text-lg font-semibold text-text-primary">
          {title}
        </h2>
        <p className="mb-5 text-sm text-status-error">{description}</p>
        <div className="flex gap-3">
          <Button
            type="button"
            variant="secondary"
            size="large"
            onClick={onCancel}
            disabled={loading}
          >
            {cancelLabel}
          </Button>
          <Button type="button" variant="danger" size="large" onClick={onConfirm} loading={loading}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}
