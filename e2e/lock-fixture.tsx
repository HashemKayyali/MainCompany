import React, { StrictMode, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { useBodyScrollLock } from '../src/hooks/useBodyScrollLock'

function LockOwner({ active }: { active: boolean }) {
  useBodyScrollLock(active)
  return null
}

function App() {
  const [first, setFirst] = useState(false)
  const [second, setSecond] = useState(false)

  return (
    <main style={{ minHeight: '180vh', padding: 24 }}>
      <div style={{ position: 'fixed', zIndex: 1, top: 16, left: 16, display: 'flex', gap: 12 }}>
        <button type="button" data-testid="lock-a" onClick={() => setFirst(value => !value)}>
          Toggle first lock
        </button>
        <button type="button" data-testid="lock-b" onClick={() => setSecond(value => !value)}>
          Toggle second lock
        </button>
      </div>
      <LockOwner active={first} />
      <LockOwner active={second} />
    </main>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
