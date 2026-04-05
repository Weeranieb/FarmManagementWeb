/* eslint-disable react-refresh/only-export-components -- provider + useAppToast hook (same pattern as ClientContext) */
import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from 'react'

type ToastKind = 'error' | 'success'

type ToastItem = { id: string; kind: ToastKind; message: string }

const AppToastContext = createContext<{
  showToast: (kind: ToastKind, message: string) => void
} | null>(null)

export function AppToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const showToast = useCallback((kind: ToastKind, message: string) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
    setToasts((prev) => [...prev, { id, kind, message }])
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 6000)
  }, [])

  return (
    <AppToastContext.Provider value={{ showToast }}>
      {children}
      <div
        className='pointer-events-none fixed bottom-4 right-4 z-[100] flex max-w-sm flex-col gap-2'
        aria-live='polite'
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            role='alert'
            className={`pointer-events-auto rounded-lg border px-4 py-3 text-sm shadow-lg ${
              t.kind === 'error'
                ? 'border-red-200 bg-red-50 text-red-900'
                : 'border-green-200 bg-green-50 text-green-900'
            }`}
          >
            {t.message}
          </div>
        ))}
      </div>
    </AppToastContext.Provider>
  )
}

export function useAppToast() {
  const ctx = useContext(AppToastContext)
  if (!ctx) {
    throw new Error('useAppToast must be used within AppToastProvider')
  }
  return ctx
}
