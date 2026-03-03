import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { ThemeProvider } from './contexts/ThemeContext'
import { SessionProvider } from './contexts/SessionContext'
import { AuthProvider } from './contexts/AuthContext'
import { UserProvider } from './contexts/UserContext'
import { DataProvider } from './contexts/DataContext'
import { DialogProvider } from './contexts/DialogContext'
import ErrorBoundary from './components/ErrorBoundary'
import { router } from './router'
import PerfClass from './components/PerfClass'
import './styles/input.css'
import './styles/site.css'

const AppTree = (
  <ErrorBoundary>
    <PerfClass>
      <ThemeProvider>
        <DialogProvider>
        <SessionProvider>
          <AuthProvider>
            <UserProvider>
              <DataProvider>
                <RouterProvider router={router} />
              </DataProvider>
            </UserProvider>
          </AuthProvider>
        </SessionProvider>
        </DialogProvider>
      </ThemeProvider>
    </PerfClass>
  </ErrorBoundary>
)

ReactDOM.createRoot(document.getElementById('root')!).render(
  import.meta.env.DEV ? <React.StrictMode>{AppTree}</React.StrictMode> : AppTree,
)