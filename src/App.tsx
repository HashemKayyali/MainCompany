import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import PageContainer from './components/layout/PageContainer'
import { clearChunkReloadFlag } from './utils/lazyWithRetry'

export default function App() {
  useEffect(() => {
    // First successful render means lazy chunks loaded fine — safe to
    // clear the guard so a future genuine chunk failure can recover.
    clearChunkReloadFlag()
  }, [])
  return (
    <PageContainer>
      <Outlet />
    </PageContainer>
  )
}
