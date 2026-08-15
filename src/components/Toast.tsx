import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { Icon } from './Icon'

type ToastType = 'success' | 'error'

interface ToastItem {
  id: number
  message: string
  type: ToastType
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

const DURATION_MS = 3000

const TONE_CLASSES: Record<ToastType, string> = {
  success: 'bg-status-success-strong text-status-success-on-strong',
  error: 'bg-status-error-strong text-status-error-on-strong',
}

/** Cola de toasts + portal a `document.body` (mismo motivo que ConfirmDialog: evitar que un ancestro con `transform`/`filter` rompa el `fixed`). */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const nextId = useRef(0)

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }, [])

  const showToast = useCallback(
    (message: string, type: ToastType = 'success') => {
      const id = nextId.current++
      setToasts((current) => [...current, { id, message, type }])
      setTimeout(() => dismiss(id), DURATION_MS)
    },
    [dismiss],
  )

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {createPortal(
        <div
          aria-live="polite"
          aria-atomic="true"
          className="pointer-events-none fixed inset-x-0 bottom-20 z-50 flex flex-col items-center gap-2 px-4 md:bottom-6"
        >
          {toasts.map((toast) => (
            <div
              key={toast.id}
              role="status"
              className={`pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-card px-4 py-3 text-sm font-medium shadow-md ${TONE_CLASSES[toast.type]}`}
            >
              <span className="flex-1">{toast.message}</span>
              <button
                type="button"
                aria-label="Cerrar aviso"
                onClick={() => dismiss(toast.id)}
                className="shrink-0 opacity-80 hover:opacity-100"
              >
                <Icon name="close" size={14} />
              </button>
            </div>
          ))}
        </div>,
        document.body,
      )}
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) throw new Error('useToast debe usarse dentro de ToastProvider')
  return context
}
