'use client'

import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from 'react'
import { createPortal } from 'react-dom'

// Toast types
export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface Toast {
  id: string
  type: ToastType
  message: string
  duration?: number
}

// Toast context
interface ToastContextType {
  toasts: Toast[]
  addToast: (type: ToastType, message: string, duration?: number) => void
  removeToast: (id: string) => void
}

const ToastContext = createContext<ToastContextType | null>(null)

// Toast Provider
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback(
    (type: ToastType, message: string, duration = 5000) => {
      const id = Math.random().toString(36).slice(2)
      const toast: Toast = { id, type, message, duration }

      setToasts((prev) => [...prev, toast])

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id)
        }, duration)
      }
    },
    []
  )

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </ToastContext.Provider>
  )
}

// Hook to use toast
export function useToast() {
  const context = useContext(ToastContext)

  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }

  const { addToast } = context

  return {
    success: (message: string, duration?: number) =>
      addToast('success', message, duration),
    error: (message: string, duration?: number) =>
      addToast('error', message, duration),
    warning: (message: string, duration?: number) =>
      addToast('warning', message, duration),
    info: (message: string, duration?: number) =>
      addToast('info', message, duration),
  }
}

// Toast Container
function ToastContainer({
  toasts,
  onDismiss,
}: {
  toasts: Toast[]
  onDismiss: (id: string) => void
}) {
  if (typeof document === 'undefined' || toasts.length === 0) return null

  return createPortal(
    <div className="fixed bottom-6 right-6 z-[var(--z-toast)] flex flex-col gap-3 pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>,
    document.body
  )
}

// Individual Toast Item
function ToastItem({
  toast,
  onDismiss,
}: {
  toast: Toast
  onDismiss: (id: string) => void
}) {
  const icons = {
    success: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    ),
    error: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    ),
    warning: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
    info: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  }

  const colors = {
    success: {
      border: 'border-l-[var(--success)]',
      icon: 'text-[var(--success)]',
    },
    error: {
      border: 'border-l-[var(--error)]',
      icon: 'text-[var(--error)]',
    },
    warning: {
      border: 'border-l-[var(--warning)]',
      icon: 'text-[var(--warning)]',
    },
    info: {
      border: 'border-l-[var(--info)]',
      icon: 'text-[var(--info)]',
    },
  }

  return (
    <div
      className={`pointer-events-auto flex items-center gap-3 px-4 py-3 bg-[var(--bg-card)] border border-[var(--border-default)] border-l-4 ${colors[toast.type].border} rounded-xl shadow-lg animate-slide-up min-w-[300px] max-w-[400px]`}
      role="alert"
    >
      <span className={colors[toast.type].icon}>{icons[toast.type]}</span>
      <p className="flex-1 text-sm text-[var(--sm-text)]">{toast.message}</p>
      <button
        onClick={() => onDismiss(toast.id)}
        className="text-[var(--sm-text-muted)] hover:text-[var(--sm-text)] transition-colors p-1"
        aria-label="Dismiss"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  )
}
