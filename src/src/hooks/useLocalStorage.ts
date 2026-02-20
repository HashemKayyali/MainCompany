import { useState, useEffect } from 'react'
export function useLocalStorage<T>(key: string, init: T): [T, (v: T | ((p: T) => T)) => void] {
  const [val, setVal] = useState<T>(() => { try { const i = localStorage.getItem(key); return i ? JSON.parse(i) : init } catch { return init } })
  useEffect(() => { try { localStorage.setItem(key, JSON.stringify(val)) } catch {} }, [key, val])
  return [val, setVal]
}
