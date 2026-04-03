import { useCallback, useEffect, useRef, useState } from 'react'

function resolveInitialValue<T>(initialValue: T | (() => T)) {
  return typeof initialValue === 'function' ? (initialValue as () => T)() : initialValue
}

function readStoredValue<T>(key: string, initialValue: T | (() => T)) {
  const fallback = resolveInitialValue(initialValue)

  if (typeof window === 'undefined') {
    return fallback
  }

  try {
    const rawValue = window.localStorage.getItem(key)
    if (rawValue === null) return fallback
    return JSON.parse(rawValue) as T
  } catch (error) {
    console.warn(`[useLocalStorage] Failed to read "${key}" from localStorage:`, error)

    try {
      window.localStorage.removeItem(key)
    } catch {
      // noop
    }

    return fallback
  }
}

export function useLocalStorage<T>(
  key: string,
  initialValue: T | (() => T)
): [T, (value: T | ((previousValue: T) => T)) => void] {
  const initialValueRef = useRef(initialValue)
  initialValueRef.current = initialValue
  const [storedValue, setStoredValue] = useState<T>(() => readStoredValue(key, initialValueRef.current))

  useEffect(() => {
    setStoredValue(readStoredValue(key, initialValueRef.current))
  }, [key])

  const setValue = useCallback(
    (value: T | ((previousValue: T) => T)) => {
      setStoredValue(previousValue => {
        const resolvedValue =
          typeof value === 'function' ? (value as (previousValue: T) => T)(previousValue) : value

        if (typeof window !== 'undefined') {
          try {
            window.localStorage.setItem(key, JSON.stringify(resolvedValue))
          } catch (error) {
            console.warn(`[useLocalStorage] Failed to write "${key}" to localStorage:`, error)
          }
        }

        return resolvedValue
      })
    },
    [key]
  )

  useEffect(() => {
    if (typeof window === 'undefined') return undefined

    const onStorage = (event: StorageEvent) => {
      if (event.storageArea !== window.localStorage || event.key !== key) return
      setStoredValue(readStoredValue(key, initialValueRef.current))
    }

    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [key])

  return [storedValue, setValue]
}
