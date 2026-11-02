
export type Toast = {
  id: number
  kind: 'success' | 'error' | 'info'
  message: string
}

let counter = 0
let toasts: Toast[] = []
const listeners = new Set<() => void>()

export function toast(message: string, kind: Toast['kind'] = 'info') {
  const id = ++counter
  toasts = [...toasts.slice(-3), { id, kind, message }]
  listeners.forEach((l) => l())
  setTimeout(() => dismissToast(id), kind === 'error' ? 6000 : 3500)
}

export function dismissToast(id: number) {
  toasts = toasts.filter((t) => t.id !== id)
  listeners.forEach((l) => l())
}

export const toastStore = {
  get: () => toasts,
  subscribe: (l: () => void) => {
    listeners.add(l)
    return () => {
      listeners.delete(l)
    }
  },
}

export async function copyText(text: string, label = 'Copied to clipboard') {
  try {
    await navigator.clipboard.writeText(text)
    toast(label, 'success')
    return true
  } catch {
    toast('Copy failed. Your browser blocked clipboard access.', 'error')
    return false
  }
}

