import { useSyncExternalStore } from 'react'

/**
 * Tiny localStorage-backed store with a React hook. Data lives only in this
 * browser and disappears if site data is cleared. Account-synced storage is a
 * later milestone (see PLAN.md).
 */
export function createLocalStore<T>(key: string, initial: T) {
  let state: T = initial
  let loaded = false
  const listeners = new Set<() => void>()

  const load = () => {
    if (loaded || typeof window === 'undefined') return
    loaded = true
    try {
      const raw = window.localStorage.getItem(key)
      if (raw) state = { ...initial, ...JSON.parse(raw) }
    } catch {
      // Corrupt or blocked storage: keep defaults.
    }
  }

  const persist = () => {
    try {
      window.localStorage.setItem(key, JSON.stringify(state))
      return true
    } catch {
      return false
    }
  }

  const store = {
    get: () => {
      load()
      return state
    },
    set: (update: T | ((prev: T) => T)) => {
      load()
      state =
        typeof update === 'function'
          ? (update as (prev: T) => T)(state)
          : update
      const ok = persist()
      listeners.forEach((l) => l())
      return ok
    },
    subscribe: (listener: () => void) => {
      listeners.add(listener)
      const onStorage = (e: StorageEvent) => {
        if (e.key !== key) return
        loaded = false
        load()
        listener()
      }
      window.addEventListener('storage', onStorage)
      return () => {
        listeners.delete(listener)
        window.removeEventListener('storage', onStorage)
      }
    },
  }

  const useStore = () =>
    useSyncExternalStore(store.subscribe, store.get, () => initial)

  return { ...store, useStore }
}
