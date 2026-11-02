import { useSyncExternalStore } from 'react'
import { CheckCircle2, Info, X, XCircle } from 'lucide-react'
import { dismissToast, toastStore } from '@/lib/toast'

const icons = { success: CheckCircle2, error: XCircle, info: Info }
const tone = {
  success: 'text-success',
  error: 'text-danger',
  info: 'text-cyan',
}

export function Toaster() {
  const toasts = useSyncExternalStore(
    toastStore.subscribe,
    toastStore.get,
    () => [],
  )
  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-4 z-[60] flex flex-col items-center gap-2 px-4 sm:bottom-6 sm:right-6 sm:left-auto sm:items-end"
      aria-live="polite"
      role="status"
    >
      {toasts.map((t) => {
        const Icon = icons[t.kind]
        return (
          <div
            key={t.id}
            className="animate-fade-up pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl border border-line-strong bg-elev/95 px-4 py-3 text-sm shadow-2xl backdrop-blur"
          >
            <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${tone[t.kind]}`} />
            <p className="flex-1">{t.message}</p>
            <button
              onClick={() => dismissToast(t.id)}
              className="-m-1 rounded-lg p-1 text-muted hover:text-ink"
              aria-label="Dismiss notification"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )
      })}
    </div>
  )
}
